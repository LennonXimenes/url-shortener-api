import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should call service.register and return user", async () => {
      const dto = { email: "test@example.com", password: "password" };

      const mockUser = {
        id: "userId",
        email: "test@example.com",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (service.register as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(mockUser);
    });
  });
});
