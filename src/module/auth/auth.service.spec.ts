import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository";

describe("AuthService", () => {
  let service: AuthService;
  let repository: AuthRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            createUser: jest.fn(),
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            createRefreshToken: jest.fn(),
            findRefreshTokensByUserId: jest.fn(),
            deleteRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<AuthRepository>(AuthRepository);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();

    jest.spyOn(bcrypt, "hash").mockImplementation(async () => "hashedPassword");
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should create a user with hashed password", async () => {
      const email = "test@example.com";
      const password = "123456";

      (repository.createUser as jest.Mock).mockResolvedValue({
        id: "userId",
        email,
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await service.register(email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(repository.createUser).toHaveBeenCalledWith(
        email,
        "hashedPassword",
      );
      expect(result).toHaveProperty("email", email);
      expect(result).toHaveProperty("password", "hashedPassword");
    });
  });

  describe("login", () => {
    it("should return tokens and user data if credentials are valid", async () => {
      const email = "test@example.com";
      const password = "123456";

      const mockUser = {
        id: "userId",
        email,
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (repository.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce("access_token")
        .mockResolvedValueOnce("refresh_token");
      (repository.createRefreshToken as jest.Mock).mockResolvedValue({
        id: "refreshTokenId",
        token: "hashed_refresh_token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userId: mockUser.id,
      });

      const result = await service.login(email, password);

      expect(repository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(repository.createRefreshToken).toHaveBeenCalled();
      expect(result).toHaveProperty("access_token", "access_token");
      expect(result).toHaveProperty("refresh_token", "refresh_token");
      expect(result.user).toEqual({ id: mockUser.id, email: mockUser.email });
    });

    it("should throw if invalid credentials", async () => {
      (repository.findUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login("wrong@example.com", "123"),
      ).rejects.toThrowError("Invalid credentials");
    });
  });

  describe("refreshToken", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const userId = "userId";
      const oldRefreshToken = "oldRefreshToken";

      const storedTokens = [
        {
          id: "tokenId1",
          token: "hashed_old_refresh_token",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          userId,
        },
      ];

      const mockUser = {
        id: userId,
        email: "test@example.com",
        password: "hashedPassword",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      (repository.findRefreshTokensByUserId as jest.Mock).mockResolvedValue(
        storedTokens,
      );

      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation(
          async (inputToken, hashedToken) =>
            inputToken === oldRefreshToken &&
            hashedToken === "hashed_old_refresh_token",
        );

      (repository.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce("new_access_token")
        .mockResolvedValueOnce("new_refresh_token");
      (repository.createRefreshToken as jest.Mock).mockResolvedValue({
        id: "newTokenId",
        token: "hashed_new_refresh_token",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userId,
      });
      (repository.deleteRefreshToken as jest.Mock).mockResolvedValue({});

      const result = await service.refreshToken(userId, oldRefreshToken);

      expect(repository.findRefreshTokensByUserId).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(repository.findUserById).toHaveBeenCalledWith(userId);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(repository.createRefreshToken).toHaveBeenCalled();
      expect(repository.deleteRefreshToken).toHaveBeenCalledWith("tokenId1");
      expect(result).toEqual({
        access_token: "new_access_token",
        refresh_token: "new_refresh_token",
      });
    });

    it("should throw if no tokens found", async () => {
      (repository.findRefreshTokensByUserId as jest.Mock).mockResolvedValue([]);

      await expect(
        service.refreshToken("userId", "token"),
      ).rejects.toThrowError("Refresh token not found");
    });

    it("should throw if token is invalid or expired", async () => {
      const storedTokens = [
        {
          id: "tokenId1",
          token: "hashed_token",
          expiresAt: new Date(Date.now() - 1000),
          userId: "userId",
        },
      ];

      (repository.findRefreshTokensByUserId as jest.Mock).mockResolvedValue(
        storedTokens,
      );
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);

      await expect(
        service.refreshToken("userId", "token"),
      ).rejects.toThrowError("Invalid or expired refresh token");
    });
  });
});
