# Backend Quản Lý Sinh Viên - Hệ Thống Hoàn Chỉnh (Chương 09)

Hệ thống RESTful API quản lý sinh viên được xây dựng bằng **Express 5**, **TypeScript** (chuẩn native ESM / NodeNext), **Sequelize 6**, **Microsoft SQL Server**, và **Zod Validation**.  
Dự án được hoàn thiện toàn diện qua các chương:
- **Chương 05:** Middleware Zod Validation, Morgan Access Logger, Swagger UI.
- **Chương 06:** Xác thực & phân quyền JWT (HS256, bcrypt cost 12, RBAC `admin` / `student`).
- **Chương 07:** Tải lên ảnh đại diện (Multer, giới hạn 2MB, Magic Bytes verification), phục vụ file tĩnh và kết nối Frontend độc lập (React + Vite + Axios).
- **Chương 08:** Phân trang & Tìm kiếm tại Database (`findAndCountAll`, `OFFSET/FETCH`), chuẩn hóa Global Error Handling.
- **Chương 09:** Kiểm thử tự động (Jest + Supertest), Bảo mật nâng cao (Helmet + Rate Limiting), Tối ưu hóa truy vấn SQL Server và Đóng gói triển khai với Docker & Docker Compose.

---

## 1. Yêu Cầu Môi Trường

- **Node.js:** Phiên bản `>= 20.x` (khuyến nghị Node 22 LTS).
- **pnpm:** Trình quản lý package duy nhất của project (phiên bản `10.x`); không dùng npm/npx.
- **Cơ sở dữ liệu:** Microsoft SQL Server 2022 (chạy cục bộ trên Windows hoặc qua Docker container).
- **Docker & Docker Compose:** Phục vụ chạy container hóa (Lab 3).

---

## 2. Cấu Hình Biến Môi Trường

1. Sao chép file cấu hình mẫu `.env.example` thành `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Cập nhật các thông số phù hợp với môi trường chạy thực tế:
   - Khi chạy trực tiếp trên Windows: `DB_HOST=127.0.0.1`
   - Khi chạy qua Docker Compose: `DB_HOST=sqlserver`
   > **Lưu ý bảo mật:** File `.env` chứa mật khẩu và khóa bí mật đã được đưa vào `.gitignore`, tuyệt đối không commit lên Git repository.

---

## 3. Cài Đặt & Chạy Trực Tiếp Trên Máy Cục Bộ

### Bước 1: Cài đặt thư viện
```bash
pnpm install
```

### Bước 2: Khởi tạo CSDL (chạy các script trong thư mục `sql/` bằng SSMS)
1. `sql/01-quan-ly-sinh-vien.sql`: Tạo CSDL `QuanLySinhVienDB` và bảng `SinhVien`, `Lop`.
2. `sql/02-seed.sql`: Dữ liệu mẫu ban đầu.
3. `sql/03-app-login.sql`: Tạo login SQL `sv_app` cho ứng dụng.
4. `sql/04-users-auth.sql`: Tạo bảng `Users` phục vụ xác thực người dùng.
5. `sql/05-add-avatar-url.sql`: Bổ sung cột `avatarUrl` cho bảng `Users`.
6. `sql/06-optimize-indexes.sql`: Bổ sung chỉ mục `IX_SinhVien_hoTen_maSV` tối ưu hóa phân trang & tìm kiếm.

### Bước 3: Biên dịch & Khởi chạy Backend
```bash
# Khởi chạy chế độ phát triển (hot reload)
pnpm dev

# Hoặc biên dịch TypeScript sang JavaScript
pnpm build

# Khởi chạy bản production build
pnpm start
```
- Swagger UI tài liệu API: `http://localhost:5000/api-docs`
- Kiểm tra sức khỏe hệ thống: `GET http://localhost:5000/health`

### Bước 4: Khởi chạy Frontend React (Tùy chọn)
```bash
cd frontend
pnpm install
pnpm dev
```
- Truy cập giao diện người dùng tại: `http://localhost:5173`

---

## 4. Chạy Kiểm Thử Tự Động (Automated Testing - Lab 1)

Dự án sử dụng **Jest** kết hợp **ts-jest** (chế độ native ESM) và **Supertest** để kiểm thử logic và HTTP API mà không cần kết nối tới CSDL thật:

```bash
# Chạy toàn bộ các bài kiểm thử (Unit test + API test)
pnpm test

# Chạy kiểm thử kèm báo cáo độ phủ mã nguồn (Code Coverage)
pnpm run test:coverage

# Chạy riêng từng bộ kiểm thử
pnpm test tests/unit/login.test.ts
pnpm test tests/api/auth.api.test.ts
```

- **5 Unit Tests (T01–T05):** Kiểm thử logic xác thực đăng nhập `loginUser` với Mock Sequelize & bcrypt, đảm bảo JWT không được cấp khi thông tin không chính xác.
- **7 API Tests (A01–A07):** Kiểm thử HTTP endpoints bằng Supertest: Login thành công (200), sai thông tin (401), Validation (400), Profile có/không có Bearer token (200/401) và giả lập lỗi hệ thống 500 an toàn không để lộ dữ liệu nội bộ.

---

## 5. Triển Khai Bằng Docker & Docker Compose (Lab 3)

Dự án cung cấp `Dockerfile` multi-stage build tối ưu và `compose.yaml` phối hợp 2 container độc lập có cơ chế lưu trữ dữ liệu bền vững (Persistence Named Volume):

### Khởi chạy toàn bộ hệ thống bằng Docker Compose:
```bash
# 1. Kiểm tra cấu hình compose
docker compose config

# 2. Build image và khởi chạy ngầm 2 service (backend + sqlserver)
docker compose up -d --build

# 3. Theo dõi trạng thái container và healthcheck
docker compose ps

# 4. Xem log chi tiết của từng dịch vụ
docker compose logs backend
docker compose logs sqlserver
```

### Thử nghiệm dữ liệu bền vững (Data Persistence Verification):
```bash
# Dừng và gỡ bỏ các container (giữ nguyên named volume sqlserver-data)
docker compose down

# Khởi chạy lại container
docker compose up -d

# Gọi GET /api/v1/sinh-vien kiểm tra dữ liệu vẫn được bảo toàn nguyên vẹn
```
> **Cảnh báo:** Tuyệt đối không dùng `docker compose down -v` trong bài kiểm tra dữ liệu bền vững vì cờ `-v` sẽ xóa vĩnh viễn named volume của CSDL.

---

## 6. Cấu Trúc Hồ Sơ Báo Cáo Trong `docs/`

- Hồ sơ nộp bài Chương 09 được lưu giữ đầy đủ tại thư mục [`docs/`](docs/):
- [`docs/openapi.yaml`](docs/openapi.yaml): Đặc tả OpenAPI 3.0.3 đầy đủ cho toàn bộ các API.
- [`docs/test-results.md`](docs/test-results.md): Nhật ký kết quả kiểm thử qua các chương và ma trận nghiệm thu Chương 09 (T01–T05, A01–A07, S01–S07, D01–D09, R01–R05).
- [`docs/security-report.md`](docs/security-report.md): Báo cáo đánh giá bảo mật API (Helmet, Rate Limiting, SQL Injection, XSS, Error Masking).
- [`docs/sql-optimization.md`](docs/sql-optimization.md): Báo cáo phân tích và tối ưu hóa truy vấn phân trang SQL Server đo bằng `STATISTICS IO/TIME`.
- [`docs/deployment-report.md`](docs/deployment-report.md): Báo cáo chi tiết quá trình đóng gói Docker, cấu hình mạng và chứng minh dữ liệu bền vững.
- [`docs/prompt-log.md`](docs/prompt-log.md): Nhật ký các prompt chuẩn CTCO đã dùng và phần sinh viên tự phản biện/sửa lỗi mã nguồn AI.
