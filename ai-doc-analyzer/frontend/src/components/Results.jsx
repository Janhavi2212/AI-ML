import React from "react";

// Helper to try parsing entities as JSON array of objects
function renderEntities(entities) {
  try {
    const parsed = typeof entities === "string" ? JSON.parse(entities) : entities;
    if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "object") {
      const headers = Object.keys(parsed[0]);
      return (
        <table className="entities-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.map((row, i) => (
              <tr key={i}>
                {headers.map((h) => (
                  <td key={h}>{row[h]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  } catch (e) {
    // Not JSON, fall back to pre
  }
  return <pre>{entities}</pre>;
}

// Helper to try parsing summaries as array
function renderSummaries(summaries) {
  try {
    const parsed = typeof summaries === "string" ? JSON.parse(summaries) : summaries;
    if (Array.isArray(parsed)) {
      return (
        <ul className="summaries-list">
          {parsed.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      );
    }
  } catch (e) {
    // Not JSON, fall back to pre
  }
  return <pre>{summaries}</pre>;
}

// Helper for sentiment badge
function renderSentiment(sentiment) {
  let color = "#6ec1e4";
  let bg = "#1e2a38";
  let text = sentiment;
  if (typeof sentiment === "string") {
    if (sentiment.toLowerCase().includes("positive")) color = "#4fd18b";
    if (sentiment.toLowerCase().includes("negative")) color = "#ff6b81";
    if (sentiment.toLowerCase().includes("neutral")) color = "#f7b731";
  }
  return (
    <span className="sentiment-badge" style={{ color, borderColor: color, background: bg }}>
      {text}
    </span>
  );
}

function Results({ results }) {
  return (
    <div className="results">
      <h2>Extracted Entities</h2>
      <div className="entities">{renderEntities(results.entities)}</div>
      <h2>Section Summaries</h2>
      <div className="summaries">{renderSummaries(results.summaries)}</div>
      <h2>Sentiment</h2>
      <div className="sentiment">{renderSentiment(results.sentiment)}</div>
    </div>
  );
}

export default Results;
