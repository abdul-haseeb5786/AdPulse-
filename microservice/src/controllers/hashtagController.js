const { generateCompletion } = require('../services/openrouterService');

/**
 * Generate 10 High-performing Hashtags - Non-streaming JSON
 */
const generateHashtags = async (req, res) => {
  const { content, industry } = req.body;

  const systemPrompt = `You are a social media strategist expert in hashtag research.
Respond with valid JSON only. No markdown.`;

  const userPrompt = `Generate 10 high-performing hashtags for:
Content: ${content}
Industry: ${industry}

Mix of:
- 3 broad/high-volume hashtags (1M+ posts)
- 4 medium hashtags (100K-1M posts)
- 3 niche/targeted hashtags (under 100K posts)

Return ONLY this JSON:
{
  "hashtags": [
    { "tag": "string (include # symbol)", "volume": "high"|"medium"|"niche", "relevanceScore": "number 1-10" },
    ... 10 total
  ],
  "recommendedCombination": "string (space-separated best 5 to use together)"
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
    console.error(`[${req.id}] generateHashtags error:`, err);
    res.status(500).json({ 
      error: 'Failed to generate hashtags', 
      requestId: req.id 
    });
  }
};

module.exports = { generateHashtags };
