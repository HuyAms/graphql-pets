import { QueryResolvers } from '../__generated__/graphql';

const queries: QueryResolvers = {
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
}

export default queries;