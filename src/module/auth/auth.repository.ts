import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User, RefreshToken } from "@prisma/client";

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.create({
      data: { email, password: hashedPassword },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createRefreshToken(
    userId: string,
    hashedToken: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: { userId, token: hashedToken, expiresAt },
    });
  }

  async findRefreshTokensByUserId(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteRefreshToken(id: string) {
    return this.prisma.refreshToken.delete({ where: { id } });
  }
}
