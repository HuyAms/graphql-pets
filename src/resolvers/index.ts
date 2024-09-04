import { Resolvers } from "../__generated__/graphql";
import Query from "./queries";
import Mutation from "./mutation";

const resolvers: Resolvers = { 
    Query, 
    Mutation,
    Pet: {
        img(pet) {
          return pet.type === 'DOG'
            ? 'https://placedog.net/300/300'
            : 'http://placekitten.com/300/300'
        }
    }
};

export default resolvers;
