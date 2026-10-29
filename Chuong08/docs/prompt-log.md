# Prompt Log - Buổi 5: RESTful CRUD & Swagger

## 1. Nhiệm vụ: Bổ sung API PUT
- **Bối cảnh (Context):** Dự án quản lý sinh viên bằng Express và TypeScript theo kiến trúc Route -> Controller -> Service.
- **Prompt do tôi viết:**
  > Tôi đang làm dự án quản lý sinh viên bằng Express và TypeScript theo kiến trúc Route -> Controller -> Service. Hãy bổ sung PUT /api/v1/sinh-vien/:maSV.
  > 1. Lấy maSV từ URL; body có đủ hoTen, email, malop.
  > 2. Body sai trả 400, không có mã trả 404, thành công trả 200.
  > 3. Giữ nguồn dữ liệu và kiến trúc hiện tại.
  > Chỉ ra file cần sửa, cung cấp code và giải thích luồng xử lý.
- **AI đề xuất thay đổi:** Cập nhật `routes/sinhVien.routes.ts`, `controllers/sinhVien.controller.ts`, và `services/sinhVien.service.ts`.
- **File & Đoạn code tôi đã đọc và sửa:** Thêm phương thức `router.put('/:maSV', ...)` và viết logic cập nhật trong service kiểm tra mã tồn tại.
- **Build thực tế:** `pnpm build` thành công, không có lỗi TypeScript[cite: 22].
- **Cách tôi xác nhận dữ liệu:** Gửi request PUT với body hợp lệ, sau đó gọi request GET để kiểm tra xem thông tin trường `hoTen` đã được đổi thực tế chưa.

---

## 2. Nhiệm vụ: Bổ sung API DELETE
- **Bối cảnh (Context):** Tiếp tục project hiện tại, cần bổ sung chức năng xóa sinh viên[cite: 10].
- **Prompt do tôi viết:**
  > Tiếp tục project trên. Hãy bổ sung DELETE /api/v1/sinh-vien/:maSV.
  > 1. Lấy maSV từ URL và xóa qua Service hiện có.
  > 2. Không tìm thấy trả 404; xóa thành công trả 200 với thông báo.
  > 3. Không thay đổi các API khác và không tạo nguồn dữ liệu mới.
  > Cho tôi code cần sửa theo đúng vị trí file[cite: 10].
- **Cách tôi xác nhận dữ liệu:** Gọi DELETE mã `SV003` (nhận status 200), sau đó gọi GET lại `SV003` (nhận status 404) để chứng minh bản ghi đã biến mất khỏi hệ thống[cite: 10].

---

## 3. Nhiệm vụ: Tạo đặc tả `docs/openapi.yaml`
- **Prompt do tôi viết:** Dựa theo cấu trúc mẫu OpenAPI 3.0.3 trong tài liệu thực hành để tạo đặc tả cho 5 API CRUD sinh viên gồm các schema, tham số và mã phản hồi chuẩn (`200`, `201`, `400`, `404`, `409`, `500`)[cite: 13, 23, 24, 25, 26].

---

## 4. Nâng cấp Chương 5: Zod Validation và Morgan

- **Context:** Tiếp tục project Chương 4 đang dùng Express 5, TypeScript NodeNext, Sequelize/SQL Server, 5 endpoint CRUD và `docs/openapi.yaml`.
- **Task:** Thêm schema Zod riêng cho POST/PUT, middleware `validate(schema)`, ghi access log bằng Morgan và mô tả các lỗi validation trong OpenAPI hiện có.
- **Constraint:** Không tạo project/router/Swagger thứ hai; không đổi URL và tầng dữ liệu; POST giữ `maSV` theo quy tắc `SV` + 3 chữ số, PUT chỉ nhận `hoTen`, `email`, `maLop`; giữ giới hạn cột trong Model; không đưa `.env` vào gói bài.
- **Files added:** `src/validations/sinhVien.schema.ts`, `src/middlewares/validate.middleware.ts`, `src/middlewares/access-log.middleware.ts`.
- **Files updated:** `src/routes/sinhVien.routes.ts`, `src/server.ts`, `package.json`, `.gitignore`, `.env.example`, `docs/openapi.yaml`, `docs/test-results.md`, Postman Collection.
- **Code review:** Zod nằm trước Controller cho POST/PUT; `.strict()` từ chối field lạ; lỗi validation giữ `success/message/data` và thêm `errors`; các kiểm tra nghiệp vụ hiện có trong Service vẫn được giữ; Morgan dùng `flags: 'a'` để append và không ghi request body.
- **Build/Test result:** Chưa xác nhận trong môi trường đóng gói này vì chưa có pnpm/node_modules và không truy cập được registry npm để cài dependency; kết nối SQL Server của dự án cũng cần cấu hình trên máy chạy. Cần chạy `pnpm install --no-frozen-lockfile`, `pnpm build` và Postman V01-V12 trên SQL Server thật rồi cập nhật kết quả thực tế.


---

## 5. Nâng cấp Chương 6: Authentication & Authorization (JWT, Middleware, RBAC)

- **Context:** Nối tiếp dự án quản lý sinh viên từ Chương 5 (Express 5, TypeScript NodeNext, Sequelize 6, SQL Server, Zod, Morgan, Swagger).
- **Task:**
  1. Tạo bảng `dbo.Users` và Model Sequelize `User` (id, fullName, email, passwordHash, role).
  2. Tạo POST `/api/auth/register` (hash mật khẩu bcrypt cost 12, mặc định student, từ chối field role), POST `/api/auth/login` (cấp JWT thời hạn 1h) và GET `/api/auth/profile` (yêu cầu `isAuth`).
  3. Tạo module `src/utils/jwt.ts` để ký và xác minh JWT token với thuật toán `HS256`.
  4. Tạo middleware `isAuth` (xác minh Bearer Token, gán `req.user`) và `isAdmin` (kiểm tra `req.user.role === 'admin'`).
  5. Bảo vệ các route POST, PUT, DELETE SinhVien bằng `isAuth` và `isAdmin`; giữ các route GET public.
  6. Tạo script seed an toàn `src/scripts/seed-admin.ts` phục vụ môi trường dev.
  7. Cập nhật `docs/openapi.yaml` bổ sung Bearer Auth security scheme và mô tả các mã lỗi 401/403.
- **Files added:**
  - `sql/04-users-auth.sql`
  - `src/models/user.model.ts`
  - `src/models/User.ts`
  - `src/utils/jwt.ts`
  - `src/types/express.d.ts`
  - `src/middlewares/isAuth.ts`
  - `src/middlewares/isAdmin.ts`
  - `src/middlewares/auth.middleware.ts`
  - `src/validations/auth.schema.ts`
  - `src/services/auth.service.ts`
  - `src/controllers/auth.controller.ts`
  - `src/routes/auth.routes.ts`
  - `src/scripts/seed-admin.ts`
- **Files updated:**
  - `src/routes/sinhVien.routes.ts`
  - `src/server.ts`
  - `package.json`
  - `.env.example`
  - `.env`
  - `docs/openapi.yaml`
  - `docs/test-results.md`
- **Code review & Security Audit:**
  - Mật khẩu người dùng được băm an toàn bằng bcrypt cost 12, không lưu plaintext trong SQL Server.
  - Tuyệt đối không cho phép client tự gửi `role` khi Register (Zod schema `.strict()` trả 400 nếu có `role`, backend gán cứng `role: 'student'`).
  - Secret key `JWT_SECRET` được tải từ `.env`, có cảnh báo khi thiếu hoặc rỗng.
  - Token JWT sử dụng thuật toán `HS256`, thời hạn hết hạn 1h (`expiresIn: '1h'`), payload gồm `sub` và `role`, không chứa `passwordHash`.
  - Phân tách rõ ràng hai lớp kiểm soát: `isAuth` (401 Unauthorized nếu thiếu/sai/hết hạn token) đặt trước `isAdmin` (403 Forbidden nếu không phải role admin).
  - Không phân biệt "email không tồn tại" hay "sai mật khẩu" khi login để tránh tấn công dò quét tài khoản.
  - Các route GET của sinh viên vẫn public, giữ nguyên vẹn hợp đồng dữ liệu và validation của Chương 4 & 5.
- **Build result:** `pnpm run build` (`tsc`) biên dịch thành công 100%, không có bất kỳ cảnh báo hay lỗi kiểu nào.


---

## 6. Nâng cấp Chương 7: Upload Hình Ảnh (Multer) & Kết Nối Frontend - Backend (Vite, Axios, CORS, RBAC)

- **Context:** Tiếp tục dự án `backend-quan-ly-sinh-vien` từ Chương 6 (JWT, RBAC), bổ sung tính năng tải ảnh đại diện và xây dựng ứng dụng Frontend React độc lập.
- **Tasks & Prompts:**
  - **Prompt 1 (Backend Multer & DB):** Viết script SQL `sql/05-add-avatar-url.sql` thêm cột `avatarUrl` vào `dbo.Users`; cấu hình Multer (`src/middlewares/upload.middleware.ts`) giới hạn 2MB (HTTP 413), kiểm tra định dạng và Magic Bytes ảnh thật, sinh tên UUID; viết API `POST /api/auth/me/avatar` bảo vệ bởi `isAuth`; cấu hình `express.static` phục vụ ảnh tĩnh trong `public/uploads` và CORS cho origin `http://localhost:5173`.
  - **Prompt 2 (Frontend React + Vite):** Khởi tạo project trong `frontend/` bằng Vite + React + TS; cấu hình Axios lưu JWT trong memory; xây dựng màn hình Đăng nhập, Hồ sơ cá nhân (hiển thị role, avatar), Bảng sinh viên (Loading, Error, Empty) và cơ chế RBAC (chỉ Admin mới thấy và thực hiện xóa sinh viên).
- **Files added/updated:**
  - `sql/05-add-avatar-url.sql`
  - `src/models/user.model.ts`
  - `src/middlewares/upload.middleware.ts`
  - `src/middlewares/error.middleware.ts`
  - `src/routes/auth.routes.ts`
  - `src/controllers/auth.controller.ts`
  - `src/services/auth.service.ts`
  - `src/server.ts`
  - `docs/openapi.yaml`
  - `docs/test-results.md`
  - `frontend/` (Toàn bộ project React độc lập)
- **Kiểm tra và sửa code AI (Review & Refinement):**
  1. *Lần 1 - Magic Bytes verification:* Phát hiện chỉ kiểm tra mimetype và extension là chưa đủ (người dùng có thể đổi đuôi file `.txt` thành `.png`). Đã bổ sung hàm `isValidImageSignature()` đọc 8 byte đầu của file trên đĩa để kiểm tra chữ ký chuẩn của JPEG (`FF D8 FF`) và PNG (`89 50 4E 47...`). Nếu giả mạo, lập tức gọi `fs.unlinkSync()` xóa file rác và trả lỗi 400.
  2. *Lần 2 - Mã lỗi kích thước 413:* Cấu hình Multer báo lỗi `LIMIT_FILE_SIZE` trả về đúng mã chuẩn HTTP **413 Payload Too Large** thay vì 400 hoặc 500 chung chung.
  3. *Lần 3 - An toàn danh tính người dùng:* Tuyệt đối không đọc `userId` từ `req.body` trong endpoint `/me/avatar` để tránh việc Student A sửa ảnh của Student B; toàn bộ ID được trích xuất trực tiếp từ `req.user.id` do middleware `isAuth` cung cấp.
  4. *Lần 4 - Helmet CORS Policy:* Cấu hình `crossOriginResourcePolicy: { policy: 'cross-origin' }` trong Helmet để trình duyệt tại `http://localhost:5173` có thể tải và render ảnh tĩnh từ server `http://localhost:5000/uploads/...` mà không bị chặn CORP.
- **Build result:** Cả Backend (`pnpm run build`) và Frontend (`pnpm --dir frontend run build`) đều biên dịch thành công 100%, không phát sinh bất kỳ lỗi TypeScript hay cảnh báo nào.


---

## 7. Nâng cấp Chương 8: Phân Trang, Tìm Kiếm & Xử Lý Lỗi Tập Trung

- **Context:** Dự án `backend-quan-ly-sinh-vien` từ Chương 07, nâng cấp API `GET /api/v1/sinh-vien` hỗ trợ tìm kiếm và phân trang tại SQL Server; chuẩn hóa Global Error Handling.
- **Tasks & Prompts:**
  - **Prompt 1 (Lab 1 - Phân trang & Tìm kiếm):** Viết Zod query validation (`src/validations/sinhVien.query.ts`) cho `page` (nguyên >= 1), `limit` (1-50), `search` (chuỗi trim, max 80); nâng cấp `layDanhSachSinhVien` trong `sinhVien.service.ts` dùng `findAndCountAll`, `Op.like` cho `hoTen`, `offset = (page - 1) * limit`, `order: [['maSV', 'ASC']]`; cập nhật Controller trả `{ success, message, data: [...], pagination: { page, limit, totalItems, totalPages } }`; cập nhật `docs/openapi.yaml`.
  - **Prompt 2 (Lab 2 - Xử lý lỗi tập trung):** Nâng cấp `AppError` thêm cờ `isOperational`; chuẩn hóa Global Error Middleware trả JSON `{ success: false, status, message, data: null }`; ẩn chi tiết lỗi và stack trace khi `NODE_ENV === 'production'`; tận dụng cơ chế native async error handling của Express 5 để loại bỏ try-catch thừa thãi trong Controller; đặt fallback 404 sau routes và trước Error Middleware.
- **Phản biện & Sửa lỗi code AI bắt buộc (AI Review & Audit):**
  1. *Phản biện 1 (Phân trang giả lập bằng slice):*
     - **Vấn đề phát hiện:** AI ban đầu đề xuất gọi `SinhVien.findAll()` lấy toàn bộ dữ liệu về Node.js rồi dùng `Array.slice(offset, offset + limit)` để chia trang.
     - **Nguyên nhân không đạt:** Khi cơ sở dữ liệu có hàng chục ngàn sinh viên, việc tải toàn bộ bảng lên RAM server sẽ gây cạn kiệt bộ nhớ, làm nghẽn đường truyền mạng và giảm nghiêm trọng hiệu năng hệ thống.
     - **Cách sửa:** Viết lại truy vấn phân trang thực sự tại Database Engine bằng `SinhVien.findAndCountAll({ where, limit, offset, order })`. SQL Server sẽ trực tiếp dùng cú pháp `OFFSET ... ROWS FETCH NEXT ... ROWS ONLY` và chỉ truyền đúng số lượng bản ghi cần thiết về server.
  2. *Phản biện 2 (Lộ thông tin nội bộ qua lỗi 500):*
     - **Vấn đề phát hiện:** AI đề xuất trả trực tiếp `err.message` và `err.stack` trong mọi response lỗi 500.
     - **Rủi ro bảo mật:** Ở môi trường production, việc trả stack trace và lỗi SQL nội bộ sẽ làm lộ cấu trúc bảng, tên cột, đường dẫn thư mục server, và các đoạn truy vấn nhạy cảm, giúp hacker dễ dàng khai thác các lỗ hổng SQL Injection hoặc server probing.
     - **Cách sửa:** Chuẩn hóa Error Middleware để khi `NODE_ENV === 'production'`, mã lỗi 500 chỉ trả về thông báo chung: `"Lỗi hệ thống, vui lòng thử lại sau"`, tuyệt đối không có trường `stack`. Trường `stack` và thông báo chi tiết chỉ được phép bật ở môi trường `NODE_ENV === 'development'` để phục vụ lập trình viên debug cục bộ.
- **Build result:** Cả Backend (`pnpm run build`) và Frontend (`pnpm --dir frontend run build`) đều biên dịch thành công 100%.
