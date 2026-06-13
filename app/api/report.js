/* POST /api/report
 * Body: { profile?: {...}, logs: [...], proms?: {...}, adherencePct?: number }
 * Returns: { symptomSummary, patterns: [{text, basis}], adherenceNote }
 *
 * Builds the prose parts of the one-page clinical report from the patient's real
 * logs — the frequency/pattern summary, the "suggested patterns" (observations,
 * not diagnoses), and a one-line medication-adherence note. The client renders
 * these into the existing report layout (demographics, PROMs table, SNOMED
 * footer and the self-reported disclaimer are filled from structured data).
 */
const { readBody, preflight, extractJSON, sendError } = require('./_anthropic');

const SCHEMA = {
  type: 'object',
  properties: {
    symptomSummary: {
      type: 'string',
      description: 'A clinician-facing summary of symptom frequency, the most-logged symptoms with counts, and the severity trend over the period. 2–4 sentences, factual, drawn only from the logs.',
    },
    patterns: {
      type: 'array',
      description: 'Up to 4 observed patterns, each clearly an observation (not a diagnosis), strongest first. Empty if unsupported.',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          basis: { type: 'string', description: 'The supporting evidence in the logs.' },
        },
        required: ['text', 'basis'],
      },
    },
    adherenceNote: {
      type: 'string',
      description: 'One short sentence on medication adherence if it can be inferred from the data or the supplied percentage, else empty string.',
    },
  },
  required: ['symptomSummary', 'patterns', 'adherenceNote'],
};

module.exports = async (req, res) => {
  if (!preflight(req, res)) return;
  try {
    const body = readBody(req);
    const logs = Array.isArray(body.logs) ? body.logs : [];
    if (logs.length === 0) {
      return res.status(200).json({ symptomSummary: '', patterns: [], adherenceNote: '' });
    }
    const parts = [
      'Patient symptom logs (newest first):\n' + JSON.stringify(logs).slice(0, 60000),
    ];
    if (body.profile) parts.push('Patient profile (conditions, medications, allergies):\n' + JSON.stringify(body.profile).slice(0, 8000));
    if (body.proms) parts.push('Validated questionnaire scores:\n' + JSON.stringify(body.proms).slice(0, 8000));
    if (typeof body.adherencePct === 'number') parts.push('Measured medication adherence this week: ' + body.adherencePct + '%.');

    const result = await extractJSON({
      system:
        'You write the prose sections of a one-page clinical report a clinician reads in under a minute. Be concise, factual, ' +
        'and structured like a clinical letter. Use only what is in the data. Patterns are observations, never diagnoses. ' +
        'Do not recommend treatment.',
      content: parts.join('\n\n'),
      schema: SCHEMA,
      toolName: 'write_report',
      toolDescription: 'Write the symptom summary, observed patterns and adherence note for the clinical report.',
      maxTokens: 2200,
    });
    res.status(200).json(result);
  } catch (e) {
    sendError(res, e);
  }
};
