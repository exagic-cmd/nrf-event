import { useEffect, useState } from "react";
import Pusher from "pusher-js";

const usePusher = (userId: string | null) => {
  console.log("🔥 usePusher hook called with userId:", userId); // <- log here

  const [socketId, setSocketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string | null>(null);
  const [suggestedActivity, setSuggestedActivity] = useState<any[] | null>(null);

  useEffect(() => {
    console.log("🧩 useEffect in usePusher triggered with userId:", userId);
    if (!userId) return;

    const pusher = new Pusher("ff15537559a385b08cad", {
      cluster: "ap1",
    });

    const channel = pusher.subscribe(`chat-${userId}`);

    pusher.connection.bind("connected", () => {
      setSocketId(pusher.connection.socket_id);
    });

    channel.bind("new-message", (data: any) => {
      setNewMessage(data.message);
      setSuggestedActivity(data.suggestedActivity || null);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId]);

  return { socketId, newMessage, suggestedActivity };
};


export default usePusher;
