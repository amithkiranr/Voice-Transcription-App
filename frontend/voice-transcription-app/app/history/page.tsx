"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Login from "./Login";
import RecorderPanel from "./RecorderPanel";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // ✅ Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth changed:", session);

      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // ✅ Get initial session
    supabase.auth.getSession().then(({ data }) => {
      console.log("Initial session:", data.session);

      if (isMounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // ❌ Not logged in → show login
  if (!user) {
    return <Login />;
  }

  // ✅ Logged in → show main app
  return <RecorderPanel user={user} />;
}