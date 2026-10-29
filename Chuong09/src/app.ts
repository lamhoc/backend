import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger.config.js';
import sinhVienRouter from './routes/sinhVien.routes.js';
import authRouter from './routes/auth.routes.js';
import { accessLogger } from './middlewares/access-log.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

export const app = express();

// Cấu hình CORS cho phép origin http://localhost:5173 (Vite Frontend)
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware bảo mật Helmet - cấu hình cross-origin để frontend hiển thị được ảnh tĩnh
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Ghi access log
app.use(accessLogger);

// Xử lý JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình express.static phục vụ ảnh tĩnh trong public/uploads
const uploadsPath = path.resolve(process.cwd(), 'public/uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/public/uploads', express.static(uploadsPath));

// Swagger UI: phải đặt trước middleware 404
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Endpoint health để kiểm tra server và Morgan access.log.
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend đang hoạt động',
    data: { status: 'ok' },
  });
});

// Endpoint gốc kiểm tra server
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend quản lý sinh viên đang hoạt động',
  });
});

// Gắn route xác thực người dùng
app.use('/api/auth', authRouter);
app.use('/api/v1/auth', authRouter);

// Gắn route sinh viên
app.use('/api/v1/sinh-vien', sinhVienRouter);

// Middleware xử lý 404 (đặt sau tất cả các route và trước Error Middleware)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: 'Không tìm thấy đường dẫn',
    data: null,
  });
});

// Middleware xử lý lỗi tập trung
app.use(errorMiddleware);

