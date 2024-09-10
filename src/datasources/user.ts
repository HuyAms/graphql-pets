import { PrismaClient } from "@prisma/client";

export class UserDataSource {
    private prisma: PrismaClient;
  
    constructor(prisma: PrismaClient) {
      this.prisma = prisma;
    }
  
    async getUser(id: string) {
      const user = await this.prisma.user.findUnique({
        where: {id: id},
      })
  
      return user
    }

    async getPets(userId: string) {
      const {pets} = await this.prisma.user.findUnique({
        where: {id: userId},
        include: {
          pets: true
        }
      })

      return pets

    }

}