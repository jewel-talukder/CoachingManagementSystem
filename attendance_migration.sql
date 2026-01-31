IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Plans] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Price] decimal(18,2) NOT NULL,
    [BillingPeriod] nvarchar(max) NOT NULL,
    [TrialDays] int NOT NULL,
    [MaxUsers] int NULL,
    [MaxCourses] int NULL,
    [MaxStudents] int NULL,
    [MaxTeachers] int NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Plans] PRIMARY KEY ([Id])
);

CREATE TABLE [Roles] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
);

CREATE TABLE [Coachings] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Logo] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [City] nvarchar(max) NULL,
    [State] nvarchar(max) NULL,
    [ZipCode] nvarchar(max) NULL,
    [Country] nvarchar(max) NULL,
    [Phone] nvarchar(max) NULL,
    [Email] nvarchar(max) NULL,
    [Website] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsBlocked] bit NOT NULL,
    [SubscriptionId] int NULL,
    [SubscriptionExpiresAt] datetime2 NULL,
    [PlanId] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Coachings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Coachings_Plans_PlanId] FOREIGN KEY ([PlanId]) REFERENCES [Plans] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Subscriptions] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [PlanId] int NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [TrialEndDate] datetime2 NULL,
    [Status] nvarchar(max) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PaymentGateway] nvarchar(max) NULL,
    [TransactionId] nvarchar(max) NULL,
    [AutoRenew] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Subscriptions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Subscriptions_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Subscriptions_Plans_PlanId] FOREIGN KEY ([PlanId]) REFERENCES [Plans] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [FirstName] nvarchar(max) NOT NULL,
    [LastName] nvarchar(max) NOT NULL,
    [Email] nvarchar(450) NOT NULL,
    [Phone] nvarchar(max) NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [ProfilePicture] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [LastLoginAt] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Users_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Students] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [UserId] int NOT NULL,
    [StudentCode] nvarchar(450) NULL,
    [DateOfBirth] datetime2 NULL,
    [ParentName] nvarchar(max) NULL,
    [ParentPhone] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Students] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Students_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Students_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Teachers] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [UserId] int NOT NULL,
    [EmployeeCode] nvarchar(450) NULL,
    [Qualification] nvarchar(max) NULL,
    [Specialization] nvarchar(max) NULL,
    [JoiningDate] datetime2 NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Teachers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Teachers_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Teachers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [UsageLogs] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [Action] nvarchar(max) NOT NULL,
    [Details] nvarchar(max) NULL,
    [UserId] int NULL,
    [LoggedAt] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_UsageLogs] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UsageLogs_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_UsageLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
);

CREATE TABLE [UserRoles] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [RoleId] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_UserRoles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [Courses] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Code] nvarchar(450) NULL,
    [Fee] decimal(18,2) NULL,
    [DurationMonths] int NOT NULL,
    [IsActive] bit NOT NULL,
    [TeacherId] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Courses] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Courses_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Courses_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
);

CREATE TABLE [Batches] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [CourseId] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Code] nvarchar(450) NULL,
    [Description] nvarchar(max) NULL,
    [TeacherId] int NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NULL,
    [MaxStudents] int NOT NULL,
    [CurrentStudents] int NOT NULL,
    [ScheduleDays] nvarchar(max) NULL,
    [StartTime] time NULL,
    [EndTime] time NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Batches] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Batches_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Batches_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Batches_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
);

CREATE TABLE [Subjects] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [CourseId] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Code] nvarchar(max) NULL,
    [TeacherId] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Subjects] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Subjects_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Subjects_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Subjects_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
);

CREATE TABLE [Attendances] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [StudentId] int NOT NULL,
    [BatchId] int NOT NULL,
    [AttendanceDate] datetime2 NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [Remarks] nvarchar(max) NULL,
    [MarkedByUserId] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Attendances] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Attendances_Batches_BatchId] FOREIGN KEY ([BatchId]) REFERENCES [Batches] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Attendances_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Attendances_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Attendances_Users_MarkedByUserId] FOREIGN KEY ([MarkedByUserId]) REFERENCES [Users] ([Id])
);

CREATE TABLE [Enrollments] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [StudentId] int NOT NULL,
    [CourseId] int NOT NULL,
    [BatchId] int NOT NULL,
    [EnrollmentDate] datetime2 NOT NULL,
    [CompletionDate] datetime2 NULL,
    [Status] nvarchar(max) NOT NULL,
    [FeePaid] decimal(18,2) NULL,
    [TotalFee] decimal(18,2) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Enrollments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Enrollments_Batches_BatchId] FOREIGN KEY ([BatchId]) REFERENCES [Batches] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Enrollments_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Enrollments_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Enrollments_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Exams] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [SubjectId] int NOT NULL,
    [TeacherId] int NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [ExamType] nvarchar(max) NOT NULL,
    [ExamDate] datetime2 NOT NULL,
    [StartTime] time NULL,
    [EndTime] time NULL,
    [TotalMarks] decimal(18,2) NOT NULL,
    [PassingMarks] decimal(18,2) NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Exams] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Exams_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Exams_Subjects_SubjectId] FOREIGN KEY ([SubjectId]) REFERENCES [Subjects] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Exams_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id])
);

CREATE TABLE [Payments] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [StudentId] int NOT NULL,
    [EnrollmentId] int NULL,
    [PaymentType] nvarchar(max) NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PaymentDate] datetime2 NOT NULL,
    [PaymentMethod] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [TransactionId] nvarchar(max) NULL,
    [Remarks] nvarchar(max) NULL,
    [ReceiptNumber] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Payments_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Payments_Enrollments_EnrollmentId] FOREIGN KEY ([EnrollmentId]) REFERENCES [Enrollments] ([Id]),
    CONSTRAINT [FK_Payments_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [Results] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [StudentId] int NOT NULL,
    [ExamId] int NOT NULL,
    [MarksObtained] decimal(18,2) NOT NULL,
    [TotalMarks] decimal(18,2) NOT NULL,
    [Grade] nvarchar(max) NOT NULL,
    [Remarks] nvarchar(max) NULL,
    [PublishedAt] datetime2 NULL,
    [PublishedByUserId] int NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Results] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Results_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Results_Exams_ExamId] FOREIGN KEY ([ExamId]) REFERENCES [Exams] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Results_Students_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [Students] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Results_Users_PublishedByUserId] FOREIGN KEY ([PublishedByUserId]) REFERENCES [Users] ([Id])
);

CREATE INDEX [IX_Attendances_BatchId] ON [Attendances] ([BatchId]);

CREATE INDEX [IX_Attendances_CoachingId] ON [Attendances] ([CoachingId]);

CREATE INDEX [IX_Attendances_MarkedByUserId] ON [Attendances] ([MarkedByUserId]);

CREATE INDEX [IX_Attendances_StudentId] ON [Attendances] ([StudentId]);

CREATE UNIQUE INDEX [IX_Batches_CoachingId_Code] ON [Batches] ([CoachingId], [Code]) WHERE [Code] IS NOT NULL;

CREATE INDEX [IX_Batches_CourseId] ON [Batches] ([CourseId]);

CREATE INDEX [IX_Batches_TeacherId] ON [Batches] ([TeacherId]);

CREATE INDEX [IX_Coachings_PlanId] ON [Coachings] ([PlanId]);

CREATE UNIQUE INDEX [IX_Courses_CoachingId_Code] ON [Courses] ([CoachingId], [Code]) WHERE [Code] IS NOT NULL;

CREATE INDEX [IX_Courses_TeacherId] ON [Courses] ([TeacherId]);

CREATE INDEX [IX_Enrollments_BatchId] ON [Enrollments] ([BatchId]);

CREATE INDEX [IX_Enrollments_CoachingId] ON [Enrollments] ([CoachingId]);

CREATE INDEX [IX_Enrollments_CourseId] ON [Enrollments] ([CourseId]);

CREATE INDEX [IX_Enrollments_StudentId] ON [Enrollments] ([StudentId]);

CREATE INDEX [IX_Exams_CoachingId] ON [Exams] ([CoachingId]);

CREATE INDEX [IX_Exams_SubjectId] ON [Exams] ([SubjectId]);

CREATE INDEX [IX_Exams_TeacherId] ON [Exams] ([TeacherId]);

CREATE INDEX [IX_Payments_CoachingId] ON [Payments] ([CoachingId]);

CREATE INDEX [IX_Payments_EnrollmentId] ON [Payments] ([EnrollmentId]);

CREATE INDEX [IX_Payments_StudentId] ON [Payments] ([StudentId]);

CREATE INDEX [IX_Results_CoachingId] ON [Results] ([CoachingId]);

CREATE INDEX [IX_Results_ExamId] ON [Results] ([ExamId]);

CREATE INDEX [IX_Results_PublishedByUserId] ON [Results] ([PublishedByUserId]);

CREATE INDEX [IX_Results_StudentId] ON [Results] ([StudentId]);

CREATE UNIQUE INDEX [IX_Students_CoachingId_StudentCode] ON [Students] ([CoachingId], [StudentCode]) WHERE [StudentCode] IS NOT NULL;

CREATE UNIQUE INDEX [IX_Students_UserId] ON [Students] ([UserId]);

CREATE INDEX [IX_Subjects_CoachingId] ON [Subjects] ([CoachingId]);

CREATE INDEX [IX_Subjects_CourseId] ON [Subjects] ([CourseId]);

CREATE INDEX [IX_Subjects_TeacherId] ON [Subjects] ([TeacherId]);

CREATE UNIQUE INDEX [IX_Subscriptions_CoachingId] ON [Subscriptions] ([CoachingId]);

CREATE INDEX [IX_Subscriptions_PlanId] ON [Subscriptions] ([PlanId]);

CREATE UNIQUE INDEX [IX_Teachers_CoachingId_EmployeeCode] ON [Teachers] ([CoachingId], [EmployeeCode]) WHERE [EmployeeCode] IS NOT NULL;

CREATE UNIQUE INDEX [IX_Teachers_UserId] ON [Teachers] ([UserId]);

CREATE INDEX [IX_UsageLogs_CoachingId] ON [UsageLogs] ([CoachingId]);

CREATE INDEX [IX_UsageLogs_UserId] ON [UsageLogs] ([UserId]);

CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);

CREATE INDEX [IX_UserRoles_UserId] ON [UserRoles] ([UserId]);

CREATE UNIQUE INDEX [IX_Users_CoachingId_Email] ON [Users] ([CoachingId], [Email]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251222155346_InitialCreate', N'9.0.0');

DROP INDEX [IX_Teachers_CoachingId_EmployeeCode] ON [Teachers];

DROP INDEX [IX_Students_CoachingId_StudentCode] ON [Students];

DROP INDEX [IX_Courses_CoachingId_Code] ON [Courses];

DROP INDEX [IX_Batches_CoachingId_Code] ON [Batches];

ALTER TABLE [Teachers] ADD [BranchId] int NOT NULL DEFAULT 0;

ALTER TABLE [Students] ADD [BranchId] int NOT NULL DEFAULT 0;

ALTER TABLE [Enrollments] ADD [BranchId] int NOT NULL DEFAULT 0;

ALTER TABLE [Courses] ADD [BranchId] int NOT NULL DEFAULT 0;

ALTER TABLE [Batches] ADD [BranchId] int NOT NULL DEFAULT 0;

CREATE TABLE [Branches] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Code] nvarchar(450) NULL,
    [Address] nvarchar(max) NULL,
    [City] nvarchar(max) NULL,
    [State] nvarchar(max) NULL,
    [ZipCode] nvarchar(max) NULL,
    [Country] nvarchar(max) NULL,
    [Phone] nvarchar(max) NULL,
    [Email] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [IsDefault] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Branches] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Branches_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_Teachers_BranchId_EmployeeCode] ON [Teachers] ([BranchId], [EmployeeCode]) WHERE [EmployeeCode] IS NOT NULL;

CREATE INDEX [IX_Teachers_CoachingId] ON [Teachers] ([CoachingId]);

CREATE UNIQUE INDEX [IX_Students_BranchId_StudentCode] ON [Students] ([BranchId], [StudentCode]) WHERE [StudentCode] IS NOT NULL;

CREATE INDEX [IX_Students_CoachingId] ON [Students] ([CoachingId]);

CREATE INDEX [IX_Enrollments_BranchId] ON [Enrollments] ([BranchId]);

CREATE UNIQUE INDEX [IX_Courses_BranchId_Code] ON [Courses] ([BranchId], [Code]) WHERE [Code] IS NOT NULL;

CREATE INDEX [IX_Courses_CoachingId] ON [Courses] ([CoachingId]);

CREATE UNIQUE INDEX [IX_Batches_BranchId_Code] ON [Batches] ([BranchId], [Code]) WHERE [Code] IS NOT NULL;

CREATE INDEX [IX_Batches_CoachingId] ON [Batches] ([CoachingId]);

CREATE UNIQUE INDEX [IX_Branches_CoachingId_Code] ON [Branches] ([CoachingId], [Code]) WHERE [Code] IS NOT NULL;

ALTER TABLE [Batches] ADD CONSTRAINT [FK_Batches_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Courses] ADD CONSTRAINT [FK_Courses_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Enrollments] ADD CONSTRAINT [FK_Enrollments_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Students] ADD CONSTRAINT [FK_Students_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION;

ALTER TABLE [Teachers] ADD CONSTRAINT [FK_Teachers_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251226133518_UpdateDatabase', N'9.0.0');

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Teachers]') AND [c].[name] = N'Qualification');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Teachers] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [Teachers] DROP COLUMN [Qualification];

ALTER TABLE [Teachers] ADD [QualificationId] int NULL;

CREATE TABLE [Qualifications] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Qualifications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Qualifications_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Teachers_QualificationId] ON [Teachers] ([QualificationId]);

CREATE INDEX [IX_Qualifications_CoachingId] ON [Qualifications] ([CoachingId]);

ALTER TABLE [Teachers] ADD CONSTRAINT [FK_Teachers_Qualifications_QualificationId] FOREIGN KEY ([QualificationId]) REFERENCES [Qualifications] ([Id]) ON DELETE SET NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251227033208_AddQualificationsTable', N'9.0.0');

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Teachers]') AND [c].[name] = N'Specialization');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Teachers] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [Teachers] DROP COLUMN [Specialization];

ALTER TABLE [Teachers] ADD [SpecializationId] int NULL;

CREATE TABLE [Specializations] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Specializations] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Specializations_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Teachers_SpecializationId] ON [Teachers] ([SpecializationId]);

CREATE INDEX [IX_Specializations_CoachingId] ON [Specializations] ([CoachingId]);

ALTER TABLE [Teachers] ADD CONSTRAINT [FK_Teachers_Specializations_SpecializationId] FOREIGN KEY ([SpecializationId]) REFERENCES [Specializations] ([Id]) ON DELETE SET NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251227042534_AddSpecializationsTable', N'9.0.0');

ALTER TABLE [Payments] ADD [BranchId] int NULL;


                UPDATE p
                SET p.BranchId = s.BranchId
                FROM Payments p
                INNER JOIN Students s ON p.StudentId = s.Id
                WHERE p.BranchId IS NULL
            

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Payments]') AND [c].[name] = N'BranchId');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Payments] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [Payments] ALTER COLUMN [BranchId] int NOT NULL;
ALTER TABLE [Payments] ADD DEFAULT 0 FOR [BranchId];

CREATE INDEX [IX_Payments_BranchId] ON [Payments] ([BranchId]);

ALTER TABLE [Payments] ADD CONSTRAINT [FK_Payments_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251229055229_AddBranchIdToPayments', N'9.0.0');

ALTER TABLE [Teachers] ADD [EmploymentType] int NOT NULL DEFAULT 0;

ALTER TABLE [Teachers] ADD [Salary] decimal(18,2) NULL;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251229060027_UpdatePaymentBranchId', N'9.0.0');

ALTER TABLE [Batches] ADD [MonthlyFee] decimal(18,2) NOT NULL DEFAULT 0.0;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260124191418_AddMonthlyFeeToBatch', N'9.0.0');

ALTER TABLE [Batches] DROP CONSTRAINT [FK_Batches_Courses_CourseId];

DROP INDEX [IX_Batches_CourseId] ON [Batches];

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Batches]') AND [c].[name] = N'CourseId');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Batches] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [Batches] DROP COLUMN [CourseId];

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260125092311_RemoveCourseIdFromBatch', N'9.0.0');

CREATE TABLE [Holidays] (
    [Id] int NOT NULL IDENTITY,
    [CoachingId] int NOT NULL,
    [BranchId] int NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [HolidayDate] datetime2 NOT NULL,
    [IsRecurring] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_Holidays] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Holidays_Branches_BranchId] FOREIGN KEY ([BranchId]) REFERENCES [Branches] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Holidays_Coachings_CoachingId] FOREIGN KEY ([CoachingId]) REFERENCES [Coachings] ([Id]) ON DELETE NO ACTION
);

CREATE INDEX [IX_Holidays_BranchId] ON [Holidays] ([BranchId]);

CREATE INDEX [IX_Holidays_CoachingId] ON [Holidays] ([CoachingId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260126194903_AddHolidayEntity', N'9.0.0');

EXEC sp_rename N'[Holidays].[HolidayDate]', N'StartDate', 'COLUMN';

ALTER TABLE [Holidays] ADD [DaysOfWeek] nvarchar(max) NULL;

ALTER TABLE [Holidays] ADD [EndDate] datetime2 NULL;

ALTER TABLE [Holidays] ADD [HolidayType] nvarchar(max) NOT NULL DEFAULT N'';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260126201247_UpdateHolidayEntityWithDateRangeAndWeeklyOff', N'9.0.0');

DROP INDEX [IX_Users_CoachingId_Email] ON [Users];

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Users]') AND [c].[name] = N'Email');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Users] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [Users] ALTER COLUMN [Email] nvarchar(450) NULL;

CREATE UNIQUE INDEX [IX_Users_CoachingId_Email] ON [Users] ([CoachingId], [Email]) WHERE [Email] IS NOT NULL AND [Email] <> '';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260129135505_FixUserEmailUniqueIndex', N'9.0.0');

DROP INDEX [IX_Students_BranchId_StudentCode] ON [Students];

CREATE UNIQUE INDEX [IX_Students_BranchId_StudentCode] ON [Students] ([BranchId], [StudentCode]) WHERE [StudentCode] IS NOT NULL AND [StudentCode] <> '';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260129140711_FixUserEmailUniqueIndex01', N'9.0.0');

DECLARE @var5 sysname;
SELECT @var5 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Attendances]') AND [c].[name] = N'StudentId');
IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Attendances] DROP CONSTRAINT [' + @var5 + '];');
ALTER TABLE [Attendances] ALTER COLUMN [StudentId] int NULL;

DECLARE @var6 sysname;
SELECT @var6 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Attendances]') AND [c].[name] = N'BatchId');
IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [Attendances] DROP CONSTRAINT [' + @var6 + '];');
ALTER TABLE [Attendances] ALTER COLUMN [BatchId] int NULL;

ALTER TABLE [Attendances] ADD [ApprovedByUserId] int NULL;

ALTER TABLE [Attendances] ADD [AttendanceType] nvarchar(max) NOT NULL DEFAULT N'';

ALTER TABLE [Attendances] ADD [IsApproved] bit NOT NULL DEFAULT CAST(0 AS bit);

ALTER TABLE [Attendances] ADD [TeacherId] int NULL;

CREATE INDEX [IX_Attendances_ApprovedByUserId] ON [Attendances] ([ApprovedByUserId]);

CREATE INDEX [IX_Attendances_TeacherId] ON [Attendances] ([TeacherId]);

ALTER TABLE [Attendances] ADD CONSTRAINT [FK_Attendances_Teachers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [Teachers] ([Id]);

ALTER TABLE [Attendances] ADD CONSTRAINT [FK_Attendances_Users_ApprovedByUserId] FOREIGN KEY ([ApprovedByUserId]) REFERENCES [Users] ([Id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260130174248_UpdateAttendanceForTeacherAndApproval', N'9.0.0');

ALTER TABLE [Teachers] ADD [Shift] nvarchar(max) NOT NULL DEFAULT N'';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260130203018_AddShiftToTeacher', N'9.0.0');

COMMIT;
GO

