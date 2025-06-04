import { Test, TestingModule } from "@nestjs/testing";
import { UrlController } from "./url.controller";
import { UrlService } from "./url.service";
import { CreateUrlDto } from "./dto/create-url.dto";
import { UpdateUrlDto } from "./dto/update-url.dto";
import { iRequestWithUser } from "src/common/types/request-with-user";

describe("UrlController", () => {
  let controller: UrlController;
  let service: UrlService;

  beforeEach(async () => {
    const mockUrlService = {
      create: jest.fn(),
      update: jest.fn(),
      findAllByUser: jest.fn(),
      softDelete: jest.fn(),
      findUrlShortCode: jest.fn(),
      incrementClickCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [{ provide: UrlService, useValue: mockUrlService }],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service.create with correct params and return result", async () => {
      const createDto: CreateUrlDto = { originalUrl: "https://exemplo.com" };
      const mockUser = { userId: "user123", email: "email@test.com" };
      const mockResult = {
        shortCode: "abc123",
        originalUrl: createDto.originalUrl,
        shortUrl: "http://localhost/abc123",
      };

      (service.create as jest.Mock).mockResolvedValue(mockResult);

      const mockReq = { user: mockUser } as iRequestWithUser;
      const result = await controller.create(createDto, mockReq);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.userId);
      expect(result).toEqual(mockResult);
    });
  });

  describe("update", () => {
    it("should call service.update with correct params and return result", async () => {
      const id = "urlId123";
      const updateDto: UpdateUrlDto = { originalUrl: "https://updated.com" };
      const mockUser = { userId: "user123", email: "email@test.com" };
      const mockResult = { id, ...updateDto };

      (service.update as jest.Mock).mockResolvedValue(mockResult);

      const mockReq = { user: mockUser } as iRequestWithUser;

      const result = await controller.update(id, updateDto, mockReq);

      expect(service.update).toHaveBeenCalledWith(
        id,
        updateDto,
        mockUser.userId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("findAllByUser", () => {
    it("should call service.findAllByUser and return list", async () => {
      const mockUser = { userId: "user123", email: "email@test.com" };
      const mockUrls = [{ id: "url1" }, { id: "url2" }];

      (service.findAllByUser as jest.Mock).mockResolvedValue(mockUrls);

      const mockReq = { user: mockUser } as iRequestWithUser;

      const result = await controller.findAllByUser(mockReq);

      expect(service.findAllByUser).toHaveBeenCalledWith(mockUser.userId);
      expect(result).toEqual(mockUrls);
    });
  });

  describe("softDelete", () => {
    it("should call service.softDelete with correct params and return result", async () => {
      const id = "urlId123";
      const mockUser = { userId: "user123", email: "email@test.com" };
      const mockResult = { success: true };

      (service.softDelete as jest.Mock).mockResolvedValue(mockResult);

      const mockReq = { user: mockUser } as iRequestWithUser;

      const result = await controller.softDelete(id, mockReq);

      expect(service.softDelete).toHaveBeenCalledWith(id, mockUser.userId);
      expect(result).toEqual(mockResult);
    });
  });

  describe("findUrlShortCode", () => {
    it("should call service.findUrlShortCode and return URL", async () => {
      const shortCode = "abc123";
      const mockResult = {
        id: "urlId",
        originalUrl: "https://exemplo.com",
        shortCode,
      };

      (service.findUrlShortCode as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.findUrlShortCode(shortCode);

      expect(service.findUrlShortCode).toHaveBeenCalledWith(shortCode);
      expect(result).toEqual(mockResult);
    });
  });

  describe("incrementClickCount", () => {
    it("should call service.incrementClickCount and return result", async () => {
      const shortCode = "abc123";
      const mockResult = { clicks: 10 };

      (service.incrementClickCount as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.incrementClickCount(shortCode);

      expect(service.incrementClickCount).toHaveBeenCalledWith(shortCode);
      expect(result).toEqual(mockResult);
    });
  });
});
