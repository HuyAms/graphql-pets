import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync } from "fs";
import { PrismaClient, User } from "@prisma/client";
import resolvers from "./resolvers";
import { UserDataSource } from "./datasources/user";
import { PetDataSource } from "./datasources/pet";
import { getUserFromToken } from "./utils/auth";
import { UserModel } from "./models";

const typeDefs = readFileSync("./src/schema.graphql", { encoding: "utf-8" });

export interface ApolloServerContext {
  dataSources: {
    user: UserDataSource;
    pet: PetDataSource;
  };
  user: UserModel | null;
}

const server = new ApolloServer<ApolloServerContext>({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const prisma = new PrismaClient();

    // // check auth token from the request headers
    const token = req.headers.authorization;
    const user = await getUserFromToken(prisma, token);

    return {
      dataSources: {
        user: new UserDataSource(prisma),
        pet: new PetDataSource(prisma),
      },
      user: user,
    };
  },
});

console.log(`🚀  Server ready at: ${url}`);
