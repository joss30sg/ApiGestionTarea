/*
 Script: 01_CreateSchema.sql
 Propósito: Crear el esquema 'task' para agrupar lógicamente los objetos.
*/

USE TaskServiceDB;
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'task')
BEGIN
    EXEC('CREATE SCHEMA task');
END;
GO