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
