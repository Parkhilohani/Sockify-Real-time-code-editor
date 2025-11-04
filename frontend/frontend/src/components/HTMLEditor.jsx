import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const HTMLEditor = () => {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial; }
    h1 { color: green; }
  </style>
</head>
<body>
  <h1>Hello HTML Live!</h1>
</body>
</html>`);

  const [output, setOutput] = useState("");

  const handleRun = () => {
    setOutput(htmlCode);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Editor
        height="300px"
        defaultLanguage="html"
        defaultValue={htmlCode}
        theme="vs-dark"
        onChange={(value) => setHtmlCode(value)}
      />

      <button
        style={{ width: "100px", padding: "8px", alignSelf: "center" }}
        onClick={handleRun}
      >
        Run
      </button>

      <iframe
        title="HTML Output"
        sandbox="allow-scripts"
        srcDoc={output}
        style={{ width: "100%", height: "300px", border: "1px solid #ccc" }}
      />
    </div>
  );
};

export default HTMLEditord;
