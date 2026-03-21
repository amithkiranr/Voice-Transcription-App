"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuth = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      // 🔐 LOGIN
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // ✅ LOGIN SUCCESS
      if (!loginError) {
        setSuccessMsg("✅ Login successful!");

        // ⏳ Let user see message briefly
        setTimeout(() => {
          setSuccessMsg("");
        }, 1500);

        return; // ⚠️ Home page will auto-update via auth listener
      }

      // ❌ EMAIL NOT CONFIRMED
      if (loginError.message.includes("Email not confirmed")) {
        setErrorMsg("📧 Please verify your email before logging in.");
        return;
      }

      // ❌ USER NOT FOUND → SIGNUP
      if (
        loginError.message.includes("Invalid login credentials") ||
        loginError.message.includes("User not found")
      ) {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) {
          setErrorMsg("Signup failed: " + signupError.message);
        } else {
          setSuccessMsg(
            "🎉 Account created! Check your email to verify your account."
          );
        }

        return;
      }

      // ❌ OTHER ERRORS
      setErrorMsg(loginError.message);

    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">
          🔐 Login / Signup
        </h1>

        {/* 📧 Email */}
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* 🔑 Password */}
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* ❌ Error */}
        {errorMsg && (
          <p className="text-red-500 text-sm mb-2">{errorMsg}</p>
        )}

        {/* ✅ Success */}
        {successMsg && (
          <p className="text-green-500 text-sm mb-2">{successMsg}</p>
        )}

        {/* 🔘 Button */}
        <button
          onClick={handleAuth}
          disabled={loading}
          aria-label="Login or Signup"
          className={`w-full py-2 rounded text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}