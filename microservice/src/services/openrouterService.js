const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "anthropic/claude-sonnet-4-5";



const headers = {
  "Authorization": "Bearer " + OPENROUTER_KEY,
  "Content-Type": "application/json",
  "HTTP-Referer": process.env.SERVICE_URL || "http://localhost:5000",
  "X-Title": "AdPulse AI Microservice"
};

/**
 * Non-streaming completion call using OpenRouter
 */
async function generateCompletion(systemPrompt, userPrompt, maxTokens = 800) {
  try {
    const response = await fetch(OPENROUTER_BASE + "/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        "OpenRouter API error: " + (err.error?.message || response.statusText)
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (err) {
    throw new Error("OpenRouter generateCompletion failed: " + err.message);
  }
}

/**
 * Streaming completion call using OpenRouter SSE
 */
async function generateStream(systemPrompt, userPrompt, res) {
  const maxTokens = process.env.NODE_ENV === 'production'
    ? 800 : 1000

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader('X-Vercel-Skip-Proxy-Response', '1')

  try {
    const response = await fetch(OPENROUTER_BASE + "/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      res.write(
        "data: " + JSON.stringify({
          error: "OpenRouter error: " + (err.error?.message || response.statusText)
        }) + "\n\n"
      );
      res.end();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter(line => line.trim() !== "");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const raw = line.replace("data: ", "").trim();

        if (raw === "[DONE]") {
          res.write("data: " + JSON.stringify({ done: true }) + "\n\n");
          res.end();
          return;
        }

        try {
          const parsed = JSON.parse(raw);
          const text = parsed.choices?.[0]?.delta?.content;
          if (text) {
            res.write("data: " + JSON.stringify({ chunk: text }) + "\n\n");
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }

  } catch (err) {
    res.write(
      "data: " + JSON.stringify({
        error: "Stream failed: " + err.message
      }) + "\n\n"
    );
  } finally {
    res.end();
  }
}

module.exports = { generateCompletion, generateStream };
