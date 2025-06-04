import { Module } from "@nestjs/common";
import { PrismaModule } from "src/module/prisma/prisma.module";
import { UrlRepository } from "./url.repository";
import { UrlService } from "./url.service";
import { UrlController } from "./url.controller";
import { ShortCodeGeneratorService } from "src/common/utils/short-code-generator.service";
import { CommonModule } from "src/common/common.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [PrismaModule, CommonModule, ConfigModule],
  providers: [UrlRepository, UrlService, UrlController],
  controllers: [UrlController],
  exports: [UrlService],
})
export class UrlModule {}
