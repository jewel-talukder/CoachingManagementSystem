-- Dynamic RBAC Migration Script

-- 1. Update Roles table to support multi-tenancy
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[Roles]') AND name = N'CoachingId')
BEGIN
    ALTER TABLE [Roles] ADD [CoachingId] INT NULL;
    
    -- Add foreign key constraint
    ALTER TABLE [Roles] WITH CHECK ADD CONSTRAINT [FK_Roles_Coachings_CoachingId] FOREIGN KEY([CoachingId])
    REFERENCES [Coachings] ([Id])
    ON DELETE NO ACTION;
END
GO

-- 2. Create Permissions table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[Permissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [Permissions] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [Name] NVARCHAR(100) NOT NULL,
        [Description] NVARCHAR(250) NULL,
        [Group] NVARCHAR(50) NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] DATETIME2 NULL,
        [IsDeleted] BIT NOT NULL DEFAULT (0),
        CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
    
    CREATE UNIQUE INDEX [IX_Permissions_Name] ON [Permissions] ([Name]);
END
GO

-- 3. Create RolePermissions table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[RolePermissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [RolePermissions] (
        [Id] INT IDENTITY(1,1) NOT NULL,
        [RoleId] INT NOT NULL,
        [PermissionId] INT NOT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] DATETIME2 NULL,
        [IsDeleted] BIT NOT NULL DEFAULT (0),
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_RolePermissions_Roles_RoleId] FOREIGN KEY([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] FOREIGN KEY([PermissionId]) REFERENCES [Permissions] ([Id]) ON DELETE CASCADE
    );
END
GO

-- 4. Seed initial permissions
IF NOT EXISTS (SELECT 1 FROM [Permissions])
BEGIN
    INSERT INTO [Permissions] ([Name], [Description], [Group], [CreatedAt]) VALUES
    ('Dashboard.View', 'View Dashboard stats', 'Dashboard', GETUTCDATE()),
    
    ('Academic.Branches.View', 'View branches', 'Academic', GETUTCDATE()),
    ('Academic.Branches.Create', 'Create new branches', 'Academic', GETUTCDATE()),
    ('Academic.Branches.Edit', 'Edit branches', 'Academic', GETUTCDATE()),
    ('Academic.Branches.Delete', 'Delete branches', 'Academic', GETUTCDATE()),
    
    ('Academic.Courses.View', 'View courses', 'Academic', GETUTCDATE()),
    ('Academic.Courses.Create', 'Create new courses', 'Academic', GETUTCDATE()),
    ('Academic.Courses.Edit', 'Edit courses', 'Academic', GETUTCDATE()),
    
    ('Academic.Batches.View', 'View batches', 'Academic', GETUTCDATE()),
    ('Academic.Batches.Create', 'Create new batches', 'Academic', GETUTCDATE()),
    ('Academic.Batches.Edit', 'Edit batches', 'Academic', GETUTCDATE()),
    
    ('People.Students.View', 'View students list', 'People', GETUTCDATE()),
    ('People.Students.Create', 'Register new students', 'People', GETUTCDATE()),
    ('People.Students.Edit', 'Edit student details', 'People', GETUTCDATE()),
    
    ('People.Teachers.View', 'View teachers list', 'People', GETUTCDATE()),
    ('People.Teachers.Create', 'Register new teachers', 'People', GETUTCDATE()),
    ('People.Teachers.Edit', 'Edit teacher details', 'People', GETUTCDATE()),
    
    ('People.Users.View', 'View admin users', 'People', GETUTCDATE()),
    ('People.Users.Create', 'Create admin users', 'People', GETUTCDATE()),
    
    ('Attendance.View', 'View attendance history', 'Attendance', GETUTCDATE()),
    ('Attendance.Mark', 'Mark student attendance', 'Attendance', GETUTCDATE()),
    ('Attendance.Approve', 'Approve teacher attendance', 'Attendance', GETUTCDATE()),
    
    ('Finance.Payments.View', 'View payment records', 'Finance', GETUTCDATE()),
    ('Finance.Payments.Create', 'Collect payments', 'Finance', GETUTCDATE()),
    ('Finance.Subscription.View', 'View subscription', 'Finance', GETUTCDATE()),
    
    ('Settings.View', 'View coaching settings', 'Settings', GETUTCDATE()),
    ('Settings.Edit', 'Update coaching settings', 'Settings', GETUTCDATE());
END
GO
