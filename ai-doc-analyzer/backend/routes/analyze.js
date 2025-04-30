require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const router = express.Router();

// Hugging Face API configuration
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

// Ensure API key is loaded
if (!HUGGING_FACE_API_KEY) {
  console.error("Error: HUGGING_FACE_API_KEY is not set in the environment variables.");

} else {
    console.log('Hugging Face API Key loaded.');
}

console.log('Analyze route loaded');

// Using a reliable NER model
const NER_MODEL = 'dslim/bert-base-NER';

// Helper function to call Hugging Face API for NER
async function callHuggingFaceNer(inputs) {

  const MAX_INPUT_LENGTH = 1500; // Adjust as needed, based on model and typical word length
  const truncatedInput = inputs.substring(0, MAX_INPUT_LENGTH);

  console.log(`Calling Hugging Face NER API (${NER_MODEL})`);
  // console.log('Input text (truncated):', truncatedInput); // Log truncated text

  if (!HUGGING_FACE_API_KEY) {
      throw new Error('Hugging Face API Key is missing.');
  }

  try {
    const response = await axios.post(
      `${HUGGING_FACE_API_URL}/${NER_MODEL}`,
      { inputs: truncatedInput }, // Send truncated input
      {
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 seconds timeout
      }
    );

    return response.data;
  } catch (error) {
    console.error('NER API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: { url: error.config?.url, method: error.config?.method } // Log request details
    });
    // Rethrow or handle specific errors (like 401 Unauthorized, 503 Service Unavailable)
    if (error.response?.status === 503) {
        console.error(`Model ${NER_MODEL} might be loading. Consider retrying or using a different model.`);
        // Optionally return a specific error message or empty results
        throw new Error(`NER model (${NER_MODEL}) is currently unavailable (503). It might be loading.`);
    }
    throw error; // Re-throw the error to be caught by the main route handler
  }
}

// Function to process raw entities from Hugging Face NER API
function processNerEntities(rawEntities) {
  console.log('Processing raw entities from API:', JSON.stringify(rawEntities, null, 2));

  if (!Array.isArray(rawEntities)) {
     console.warn('Expected an array of entities from API, received:', typeof rawEntities, '- Returning empty results.');
     return []; // Return empty if the format is unexpected
  }

  const groupedEntities = {};

  rawEntities.forEach(entity => {

    let type;
    switch (entity.entity_group) {
      case 'PER': type = 'PERSON'; break;
      case 'ORG': type = 'ORGANIZATION'; break;
      case 'LOC': type = 'LOCATION'; break;
      // Note: This model doesn't specifically tag dates. They might fall under MISC or not be tagged.
      case 'MISC': type = 'MISCELLANEOUS'; break; // Use a more descriptive name
      default: type = entity.entity_group; // Keep original tag if unknown
    }

    // Initialize array for the type if it doesn't exist
    if (!groupedEntities[type]) {
      groupedEntities[type] = [];
    }

    // Clean up the word (remove potential subword markers like ##)
    const cleanedWord = entity.word.replace(/^##/, '');

    if (!groupedEntities[type].includes(cleanedWord)) { // Avoid duplicates for now
         groupedEntities[type].push(cleanedWord);
    }
    // TODO: Implement logic to group consecutive words (e.g., "New", "York" tagged as LOC) into "New York".
    // This requires checking entity start/end positions and potentially requires more complex logic.
  });

  console.log('Grouped entities:', JSON.stringify(groupedEntities, null, 2));

  // Format into the final structure
  const result = Object.entries(groupedEntities).map(([type, values]) => ({
    type,
    // Ensure values is always an array, even if empty, before checking length
    values: values && values.length > 0 ? values : ['No entities found for this type']
  }));

  // If no entities were found at all
  if (result.length === 0) {
      return [{ type: 'INFO', values: ['No named entities identified by the model.'] }];
  }

  return result;
}


router.post('/', async (req, res) => {
  console.log('Analysis request received:', JSON.stringify(req.body));

  try {
    const { filename } = req.body;
    if (!filename) {
      console.log('Error: Filename missing in request body.');
      return res.status(400).json({ error: 'Filename required' });
    }

    // Basic security check: prevent path traversal
    if (filename.includes('..') || path.isAbsolute(filename)) {
        console.log('Error: Invalid filename (potential path traversal).');
        return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', filename);
    console.log('Looking for file at:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log(`Error: File not found at ${filePath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    // Read file content
    let content;
    try {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.pdf') {
        console.log('Parsing PDF file...');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        content = data.text;
        console.log('PDF parsed successfully.');
      } else {
        console.log('Reading text file...');
        content = fs.readFileSync(filePath, 'utf8');
        console.log('Text file read successfully.');
      }
      console.log('Content length:', content.length);
      if (!content || content.trim().length === 0) {
          console.log('Warning: File content is empty.');
          // Decide how to handle empty content (e.g., return specific message or empty results)
          content = "File content is empty."; // Provide default text to avoid errors downstreams
      }
    } catch (readError) {
      console.error('Error reading or parsing file:', readError);
      return res.status(500).json({ error: 'Error reading file', details: readError.message });
    }

    // --- Call Hugging Face API for NER ---
    let rawNerEntities = []; // Default to empty array
    try {
        // Use the full content (or a relevant part) for NER
        // Be mindful of potential length limits of the NER model API
        rawNerEntities = await callHuggingFaceNer(content);
    } catch (apiError) {
        console.error('Failed to get NER entities from Hugging Face:', apiError.message);

    }

    const processedEntities = processNerEntities(rawNerEntities);
    console.log('Final processed entities:', JSON.stringify(processedEntities, null, 2));

    const finalResults = {
      summary: content, // Use the full file content here
      sentiment: { // Sentiment remains hardcoded as it wasn't part of the request to change
        positive: '17%',
        negative: '0%',
        neutral: '83%'
      },
      entities: processedEntities // Use the dynamically processed entities
    };

    res.json(finalResults);

  } catch (err) {
    console.error('Unhandled Analysis Error:', {
      message: err.message,
      stack: err.stack,
      // Include response data if it's an Axios error from the API call
      response: err.response?.data
    });

    res.status(500).json({
      error: 'Analysis failed',
      details: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack, responseData: err.response?.data })
    });
  }
});

module.exports = router;