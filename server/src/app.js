require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { errorHandler } = require('./middleware/errorHandler');
const { startAlertEngine, seedDefaultRules } = require('./services/alertEngine');

// Route imports
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const alertRoutes = require('./routes/alerts');

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 4000;

// Middleware
// Robust CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // List of explicitly allowed origins
    const allowedOrigins = [
      'https://ad-pulse-seven.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean)

    // Include dynamically specified origins from ALLOWED_ORIGINS env var
    if (process.env.ALLOWED_ORIGINS) {
      const dynamicOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      allowedOrigins.push(...dynamicOrigins)
    }

    // Allow requests with no origin (like mobile apps or curl) or if origin is in the list
    if (!origin || allowedOrigins.some(ao => origin.startsWith(ao)) || origin.includes('localhost')) {
      callback(null, true)
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`)
      callback(new Error('CORS policy: This origin is not allowed'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

app.use(cors(corsOptions));

// Socket.io Placeholder (Production only)
// Prevents continuous 404s when the client tries to connect to the disabled socket server
if (process.env.NODE_ENV === 'production') {
  app.get('/socket.io/', (req, res) => {
    res.status(200).send('Socket.io disabled in production (Vercel Serverless)');
  });
}

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

if (process.env.NODE_ENV !== 'production') {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    socket.on('join_campaign', (campaignId) => {
      socket.join('campaign:' + campaignId)
    })
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  if (require.main === module) {
    httpServer.listen(PORT, async () => {
      console.log('AdPulse API running on port ' + PORT)
      await seedDefaultRules()
      startAlertEngine(io)
    })
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/alerts', alertRoutes);

// Error Handling (Must be last)
app.use(errorHandler);

module.exports = app
