import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect the entire dashboard
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
