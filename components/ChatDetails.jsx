"use client";
import { pusherClient } from "@lib/pusher";
import { AddPhotoAlternate } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { CldUploadButton } from "next-cloudinary";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import MessageBox from "./MessageBox";

const ChatDetails = ({ chatId }) => {
  const { data: session } = useSession();
  const currentUser = session?.user || JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState({});
  const [otherMembers, setOtherMembers] = useState([]);
  const [text, setText] = useState("");

  const getChatDetails = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setChat(data);
      setLoading(false);
      setOtherMembers(
        data.members.filter((member) => member?._id !== currentUser?._id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser && chatId) {
      getChatDetails();
    }
  }, [currentUser, chatId]);

  const sendText = async () => {
    try {
      if (text !== "") {
        // console.log(text);
        // console.log(currentUser._id);
        // console.log(chatId);
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId,
            currentUserId: currentUser?._id,
            text,
          }),
        });
        if (response.ok) {
          setText("");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendPhoto = async (result) => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          currentUserId: currentUser?._id,
          photo: result?.info?.secure_url,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    /* 
    in the front end first we should subscribe to the channel
    then we listen (using bind) to the event that comming from this chanel that we called it befor 
    and take what will return it be the newMessage but we handle it in outer function
    */
    pusherClient.subscribe(chatId);

    const handleMessage = async (newMessage) => {
      setChat((prevChat) => {
        /* we will have every thing in the prev chat
         then we will return the prev chat using destruc (spread the all data prev) ...
         and add(push) to it the new message that we recived it 
         */
        return {
          ...prevChat,
          messages: [...prevChat.messages, newMessage],
        };
      });
    };

    pusherClient.bind("new-message", handleMessage);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind("new-message", handleMessage);
    };
  }, [chatId]);
  // handle the auto scrolling down to the bottom when new message or wehen go to any chat details page
  // whenever chat messages chage so this use effect will work
  // so put it in the chat body to work
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat?.messages]);

  return loading ? (
    <Loader />
  ) : (
    <div className="pb-20">
      <div className="chat-details">
        <div className="chat-header">
          {chat?.isGroup ? (
            <>
              <Link href={`/chats/${chatId}/group-info`}>
                <img
                  src={chat?.groupPhoto || "/assets/group.png"}
                  alt="group-photo"
                  className="profilePhoto"
                />
              </Link>
              <div className="text">
                <p>
                  {chat?.name} &#160; &#183; &#160; {chat?.members.length}{" "}
                  Members
                </p>
              </div>
            </>
          ) : (
            <>
              <img
                src={otherMembers[0].profileImage || "/assets/person.jpg"}
                alt="profile-photo"
                className="profilePhoto"
              />
              <div className="text">
                <p>{otherMembers[0].username}</p>
              </div>
            </>
          )}
        </div>
        <div className="chat-body">
          {chat?.messages?.map((message, index) => (
            <MessageBox
              key={message._id}
              message={message}
              currentUser={currentUser}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="send-message">
          <div className="preper-message">
            <CldUploadButton
              options={{ maxFiles: 1 }}
              onUpload={sendPhoto}
              uploadPreset="u1lqgbbg"
            >
              <AddPhotoAlternate
                sx={{
                  fontSize: "35px",
                  color: "#737373",
                  cursor: "pointer",
                  "&:hover": { color: "red" },
                }}
              />
            </CldUploadButton>

            <input
              type="text"
              placeholder="Write a message..."
              className="input-field"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              required
            />
          </div>
          <div onClick={sendText}>
            <img src="/assets/send.jpg" alt="send" className="send-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;
