import { PrismaClient, User } from "@prisma/client";
import DataLoader from "dataloader";

export class UserDataSource {
  private prisma: PrismaClient;
  private batchUsers = new DataLoader((userIds): Promise<User[]> => {
    // batch fetch users by userIds

    console.log("Making one batched call with ", userIds);

    const users = this.prisma.user.findMany({
      where: {
        id: {
          in: userIds as string[],
        },
      },
    });

    return users;
  });

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });

    return user;
  }

  // batch version to avoid N+1 problem when getting a owner of pets
  async getPetOwner(userId: string) {
    console.log("Passing user ID to the data loader: ", userId);
    return this.batchUsers.load(userId);
  }
}
