import type { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  getProfileUser,
} from '../services/auth.service.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id ?? Number(req.user?.sub);
    const data = await getProfileUser(userId);

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin hồ sơ thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};
