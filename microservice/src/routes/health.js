const express = require('express');
const router = express.Router();

// GET /health
router.get('/', (req, res) => {
  res.json({
    status: "healthy",
    service: "AdPulse AI Microservice",
    version: "1.0.0",
    provider: "OpenRouter",
    providerUrl: "https://openrouter.ai",
    model: "anthropic/claude-sonnet-4-5",
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + " seconds",
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
