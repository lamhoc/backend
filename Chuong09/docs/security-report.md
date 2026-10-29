# Security Review – Chapter 09

**Nguồn code đã kiểm tra:**
- `src/app.ts` & `src/server.ts`
- `src/routes/auth.routes.ts`, `src/routes/sinhVien.routes.ts`
- `src/middlewares/rate-limit.middleware.ts`, `src/middlewares/error.middleware.ts`, `src/middlewares/isAuth.ts`, `src/middlewares/isAdmin.ts`
- `src/services/auth.service.ts`, `src/services/sinhVien.service.ts`
- `src/validations/auth.schema.ts`, `src/validations/sinhVien.query.ts`
- `frontend/src/components/SinhVienTable.tsx`, `frontend/src/components/LoginForm.tsx`

---

## 1. Phạm vi và Phương pháp Review
Review tĩnh mã nguồn (Static Code Analysis) và kiểm thử động (Dynamic Security Testing qua Postman/Supertest) tập trung vào các bề mặt tấn công chính của hệ thống Backend RESTful API:
1. **Bảo vệ tiêu đề HTTP (Security Headers):** Helmet middleware.
2. **Kiểm soát tần suất gọi API (Rate Limiting & Anti-Brute-Force):** Giới hạn trên endpoint nhạy cảm `POST /api/auth/login`.
3. **Phòng chống SQL Injection:** Cơ chế tham số hóa truy vấn của ORM Sequelize khi tìm kiếm và phân trang.
4. **Phòng chống Cross-Site Scripting (XSS):** Cơ chế render dữ liệu đầu ra ở phía Backend và giao diện React Frontend.
5. **Bảo mật bí mật và thông tin nhạy cảm:** Biến môi trường `.env`, ghi log hệ thống (`access-log`), che giấu stack trace khi có lỗi máy chủ 500 ở môi trường Production.
6. **Xác thực và phân quyền (Authentication & Authorization):** Kiểm tra thứ tự thực thi middleware, tính hợp lệ của JWT và RBAC role `admin` vs `student`.

---

## 2. Phát hiện & Đánh giá Rủi ro

| Vị trí (File & Dòng) | Danh mục rủi ro | Mức độ | Nguyên nhân & Nguy cơ | Giải pháp khắc phục đã thực hiện | File thay đổi | Phương thức kiểm thử |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| `src/routes/auth.routes.ts` | **Brute-force / Credential Stuffing** | Cao | Endpoint `POST /login` trước đây không có giới hạn tần suất gọi, kẻ tấn công có thể dùng từ điển dò mật khẩu tự động. | Bổ sung `loginLimiter` với `express-rate-limit` (tối đa 5 request/60 giây), trả về chuẩn lỗi HTTP 429. | `src/middlewares/rate-limit.middleware.ts`, `src/routes/auth.routes.ts` | Gửi 6 request liên tiếp qua Postman; request thứ 6 trả về 429 Too Many Requests (Test S02). |
| `src/app.ts` | **Mất mát Security Headers / MIME Sniffing / Clickjacking** | Trung bình | Express mặc định để lộ header `X-Powered-By: Express` và thiếu các header bảo vệ như `X-Content-Type-Options`, `X-Frame-Options`. | Cấu hình thư viện `helmet()` toàn cục, tùy biến `crossOriginResourcePolicy: { policy: 'cross-origin' }` để frontend tải được ảnh upload. | `src/app.ts` | Dùng Postman hoặc DevTools kiểm tra Response Headers (Test S05). |
| `src/services/sinhVien.service.ts` | **SQL Injection qua tham số Search** | Nghiêm trọng (Đã kiểm soát tốt) | Nếu dùng chuỗi ghép `LIKE '%${search}%'` trực tiếp vào câu lệnh SQL sẽ bị SQL Injection. | Sử dụng toán tử `Op.like` của Sequelize ORM kèm ký tự đại diện chuẩn `[Op.like]: \`%${search}%\``. Sequelize tự động chuyển đổi thành câu lệnh tham số hóa `@p0`. | `src/services/sinhVien.service.ts` | Gửi chuỗi độc hại `' OR 1=1 --` qua `?search=`. Hệ thống xử lý an toàn như chuỗi tìm kiếm thông thường. |
| `src/middlewares/error.middleware.ts` | **Lộ lọt thông tin nhạy cảm (Information Disclosure)** | Cao | Khi CSDL crash hoặc ném exception, nếu trả nguyên `err.stack` hoặc chuỗi kết nối chứa mật khẩu ra client sẽ bị lộ hạ tầng. | Tách biệt response theo `process.env.NODE_ENV`. Ở môi trường `production`, ẩn hoàn toàn `stack`, chỉ trả thông điệp an toàn `"Lỗi hệ thống, vui lòng thử lại sau"`. | `src/middlewares/error.middleware.ts` | Test A07 / E06 với `NODE_ENV=production` giả lập lỗi DB. |
| `frontend/src/` | **Cross-Site Scripting (XSS)** | Trung bình (Đã kiểm soát tốt) | Sinh viên có tên chứa mã HTML/JavaScript độc hại `<script>alert(1)</script>`. | React mặc định tự động escape tất cả nội dung text trong JSX; không sử dụng thuộc tính nguy hiểm `dangerouslySetInnerHTML`. | `frontend/src/components/SinhVienTable.tsx` | Nhập tên chứa `<script>`; React hiển thị dưới dạng văn bản thuần, không kích hoạt script. |
| `src/routes/sinhVien.routes.ts` | **Thiếu phân quyền (Privilege Escalation)** | Cao (Đã kiểm soát tốt) | User có quyền `student` cố tình gọi API xóa sinh viên `DELETE /api/v1/sinh-vien/:maSV`. | Bắt buộc middleware `isAuth` xác thực JWT trước, sau đó là `isAdmin` kiểm tra `req.user.role === 'admin'`. Nếu là student trả về HTTP 403 Forbidden. | `src/routes/sinhVien.routes.ts` | Test A06 / S07 / B06. |

---

## 3. Điều chỉnh Đã Thực Hiện Trong Mã Nguồn

1. **Tích hợp Helmet (`src/app.ts`):**
   ```typescript
   import helmet from 'helmet';
   // Bảo vệ headers, cho phép cross-origin để frontend tải avatar
   app.use(
     helmet({
       crossOriginResourcePolicy: { policy: 'cross-origin' },
     })
   );
   ```

2. **Tạo và gắn Rate Limiter (`src/middlewares/rate-limit.middleware.ts` & `src/routes/auth.routes.ts`):**
   ```typescript
   export const loginLimiter = rateLimit({
     windowMs: 60 * 1000,
     max: 5,
     standardHeaders: true,
     legacyHeaders: false,
     handler: (_req, res) => {
       res.status(429).json({
         success: false,
         status: 429,
         message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 60 giây.',
         data: null,
       });
     },
   });

   // Gắn riêng vào POST /login
   router.post('/login', loginLimiter, validate(loginSchema), login);
   ```

3. **Củng cố Error Handler bảo vệ Secret (`src/middlewares/error.middleware.ts`):**
   ```typescript
   const isDev = process.env.NODE_ENV === 'development';
   const message = isDev
     ? err.message || 'Lỗi hệ thống'
     : 'Lỗi hệ thống, vui lòng thử lại sau';

   res.status(500).json({
     success: false,
     status: 500,
     message,
     data: null,
     ...(isDev && { stack: err.stack }),
   });
   ```

---

## 4. Kết Quả Kiểm Thử Bảo Mật (Ma trận S01–S07)

| Mã | Kịch bản kiểm thử | Kỳ vọng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **S01** | Gửi 5 request đăng nhập đầu tiên trong 60 giây | Xử lý login bình thường (200 nếu đúng, 401 nếu sai) | Trả về 200 hoặc 401 tương ứng thông tin đăng nhập | **PASS** |
| **S02** | Gửi request đăng nhập thứ 6 trong cùng 60 giây | Nhận HTTP 429 Too Many Requests | HTTP 429, trả message yêu cầu thử lại sau 60s | **PASS** |
| **S03** | Đợi hết cửa sổ thời gian 60 giây và gửi lại | Được cấp hạn mức mới (200/401 bình thường) | Hạn mức được reset, xử lý request bình thường | **PASS** |
| **S04** | Gọi GET danh sách sinh viên nhiều lần liên tục | Không bị ảnh hưởng bởi giới hạn của Login | Trả về 200 kèm danh sách sinh viên và phân trang | **PASS** |
| **S05** | Kiểm tra Response Headers của server | Có đầy đủ các header bảo mật của Helmet | Xuất hiện `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`... Ẩn `X-Powered-By`. | **PASS** |
| **S06** | Thử đăng nhập sai mật khẩu trước khi đạt hạn mức | Nhận HTTP 401, tuyệt đối không cấp JWT Token | Trả về 401, `data: null`, không có token | **PASS** |
| **S07** | Đăng nhập tài khoản Student rồi gọi `DELETE /api/v1/sinh-vien/:maSV` | Bị chặn với HTTP 403 Forbidden | Middleware `isAdmin` chặn với status 403, DB không đổi | **PASS** |

---

## 5. Các Rủi Ro Còn Lại & Khuyến Nghị Sản Xuất (Production Recommendations)
1. **Lưu trữ Rate Limit trong bộ nhớ (In-memory store):** Hiện tại bộ đếm của `express-rate-limit` lưu trong RAM của process NodeJS. Khi triển khai cụm nhiều container hoặc server load-balancer, cần chuyển sang Redis Store (`rate-limit-redis`) để đồng bộ bộ đếm giữa các instance.
2. **Refresh Token & Thu hồi Token (Token Blacklist):** Token hiện tại cấp có thời hạn 1 giờ. Trong môi trường doanh nghiệp quy mô lớn, nên kết hợp Refresh Token lưu trong HTTP-only Cookie và cơ chế Blacklist/Revocation khi đăng xuất hoặc đổi mật khẩu.
3. **Cấu hình Reverse Proxy Trust:** Khi chạy đằng sau Nginx hoặc Cloudflare, cần khai báo `app.set('trust proxy', 1)` để `req.ip` nhận diện chính xác IP thật của người dùng thay vì IP của Proxy.

