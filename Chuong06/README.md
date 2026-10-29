# Backend quản lý sinh viên - Bài thực hành Chương 6

Dự án tiếp tục mã nguồn Chương 5, sử dụng Express 5, TypeScript (NodeNext), Sequelize và SQL Server. Chương 6 bổ sung xác thực JWT và phân quyền theo role (student/admin), đồng thời giữ các chức năng CRUD, Zod Validation và access log đã có.

## Yêu cầu

- Node.js 20 trở lên
- pnpm (phiên bản trong `package.json` là nguồn tham chiếu)
- SQL Server đang chạy, đã tạo CSDL và bảng theo các file trong `sql/`
- Mã lớp đưa vào `maLop` phải tồn tại nếu CSDL có khóa ngoại

## Cài đặt và chạy

1. Sao chép `.env.example` thành `.env`, sau đó điền thông tin SQL Server thật của máy bạn. Không đưa `.env` lên Git hoặc chia sẻ công khai.
2. Tạo database/bảng bằng `sql/01-quan-ly-sinh-vien.sql` và `sql/04-users-auth.sql`. Thay placeholder trong `sql/03-app-login.sql` bằng mật khẩu local mạnh rồi chạy script đó để tạo SQL login cho ứng dụng.
3. Tại thư mục này, chạy:

   ```bash
   pnpm install --no-frozen-lockfile
   pnpm build
   pnpm dev
   ```

   `pnpm install --no-frozen-lockfile` sẽ đồng bộ `pnpm-lock.yaml` với các dependency của project nếu cần.
4. Mở `http://localhost:5000/api-docs` để xem Swagger UI (đổi port theo `.env` nếu cần). Health check: `GET http://localhost:5000/health`.

Ứng dụng hiện xác thực kết nối SQL Server trước khi mở cổng; nếu database/credentials chưa đúng, server sẽ chủ động không khởi động. Đây là điều kiện của project Chương 4, không phải lỗi của Zod.

## Nội dung Chương 6

- Đăng ký và đăng nhập bằng email/password; mật khẩu được băm bằng bcrypt.
- Phát hành và xác thực JWT; cấu hình khóa ký qua `JWT_SECRET` và thời hạn qua `JWT_EXPIRES_IN`.
- Bảo vệ route và phân quyền student/admin cho các thao tác quản lý sinh viên.
- Giữ validation dữ liệu sinh viên, OpenAPI và endpoint health từ các chương trước.

## Kiểm thử

Postman collection `postman/Chuong06-Auth-RBAC-SinhVien.postman_collection.json` có các ca kiểm thử auth, JWT và RBAC. Trước khi chạy, cấu hình các collection variables `baseUrl`, `studentPassword`, `adminPassword` và `invalidPassword` trên máy local; không export Environment chứa credentials.

Các lệnh build và chạy được khai báo trong `package.json`. Project không khai báo script test tự động; các request Postman cần database local phù hợp.

## Bảo mật

`.env`, access logs, database seeds chứa dữ liệu cá nhân, screenshots và Postman Environments không thuộc bản chia sẻ này. Dùng credentials riêng cho máy local; không dùng ví dụ làm mật khẩu thật.
