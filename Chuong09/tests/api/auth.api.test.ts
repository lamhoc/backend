import { jest, describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../src/app.js';
import { User } from '../../src/models/user.model.js';
import { signToken } from '../../src/utils/jwt.js';

describe('API Integration Test - Supertest Auth Endpoints (A01 - A07)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  // A01: Login hợp lệ -> 200 + Token được cấp
  test('A01: POST /api/auth/login hợp lệ trả về status 200 và cấp JWT token', async () => {
    const mockUser = {
      id: 10,
      fullName: 'Tran Thi B',
      email: 'tranthib@example.com',
      passwordHash: '$2b$12$someValidHashedPasswordMock',
      role: 'student' as const,
      avatarUrl: null,
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'tranthib@example.com',
        password: 'ValidPassword123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.tokenType).toBe('Bearer');
    expect(res.body.data.user.email).toBe('tranthib@example.com');
  });

  // A02: Sai mật khẩu -> 401 + Không có JWT
  test('A02: POST /api/auth/login sai mật khẩu trả về status 401 và không cấp JWT', async () => {
    const mockUser = {
      id: 10,
      fullName: 'Tran Thi B',
      email: 'tranthib@example.com',
      passwordHash: '$2b$12$someValidHashedPasswordMock',
      role: 'student' as const,
      avatarUrl: null,
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'tranthib@example.com',
        password: 'WrongPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.accessToken).toBeUndefined();
  });

  // A03: User không tồn tại -> 401 + Không có JWT
  test('A03: POST /api/auth/login khi tài khoản không tồn tại trả về status 401 và không cấp JWT', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.accessToken).toBeUndefined();
  });

  // A04: Thiếu trường bắt buộc -> 400 + Thông báo Validation
  test('A04: POST /api/auth/login thiếu email hoặc password trả về status 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('errors');
  });

  // A05: GET Profile không có JWT -> 401 + Request bị chặn
  test('A05: GET /api/auth/profile không gửi Bearer token bị chặn với status 401', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // A06: GET Profile có JWT hợp lệ -> 200 + Trả đúng dữ liệu được phép
  test('A06: GET /api/auth/profile kèm Bearer token hợp lệ trả về status 200 và thông tin cá nhân', async () => {
    const mockUser = {
      id: 99,
      fullName: 'Le Van C',
      email: 'levanc@example.com',
      role: 'student' as const,
      avatarUrl: '/uploads/avatar-mock.png',
    };

    jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser as any);

    const token = signToken({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      fullName: mockUser.fullName,
    });

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(mockUser.id);
    expect(res.body.data.email).toBe(mockUser.email);
    expect(res.body.data.avatarUrl).toBe(mockUser.avatarUrl);
  });

  // A07: Lỗi hệ thống giả lập -> 500 + Không lộ SQL / secret
  test('A07: Giả lập sự cố hệ thống không mong muốn trả về status 500 an toàn, không lộ secret', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const token = signToken({
      id: 1,
      email: 'test@example.com',
      role: 'student',
    });

    // Giả lập database bị crash bất ngờ
    jest.spyOn(User, 'findByPk').mockRejectedValue(
      new Error('SELECT * FROM Users WHERE id = 1 - Connection refused: internal credentials password=superSecret')
    );

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    process.env.NODE_ENV = originalEnv;

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.status).toBe(500);
    // Ở production không lộ stack trace, không chứa secret
    expect(res.body.stack).toBeUndefined();
    expect(res.body.message).not.toContain('superSecret');
    expect(res.body.message).toBe('Lỗi hệ thống, vui lòng thử lại sau');
  });
});

