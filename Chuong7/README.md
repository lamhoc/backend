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

Ứng dụng hiện xác thực kết nối SQL Server trước khi mở cổng; nếu database/credentials chưa đúng, server sẽ chủ động không khởi động. Đây là điều kiện của project Chương 4, không phải lỗi của Zod.

## Các thay đổi Chương 5

- `src/validations/sinhVien.schema.ts`: Schema POST/PUT; trim chuỗi, email, giới hạn độ dài theo Sequelize Model và từ chối thuộc tính lạ.
- `src/middlewares/validate.middleware.ts`: trả HTTP 400 với `{ success, message, data, errors }` khi body sai; Controller chỉ được chạy khi body hợp lệ.
- `src/middlewares/access-log.middleware.ts`: Morgan ghi nối vào `logs/access.log`, tự tạo thư mục `logs/`.
- `src/routes/sinhVien.routes.ts`: gắn Validation vào POST/PUT hiện tại; GET/DELETE giữ nguyên.
- `src/server.ts`: gắn Morgan trước router và thêm `GET /health` để kiểm tra log.
- `docs/openapi.yaml`: cập nhật field constraints, `ValidationIssue`, `ErrorResponse.errors` và endpoint health.
- `postman/Buoi5-CRUD-SinhVien-Postman-Collection.json`: giữ 12 test CRUD Chương 4 và thêm folder V01-V12 cho Chương 5.

Mã SV vẫn theo quy tắc nghiệp vụ có sẵn `SV` + 3 chữ số; trùng mã vẫn do Service/Database xử lý với HTTP 409, mã lớp không tồn tại vẫn được kiểm tra ở tầng dữ liệu. Validation không thay thế kiểm tra nghiệp vụ.

## Kiểm thử

- Xem folder **Chuong 5 - Validation & Morgan (V01-V12)** trong Postman Collection. Cấu hình `baseUrl` và `maLop` hợp lệ trước khi chạy.
- `V01` tạo `SV006`, nên cần bảo đảm mã này chưa tồn tại và lớp mẫu có trong database; test được thiết kế cho database thử nghiệm.
- Sau khi chạy build, thử `GET /health`, POST body hợp lệ và các case body sai; xác nhận `logs/access.log` có thêm dòng mới. Restart server và gọi thêm request để kiểm tra chế độ append.
- Ghi lại status thực tế và bằng chứng vào `docs/test-results.md`; không đánh dấu PASS nếu chưa chạy với SQL Server thật.
