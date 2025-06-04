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
import { UrlEntity } from "./entities/url.entity";

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
      exists = await this.repository.findUrlShortCode(shortCode);
    }

    const data = {
      originalUrl: body.originalUrl,
      shortCode,
      ...(userId ? { userId } : {}),
    };

    const createdUrl = await this.repository.create(data);
    const baseUrl =
      this.configService.get<string>("BASE_URL") || "http://localhost";

    const urlEntity = new UrlEntity(createdUrl);

    return {
      ...urlEntity,
      shortUrl: `${baseUrl}/${urlEntity.shortCode}`,
    };
  }

  async update(id: string, body: UpdateUrlDto, userId: string) {
    const url = await this.repository.findById(id);

    if (!url || url.deletedAt) {
      throw new NotFoundException("URL not found");
    }

    if (!url.userId || url.userId !== userId) {
      throw new ForbiddenException("You cannot update this URL");
    }

    const updated = await this.repository.update(id, body);
    return new UrlEntity(updated);
  }

  async softDelete(id: string, userId: string) {
    const url = await this.repository.findById(id);

    if (!url || url.deletedAt) {
      throw new NotFoundException("URL not found");
    }

    if (!url.userId || url.userId !== userId) {
      throw new ForbiddenException("You cannot delete this URL");
    }

    const deleted = await this.repository.softDelete(id, userId);
    return new UrlEntity(deleted);
  }

  async findAllByUser(userId: string) {
    const list = await this.repository.findAllByUser(userId);
    return list.map((item) => new UrlEntity(item));
  }

  async findUrlShortCode(shortCode: string) {
    const url = await this.repository.findUrlShortCode(shortCode);
    if (!url) {
      throw new NotFoundException("Short URL not found");
    }
    return new UrlEntity(url);
  }

  async incrementClickCount(shortCode: string) {
    const updated = await this.repository.incrementClickCount(shortCode);
    return new UrlEntity(updated);
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
