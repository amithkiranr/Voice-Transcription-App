"use client";

import { useState, useRef } from "react";

function RecorderPanel({ user }) {
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // ▶ START RECORDING
  const handleStart = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          setUploading(true);

          const blob = new Blob(chunksRef.current, {
            type: "audio/webm",
          });

          chunksRef.current = [];

          const formData = new FormData();
          formData.append("file", blob, "recording.webm");

          // ✅ REAL USER ID
          formData.append("user_id", user.id);

          const res = await fetch(
            "http://127.0.0.1:8000/transcribe",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!res.ok) {
            throw new Error("Upload failed");
          }

          const result = await res.json();
          console.log("Transcript:", result);

          alert("✅ Audio uploaded & saved!");

        } catch (err) {
          console.error("Upload error:", err);
          alert("❌ Failed to upload audio");
        } finally {
          setUploading(false);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      setIsRecording(true);

    } catch (err) {
      console.error("Mic error:", err);
      alert("🎤 Microphone access denied");
    }
  };

  // ⏹ STOP RECORDING
  const handleStop = () => {
    if (!isRecording) return;

    mediaRecorderRef.current?.stop();

    // ✅ STOP MIC STREAM (IMPORTANT)
    streamRef.current?.getTracks().forEach((track) => track.stop());

    setIsRecording(false);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl text-center max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">🎤 Recorder</h2>

      {/* 👤 User Info */}
      <p className="text-sm text-gray-500 mb-2">
        Logged in as: {user?.email}
      </p>

      {/* 🔴 Recording Indicator */}
      {isRecording && (
        <p className="text-red-500 mb-3 animate-pulse">
          ● Recording...
        </p>
      )}

      {/* ⏳ Uploading Indicator */}
      {uploading && (
        <p className="text-blue-500 mb-3">
          ⏳ Uploading audio...
        </p>
      )}

      <div className="flex justify-center gap-4">
        {/* ▶ Start */}
        <button
          onClick={handleStart}
          disabled={isRecording || uploading}
          className={`px-4 py-2 rounded text-white transition ${
            isRecording || uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Start
        </button>

        {/* ⏹ Stop */}
        <button
          onClick={handleStop}
          disabled={!isRecording || uploading}
          className={`px-4 py-2 rounded text-white transition ${
            !isRecording || uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          Stop
        </button>
      </div>
    </div>
  );
}

export default RecorderPanel;