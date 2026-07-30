import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { authHandler } from "./auth/auth.js";
import { buildContext } from "./context/index.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);




app.use("/auth", authHandler);

const apollo = new ApolloServer({ typeDefs, resolvers });
await apollo.start();

app.use(
  "/graphql",
  express.json(),
  expressMiddleware(apollo, { context: buildContext })
);
app.get("/", (req, res) => {
  res.send("Devsynq Backend is running 🚀");
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
  console.log(`Auth routes at   http://localhost:${PORT}/auth`);
});