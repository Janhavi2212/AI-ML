import React from "react";

function Progress({ uploading, analyzing }) {
  return (
    <div className="progress">
      {uploading && <div>Uploading file...</div>}
      {analyzing && <div>Analyzing document with AI...</div>}
      <div className="loader"></div>
    </div>
  );
}

export default Progress;