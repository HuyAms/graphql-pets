import { Resolvers } from './__generated__/graphql';

export const resolvers: Resolvers =  {
    Query: {
        pets: async (_, _input, {prisma}) => {
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
}

