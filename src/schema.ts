export const typeDefs = `#graphql
  enum PetType {
    CAT
    DOG
  }

  type User {
    id: ID!
    username: String!
    pets: [Pet]!
  }

  input PetsInput {
    type: PetType
  }

  type Pet {
    id: ID!
    type: PetType!
    name: String!
    owner: User!
    img: String!
    createdAt: Int!
  }

  type Query {
    user: User!
    pets: [Pet]!
    petsByType(type: PetType!): [Pet]!
  }

  input NewPetInput {
    name: String!
    type: PetType!
  }

  type Mutation {
    addPet(input: NewPetInput!): Pet!
  }
`;