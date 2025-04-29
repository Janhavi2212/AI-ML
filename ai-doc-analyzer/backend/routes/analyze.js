require('dotenv').config(); // If not already at the top
const openaiApiKey = process.env.OPENAI_API_KEY;
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const router = express.Router();

// Helper: Read file content (supports .txt and .pdf)
async function readFileContent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else {
    return fs.readFileSync(filePath, 'utf8');
  }
}

// Helper: Call AI API with retries
async function callAIWithRetry(prompt, retries = 2, delay = 1000) {
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }]
          },
          {
            headers: {
              "Authorization": `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json"
            }
          }
        );
        return { result: response.data.choices[0].message.content.trim() };
      } catch (err) {
        if (i === retries) throw err;
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
  }



router.post('/', async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Filename required' });

  const filePath = path.join(__dirname, '..', 'uploads', filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  try {
    const content = await readFileContent(filePath);



    // 1. Extract entities
const prompt1 = `Extract key entities (names, dates, topics) from this text. Respond ONLY with a JSON array of objects with keys Name, Date, and Topic:\n${content}`;
const entities = await callAIWithRetry(prompt1);

// 2. Summarize sections
const prompt2 = `Summarize each section in one sentence from this text. Respond ONLY with a JSON array of strings:\n${content}`;
const summaries = await callAIWithRetry(prompt2);

// 3. Sentiment analysis
const prompt3 = `Evaluate the overall sentiment of this text. Respond with one word: Positive, Negative, or Neutral:\n${content}`;
const sentiment = await callAIWithRetry(prompt3);
    // // 1. Extract entities
    // const prompt1 = `Extract key entities (names, dates, topics) from this text:\n${content}`;
    // const entities = await callAIWithRetry(prompt1);

    // // 2. Summarize sections
    // const prompt2 = `Summarize each section in one sentence from this text:\n${content}`;
    // const summaries = await callAIWithRetry(prompt2);

    // // 3. Sentiment analysis
    // const prompt3 = `Evaluate the overall sentiment of this text:\n${content}`;
    // const sentiment = await callAIWithRetry(prompt3);

    res.json({
      entities: entities.result,
      summaries: summaries.result,
      sentiment: sentiment.result
    });
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

module.exports = router;