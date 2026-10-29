import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';

import { User } from '../models/user.model.js';
import { generateToken, signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import type { RegisterInput, LoginInput } from '../validations/auth.schema.js';

export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: UserResponseDTO;
}

export async function registerUser(
  input: RegisterInput
): Promise<UserResponseDTO> {
  const existingUser = await User.findOne({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError(409, 'Email đã được đăng ký');
  }

  // Cost 12 theo đúng tài liệu thực hành Chương 6 (Trang 7)
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(input.password, saltRounds);

  // Người dùng đăng ký công khai chỉ được gán vai trò student
  const role = 'student';

  try {
    const user = await User.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'Email đã được đăng ký');
    }
    throw error;
  }
}

export async function loginUser(
  input: LoginInput
): Promise<LoginResponseDTO> {
  const user = await User.findOne({
    where: { email: input.email },
  });

  // Không phân biệt "email không tồn tại" hay "mật khẩu sai" để tránh lộ thông tin người dùng (Trang 8)
  if (!user) {
    throw new AppError(401, 'Email hoặc mật khẩu không chính xác');
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError(401, 'Email hoặc mật khẩu không chính xác');
  }

  const tokenPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(tokenPayload, '1h');

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: '1h',
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getProfileUser(
  userId: number
): Promise<UserResponseDTO> {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError(404, 'Không tìm thấy thông tin tài khoản người dùng');
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}
