"use client";

import { useState, useEffect } from "react";
import useSession from "./useSession";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const fetchChannels = async (session) => {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=AIzaSyDQ8FIbwqPfJSu6lLt3x1eST8ovKIhhwRw",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
      },
    }
  );
  const data = await response.json();
  return data.items;
};

const fetchSubscriptions = async (session, channelId, nextToken) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&channelId=${channelId}&maxResults=50&pageToken=${nextToken}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
      },
    }
  );
  const data = await response.json();
  const { items, nextPageToken } = data;
  return { items, nextPageToken };
};

const fetchLatestUploads = async (session, channelId, date) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&publishedAfter=${date}&order=date`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
      },
    }
  );
  const data = await response.json();
  return data.items;
};

const useChannels = () => {
  const session = useSession();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    console.log("refreshData");
    setLoading(true);
    //#region getChannels
    const getChannels = async () => {
      const myChannels = await fetchChannels(session);
      if (!myChannels) return;
      return myChannels.map((channel) => {
        return {
          ...channel,
          subscriptions: [],
        };
      });
    };
    //#endregion

    //#region getSubscriptions
    const getSubscriptions = async (session, channelId) => {
      const subscriptions = [];
      let nextToken = "";

      do {
        const { items, nextPageToken } = await fetchSubscriptions(
          session,
          channelId,
          nextToken
        );
        subscriptions.push(...items);
        nextToken = nextPageToken;
      } while (nextToken);

      return subscriptions;
    };
    //#endregion

    //#region getLatestUploads
    const getLatestUploads = async (session, channelId) => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const latestUploads = await fetchLatestUploads(
        session,
        channelId,
        date.toISOString()
      );
      return latestUploads;
    };
    //#endregion

    //#region getData
    const getData = async () => {
      // Get Channels
      if (!session || !session.provider_token) return;
      const myChannels = await getChannels();

      // Get Channels with Subscriptions
      if (!myChannels) return;
      const myChannelsWithSubscriptions = await Promise.all(
        myChannels.map(async (channel) => {
          const subscriptions = await getSubscriptions(session, channel.id);
          return {
            ...channel,
            subscriptions,
          };
        })
      );

      // Get Channels with Subscriptions and Latest Uploads
      if (!myChannelsWithSubscriptions) return;

      const myChannelsWithSubscriptionsAndLatestUploads = await Promise.all(
        myChannelsWithSubscriptions.map(async (channel, index) => {
          // Fetch latest uploads only for the first 5 channels
          if (index < 5) {
            channel.subscriptions = await Promise.all(
              channel.subscriptions.map(async (subscription) => {
                /* const latestUploads = await getLatestUploads(
                  session,
                  subscription.snippet.resourceId.channelId
                ); */
                return {
                  ...subscription,
                  /* latestUploads, */
                };
              })
            );
          }
          return channel;
        })
      );

      console.log(
        "myChannelsWithSubscriptionsAndLatestUploads",
        myChannelsWithSubscriptionsAndLatestUploads
      );

      return myChannelsWithSubscriptions;
    };
    //#endregion

    const myYoutubeData = await getData();
    if (!myYoutubeData) return;

    console.log("myYoutubeData", myYoutubeData);
    setChannels(myYoutubeData);

    const supabase = createClientComponentClient();

    const { data, error } = await supabase
      .from("youtube_data")
      .upsert([{ user_id: session.user.id, api_data: myYoutubeData }])
      .select();

    setLoading(false);
  };

  useEffect(() => {
    console.log("session: ", JSON.stringify(session));
    if (!session || !session.user) return;
    const getDataFromSupabase = async () => {
      setLoading(true);
      console.log("now getting data from supabase");
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("youtube_data")
        .select()
        .eq("user_id", session.user.id);

      console.log("data", data);
      if (data && data.length > 0) {
        setChannels(data[0].api_data);
        setLoading(false);
      } else {
        await refreshData();
      }
    };
    getDataFromSupabase();
  }, [session]);
  return { channels, activeChannel, refreshData, setActiveChannel, loading };
};

export default useChannels;
