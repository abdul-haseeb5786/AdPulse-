const { generateStream } = require('../services/openrouterService');

/**
 * Generate Advertising Copy - Supporting SSE Streaming
 */
const generateAdCopy = async (req, res) => {
  const { product, tone, platform, word_limit = 150 } = req.body;

  const systemPrompt = `You are a world-class advertising copywriter. 
Always respond with valid JSON only. No markdown, no explanation.`;

  const userPrompt = `Write advertising copy for the following:
Product: ${product}
Tone: ${tone}
Platform: ${platform}
Word limit: ${word_limit} words total across headline + body + CTA

Return ONLY this JSON structure:
{
  "headline": "string (attention-grabbing, max 10 words)",
  "body": "string (persuasive, within word limit)",
  "cta": "string (action-focused, max 5 words)"
}`;

  try {
    // anthropicService.generateStream handles headers and res.end()
    await generateStream(systemPrompt, userPrompt, res);
  } catch (err) {
    console.error(`[${req.id}] generateAdCopy error:`, err);
    // Since stream might have already started, error handling is tricky, 
    // but generateStream already has a catch for stream errors.
  }
};

module.exports = { generateAdCopy };
