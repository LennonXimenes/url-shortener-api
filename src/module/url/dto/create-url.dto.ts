import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUrl } from "class-validator";

export class CreateUrlDto {
  @ApiProperty({ description: "Original URL to shorten" })
  @IsString()
  @IsUrl({}, { message: "Must be a valid URL" })
  originalUrl: string;
}
