import { Module } from "@nestjs/common";
import { AuthModule } from "./module/auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UrlModule } from "./module/url/url.module";
import { CommonModule } from "./common/common.module";
import { PublicModule } from "./module/public/public.module";

@Module({
  imports: [PrismaModule, AuthModule, UrlModule, CommonModule, PublicModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
