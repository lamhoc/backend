-- Script SQL tham chiếu Chương 07: Bổ sung avatarUrl vào bảng dbo.Users
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
    THROW 50001, N'Chưa có bảng dbo.Users', 1;
GO

IF COL_LENGTH('dbo.Users', 'avatarUrl') IS NULL
BEGIN
    ALTER TABLE dbo.Users
    ADD avatarUrl NVARCHAR(255) NULL;
    PRINT N'Đã thêm cột avatarUrl vào bảng dbo.Users thành công.';
END
ELSE
BEGIN
    PRINT N'Cột avatarUrl đã tồn tại trong bảng dbo.Users.';
END;
GO

-- Lệnh SELECT xác minh cấu trúc sau khi thêm (nằm ở batch riêng sau GO)
SELECT TOP (10) id, email, role, avatarUrl FROM dbo.Users;
GO
