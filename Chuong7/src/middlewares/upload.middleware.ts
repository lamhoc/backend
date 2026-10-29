import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';

const UPLOAD_DIR = path.resolve(process.cwd(), 'public/uploads');

// Đảm bảo thư mục public/uploads tồn tại
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Cấu hình lưu trữ file với tên an toàn UUID
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

// Lọc file theo mimetype và extension
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  const allowedExts = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Giới hạn 2MB
  },
  fileFilter,
}).single('avatar');

// Kiểm tra chữ ký số (Magic Bytes) thực sự của file ảnh
function isValidImageSignature(filePath: string): boolean {
  try {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    // JPEG signature: FF D8 FF
    const isJpeg =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;

    return isJpeg || isPng;
  } catch {
    return false;
  }
}

// Middleware Multer xử lý upload, bắt lỗi 413 và kiểm tra Magic Bytes
export const uploadAvatarMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload(req, res, (err: unknown) => {
    if (err) {
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

      if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
        res.status(400).json({
          success: false,
          message: 'Chỉ chấp nhận định dạng ảnh JPEG hoặc PNG',
          data: null,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: 'Lỗi trong quá trình upload file',
        data: null,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp file ảnh với trường tên "avatar"',
        data: null,
      });
      return;
    }

    // Kiểm tra Magic Bytes của file thực tế trên đĩa
    const isValid = isValidImageSignature(req.file.path);
    if (!isValid) {
      // Dọn dẹp file rác ngay lập tức
      try {
        fs.unlinkSync(req.file.path);
      } catch {
        // Bỏ qua lỗi xóa
      }

      res.status(400).json({
        success: false,
        message: 'Nội dung file không phải là ảnh JPEG hoặc PNG hợp lệ',
        data: null,
      });
      return;
    }

    next();
  });
};
