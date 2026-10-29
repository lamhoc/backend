import 'dotenv/config';
import { app } from './app.js';
import { sequelize } from './config/database.js';

const PORT = Number(process.env.PORT ?? 5000);

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
