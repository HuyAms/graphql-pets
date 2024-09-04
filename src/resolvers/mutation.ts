import { MutationResolvers } from '../__generated__/graphql';

const mutations: MutationResolvers = {
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
};

export default mutations;