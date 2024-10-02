import { GraphQLError } from "graphql";
import { Resolvers } from "./__generated__/graphql";
import { ApolloServerErrorCode } from '@apollo/server/errors';

const resolvers: Resolvers = { 
    Query: {
        user: async (_, input, {dataSources}) => {
            const {id} = input
        
            const user = await dataSources.user.getUser(id)

            if (!user) {

                throw new GraphQLError("User not found", {
                    extensions: { 
                        code: ApolloServerErrorCode.BAD_USER_INPUT ,
                    },
                  });            
            }
        
            return user
          },
          pets: async (_, _input, {dataSources}) => {
        
              const pets = await dataSources.pet.getPets()
        
              return pets
          },
          petsByType: async (_, {type}, {dataSources}) => {
        
            const pets = await dataSources.pet.getPetByType(type)
        
            return pets
          }
    }, 
    Mutation: {
        addPet: async(_, {input}, {dataSources}) => {
            const {name, type, ownerId} = input

            const user = await dataSources.user.getUser(ownerId)

            if (!user) {
                return {
                    code: 400,
                    success: false,
                    message: `User not found with id: ${ownerId}`,
                    pet: null
                }
            }
    
            const createdPet = await dataSources.pet.addPet({name, type, ownerId})
    
            return {
                code: 200,
                success: true,
                message: 'Pet created successfully',
                pet: createdPet
            }
        }
    },
    Pet: {
        async owner(pet, _, { dataSources }) {

            const owner = await dataSources.pet.getOwner(pet.id)

            return owner 
        },
        img(pet) {
          return pet.type === 'DOG'
            ? 'https://placedog.net/300/300'
            : 'http://placekitten.com/300/300'
        }
    },
    User: {
        async pets(user, _, { dataSources }) {
            const pets = await dataSources.user.getPets(user.id)
            
            return pets
        }
    }
};

export default resolvers;
