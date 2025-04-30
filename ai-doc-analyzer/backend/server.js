require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const uploadRouter = require('./routes/upload');
const analyzeRouter = require('./routes/analyze');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test Hugging Face API connection
async function testHuggingFace() {
  try {
    console.log('Testing Hugging Face API connection...');
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: 'This is a test sentence.' },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Hugging Face API test successful:', response.data);
  } catch (error) {
    console.error('Hugging Face API test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run the test when server starts
testHuggingFace();

// File upload and analysis routes
app.use('/upload', uploadRouter);
app.use('/analyze', analyzeRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});