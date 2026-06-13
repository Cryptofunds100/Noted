/* Noted — shared storage + web-push config for the reminder endpoints.
 *
 * Storage: prefers a Vercel KV / Upstash Redis instance (via its REST API, no
 * extra npm dependency). If no KV env vars are present it falls back to an
 * in-memory Map so the endpoints still respond on a single warm instance —
 * fine for a test push, but NOT durable across deploys/regions. Provision the
 * Vercel KV (Upstash) integration for real persistence (see README).
 */

const webpush = require('web-push');

const SUBS_KEY = 'noted:subs';

// ---- web-push / VAPID -----------------------------------------------------
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:reminders@noted.app';

let vapidReady = false;
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
    vapidReady = true;
  } catch (e) {
    console.error('[noted] VAPID config error:', e && e.message);
  }
}

// ---- Redis (Upstash REST) with in-memory fallback -------------------------
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const useRedis = !!(REST_URL && REST_TOKEN);

// Survives warm invocations on a single instance.
const mem = (globalThis.__notedSubs = globalThis.__notedSubs || new Map());

async function redis(command) {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error('redis ' + res.status);
  const data = await res.json();
  return data.result;
}

// Stable, short, URL-safe id derived from the subscription endpoint.
function subId(endpoint) {
  let h = 5381;
  for (let i = 0; i < endpoint.length; i++) {
    h = ((h << 5) + h + endpoint.charCodeAt(i)) >>> 0;
  }
  return 's' + h.toString(36);
}

async function putSub(record) {
  const id = subId(record.subscription.endpoint);
  record.id = id;
  if (useRedis) await redis(['HSET', SUBS_KEY, id, JSON.stringify(record)]);
  else mem.set(id, record);
  return id;
}

async function getSub(endpoint) {
  const id = subId(endpoint);
  if (useRedis) {
    const v = await redis(['HGET', SUBS_KEY, id]);
    return v ? JSON.parse(v) : null;
  }
  return mem.get(id) || null;
}

async function delSub(endpoint) {
  return delSubId(subId(endpoint));
}

async function delSubId(id) {
  if (useRedis) await redis(['HDEL', SUBS_KEY, id]);
  else mem.delete(id);
}

async function allSubs() {
  if (useRedis) {
    const flat = (await redis(['HVALS', SUBS_KEY])) || [];
    return flat
      .map((v) => { try { return JSON.parse(v); } catch (e) { return null; } })
      .filter(Boolean);
  }
  return [...mem.values()];
}

// ---- request helpers ------------------------------------------------------
function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}

// Clamp/normalise the preferences the client sends so the cron can trust them.
function normalizePrefs(p) {
  p = p || {};
  const count = Math.min(4, Math.max(1, parseInt(p.count, 10) || 1));
  let times = Array.isArray(p.times) ? p.times.filter((t) => /^\d{1,2}:\d{2}$/.test(t)) : [];
  times = times.slice(0, count);
  return {
    enabled: p.enabled !== false,
    count,
    times,
    smartSkip: p.smartSkip !== false,
    timezone: typeof p.timezone === 'string' && p.timezone ? p.timezone : 'Europe/London',
    lastLogDate: typeof p.lastLogDate === 'string' ? p.lastLogDate : null,
  };
}

module.exports = {
  webpush,
  vapidReady,
  VAPID_PUBLIC,
  useRedis,
  putSub,
  getSub,
  delSub,
  delSubId,
  allSubs,
  subId,
  readBody,
  normalizePrefs,
};
