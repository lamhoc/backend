import 'dotenv/config';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';
import { User } from '../models/user.model.js';

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminFullName = process.env.ADMIN_NAME || 'Quản trị viên Hệ thống';

  try {
    await sequelize.authenticate();
    console.log('Kết nối cơ sở dữ liệu thành công.');

    const existed = await User.findOne({ where: { email: adminEmail } });

    if (existed) {
      console.log(
        `Tài khoản admin với email "${adminEmail}" đã tồn tại (ID: ${existed.id}, Role: ${existed.role}). Không ghi đè.`
      );
      return;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    const newAdmin = await User.create({
      fullName: adminFullName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });

    console.log(' Tạo tài khoản Admin thành công:');
    console.log(`- ID: ${newAdmin.id}`);
    console.log(`- Họ tên: ${newAdmin.fullName}`);
    console.log(`- Email: ${newAdmin.email}`);
    console.log(`- Role: ${newAdmin.role}`);
    console.log(`- PasswordHash: ${newAdmin.passwordHash}`);
    console.log('Lưu ý: Mật khẩu plaintext chỉ dùng cho môi trường dev cục bộ.');
  } catch (error) {
    console.error('Lỗi khi seed tài khoản Admin:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedAdmin();

