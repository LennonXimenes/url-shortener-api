import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "strongPassword123", description: "User password" })
  @IsString()
  password: string;
}
