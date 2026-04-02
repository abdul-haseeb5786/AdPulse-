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
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean)
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS not allowed'))
    }
  },
  credentials: true
}))

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
