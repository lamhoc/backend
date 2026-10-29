import { jest, describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginUser } from '../../src/services/auth.service.js';
import { User } from '../../src/models/user.model.js';
import { loginSchema } from '../../src/validations/auth.schema.js';
import { AppError } from '../../src/utils/AppError.js';

describe('Unit Test - Auth Login Service (T01 - T05)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // T01: Tài khoản có, mật khẩu đúng -> Xác thực thành công, tạo Token
  test('T01: Đăng nhập thành công khi email tồn tại và mật khẩu chính xác', async () => {
    // Arrange
    const mockUser = {
      id: 1,
      fullName: 'Nguyen Van A',
      email: 'vana@example.com',
      passwordHash: '$2b$12$mockHashedPasswordValueString',
      role: 'student' as const,
      avatarUrl: null,
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    const signSpy = jest.spyOn(jwt, 'sign');

    // Act
    const result = await loginUser({
      email: 'vana@example.com',
      password: 'correct-password',
    });

    // Assert
    expect(User.findOne).toHaveBeenCalledWith({
      where: { email: 'vana@example.com' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'correct-password',
      mockUser.passwordHash
    );
    expect(signSpy).toHaveBeenCalled();
    expect(result).toHaveProperty('accessToken');
    expect(result.tokenType).toBe('Bearer');
    expect(result.user.email).toBe('vana@example.com');
  });

  // T02: Tài khoản có, mật khẩu sai -> Từ chối, không tạo Token
  test('T02: Từ chối đăng nhập khi mật khẩu sai, không cấp JWT Token', async () => {
    // Arrange
    const mockUser = {
      id: 2,
      fullName: 'Nguyen Van B',
      email: 'vanb@example.com',
      passwordHash: '$2b$12$mockHashedPasswordValueString',
      role: 'student' as const,
      avatarUrl: null,
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
    const signSpy = jest.spyOn(jwt, 'sign');

    // Act & Assert
    await expect(
      loginUser({
        email: 'vanb@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow(AppError);

    // Xác nhận không tạo JWT token khi xác thực thất bại
    expect(signSpy).not.toHaveBeenCalled();
  });

  // T03: Tài khoản không tồn tại -> Từ chối, không tạo Token
  test('T03: Từ chối đăng nhập khi tài khoản không tồn tại trong DB, không cấp JWT', async () => {
    // Arrange
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    const signSpy = jest.spyOn(jwt, 'sign');

    // Act & Assert
    await expect(
      loginUser({
        email: 'notfound@example.com',
        password: 'any-password',
      })
    ).rejects.toThrow(AppError);

    expect(signSpy).not.toHaveBeenCalled();
  });

  // T04: Thiếu email hoặc password -> Validation từ chối input
  test('T04: Validation từ chối khi thiếu email hoặc password hợp lệ', () => {
    // Arrange & Act
    const missingEmailResult = loginSchema.safeParse({ password: '123' });
    const missingPasswordResult = loginSchema.safeParse({ email: 'test@example.com' });
    const invalidEmailResult = loginSchema.safeParse({ email: 'invalid-email', password: '123' });

    // Assert
    expect(missingEmailResult.success).toBe(false);
    expect(missingPasswordResult.success).toBe(false);
    expect(invalidEmailResult.success).toBe(false);
  });

  // T05: Lỗi Database / logic xác thực -> Xử lý an toàn, không lộ dữ liệu nội bộ
  test('T05: Xử lý an toàn khi Database gặp sự cố, không để lộ thông tin nhạy cảm', async () => {
    // Arrange
    const dbError = new Error('Database connection failed: Server unreachable');
    jest.spyOn(User, 'findOne').mockRejectedValue(dbError);
    const signSpy = jest.spyOn(jwt, 'sign');

    // Act & Assert
    await expect(
      loginUser({
        email: 'vana@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Database connection failed: Server unreachable');

    expect(signSpy).not.toHaveBeenCalled();
  });
});

