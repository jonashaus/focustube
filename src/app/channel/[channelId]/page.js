"use client";
import { useParams, useRouter } from "next/navigation";
import useChannels from "@/hooks/useChannels";
import { useEffect } from "react";
import Image from "next/image";

const Channel = () => {
  const { channelId } = useParams();
  const { channels, activeChannel, setActiveChannel } = useChannels();

  useEffect(() => {
    if (!activeChannel) {
      setActiveChannel(channels.find((channel) => channel.id === channelId));
    }
  }, [channels, activeChannel]);

  //TODO: Here's a conflict: The "active channel" is set in both the activeChannel state and the URL. This may lead to conflicts.

  return (
    <div>
      {activeChannel && (
        <>
          <div className="flex mx-10">
            <ul className="space-y-2">
              <li>
                <p className="text-lg font-semibold">Your Subscriptions</p>
              </li>
              {activeChannel.subscriptions.map((subscription) => {
                return (
                  <li
                    key={subscription.id}
                    className="flex flex-col p-4 bg-secondary rounded-lg"
                  >
                    <div className="flex z-20">
                      <Image
                        className="rounded-full mr-2"
                        src={subscription.snippet.thumbnails.default.url}
                        alt={subscription.snippet.title}
                        width="24"
                        height="24"
                      />
                      <p>{subscription.snippet.title}</p>
                    </div>
                    {subscription.latestUploads &&
                      subscription.latestUploads.length > 0 && (
                        <ul className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4">
                          {subscription.latestUploads.map((upload) => {
                            return (
                              <li
                                key={upload.id.videoId}
                                className="flex flex-col -mt-[3.5vh] -mb-[1.5vh]"
                              >
                                <div className="bg-secondary h-[4vh] z-10" />
                                <Image
                                  className="-my-[4vh] grayscale hover:grayscale-0 transition-all duration-500"
                                  /* className="-my-[4vh] contrast-0 hover:contrast-100 transition-all duration-500" */
                                  /* className="-my-[4vh] saturate-50 hover:saturate-100 transition-all duration-500" */
                                  src={upload.snippet.thumbnails.high.url}
                                  alt={subscription.snippet.title}
                                  width="480"
                                  height="360"
                                />
                                <div className="" />
                                <p className="text-sm truncate bg-secondary h-[4vh] z-10">
                                  {upload.snippet.title}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Channel;
