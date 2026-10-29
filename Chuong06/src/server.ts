import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { sequelize } from './config/database.js';
import { swaggerSpec } from './config/swagger.config.js';
import sinhVienRouter from './routes/sinhVien.routes.js';
import authRouter from './routes/auth.routes.js';
import { accessLogger } from './middlewares/access-log.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// Middleware chung
app.use(accessLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());

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

// Middleware xử lý 404
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy đường dẫn',
    data: null,
  });
});

// Middleware xử lý lỗi tập trung
app.use(errorMiddleware);

// Khởi động server sau khi kết nối SQL Server thành công
async function start() {
  try {
    await sequelize.authenticate();

    console.log(
      'Database kết nối thành công: QuanLySinhVienDB'
    );

    app.listen(PORT, () => {
      console.log(
        `Server đang chạy tại http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      'Không thể kết nối SQL Server, server không được khởi động.'
    );

    if (error instanceof Error) {
      console.error(error.message);
    }

    try {
      await sequelize.close();
    } catch {
      // Bỏ qua lỗi khi đóng connection
    }

    process.exitCode = 1;
  }
}

start();
