import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
  },

  providers: [
    Credentials({
    async authorize(credentials) {
      await connectToDatabase();

      const email = String(credentials?.email || "").trim().toLowerCase();
      const password = String(credentials?.password || "");

      console.log("🔐 LOGIN ATTEMPT:", email);

      if (!email || !password) {
        console.log("❌ Missing email or password");
        return null;
      }

      const user = await User.findOne({ email }).lean();
      console.log("👤 FOUND USER:", user);

      if (!user) {
        console.log("❌ User not found");
        return null;
      }

      if (!user.password) {
        console.log("❌ User has no password (maybe Google account)");
        return null;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log("🔑 PASSWORD MATCH:", isMatch);

      if (!isMatch) {
        console.log("❌ Password incorrect");
        return null;
      }

      console.log("✅ LOGIN SUCCESS:", {
        id: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        id: String(user._id),
        email: user.email,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        firstName: user.firstName ?? "",
        role: user.role ?? "user",
        image: user.image ?? null,
      };
    },
  }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectToDatabase();

      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();

        if (!email) return false;

        let existingUser = await User.findOne({ email });

        if (!existingUser) {
          const parts = (user.name || "").trim().split(" ");
          const firstName = parts[0] || "SARI";
          const lastName = parts.slice(1).join(" ") || "Student";

          existingUser = await User.create({
            firstName,
            lastName,
            email,
            authProvider: "google",
            role: "user",
          });
        }

        user.id = String(existingUser._id);
        user.role = existingUser.role ?? "user";
        user.firstName = existingUser.firstName ?? "";
        user.image = existingUser.image ?? user.image ?? null;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";
        token.firstName = user.firstName ?? "";
        token.picture = user.image ?? null;
      }

      console.log("🪙 JWT CALLBACK:", { token, user });

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = String(token.role ?? "user");
        session.user.firstName = String(token.firstName ?? "");
        session.user.image = token.picture ?? null;
      }

      console.log("📦 SESSION CALLBACK:", { session, token });

      return session;
    },
  },
});