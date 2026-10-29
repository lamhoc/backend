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

-- Seed dữ liệu tài khoản mẫu ban đầu để kiểm thử
-- admin@example.com   / Admin@123   (role: admin)
-- student@example.com / Student@123 (role: student)
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = N'admin@example.com')
BEGIN
    INSERT INTO dbo.Users (fullName, email, passwordHash, role)
    VALUES (
        N'Quản trị viên Hệ thống',
        N'admin@example.com',
        N'$2b$10$MgRAc5Zb8YhljM/R2kkMBeGgvGEsQ/voo89Ub7JqQs/t9OSE5QQUe',
        N'admin'
    );
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE email = N'student@example.com')
BEGIN
    INSERT INTO dbo.Users (fullName, email, passwordHash, role)
    VALUES (
        N'Sinh viên Nguyễn Văn A',
        N'student@example.com',
        N'$2b$10$DC2p1PIi5Wco1b.QyBTnbOXqJNl.enBItxiB.W/oeFr8LkuYOYPi6',
        N'student'
    );
END;
