// // import React, { useState } from "react";
// // import FileUpload from "./components/FileUpload";
// // import Progress from "./components/Progress";
// // import Results from "./components/Results";
// // import "./App.css";

// // const API_BASE_URL = 'http://localhost:5000';

// // function App() {
// //   const [appState, setAppState] = useState("landing"); 
// //   const [results, setResults] = useState(null);
// //   const [error, setError] = useState("");

// //   const handleStart = () => {
// //     setAppState("upload");
// //     setError("");
// //     setResults(null);
// //   };

// //   const handleUploadAndAnalyze = async (file) => {
// //     setError("");
// //     setResults(null);
// //     setAppState("analyzing");

// //     // Upload file
// //     const formData = new FormData();
// //     formData.append("file", file);

// //     try {
// //       const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
// //         method: "POST",
// //         body: formData,
// //       });
// //       const uploadData = await uploadRes.json();

// //       if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

// //       // Analyze file
// //       const analyzeRes = await fetch(`${API_BASE_URL}/analyze`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ filename: uploadData.filename }),
// //       });
// //       const analyzeData = await analyzeRes.json();

// //       if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

// //       setResults(analyzeData);
// //       setAppState("results");
// //     } catch (err) {
// //       setError(err.message);
// //       setAppState("upload");
// //     }
// //   };

// //   const handleReset = () => {
// //     setAppState("landing");
// //     setResults(null);
// //     setError("");
// //   };

// //   return (
// //     <div className="App">
// //       {appState === "landing" && (
// //         <div className="landing-card">
// //           <h1>AI Document Analyzer</h1>
// //           <p>
// //             Upload a <b>.txt</b> or <b>.pdf</b> file and let AI extract key entities, summarize sections, and evaluate sentiment—all in a beautiful, modern interface.
// //           </p>
// //           <button className="start-btn" onClick={handleStart}>
// //             Get Started
// //           </button>
// //         </div>
// //       )}

// //       {appState === "upload" && (
// //         <div className="upload-card">
// //           <h1>Upload Your Document</h1>
// //           <FileUpload onUpload={handleUploadAndAnalyze} disabled={appState === "analyzing"} />
// //           {error && <div className="error">{error}</div>}
// //         </div>
// //       )}

// //       {appState === "analyzing" && (
// //         <div className="analyzing-card">
// //           <h1>Analyzing...</h1>
// //           <Progress uploading={false} analyzing={true} />
// //         </div>
// //       )}

// //       {appState === "results" && (
// //         <div className="results-card">
// //           <h1>Analysis Results</h1>
// //           <Results results={results} />
// //           <button className="reset-btn" onClick={handleReset}>
// //             Analyze Another Document
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default App;


// import React, { useState } from 'react';
// import './App.css';

// function App() {
//   const [file, setFile] = useState(null);
//   const [analysis, setAnalysis] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//     setAnalysis(null);
//     setError(null);
//   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setLoading(true);
//     setError(null);

//     try {
//       // Upload file
//       const formData = new FormData();
//       formData.append('file', file);

//       const uploadResponse = await fetch('http://localhost:5000/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!uploadResponse.ok) {
//         throw new Error('Upload failed');
//       }

//       const { filename } = await uploadResponse.json();

//       // Analyze file
//       const analyzeResponse = await fetch('http://localhost:5000/analyze', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ filename }),
//       });

//       if (!analyzeResponse.ok) {
//         const errorData = await analyzeResponse.json();
//         throw new Error(errorData.message || 'Analysis failed');
//       }

//       const analysisData = await analyzeResponse.json();
//       setAnalysis(analysisData);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Document Analyzer</h1>
//       </header>

//       <main className="App-main">
//         <div className="upload-section">
//           <input
//             type="file"
//             onChange={handleFileChange}
//             accept=".txt,.pdf"
//           />
//           <button onClick={handleUpload} disabled={!file || loading}>
//             {loading ? 'Analyzing...' : 'Analyze Document'}
//           </button>
//         </div>

//         {error && (
//           <div className="error-message">
//             {error}
//           </div>
//         )}

//         {analysis && (
//           <div className="analysis-results">
//             <section className="summary-section">
//               <h2>Summary</h2>
//               <p>{analysis.summary}</p>
//             </section>

//             <section className="sentiment-section">
//               <h2>Sentiment Analysis</h2>
//               <div className="sentiment-bars">
//                 <div className="sentiment-bar positive">
//                   <span>Positive: {analysis.sentiment.positive}</span>
//                 </div>
//                 <div className="sentiment-bar negative">
//                   <span>Negative: {analysis.sentiment.negative}</span>
//                 </div>
//                 <div className="sentiment-bar neutral">
//                   <span>Neutral: {analysis.sentiment.neutral}</span>
//                 </div>
//               </div>
//             </section>

//             <section className="entities-section">
//               <h2>Extracted Entities</h2>
//               <div className="entities-grid">
//                 {analysis.entities.map(({ type, values }) => (
//                   <div key={type} className="entity-group">
//                     <h3>{type}</h3>
//                     <ul>
//                       {values.map((value, index) => (
//                         <li key={index}>{value}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnalysis(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file...');
      const uploadResponse = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const { filename } = await uploadResponse.json();
      console.log('File uploaded successfully:', filename);

      // Analyze file
      console.log('Analyzing file...');
      const analyzeResponse = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        console.error('Analysis failed:', errorText);
        throw new Error(`Analysis failed: ${errorText}`);
      }

      const analysisData = await analyzeResponse.json();
      console.log('Analysis results:', analysisData);
      
      // Ensure all required fields exist
      const safeAnalysisData = {
        summary: analysisData.summary || 'Summary not available',
        sentiment: {
          positive: analysisData.sentiment?.positive || '0%',
          negative: analysisData.sentiment?.negative || '0%',
          neutral: analysisData.sentiment?.neutral || '100%'
        },
        entities: analysisData.entities || []
      };
      
      setAnalysis(safeAnalysisData);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Analyzer</h1>
      </header>

      <main className="App-main">
        <div className="upload-section">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".txt,.pdf"
          />
          <button 
            onClick={handleUpload} 
            disabled={!file || loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <p>Please make sure the backend server is running on port 5000.</p>
          </div>
        )}

        {analysis && (
          <div className="analysis-results">
            <section className="summary-section">
              <h2>Summary</h2>
              <p>{analysis.summary}</p>
            </section>

            <section className="sentiment-section">
              <h2>Sentiment Analysis</h2>
              <div className="sentiment-bars">
                <div className="sentiment-bar positive">
                  <span>Positive: {analysis.sentiment.positive}</span>
                </div>
                <div className="sentiment-bar negative">
                  <span>Negative: {analysis.sentiment.negative}</span>
                </div>
                <div className="sentiment-bar neutral">
                  <span>Neutral: {analysis.sentiment.neutral}</span>
                </div>
              </div>
            </section>

            <section className="entities-section">
              <h2>Extracted Entities</h2>
              <div className="entities-grid">
                {analysis.entities.map(({ type, values }) => (
                  <div key={type} className="entity-group">
                    <h3>{type}</h3>
                    <ul>
                      {values.map((value, index) => (
                        <li key={index}>{value}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;