const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const auth = require('../middleware/auth');

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
  "reading": "Cervical reads A2 with warmer chroma; incisal third trends toward A1."
}

Rules:
- Provide 3–5 candidates including the best match.
- "match" is relative likelihood 0–100.
- "hex" is the closest sRGB approximation under neutral lighting.
- "reading" is 1–2 sentences of clinical guidance.
- If the image is unclear, still return a best-effort estimate with lower confidence.`;

const DEMO = {
  best_match: 'A2', confidence: 71, best_hex: '#eddcb6',
  candidates: [
    { code: 'A1', match: 22, hex: '#f3e7ce' },
    { code: 'A2', match: 71, hex: '#eddcb6' },
    { code: 'A3', match: 18, hex: '#e2caa0' },
    { code: 'B1', match: 14, hex: '#f0e7ce' },
  ],
  reading: 'Cervical reads A2 with warmer chroma; incisal third trends toward A1. Recommend layering accordingly.',
  _demo: true,
};

// POST /api/shade
router.post('/', auth, async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) return res.json(DEMO);

  const { imageUrl, imageBase64, mediaType = 'image/jpeg' } = req.body;
  if (!imageUrl && !imageBase64) return res.json(DEMO);

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const imageSource = imageBase64
      ? { type: 'base64', media_type: mediaType, data: imageBase64 }
      : { type: 'url', url: imageUrl };

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: [
        { type: 'image', source: imageSource },
        { type: 'text', text: 'Analyse this dental shade-tab image and return VITA Classical shade codes as JSON.' },
      ]}],
    });

    const raw = message.content[0]?.text ?? '';
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return res.json(JSON.parse(clean));
  } catch (err) {
    console.error('[shade]', err.message);
    return res.json(DEMO);
  }
});

module.exports = router;
