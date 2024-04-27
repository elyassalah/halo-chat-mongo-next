import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    // define the page to redirect to it when user no login
    // name i named it signIn and then put its path
    signIn: "/",
  },
});

export const config = {
  // in the matcher put all the link that we will protect when the user no logged in
  // this pages in the root , and :path* means every thing inside it also

  matcher: ["/chats/:path*", "/contacts/:path*", "/profile/:path*"],
};
