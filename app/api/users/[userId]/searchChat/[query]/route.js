import Chat from "@models/Chat";
import User from "@models/User";
import { connectToDB } from "@mongodb";
import Message from "@models/Message";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    // const currentUserId = params.userId;
    // const query = params.query;
    const { userId, query } = params;
    //TODO: this only search of group make it also search signel chat member
    const searchedChat = await Chat.find({
      members: userId,
      name: { $regex: query, $options: "i" },
    })
      .populate({
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
    console.log(searchedChat);

    return new Response(JSON.stringify(searchedChat), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to search chat", { status: 500 });
  }
};
