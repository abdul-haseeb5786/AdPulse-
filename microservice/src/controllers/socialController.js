const { generateCompletion } = require('../services/openrouterService');

/**
 * Generate 5 Social Media Captions - Non-streaming JSON
 */
const generateSocial = async (req, res) => {
  const { platform, campaign_goal, brand_voice } = req.body;

  const systemPrompt = `You are a social media expert who writes viral, 
platform-native content. Respond with valid JSON only.`;

  const userPrompt = `Generate 5 social media captions for:
Platform: ${platform}
Campaign Goal: ${campaign_goal}
Brand Voice: ${brand_voice}

Platform rules:
- Instagram: use emojis naturally, 125-150 words, storytelling
- Twitter/X: max 280 chars each, punchy, no hashtags in body
- LinkedIn: professional, insight-led, 100-130 words
- TikTok: casual, trend-aware, hook in first 3 words
- Facebook: conversational, community-focused

Return ONLY this JSON:
{
  "platform": "${platform}",
  "captions": [
    { "id": 1, "text": "string", "characterCount": "number" },
    { "id": 2, "text": "string", "characterCount": "number" },
    { "id": 3, "text": "string", "characterCount": "number" },
    { "id": 4, "text": "string", "characterCount": "number" },
    { "id": 5, "text": "string", "characterCount": "number" }
  ]
}`;

  try {
    const rawResult = await generateCompletion(systemPrompt, userPrompt);
    const cleanedResult = rawResult.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    const parsedResult = JSON.parse(cleanedResult);

    res.status(200).json({
      requestId: req.id,
      data: parsedResult
    });
  } catch (err) {
    console.error(`[${req.id}] generateSocial error:`, err);
    res.status(500).json({ 
      error: 'Failed to generate social captions', 
      requestId: req.id 
    });
  }
};

module.exports = { generateSocial };
