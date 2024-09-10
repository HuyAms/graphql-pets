
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/schema.graphql",
  generates: {
    "src/__generated__/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"]
    },
  },
  config: {
    contextType: "../index#ApolloServerContext",
    mappers: {
      User: "../models#UserModel",
      Pet: "../models#PetModel",
    },
    useIndexSignature: true,
  }
};

export default config;
