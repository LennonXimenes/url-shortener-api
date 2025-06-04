import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthRepository } from "./auth.repository";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private authRepo: AuthRepository,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.authRepo.createUser(email, hashedPassword);
  }

  async validateUser(email: string, password: string) {
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) return null;

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: "3h",
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: "1d",
    });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);

    await this.authRepo.createRefreshToken(
      user.id,
      hashedRefreshToken,
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    );

    // <-- Retornando também o objeto user aqui, como esperado no teste
    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const tokens = await this.authRepo.findRefreshTokensByUserId(userId);

    if (!tokens.length) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const validToken = await Promise.all(
      tokens.map(async (t) => {
        const match = await bcrypt.compare(refreshToken, t.token);
        if (match && t.expiresAt > new Date()) {
          return t;
        }
        return null;
      }),
    ).then((results) => results.find((t) => t !== null));

    if (!validToken) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.authRepo.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload = { sub: user.id, email: user.email };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: "3h",
    });

    const new_refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: "1d",
    });

    const hashedNewRefreshToken = await bcrypt.hash(new_refresh_token, 10);

    await this.authRepo.createRefreshToken(
      user.id,
      hashedNewRefreshToken,
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    );

    await this.authRepo.deleteRefreshToken(validToken.id);

    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }
}
