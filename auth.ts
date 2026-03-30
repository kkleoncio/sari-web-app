import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          await connectToDatabase();

          const email = String(credentials?.email || "").trim().toLowerCase();
          const password = String(credentials?.password || "");

          if (!email || !password) return null;

          const user = await User.findOne({ email });
          if (!user) return null;

          // block credentials login if this is a Google-only account
          if (!user.password) return null;

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) return null;

          return {
            id: String(user._id),
            email: user.email,
            name:
              [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
              user.firstName ||
              "SARI User",
            firstName: user.firstName || "",
            role: user.role || "user",
            image: user.image || null,
          };
        } catch (error) {
          console.error("Credentials authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        await connectToDatabase();

        if (account?.provider === "google") {
          const email = user.email?.trim().toLowerCase();
          if (!email) return false;

          const existingUser = await User.findOne({ email });

          if (!existingUser) {
            const fullName = (user.name || "").trim();
            const parts = fullName.split(/\s+/).filter(Boolean);

            const firstName = parts[0] || "Google";
            const lastName = parts.slice(1).join(" ") || "User";

            await User.create({
              firstName,
              lastName,
              email,
              password: null,
              role: "user",
              authProvider: "google",
              googleId: account.providerAccountId,
              image: user.image || null,
            });
          } else {
            const updates: Record<string, unknown> = {};

            if (!existingUser.googleId && account.providerAccountId) {
              updates.googleId = account.providerAccountId;
            }

            if (!existingUser.image && user.image) {
              updates.image = user.image;
            }

            if (!existingUser.authProvider) {
              updates.authProvider = existingUser.password
                ? "credentials"
                : "google";
            }

            if (Object.keys(updates).length > 0) {
              await User.updateOne({ _id: existingUser._id }, { $set: updates });
            }
          }
        }

        return true;
      } catch (error) {
        console.error("Auth signIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      try {
        if (user?.email) {
          await connectToDatabase();

          const dbUser = await User.findOne({
            email: String(user.email).trim().toLowerCase(),
          });

          if (dbUser) {
            token.userId = String(dbUser._id);
            token.role = dbUser.role || "user";
            token.firstName = dbUser.firstName || "";
            token.picture = dbUser.image || token.picture;
          }
        }

        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId || "");
        session.user.role = String(token.role || "user");
        session.user.firstName = String(token.firstName || "");
        session.user.image = token.picture ? String(token.picture) : null;
      }

      return session;
    },
  },
});