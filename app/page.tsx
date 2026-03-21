"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Login from "./Login";
import Header from "./Header";
import { Document, Packer, Paragraph } from "docx";

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setUser(data.session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🔥 Fetch transcripts AFTER user is available
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/transcripts/${user.id}`
        );

        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        alert("Error loading history");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // ✅ Copy
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  // ✅ TXT Download
  const downloadTxt = (text, id) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${id}.txt`;
    a.click();
  };

  // ✅ DOCX Download
  const downloadDocx = async (text, id) => {
    const { saveAs } = await import("file-saver");

    const doc = new Document({
      sections: [
        {
          children: [new Paragraph(text)],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `transcript-${id}.docx`);
  };

  // ⏳ Loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading history...</p>
      </main>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <Login />
      </main>
    );
  }

  // ✅ Show history
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />

      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">📜 History</h2>

        {data.length === 0 ? (
          <p className="text-gray-500">No transcripts found.</p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                <p className="mb-3 text-gray-800">{item.text}</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCopy(item.text)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() => downloadTxt(item.text, item.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    TXT
                  </button>

                  <button
                    onClick={() => downloadDocx(item.text, item.id)}
                    className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                  >
                    DOCX
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}