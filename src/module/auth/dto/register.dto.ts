import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "strongPassword123", description: "User password" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}
