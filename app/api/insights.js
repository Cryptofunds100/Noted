/* POST /api/insights
 * Body: { logs: [...], proms?: {...} }
 * Returns: { patterns: [{ text, basis }], summary }
 *
 * Detects patterns across the patient's real symptom logs. Patterns are
 * OBSERVATIONS, never diagnoses — the schema and prompt enforce a `basis`
 * (what in the data supports each one) so nothing is presented unsupported.
 */
const { readBody, preflight, extractJSON, sendError } = require('./_anthropic');

const SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'One or two plain-English sentences summarising the overall picture across these logs. No diagnosis.',
    },
    patterns: {
      type: 'array',
      description: 'Up to 5 observed patterns, strongest first. Empty if the data is too sparse to support any.',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The observation, phrased as a pattern (e.g. "Back pain was logged more often after nights with under 6 hours sleep").' },
          basis: { type: 'string', description: 'What in the logs supports this — counts, dates, or co-occurrences. Be specific and honest about sample size.' },
        },
        required: ['text', 'basis'],
      },
    },
  },
  required: ['summary', 'patterns'],
};

module.exports = async (req, res) => {
  if (!preflight(req, res)) return;
  try {
    const body = readBody(req);
    const logs = Array.isArray(body.logs) ? body.logs : [];
    if (logs.length === 0) {
      return res.status(200).json({ summary: '', patterns: [] });
    }
    const result = await extractJSON({
      system:
        'You find patterns in a patient\'s self-logged symptoms. Only assert a pattern when the logs genuinely support it; ' +
        'if the data is thin, say so in the basis and return fewer patterns. Never imply cause, diagnosis, or treatment.',
      content:
        'Here are the symptom logs (newest first) as JSON. Each has name, severity (0–10), dateKey, time, onset, ' +
        'duration, character, note and optional context (triggers, relieving factors, activity, mood).\n\n' +
        JSON.stringify(logs).slice(0, 60000) +
        (body.proms ? '\n\nValidated questionnaire scores over time:\n' + JSON.stringify(body.proms).slice(0, 8000) : ''),
      schema: SCHEMA,
      toolName: 'report_patterns',
      toolDescription: 'Report observed patterns and a short summary from the symptom logs.',
      maxTokens: 1800,
    });
    res.status(200).json(result);
  } catch (e) {
    sendError(res, e);
  }
};
