"use client";
import useChannels from "@/hooks/useChannels";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Channel = () => {
  const router = useRouter();
  const { channels, activeChannel, setActiveChannel } = useChannels();

  useEffect(() => {
    console.log("activeChannel", activeChannel);
    if (activeChannel) {
      console.log("now pushing");
      router.push(`/channel/${activeChannel.id}`);
    } else if (channels.length > 0) {
      setActiveChannel(channels[0]);
    }
  }, [channels, activeChannel]);
};

export default Channel;
