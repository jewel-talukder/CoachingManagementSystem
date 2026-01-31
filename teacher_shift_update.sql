BEGIN TRANSACTION;
ALTER TABLE [Teachers] ADD [Shift] nvarchar(max) NOT NULL DEFAULT N'';

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260130203018_AddShiftToTeacher', N'9.0.0');

COMMIT;
GO

