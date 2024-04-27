import User from "@models/User";
import { connectToDB } from "@mongodb";

export const POST = async (req, { params }) => {
  try {
    await connectToDB();
    // bellow use the same name in the dynamic route [userId]
    // if wanna to change it make {userId:currentUserId}
    const { userId } = params;

    const body = await req.json();

    const { username, profileImage } = body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        profileImage,
      },
      {
        // By default, findOneAndUpdate() returns the document as it was before update was applied. If you set new: true,
        // findOneAndUpdate() will instead give you the object after update was applied.
        new: true,
      }
    );
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response("Failed to update user", { status: 500 });
  }
};
