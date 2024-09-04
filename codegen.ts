
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  config: {
    useIndexSignature: true
  },
  schema: "src/schema.graphql",
  generates: {
    "src/__generated__/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"]
    },
  },
};

export default config;
