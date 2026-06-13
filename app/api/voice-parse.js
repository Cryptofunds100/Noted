/* POST /api/voice-parse
 * Body: { transcript: "..." , context?: "symptom" | "journal" }
 * Returns: a structured symptom entry for the user to REVIEW before saving:
 *   { name, code, severity, character, onset, duration, bodyRegion, triggers, note }
 *
 * Per the product spec, the parsed output is always shown for correction — this
 * endpoint only structures the words, it never saves anything.
 */
const { readBody, preflight, extractJSON, sendError } = require('./_anthropic');

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'The symptom name, aligned to common clinical terms (e.g. "Lower back pain"). Empty string if no clear symptom was described.' },
    code: { type: 'string', description: 'Best-guess SNOMED CT label if confidently known (e.g. "SNOMED 279039007"), else empty string. Never invent a code.' },
    severity: { type: ['integer', 'null'], description: 'Severity 0–10 if the person stated or clearly implied one, else null. Do not guess a number.' },
    character: { type: 'array', items: { type: 'string' }, description: 'Descriptors mentioned, e.g. ["Sharp","Shooting"]. Empty if none.' },
    onset: { type: 'string', description: 'When/how it started, in the person\'s words, e.g. "When I bent down this morning". Empty if not said.' },
    duration: { type: 'string', description: 'How long it has lasted, e.g. "Ongoing", "2 hours". Empty if not said.' },
    bodyRegion: { type: 'string', description: 'Plain location if stated, e.g. "Lower back, radiating to left leg". Empty if not said.' },
    triggers: { type: 'array', items: { type: 'string' }, description: 'Triggers or aggravating factors mentioned. Empty if none.' },
    note: { type: 'string', description: 'The original transcript, lightly cleaned of filler words but otherwise faithful.' },
  },
  required: ['name', 'code', 'severity', 'character', 'onset', 'duration', 'bodyRegion', 'triggers', 'note'],
};

module.exports = async (req, res) => {
  if (!preflight(req, res)) return;
  try {
    const body = readBody(req);
    const transcript = (body.transcript || '').toString().slice(0, 6000);
    if (!transcript.trim()) {
      return res.status(400).json({ error: 'No transcript provided' });
    }
    const result = await extractJSON({
      system:
        'Turn a spoken symptom description into structured fields for review. Only fill a field if the person said or ' +
        'clearly implied it — otherwise leave it empty (or null for severity). Never infer a severity number or a SNOMED ' +
        'code you are not confident about. Keep the note faithful to what was said.',
      content: 'Spoken description to structure:\n\n"' + transcript + '"',
      schema: SCHEMA,
      toolName: 'structure_symptom',
      toolDescription: 'Structure the spoken symptom description into reviewable fields.',
      maxTokens: 1200,
    });
    res.status(200).json(result);
  } catch (e) {
    sendError(res, e);
  }
};
