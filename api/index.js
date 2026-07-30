import "dotenv/config";
import express from "express";
import cors from "cors";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { authHandler } from "../src/auth/auth.js";
import { typeDefs } from "../src/graphql/typeDefs.js";
import { resolvers } from "../src/graphql/resolvers.js";
import { buildContext } from "../src/context/index.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.set("trust proxy", true);


app.use("/auth", authHandler);

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
});

await apollo.start();

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(apollo, {
    context: buildContext,
  })
);

app.get("/", (req, res) => {
  res.send("Devsynq Backend is running 🚀");
});

export default app;
