/* POST /api/doc-extract
 * Body: { data: "<base64>", mediaType: "image/png" | "image/jpeg" | "application/pdf" }
 * Returns: { source, dateOnDoc, conditions[], medications[], allergies[] }
 *   each item: { name, detail?, confidence: "high"|"medium"|"low" }
 *
 * Reads a photo/PDF of a letter, prescription or discharge summary and extracts
 * profile fields. Every item carries a confidence so the review screen can flag
 * uncertain reads — nothing is saved without the patient confirming.
 */
const { readBody, preflight, extractJSON, sendError } = require('./_anthropic');

const ITEM = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    detail: { type: 'string', description: 'Dose/schedule for meds, reaction for allergies, or short context. Empty if none.' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'], description: 'How clearly this was readable in the document.' },
  },
  required: ['name', 'confidence'],
};

const SCHEMA = {
  type: 'object',
  properties: {
    source: { type: 'string', description: 'Short description of the document type, e.g. "GP letter", "Repeat prescription", "Discharge summary".' },
    dateOnDoc: { type: 'string', description: 'Date printed on the document if present (DD Mon YYYY), else empty string.' },
    conditions: { type: 'array', items: ITEM },
    medications: { type: 'array', items: ITEM },
    allergies: { type: 'array', items: ITEM },
  },
  required: ['source', 'conditions', 'medications', 'allergies'],
};

const ALLOWED = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];

module.exports = async (req, res) => {
  if (!preflight(req, res)) return;
  try {
    const body = readBody(req);
    const data = (body.data || '').toString();
    const mediaType = (body.mediaType || '').toString();
    if (!data) return res.status(400).json({ error: 'No document data provided' });
    if (!ALLOWED.includes(mediaType)) return res.status(400).json({ error: 'Unsupported media type' });

    // Image → image block; PDF → document block.
    const docBlock = mediaType === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType, data } };

    const result = await extractJSON({
      system:
        'Read the attached medical document and extract the patient\'s conditions, current medications (with dose/schedule), ' +
        'and allergies (with reaction). Only extract what is actually written. Mark anything hard to read as low or medium ' +
        'confidence rather than guessing. Do not add anything that is not in the document.',
      content: [
        docBlock,
        { type: 'text', text: 'Extract the conditions, medications and allergies from this document for the patient to confirm.' },
      ],
      schema: SCHEMA,
      toolName: 'extract_document',
      toolDescription: 'Extract structured profile fields from the medical document.',
      maxTokens: 2000,
    });
    res.status(200).json(result);
  } catch (e) {
    sendError(res, e);
  }
};
