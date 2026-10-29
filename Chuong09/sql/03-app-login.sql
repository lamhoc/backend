-- BƯỚC 1: Tạo hoặc cập nhật tài khoản đăng nhập
-- Thay REPLACE_WITH_STRONG_LOCAL_PASSWORD bằng mật khẩu local và dùng cùng giá trị trong .env.
USE master;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_logins
    WHERE name = N'sv_app'
)
BEGIN
    CREATE LOGIN [sv_app]
    WITH PASSWORD = N'REPLACE_WITH_STRONG_LOCAL_PASSWORD',
         CHECK_POLICY = ON,
         CHECK_EXPIRATION = OFF;
END
ELSE
BEGIN
    ALTER LOGIN [sv_app]
    WITH PASSWORD = N'REPLACE_WITH_STRONG_LOCAL_PASSWORD' UNLOCK;

    ALTER LOGIN [sv_app] ENABLE;
END;
GO

-- Đặt database mặc định cho tài khoản
ALTER LOGIN [sv_app]
WITH DEFAULT_DATABASE = [QuanLySinhVienDB];
GO


-- BƯỚC 2: Tạo hoặc liên kết user trong database
USE [QuanLySinhVienDB];
GO

IF USER_ID(N'sv_app') IS NULL
BEGIN
    CREATE USER [sv_app] FOR LOGIN [sv_app];
END
ELSE
BEGIN
    ALTER USER [sv_app] WITH LOGIN = [sv_app];
END;
GO


-- BƯỚC 3: Cấp quyền CRUD cho bảng SinhVien
GRANT SELECT, INSERT, UPDATE, DELETE
ON OBJECT::[dbo].[SinhVien]
TO [sv_app];
GO