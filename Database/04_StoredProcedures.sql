/*
 Script: 04_StoredProcedures.sql
 Propósito: Crear los procedimientos almacenados para consultar tareas.

 Procedimientos:
 - task.sp_GetTasks
 - task.sp_GetTaskById
*/

USE TaskServiceDB;
GO

/*
 Procedimiento: task.sp_GetTasks
 Descripción: Retorna tareas filtradas por Estado y/o Prioridad.
 Parámetros:
    @State NVARCHAR(50) (opcional)
    @Priority NVARCHAR(50) (opcional)
*/
CREATE OR ALTER PROCEDURE task.sp_GetTasks
    @State NVARCHAR(50) = NULL,
    @Priority NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id,
           Title,
           Description,
           Priority,
           State,
           CreatedAt
    FROM task.Tasks
    WHERE (@State IS NULL OR State = @State)
      AND (@Priority IS NULL OR Priority = @Priority)
    ORDER BY CreatedAt DESC;
END;
GO

/*
 Procedimiento: task.sp_GetTaskById
 Descripción: Retorna una tarea específica por su identificador.
 Parámetro:
    @Id UNIQUEIDENTIFIER (obligatorio)
*/
CREATE OR ALTER PROCEDURE task.sp_GetTaskById
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id,
           Title,
           Description,
           Priority,
           State,
           CreatedAt
    FROM task.Tasks
    WHERE Id = @Id;
END;
GO