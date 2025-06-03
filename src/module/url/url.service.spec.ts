import { Test, TestingModule } from "@nestjs/testing";
import { UrlService } from "./url.service";
import { UrlRepository } from "./url.repository";
import { ShortCodeGeneratorService } from "src/common/utils/short-code-generator.service";
import { ConfigService } from "@nestjs/config";

describe("UrlService", () => {
  let service: UrlService;
  let repo: UrlRepository;

  const mockRepo = {
    create: jest.fn(),
    update: jest.fn(),
    findAllByUser: jest.fn(),
    softDelete: jest.fn(),
    findByShortCode: jest.fn(),
    findUrlShortCode: jest.fn(),
    incrementClickCount: jest.fn(),
    findById: jest.fn(),
  };

  const mockShortCodeService = {
    generate: jest.fn().mockReturnValue("abc123"),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("http://localhost"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: UrlRepository, useValue: mockRepo },
        { provide: ShortCodeGeneratorService, useValue: mockShortCodeService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repo = module.get<UrlRepository>(UrlRepository);
  });

  afterEach(() => jest.clearAllMocks());

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a shortened URL", async () => {
      const dto = { originalUrl: "https://exemplo.com" };
      const userId = "user123";
      const expected = {
        originalUrl: dto.originalUrl,
        shortCode: "abc123",
        shortUrl: "http://localhost/abc123",
      };

      mockRepo.findUrlShortCode.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(expected);

      const result = await service.create(dto, userId);

      expect(result).toEqual(expected);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalUrl: dto.originalUrl,
          shortCode: "abc123",
          userId,
        }),
      );
    });
  });

  describe("update", () => {
    it("should update URL if user is owner", async () => {
      const id = "url123";
      const dto = { originalUrl: "https://updated.com" };
      const userId = "user123";
      const existingUrl = { id, userId, deletedAt: null };
      const updatedUrl = { id, ...dto };

      mockRepo.findById.mockResolvedValue(existingUrl);
      mockRepo.update.mockResolvedValue(updatedUrl);

      const result = await service.update(id, dto, userId);

      expect(result).toEqual(updatedUrl);
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe("findAllByUser", () => {
    it("should return all URLs of a user", async () => {
      const userId = "user123";
      const mockUrls = [{ id: "1" }, { id: "2" }];

      mockRepo.findAllByUser.mockResolvedValue(mockUrls);

      const result = await service.findAllByUser(userId);

      expect(result).toEqual(mockUrls);
    });
  });

  describe("softDelete", () => {
    it("should call repository.softDelete", async () => {
      const id = "url123";
      const userId = "user123";
      const existingUrl = { id, userId, deletedAt: null };
      const expected = { success: true };

      mockRepo.findById.mockResolvedValue(existingUrl);
      mockRepo.softDelete.mockResolvedValue(expected);

      const result = await service.softDelete(id, userId);

      expect(result).toEqual(expected);
    });
  });

  describe("findUrlShortCode", () => {
    it("should return URL by shortCode", async () => {
      const shortCode = "abc123";
      const expected = { id: "url1", shortCode };

      mockRepo.findUrlShortCode.mockResolvedValue(expected);

      const result = await service.findUrlShortCode(shortCode);

      expect(result).toEqual(expected);
    });
  });

  describe("incrementClickCount", () => {
    it("should increment click count", async () => {
      const shortCode = "abc123";
      const expected = { id: "url1", clicks: 10 };

      mockRepo.incrementClickCount.mockResolvedValue(expected);

      const result = await service.incrementClickCount(shortCode);

      expect(result).toEqual(expected);
    });
  });
});
