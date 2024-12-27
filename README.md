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

<details>
  <summary>🍿 Why DataSource?</summary>

---

We can use `fetch` (REST API) or directly query the database in the resolver, so why use a `DataSource`?

Let's say our pets resolvers returns 100 pets then we need to make an additional 100 calls to get the owner info. And if they all have the same owner then we are sending 100 calls to fetch a single onwer.

😱 N+1 issue

```
{
  pets {
    # 1
    id
    owner {
      # N calls for N tracks
      username
    }
  }
}
```

To solve this issue, the datasource help handle caching, deduplication, and errors while resolving operations.

And because it's a common task to fetch data with REST, Apollo provides a dedicated `DataSource` class just for that: see [@apollo/datasource-rest](https://github.com/apollographql/datasource-rest)

Let's say we fetch users using REST API. Initially,it would stores the request's URL (e.g: `/users/id_1`) before making that request. Then it performs a request and stores the result along with the request's URL in its memoized cache.

If any resolver in the same context attemps the get the same user, it just returns a response from the cache, without making another request.

If we want to share the cached results between multiple context, need to pass the `cache` object to the REST datasource.

Example code:

```ts
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    const token = getTokenFromRequest(req);
    // We'll take Apollo Server's cache
    // and pass it to each of our data sources
    const { cache } = server;

    return {
      dataSources: {
        moviesAPI: new MoviesAPI({ cache, token }),
        personalizationAPI: new PersonalizationAPI({ cache }),
      },
    };
  },
});
```

We can verify if the cache worked by trying to run the same query multiple times (using Apollo Studioa) and see how fast we got the response the second time.

In this project, we use the datasource pattern to fetch data from the database, but caching is not yet implemented!

📚 [Fetching from REST
](https://www.apollographql.com/docs/apollo-server/data/fetching-rest)
📚 [Lift-off II: Resolvers
](https://www.apollographql.com/tutorials/lift-off-part2/03-apollo-restdatasource)

</details>

<details>
  <summary>🍿 DataLoader</summary>

---

We can use `fetch` (REST API) or directly query the database in the resolver, so why use a `DataSource`?

Let's say our pets resolvers returns 100 pets then we need to make an additional 100 calls to get the owner info. And if they all have the same owner then we are sending 100 calls to fetch a single onwer.

😱 N+1 issue

```
{
  pets {
    # 1
    id
    owner {
      # N calls for N tracks
      username
    }
  }
}
```

To solve this issue, the datasource help handle caching, deduplication, and errors while resolving operations.

And because it's a common task to fetch data with REST, Apollo provides a dedicated `DataSource` class just for that: see [@apollo/datasource-rest](https://github.com/apollographql/datasource-rest)

Let's say we fetch users using REST API. Initially,it would stores the request's URL (e.g: `/users/id_1`) before making that request. Then it performs a request and stores the result along with the request's URL in its memoized cache.

If any resolver in the same context attemps the get the same user, it just returns a response from the cache, without making another request.

In this project, we use the datasource pattern to fetch data from the database, but caching is not yet implemented!

📚 [Fetching from REST
](https://www.apollographql.com/docs/apollo-server/data/fetching-rest)

</details>

<details>
  <summary>🍿 Resolver Chain</summary>

---

Suppose we want to include the owner for each pet. One approach is to first fetch all the pets and then map through each pet to fetch its owner

```ts
pets: async (_, _input, { dataSources }) => {
  const pets = await dataSources.pet.getPets();

  const petsWithOwner = pets.map((pet) => ({
    ...pet,
    owner: await dataSources.pet.getOwner(pet.id),
  }));

  return pets;
};
```

However, there is a big issue in this approach. We do the mapping and retriving the user data even when the client query doesn't ask for the `onwer`field.

Thus, instead of putting all the work in the `Query.pets`, we can create another resolver function for `Pet.owner` (see the implementation in `resolvers.ts`)

```
query {
  pets: {
    type
  }
}
```

</details>
