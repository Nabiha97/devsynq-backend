import { ExpressAuth } from "@auth/express";
import GitHub from "@auth/express/providers/github";
import Google from "@auth/express/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../context/prisma.js";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  basePath: "/auth",
  trustHost: true,
  baseUrl: process.env.AUTH_URL,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "login",
          scope: "read:user user:email",
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `__Host-authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: "__Secure-authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("SIGN IN CALLBACK:", user?.email, account?.provider);
      return true;
    },

async redirect({ url, baseUrl }) {
  return url.startsWith(process.env.FRONTEND_URL)
    ? url
    : `${process.env.FRONTEND_URL}/setup`;
},
  },

  secret: process.env.AUTH_SECRET,
};

export const authHandler = ExpressAuth(authConfig);