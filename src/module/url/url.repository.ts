import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/module/prisma/prisma.service";
import { UpdateUrlDto } from "./dto/update-url.dto";
import { CreateUrlDto } from "./dto/create-url.dto";

@Injectable()
export class UrlRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    originalUrl: string;
    shortCode: string;
    userId?: string;
  }) {
    return await this.prisma.url.create({
      data,
    });
  }

  async findByShortCode(shortCode: string) {
    return await this.prisma.url.findFirst({
      where: { shortCode, deletedAt: null },
    });
  }

  async update(id: string, body: UpdateUrlDto) {
    return await this.prisma.url.update({
      where: { id },
      data: body,
    });
  }

  async findAllByUser(userId: string) {
    return await this.prisma.url.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findUrlShortCode(shortCode: string) {
    return await this.prisma.url.findFirst({
      where: { shortCode, deletedAt: null },
    });
  }

  async findById(id: string) {
    return this.prisma.url.findUnique({
      where: { id },
    });
  }

  async incrementClickCount(shortCode: string) {
    return await this.prisma.url.update({
      where: { shortCode },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return await this.prisma.url.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }
}
