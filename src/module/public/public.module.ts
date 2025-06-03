import { Module } from "@nestjs/common";
import { PublicController } from "./public.controller";
import { UrlModule } from "../url/url.module";

@Module({
  imports: [UrlModule],
  controllers: [PublicController],
})
export class PublicModule {}
