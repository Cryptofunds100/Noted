/* Noted — client helper for the AI features.
 *
 * Thin wrapper over the server endpoints in /api/*. The Anthropic API key lives
 * only on the server; the client just POSTs the data it already has and gets
 * structured results back. Every method rejects on any failure (no backend,
 * key not configured, network, model error) so each screen can fall back to its
 * built-in demo behaviour and the prototype keeps working offline.
 */
(function () {
  async function post(path, body, timeoutMs) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs || 45000);
    let res;
    try {
      res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(t);
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON (e.g. 404 page) */ }
    if (!res.ok) {
      throw new Error((data && data.error) || ('Request failed (' + res.status + ')'));
    }
    return data;
  }

  // Strip a data: URL prefix to bare base64 for the document endpoint.
  function toBase64(dataUrl) {
    const i = (dataUrl || '').indexOf('base64,');
    return i >= 0 ? dataUrl.slice(i + 7) : dataUrl;
  }

  window.NotedAI = {
    // Pattern detection across the patient's real logs.
    // → { summary, patterns: [{ text, basis }] }
    detectPatterns(logs, proms) {
      return post('/api/insights', { logs, proms });
    },

    // Clinical-report prose from real log data.
    // → { symptomSummary, patterns: [{ text, basis }], adherenceNote }
    generateReport({ profile, logs, proms, adherencePct }) {
      return post('/api/report', { profile, logs, proms, adherencePct });
    },

    // Voice transcript → structured symptom entry for review.
    // → { name, code, severity, character, onset, duration, bodyRegion, triggers, note }
    parseVoice(transcript, context) {
      return post('/api/voice-parse', { transcript, context }, 30000);
    },

    // Document photo/PDF → extracted profile fields.
    // `file` is a { data, mediaType } pair; data may be a data: URL or bare base64.
    // → { source, dateOnDoc, conditions[], medications[], allergies[] }
    extractDocument({ data, mediaType }) {
      return post('/api/doc-extract', { data: toBase64(data), mediaType }, 60000);
    },

    _toBase64: toBase64,
  };
})();
