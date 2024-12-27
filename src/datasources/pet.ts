import { PrismaClient, Prisma } from "@prisma/client";

export class PetDataSource {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async addPet({
    name,
    type,
    ownerId,
  }: Prisma.PetCreateInput & { ownerId: string }) {
    const createdPet = this.prisma.pet.create({
      data: {
        name,
        type,
        owner: {
          connect: {
            id: ownerId,
          },
        },
      },
    });

    return createdPet;
  }

  async getPets() {
    const pets = await this.prisma.pet.findMany();

    return pets;
  }

  async getPetsByUser(userId: string) {
    const pets = await this.prisma.pet.findMany({
      where: {
        userId: userId,
      },
    });

    return pets;
  }

  async getPetByType(type: string) {
    const pets = await this.prisma.pet.findMany({
      where: {
        type,
      },
    });

    return pets;
  }
}
