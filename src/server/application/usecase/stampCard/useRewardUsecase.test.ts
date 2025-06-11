import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	UseRewardUseCaseInputData,
	UseRewardUseCaseInteractor,
} from "./useRewardUsecase";
import type { StampCardRepository } from "~/server/domain/repositories/stampCardRepository";
import { StampCardEntity } from "~/server/domain/entities/stampCardEntity";

// StampCardRepositoryのモック
const mockStampCardRepository: StampCardRepository = {
	findByUserId: vi.fn(),
	create: vi.fn(),
	save: vi.fn(),
};

// サンプルStampCardEntityのモック
const createMockStampCard = (
	userId: string,
	stampCount = 0,
	canGetReward = false,
): StampCardEntity =>
	new StampCardEntity({
		id: { value: `stamp-card-${userId}` },
		userId: { value: userId },
		stamps: stampCount,
		lastPurchaseDate: new Date(),
		createdAt: new Date(),
		totalPurchases: 100,
		updatedAt: new Date(),
	});

describe("UseRewardUseCaseInputData", () => {
	describe("constructor and validation", () => {
		it("should create input data with valid userId", () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			expect(inputData.UserId).toBe("user-123");
		});

		it("should create input data with different valid userIds", () => {
			const testCases = [
				"user-1",
				"user_with_underscore",
				"user-with-dash",
				"user.with.dots",
				"user@domain.com",
				"123numeric",
				"MixedCase",
			];

			for (const userId of testCases) {
				const inputData = new UseRewardUseCaseInputData(userId);
				expect(inputData.UserId).toBe(userId);
			}
		});

		it("should handle empty string userId", () => {
			const inputData = new UseRewardUseCaseInputData("");
			expect(inputData.UserId).toBe("");
		});

		it("should handle special characters in userId", () => {
			const specialIds = ["user-!@#$%", "user with spaces", "user\twith\ttabs"];

			for (const userId of specialIds) {
				const inputData = new UseRewardUseCaseInputData(userId);
				expect(inputData.UserId).toBe(userId);
			}
		});
	});

	describe("getters", () => {
		it("should return correct userId value", () => {
			const userId = "test-user-456";
			const inputData = new UseRewardUseCaseInputData(userId);
			expect(inputData.UserId).toBe(userId);
		});

		it("should preserve original userId format", () => {
			const testCases = [
				"UPPERCASE",
				"lowercase",
				"MixedCase",
				"123numbers",
				"special-chars_test",
			];

			for (const userId of testCases) {
				const inputData = new UseRewardUseCaseInputData(userId);
				expect(inputData.UserId).toBe(userId);
			}
		});
	});
});

describe("UseRewardUseCaseInteractor", () => {
	let useCase: UseRewardUseCaseInteractor;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new UseRewardUseCaseInteractor(mockStampCardRepository);
	});

	describe("execute", () => {
		it("should successfully use reward when stamp card exists and has enough stamps", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard = createMockStampCard("user-123", 10, true);

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);
			vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

			await useCase.execute(inputData);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(
				"user-123",
			);
			expect(stampCard.canGetReward).toHaveBeenCalledTimes(1);
			expect(stampCard.useReward).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.save).toHaveBeenCalledWith(stampCard);
		});

		it("should throw error when stamp card is not found", async () => {
			const inputData = new UseRewardUseCaseInputData("nonexistent-user");

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				null,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプカードが見つかりません",
			);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.save).not.toHaveBeenCalled();
		});

		it("should throw error when stamp card exists but has insufficient stamps", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard = createMockStampCard("user-123", 5, false);

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプが足りません",
			);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
			expect(stampCard.canGetReward).toHaveBeenCalledTimes(1);
			expect(stampCard.useReward).not.toHaveBeenCalled();
			expect(mockStampCardRepository.save).not.toHaveBeenCalled();
		});

		it("should handle repository findByUserId error", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const error = new Error("Database connection failed");

			vi.mocked(mockStampCardRepository.findByUserId).mockRejectedValueOnce(
				error,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"Database connection failed",
			);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.save).not.toHaveBeenCalled();
		});

		it("should handle repository save error", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard = createMockStampCard("user-123", 15, true);
			const saveError = new Error("Failed to save stamp card");

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);
			vi.mocked(mockStampCardRepository.save).mockRejectedValueOnce(saveError);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"Failed to save stamp card",
			);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
			expect(stampCard.canGetReward).toHaveBeenCalledTimes(1);
			expect(stampCard.useReward).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
		});

		it("should work with different users who have sufficient stamps", async () => {
			const testCases = [
				{ userId: "user-1", stamps: 10 },
				{ userId: "user-2", stamps: 15 },
				{ userId: "user-3", stamps: 20 },
			];

			for (const { userId, stamps } of testCases) {
				vi.clearAllMocks();

				const inputData = new UseRewardUseCaseInputData(userId);
				const stampCard = createMockStampCard(userId, stamps, true);

				vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
					stampCard,
				);
				vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(
					undefined,
				);

				await useCase.execute(inputData);

				expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(
					userId,
				);
				expect(stampCard.useReward).toHaveBeenCalledTimes(1);
				expect(mockStampCardRepository.save).toHaveBeenCalledWith(stampCard);
			}
		});

		it("should fail for different users who have insufficient stamps", async () => {
			const testCases = [
				{ userId: "user-1", stamps: 0 },
				{ userId: "user-2", stamps: 5 },
				{ userId: "user-3", stamps: 9 },
			];

			for (const { userId, stamps } of testCases) {
				vi.clearAllMocks();

				const inputData = new UseRewardUseCaseInputData(userId);
				const stampCard = createMockStampCard(userId, stamps, false);

				vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
					stampCard,
				);

				await expect(useCase.execute(inputData)).rejects.toThrow(
					"スタンプが足りません",
				);

				expect(stampCard.canGetReward).toHaveBeenCalledTimes(1);
				expect(stampCard.useReward).not.toHaveBeenCalled();
			}
		});

		it("should handle edge case where canGetReward returns false despite having stamps", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			// スタンプ数は十分だがcanGetRewardがfalseを返す場合
			const stampCard = createMockStampCard("user-123", 15, false);

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプが足りません",
			);

			expect(stampCard.canGetReward).toHaveBeenCalledTimes(1);
			expect(stampCard.useReward).not.toHaveBeenCalled();
		});

		it("should handle multiple consecutive reward uses for same user", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard1 = createMockStampCard("user-123", 10, true);
			const stampCard2 = createMockStampCard("user-123", 20, true);

			vi.mocked(mockStampCardRepository.findByUserId)
				.mockResolvedValueOnce(stampCard1)
				.mockResolvedValueOnce(stampCard2);
			vi.mocked(mockStampCardRepository.save).mockResolvedValue(undefined);

			await useCase.execute(inputData);
			await useCase.execute(inputData);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(2);
			expect(mockStampCardRepository.save).toHaveBeenCalledTimes(2);
		});

		it("should handle empty userId", async () => {
			const inputData = new UseRewardUseCaseInputData("");

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				null,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプカードが見つかりません",
			);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith("");
		});

		it("should handle special userId formats", async () => {
			const specialUserIds = [
				"user@domain.com",
				"user-with-dashes",
				"user_with_underscores",
				"user.with.dots",
			];

			for (const userId of specialUserIds) {
				vi.clearAllMocks();

				const inputData = new UseRewardUseCaseInputData(userId);
				const stampCard = createMockStampCard(userId, 12, true);

				vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
					stampCard,
				);
				vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(
					undefined,
				);

				await useCase.execute(inputData);

				expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(
					userId,
				);
			}
		});

		it("should handle undefined/null repository response", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				undefined as any,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプカードが見つかりません",
			);
		});
	});

	describe("validation flow", () => {
		it("should check stamp card existence first", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				null,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプカードが見つかりません",
			);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.save).not.toHaveBeenCalled();
		});

		it("should check reward eligibility after existence", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard = createMockStampCard("user-123", 5, false);

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプが足りません",
			);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
		});

		it("should use reward after all validations pass", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard = createMockStampCard("user-123", 10, true);

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);
			vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

			await useCase.execute(inputData);

			expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
		});
	});

	describe("repository integration", () => {
		it("should only call appropriate repository methods", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard = createMockStampCard("user-123", 12, true);

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);
			vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

			await useCase.execute(inputData);

			expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
			expect(mockStampCardRepository.create).not.toHaveBeenCalled();
		});

		it("should not call save when validation fails", async () => {
			const inputData = new UseRewardUseCaseInputData("user-123");
			const stampCard = createMockStampCard("user-123", 3, false);

			vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(
				stampCard,
			);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"スタンプが足りません",
			);

			expect(mockStampCardRepository.save).not.toHaveBeenCalled();
		});
	});
});
