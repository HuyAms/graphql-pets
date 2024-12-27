# GraphQL playground

Pets CRUD

# Explanations

<details>
  <summary>🍿 Generating TS types</summary>

---

# Overview

Types are generated from the GraphQL schema using codegen as described here: [Generating TS types](https://www.apollographql.com/docs/apollo-server/workflow/generate-types)

The configuration file can be found at `./codegen.ts`.

# Type Mapping

Here's an example snippet from the configuration:

```js
config: {
    ...,
    mappers: {
      User: "../models#UserModel",
      Pet: "../models#PetModel",
    },
    useIndexSignature: true,
  }
```

Often, the schema from the database or API differs from the GraphQL schema, requiring mapping between the two types.

For instance, consider the `Pet` type in the GraphQL schema:

- **GraphQL Schema**: The `owner` field resolves to a `User` type.
- **Database**: The owner is referenced by a `userId`.

This discrepancy arises because the `Pet` type does not directly include a `userId` field but instead defines an `owner` field. This causes TypeScript type issues in resolvers.

To resolve this, define a `PetModel` type that matches the database structure and configure codegen to use that type instead.

</details>
