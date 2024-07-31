import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

interface ApolloServerContext {
  prisma: typeof prisma;
}

const server = new ApolloServer<ApolloServerContext>({
    typeDefs,
    resolvers: {
      Query: {
          pets: async (_, {input}, {prisma}) => {
              const pets = await prisma.pet.findMany({
                select: {
                  id: true,
                  type: true,
                  name: true,
                  owner: true,
                  createdAt: true
                }
              })

              return pets
          },
          petsByType: async (_, {type}, {prisma}) => {

            const pets = await prisma.pet.findMany({
              where: {
                type
              },
              select: {
                id: true,
                type: true,
                name: true,
                owner: true,
                createdAt: true
              }
            })

            return pets
          }
      },
      Mutation: {
        addPet: (_, {input}, {prisma}) => {
            const {name, type} = input

            const createdPet = prisma.pet.create({
              data: {
                name,
                type
              }
            })

            return createdPet
        }
      },
      Pet: {
        img(pet) {
          return pet.type === 'DOG'
            ? 'https://placedog.net/300/300'
            : 'http://placekitten.com/300/300'
        }
      },
  },
  });


  const { url } = await startStandaloneServer<ApolloServerContext>(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      return {
        prisma,
      };
    }
  });
  
  console.log(`🚀  Server ready at: ${url}`);