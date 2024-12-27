import { PrismaClient } from "@prisma/client";

export class UserDataSource {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });

    return user;
  }
}
