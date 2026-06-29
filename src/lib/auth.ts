import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { OWNER_ID } from "@/lib/owner";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!username || !password) return null;

        // --- Admin bootstrap from env (reuses the stable owner id so existing
        //     businesses/connected accounts stay linked to the admin) ---
        const adminUser = process.env.ADMIN_USERNAME || "admin";
        const adminPass = process.env.ADMIN_PASSWORD || process.env.APP_PASSWORD;
        if (adminPass && username === adminUser && password === adminPass) {
          const u = await db.user.upsert({
            where: { id: OWNER_ID },
            update: { username: adminUser, role: "admin" },
            create: { id: OWNER_ID, username: adminUser, role: "admin", name: "Admin" },
          });
          return { id: u.id, name: u.name ?? "Admin", role: "admin", username: adminUser };
        }

        // --- Team members stored in the database ---
        const user = await db.user.findUnique({ where: { username } });
        if (!user || !verifyPassword(password, user.passwordHash)) return null;
        return {
          id: user.id,
          name: user.name ?? user.username ?? "Member",
          role: user.role,
          username: user.username ?? undefined,
        };
      },
    }),
  ],
});
