"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Loader from "./Loader";
import ChatBox from "./ChatBox";
import { pusherClient } from "@lib/pusher";

const ChatList = ({ currentChatId }) => {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getChat = async () => {
    try {
      const res = await fetch(
        search !== ""
          ? `/api/users/${currentUser._id}/searchChat/${search}`
          : `/api/users/${currentUser._id}`
      );
      const data = await res.json();
      setChats(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getChat();
    }
  }, [currentUser, search]);

  useEffect(() => {
    if (currentUser) {
      // will subscribe with all channel have this id , so we can make more that one subscribe
      //with only one channe , like we do here , the last message and the new chat with same channel
      // and we trigger more that one event to it easy
      pusherClient.subscribe(currentUser._id);
      const handleChatUpdate = async (updatedChat) => {
        setChats((allChats) =>
          allChats.map((chat) => {
            // we mapped it cause it maype have more than one message for more that one chat
            if (chat._id === updatedChat.id) {
              // to update specefic chat that come in updatedChat
              // like update chat 1 and chat 2 and chat 3 no and like this
              // to update just the chat that have update
              return {
                ...chat,
                messages: updatedChat.messages,
                // spread the messages and add to it the message comes from update
              };
            } else {
              return chat;
            }
          })
        );
      };

      const handleNewChat = async (newChat) => {
        // push the new chat to the all prev chat
        setChats((allChats) => [...allChats, newChat]);
      };
      pusherClient.bind("update-chat", handleChatUpdate);
      pusherClient.bind("new-chat", handleNewChat);

      return () => {
        pusherClient.unsubscribe(currentUser._id);
        pusherClient.unbind("update-chat", handleChatUpdate);
        pusherClient.unbind("new-chat", handleNewChat);

      };
    }
  }, [currentUser]);

  return loading ? (
    <Loader />
  ) : (
    <div className="chat-list">
      <input
        type="text"
        placeholder="Search chat..."
        className="input-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="chats">
        {chats?.map((chat, index) => (
          <ChatBox
            chat={chat}
            key={index}
            currentUser={currentUser}
            currentChatId={currentChatId}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
