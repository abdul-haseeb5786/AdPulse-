const { generateStream } = require('../services/openrouterService');

/**
 * Generate Campaign Brief - Supporting SSE Streaming
 */
const generateBrief = async (req, res) => {
  const briefData = req.body;

  const systemPrompt = `You are a senior creative advertising strategist.
- Generate a structured creative direction document in strictly valid JSON format.
- Provide no introductory or conversational text, ONLY output valid JSON.`;

  const userPrompt = `Generate a campaign strategy based on the following brief data:
- Client: ${briefData.clientName}
- Industry: ${briefData.industry}
- Website: ${briefData.website}
- Competitors: ${briefData.competitors}
- Objective: ${briefData.objective}
- Target Audience: ${briefData.targetAudience}
- Budget: ${briefData.budget}
- Tone: ${briefData.tone}
- Imagery Style: ${briefData.imageryStyle}
- Color Direction: ${briefData.colorDirection}
- Do's: ${briefData.dos}
- Don'ts: ${briefData.donts}

Return ONLY this JSON structure:
{
  "campaignTitle": "string",
  "headlines": ["string", "string", "string"],
  "toneGuide": "string (1 paragraph)",
  "channels": [
    { "name": "string", "budgetPercent": number }
  ],
  "visualDirection": "string (1 paragraph)",
  "keyMessages": ["string", "string", "string"]
}`;

  try {
    await generateStream(systemPrompt, userPrompt, res);
  } catch (err) {
    console.error(`[${req.id}] generateBrief error:`, err);
  }
};

module.exports = { generateBrief };
