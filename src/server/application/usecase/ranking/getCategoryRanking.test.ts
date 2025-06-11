import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	GetCategoryRankingUseCaseInputData,
	GetCategoryRankingUseCaseInteractor,
} from "./getCategoryRanking";
import type { CategoryRankingRepository } from "~/server/domain/repositories/categoryRankingRepository";
import { CategoryRankingEntity } from "~/server/domain/entities/categoryRanking";

// CategoryRankingRepositoryのモック
const mockCategoryRankingRepository: CategoryRankingRepository = {
	getTopCategories: vi.fn(),
};

// サンプルCategoryRankingEntityのモック
const mockCategoryRankings: CategoryRankingEntity[] = [
	new CategoryRankingEntity({
		categoryId: "electronics",
		categoryName: "Electronics",
		soldCount: 150,
		totalRevenue: 1500000,
		rank: 1,
	}),
	new CategoryRankingEntity({
		categoryId: "clothing",
		categoryName: "Clothing",
		soldCount: 120,
		totalRevenue: 800000,
		rank: 2,
	}),
	new CategoryRankingEntity({
		categoryId: "books",
		categoryName: "Books",
		soldCount: 80,
		totalRevenue: 400000,
		rank: 3,
	}),
];

describe("GetCategoryRankingUseCaseInputData", () => {
	describe("constructor and validation", () => {
		it("should create input data with valid limit", () => {
			const inputData = new GetCategoryRankingUseCaseInputData(10);
			expect(inputData.Limit).toBe(10);
		});

		it("should create input data with limit 1", () => {
			const inputData = new GetCategoryRankingUseCaseInputData(1);
			expect(inputData.Limit).toBe(1);
		});

		it("should create input data with large limit", () => {
			const inputData = new GetCategoryRankingUseCaseInputData(1000);
			expect(inputData.Limit).toBe(1000);
		});

		it("should throw error when limit is negative", () => {
			expect(() => new GetCategoryRankingUseCaseInputData(-1)).toThrow(
				"limit is invalid. plese setting over 1.",
			);
		});

		it("should throw error when limit is zero", () => {
			expect(() => new GetCategoryRankingUseCaseInputData(0)).toThrow(
				"limit is invalid. plese setting over 1.",
			);
		});

		it("should throw error when limit is very negative", () => {
			expect(() => new GetCategoryRankingUseCaseInputData(-100)).toThrow(
				"limit is invalid. plese setting over 1.",
			);
		});

		it("should handle decimal limits", () => {
			const inputData = new GetCategoryRankingUseCaseInputData(10.5);
			expect(inputData.Limit).toBe(10.5);
		});

		it("should accept various valid limits", () => {
			const validLimits = [1, 5, 10, 25, 50, 100, 500];

			for (const limit of validLimits) {
				const inputData = new GetCategoryRankingUseCaseInputData(limit);
				expect(inputData.Limit).toBe(limit);
			}
		});
	});

	describe("getters", () => {
		it("should return correct limit value", () => {
			const testCases = [1, 5, 10, 50, 100];

			for (const limit of testCases) {
				const inputData = new GetCategoryRankingUseCaseInputData(limit);
				expect(inputData.Limit).toBe(limit);
			}
		});

		it("should preserve decimal values", () => {
			const decimalLimits = [1.5, 10.25, 50.75];

			for (const limit of decimalLimits) {
				const inputData = new GetCategoryRankingUseCaseInputData(limit);
				expect(inputData.Limit).toBe(limit);
			}
		});
	});
});

describe("GetCategoryRankingUseCaseInteractor", () => {
	let useCase: GetCategoryRankingUseCaseInteractor;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new GetCategoryRankingUseCaseInteractor(
			mockCategoryRankingRepository,
		);
	});

	describe("execute", () => {
		it("should return category rankings from repository with correct limit", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(5);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(mockCategoryRankings);

			const result = await useCase.execute(inputData);

			expect(result).toEqual(mockCategoryRankings);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(1);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledWith(5);
		});

		it("should return empty array when no categories found", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(10);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce([]);

			const result = await useCase.execute(inputData);

			expect(result).toEqual([]);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(1);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledWith(10);
		});

		it("should work with limit 1", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(1);
			const singleCategory = [mockCategoryRankings[0]];

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(singleCategory as CategoryRankingEntity[]);

			const result = await useCase.execute(inputData);

			expect(result).toEqual(singleCategory);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledWith(1);
		});

		it("should work with large limits", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(1000);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(mockCategoryRankings);

			const result = await useCase.execute(inputData);

			expect(result).toEqual(mockCategoryRankings);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledWith(1000);
		});

		it("should handle repository errors", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(5);
			const error = new Error("Database connection failed");

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockRejectedValueOnce(error);

			await expect(useCase.execute(inputData)).rejects.toThrow(
				"Database connection failed",
			);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(1);
		});

		it("should handle different limit values correctly", async () => {
			const testCases = [1, 3, 5, 10, 25, 50, 100];

			for (const limit of testCases) {
				vi.clearAllMocks();

				const inputData = new GetCategoryRankingUseCaseInputData(limit);
				const expectedResults = mockCategoryRankings.slice(
					0,
					Math.min(limit, mockCategoryRankings.length),
				);

				vi.mocked(
					mockCategoryRankingRepository.getTopCategories,
				).mockResolvedValueOnce(expectedResults);

				const result = await useCase.execute(inputData);

				expect(result).toEqual(expectedResults);
				expect(
					mockCategoryRankingRepository.getTopCategories,
				).toHaveBeenCalledWith(limit);
			}
		});

		it("should handle multiple consecutive calls", async () => {
			const inputData1 = new GetCategoryRankingUseCaseInputData(2);
			const inputData2 = new GetCategoryRankingUseCaseInputData(5);

			vi.mocked(mockCategoryRankingRepository.getTopCategories)
				.mockResolvedValueOnce(mockCategoryRankings.slice(0, 2))
				.mockResolvedValueOnce(mockCategoryRankings);

			const result1 = await useCase.execute(inputData1);
			const result2 = await useCase.execute(inputData2);

			expect(result1).toEqual(mockCategoryRankings.slice(0, 2));
			expect(result2).toEqual(mockCategoryRankings);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(2);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenNthCalledWith(1, 2);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenNthCalledWith(2, 5);
		});

		it("should handle null/undefined repository responses gracefully", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(5);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(null as any);

			const result = await useCase.execute(inputData);

			expect(result).toBeNull();
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(1);
		});

		it("should work with decimal limits", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(3.5);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(mockCategoryRankings);

			const result = await useCase.execute(inputData);

			expect(result).toEqual(mockCategoryRankings);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledWith(3.5);
		});

		it("should preserve ranking order from repository", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(3);
			const orderedRankings = [...mockCategoryRankings].reverse(); // 順序を変更

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(orderedRankings);

			const result = await useCase.execute(inputData);

			expect(result).toEqual(orderedRankings);
			expect(result).not.toEqual(mockCategoryRankings); // 元の順序と異なることを確認
			expect(result[0]?.getRank()).toBe(3); // 最初の要素が元々3位だったものであることを確認
		});

		it("should handle categories with different data structures", async () => {
			const diverseCategories: CategoryRankingEntity[] = [
				{
					Id: { value: "high-sales" },
					Name: "High Sales Category",
					ProductCount: 1000,
					TotalSales: 10000000,
					AverageRating: 5.0,
					Rank: 1,
				} as CategoryRankingEntity,
				{
					Id: { value: "low-sales" },
					Name: "Low Sales Category",
					ProductCount: 1,
					TotalSales: 100,
					AverageRating: 1.0,
					Rank: 2,
				} as CategoryRankingEntity,
				{
					Id: { value: "no-rating" },
					Name: "No Rating Category",
					ProductCount: 50,
					TotalSales: 50000,
					AverageRating: 0,
					Rank: 3,
				} as CategoryRankingEntity,
			];

			const inputData = new GetCategoryRankingUseCaseInputData(3);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(diverseCategories);

			const result = await useCase.execute(inputData);

			expect(result).toEqual(diverseCategories);
			expect(result).toHaveLength(3);
		});

		it("should handle edge case with very large product counts and sales", async () => {
			const largeCategories: CategoryRankingEntity[] = [
				{
					Id: { value: "mega-category" },
					Name: "Mega Category",
					ProductCount: Number.MAX_SAFE_INTEGER,
					TotalSales: Number.MAX_SAFE_INTEGER,
					AverageRating: 4.99,
					Rank: 1,
				} as CategoryRankingEntity,
			];

			const inputData = new GetCategoryRankingUseCaseInputData(1);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(largeCategories);

			const result = await useCase.execute(inputData);

			expect(result).toEqual(largeCategories);
			expect(result[0]?.getTotalRevenue()).toBe(Number.MAX_SAFE_INTEGER);
			expect(result[0]?.getSoldCount()).toBe(Number.MAX_SAFE_INTEGER);
		});
	});

	describe("input validation integration", () => {
		it("should fail when trying to create invalid input data", async () => {
			expect(() => {
				const invalidInputData = new GetCategoryRankingUseCaseInputData(-1);
				useCase.execute(invalidInputData);
			}).toThrow("limit is invalid. plese setting over 1.");

			expect(
				mockCategoryRankingRepository.getTopCategories,
			).not.toHaveBeenCalled();
		});

		it("should work only with valid input data", async () => {
			const validInputData = new GetCategoryRankingUseCaseInputData(5);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(mockCategoryRankings);

			const result = await useCase.execute(validInputData);

			expect(result).toEqual(mockCategoryRankings);
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(1);
		});
	});

	describe("repository integration", () => {
		it("should only call getTopCategories method on repository", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(5);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(mockCategoryRankings);

			await useCase.execute(inputData);

			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(1);
		});

		it("should pass correct parameters to repository", async () => {
			const limits = [1, 5, 10, 25, 50];

			for (const limit of limits) {
				vi.clearAllMocks();

				const inputData = new GetCategoryRankingUseCaseInputData(limit);
				vi.mocked(
					mockCategoryRankingRepository.getTopCategories,
				).mockResolvedValueOnce(mockCategoryRankings);

				await useCase.execute(inputData);

				expect(
					mockCategoryRankingRepository.getTopCategories,
				).toHaveBeenCalledWith(limit);
			}
		});
	});

	describe("performance considerations", () => {
		it("should handle requests for very large limits efficiently", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(10000);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValueOnce(mockCategoryRankings);

			const startTime = Date.now();
			const result = await useCase.execute(inputData);
			const endTime = Date.now();

			expect(result).toEqual(mockCategoryRankings);
			expect(endTime - startTime).toBeLessThan(100); // 実行時間が100ms未満であることを確認
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledWith(10000);
		});

		it("should handle multiple concurrent requests", async () => {
			const inputData = new GetCategoryRankingUseCaseInputData(5);

			vi.mocked(
				mockCategoryRankingRepository.getTopCategories,
			).mockResolvedValue(mockCategoryRankings);

			const promises = Array.from({ length: 10 }, () =>
				useCase.execute(inputData),
			);
			const results = await Promise.all(promises);

			expect(results).toHaveLength(10);
			results.forEach((result) => {
				expect(result).toEqual(mockCategoryRankings);
			});
			expect(
				mockCategoryRankingRepository.getTopCategories,
			).toHaveBeenCalledTimes(10);
		});
	});
});
