"use client";
import ChatDetails from "@components/ChatDetails";
import ChatList from "@components/ChatList";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
var ls = require("local-storage");

const ChatPage = () => {
  const { chatId } = useParams();
  const { data: session } = useSession();
  const currentUser = session?.user || ls.get("user");

  const seenMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUserId: currentUser._id,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (chatId && currentUser) {
      seenMessages();
    }
  }, [currentUser, chatId]);
  return (
    <div className="main-container">
      <div className="w-1/3 max-lg:hidden">
        {/* send the current chat it to change the background color */}
        <ChatList currentChatId={chatId} />
      </div>
      <div className="w-2/3 max-lg:w-full">
        <ChatDetails chatId={chatId} />{" "}
      </div>
    </div>
  );
};

export default ChatPage;
