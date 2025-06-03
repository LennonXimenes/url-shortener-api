import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UrlRepository } from "./url.repository";
import { CreateUrlDto } from "./dto/create-url.dto";
import { UpdateUrlDto } from "./dto/update-url.dto";
import { ShortCodeGeneratorService } from "src/common/utils/short-code-generator.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UrlService {
  constructor(
    private readonly repository: UrlRepository,
    private readonly shortCodeGenerator: ShortCodeGeneratorService,
    private readonly configService: ConfigService,
  ) {}

  async create(body: CreateUrlDto, userId?: string) {
    const urlRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/i;

    if (!urlRegex.test(body.originalUrl)) {
      throw new BadRequestException(
        "Invalid URL. It must start with http:// or https://",
      );
    }

    let shortCode = this.shortCodeGenerator.generate();
    let exists = await this.repository.findUrlShortCode(shortCode);
    while (exists) {
      shortCode = this.shortCodeGenerator.generate();
      exists = await this.repository.findByShortCode(shortCode);
    }

    const data = {
      originalUrl: body.originalUrl,
      shortCode,
      ...(userId ? { userId } : {}),
    };

    const createdUrl = await this.repository.create(data);
    const baseUrl =
      this.configService.get<string>("BASE_URL") || "http://localhost";

    return {
      ...createdUrl,
      shortUrl: `${baseUrl}/${createdUrl.shortCode}`,
    };
  }

  async update(id: string, body: UpdateUrlDto, userId: string) {
    const url = await this.repository.findById(id);

    if (!url || url?.deletedAt) {
      throw new NotFoundException("URL not found");
    }

    if (!url?.userId || url?.userId !== userId) {
      throw new ForbiddenException("You cannot update this URL");
    }
    return await this.repository.update(id, body);
  }

  async softDelete(id: string, userId: string) {
    const url = await this.repository.findById(id);

    if (!url || url?.deletedAt) {
      throw new NotFoundException("URL not found");
    }

    if (!url?.userId || url?.userId !== userId) {
      throw new ForbiddenException("You cannot delete this URL");
    }

    return this.repository.softDelete(id, userId);
  }

  async findAllByUser(userId: string) {
    return await this.repository.findAllByUser(userId);
  }

  async findUrlShortCode(shortCode: string) {
    return await this.repository.findUrlShortCode(shortCode);
  }

  async incrementClickCount(shortCode: string) {
    return await this.repository.incrementClickCount(shortCode);
  }

  async handleRedirect(shortCode: string): Promise<string> {
    const url = await this.repository.findUrlShortCode(shortCode);

    if (!url || url.deletedAt) {
      throw new NotFoundException("Short URL not found");
    }

    await this.repository.incrementClickCount(shortCode);

    return url.originalUrl;
  }
}
