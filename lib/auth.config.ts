import type { NextAuthConfig } from "next-auth";

// Shared by the proxy and the full auth setup; no database access here.
export const authConfig = {
  pages: { signIn: "/signin" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
