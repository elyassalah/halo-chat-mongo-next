import User from "@models/User";
import { connectToDB } from "@mongodb";
import Chat from "@models/Chat";
import { pusherServer } from "@lib/pusher";
export const POST = async (req, res) => {
  try {
    await connectToDB();

    const body = await req.json();

    const { currentUserId, members, isGroup, name, groupPhoto } = body;

    //  Define "query" to find the chat

    const query = isGroup
      ? { isGroup, name, groupPhoto, members: [currentUserId, ...members] }
      : { members: { $all: [currentUserId, ...members], $size: 2 } };

    let chat = await Chat.findOne(query);

    // if chat not exist will create a new one and if exist will return it
    if (!chat) {
      // to create a chat and save it in db  using the prev query
      chat = await new Chat(
        isGroup ? query : { members: [currentUserId, ...members] }
      );

      await chat.save();
      const updateAllMembers = chat.members.map(async (memberId) => {
        await User.findByIdAndUpdate(
          memberId,
          {
            $addToSet: { chats: chat._id },
          },
          {
            new: true,
          }
        );
      });
      Promise.all(updateAllMembers);
      /* Trigger a Pusher event for each member to notify a new chat created only when chat created here in the if statement*/
      const newChat = await Chat.findById(chat._id)
        .populate({
          path: "members",
          model: User,
        })
        .exec();
      chat.members.map((member) => {
        pusherServer.trigger(member._id.toString(), "new-chat", newChat);
      });
    }

    return new Response(JSON.stringify(chat), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to create a new chat", { status: 500 });
  }
};
