import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GetStampCardUseCaseInputData,
  GetStampCardUseCaseInteractor,
} from './getStampUsecase';
import type { StampCardRepository } from '~/server/domain/repositories/stampCardRepository';
import type { StampCardEntity } from '~/server/domain/entities/stampCardEntity';

// StampCardRepositoryのモック
const mockStampCardRepository: StampCardRepository = {
  findByUserId: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  addStamp: vi.fn(),
  useReward: vi.fn(),
};

// サンプルStampCardEntityのモック
const createMockStampCard = (userId: string, stampCount = 0): StampCardEntity => ({
  Id: { value: `stamp-card-${userId}` },
  UserId: userId,
  StampCount: stampCount,
  TotalStamps: stampCount,
  LastStampDate: new Date(),
  addStamp: vi.fn(),
  canUseReward: vi.fn().mockReturnValue(stampCount >= 10),
  useReward: vi.fn(),
}) as StampCardEntity;

describe('GetStampCardUseCaseInputData', () => {
  describe('constructor and validation', () => {
    it('should create input data with valid userId', () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');
      expect(inputData.UserId).toBe('user-123');
    });

    it('should create input data with different valid userIds', () => {
      const testCases = ['user-1', 'abc123', 'user_with_underscore', 'user-with-dash'];

      for (const userId of testCases) {
        const inputData = new GetStampCardUseCaseInputData(userId);
        expect(inputData.UserId).toBe(userId);
      }
    });

    it('should throw error when userId is empty string', () => {
      expect(() => new GetStampCardUseCaseInputData('')).toThrow(
        'userID is invalid.'
      );
    });

    it('should throw error when userId is null', () => {
      expect(() => new GetStampCardUseCaseInputData(null as any)).toThrow(
        'userID is invalid.'
      );
    });

    it('should throw error when userId is undefined', () => {
      expect(() => new GetStampCardUseCaseInputData(undefined as any)).toThrow(
        'userID is invalid.'
      );
    });

    it('should throw error when userId is whitespace only', () => {
      const whitespaceIds = [' ', '  ', '\t', '\n', '\r\n'];

      for (const userId of whitespaceIds) {
        expect(() => new GetStampCardUseCaseInputData(userId)).toThrow(
          'userID is invalid.'
        );
      }
    });

    it('should accept userId with valid special characters', () => {
      // 有効な特殊文字を含むuserIdをテスト
      const validIds = ['user-123', 'user_456', 'user.789', 'user@domain.com'];

      for (const userId of validIds) {
        const inputData = new GetStampCardUseCaseInputData(userId);
        expect(inputData.UserId).toBe(userId);
      }
    });
  });

  describe('getters', () => {
    it('should return correct userId value', () => {
      const userId = 'test-user-123';
      const inputData = new GetStampCardUseCaseInputData(userId);
      expect(inputData.UserId).toBe(userId);
    });

    it('should preserve original userId format', () => {
      const testCases = [
        'UPPERCASE',
        'lowercase',
        'MixedCase',
        '123numbers',
        'special-chars_test',
      ];

      for (const userId of testCases) {
        const inputData = new GetStampCardUseCaseInputData(userId);
        expect(inputData.UserId).toBe(userId);
      }
    });
  });
});

describe('GetStampCardUseCaseInteractor', () => {
  let useCase: GetStampCardUseCaseInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetStampCardUseCaseInteractor(mockStampCardRepository);
  });

  describe('execute', () => {
    it('should return existing stamp card when found', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');
      const existingStampCard = createMockStampCard('user-123', 5);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(existingStampCard);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(existingStampCard);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(mockStampCardRepository.create).not.toHaveBeenCalled();
    });

    it('should create new stamp card when not found', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-456');
      const newStampCard = createMockStampCard('user-456', 0);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockResolvedValueOnce(newStampCard);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(newStampCard);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith('user-456');
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).toHaveBeenCalledWith('user-456');
    });

    it('should handle multiple different users', async () => {
      const users = ['user-1', 'user-2', 'user-3'];

      for (const userId of users) {
        vi.clearAllMocks();

        const inputData = new GetStampCardUseCaseInputData(userId);
        const existingStampCard = createMockStampCard(userId, 3);

        vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(existingStampCard);

        const result = await useCase.execute(inputData);

        expect(result).toEqual(existingStampCard);
        expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(userId);
      }
    });

    it('should handle repository findByUserId error', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');
      const error = new Error('Database connection failed');

      vi.mocked(mockStampCardRepository.findByUserId).mockRejectedValueOnce(error);

      await expect(useCase.execute(inputData)).rejects.toThrow('Database connection failed');

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).not.toHaveBeenCalled();
    });

    it('should handle repository create error', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');
      const createError = new Error('Failed to create stamp card');

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockRejectedValueOnce(createError);

      await expect(useCase.execute(inputData)).rejects.toThrow('Failed to create stamp card');

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should work with users having different stamp counts', async () => {
      const testCases = [
        { userId: 'user-new', stampCount: 0 },
        { userId: 'user-few', stampCount: 3 },
        { userId: 'user-many', stampCount: 15 },
        { userId: 'user-full', stampCount: 20 },
      ];

      for (const { userId, stampCount } of testCases) {
        vi.clearAllMocks();

        const inputData = new GetStampCardUseCaseInputData(userId);
        const stampCard = createMockStampCard(userId, stampCount);

        vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);

        const result = await useCase.execute(inputData);

        expect(result).toEqual(stampCard);
        expect(result.StampCount).toBe(stampCount);
      }
    });

    it('should handle edge case where findByUserId returns undefined', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');
      const newStampCard = createMockStampCard('user-123', 0);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(undefined as any);
      vi.mocked(mockStampCardRepository.create).mockResolvedValueOnce(newStampCard);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(newStampCard);
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle consecutive calls for same user', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');
      const stampCard = createMockStampCard('user-123', 7);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValue(stampCard);

      // 同じユーザーに対して複数回呼び出し
      const result1 = await useCase.execute(inputData);
      const result2 = await useCase.execute(inputData);

      expect(result1).toEqual(stampCard);
      expect(result2).toEqual(stampCard);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(2);
      expect(mockStampCardRepository.create).not.toHaveBeenCalled();
    });

    it('should handle consecutive calls for different users', async () => {
      const inputData1 = new GetStampCardUseCaseInputData('user-1');
      const inputData2 = new GetStampCardUseCaseInputData('user-2');
      
      const stampCard1 = createMockStampCard('user-1', 5);
      const stampCard2 = createMockStampCard('user-2', 0);

      vi.mocked(mockStampCardRepository.findByUserId)
        .mockResolvedValueOnce(stampCard1)
        .mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockResolvedValueOnce(stampCard2);

      const result1 = await useCase.execute(inputData1);
      const result2 = await useCase.execute(inputData2);

      expect(result1).toEqual(stampCard1);
      expect(result2).toEqual(stampCard2);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(2);
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should work with special userId formats', async () => {
      const specialUserIds = [
        'user@domain.com',
        'user-with-dashes',
        'user_with_underscores',
        'user.with.dots',
        'User123',
      ];

      for (const userId of specialUserIds) {
        vi.clearAllMocks();

        const inputData = new GetStampCardUseCaseInputData(userId);
        const stampCard = createMockStampCard(userId, 2);

        vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);

        const result = await useCase.execute(inputData);

        expect(result).toEqual(stampCard);
        expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(userId);
      }
    });
  });

  describe('repository integration', () => {
    it('should call appropriate repository methods in correct order', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');

      // 既存のスタンプカードが見つかる場合
      const existingStampCard = createMockStampCard('user-123', 8);
      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(existingStampCard);

      await useCase.execute(inputData);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).not.toHaveBeenCalled();
      expect(mockStampCardRepository.save).not.toHaveBeenCalled();
      expect(mockStampCardRepository.addStamp).not.toHaveBeenCalled();
      expect(mockStampCardRepository.useReward).not.toHaveBeenCalled();
    });

    it('should call appropriate repository methods when creating new card', async () => {
      const inputData = new GetStampCardUseCaseInputData('user-123');
      const newStampCard = createMockStampCard('user-123', 0);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockResolvedValueOnce(newStampCard);

      await useCase.execute(inputData);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).not.toHaveBeenCalled();
      expect(mockStampCardRepository.addStamp).not.toHaveBeenCalled();
      expect(mockStampCardRepository.useReward).not.toHaveBeenCalled();
    });
  });
});
