require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const LRUCache = require('./cache/lruCache');
const axios = require('axios');
const uploadRouter = require('./routes/upload');
const analyzeRouter = require('./routes/analyze');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// LRU Cache setup
const cacheSize = parseInt(process.env.CACHE_SIZE) || 100;
const aiCache = new LRUCache(cacheSize);

// Dummy AI API endpoint (replace with real one later)
const AI_API_URL = 'https://api-inference.huggingface.co/models/gpt2'; // Example public endpoint

// Helper function to call the AI API
async function callAI(prompt) {
  // For demo, just echo the prompt. Replace with real API call.
  // Example with HuggingFace:
  // const response = await axios.post(AI_API_URL, { inputs: prompt }, { headers: { Authorization: `Bearer ${process.env.AI_API_KEY}` } });
  // return response.data;
  return { result: `AI response for: ${prompt}` };
}

// Route: POST /ai
app.post('/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  // Check cache first
  const cached = aiCache.get(prompt);
  if (cached) {
    return res.json({ fromCache: true, data: cached });
  }

  // Not in cache: call AI API
  try {
    const aiResponse = await callAI(prompt);
    await aiCache.set(prompt, aiResponse);
    return res.json({ fromCache: false, data: aiResponse });
  } catch (err) {
    return res.status(500).json({ error: 'AI API call failed', details: err.message });
  }
});

// File upload and analysis routes
app.use('/upload', uploadRouter);
app.use('/analyze', analyzeRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});