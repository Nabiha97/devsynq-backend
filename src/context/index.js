import { getSession } from "@auth/express";
import { authConfig } from "../auth/auth.js";
import { prisma } from "./prisma.js";

export async function buildContext({ req }) {
  const session = await getSession(req, authConfig);

  if (!session?.user?.email) {
    return { prisma, user: null };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return { prisma, user };
}