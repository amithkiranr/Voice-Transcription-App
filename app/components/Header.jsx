"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* App Title */}
      <h1 className="text-xl font-bold">
        🎤 Voice Transcription App
      </h1>

      {/* Navigation */}
      <nav className="flex gap-4">
        <Link
          href="/"
          aria-label="Go to Recorder"
          className={`px-3 py-1 rounded transition ${
            pathname === "/"
              ? "bg-white text-blue-600"
              : "hover:bg-blue-500"
          }`}
        >
          Recorder
        </Link>

        <Link
          href="/history"
          aria-label="Go to History"
          className={`px-3 py-1 rounded transition ${
            pathname === "/history"
              ? "bg-white text-blue-600"
              : "hover:bg-blue-500"
          }`}
        >
          History
        </Link>
      </nav>
    </header>
  );
}

export default Header;