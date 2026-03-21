"use client";

import { useState } from "react";

function TranscriptPanel({ transcript }) {
  const [copied, setCopied] = useState(false);

  // ✅ Copy
  const handleCopy = async () => {
    if (!transcript) return;

    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Failed to copy!");
    }
  };

  // ✅ Download TXT
  const downloadTxt = () => {
    if (!transcript) return;

    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();

    // ✅ Free memory
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl mt-6">
      <h2 className="text-xl font-semibold mb-4">📄 Transcript</h2>

      {/* Transcript Box */}
      <div className="border p-4 min-h-[150px] max-h-[300px] overflow-y-auto rounded bg-gray-50 text-gray-800">
        {transcript ? (
          <p className="whitespace-pre-wrap">{transcript}</p>
        ) : (
          <p className="text-gray-400">
            Transcript will appear here...
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleCopy}
          disabled={!transcript}
          aria-label="Copy transcript"
          className={`px-3 py-1 rounded text-white transition ${
            transcript
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={downloadTxt}
          disabled={!transcript}
          aria-label="Download transcript"
          className={`px-3 py-1 rounded text-white transition ${
            transcript
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Download TXT
        </button>
      </div>
    </div>
  );
}

export default TranscriptPanel;