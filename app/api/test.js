/* POST /api/test
 * Body: { subscription, endpoint }
 * Sends ONE real push to this subscription immediately — used by the
 * "Send a test notification" button to verify the whole pipeline end-to-end.
 */
const { webpush, vapidReady, getSub, readBody } = require('./_store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST only' });
  }
  if (!vapidReady) {
    return res.status(503).json({ error: 'Push is not configured on the server (missing VAPID keys).' });
  }
  try {
    const body = readBody(req);
    let subscription = body.subscription;
    const endpoint = body.endpoint || (subscription && subscription.endpoint);

    // Prefer the stored copy (guaranteed to carry the encryption keys).
    if (endpoint) {
      const stored = await getSub(endpoint);
      if (stored) subscription = stored.subscription;
    }
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'No subscription to send to' });
    }

    const payload = JSON.stringify({
      title: 'Noted',
      body: 'Time for a quick check-in. Logging takes under 30 seconds.',
      url: '/?action=log&source=push',
      tag: 'noted-test',
    });

    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: (e.body && String(e.body)) || e.message });
  }
};
