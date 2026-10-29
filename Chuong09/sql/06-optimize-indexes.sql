-- Script SQL tham chiếu Chương 09: Bổ sung Index tối ưu hóa truy vấn Phân trang & Tìm kiếm SinhVien
-- Kiểm tra bảng dbo.SinhVien
IF OBJECT_ID(N'dbo.SinhVien', N'U') IS NULL
BEGIN
    THROW 50001, N'Chưa có bảng dbo.SinhVien', 1;
END;
GO

-- Kiểm tra và tạo Non-Clustered Composite Index nếu chưa tồn tại
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_SinhVien_hoTen_maSV' 
      AND object_id = OBJECT_ID('dbo.SinhVien')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_SinhVien_hoTen_maSV
    ON dbo.SinhVien (hoTen, maSV)
    INCLUDE (email, maLop);
    PRINT N'Đã tạo thành công chỉ mục IX_SinhVien_hoTen_maSV.';
END
ELSE
BEGIN
    PRINT N'Chỉ mục IX_SinhVien_hoTen_maSV đã tồn tại.';
END;
GO

-- Lệnh đo đạc hiệu năng với STATISTICS IO & TIME
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

SELECT TOP (10) maSV, hoTen, email, maLop
FROM dbo.SinhVien
WHERE hoTen LIKE N'%Anh%'
ORDER BY maSV ASC;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
GO

