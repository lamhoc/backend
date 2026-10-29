import jwt from 'jsonwebtoken';

export interface JwtUserPayload {
  sub: string;
  id: number;
  email: string;
  role: 'student' | 'admin' | string;
  fullName?: string;
}

const SECRET_KEY: string = process.env.JWT_SECRET?.trim() ?? '';
if (!SECRET_KEY) {
  throw new Error('JWT_SECRET environment variable is required.');
}

export function signToken(
  user: { id: number; email: string; role: string; fullName?: string },
  expiresIn: string = '1h'
): string {
  const payload: JwtUserPayload = {
    sub: String(user.id),
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };

  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

export function verifyToken(token: string): JwtUserPayload {
  const decoded = jwt.verify(token, SECRET_KEY, {
    algorithms: ['HS256'],
  });

  return decoded as JwtUserPayload;
}
