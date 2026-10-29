import fs from 'node:fs';
import type { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  getProfileUser,
  updateUserAvatar,
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

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Tuyệt đối không lấy userId từ req.body mà lấy từ req.user đã xác thực
    const userId = req.user?.id ?? Number(req.user?.sub);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập',
        data: null,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh để tải lên',
        data: null,
      });
      return;
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const result = await updateUserAvatar(userId, avatarUrl);

    res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: result,
    });
  } catch (error) {
    // Tự động dọn dẹp file vừa lưu nếu xảy ra lỗi trong quá trình xử lý
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // Bỏ qua lỗi xóa
      }
    }
    next(error);
  }
};
