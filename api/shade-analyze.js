// api/shade-analyze.js — Vercel serverless function
// Accepts an image (URL or base64) and returns VITA Classical shade analysis
// via Claude's vision API. Falls back to plausible demo data when no API key
// is set or when called from the prototype with a placeholder image.

const Anthropic = require('@anthropic-ai/sdk');

// Cached once per cold-start; the static system prompt qualifies for
// Anthropic prompt caching, saving ~90 % of input token cost on repeat calls.
const SYSTEM_PROMPT = `You are an expert dental technician specialising in shade \
analysis for ceramic restorations. You analyse dental shade-tab photographs and \
identify VITA Classical shade codes with clinical precision.

VITA Classical shade families:
  A (reddish-brown): A1 A2 A3 A3.5 A4
  B (reddish-yellow): B1 B2 B3 B4
  C (grey):           C1 C2 C3 C4
  D (reddish-grey):   D2 D3 D4

Return ONLY a valid JSON object — no markdown, no prose — with this exact shape:
{
  "best_match": "A2",
  "confidence": 71,
  "best_hex": "#eddcb6",
  "candidates": [
    { "code": "A1", "match": 22, "hex": "#f3e7ce" },
    { "code": "A2", "match": 71, "hex": "#eddcb6" },
    { "code": "A3", "match": 18, "hex": "#e2caa0" },
    { "code": "B1", "match": 14, "hex": "#f0e7ce" }
  ],
  "reading": "Cervical reads A2 with warmer chroma; incisal third trends toward A1. Recommend layering accordingly."
}

Rules:
- Provide 3–5 candidates including the best match.
- "match" is relative likelihood 0–100; values need not sum to 100.
- "hex" is the closest sRGB approximation of that VITA shade under neutral lighting.
- "reading" is 1–2 sentences of clinical guidance for the technician.
- If the image is unclear, still return a best-effort estimate with lower confidence.`;

const DEMO_RESULT = {
  best_match: 'A2',
  confidence: 71,
  best_hex: '#eddcb6',
  candidates: [
    { code: 'A1', match: 22, hex: '#f3e7ce' },
    { code: 'A2', match: 71, hex: '#eddcb6' },
    { code: 'A3', match: 18, hex: '#e2caa0' },
    { code: 'B1', match: 14, hex: '#f0e7ce' },
  ],
  reading: 'Cervical reads A2 with warmer chroma; incisal third trends toward A1. Recommend layering accordingly.',
};

module.exports = async (req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageUrl, imageBase64, mediaType = 'image/jpeg' } = req.body || {};

  // No API key — return demo data (prototype / local dev without credentials)
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json({ ...DEMO_RESULT, _demo: true });
  }

  // No real image supplied (placeholder in prototype) — demo data too
  if (!imageUrl && !imageBase64) {
    return res.status(200).json({ ...DEMO_RESULT, _demo: true });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const imageSource = imageBase64
      ? { type: 'base64', media_type: mediaType, data: imageBase64 }
      : { type: 'url', url: imageUrl };

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }, // ~90 % token saving on repeated calls
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: imageSource },
            {
              type: 'text',
              text: 'Analyse this dental shade-tab image and return the VITA Classical shade codes as JSON.',
            },
          ],
        },
      ],
    });

    const raw = message.content[0]?.text ?? '';
    // Strip any accidental markdown code-fence wrapping
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[shade-analyze]', err.message);
    // Degrade gracefully — client always gets a valid response
    return res.status(200).json({ ...DEMO_RESULT, _demo: true });
  }
};
