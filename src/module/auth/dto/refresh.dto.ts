import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RefreshDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "User ID",
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Refresh token",
  })
  @IsString()
  refreshToken: string;
}
