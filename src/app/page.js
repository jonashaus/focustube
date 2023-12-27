"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import useSession from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const supabase = createClientComponentClient();

const signInWithOAuth = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube",
      ],
    },
  });
};

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && session.user) {
      router.push("/channel");
    }
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        FocusTube
      </h1>
      <p className="text-xl text-muted-foreground">
        Sign in with your Google account to continue.
      </p>
      <Button onClick={signInWithOAuth}>Sign in</Button>
    </div>
  );
}
