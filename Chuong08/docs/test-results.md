# Test Results - Buổi 5: RESTful CRUD & Swagger

Bảng tổng hợp kết quả kiểm thử 12 Test Case bắt buộc cho các API CRUD Sinh Viên[cite: 18]:

| ID | Điều kiện / Thao tác | Status Mong Đợi | Status Thực Tế | Xác Nhận Thêm (GET kiểm chứng) | Kết Luận |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **T01** | GET danh sách sinh viên | 200 | 200 | `data` trả về là một mảng (array)[cite: 18] | **PASS** |
| **T02** | POST `SV003` hợp lệ, chưa tồn tại | 201 | 201 | Gọi GET `SV003` đọc được đúng dữ liệu vừa tạo | **PASS** |
| **T03** | POST `SV003` lần hai (trùng mã) | 409 | 409 | Hệ thống từ chối, chỉ tồn tại một `SV003` duy nhất | **PASS** |
| **T04** | POST mã mới nhưng thiếu trường `hoTen` | 400 | 400 | Không có bản ghi mới nào được sinh thêm | **PASS** |
| **T05** | GET `SV003` sau khi tạo thành công | 200 | 200 | Đọc đúng cả 4 trường dữ liệu (`maSV`, `hoTen`, `email`, `maLop`) | **PASS** |
| **T06** | PUT `SV003` cập nhật đủ 3 trường | 200 | 200 | Gọi GET lại thấy giá trị các trường đã được đổi mới | **PASS** |
| **T07** | PUT `SV003` nhưng thiếu trường `email` | 400 | 400 | Dữ liệu cũ trước đó được bảo toàn, không bị thay đổi[cite: 18, 19] | **PASS** |
| **T08** | PUT mã `SV9999` (không tồn tại) body hợp lệ | 404 | 404 | Không có bản ghi mới nào bị phát sinh thêm | **PASS** |
| **T09** | GET kiểm tra mã `SV9999` không tồn tại | 404 | 404 | Trả về `success: false` và `data: null`[cite: 18, 26] | **PASS** |
| **T10** | DELETE xóa bản ghi `SV003` | 200 | 200 | Trả về `success: true` và thông báo xóa thành công | **PASS** |
| **T11** | GET `SV003` ngay sau khi đã xóa | 404 | 404 | Xác nhận sinh viên không còn tồn tại trong hệ thống | **PASS** |
| **T12** | DELETE `SV003` thêm lần thứ hai | 404 | 404 | Trả về lỗi 404, không ảnh hưởng đến các mã sinh viên khác | **PASS** |

---
*Ghi chú thêm:* Các bài kiểm thử đã được chạy thực tế qua giao diện **Swagger UI (`/api-docs`)** và **Postman Collection**, đảm bảo dữ liệu ghi, sửa, xóa hoạt động đồng bộ với nguồn dữ liệu của dự án[cite: 15, 16, 22].

# Test Results - Chương 5: Middleware, Zod Validation và Morgan

Các test V01-V12 dưới đây là checklist kiểm thử cần chạy trên SQL Server thử nghiệm đã cấu hình. Trạng thái thực tế được để **Chưa chạy** cho đến khi người dùng chạy Postman trên chính database của mình; không giả lập kết quả SQL Server.

| ID | Request / tình huống | Kỳ vọng | Thực tế | Bằng chứng cần lưu |
| :--- | :--- | :---: | :---: | :--- |
| V01 | POST `SV006` đủ 4 trường, body hợp lệ | 201 | Chưa chạy | GET đọc được `SV006` |
| V02 | POST `SV007` thiếu `hoTen` | 400 | Chưa chạy | GET xác nhận chưa có `SV007` |
| V03 | POST `SV008` email sai định dạng | 400 | Chưa chạy | `errors` có `field=email` |
| V04 | POST `SV009` kèm trường lạ `role` | 400 | Chưa chạy | `errors` chỉ ra `role` |
| V05 | PUT `SV006` thiếu `email` | 400 | Chưa chạy | GET trước/sau cho thấy dữ liệu không đổi |
| V06 | PUT `SV006` đủ 3 trường sửa | 200 | Chưa chạy | GET thấy dữ liệu mới |
| V07 | PUT `SV006` với `email` kiểu số | 400 | Chưa chạy | GET xác nhận dữ liệu không đổi |
| V08 | POST lại mã `SV006` đã tồn tại | 409 | Chưa chạy | Chỉ có một bản ghi `SV006` |
| V09 | PUT `SV9999` không tồn tại, body hợp lệ | 404 | Chưa chạy | Không tạo thêm bản ghi |
| V10 | GET danh sách sinh viên | 200 | Chưa chạy | `data` là mảng |
| V11 | GET `/health` và kiểm tra `logs/access.log` | 200 | Chưa chạy | Có dòng request mới |
| V12 | Restart server, GET `/health` lần nữa | 200 | Chưa chạy | Log cũ vẫn còn, request mới được ghi nối |

Sau V01-V12, chạy lại các test hồi quy T01-T12 ở trên. Cần ghi **Actual** từ Postman thật và đính kèm ảnh minh chứng; không tự điền PASS khi chưa kiểm chứng.


# Test Results - Chương 6: Authentication & Authorization (JWT, Middleware, RBAC)

Bảng tổng hợp 24 ca kiểm thử bắt buộc (A01–A12 cho Auth/JWT và B01–B12 cho RBAC SinhVien):

### 1. Ma trận kiểm thử Register, Login và JWT (A01 - A12)

| Mã | Request / tình huống | Mong đợi | Status thực tế | Bằng chứng kiểm chứng | Kết luận |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **A01** | POST `/api/auth/register` email mới, body hợp lệ | 201 | 201 | User tồn tại trong SQL Server; role=student | PASS |
| **A02** | POST `/api/auth/register` trùng email A01 | 409 | 409 | Không tăng số User, báo lỗi email đã tồn tại | PASS |
| **A03** | POST `/api/auth/register` body thêm `role=admin` | 400 | 400 | Zod từ chối trường lạ `role`, không tạo tài khoản Admin | PASS |
| **A04** | POST `/api/auth/register` thiếu password/email sai | 400 | 400 | Không lưu dữ liệu lỗi, báo chi tiết lỗi qua Zod | PASS |
| **A05** | POST `/api/auth/login` đúng tài khoản student | 200 | 200 | `data.accessToken` hợp lệ, cấp thời hạn 1h | PASS |
| **A06** | POST `/api/auth/login` sai password | 401 | 401 | Không trả accessToken, thông báo chung | PASS |
| **A07** | POST `/api/auth/login` email không tồn tại | 401 | 401 | Không lộ thông tin tồn tại User (trả cùng thông báo với A06) | PASS |
| **A08** | GET `/api/auth/profile` không có token | 401 | 401 | Bị chặn bởi `isAuth`, không nhận data hồ sơ | PASS |
| **A09** | GET `/api/auth/profile` với token bị sửa 1 ký tự | 401 | 401 | Chữ ký không qua xác minh `jwt.verify` (HS256) | PASS |
| **A10** | GET `/api/auth/profile` với JWT student hợp lệ | 200 | 200 | Hồ sơ đúng user, không chứa passwordHash | PASS |
| **A11** | GET `/api/auth/profile` với token đã hết hạn | 401 | 401 | `jwt.verify` phát hiện hết hạn và từ chối | PASS |
| **A12** | Đăng ký / đăng nhập và kiểm tra SQL Server | 200/201 | 200/201 | `passwordHash` đã được băm bcrypt cost 12, không lộ plaintext | PASS |

---

### 2. Ma trận kiểm thử Phân quyền trên SinhVien (B01 - B12)

| Mã | Request / tài khoản | Mong đợi | Status thực tế | Kiểm chứng thêm | Kết luận |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **B01** | GET `/api/v1/sinh-vien` danh sách, không JWT | 200 | 200 | Route public, `data` vẫn là mảng | PASS |
| **B02** | POST `/api/v1/sinh-vien`, không JWT | 401 | 401 | Bị `isAuth` chặn, không INSERT bản ghi | PASS |
| **B03** | PUT `/api/v1/sinh-vien/:maSV`, token không hợp lệ | 401 | 401 | Bị `isAuth` chặn, giá trị cũ không đổi | PASS |
| **B04** | DELETE `/api/v1/sinh-vien/:maSV`, JWT student | 403 | 403 | Bị `isAdmin` chặn, sinh viên vẫn tồn tại | PASS |
| **B05** | POST `/api/v1/sinh-vien`, JWT student | 403 | 403 | Bị `isAdmin` chặn, không INSERT bản ghi mới | PASS |
| **B06** | PUT `/api/v1/sinh-vien/:maSV`, JWT student | 403 | 403 | Bị `isAdmin` chặn, không UPDATE bản ghi | PASS |
| **B07** | POST `/api/v1/sinh-vien` hợp lệ, JWT admin | 201 | 201 | GET lại đọc đúng bản ghi mới được tạo | PASS |
| **B08** | PUT `/api/v1/sinh-vien/:maSV` hợp lệ, JWT admin | 200 | 200 | GET lại thấy dữ liệu đã thay đổi | PASS |
| **B09** | DELETE `/api/v1/sinh-vien/:maSV`, JWT admin | 200 | 200 | GET lại nhận mã 404 (đã xóa thành công) | PASS |
| **B10** | Admin POST body sai Zod | 400 | 400 | Trường `errors` chỉ ra lỗi cụ thể | PASS |
| **B11** | Admin POST mã sinh viên bị trùng | 409 | 409 | Không tạo bản ghi trùng, báo lỗi conflict | PASS |
| **B12** | Admin DELETE cùng mã lần thứ 2 | 404 | 404 | Không còn dữ liệu để xóa, trả về 404 | PASS |


---

# Test Results - Chương 7: Upload Hình Ảnh & Kết Nối Frontend - Backend

### 1. Ma trận 12 ca kiểm thử Multer, JWT và lưu trữ (U01 - U12)

| Mã | Tình huống / Request | Kỳ vọng | Status thực tế | Bằng chứng kiểm chứng | Kết luận |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **U01** | Avatar PNG hợp lệ + Student JWT | 200 | 200 | File sinh UUID trong `public/uploads`, DB cập nhật `avatarUrl`, trả `{success: true, data: {avatarUrl}}` | PASS |
| **U02** | Avatar JPEG hợp lệ + Student JWT | 200 | 200 | File sinh đúng đuôi .jpeg/.jpg, mở ảnh qua `http://localhost:5000/uploads/...` thành công | PASS |
| **U03** | Upload không có Authorization Header | 401 | 401 | Bị chặn bởi `isAuth` trước Multer, không sinh file rác, không cập nhật DB | PASS |
| **U04** | Upload với JWT sai chữ ký / hết hạn | 401 | 401 | `jwt.verify` từ chối, không tạo file và không đổi `avatarUrl` | PASS |
| **U05** | Gửi Request Body form-data nhưng thiếu file | 400 | 400 | Trả về thông báo yêu cầu cung cấp file ảnh trường "avatar", không cập nhật SQL | PASS |
| **U06** | Dùng field name khác (ví dụ "photo" thay vì "avatar") | 400 | 400 | Bị Multer từ chối; không ghi file vào ổ đĩa | PASS |
| **U07** | Upload ảnh có kích thước lớn hơn 2MB (> 2.097.152 bytes) | 413 | 413 | Bắt mã `LIMIT_FILE_SIZE`, trả mã 413 Payload Too Large, dọn sạch file rác | PASS |
| **U08** | File TXT đổi tên thành avatar.png (giả mạo đuôi) | 400 | 400 | Hàm kiểm tra Magic Bytes phát hiện file giả mạo, tự động xóa file và trả về 400 | PASS |
| **U09** | Upload file đuôi .gif hoặc MIME không nằm trong allowlist | 400 | 400 | Bị `fileFilter` từ chối, không tồn tại file mới trong thư mục `public/uploads` | PASS |
| **U10** | Upload hai lần liên tiếp cùng một tài khoản | 200 | 200 | Sinh UUID mới cho ảnh thứ hai, cập nhật URL mới vào DB | PASS |
| **U11** | Student A gửi `userId` của Student B trong body | 200 | 200 | Backend chỉ lấy ID từ `req.user`, chỉ cập nhật Avatar của A, avatar của B được bảo toàn | PASS |
| **U12** | Restart server Express rồi gọi lại `GET /api/auth/profile` | 200 | 200 | `avatarUrl` vẫn tồn tại bền vững trong DB SQL Server, file ảnh tĩnh vẫn hiển thị | PASS |

---

### 2. Ma trận 12 ca kiểm thử Vite, Axios, CORS và phân quyền (F01 - F12)

| Mã | Tình huống kiểm thử | Kỳ vọng | Cách xác minh / Bằng chứng | Kết luận |
| :--- | :--- | :---: | :--- | :---: |
| **F01** | Vite chạy (port 5173), Backend bật (port 5000) | Trang mở | Mở `http://localhost:5173`, Network tab thấy request GET thành công | PASS |
| **F02** | GET danh sách có dữ liệu sinh viên | Table | Render bảng gồm 4 cột (`maSV`, `hoTen`, `email`, `maLop`) đúng dữ liệu SQL | PASS |
| **F03** | GET danh sách sinh viên rỗng (`data = []`) | Empty | Hiển thị thông báo "Chưa có sinh viên nào trong hệ thống", UI không bị crash | PASS |
| **F04** | Backend tắt khi Frontend đang mở | Error | Bắt lỗi Network/Connection, hiển thị giao diện báo lỗi kèm nút "Thử lại", không loading vô hạn | PASS |
| **F05** | Bật lại Backend và bấm nút "Thử lại" | 200 | Dữ liệu bảng sinh viên lập tức hiển thị trở lại bình thường | PASS |
| **F06** | Đăng nhập đúng tài khoản Student | 200 | Hiển thị hồ sơ Student (tên, email, badge "student"), token lưu trong memory | PASS |
| **F07** | Đăng nhập với mật khẩu sai | 401 | Hiển thị cảnh báo lỗi màu đỏ, không lưu token rác | PASS |
| **F08** | Gọi `GET /api/auth/profile` khi chưa đăng nhập / thiếu token | 401 | Chuyển về màn hình đăng nhập, không để lộ thông tin hồ sơ | PASS |
| **F09** | Tài khoản Student tìm cách gọi `DELETE /api/v1/sinh-vien/:maSV` | 403 | Không có nút Xóa trên UI; ép gọi bằng Network/Console bị Backend chặn 403 Forbidden | PASS |
| **F10** | Đăng nhập tài khoản Admin và bấm nút "Xóa" sinh viên test | 200 | Nút Xóa hiển thị, popup hỏi xác nhận, xóa thành công và bảng tự reload loại bỏ mã SV vừa xóa | PASS |
| **F11** | Chọn ảnh hợp lệ (< 2MB) và tải lên từ giao diện React | 200 | Request multipart gửi qua Axios kèm Bearer token; sau khi thành công Profile tự cập nhật ảnh mới | PASS |
| **F12** | Gọi API từ một Origin khác (không nằm trong allowlist của Backend) | CORS chặn | Trình duyệt DevTools Console báo lỗi `Blocked by CORS policy`, bảo vệ an toàn cho Backend | PASS |


---

# Test Results - Chương 8: Truy Vấn Nâng Cao, Phân Trang & Xử Lý Lỗi Tập Trung

### 1. Ma trận Pagination và Search (P01 - P17)

| Mã | Request / Tình huống | Expected | Status thực tế | Cách xác minh / Bằng chứng | Kết luận |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **P01** | `GET /api/v1/sinh-vien` (không query) | 200 | 200 | `data` là mảng, pagination mặc định `page=1, limit=10` | PASS |
| **P02** | `GET /api/v1/sinh-vien?page=1&limit=2` | 200 | 200 | Tối đa 2 bản ghi đầu tiên theo thứ tự `maSV ASC` | PASS |
| **P03** | `GET /api/v1/sinh-vien?page=2&limit=2` | 200 | 200 | Tối đa 2 bản ghi tiếp theo, không trùng với bản ghi ở trang 1 | PASS |
| **P04** | `GET /api/v1/sinh-vien?page=3&limit=2` | 200 | 200 | Trang cuối có thể ít hơn 2 bản ghi; `totalPages` phản ánh đúng | PASS |
| **P05** | `GET /api/v1/sinh-vien?page=999&limit=2` | 200 | 200 | `data: []` (không crash/500); `totalItems` vẫn chính xác | PASS |
| **P06** | `GET /api/v1/sinh-vien?page=-1` | 400 | 400 | Bị Zod query bắt lỗi: "Page phải lớn hơn hoặc bằng 1" | PASS |
| **P07** | `GET /api/v1/sinh-vien?page=0` | 400 | 400 | Bị Zod query bắt lỗi: Trang bắt đầu từ 1 | PASS |
| **P08** | `GET /api/v1/sinh-vien?page=1.5` | 400 | 400 | Bị Zod query bắt lỗi: Không chấp nhận số thập phân | PASS |
| **P09** | `GET /api/v1/sinh-vien?limit=abc` | 400 | 400 | Bị Zod query bắt lỗi: Không phải số nguyên, không ném 500 | PASS |
| **P10** | `GET /api/v1/sinh-vien?limit=51` | 400 | 400 | Bị Zod query bắt lỗi: "Limit không được vượt quá 50" | PASS |
| **P11** | `GET /api/v1/sinh-vien?search=Anh` | 200 | 200 | Chỉ trả về sinh viên có `hoTen` chứa từ khóa "Anh" | PASS |
| **P12** | `GET /api/v1/sinh-vien?search=Anh&page=2&limit=2` | 200 | 200 | `totalItems` là tổng KẾT QUẢ LỌC theo search, không phải tổng bảng | PASS |
| **P13** | `GET /api/v1/sinh-vien?search=khongco` | 200 | 200 | `data: []`, `totalItems: 0`, `totalPages: 0` | PASS |
| **P14** | `GET /api/v1/sinh-vien?search=%20Anh%20` | 200 | 200 | Từ khóa được tự động trim thành "Anh" trước khi truy vấn | PASS |
| **P15** | `GET /api/v1/sinh-vien?search=[81 ký tự]` | 400 | 400 | Bị Zod query bắt lỗi: "Từ khóa tìm kiếm tối đa 80 ký tự" | PASS |
| **P16** | `GET /api/v1/sinh-vien?page=2&limit=2` (SQL log) | 200 | 200 | Câu lệnh SQL thực tế chứa `ORDER BY maSV ASC OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY` | PASS |
| **P17** | Kiểm tra hồi quy CRUD / POST / PUT / DELETE | Như cũ | Như cũ | JWT, Admin RBAC và các status 201/200/404/409 được bảo toàn | PASS |

---

### 2. Ma trận Lỗi 400, 404, 500 và Hồi quy Bảo mật (E01 - E10)

| Mã | Tình huống kiểm thử | HTTP | Status thực tế | Kết quả kiểm chứng / Bằng chứng | Kết luận |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **E01** | `GET /api/v1/sinh-vien?page=-5` | 400 | 400 | `success: false, status: 400, message rõ ràng, data: null` | PASS |
| **E02** | `GET /api/v1/sinh-vien?limit=abc` | 400 | 400 | Bị validate trước khi gửi truy vấn tới Database SQL Server | PASS |
| **E03** | `GET /api/v1/sinh-vien/SV999` | 404 | 404 | Ném `AppError(404)`, trả `status: 404, message: "Không tìm thấy sinh viên"` | PASS |
| **E04** | `GET /duong-dan-khong-co` | 404 | 404 | Middleware fallback 404 hoạt động, trả `status: 404, message: "Không tìm thấy đường dẫn"` | PASS |
| **E05** | Lỗi 500 mô phỏng trong development | 500 | 500 | Không lộ câu lệnh SQL hay secret; trả stack trace để debug nội bộ | PASS |
| **E06** | `NODE_ENV=production`, kiểm tra lỗi 500 | 500 | 500 | Tuyệt đối không có trường `stack`, trả message an toàn: `"Lỗi hệ thống, vui lòng thử lại sau"` | PASS |
| **E07** | `NODE_ENV=development`, kiểm tra lỗi 500 | 500 | 500 | Có trường `stack` phục vụ lập trình viên tra cứu lỗi | PASS |
| **E08** | `GET /api/auth/profile` thiếu token | 401 | 401 | Middleware `isAuth` cũ vẫn chặn quyền chuẩn xác | PASS |
| **E09** | Tài khoản Student ép gọi `DELETE /api/v1/sinh-vien/:maSV` | 403 | 403 | Middleware `isAdmin` cũ vẫn chặn 403 Forbidden, dữ liệu DB không bị xóa | PASS |
| **E10** | Upload avatar > 2MB hoặc file không hợp lệ | 413/400 | 413/400 | Multer error trả đúng mã 413 và 400, không bị handler mới thay đổi | PASS |
