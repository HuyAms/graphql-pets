import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


function createPet() {

    return {
        name: faker.animal.dog(),
        type: faker.helpers.arrayElement(['CAT', 'DOG']),
    }
}


async function init() {

    console.log("🌱 Seeding database ...")

    console.time("🧹 Cleanup database")
    await prisma.user.deleteMany()
    console.timeEnd("🧹 Cleanup database")

    const createdUser = await prisma.user.create({
        data: {
            username: 'huyt'
        }
    })

    const numberOfPets = 3
    await Promise.all(Array.from({length: numberOfPets}).map(() => {
        const pet = createPet()
        return prisma.pet.create({
            data: {
                ...pet,
                owner: {
                    connect: {id: createdUser.id}
                }
            },
        })
    }))
}

console.time("🌱 Database has been seeded")
await init()
console.timeEnd("🌱 Database has been seeded")