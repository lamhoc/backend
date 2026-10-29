import type { ErrorRequestHandler } from 'express';
import multer from 'multer';

import { AppError } from '../utils/AppError.js';

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
): void => {
  // Lỗi JSON sai cú pháp
  if (
    err instanceof SyntaxError &&
    'body' in err
  ) {
    res.status(400).json({
      success: false,
      message: 'JSON gửi lên không đúng cú pháp',
      data: null,
    });

    return;
  }

  // Lỗi từ Multer upload (Chương 07)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        message: 'Dung lượng file vượt quá giới hạn tối đa 2MB',
        data: null,
      });

      return;
    }

    res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`,
      data: null,
    });

    return;
  }

  // Lỗi nghiệp vụ đã xác định statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });

    return;
  }

  // Lỗi không dự kiến
  console.error('Lỗi hệ thống chi tiết:', err);

  res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống',
    data: null,
  });
};
