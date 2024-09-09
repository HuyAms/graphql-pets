import { Resolvers } from "../__generated__/graphql";
import Query from "./queries";
import Mutation from "./mutation";

const resolvers: Resolvers = { 
    Query, 
    Mutation,
    Pet: {
        async owner(pet, _, { prisma }) {

            const {owner} = await prisma.pet.findUnique({
                where: {
                    id: pet.id
                },
                select: {
                    owner: true
                }
            })

            return owner
        },
        img(pet) {
          return pet.type === 'DOG'
            ? 'https://placedog.net/300/300'
            : 'http://placekitten.com/300/300'
        }
    },
    User: {
        async pets(user, _, { prisma }) {
            const {pets} = await prisma.user.findUnique({
                where: {id: user.id},
                select: {pets: true}
            })

            return pets
        }
    }
};

export default resolvers;
