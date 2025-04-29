// // require('dotenv').config();
// // const express = require('express');
// // const mongoose = require('mongoose');
// // const LRUCache = require('./cache/lruCache');
// // const axios = require('axios');
// // const uploadRouter = require('./routes/upload');
// // const analyzeRouter = require('./routes/analyze');
// // const cors = require('cors');
// // const rateLimit = require('express-rate-limit');

// // const app = express();

// // // Rate limiting for our API
// // const apiLimiter = rateLimit({
// //   windowMs: 15 * 60 * 1000, // 15 minutes
// //   max: 50, // limit each IP to 50 requests per windowMs
// //   standardHeaders: true,
// //   legacyHeaders: false,
// //   message: {
// //     error: 'Too many requests',
// //     message: 'Please try again later',
// //     retryAfter: 15 * 60 // 15 minutes in seconds
// //   }
// // });

// // // Apply rate limiting to specific routes
// // app.use('/api/', apiLimiter);

// // // Basic middleware
// // app.use(express.json());
// // app.use(cors());

// // // Enhanced logging middleware
// // app.use((req, res, next) => {
// //   const start = Date.now();
// //   res.on('finish', () => {
// //     const duration = Date.now() - start;
// //     console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
// //   });
// //   next();
// // });

// // // Health check endpoint with more details
// // app.get('/api/health', (req, res) => {
// //   const health = {
// //     status: 'ok',
// //     message: 'Server is running',
// //     timestamp: new Date().toISOString(),
// //     uptime: process.uptime(),
// //     memoryUsage: process.memoryUsage(),
// //     env: process.env.NODE_ENV || 'development',
// //     rateLimit: {
// //       windowMs: apiLimiter.windowMs,
// //       max: apiLimiter.max
// //     }
// //   };
// //   res.status(200).json(health);
// // });

// // // MongoDB connection with enhanced retry logic
// // const connectWithRetry = async (retries = 5, delay = 5000) => {
// //   for (let i = 0; i < retries; i++) {
// //     try {
// //       await mongoose.connect(process.env.MONGODB_URI, {
// //         useNewUrlParser: true,
// //         useUnifiedTopology: true,
// //         serverSelectionTimeoutMS: 5000,
// //         socketTimeoutMS: 45000,
// //       });
// //       console.log('MongoDB connected successfully!');
// //       return;
// //     } catch (err) {
// //       console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
// //       if (i === retries - 1) {
// //         console.error('Max retries reached. Exiting...');
// //         process.exit(1);
// //       }
// //       console.log(`Retrying connection in ${delay/1000} seconds...`);
// //       await new Promise(resolve => setTimeout(resolve, delay));
// //     }
// //   }
// // };

// // connectWithRetry();

// // // LRU Cache setup with enhanced error handling
// // const cacheSize = parseInt(process.env.CACHE_SIZE) || 100;
// // const aiCache = new LRUCache(cacheSize);

// // // Enhanced error handling middleware
// // app.use((err, req, res, next) => {
// //   console.error('Error:', {
// //     message: err.message,
// //     stack: err.stack,
// //     path: req.path,
// //     method: req.method,
// //     timestamp: new Date().toISOString()
// //   });
  
// //   // Handle OpenAI rate limit errors specifically
// //   if (err.response && err.response.status === 429) {
// //     return res.status(429).json({
// //       error: 'Rate limit exceeded',
// //       message: 'OpenAI API rate limit reached. Please try again later.',
// //       retryAfter: err.response.headers['retry-after'] || 60
// //     });
// //   }
  
// //   res.status(500).json({ 
// //     error: 'Internal Server Error',
// //     message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // Enhanced 404 handler
// // app.use((req, res) => {
// //   console.warn('404 Not Found:', {
// //     path: req.url,
// //     method: req.method,
// //     ip: req.ip,
// //     timestamp: new Date().toISOString()
// //   });
  
// //   res.status(404).json({
// //     error: 'Not Found',
// //     message: 'The requested resource was not found',
// //     path: req.url,
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // File upload and analysis routes
// // app.use('/upload', uploadRouter);
// // app.use('/analyze', analyzeRouter);

// // // Start server with enhanced error handling
// // const PORT = process.env.PORT || 5000;
// // const server = app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// //   console.log('Environment:', process.env.NODE_ENV || 'development');
// //   console.log('Rate limit:', apiLimiter.max, 'requests per', apiLimiter.windowMs/1000, 'seconds');
// // });

// // // Enhanced error handlers
// // process.on('uncaughtException', (err) => {
// //   console.error('Uncaught Exception:', {
// //     message: err.message,
// //     stack: err.stack,
// //     timestamp: new Date().toISOString()
// //   });
// //   process.exit(1);
// // });

// // process.on('unhandledRejection', (reason, promise) => {
// //   console.error('Unhandled Rejection:', {
// //     reason: reason.message,
// //     stack: reason.stack,
// //     timestamp: new Date().toISOString()
// //   });
// // });

// // // Graceful shutdown with timeout
// // process.on('SIGTERM', () => {
// //   console.log('SIGTERM received. Shutting down gracefully...');
// //   server.close(() => {
// //     console.log('Process terminated');
// //     process.exit(0);
// //   });
  
// //   // Force shutdown after 10 seconds
// //   setTimeout(() => {
// //     console.error('Could not close connections in time, forcefully shutting down');
// //     process.exit(1);
// //   }, 10000);
// // });



// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const uploadRouter = require('./routes/upload');
// const analyzeRouter = require('./routes/analyze');
// const cors = require('cors');

// const app = express();

// // Basic middleware
// app.use(express.json());
// app.use(cors());

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'Server is running' });
// });

// // MongoDB connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB connected!'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // File upload and analysis routes
// app.use('/upload', uploadRouter);
// app.use('/analyze', analyzeRouter);

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
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