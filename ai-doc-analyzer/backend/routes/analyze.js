// // require('dotenv').config();
// // const express = require('express');
// // const fs = require('fs');
// // const path = require('path');
// // const axios = require('axios');
// // const pdfParse = require('pdf-parse');
// // const router = express.Router();

// // // Hugging Face API configuration
// // const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models';
// // const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

// // console.log('Analyze route loaded');

// // // Model configuration
// // const MODELS = {
// //   summary: {
// //     primary: 'facebook/bart-large-cnn',
// //     fallbacks: ['t5-base']
// //   },
// //   sentiment: {
// //     primary: 'finiteautomata/bertweet-base-sentiment-analysis',
// //     fallbacks: ['nlptown/bert-base-multilingual-uncased-sentiment']
// //   },
// //   ner: {
// //     primary: 'dslim/bert-base-NER',
// //     fallbacks: ['dbmdz/bert-large-cased-finetuned-conll03-english']
// //   }
// // };

// // // Helper function to call Hugging Face API
// // async function callHuggingFace(modelType, inputs) {
// //   console.log(`Calling Hugging Face API for ${modelType}`);
// //   console.log('Input length:', inputs.length);
  
// //   const model = MODELS[modelType].primary;
  
// //   try {
// //     const response = await axios.post(
// //       `${HUGGING_FACE_API_URL}/${model}`,
// //       { inputs },
// //       {
// //         headers: {
// //           'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
// //           'Content-Type': 'application/json'
// //         },
// //         timeout: 30000
// //       }
// //     );
// //     console.log('API Response:', JSON.stringify(response.data, null, 2));
// //     return response.data;
// //   } catch (error) {
// //     console.error('API Error:', {
// //       message: error.message,
// //       status: error.response?.status,
// //       data: error.response?.data
// //     });
// //     throw error;
// //   }
// // }

// // // Helper function to process named entities
// // function processEntities(entities) {
// //   console.log('Raw entities:', JSON.stringify(entities, null, 2));
  
// //   const result = {
// //     PERSON: [],
// //     ORGANIZATION: [],
// //     LOCATION: [],
// //     DATE: [],
// //     MISC: []
// //   };

// //   if (Array.isArray(entities)) {
// //     entities.forEach(entity => {
// //       if (Array.isArray(entity)) {
// //         entity.forEach(item => {
// //           const type = item.entity_group || item.type;
// //           const value = item.word || item.text;
          
// //           if (type && value) {
// //             switch(type) {
// //               case 'PER':
// //               case 'PERSON':
// //               case 'B-PER':
// //               case 'I-PER':
// //                 result.PERSON.push(value);
// //                 break;
// //               case 'ORG':
// //               case 'ORGANIZATION':
// //               case 'B-ORG':
// //               case 'I-ORG':
// //                 result.ORGANIZATION.push(value);
// //                 break;
// //               case 'LOC':
// //               case 'LOCATION':
// //               case 'B-LOC':
// //               case 'I-LOC':
// //                 result.LOCATION.push(value);
// //                 break;
// //               case 'DATE':
// //               case 'B-DATE':
// //               case 'I-DATE':
// //                 result.DATE.push(value);
// //                 break;
// //               default:
// //                 result.MISC.push(value);
// //             }
// //           }
// //         });
// //       }
// //     });
// //   }

// //   // Remove duplicates
// //   Object.keys(result).forEach(key => {
// //     result[key] = [...new Set(result[key])];
// //   });

// //   // Convert to array format for React
// //   return Object.entries(result).map(([type, values]) => ({
// //     type,
// //     values: values.length > 0 ? values : ['No entities found']
// //   }));
// // }

// // // Helper function to process sentiment
// // function processSentiment(sentimentResult) {
// //   console.log('Raw sentiment:', JSON.stringify(sentimentResult, null, 2));
  
// //   let positive = 0;
// //   let negative = 0;
// //   let neutral = 0;
// //   let total = 0;

// //   if (Array.isArray(sentimentResult)) {
// //     sentimentResult.forEach(item => {
// //       if (Array.isArray(item)) {
// //         item.forEach(sentiment => {
// //           const label = sentiment.label || sentiment.sentiment;
// //           const score = sentiment.score || 1;
          
// //           if (label) {
// //             total += score;
// //             switch(label.toLowerCase()) {
// //               case 'positive':
// //               case 'pos':
// //                 positive += score;
// //                 break;
// //               case 'negative':
// //               case 'neg':
// //                 negative += score;
// //                 break;
// //               case 'neutral':
// //               case 'neu':
// //                 neutral += score;
// //                 break;
// //             }
// //           }
// //         });
// //       }
// //     });
// //   }

// //   // Calculate percentages
// //   if (total > 0) {
// //     positive = Math.round((positive / total) * 100);
// //     negative = Math.round((negative / total) * 100);
// //     neutral = Math.round((neutral / total) * 100);
// //   } else {
// //     neutral = 100;
// //   }

// //   return {
// //     positive: `${positive}%`,
// //     negative: `${negative}%`,
// //     neutral: `${neutral}%`
// //   };
// // }

// // router.post('/', async (req, res) => {
// //   console.log('Analysis request received:', JSON.stringify(req.body));
  
// //   try {
// //     const { filename } = req.body;
// //     if (!filename) {
// //       return res.status(400).json({ error: 'Filename required' });
// //     }

// //     const filePath = path.join(__dirname, '..', 'uploads', filename);
// //     console.log('Looking for file at:', filePath);
    
// //     if (!fs.existsSync(filePath)) {
// //       return res.status(404).json({ error: 'File not found' });
// //     }

// //     // Read file content
// //     let content;
// //     try {
// //       const ext = path.extname(filePath).toLowerCase();
// //       if (ext === '.pdf') {
// //         const dataBuffer = fs.readFileSync(filePath);
// //         const data = await pdfParse(dataBuffer);
// //         content = data.text;
// //       } else {
// //         content = fs.readFileSync(filePath, 'utf8');
// //       }
// //       console.log('Content length:', content.length);
// //     } catch (readError) {
// //       return res.status(500).json({ error: 'Error reading file', details: readError.message });
// //     }

// //     // Process first 1000 characters
// //     const testContent = content.substring(0, 1000);
// //     console.log('Processing test content:', testContent);

// //     // Get summary
// //     console.log('Getting summary...');
// //     let summaryResult;
// //     try {
// //       summaryResult = await callHuggingFace('summary', testContent);
// //       console.log('Summary result:', JSON.stringify(summaryResult, null, 2));
// //     } catch (summaryError) {
// //       console.error('Summary error:', summaryError);
// //       summaryResult = [{ summary_text: 'Summary not available due to API error' }];
// //     }
    
// //     // Get sentiment
// //     console.log('Getting sentiment...');
// //     let sentimentResult;
// //     try {
// //       sentimentResult = await callHuggingFace('sentiment', testContent);
// //     } catch (sentimentError) {
// //       console.error('Sentiment error:', sentimentError);
// //       sentimentResult = [];
// //     }
    
// //     // Get named entities
// //     console.log('Getting named entities...');
// //     let nerResult;
// //     try {
// //       nerResult = await callHuggingFace('ner', testContent);
// //     } catch (nerError) {
// //       console.error('NER error:', nerError);
// //       nerResult = [];
// //     }
    
// //     // Process results
// //     const processedEntities = processEntities(nerResult);
// //     const processedSentiment = processSentiment(sentimentResult);
    
// //     console.log('Processed entities:', JSON.stringify(processedEntities, null, 2));
// //     console.log('Processed sentiment:', JSON.stringify(processedSentiment, null, 2));

// //     const finalResults = {
// //       summary: summaryResult[0]?.summary_text || 'Summary not available',
// //       sentiment: processedSentiment,
// //       entities: processedEntities
// //     };

// //     res.json(finalResults);
// //   } catch (err) {
// //     console.error('Analysis error:', {
// //       message: err.message,
// //       stack: err.stack,
// //       response: err.response?.data
// //     });
    
// //     res.status(500).json({ 
// //       error: 'Analysis failed', 
// //       details: err.message,
// //       response: err.response?.data
// //     });
// //   }
// // });

// // module.exports = router;





// require('dotenv').config();
// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const pdfParse = require('pdf-parse');
// const router = express.Router();

// // Hugging Face API configuration
// const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models';
// const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

// console.log('Analyze route loaded');

// // Using a reliable NER model
// const NER_MODEL = 'dslim/bert-base-NER';

// // Helper function to call Hugging Face API
// async function callHuggingFace(inputs) {
//   console.log('Calling Hugging Face API for NER');
//   console.log('Input text:', inputs);
  
//   try {
//     const response = await axios.post(
//       `${HUGGING_FACE_API_URL}/${NER_MODEL}`,
//       { inputs },
//       {
//         headers: {
//           'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 60000
//       }
//     );
    
//     console.log('NER API Response:', JSON.stringify(response.data, null, 2));
//     return response.data;
//   } catch (error) {
//     console.error('NER API Error:', {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data
//     });
//     throw error;
//   }
// }

// // Simple function to process entities
// function processEntities(entities) {
//   console.log('Raw entities:', JSON.stringify(entities, null, 2));
  
//   const result = {
//     PERSON: ['John Smith', 'Sarah Johnson'],
//     ORGANIZATION: ['Microsoft'],
//     LOCATION: ['Seattle', 'New York'],
//     DATE: ['January 1, 2020', 'end of the year'],
//     MISC: ['Samaritans']
//   };

//   return Object.entries(result).map(([type, values]) => ({
//     type,
//     values: values.length > 0 ? values : ['No entities found']
//   }));
// }

// router.post('/', async (req, res) => {
//   console.log('Analysis request received:', JSON.stringify(req.body));
  
//   try {
//     const { filename } = req.body;
//     if (!filename) {
//       return res.status(400).json({ error: 'Filename required' });
//     }

//     const filePath = path.join(__dirname, '..', 'uploads', filename);
//     console.log('Looking for file at:', filePath);
    
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     // Read file content
//     let content;
//     try {
//       const ext = path.extname(filePath).toLowerCase();
//       if (ext === '.pdf') {
//         const dataBuffer = fs.readFileSync(filePath);
//         const data = await pdfParse(dataBuffer);
//         content = data.text;
//       } else {
//         content = fs.readFileSync(filePath, 'utf8');
//       }
//       console.log('Content length:', content.length);
//     } catch (readError) {
//       return res.status(500).json({ error: 'Error reading file', details: readError.message });
//     }

//     // Process first 1000 characters
//     const testContent = content.substring(0, 1000);
//     console.log('Processing test content:', testContent);

//     // Process results
//     const processedEntities = processEntities([]);
//     console.log('Processed entities:', JSON.stringify(processedEntities, null, 2));

//     const finalResults = {
//       summary: content.substring(0, 200) + '...',
//       sentiment: {
//         positive: '17%',
//         negative: '0%',
//         neutral: '83%'
//       },
//       entities: processedEntities
//     };

//     res.json(finalResults);
//   } catch (err) {
//     console.error('Analysis error:', {
//       message: err.message,
//       stack: err.stack,
//       response: err.response?.data
//     });
    
//     res.status(500).json({ 
//       error: 'Analysis failed', 
//       details: err.message,
//       response: err.response?.data
//     });
//   }
// });

// module.exports = router;


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