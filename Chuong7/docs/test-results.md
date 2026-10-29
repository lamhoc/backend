# Báo Cáo Kết Quả Kiểm Thử (Test Results) - Chương 07
## Chủ đề: Upload Hình Ảnh & Kết Nối Frontend - Backend (Multer · Vite · React · Axios · CORS)
**Dự án:** Quản lý sinh viên (Node.js · Express 5 · TypeScript NodeNext · Sequelize 6 · SQL Server · Vite React · PNPM)

---

## 1. Ma Trận 12 Ca Kiểm Thử Multer, JWT và Lưu Trữ (U01 - U12)

Tất cả 12 ca kiểm thử dưới đây đã được thực thi và xác nhận trực tiếp trên hệ thống Backend live (`http://localhost:5000`) và cơ sở dữ liệu Microsoft SQL Server (`QuanLySinhVienDB`).

| Mã | Tình huống kiểm thử | Status Mong đợi | Status Thực tế | Bằng chứng kiểm chứng thực tế | Kết luận |
| :---: | :--- | :---: | :---: | :--- | :---: |
| **U01** | Avatar PNG hợp lệ + Student JWT | **200** | **200** | File lưu tại `public/uploads/<uuid>.png`; URL trả về `/uploads/<uuid>.png`; SQL Server cập nhật đúng `avatarUrl` cho tài khoản student. | **PASS** |
| **U02** | Avatar JPEG hợp lệ + Student JWT | **200** | **200** | Upload thành công; gọi `GET http://localhost:5000/uploads/<uuid>.jpeg` nhận status 200, trình duyệt hiển thị đúng ảnh tĩnh. | **PASS** |
| **U03** | Không gửi Header Authorization | **401** | **401** | `isAuth` chặn trước khi vào Multer: không sinh file mới trong `public/uploads` và không thay đổi database. | **PASS** |
| **U04** | JWT sai chữ ký hoặc đã hết hạn | **401** | **401** | Bị từ chối với thông báo `"Token không hợp lệ hoặc đã hết hạn"`; không tạo file và không có URL mới. | **PASS** |
| **U05** | Request body form-data thiếu file | **400** | **400** | Multer báo lỗi thiếu file: `"Vui lòng cung cấp file ảnh với trường tên 'avatar'"`. | **PASS** |
| **U06** | Dùng field name `photo` thay vì `avatar` | **400** | **400** | Multer từ chối: `"Lỗi upload: Unexpected file field"`. Không ghi file rác lên đĩa. | **PASS** |
| **U07** | Kích thước file vượt quá 2MB (2.5MB) | **413** | **413** | Bắt mã `LIMIT_FILE_SIZE` từ Multer và trả đúng mã **413 Payload Too Large**; file tạm được dọn dẹp sạch sẽ. | **PASS** |
| **U08** | File TXT đổi đuôi thành `avatar.png` | **400** | **400** | Hàm `isValidImageSignature` kiểm tra Magic Bytes (không khớp `89 50 4E 47`), xóa file ngay và trả lỗi 400. | **PASS** |
| **U09** | Định dạng `.gif` / MIME không được phép | **400** | **400** | `fileFilter` của Multer từ chối: `"Chỉ chấp nhận định dạng ảnh JPEG hoặc PNG"`. | **PASS** |
| **U10** | Upload 2 lần liên tiếp cùng một tài khoản | **200** | **200** | Server sinh 2 UUID khác nhau; file thứ 2 không ghi đè file thứ 1; database cập nhật sang URL mới nhất. | **PASS** |
| **U11** | Student A cố tình gửi `userId` của Admin B trong body | **200** | **200** | Backend hoàn toàn bỏ qua `req.body.userId`, chỉ lấy ID từ JWT của Student A. `avatarUrl` của Admin B trong DB được bảo toàn 100%. | **PASS** |
| **U12** | Khởi động lại server rồi gọi `GET /api/auth/profile` | **200** | **200** | Thông tin `avatarUrl` vẫn tồn tại bền vững trong SQL Server, ảnh trên ổ đĩa vẫn hiển thị bình thường. | **PASS** |

---

## 2. Ma Trận 12 Ca Kiểm Thử Vite, Axios, CORS và Phân Quyền (F01 - F12)

| Mã | Tình huống kiểm thử | Kỳ vọng | Kết quả thực tế & Cách xác minh | Kết luận |
| :---: | :--- | :---: | :--- | :---: |
| **F01** | Mở ứng dụng Vite khi Backend đang bật | Trang mở | Mở `http://localhost:5173`, Network tab thấy request `GET /api/v1/sinh-vien` thành công (Status 200). | **PASS** |
| **F02** | Xem danh sách sinh viên trên giao diện | Table | Render bảng đầy đủ 4 cột (`Mã SV`, `Họ và Tên`, `Email`, `Mã Lớp`) khớp với dữ liệu SQL Server. | **PASS** |
| **F03** | Trường hợp danh sách rỗng (`data: []`) | Empty | Giao diện hiển thị thông báo rõ ràng: *"Chưa có sinh viên nào trong hệ thống"*, không crash. | **PASS** |
| **F04** | Backend tắt khi Frontend đang load | Error | Không bị treo vòng xoay loading vô hạn; hiển thị box thông báo lỗi màu đỏ kèm nút *"Thử lại"*. | **PASS** |
| **F05** | Bật lại Backend và bấm nút "Thử lại" | 200 | Bảng sinh viên tự động tải lại và hiển thị dữ liệu bình thường. | **PASS** |
| **F06** | Đăng nhập đúng tài khoản student | 200 | Nhận JWT trong memory, Profile hiển thị đúng tên và badge vai trò `STUDENT`. | **PASS** |
| **F07** | Đăng nhập sai mật khẩu | 401 | Hiển thị thông báo lỗi: *"Email hoặc mật khẩu không chính xác"*, không lưu token rác. | **PASS** |
| **F08** | Gọi Profile khi chưa đăng nhập / thiếu token | 401 | Giao diện hiển thị màn hình Login yêu cầu đăng nhập, không làm lộ thông tin cá nhân. | **PASS** |
| **F09** | Tài khoản Student tìm cách gọi `DELETE` sinh viên | 403 | Giao diện Student hoàn toàn không có nút Xóa; nếu ép gọi qua Postman/Network thì nhận 403 Forbidden. | **PASS** |
| **F10** | Tài khoản Admin bấm nút Xóa sinh viên | 200 | Xuất hiện hộp thoại xác nhận $\to$ bấm OK $\to$ gọi DELETE thành công $\to$ Bảng tự reload mất dòng vừa xóa. | **PASS** |
| **F11** | Upload Avatar hợp lệ từ giao diện React | 200 | Network tab gửi `multipart/form-data`, hiển thị ảnh đại diện tròn mới ngay lập tức trên Profile. | **PASS** |
| **F12** | Request từ Origin lạ không nằm trong allowlist | CORS chặn | Trình duyệt chặn request và báo lỗi CORS policy; trong khi Postman gọi trực tiếp không bị CORS. | **PASS** |

---

## 3. Trả Lời 12 Câu Hỏi Bảo Vệ Bài Thực Hành (Mục 21 trong Giáo Trình)

### Câu 01: `application/json` khác `multipart/form-data` ở điểm nào? Vì sao `express.json()` không đủ cho file?
**Trả lời:**
- `application/json` dùng để truyền tải dữ liệu văn bản có cấu trúc dưới dạng chuỗi JSON UTF-8. Nó không phù hợp để truyền file nhị phân lớn (nếu mã hóa Base64 sẽ làm tăng 33% kích thước và tốn RAM để parse).
- `multipart/form-data` được thiết kế đặc biệt để tải file nhị phân kèm dữ liệu trường (fields). Dữ liệu được chia thành nhiều phần (parts), ngăn cách bởi một chuỗi ký tự ngẫu nhiên gọi là `boundary`.
- Middleware `express.json()` chỉ đọc và phân tích cú pháp chuỗi JSON, nó không có khả năng phân tách các boundary, không xử lý được stream nhị phân của file và không có cơ chế ghi file xuống đĩa cứng.

---

### Câu 02: Điều gì xảy ra khi FormData dùng `photo` nhưng Multer cấu hình `single("avatar")`?
**Trả lời:**
- Khi Frontend gửi trường có tên `photo` qua FormData, Multer (vốn được cấu hình đợi trường tên `avatar`) sẽ không nhận diện được file này.
- Multer sẽ kích hoạt lỗi `MulterError: Unexpected file field` (mã `LIMIT_UNEXPECTED_FILE`).
- Khi đó, middleware `uploadAvatarMiddleware` bắt lỗi này và trả về phản hồi **400 Bad Request** với thông báo `"Lỗi upload: Unexpected file field"`. File không được lưu vào thư mục `public/uploads`.

---

### Câu 03: `req.file` và `req.body` nằm ở đâu sau Multer? `req.user` xuất hiện ở bước nào?
**Trả lời:**
- Sau khi Multer hoàn thành xử lý request multipart:
  - `req.file`: Chứa đối tượng metadata của file đã lưu trên đĩa (gồm `filename`, `path`, `mimetype`, `size`, `destination`).
  - `req.body`: Chứa các trường dữ liệu dạng text thông thường (nếu có) được gửi kèm trong form-data.
- `req.user` xuất hiện ở bước chạy qua middleware **`isAuth`**. Middleware `isAuth` chạy trước Multer, xác minh chữ ký của JWT token và giải mã payload, sau đó gán thông tin người dùng vào `req.user`.

---

### Câu 04: Vì sao gọi `isAuth` trước Multer? Có cần `isAdmin` để User đổi Avatar chính mình không?
**Trả lời:**
- **Bắt buộc gọi `isAuth` trước Multer:** Nếu đặt Multer trước `isAuth`, bất kỳ kẻ tấn công nào ngoài internet chưa đăng nhập cũng có thể liên tục gửi các file dung lượng lớn làm ngập tràn ổ cứng máy chủ (tấn công DoS / Resource Exhaustion). Đặt `isAuth` trước đảm bảo chỉ những request có JWT hợp lệ mới được cấp quyền xử lý và ghi file lên ổ đĩa.
- **Không cần `isAdmin`:** Tính năng đổi Avatar cá nhân là quyền cơ bản của bất kỳ người dùng nào đã đăng nhập (`role: 'student'` hoặc `role: 'admin'`). Do đó chỉ cần `isAuth` là đủ.

---

### Câu 05: Vì sao không nhận `userId` trong body cho endpoint `/me/avatar`?
**Trả lời:**
- Nếu nhận `userId` từ `req.body` hoặc `req.query`, hệ thống sẽ dính lỗ hổng bảo mật nghiêm trọng **IDOR (Insecure Direct Object References)**.
- Khi đó, một sinh viên A hoàn toàn có thể truyền `userId` của giảng viên hoặc của bạn B để thay đổi avatar của người khác một cách trái phép.
- Bằng cách lấy `userId` trực tiếp từ `req.user.id` (được ký mã hóa trong JWT), hệ thống đảm bảo tuyệt đối người dùng chỉ có thể cập nhật avatar cho chính tài khoản của mình.

---

### Câu 06: Ổ đĩa chứa dữ liệu nào, còn `dbo.Users.avatarUrl` chứa giá trị gì?
**Trả lời:**
- **Ổ đĩa vật lý (Thư mục `public/uploads/`):** Chứa toàn bộ nội dung nhị phân (binary content) của file ảnh thực tế dưới dạng file độc lập (ví dụ `e69abde4-9fa8-48b8-b80c-c6f376cf6ca7.png`).
- **Cơ sở dữ liệu (`dbo.Users.avatarUrl`):** Chỉ lưu trữ chuỗi đường dẫn tương đối (URL path) trỏ đến file đó (ví dụ `/uploads/e69abde4-9fa8-48b8-b80c-c6f376cf6ca7.png`). Không lưu trực tiếp file nhị phân (BLOB) vào SQL Server để tránh làm phình to dung lượng database và giảm hiệu năng sao lưu, phục hồi.

---

### Câu 07: 2MB tương ứng bao nhiêu byte? File 2.200.000 byte nên trả status nào?
**Trả lời:**
- $2\text{ MB} = 2 \times 1024 \times 1024 = 2.097.152\text{ bytes}$.
- File có dung lượng $2.200.000\text{ bytes} > 2.097.152\text{ bytes}$ (vượt quá giới hạn cho phép).
- Server phải trả về mã phản hồi HTTP **`413 Payload Too Large`** theo đúng quy ước RESTful API.

---

### Câu 08: Chỉ kiểm mimetype và `.png` có đủ để khẳng định file là ảnh PNG hợp lệ không?
**Trả lời:**
- **Hoàn toàn KHÔNG đủ.**
- Mimetype (`image/png`) và phần mở rộng (`.png`) là những thông tin do client tự gửi lên trong HTTP header và tên file, kẻ tấn công có thể dễ dàng làm giả bằng cách đổi tên một file mã độc (ví dụ `shell.php` hoặc `malware.exe`) thành `photo.png`.
- Để khẳng định chắc chắn, bắt buộc phải đọc **Magic Bytes** (chữ ký số nhị phân ở những byte đầu tiên của file). Đối với file PNG, 8 byte đầu tiên luôn luôn bắt buộc phải là `89 50 4E 47 0D 0A 1A 0A`.

---

### Câu 09: CORS kiểm soát điều gì? Vì sao Postman gọi API được nhưng browser lại báo CORS?
**Trả lời:**
- CORS (Cross-Origin Resource Sharing) là một cơ chế bảo mật do **trình duyệt web (Browser)** thực thi dựa trên chính sách Same-Origin Policy (SOP), nhằm ngăn chặn các trang web độc hại gửi request ngầm đến một domain/origin khác khi chưa được cho phép.
- Postman là một công cụ kiểm thử backend độc lập, không phải là trình duyệt web và không bị ràng buộc bởi Same-Origin Policy, nên Postman bỏ qua việc kiểm tra CORS. Do đó, việc Postman gọi được không chứng minh được ứng dụng web trên trình duyệt sẽ gọi được nếu server chưa cấu hình đúng CORS header (`Access-Control-Allow-Origin`).

---

### Câu 10: Axios `GET /api/v1/sinh-vien` nên đọc mảng ở `response.data` hay `response.data.data`?
**Trả lời:**
- Phải đọc mảng ở **`response.data.data`**.
- Vì trong Axios:
  - `response.data` là payload của toàn bộ gói tin HTTP phản hồi từ Express server.
  - Theo hợp đồng response đã thống nhất của dự án (`{ success: boolean, message: string, data: [...] }`), mảng sinh viên nằm trong thuộc tính con `data`. Do đó cần truy xuất vào `response.data.data`.

---

### Câu 11: Vì sao Student bị ẩn nút Xóa vẫn phải bị chặn DELETE ở Backend?
**Trả lời:**
- Việc ẩn nút Xóa trên giao diện React chỉ là trải nghiệm người dùng (UX) phía Frontend. Bất kỳ ai cũng có thể mở DevTools Console, Network tab hoặc dùng Postman để gửi thẳng request `DELETE /api/v1/sinh-vien/:maSV` kèm theo JWT token của student.
- Nếu Backend không có middleware `isAdmin` chặn lại với mã **403 Forbidden**, kẻ xấu sẽ xóa dữ liệu thành công dù giao diện không có nút. Bảo mật thực sự phải được thi hành ở tầng Backend Server.

---

### Câu 12: Trình bày ba bằng chứng cần có để chứng minh upload Avatar thật sự thành công.
**Trả lời:**
1. **Bằng chứng HTTP Response:** Request `POST /api/auth/me/avatar` trả về mã status `200 OK` kèm JSON `{ success: true, message: "...", data: { avatarUrl: "/uploads/<uuid>.png" } }`.
2. **Bằng chứng Ổ đĩa vật lý:** Trong thư mục `public/uploads/` xuất hiện file ảnh mới đúng tên UUID, dung lượng và định dạng hợp lệ. Đồng thời truy cập đường link `http://localhost:5000/uploads/<uuid>.png` hiển thị đúng ảnh tĩnh.
3. **Bằng chứng Cơ sở dữ liệu SQL Server:** Khi chạy truy vấn `SELECT id, email, avatarUrl FROM dbo.Users WHERE id = <user_id>;`, cột `avatarUrl` được cập nhật chính xác giá trị đường dẫn mới của file ảnh.
