import {PrismaClient, Prisma} from '@prisma/client';
import {ConectionArgrs} from '../utils/pagination';

export class PetDataSource {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async addPet({name, type, ownerId}: Prisma.PetCreateInput & {ownerId: string}) {
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

  async getPets(connectionArgs: ConectionArgrs) {
    const {first, last, after, before} = connectionArgs;

    // TODO: move this logic to a function
    // the idea is to returns +1 item than needed so we can know if there are more items
    const take = first ? first + 1 : -(last + 1);
    const cursor = after ? {id: after} : before ? {id: before} : undefined;

    const [pets, count] = await Promise.all([
      this.prisma.pet.findMany({
        take: take,
        ...(cursor && {skip: 1}), // Skip the cursor
        cursor: cursor,
      }),
      this.prisma.pet.count(),
    ]);

    return {
      pets,
      count,
    };
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
