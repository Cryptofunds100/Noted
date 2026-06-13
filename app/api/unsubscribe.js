/* POST /api/unsubscribe
 * Body: { endpoint } or { subscription: { endpoint } }
 * Removes the stored subscription so it stops receiving reminders.
 */
const { delSub, readBody } = require('./_store');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST only' });
  }
  try {
    const body = readBody(req);
    const endpoint = body.endpoint || (body.subscription && body.subscription.endpoint);
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    await delSub(endpoint);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
