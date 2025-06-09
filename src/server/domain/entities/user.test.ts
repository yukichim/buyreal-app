import { describe, it, expect, beforeEach } from 'vitest';
import { UserEntity, type User, type UserId } from './user';

describe('UserEntity', () => {
  let userData: User;
  let userEntity: UserEntity;

  beforeEach(() => {
    userData = {
      id: { value: 'user-1' } as UserId,
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      avatar: 'avatar.jpg',
      rating: 4.5,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    userEntity = new UserEntity(userData);
  });

  describe('getters', () => {
    it('should return correct id', () => {
      expect(userEntity.getId()).toEqual({ value: 'user-1' });
    });

    it('should return correct username', () => {
      expect(userEntity.getUsername()).toBe('testuser');
    });

    it('should return correct display name', () => {
      expect(userEntity.getDisplayName()).toBe('Test User');
    });

    it('should return correct rating', () => {
      expect(userEntity.getRating()).toBe(4.5);
    });
  });

  describe('updateProfile', () => {
    it('should update display name and avatar', () => {
      const beforeUpdate = userEntity.toPlainObject().updatedAt;
      
      userEntity.updateProfile('New Display Name', 'new-avatar.jpg');
      
      expect(userEntity.getDisplayName()).toBe('New Display Name');
      expect(userEntity.toPlainObject().avatar).toBe('new-avatar.jpg');
      expect(userEntity.toPlainObject().updatedAt).not.toEqual(beforeUpdate);
    });

    it('should update display name without avatar', () => {
      const originalAvatar = userEntity.toPlainObject().avatar;
      const beforeUpdate = userEntity.toPlainObject().updatedAt;
      
      userEntity.updateProfile('New Display Name');
      
      expect(userEntity.getDisplayName()).toBe('New Display Name');
      expect(userEntity.toPlainObject().avatar).toBe(originalAvatar);
      expect(userEntity.toPlainObject().updatedAt).not.toEqual(beforeUpdate);
    });

    it('should update display name and set avatar when provided', () => {
      const userWithoutAvatar = new UserEntity({
        ...userData,
        avatar: undefined,
      });
      
      userWithoutAvatar.updateProfile('New Name', 'avatar.jpg');
      
      expect(userWithoutAvatar.getDisplayName()).toBe('New Name');
      expect(userWithoutAvatar.toPlainObject().avatar).toBe('avatar.jpg');
    });
  });

  describe('toPlainObject', () => {
    it('should return plain object representation', () => {
      const plainObject = userEntity.toPlainObject();
      
      expect(plainObject).toEqual(userData);
      expect(plainObject).not.toBe(userData); // should be a copy
    });
  });
});
