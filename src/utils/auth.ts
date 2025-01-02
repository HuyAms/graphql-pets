import { PrismaClient, User } from "@prisma/client";
import { ApolloServerContext } from "..";
import { UserModel } from "../models";
import { GraphQLError } from "graphql";

export async function getUserFromToken(
  prisma: PrismaClient,
  token: string
): Promise<UserModel | null> {
  const VALID_TOKEN = "abc";

  // We'd better implemnet any authenticated strategoy here such as JWT, etc.
  // then we decode the token and get the user from it
  if (token != VALID_TOKEN) {
    return null;
  }

  // now we just return a random user here!
  const user = await prisma.user.findFirst();

  return user;
}

export const requireAuthentication = (context: ApolloServerContext) => {
  if (!context.user) {
    throw new GraphQLError("not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
      },
    });
  }
};
