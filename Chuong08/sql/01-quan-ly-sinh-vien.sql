IF DB_ID('QuanLySinhVienDB') IS NULL
BEGIN
    CREATE DATABASE QuanLySinhVienDB;
END
GO

USE QuanLySinhVienDB;
GO

IF OBJECT_ID('dbo.SinhVien', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SinhVien
    (
        maSV VARCHAR(5) NOT NULL,
        hoTen NVARCHAR(150) NOT NULL,
        email NVARCHAR(254) NOT NULL,
        maLop NVARCHAR(50) NOT NULL,

        CONSTRAINT PK_SinhVien PRIMARY KEY (maSV)
    );
END
GO