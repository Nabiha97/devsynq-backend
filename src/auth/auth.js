import { ExpressAuth } from "@auth/express";
import GitHub from "@auth/express/providers/github";
import Google from "@auth/express/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../context/prisma.js";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  basePath: "/auth",
  trustHost: true,
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
//   cookies: {
//     pkceCodeVerifier: {
//       name: "authjs.pkce.code_verifier",
//       options: {
//         httpOnly: true,
//         sameSite: "lax",
//         path: "/",
//         secure: false, // set to true only once you deploy over HTTPS
//       },
//     },
//   },
// }
callbacks: {
  async signIn({ user, account }) {
    console.log("SIGN IN CALLBACK:", user?.email, account?.provider);
    return true;
  },

async redirect({ url, baseUrl }) {
  return `${process.env.FRONTEND_URL}/setup`;
},
},

  
  secret: process.env.AUTH_SECRET,
};

export const authHandler = ExpressAuth(authConfig);