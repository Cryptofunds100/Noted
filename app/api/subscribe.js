/* POST /api/subscribe
 * Body: { subscription: PushSubscription, prefs: { enabled, count, times, smartSkip, timezone, lastLogDate } }
 * Stores (or updates) the subscription together with its reminder preferences.
 */
const { getSub, putSub, readBody, normalizePrefs } = require('./_store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST only' });
  }
  try {
    const { subscription, prefs } = readBody(req);
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Missing push subscription' });
    }

    // Preserve the per-day "already sent" markers across pref edits so changing
    // a time doesn't accidentally re-fire a reminder already delivered today.
    const existing = await getSub(subscription.endpoint);
    const record = {
      subscription,
      prefs: normalizePrefs(prefs),
      sentSlots: existing && Array.isArray(existing.sentSlots) ? existing.sentSlots : [],
      updatedAt: Date.now(),
    };
    await putSub(record);
    res.status(200).json({ ok: true, id: record.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
