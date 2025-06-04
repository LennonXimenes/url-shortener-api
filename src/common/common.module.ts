import { Module } from "@nestjs/common";
import { ShortCodeGeneratorService } from "./utils/short-code-generator.service";
import { PrismaModule } from "src/module/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [ShortCodeGeneratorService],
  exports: [ShortCodeGeneratorService],
})
export class CommonModule {}
