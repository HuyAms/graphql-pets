import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import resolvers from './resolvers'
import { UserDataSource } from './datasources/user';
import { PetDataSource } from './datasources/pet';

const typeDefs = readFileSync('./src/schema.graphql', { encoding: 'utf-8' });

export interface ApolloServerContext {
  dataSources: {
    user: UserDataSource;
    pet: PetDataSource
  };
}

const server = new ApolloServer<ApolloServerContext>({
    typeDefs,
    resolvers
  });


  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {

      const prisma = new PrismaClient()

      return {
        dataSources: {
          user: new UserDataSource(prisma),
          pet: new PetDataSource(prisma)
        },
      };
    }
});
  
console.log(`🚀  Server ready at: ${url}`);