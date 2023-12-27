"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const useSession = () => {
  const supabase = createClientComponentClient();

  const [session, setSession] = useState({});

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      (event, changedSession) => {
        console.log("event", event);
        setSession(changedSession);

        if (event === "SIGNED_OUT") {
          setSession({});
        }
      }
    );

    // Return cleanup function from useEffect
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return session;
};

export default useSession;
