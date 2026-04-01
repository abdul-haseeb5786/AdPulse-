require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');
const { requestId } = require('./middleware/requestId');
const { logger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const generateRoutes = require('./routes/generate');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5000;

// Apply requestId and Logger globally
app.use(requestId);
app.use(logger);

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Rate Limiter: 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: "60 seconds",
      requestId: req.id
    });
  },
});

app.use(apiLimiter);

// Routes
app.use('/generate', generateRoutes);
app.use('/health', healthRoutes);

// Error Handling (Must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`AI Microservice running on port ${PORT}`);
});

module.exports = app;
