import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function createPet() {
  return {
    name: faker.animal.dog(),
    type: faker.helpers.arrayElement(["CAT", "DOG"]),
  };
}

async function init() {
  console.log("🌱 Seeding database ...");

  console.time("🧹 Cleanup database");
  await prisma.user.deleteMany();
  console.timeEnd("🧹 Cleanup database");

  const huyUser = await prisma.user.create({
    data: {
      username: "huyt",
    },
  });

  const moreUsers = await Promise.all(
    Array.from({ length: 10 }).map(() => {
      return prisma.user.create({
        data: {
          username: faker.internet.userName(),
        },
      });
    })
  );

  const createdUsers = [huyUser, ...moreUsers];

  const numberOfPets = 10_000;
  await Promise.all(
    Array.from({ length: numberOfPets }).map(() => {
      const pet = createPet();
      return prisma.pet.create({
        data: {
          ...pet,
          owner: {
            connect: { id: faker.helpers.arrayElement(createdUsers).id },
          },
        },
      });
    })
  );
}

console.time("🌱 Database has been seeded");
await init();
console.timeEnd("🌱 Database has been seeded");
