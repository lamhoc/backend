USE [QuanLySinhVienDB];
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users
    (
        id INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_Users PRIMARY KEY,

        fullName NVARCHAR(150) NOT NULL,

        email NVARCHAR(254) NOT NULL,

        passwordHash NVARCHAR(255) NOT NULL,

        role NVARCHAR(20) NOT NULL
            CONSTRAINT DF_Users_role DEFAULT (N'student'),

        CONSTRAINT UQ_Users_email UNIQUE (email),

        CONSTRAINT CK_Users_role
            CHECK (role IN (N'student', N'admin'))
    );
END;
GO

-- Cấp quyền CRUD bảng dbo.Users cho tài khoản ứng dụng sv_app
IF USER_ID(N'sv_app') IS NOT NULL
BEGIN
    GRANT SELECT, INSERT, UPDATE, DELETE
    ON OBJECT::[dbo].[Users]
    TO [sv_app];
END;
GO
