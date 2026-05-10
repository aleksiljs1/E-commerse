import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { emailSchema } from "@/lib/email-validation";

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        autoLoginToken: { label: "Auto-login Token", type: "text" },
      },
      async authorize(credentials) {
        // Auto-login path — used after email verification link is clicked
        if (credentials?.autoLoginToken) {
          const user = await prisma.user.findFirst({
            where: {
              autoLoginToken: credentials.autoLoginToken as string,
              autoLoginExpiry: { gt: new Date() },
            },
          });
          if (!user) return null;

          await prisma.user.update({
            where: { id: user.id },
            data: { autoLoginToken: null, autoLoginExpiry: null },
          });

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        // Normal email + password path
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !user.password) return null;

        // Block unverified accounts — only those created after verification was introduced
        // (old accounts without a verificationToken are allowed through)
        if (!user.emailVerified && user.verificationToken !== null) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
