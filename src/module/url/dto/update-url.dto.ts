import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateUrlDto {
  @ApiProperty({ description: "Original URL to shorten" })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: "Must be a valid URL" })
  originalUrl?: string;
}
