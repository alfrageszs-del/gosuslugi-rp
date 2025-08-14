import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { Faction } from "@prisma/client";

type AppToken = JWT & { roles?: string[]; faction?: string | null; };
type AuthUser = { id: string; name: string; roles: string[]; faction: Faction | null; };
type AppSession = Session & { userId?: string; roles?: string[]; faction?: string | null; };

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Логин",
      credentials: { nickname: { label: "Nickname", type: "text" }, password: { label: "Пароль", type: "password" } },
      async authorize(creds): Promise<AuthUser | null> {
        if (!creds?.nickname || !creds?.password) return null;
        const user = await prisma.user.findUnique({ where: { nickname: creds.nickname }, include: { roles: true } });
        if (!user) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.nickname, roles: user.roles.map(r => r.role), faction: user.faction };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as AppToken;
      if (user) {
        const u = user as AuthUser;
        t.roles = u.roles;
        t.faction = u.faction ?? null;
        return t;
      }
      if (t.sub) {
        const dbUser = await prisma.user.findUnique({ where: { id: t.sub }, include: { roles: true } });
        if (dbUser) {
          t.roles = dbUser.roles.map(r => r.role);
          t.faction = dbUser.faction ?? null;
        }
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as AppToken;
      const s = session as AppSession;
      s.userId = t.sub;
      s.roles = t.roles ?? [];
      s.faction = t.faction ?? null;
      return s;
    },
  },
});
