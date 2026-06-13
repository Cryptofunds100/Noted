/* GET /api/send-reminders
 *
 * Invoked by a Vercel Cron job every 15 minutes (see vercel.json). For every
 * stored subscription it works out the user's *local* time (from their saved
 * IANA timezone) and sends a push to anyone whose reminder time falls in this
 * 15-minute window. Subscriptions that return 404/410 (expired) are deleted.
 *
 * Smart skip: if enabled and the user has already logged today (lastLogDate ===
 * today in their timezone), the reminder is suppressed.
 *
 * Idempotency: each (day | time) slot is recorded once sent, so a slightly
 * early/late cron run can't double-fire the same reminder.
 */
const { webpush, vapidReady, allSubs, putSub, delSubId } = require('./_store');

const WINDOW_MIN = 15;

module.exports = async (req, res) => {
  // Optional protection: if CRON_SECRET is set, require it (Vercel Cron sends it
  // automatically as a Bearer token).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  if (!vapidReady) {
    return res.status(503).json({ error: 'Push is not configured (missing VAPID keys).' });
  }

  const subs = await allSubs();
  let sent = 0, skipped = 0, expired = 0;

  for (const rec of subs) {
    try {
      const p = rec.prefs || {};
      if (!p.enabled || !Array.isArray(p.times) || p.times.length === 0) { skipped++; continue; }

      const tz = p.timezone || 'Europe/London';
      const { dateKey, minutes } = localNow(tz);

      // Smart skip — already logged today.
      if (p.smartSkip && p.lastLogDate && p.lastLogDate === dateKey) { skipped++; continue; }

      // Keep only today's sent markers (drops yesterday's automatically).
      let slots = Array.isArray(rec.sentSlots) ? rec.sentSlots.filter((s) => s.startsWith(dateKey + '|')) : [];

      const due = p.times.filter((t) => {
        const tm = toMinutes(t);
        if (tm == null) return false;
        const diff = (minutes - tm + 1440) % 1440; // minutes since the reminder time
        return diff < WINDOW_MIN && !slots.includes(dateKey + '|' + t);
      });
      if (due.length === 0) { skipped++; continue; }

      const payload = JSON.stringify({
        title: 'Noted',
        body: 'Time for a quick check-in. Logging takes under 30 seconds.',
        url: '/?action=log&source=push',
        tag: 'noted-reminder',
      });

      await webpush.sendNotification(rec.subscription, payload);
      sent++;
      due.forEach((t) => slots.push(dateKey + '|' + t));
      rec.sentSlots = slots;
      await putSub(rec);
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        await delSubId(rec.id);
        expired++;
      } else {
        console.error('[noted] push failed:', e.statusCode, e.body || e.message);
      }
    }
  }

  res.status(200).json({
    ok: true,
    considered: subs.length,
    sent,
    skipped,
    expired,
    at: new Date().toISOString(),
  });
};

// Current local date (YYYY-MM-DD) and minutes-since-midnight in a given IANA tz.
function localNow(tz) {
  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(now).map((x) => [x.type, x.value])
  );
  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  let hour = parseInt(parts.hour, 10);
  if (hour === 24) hour = 0; // some engines emit 24 at midnight
  const minutes = hour * 60 + parseInt(parts.minute, 10);
  return { dateKey, minutes };
}

function toMinutes(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
