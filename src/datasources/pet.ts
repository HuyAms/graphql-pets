import { PrismaClient, Prisma } from "@prisma/client";

export class PetDataSource {
    private prisma: PrismaClient;

    constructor(prisma:PrismaClient) {
      this.prisma = prisma;
    }

    async addPet({name, type}: Prisma.PetCreateInput) {
      const createdPet = this.prisma.pet.create({
        data: {
          name,
          type
        }
      })

      return createdPet
    }

    async getPets() {
        const pets = await this.prisma.pet.findMany()
    
          return pets
    }

    async getOwner(petId: string) {
      const {owner} = await this.prisma.pet.findUnique({
        where: {
            id: petId
        },
        select: {
            owner: true
        }
      })

      return owner
    }
  
    async getPetByType(type: string) {
        const pets = await this.prisma.pet.findMany({
            where: {
              type
            }
          })
      
          return pets
    }
}