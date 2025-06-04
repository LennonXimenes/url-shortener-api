import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RefreshDto } from "./dto/refresh.dto";

@Controller("auth")
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @ApiOperation({ summary: "User registration" })
  @ApiResponse({ status: 200, description: "User successfully registered." })
  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.service.register(body.email, body.password);
  }

  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful with JWT." })
  @ApiResponse({ status: 401, description: "Invalid credentials." })
  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.service.login(body.email, body.password);
  }

  @ApiOperation({ summary: "Refresh JWT token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully." })
  @Post("refresh")
  async refresh(@Body() body: RefreshDto) {
    return this.service.refreshToken(body.userId, body.refreshToken);
  }

  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile returned." })
  @Get("profile")
  getProfile(@Req() req) {
    return req.user;
  }
}
