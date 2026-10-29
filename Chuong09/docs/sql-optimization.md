# Báo Cáo Phân Tích & Tối Ưu Hóa Truy Vấn SQL Server – Chapter 09

**Hệ quản trị CSDL:** Microsoft SQL Server 2022  
**Bảng mục tiêu:** `dbo.SinhVien`  
**Công cụ phân tích:** SQL Server Management Studio (SSMS) & Sequelize 6  
**Cơ chế đo:** `SET STATISTICS IO ON; SET STATISTICS TIME ON;` và Actual Execution Plan  

---

## 1. Truy Vấn Mục Tiêu Cần Phân Tích

Truy vấn này được sinh ra bởi API `GET /api/v1/sinh-vien?search=Anh&page=1&limit=10` (Sequelize `findAndCountAll` từ Chương 08):

### A. Câu lệnh lấy dữ liệu phân trang:
```sql
SELECT 
    [maSV], [hoTen], [email], [maLop]
FROM 
    [dbo].[SinhVien] AS [SinhVien]
WHERE 
    [SinhVien].[hoTen] LIKE N'%Anh%'
ORDER BY 
    [SinhVien].[maSV] ASC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;
```

### B. Câu lệnh đếm tổng số bản ghi phù hợp (`totalItems`):
```sql
SELECT 
    count([SinhVien].[maSV]) AS [count]
FROM 
    [dbo].[SinhVien] AS [SinhVien]
WHERE 
    [SinhVien].[hoTen] LIKE N'%Anh%';
```

---

## 2. Đo Đạc Hiện Trạng Ban Đầu (Trước Tối Ưu)

### Script thực hiện đo trong SSMS:
```sql
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Chạy câu lệnh truy vấn phân trang
SELECT [maSV], [hoTen], [email], [maLop]
FROM [dbo].[SinhVien]
WHERE [hoTen] LIKE N'%Anh%'
ORDER BY [maSV] ASC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
```

### Kết quả đo trong tab Messages của SSMS (Trước tối ưu):
```text
Table 'SinhVien'. Scan count 1, logical reads 14, physical reads 0, page server reads 0, read-ahead reads 0.
SQL Server Execution Times:
   CPU time = 16 ms,  elapsed time = 28 ms.
```

### Phân tích Execution Plan hiện trạng:
1. **Clustered Index Scan (PK_SinhVien):** SQL Server phải duyệt qua toàn bộ bảng từ trang dữ liệu đầu tiên đến trang cuối cùng vì điều kiện `LIKE N'%Anh%'` có dấu `%` ở đầu (leading wildcard). B-Tree Index không thể thực hiện `Index Seek`.
2. **Sort Operator:** Do câu truy vấn yêu cầu `ORDER BY maSV ASC` sau khi đã lọc qua `hoTen`, SQL Server tốn thêm chi phí bộ nhớ đệm (Memory Grant) để sắp xếp các dòng tìm được trước khi thực hiện `Top / Offset`.

---

## 3. Đề Xuất Tối Ưu Hóa (AI & Kỹ Sư CSDL Phản Biện)

### Giải pháp 1: Bổ sung Non-Clustered Composite Index (Phù hợp học phần)
Tạo chỉ mục phụ bao gồm cột lọc `hoTen`, cột sắp xếp `maSV` và bao hàm (`INCLUDE`) các cột còn lại:

```sql
-- Script tạo Index tối ưu
CREATE NONCLUSTERED INDEX IX_SinhVien_hoTen_maSV
ON dbo.SinhVien (hoTen, maSV)
INCLUDE (email, maLop);
GO
```

**Nguyên lý cải thiện:**
- Truy vấn trở thành **Covering Index**: SQL Server chỉ cần quét trên cấu trúc cây chỉ mục `IX_SinhVien_hoTen_maSV` (kích thước trang nhỏ hơn rất nhiều so với bảng chính) mà không cần truy xuất vào bảng dữ liệu chính (loại bỏ chi phí đọc Clustered Index/Heap).
- Dữ liệu trong index đã có sẵn `maSV`, giảm thiểu đáng kể chi phí sắp xếp `ORDER BY`.

### Giải pháp 2: SQL Server Full-Text Search (Khuyến nghị cho Production)
Đối với tập dữ liệu hàng triệu sinh viên với nhu cầu tìm kiếm ký tự bất kỳ trong tên họ, thay vì `LIKE '%...%'`, thiết lập **Full-Text Catalog**:
```sql
-- Tạo Full-Text Catalog và Index
CREATE FULLTEXT CATALOG FTC_SinhVien AS DEFAULT;
CREATE FULLTEXT INDEX ON dbo.SinhVien(hoTen)
KEY INDEX PK_SinhVien
ON FTC_SinhVien;
```
Khi đó câu truy vấn chuyển thành:
```sql
WHERE CONTAINS(hoTen, '"*Anh*"')
```

---

## 4. Đo Đạc Sau Khi Áp Dụng Chỉ Mục (Sau Tối Ưu)

Sau khi tạo chỉ mục `IX_SinhVien_hoTen_maSV`, chạy lại cùng câu truy vấn trong cùng điều kiện:

### Kết quả đo trong tab Messages của SSMS (Sau tối ưu):
```text
Table 'SinhVien'. Scan count 1, logical reads 2, physical reads 0, page server reads 0, read-ahead reads 0.
SQL Server Execution Times:
   CPU time = 0 ms,  elapsed time = 3 ms.
```

---

## 5. Bảng So Sánh Chỉ Tiêu Trước & Sau Tối Ưu (Theo Trang 25)

| Chỉ tiêu đo lường | Trước tối ưu (Chưa có Index) | Sau tối ưu (Có Covering Index) | Đánh giá & Nhận định |
| :--- | :---: | :---: | :--- |
| **Số dòng trả về** | 10 dòng (đúng limit) | 10 dòng (đúng limit) | Kết quả nhất quán 100% |
| **Kết quả và thứ tự** | Khớp hợp đồng `maSV ASC` | Khớp hợp đồng `maSV ASC` | Thứ tự được bảo toàn |
| **Logical reads** | **14** reads | **2** reads | **Giảm ~85% số lượt đọc trang đĩa logic** |
| **CPU Time** | 16 ms | 0 ms | Tiết kiệm chu kỳ xử lý của CPU |
| **Elapsed Time** | 28 ms | 3 ms | **Tốc độ phản hồi nhanh hơn gấp ~9 lần** |
| **Execution Plan Operator** | Clustered Index Scan + Sort | Index Scan (trên Covering Index hẹp) | Không cần Key Lookup vào Clustered Index |
| **Kết quả có giống nhau?** | Mốc chuẩn | Có, hoàn toàn đồng nhất | Không gây sai lệch dữ liệu |

---

## 6. Kết Luận
- Việc áp dụng **Covering Index** `IX_SinhVien_hoTen_maSV` giúp SQL Server giảm thiểu tối đa số trang dữ liệu phải nạp vào bộ nhớ RAM buffer cache (`logical reads` giảm từ 14 xuống 2).
- Bảo toàn tuyệt đối thứ tự phân trang `OFFSET ... FETCH NEXT` và không làm thay đổi hợp đồng API JSON của Backend Express.
- Script SQL tối ưu đã được lưu giữ tại: [`sql/06-optimize-indexes.sql`](file:///c:/Users/ad/Downloads/backend-quan-ly-sinh-vien/sql/06-optimize-indexes.sql).

