# GraphQL playground

Pets CRUD

# Get up and running

First clone the repo and install the dependencies:

```
npm install
```

Create a `.env` file and add the following:

```
DATABASE_URL="file:./dev.db"
```

Seed the database which would generate 10 users and 10k pets:

```
npx tsx prisma/seed.ts
```

Run the dev server:

```
npm run dev
```

To execute authenticated queries or mutations, include Authorization in the request headers.

```
Authorization: abc
```

For demonstration purposes, the auth token is hardcoded

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

Initially,it would stores the request's URL (e.g: `/users/id_1`) before making that request. Then it performs a request and stores the result along with the request's URL in its memoized cache.

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

- 📚 [Fetching from REST
  ](https://www.apollographql.com/docs/apollo-server/data/fetching-rest)
- 📚 [Lift-off II: Resolvers
  ](https://www.apollographql.com/tutorials/lift-off-part2/03-apollo-restdatasource)

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
    owner: await dataSources.user.getPetOwner(pet.id),
  }));

  return pets;
};
```

However, there is a big issue in this approach. We do the mapping and retriving the user data even when the client query doesn't ask for the `onwer`field.

```
query {
  pets: {
    type
  }
}
```

Thus, instead of putting all the work in the `Query.pets`, we can create another resolver function for `Pet.owner` (see the implementation in `resolvers.ts`)

```ts
Pet: {
    async owner(pet, _, { dataSources }) {
      const owner = await dataSources.user.getPetOwner(pet.userId);

      return owner;
    },
  }
```

</details>

<details>
  <summary>🍿 Data Loader</summary>

---

Use-case: deduplicating and **batching object loads** from a data store. It provides a memoization cache, which avoids loading the same object multiple times during a single GraphQL request.

Suppose we need to fetch the owners of 5 pets. Notice that `userId-2` is duplicated:

```
// pets array:
[
  {
    id: 'pet-1',
    ownerId: 'userId-1'
  },
   {
    id: 'pet-2',
    ownerId: 'userId-2'
  },
   {
    id: 'pet-3',
    ownerId: 'userId-2'
  },
   {
    id: 'pet-4',
    ownerId: 'userId-3'
  },
   {
    id: 'pet-5',
    ownerId: 'userId-4'
  },
]
```

Previously, this required 5 separate requests to fetch the 5 users.

```
- fetchUser(userId-1)
- fetchUser(userId-2)
- fetchUser(userId-2)
- fetchUser(userId-3)
- fetchUser(userId-4)
```

With a dataloader, all 5 IDs are passed in, duplicates are removed, and a single batch request is made to fetch the users:

```
// 1 batch request, with duplicates removed
fetchUsers([userId-1, userId-2, userId-3, userId-4])
```

See the implementation in `src/datasources/user.ts`

The dataloader requires API support for batch requests.

📚 [Data loaders with TypeScript & Apollo Server](https://www.apollographql.com/tutorials/dataloaders-typescript)

</details>

<details>
  <summary>🍿 Pagination</summary>

---

# Offset Pagination

```sql
SELECT * FROM pets LIMIT 10 OFFSET 50
```

or with graphql

```
type Query {
  pets(limit: Int!, page: Int!): [Pet!]!
}
```

Problems:

- performance issue - database scans all 50 rows to skip them
- slower as offset increases
- inconsistent results - duplicate records if new items added while paginating

# Cursor Pagination

A cursor is a stable identifier that points to an item on the list. Clients can use this cursor to instruct API to give them a number of results before or after this cursor.

```sql
SELECT * FROM pets
WHERE id > 15 -- last id client saw
LIMIT 10
```

or with graphql

```
type Query {
  pets(limit: Int!, after: String): [Pet!]!
}
```

The concept of "page" does not exist in the cursor-based pagination, thus, we cannot skip ahead to any page and we do not know how many pages there are.

Why it's better:

- Uses primary key (already indexed)
- Can jump directly to any id in index
- Consistent performance regardless of page depth
- No missed/duplicated records

In the cursor pagination, the server always provides what the next cursor is. For example:

```
{
  "data": {
      "pets": {
        "next": "1000",
        "items": [{},{},{}]
      }
  }
}
```

In this project, we implemented cursor-based pagination using the connection pattern for the `pets` query.

- 📚 [GraphQL Pagination](https://graphql.org/learn/pagination/)
- 📚 [Pagination algorithm - Specifications](https://relay.dev/graphql/connections.htm#sec-Pagination-algorithm)
- 📚 [Prisma Pagination](https://www.prisma.io/docs/orm/prisma-client/queries/pagination)
- 📚 [Project - Metaphysics](https://github.com/artsy/metaphysics)

</details>

<details>
  <summary>🍿 Authentication</summary>

---

# Overview

**Authentication**: Used to identify a user. To determine if they are who they say they are.

- Provide the user to resolvers
- Should not be coupled to a resolver
- Can protect some of Schema and not all of it
- Can provide field level protection

**Authorization**: Used to determine if a user is allowed to perform certain operations on certain resources.

- Should not be coupled to a resolver
- Can provide field level custom rules
- Can authorize some of the schema and not allmn

</details>
