import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UrlService } from "./url.service";
import { JwtAuthGuard } from "src/module/auth/jwt-auth.guard";
import { UpdateUrlDto } from "./dto/update-url.dto";
import { CreateUrlDto } from "./dto/create-url.dto";
import { OptionalJwtInterceptor } from "src/module/auth/optional-jwt.interceptor";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { iRequestWithUser } from "src/common/types/request-with-user";

@Controller("url")
export class UrlController {
  constructor(private readonly service: UrlService) {}

  @UseInterceptors(OptionalJwtInterceptor)
  @ApiOperation({ summary: "Create short URL" })
  @ApiResponse({ status: 201, description: "URL created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  @Post()
  async create(@Body() body: CreateUrlDto, @Req() req: iRequestWithUser) {
    return this.service.create(body, req.user?.userId!);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update URL by ID" })
  @ApiParam({ name: "id", description: "URL ID to update" })
  @ApiResponse({ status: 200, description: "URL updated successfully." })
  @ApiResponse({ status: 404, description: "URL not found." })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateUrlDto,
    @Req() req: iRequestWithUser,
  ) {
    return this.service.update(id, body, req.user?.userId!);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all URLs by user" })
  @ApiResponse({ status: 200, description: "List of URLs returned." })
  @Get("me")
  async findAllByUser(@Req() req: iRequestWithUser) {
    return this.service.findAllByUser(req.user?.userId!);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete a URL" })
  @ApiParam({ name: "id", description: "URL ID to delete" })
  @ApiResponse({ status: 200, description: "URL deleted successfully." })
  @ApiResponse({ status: 404, description: "URL not found." })
  @Delete(":id/delete")
  async softDelete(@Param("id") id: string, @Req() req: iRequestWithUser) {
    return this.service.softDelete(id, req.user?.userId!);
  }

  @ApiOperation({ summary: "Get URL by shortCode" })
  @ApiParam({ name: "shortCode", description: "Short code of the URL" })
  @ApiResponse({ status: 200, description: "URL returned successfully." })
  @ApiResponse({ status: 404, description: "URL not found." })
  @Get(":shortCode")
  async findUrlShortCode(@Param("shortCode") shortCode: string) {
    return this.service.findUrlShortCode(shortCode);
  }

  @Patch(":shortCode/click")
  @ApiOperation({ summary: "Increment click count for short URL" })
  @ApiParam({ name: "shortCode", description: "Short code of the URL" })
  @ApiResponse({ status: 200, description: "Click count incremented." })
  async incrementClickCount(@Param("shortCode") shortCode: string) {
    return this.service.incrementClickCount(shortCode);
  }
}
