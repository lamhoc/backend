# Backend quản lý sinh viên - Bài thực hành Chương 8

Dự án dùng Express 5, TypeScript (NodeNext), Sequelize và SQL Server. Chương 8 bổ sung phân trang, tìm kiếm tại database và chuẩn hóa xử lý lỗi.

## Yêu cầu

- Node.js 20 trở lên
- pnpm 10.34.6
- SQL Server đang chạy, đã tạo CSDL và bảng theo các file trong `sql/`
- Mã lớp đưa vào `maLop` phải tồn tại nếu CSDL có khóa ngoại

## Cài đặt và chạy

1. Sao chép `.env.example` thành `.env`, sau đó điền `DB_PASSWORD`, `JWT_SECRET` và `ADMIN_PASSWORD` bằng giá trị riêng của môi trường cục bộ. Không đưa `.env` lên Git hoặc chia sẻ công khai.
2. Khi chạy `sql/03-app-login.sql`, bật SQLCMD Mode trong SSMS và đặt biến `SV_APP_PASSWORD` bằng cùng giá trị với `DB_PASSWORD`.
3. Tại thư mục này, chạy:

   ```bash
   pnpm install --no-frozen-lockfile
   pnpm build
   pnpm dev
   ```

   `pnpm install --no-frozen-lockfile` giữ nguyên theo hướng dẫn của project và đồng bộ lockfile nếu dependency thay đổi.
4. Mở `http://localhost:5000/api-docs` để xem Swagger UI (đổi port theo `.env` nếu cần). Health check: `GET http://localhost:5000/health`.

Ứng dụng hiện xác thực kết nối SQL Server trước khi mở cổng; nếu database/credentials chưa đúng, server sẽ chủ động không khởi động. Đây là điều kiện của project Chương 4, không phải lỗi của Zod.

## Nội dung Chương 8

- `src/services/sinhVien.service.ts`: phân trang và tìm kiếm tại database.
- `src/middlewares/error.middleware.ts`: chuẩn hóa phản hồi lỗi.
- `docs/openapi.yaml`: đặc tả API.
- `postman/Chuong08-Pagination-Search-Errors.postman_collection.json`: kiểm thử phân trang, tìm kiếm, xử lý lỗi và hồi quy.
- Các giá trị đăng nhập trong Postman được cấu hình qua biến local; không lưu credentials hoặc token trong collection.

Mã SV vẫn theo quy tắc nghiệp vụ có sẵn `SV` + 3 chữ số; trùng mã vẫn do Service/Database xử lý với HTTP 409, mã lớp không tồn tại vẫn được kiểm tra ở tầng dữ liệu. Validation không thay thế kiểm tra nghiệp vụ.

## Kiểm thử

- Import collection Chương 8 trong `postman/`, rồi cấu hình biến local `studentEmail`, `studentPassword`, `adminEmail` và `adminPassword` trước khi chạy nhóm Auth Setup.
- Chạy các ca P01-P17 và E01-E10 với database thử nghiệm.
- Ghi lại status thực tế và bằng chứng vào `docs/test-results.md`; không đánh dấu PASS nếu chưa chạy với SQL Server thật.
