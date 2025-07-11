import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "../prisma/prisma.service";
import { JwtStrategy } from "./jwt.strategy";
import { AuthRepository } from "./auth.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "3h" },
    }),
  ],
  providers: [AuthRepository, AuthService, PrismaService, JwtStrategy],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
