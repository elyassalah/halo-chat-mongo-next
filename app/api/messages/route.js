import { connectToDB } from "@mongodb";
import Message from "@models/Message";
import Chat from "@models/Chat";
import { pusherServer } from "@lib/pusher";
import User from "@models/User";

export const POST = async (req) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { chatId, currentUserId, text, photo } = body;

    const currentUser = await User.findById(currentUserId);
    const newMessage = await Message.create({
      chat: chatId,
      sender: currentUser /*currentUserId*/,
      text,
      photo,
      // you the sender send the message so you already seen it
      seenBy: currentUserId,
    });
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: newMessage._id },
        $set: { lastMessageAt: newMessage.createdAt },
      },
      { new: true }
    )
      .populate({
        path: "messages",
        model: Message,
        //   for each message we populated we also populate bellow
        populate: {
          path: "sender seenBy",
          model: User,
        },
      })
      .populate({
        path: "members",
        model: User,
      })
      .exec();

    //use real time with pusher
    /*
      the channel that we open it that can other user share it and connected to it
      first we push a trigger event for specific chat
      to the channel and it will be the chat id
      and then send the event name we make it, then send the return 
      that will be what return to the client and it the new message.
      , so when ever we call this route the pusher will work
      -- there is problem that the new message its sender will be just the id
      without its info so we fixed it above bellow the body by find the user then 
       on create the new message we send the whole user not just its id
       */

    await pusherServer.trigger(chatId, "new-message", newMessage);

    /* Trigger a pusher event for each member of the chat about the chat update the latest message
    to take all user the new update of chat 
    note: only the user have the channel can share info and listen 
    channel should to be string and here the member id is object not string so convert it

    also here we no have to return all the updated chat we can return only the chat id and the messages
    */

    const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];
    updatedChat.members.forEach(async (member) => {
      try {
        await pusherServer.trigger(
          member._id.toString(),
          "update-chat",
          // updatedChat
          {
            id: chatId,
            messages: [lastMessage],
          }
        );
      } catch (error) {
        // console.log(error);
        console.error(
          `Failed to trigger update-chat event`
        );
      }
    });
    return new Response(JSON.stringify(newMessage), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to create new message", { status: 500 });
  }
};
