SET NOCOUNT ON;
GO

-- ============================================================
-- 00_CreateDatabase.sql
-- ============================================================
-- Propósito: Crear la base de datos TaskServiceDB si no existe.

IF DB_ID('TaskServiceDB') IS NULL
BEGIN
    CREATE DATABASE TaskServiceDB;
    PRINT 'DATABASE [TaskServiceDB] created successfully.';
END
ELSE
BEGIN
    PRINT 'DATABASE [TaskServiceDB] already exists.';
END;
GO

USE TaskServiceDB;
GO

-- ============================================================
-- 01_CreateSchema.sql
-- ============================================================
-- Propósito: Crear el esquema 'task' para agrupar lógicamente los objetos.

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'task')
BEGIN
    EXEC('CREATE SCHEMA task');
    PRINT 'SCHEMA [task] created successfully.';
END
ELSE
BEGIN
    PRINT 'SCHEMA [task] already exists.';
END;
GO

-- ============================================================
-- 02_CreateTables.sql
-- ============================================================
-- Propósito: Crear la tabla principal task.Tasks.
-- Tabla: task.Tasks
-- Descripción: Almacena los registros de tareas de la aplicación.

IF OBJECT_ID('task.Tasks', 'U') IS NOT NULL
BEGIN
    DROP TABLE task.Tasks;
    PRINT 'TABLE [task.Tasks] dropped.';
END;
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

CREATE NONCLUSTERED INDEX idx_Tasks_State ON task.Tasks(State);
CREATE NONCLUSTERED INDEX idx_Tasks_Priority ON task.Tasks(Priority);
CREATE NONCLUSTERED INDEX idx_Tasks_CreatedAt ON task.Tasks(CreatedAt);

PRINT 'TABLE [task.Tasks] created successfully with indexes.';
GO

-- ============================================================
-- 03_SeedData.sql
-- ============================================================
-- Propósito: Insertar datos iniciales de prueba.
-- Notas:
-- - SYSUTCDATETIME asegura consistencia en zona horaria.
-- - NEWID genera identificadores únicos.

USE TaskServiceDB;
GO

INSERT INTO task.Tasks (Id, Title, Description, Priority, State, CreatedAt)
VALUES
-- Tareas Pendientes - Prioridad Alta
(NEWID(), 'Implementar autenticación OAuth', 'Investigar y configurar OAuth2 para la aplicación', 'High', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Resolver bug crítico en login', 'El usuario no puede acceder con redes sociales', 'High', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Documentar API REST', 'Crear especificación OpenAPI completa', 'High', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Setup de infraestructura en AWS', 'Configurar EC2, RDS y S3', 'High', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Implementar caché con Redis', 'Mejorar performance del sistema', 'High', 'Pending', SYSUTCDATETIME()),

-- Tareas Pendientes - Prioridad Media
(NEWID(), 'Actualizar dependencias', 'Actualizar NuGet packages a las versiones más recientes', 'Medium', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Revisar cobertura de tests', 'Asegurar que la cobertura sea mayor a 80%', 'Medium', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Refactorizar módulo de reportes', 'Mejorar claridad y performance del código', 'Medium', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Crear script de migración', 'Base de datos principal a producción', 'Medium', 'Pending', SYSUTCDATETIME()),

-- Tareas Pendientes - Prioridad Baja
(NEWID(), 'Mejorar diseño de botones', 'Actualizar estilos CSS según guía de marca', 'Low', 'Pending', SYSUTCDATETIME()),
(NEWID(), 'Limpiar código legacy', 'Eliminar funciones deprecadas', 'Low', 'Pending', SYSUTCDATETIME()),

-- Tareas En Progreso - Prioridad Alta
(NEWID(), 'Integración con Stripe', 'Implementar pagos en línea', 'High', 'InProgress', SYSUTCDATETIME()),
(NEWID(), 'Implementar caché avanzado', 'Sistema de caché distribuido con Redis', 'High', 'InProgress', SYSUTCDATETIME()),
(NEWID(), 'Migrar a microservicios', 'Separar módulos en servicios independientes', 'High', 'InProgress', SYSUTCDATETIME()),

-- Tareas En Progreso - Prioridad Media
(NEWID(), 'Diseñar dashboard de analytics', 'Crear visualizaciones de datos de usuarios', 'Medium', 'InProgress', SYSUTCDATETIME()),
(NEWID(), 'Implementar notificaciones push', 'Agregar capacidad de notificaciones en tiempo real', 'Medium', 'InProgress', SYSUTCDATETIME()),
(NEWID(), 'Configurar CI/CD con GitHub Actions', 'Automatizar deploy y tests', 'Medium', 'InProgress', SYSUTCDATETIME()),
(NEWID(), 'Crear test suite completa', 'Unit tests e integration tests', 'Medium', 'InProgress', SYSUTCDATETIME()),

-- Tareas En Progreso - Prioridad Baja
(NEWID(), 'Mejorar accesibilidad (a11y)', 'Cumplir estándares WCAG 2.1', 'Low', 'InProgress', SYSUTCDATETIME()),
(NEWID(), 'Optimizar imágenes', 'Reducir tamaño de assets', 'Low', 'InProgress', SYSUTCDATETIME()),

-- Tareas Completadas - Prioridad Alta
(NEWID(), 'Estudiar .NET', 'Arquitectura limpia y patrones de diseño', 'High', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Implementar validación de datos', 'DTOs y FluentValidation', 'High', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Crear base de datos inicial', 'Schema y stored procedures', 'High', 'Completed', SYSUTCDATETIME()),

-- Tareas Completadas - Prioridad Media
(NEWID(), 'Ejercicio', 'Ir al gimnasio y completar rutina de 45 minutos', 'Medium', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Implementar paginación', 'Agregar soporte para paginación en GET', 'Medium', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Crear filtros de búsqueda', 'Filtración por estado, prioridad y fecha', 'Medium', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Documentar código', 'Agregar comentarios XML a todas las clases', 'Medium', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Crear UI mockups', 'Diseños en Figma para todas las pantallas', 'Medium', 'Completed', SYSUTCDATETIME()),

-- Tareas Completadas - Prioridad Baja
(NEWID(), 'Actualizar ReadMe', 'Incluir instrucciones de setup nuevas', 'Low', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Organizar repositorio', 'Crear carpetas y estructura de proyecto', 'Low', 'Completed', SYSUTCDATETIME()),
(NEWID(), 'Configurar .gitignore', 'Excluir bin, obj, node_modules', 'Low', 'Completed', SYSUTCDATETIME());

PRINT '31 seed records inserted into task.Tasks.';
GO

-- ============================================================
-- RESUMEN FINAL
-- ============================================================
PRINT '';
PRINT '========================================';
PRINT 'BASE DE DATOS INICIALIZADA CORRECTAMENTE';
PRINT '========================================';
PRINT 'Database: TaskServiceDB';
PRINT 'Schema: task';
PRINT 'Table: task.Tasks';
PRINT 'Sample Data: 31 tasks';
PRINT '';
PRINT 'Para verificar, ejecuta:';
PRINT 'SELECT COUNT(*) FROM task.Tasks;';
PRINT '========================================';
GO

-- Verificar datos insertados
SELECT COUNT(*) AS TotalTasks FROM task.Tasks;
GO