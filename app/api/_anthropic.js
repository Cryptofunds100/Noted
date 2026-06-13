/* Noted — shared Claude (Anthropic) setup for the AI endpoints.
 *
 * The API key lives ONLY here, server-side, read from the ANTHROPIC_API_KEY
 * environment variable — it must never reach the client. Set it in Vercel:
 *   Project → Settings → Environment Variables → ANTHROPIC_API_KEY
 *
 * All four AI endpoints (insights, report, voice-parse, doc-extract) call Claude
 * through this module so model choice, safety framing and JSON handling stay in
 * one place.
 */

const Anthropic = require('@anthropic-ai/sdk');

// Default to the most capable model. Override with ANTHROPIC_MODEL if needed.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ready = !!API_KEY;
const client = ready ? new Anthropic({ apiKey: API_KEY }) : null;

// Shared clinical-safety framing prepended to every system prompt. Noted is a
// medical tool, not a wellness app: observations never diagnoses, plain UK
// English, never invent data.
const SAFETY_PREAMBLE =
  'You are the analysis engine inside Noted, a UK patient-facing symptom-journal app. ' +
  'Treat this as a clinical product: calm, precise, trustworthy. Rules you must never break: ' +
  '(1) Never diagnose or imply a diagnosis — surface patterns and observations only, and label them as such. ' +
  '(2) Never invent symptoms, values, statistics, medications, or facts that are not present in the input. ' +
  '(3) Use plain English at an NHS reading age of 9–11; no jargon unless it is a correct clinical term already in the data. ' +
  '(4) This is self-reported data, not clinically verified. ' +
  'Respond only by calling the provided tool with well-formed arguments.';

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}

// Guard shared by every endpoint: POST-only + key present.
function preflight(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'POST only' });
    return false;
  }
  if (!ready) {
    res.status(503).json({ error: 'AI is not configured on the server (missing ANTHROPIC_API_KEY).' });
    return false;
  }
  return true;
}

/* Run Claude and get structured JSON back via a single forced tool call.
 * Forcing tool_choice guarantees the model returns arguments matching `schema`
 * instead of free-form prose — the robust way to get machine-readable output.
 * Returns the parsed `input` object of the tool call.
 */
async function extractJSON({ system, content, schema, toolName, toolDescription, maxTokens = 1500 }) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: SAFETY_PREAMBLE + (system ? '\n\n' + system : ''),
    tools: [{
      name: toolName,
      description: toolDescription,
      input_schema: schema,
    }],
    tool_choice: { type: 'tool', name: toolName },
    messages: [{ role: 'user', content }],
  });
  const toolUse = message.content.find((b) => b.type === 'tool_use');
  if (!toolUse) throw new Error('Model did not return structured output');
  return toolUse.input;
}

/* Run Claude for a free-text answer with adaptive thinking (for the report
 * narrative, which benefits from reasoning). Returns the concatenated text.
 */
async function generateText({ system, content, maxTokens = 3000 }) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: 'adaptive' },
    system: SAFETY_PREAMBLE + (system ? '\n\n' + system : ''),
    messages: [{ role: 'user', content }],
  });
  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

// Map an Anthropic SDK error to an HTTP status + safe message.
function sendError(res, e) {
  const status = (e && e.status) || 500;
  const msg = (e && e.error && e.error.error && e.error.error.message) || (e && e.message) || 'AI request failed';
  res.status(status >= 400 && status < 600 ? status : 500).json({ error: msg });
}

module.exports = { client, ready, MODEL, SAFETY_PREAMBLE, readBody, preflight, extractJSON, generateText, sendError };
