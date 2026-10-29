# Backend quản lý sinh viên - Bài thực hành Chương 5

Dự án tiếp tục mã nguồn Chương 4, giữ Express 5 + TypeScript (NodeNext) + Sequelize + SQL Server và 5 endpoint CRUD cũ. Chương 5 thêm Zod Validation, Morgan access log và cập nhật OpenAPI hiện có.

## Yêu cầu

- Node.js 20 trở lên
- pnpm (phiên bản trong `package.json` là nguồn tham chiếu)
- SQL Server đang chạy, đã tạo CSDL và bảng theo các file trong `sql/`
- Mã lớp đưa vào `maLop` phải tồn tại nếu CSDL có khóa ngoại

## Cài đặt và chạy

1. Sao chép `.env.example` thành `.env`, sau đó điền thông tin SQL Server thật của máy bạn. Không đưa `.env` lên Git hoặc chia sẻ công khai.
2. Tại thư mục này, chạy:

   ```bash
   pnpm install --no-frozen-lockfile
   pnpm build
   pnpm dev
   ```

   `pnpm install --no-frozen-lockfile` sẽ đồng bộ `pnpm-lock.yaml` với các dependency Chương 5 mới nếu cần.
3. Mở `http://localhost:5000/api-docs` để xem Swagger UI (đổi port theo `.env` nếu cần). Health check: `GET http://localhost:5000/health`.

