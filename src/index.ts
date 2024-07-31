import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import {resolvers} from './resolvers'

const typeDefs = readFileSync('./src/schema.graphql', { encoding: 'utf-8' });

const prisma = new PrismaClient()

export interface ApolloServerContext {
  prisma: typeof prisma;
}

const server = new ApolloServer<ApolloServerContext>({
    typeDefs,
    resolvers
  });


  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      return {
        prisma,
      };
    }
  });
  
  console.log(`🚀  Server ready at: ${url}`);