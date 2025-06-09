import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addStampUseCaseInputData,
  AddStampUseCaseInteractor,
} from './addStampUsecase';
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

describe('addStampUseCaseInputData', () => {
  describe('constructor and getters', () => {
    it('should create input data with valid userId', () => {
      const inputData = new addStampUseCaseInputData('user-123');
      expect(inputData.UserId).toBe('user-123');
    });

    it('should handle different userId formats', () => {
      const testCases = [
        'user-1',
        'user_with_underscore',
        'user.with.dots',
        'user@domain.com',
        '123numeric',
        'MixedCase',
      ];

      for (const userId of testCases) {
        const inputData = new addStampUseCaseInputData(userId);
        expect(inputData.UserId).toBe(userId);
      }
    });

    it('should handle empty string userId', () => {
      const inputData = new addStampUseCaseInputData('');
      expect(inputData.UserId).toBe('');
    });

    it('should handle special characters', () => {
      const specialIds = ['user-!@#$%', 'user with spaces', 'user\twith\ttabs'];

      for (const userId of specialIds) {
        const inputData = new addStampUseCaseInputData(userId);
        expect(inputData.UserId).toBe(userId);
      }
    });
  });
});

describe('AddStampUseCaseInteractor', () => {
  let useCase: AddStampUseCaseInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AddStampUseCaseInteractor(mockStampCardRepository);
  });

  describe('execute', () => {
    it('should add stamp to existing stamp card', async () => {
      const userId = 'user-123';
      const existingStampCard = createMockStampCard(userId, 5);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(existingStampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(userId);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(existingStampCard.addStamp).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).toHaveBeenCalledWith(existingStampCard);
      expect(mockStampCardRepository.create).not.toHaveBeenCalled();
    });

    it('should create new stamp card and add stamp when not found', async () => {
      const userId = 'user-456';
      const newStampCard = createMockStampCard(userId, 0);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockResolvedValueOnce(newStampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(userId);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).toHaveBeenCalledWith(userId);
      expect(newStampCard.addStamp).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).toHaveBeenCalledWith(newStampCard);
    });

    it('should handle multiple stamps for same user', async () => {
      const userId = 'user-123';
      const stampCard = createMockStampCard(userId, 3);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValue(stampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValue(undefined);

      // 同じユーザーに複数回スタンプを追加
      await useCase.execute(userId);
      await useCase.execute(userId);
      await useCase.execute(userId);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(3);
      expect(stampCard.addStamp).toHaveBeenCalledTimes(3);
      expect(mockStampCardRepository.save).toHaveBeenCalledTimes(3);
    });

    it('should handle different users', async () => {
      const users = ['user-1', 'user-2', 'user-3'];

      for (const userId of users) {
        vi.clearAllMocks();

        const stampCard = createMockStampCard(userId, 2);
        vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);
        vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

        await useCase.execute(userId);

        expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(userId);
        expect(stampCard.addStamp).toHaveBeenCalledTimes(1);
        expect(mockStampCardRepository.save).toHaveBeenCalledWith(stampCard);
      }
    });

    it('should handle repository findByUserId error', async () => {
      const userId = 'user-123';
      const error = new Error('Database connection failed');

      vi.mocked(mockStampCardRepository.findByUserId).mockRejectedValueOnce(error);

      await expect(useCase.execute(userId)).rejects.toThrow('Database connection failed');

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).not.toHaveBeenCalled();
      expect(mockStampCardRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository create error', async () => {
      const userId = 'user-123';
      const createError = new Error('Failed to create stamp card');

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockRejectedValueOnce(createError);

      await expect(useCase.execute(userId)).rejects.toThrow('Failed to create stamp card');

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save error', async () => {
      const userId = 'user-123';
      const stampCard = createMockStampCard(userId, 5);
      const saveError = new Error('Failed to save stamp card');

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);
      vi.mocked(mockStampCardRepository.save).mockRejectedValueOnce(saveError);

      await expect(useCase.execute(userId)).rejects.toThrow('Failed to save stamp card');

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(stampCard.addStamp).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined/null userId', async () => {
      const userIds = [undefined as any, null as any];

      for (const userId of userIds) {
        vi.clearAllMocks();

        vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);

        await useCase.execute(userId);

        expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(userId);
      }
    });

    it('should handle empty string userId', async () => {
      const userId = '';
      const stampCard = createMockStampCard(userId, 1);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(userId);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith('');
      expect(stampCard.addStamp).toHaveBeenCalledTimes(1);
    });

    it('should handle very long userId', async () => {
      const longUserId = 'a'.repeat(1000);
      const stampCard = createMockStampCard(longUserId, 0);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(longUserId);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledWith(longUserId);
      expect(stampCard.addStamp).toHaveBeenCalledTimes(1);
    });

    it('should preserve execution order when creating new card', async () => {
      const userId = 'user-123';
      const newStampCard = createMockStampCard(userId, 0);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockResolvedValueOnce(newStampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(userId);

      // 実行順序の確認
      const calls = vi.mocked(mockStampCardRepository.findByUserId).mock.calls;
      expect(calls[0][0]).toBe(userId);
      
      expect(mockStampCardRepository.create).toHaveBeenCalledAfter(
        mockStampCardRepository.findByUserId as any
      );
      expect(newStampCard.addStamp).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).toHaveBeenCalledAfter(
        newStampCard.addStamp as any
      );
    });

    it('should work with stamp cards having different stamp counts', async () => {
      const testCases = [
        { userId: 'user-0', currentStamps: 0 },
        { userId: 'user-5', currentStamps: 5 },
        { userId: 'user-9', currentStamps: 9 },
        { userId: 'user-10', currentStamps: 10 },
        { userId: 'user-15', currentStamps: 15 },
      ];

      for (const { userId, currentStamps } of testCases) {
        vi.clearAllMocks();

        const stampCard = createMockStampCard(userId, currentStamps);
        vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);
        vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

        await useCase.execute(userId);

        expect(stampCard.addStamp).toHaveBeenCalledTimes(1);
        expect(mockStampCardRepository.save).toHaveBeenCalledWith(stampCard);
      }
    });
  });

  describe('repository integration', () => {
    it('should follow correct flow for existing stamp card', async () => {
      const userId = 'user-123';
      const stampCard = createMockStampCard(userId, 3);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(stampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(userId);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).not.toHaveBeenCalled();
      expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.addStamp).not.toHaveBeenCalled();
      expect(mockStampCardRepository.useReward).not.toHaveBeenCalled();
    });

    it('should follow correct flow for new stamp card', async () => {
      const userId = 'user-123';
      const newStampCard = createMockStampCard(userId, 0);

      vi.mocked(mockStampCardRepository.findByUserId).mockResolvedValueOnce(null);
      vi.mocked(mockStampCardRepository.create).mockResolvedValueOnce(newStampCard);
      vi.mocked(mockStampCardRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(userId);

      expect(mockStampCardRepository.findByUserId).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.create).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.save).toHaveBeenCalledTimes(1);
      expect(mockStampCardRepository.addStamp).not.toHaveBeenCalled();
      expect(mockStampCardRepository.useReward).not.toHaveBeenCalled();
    });
  });
});
