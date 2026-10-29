import type { ErrorRequestHandler } from 'express';
import multer from 'multer';

import { AppError } from '../utils/AppError.js';

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  next
): void => {
  // Nếu response header đã được gửi đi, chuyển tiếp cho handler mặc định của Express
  if (res.headersSent) {
    return next(err);
  }

  const isDev = process.env.NODE_ENV === 'development';

  // 1. Lỗi JSON body sai cú pháp
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      status: 400,
      message: 'JSON gửi lên không đúng cú pháp',
      data: null,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // 2. Lỗi từ Multer upload (Chương 07)
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Dung lượng file vượt quá giới hạn tối đa 2MB'
        : `Lỗi upload: ${err.message}`;

    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message,
      data: null,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // 3. Lỗi nghiệp vụ AppError đã xác định statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
      data: null,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // 4. Lỗi hệ thống không dự kiến (HTTP 500)
  console.error(' [Lỗi hệ thống 500]:', err);

  const statusCode = 500;
  const message = isDev
    ? err.message || 'Lỗi hệ thống'
    : 'Lỗi hệ thống, vui lòng thử lại sau';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    data: null,
    ...(isDev && { stack: err.stack }),
  });
};
