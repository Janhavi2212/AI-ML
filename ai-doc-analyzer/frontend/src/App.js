import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import Progress from "./components/Progress";
import Results from "./components/Results";
import "./App.css";

function App() {
  const [appState, setAppState] = useState("landing"); 
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleStart = () => {
    setAppState("upload");
    setError("");
    setResults(null);
  };

  const handleUploadAndAnalyze = async (file) => {
    setError("");
    setResults(null);
    setAppState("analyzing");

    // Upload file
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      // Analyze file
      const analyzeRes = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: uploadData.filename }),
      });
      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      setResults(analyzeData);
      setAppState("results");
    } catch (err) {
      setError(err.message);
      setAppState("upload");
    }
  };

  const handleReset = () => {
    setAppState("landing");
    setResults(null);
    setError("");
  };

  return (
    <div className="App">
      {appState === "landing" && (
        <div className="landing-card">
          <h1>AI Document Analyzer</h1>
          <p>
            Upload a <b>.txt</b> or <b>.pdf</b> file and let AI extract key entities, summarize sections, and evaluate sentiment—all in a beautiful, modern interface.
          </p>
          <button className="start-btn" onClick={handleStart}>
            Get Started
          </button>
        </div>
      )}

      {appState === "upload" && (
        <div className="upload-card">
          <h1>Upload Your Document</h1>
          <FileUpload onUpload={handleUploadAndAnalyze} disabled={appState === "analyzing"} />
          {error && <div className="error">{error}</div>}
        </div>
      )}

      {appState === "analyzing" && (
        <div className="analyzing-card">
          <h1>Analyzing...</h1>
          <Progress uploading={false} analyzing={true} />
        </div>
      )}

      {appState === "results" && (
        <div className="results-card">
          <h1>Analysis Results</h1>
          <Results results={results} />
          <button className="reset-btn" onClick={handleReset}>
            Analyze Another Document
          </button>
        </div>
      )}
    </div>
  );
}

export default App;