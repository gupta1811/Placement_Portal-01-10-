const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🚀 Starting PlaceVerse API...');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  console.log('🏠 Home route hit');
  res.send('PlaceVerse API Running! 🚀');
});

// Import and use auth routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted');
  const jobRoutes = require('./routes/jobRoutes');
  app.use('/api/jobs', jobRoutes);
  const applicationRoutes = require('./routes/applicationRoutes');
  app.use('/api/applications', applicationRoutes);
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.path);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
});
