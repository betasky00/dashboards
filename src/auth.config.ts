import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no DB, no Node APIs) so it can run inside middleware.
// The Credentials provider with its DB-touching logic lives in src/lib/auth.ts.
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; role?: string; username?: string };
        token.uid = u.id;
        token.role = u.role ?? "member";
        token.username = u.username;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.uid) session.user.id = token.uid as string;
        session.user.role = (token.role as string) ?? "member";
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
