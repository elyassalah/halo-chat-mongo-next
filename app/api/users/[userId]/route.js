import Chat from "@models/Chat";
import Message from "@models/Message";
import User from "@models/User";
import { connectToDB } from "@mongodb";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();
    const { userId } = params;
    const allChat = await Chat.find({ members: userId })
      .sort({
        // -1 desceding
        lastMessageAt: -1,
      })
      .populate({
        // get all data of members from user model that mean populate
        path: "members",
        model: User,
      })
      .populate({
        path: "messages",
        model: Message,
        populate: {
          path: "sender seenBy",
          model: User,
        },
      })
      .exec();
    // exec() to execute the query

    return new Response(JSON.stringify(allChat), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to get all chats of current user", {
      status: 500,
    });
  }
};
