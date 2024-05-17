import User from "@models/User";
import { connectToDB } from "@mongodb";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    // cause we use manulay we need CredentialsProvider, but we can use google provider and github
    CredentialsProvider({
      name: "Credential",
      //   credentials is the info from login form
      async authorize(credentials, req) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Invalid email or password");
        }
        await connectToDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user?.password) {
          throw new Error("Invalid email or password");
        }
        const isMatch = await compare(credentials.password, user.password);

        if (!isMatch) {
          throw new Error("Invalid email or password");
        }
        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // callbacks use it to edit the session after signIn will call it
  callbacks: {
    async session({ session }) {
      const mongodbUser = await User.findOne({ email: session.user.email });
      // bellow line to add the id without _
      session.user.id = mongodbUser._id.toString();
      // bellow to combine the info in session and mongo
      // so when user online we have complete info
      session.user = { ...session.user, ...mongodbUser._doc };
      

      return session;
    },
  },
});

export { handler as GET, handler as POST };
