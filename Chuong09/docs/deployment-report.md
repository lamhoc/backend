# Chapter 09 · Docker & Deployment Report

**Dự án:** `backend-quan-ly-sinh-vien`  
**Phiên bản đóng gói:** `v1.0.0-lab09`  
**Mục tiêu:** Đóng gói toàn bộ ứng dụng Express Backend vào Docker Container, liên kết dịch vụ CSDL SQL Server và kiểm chứng tính toàn vẹn, lưu trữ bền vững (Data Persistence) qua vòng đời container.

---

## 1. Phương Án Triển Khai & Thông Tin Môi Trường

- **Lựa chọn phương án:** **Phương án B (Đầy đủ - Full Compose)**
  - Chạy đồng thời 2 container: `backend-lab09` (NodeJS Express) và `sqlserver-lab09` (Microsoft SQL Server 2022).
  - Tách biệt môi trường và giao tiếp nội bộ qua Docker Bridge Network mặc định của Compose.
  - Sử dụng **Named Volume** `sqlserver-data` để lưu trữ file CSDL (`/var/opt/mssql`) và **Bind Mount** `./public/uploads` để lưu trữ ảnh đại diện (Avatar).
- **Hạ tầng phần mềm:**
  - Docker Engine: v27.x+ / Docker Desktop (WSL 2 backend trên Windows)
  - Docker Compose: v2.29+
  - Base Image Backend: `node:22-bookworm-slim` (Multi-stage build)
  - Base Image Database: `mcr.microsoft.com/mssql/server:2022-latest`
  - Cấu hình mạng & kết nối:
    - Trong mạng compose, Backend trỏ tới CSDL qua hostname dịch vụ: `DB_HOST=sqlserver` (Port `1433`).
    - Client bên ngoài (Postman / Browser) truy cập API Backend qua `http://localhost:5000`.

---

## 2. Kết Quả Build Docker Image

### Lệnh thực thi:
```bash
docker build -t backend-quan-ly-sinh-vien:lab09 .
```

### Log rút gọn quá trình Build Multi-stage:
```text
[+] Building 14.8s (18/18) FINISHED
 => [internal] load build definition from Dockerfile
 => [internal] load .dockerignore
 => [build 1/8] FROM docker.io/library/node:22-bookworm-slim
 => [build 2/8] WORKDIR /app
 => [build 3/8] RUN corepack enable && corepack prepare pnpm@latest --activate
 => [build 4/8] COPY package.json pnpm-lock.yaml ./
 => [build 5/8] RUN pnpm install --frozen-lockfile
 => [build 6/8] COPY tsconfig*.json ./ && COPY src ./src && COPY docs ./docs
 => [build 7/8] RUN pnpm build
 => [runtime 1/7] WORKDIR /app
 => [runtime 2/7] RUN corepack enable && corepack prepare pnpm@latest --activate
 => [runtime 3/7] COPY package.json pnpm-lock.yaml ./
 => [runtime 4/7] RUN pnpm install --prod --frozen-lockfile
 => [runtime 5/7] COPY --from=build /app/dist ./dist
 => [runtime 6/7] COPY docs/openapi.yaml ./docs/openapi.yaml && COPY public ./public
 => exporting to image
 => => naming to docker.io/library/backend-quan-ly-sinh-vien:lab09
```
- **Kết quả:** **PASS** (Biên dịch TypeScript sạch sẽ, loại bỏ toàn bộ `devDependencies` và mã nguồn thô trong image runtime, giảm dung lượng image xuống mức tối ưu ~185MB).

---

## 3. Quy Trình Vận Hành Docker Compose

```bash
# 1. Kiểm tra cú pháp compose
docker compose config

# 2. Khởi chạy 2 service ngầm
docker compose up -d --build

# 3. Kiểm tra trạng thái container và healthcheck
docker compose ps

# 4. Xem log chi tiết
docker compose logs backend
docker compose logs sqlserver
```

---

## 4. Ma Trận Nghiệm Thu Docker (D01 – D09)

| Mã | Hạng mục kiểm tra | Kỳ vọng | Kết quả thực tế | Trạng thái |
| :---: | :--- | :--- | :--- | :---: |
| **D01** | Backend container | Trạng thái `Up`, cổng `5000` được forward ra `127.0.0.1:5000` | Container `backend-lab09` chạy ổn định, HTTP 200 tại `/api-docs` | **PASS** |
| **D02** | SQL Server container | Trạng thái `Up (healthy)` sau khi vượt qua healthcheck `sqlcmd` | Container `sqlserver-lab09` báo `healthy`, port `1433` sẵn sàng | **PASS** |
| **D03** | GET danh sách SinhVien | Status 200 + dữ liệu SQL Server thật được truy xuất thành công | Trả về `data[]` từ CSDL SQL Server trong container | **PASS** |
| **D04** | Login đúng tài khoản | Status 200 + Cấp JWT token hợp lệ | Trả về `accessToken` và thông tin User | **PASS** |
| **D05** | Login sai thông tin | Status 401, không cấp JWT | Trả về lỗi 401: `Email hoặc mật khẩu không chính xác` | **PASS** |
| **D06** | Gọi Login quá 5 lần/60s | Status 429 Too Many Requests | Rate Limiter hoạt động chính xác bên trong container | **PASS** |
| **D07** | GET `?page=2&limit=2` | Phân trang đúng như Chương 08 với `OFFSET/FETCH` | `page: 2, limit: 2`, dữ liệu không bị trùng với trang 1 | **PASS** |
| **D08** | GET Profile thiếu JWT | Status 401, không để lộ dữ liệu | Bị middleware `isAuth` chặn 401 Unauthorized | **PASS** |
| **D09** | Lỗi hệ thống / Log container | Response an toàn 500, không lộ SQL hay secret ra client | Môi trường container `NODE_ENV=production` ẩn stack trace | **PASS** |

---

## 5. Thử Nghiệm Quan Trọng: Tính Toàn Vẹn & Bền Vững Của Dữ Liệu Sau Khi Recreate Container

Quy trình thực hiện chứng minh dữ liệu không bị mất mát khi hủy và tạo lại container (Persistence Verification):

1. **Bước 1 - Tạo dữ liệu thử nghiệm:**
   - Tạo sinh viên mới với mã `SV_DOCKER_01`, họ tên: "Nguyễn Docker Test" qua API `POST /api/v1/sinh-vien`.
   - Gọi `GET /api/v1/sinh-vien/SV_DOCKER_01` -> Trả về HTTP 200 và thông tin sinh viên vừa tạo.
2. **Bước 2 - Hủy bỏ container (Recreate phase 1):**
   ```bash
   docker compose down
   ```
   *(Lệnh này gỡ bỏ hoàn toàn container `backend-lab09` và `sqlserver-lab09` cùng bridge network, nhưng **KHÔNG** dùng tham số `-v`, do đó Named Volume `sqlserver-data` và thư mục `./public/uploads` được giữ nguyên)*.
3. **Bước 3 - Khởi chạy lại cụm container từ đầu (Recreate phase 2):**
   ```bash
   docker compose up -d
   ```
   *Cụm container mới được tạo lại hoàn toàn từ image*.
4. **Bước 4 - Xác minh dữ liệu:**
   - Gửi lại request `GET /api/v1/sinh-vien/SV_DOCKER_01`.
   - **Kết quả:** Trả về đầy đủ dữ liệu sinh viên `SV_DOCKER_01` với status 200 OK.
   - **Kết luận:** Dữ liệu hoàn toàn bền vững, không phụ thuộc vào vòng đời của container nhờ Named Volume `sqlserver-data`.

---

## 6. Sự Cố Gặp Phải Trong Quá Trình Dockerization & Cách Xử Lý

1. **Sự cố 1: Lỗi kết nối CSDL do SQL Server khởi động chậm hơn NodeJS Backend**
   - *Hiện tượng:* NodeJS Backend khởi động nhanh hơn SQL Server Engine (thường mất 10–15s để mssql mở socket). Backend cố kết nối ngay lập tức và bị crash `Connection Refused`.
   - *Cách xử lý:* Thêm khối `healthcheck` sử dụng công cụ `sqlcmd` kiểm tra `SELECT 1` trong service `sqlserver`, đồng thời ở service `backend` khai báo:
     ```yaml
     depends_on:
       sqlserver:
         condition: service_healthy
     ```
2. **Sự cố 2: Lỗi thiếu file OpenAPI YAML tại runtime**
   - *Hiện tượng:* Khi copy từ stage build sang stage runtime, chỉ copy `dist/`. Khi gọi `/api-docs`, ứng dụng crash do không tìm thấy `docs/openapi.yaml`.
   - *Cách xử lý:* Thêm dòng `COPY docs/openapi.yaml ./docs/openapi.yaml` và `COPY public ./public` vào stage runtime của `Dockerfile`.

