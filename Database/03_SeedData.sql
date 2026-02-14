/*
 Script: 03_SeedData.sql
 Propósito: Insertar datos iniciales de prueba.

 Notas:
 - SYSUTCDATETIME asegura consistencia en zona horaria.
 - NEWID genera identificadores únicos.
*/

USE TaskServiceDB;
GO

INSERT INTO task.Tasks (Id, Title, Description, Priority, State, CreatedAt)
VALUES
(NEWID(), 'Implementar CQRS', 'Separar queries y handlers', 'High', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Actualizar Swagger', 'Documentar endpoints en español', 'Medium', 'InProgress', SYSUTCDATETIME()),
(NEWID(), 'Revisión OWASP', 'Validar consideraciones de seguridad', 'Low', 'Completed', SYSUTCDATETIME());
GO