import { Test, TestingModule } from "@nestjs/testing";
import { PublicController } from "./public.controller";
import { UrlService } from "../url/url.service";
import { NotFoundException } from "@nestjs/common";
import { Response } from "express";

describe("PublicController", () => {
  let controller: PublicController;
  let urlService: UrlService;

  beforeEach(async () => {
    const mockUrlService = {
      findUrlShortCode: jest.fn(),
      incrementClickCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [{ provide: UrlService, useValue: mockUrlService }],
    }).compile();

    controller = module.get<PublicController>(PublicController);
    urlService = module.get<UrlService>(UrlService);
  });

  it("should redirect to original URL when shortCode exists", async () => {
    const shortCode = "abc123";
    const originalUrl = "https://example.com";
    const mockUrl = { originalUrl };

    (urlService.findUrlShortCode as jest.Mock).mockResolvedValue(mockUrl);
    (urlService.incrementClickCount as jest.Mock).mockResolvedValue(undefined);

    const res = {
      redirect: jest.fn(),
    } as unknown as Response;

    await controller.redirect(shortCode, res);

    expect(urlService.findUrlShortCode).toHaveBeenCalledWith(shortCode);
    expect(urlService.incrementClickCount).toHaveBeenCalledWith(shortCode);
    expect(res.redirect).toHaveBeenCalledWith(originalUrl);
  });

  it("should throw NotFoundException when shortCode does not exist", async () => {
    const shortCode = "notfound";

    (urlService.findUrlShortCode as jest.Mock).mockResolvedValue(null);

    const res = {
      redirect: jest.fn(),
    } as unknown as Response;

    await expect(controller.redirect(shortCode, res)).rejects.toThrow(
      NotFoundException,
    );

    expect(urlService.findUrlShortCode).toHaveBeenCalledWith(shortCode);
    expect(urlService.incrementClickCount).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
