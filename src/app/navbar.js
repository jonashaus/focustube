"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import useSession from "@/hooks/useSession";
import useChannels from "@/hooks/useChannels";
import { Focus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const supabase = createClientComponentClient();

const Navbar = () => {
  const { channels, refreshData, loading } = useChannels();
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  if (channels.length == 0) return null;

  return (
    <>
      <nav className="mx-auto p-2 flex justify-between items-center bg-background transition-maxwidth duration-1000">
        <div className="flex items-center space-x-2">
          <Focus className="w-6 h-6" />
          <h1 className="scroll-m-20 text-xl font-semibold tracking-tight pr-8">
            FocusTube
          </h1>
          {channels && channels.length > 0 && (
            <Select defaultValue={channels[0].id}>
              <SelectTrigger className="w-[180px] rounded-full border-none bg-secondary">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Your Channels</SelectLabel>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <Link href={`/channel/${channel.id}`}>
                        {channel.snippet.title}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={refreshData}
            variant="secondary"
            className="rounded-full font-normal"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading && "animate-spin"}`}
            />
            Refresh Data
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
