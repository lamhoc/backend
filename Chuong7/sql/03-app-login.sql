-- Run in SQLCMD mode and set APP_LOGIN_PASSWORD to the local DB_PASSWORD value.
USE master;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.sql_logins
    WHERE name = N'sv_app'
)
BEGIN
    CREATE LOGIN [sv_app]
     WITH PASSWORD = N'$(APP_LOGIN_PASSWORD)',
         CHECK_POLICY = ON,
         CHECK_EXPIRATION = OFF;
END
ELSE
BEGIN
    ALTER LOGIN [sv_app]
     WITH PASSWORD = N'$(APP_LOGIN_PASSWORD)' UNLOCK;

    ALTER LOGIN [sv_app] ENABLE;
END;
GO

ALTER LOGIN [sv_app]
WITH DEFAULT_DATABASE = [QuanLySinhVienDB];
GO


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


GRANT SELECT, INSERT, UPDATE, DELETE
ON OBJECT::[dbo].[SinhVien]
TO [sv_app];
GO