import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { UrlService } from "../url/url.service";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

@Controller("r")
export class PublicController {
  constructor(private readonly urlService: UrlService) {}

  @ApiOperation({ summary: "Redirect to original URL by short code" })
  @ApiParam({ name: "shortCode", description: "Short code of the URL" })
  @ApiResponse({ status: 302, description: "Redirected to original URL." })
  @ApiResponse({ status: 404, description: "Short URL not found." })
  @Get(":shortCode")
  async redirect(@Param("shortCode") shortCode: string, @Res() res: Response) {
    const url = await this.urlService.findUrlShortCode(shortCode);

    if (!url) {
      throw new NotFoundException("Short URL not found");
    }

    await this.urlService.incrementClickCount(shortCode);
    return res.redirect(url.originalUrl);
  }
}
