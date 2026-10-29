import jwt from 'jsonwebtoken';

export interface JwtUserPayload {
  sub: string;
  id: number;
  email: string;
  role: 'student' | 'admin' | string;
  fullName?: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error(
      'Cấu hình lỗi: JWT_SECRET chưa được định nghĩa hoặc bị rỗng trong biến môi trường.'
    );
  }
  return secret.trim();
}

/**
 * Ký tạo Access Token JWT với thuật toán HS256, thời hạn mặc định 1 giờ.
 * Tuyệt đối không chứa password hay thông tin nhạy cảm trong payload.
 */
export function generateToken(
  user: { id: number | string; role: string; email?: string; fullName?: string },
  expiresIn: string = process.env.JWT_EXPIRES_IN || '1h'
): string {
  const payload: JwtUserPayload = {
    sub: String(user.id),
    id: Number(user.id),
    email: user.email ?? '',
    role: user.role,
    fullName: user.fullName,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

/** Alias tương thích ngược */
export const signToken = generateToken;

/**
 * Xác minh tính hợp lệ và chữ ký của JWT token bằng thuật toán HS256.
 * Bắt buộc kiểm tra chữ ký số, không tin jwt.decode.
 */
export function verifyToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  });

  return decoded as JwtUserPayload;
}
