import type { RequestHandler } from 'express';

export const isAdmin: RequestHandler = (req, res, next): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập',
      data: null,
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (admin)',
      data: null,
    });
    return;
  }

  next();
};
