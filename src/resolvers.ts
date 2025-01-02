import { GraphQLError } from "graphql";
import { Resolvers } from "./__generated__/graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { createConnection } from "./utils/pagination";
import { requireAuthentication } from "./utils/auth";

const resolvers: Resolvers = {
  Query: {
    // authenticated resolver
    user: async (_, input, context) => {
      requireAuthentication(context);

      const { dataSources } = context;

      const { id } = input;

      const user = await dataSources.user.getUserById(id);

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: {
            code: ApolloServerErrorCode.BAD_USER_INPUT,
          },
        });
      }

      return user;
    },
    users: async (_, _input, { dataSources }) => {
      const users = await dataSources.user.getUsers();

      return users;
    },

    pets: async (_, { first, after, last, before }, { dataSources }) => {
      // TODO: might need a functin to covert graphQL to connectionArgs, this case they are the same
      // i.e: we convert Int id to string cursor
      const connectionArgs = { first, after, last, before };

      const { pets: results, count } = await dataSources.pet.getPets(
        connectionArgs
      );

      const connection = createConnection({
        items: results,
        connectionArgs,
        totalCount: count,
      });

      return connection;
    },
    petsByType: async (_, { type }, { dataSources }) => {
      const pets = await dataSources.pet.getPetByType(type);

      return pets;
    },
  },
  Mutation: {
    addPet: async (_, { input }, { dataSources }) => {
      const { name, type, ownerId } = input;

      const user = await dataSources.user.getUserById(ownerId);

      if (!user) {
        return {
          code: 400,
          success: false,
          message: `User not found with id: ${ownerId}`,
          pet: null,
        };
      }

      const createdPet = await dataSources.pet.addPet({ name, type, ownerId });

      return {
        code: 200,
        success: true,
        message: "Pet created successfully",
        pet: createdPet,
      };
    },
  },
  Pet: {
    async owner(pet, _, { dataSources }) {
      const owner = await dataSources.user.getPetOwner(pet.userId);

      return owner;
    },
    img(pet) {
      return pet.type === "DOG"
        ? "https://placedog.net/300/300"
        : "http://placekitten.com/300/300";
    },
  },
  User: {
    async pets(user, _, { dataSources }) {
      const pets = await dataSources.pet.getPetsByUser(user.id);

      return pets;
    },
  },
};

export default resolvers;
