// we cannot have tow dynamic rout in the same level
// like [userId]
//      [searchContact]
// cause it make conflict so we make new folder name searchContact
// then make inside it the dynamic route [query]

import User from "@models/User";
import { connectToDB } from "@mongodb";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const { query } = params;

    const searchedContacts = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    return new Response(JSON.stringify(searchedContacts, { status: 200 }));
  } catch (error) {
    return new Response("Failed to search contact", { status: 500 });
  }
};
