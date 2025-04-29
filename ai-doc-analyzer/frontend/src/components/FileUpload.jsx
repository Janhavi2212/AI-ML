import React, { useRef } from "react";

function FileUpload({ onUpload, disabled }) {
  const fileInput = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fileInput.current.files.length === 0) return;
    onUpload(fileInput.current.files[0]);
  };

  return (
    <form className="file-upload" onSubmit={handleSubmit}>
      <input
        type="file"
        accept=".txt,.pdf"
        ref={fileInput}
        disabled={disabled}
        style={{ color: "#fff" }}
      />
      <button type="submit" disabled={disabled}>
        Upload & Analyze
      </button>
    </form>
  );
}

export default FileUpload;