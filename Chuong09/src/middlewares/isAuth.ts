import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt.js';

export const isAuth: RequestHandler = (req, res, next): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập hoặc thiếu Bearer Token',
        data: null,
      });
      return;
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
        data: null,
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      data: null,
    });
  }
};

