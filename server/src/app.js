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
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Socket.io connection logic
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'User:', socket.user?.email);
  
  socket.on('join_campaign', (campaignId) => {
    socket.join(`campaign:${campaignId}`);
    console.log(`${socket.id} joined campaign room: ${campaignId}`);
  });
  
  socket.on('leave_campaign', (campaignId) => {
    socket.leave(`campaign:${campaignId}`);
    console.log(`${socket.id} left campaign room: ${campaignId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/alerts', alertRoutes);

// Error Handling (Must be last)
app.use(errorHandler);

httpServer.listen(PORT, async () => {
  console.log(`AdPulse API running on port ${PORT}`);
  
  // Initialize Alert Engine
  try {
    await seedDefaultRules();
    startAlertEngine(io);
  } catch (err) {
    console.error('Failed to initialize Alert Engine:', err);
  }
});

module.exports = { app, httpServer, io };
