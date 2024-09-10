import { Resolvers } from "./__generated__/graphql";

const resolvers: Resolvers = { 
    Query: {
        user: async (_, input, {dataSources}) => {
            const {id} = input
        
            const user = await dataSources.user.getUser(id)
        
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
            const {name, type} = input
    
            const createdPet = await dataSources.pet.addPet({name, type})
    
            return createdPet
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
