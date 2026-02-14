/*
 Script: 02_CreateTables.sql
 Propósito: Crear la tabla principal task.Tasks.

 Tabla: task.Tasks
 Descripción: Almacena los registros de tareas de la aplicación.
*/

USE TaskServiceDB;
GO

IF OBJECT_ID('task.Tasks', 'U') IS NOT NULL
    DROP TABLE task.Tasks;
GO

CREATE TABLE task.Tasks
(
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Priority NVARCHAR(20) NOT NULL,
    State NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO