# 🗄️ Base de Datos - TaskService

Base de datos **SQL Server** para almacenar y gestionar tareas.

---

## 📋 Requisitos Previos

- ✅ **SQL Server 2019 o superior** o [SQL Server Express](https://www.microsoft.com/es-es/sql-server/sql-server-express)
- ✅ **SQL Server Management Studio (SSMS)** para ejecutar scripts
- ✅ Acceso a **Windows Authentication** o credenciales de SQL Server

---

## 🚀 1. Instalación Rápida

### Opción 1: Ejecutar Todos los Scripts en Orden

Abre **SQL Server Management Studio** y ejecuta los scripts en este orden:

```powershell
# En PowerShell o terminal
1. Database/00_CreateDatabase.sql
2. Database/01_CreateSchema.sql
3. Database/02_CreateTables.sql
4. Database/03_SeedData.sql
5. Database/04_StoredProcedures.sql
```

### Opción 2: Ejecutar Script Integrado (Recomendado)

Ejecuta un único script que contiene todo:

```powershell
Database/InitDatabase.sql
```

---

## 📂 2. Scripts de Base de Datos

### 00_CreateDatabase.sql
**Propósito**: Crea la base de datos principal

```sql
CREATE DATABASE TaskServiceDB;
```

**Resultado**:
- ✅ Base de datos `TaskServiceDB` creada

---

### 01_CreateSchema.sql
**Propósito**: Crea el esquema de organización

```sql
CREATE SCHEMA [task];
GO
```

**Resultado**:
- ✅ Esquema `task` creado (agrupa objetos relacionados con tareas)

---

### 02_CreateTables.sql
**Propósito**: Crea tabla principal de tareas

```sql
CREATE TABLE [task].[Tasks] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Title] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(1000),
    [Priority] NVARCHAR(20) NOT NULL,  -- 'High', 'Medium', 'Low'
    [State] NVARCHAR(20) NOT NULL,      -- 'Pending', 'Completed'
    [CreatedAt] DATETIME2 DEFAULT GETUTCDATE()
);
```

**Estructura**:
| Columna | Tipo | Descripción |
|---------|------|-------------|
| Id | UNIQUEIDENTIFIER | Identificador único (GUID) |
| Title | NVARCHAR(200) | Título de la tarea (obligatorio) |
| Description | NVARCHAR(1000) | Descripción de la tarea |
| Priority | NVARCHAR(20) | Prioridad (High, Medium, Low) |
| State | NVARCHAR(20) | Estado (Pending, Completed) |
| CreatedAt | DATETIME2 | Fecha de creación (UTC) |

---

### 03_SeedData.sql
**Propósito**: Inserta datos de prueba

```sql
INSERT INTO [task].[Tasks] 
    (Title, Description, Priority, State)
VALUES
    ('Implementar API REST', 'Crear endpoints GET para tareas', 'High', 'Pending'),
    ('Diseñar mobile app', 'Crear interfaz en React Native', 'High', 'In Progress'),
    ('Documentar código', 'Agregar comentarios al código', 'Medium', 'Pending'),
    ('Hacer testing', 'Crear tests unitarios', 'Medium', 'Pending'),
    ('Deploy a producción', 'Publicar en servidor', 'High', 'Pending');
```

**Datos Incluidos**:
- 4-5 tareas de ejemplo
- Diferentes prioridades y estados
- Útil para testing y demo

---

### 04_StoredProcedures.sql
**Propósito**: Crea procedimientos almacenados (consultas optimizadas)

#### Stored Procedure 1: `task.sp_GetTasks`

```sql
CREATE PROCEDURE [task].[sp_GetTasks]
    @State NVARCHAR(20) = NULL,
    @Priority NVARCHAR(20) = NULL
AS
BEGIN
    SELECT Id, Title, Description, Priority, State, CreatedAt
    FROM [task].[Tasks]
    WHERE (@State IS NULL OR State = @State)
      AND (@Priority IS NULL OR Priority = @Priority)
    ORDER BY CreatedAt DESC;
END;
```

**Parámetros**:
- `@State`: (Opcional) Filtrar por estado (Pending, Completed)
- `@Priority`: (Opcional) Filtrar por prioridad (High, Medium, Low)

**Ejemplos de Uso**:
```sql
-- Obtener todas las tareas
EXEC [task].[sp_GetTasks];

-- Obtener tareas pendientes
EXEC [task].[sp_GetTasks] @State = 'Pending';

-- Obtener tareas con prioridad alta
EXEC [task].[sp_GetTasks] @Priority = 'High';

-- Obtener tareas pendientes de alta prioridad
EXEC [task].[sp_GetTasks] @State = 'Pending', @Priority = 'High';
```

---

#### Stored Procedure 2: `task.sp_GetTaskById`

```sql
CREATE PROCEDURE [task].[sp_GetTaskById]
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    SELECT Id, Title, Description, Priority, State, CreatedAt
    FROM [task].[Tasks]
    WHERE Id = @Id;
END;
```

**Parámetros**:
- `@Id`: ID de la tarea (GUID)

**Ejemplo de Uso**:
```sql
-- Obtener una tarea específica
DECLARE @TaskId UNIQUEIDENTIFIER = '550e8400-e29b-41d4-a716-446655440000';
EXEC [task].[sp_GetTaskById] @Id = @TaskId;
```

---

## 📖 3. Ejecutar Scripts Manualmente

### Paso 1: Conectarse a SQL Server

1. Abre **SQL Server Management Studio**
2. Pantalla de conexión:
   - **Server name**: `localhost` o `.\SQLEXPRESS`
   - **Authentication**: Windows Authentication
   - Click **Connect**

### Paso 2: Ejecutar Script

1. Click **File → Open → File**
2. Selecciona `InitDatabase.sql`
3. Click **Execute** o presiona **F5**

### Paso 3: Verificar Creación

```sql
-- Verificar que la base de datos existe
SELECT name FROM sys.databases WHERE name = 'TaskServiceDB';

-- Ver la tabla creada
SELECT * FROM [TaskServiceDB].[task].[Tasks];

-- Verificar procedimientos almacenados
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'task';
```

---

## 🔧 4. Configuración en el Backend

El Backend (.NET) se conecta a esta base de datos mediante la cadena de conexión en `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskServiceDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Cambiar ConnectionString si es necesario**:

### Para SQL Server Express
```json
"Server=.\\SQLEXPRESS;Database=TaskServiceDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

### Para autenticación SQL Server
```json
"Server=localhost;Database=TaskServiceDB;User Id=sa;Password=TuPassword;TrustServerCertificate=True;"
```

---

## 🧪 5. Testing de Conexión

### Desde SQL Server Management Studio

```sql
-- Probar conexión a la base de datos
USE TaskServiceDB;

-- Verificar tabla
SELECT COUNT(*) as TotalTareas FROM [task].[Tasks];

-- Ejecutar stored procedure
EXEC [task].[sp_GetTasks];

-- Ejecutar otro stored procedure
EXEC [task].[sp_GetTasks] @State = 'Pending', @Priority = 'High';
```

### Desde el Backend (.NET)

El Backend ejecuta:
```csharp
// Endpoint: GET /api/tasks
var tasks = await _taskService.GetTasksAsync(state, priority);
```

Internamente:
1. Llama a `ITaskRepository.GetTasksAsync()`
2. Ejecuta el Stored Procedure `task.sp_GetTasks`
3. Retorna los resultados como JSON

---

## 📊 6. Diagrama de Datos

```
┌─────────────────────────────────┐
│         TaskServiceDB           │
│     (SQL Server Database)       │
├─────────────────────────────────┤
│   Schema: task                  │
├─────────────────────────────────┤
│  Table: task.Tasks              │
│  ├─ Id (PK)                     │
│  ├─ Title                       │
│  ├─ Description                 │
│  ├─ Priority                    │
│  ├─ State                       │
│  └─ CreatedAt                   │
├─────────────────────────────────┤
│  Stored Procedures:             │
│  ├─ task.sp_GetTasks            │
│  └─ task.sp_GetTaskById         │
└─────────────────────────────────┘
```

---

## 🔄 7. Flujo de Datos

```
Backend API
    ↓
TaskRepository (Dapper)
    ↓
SQL Connection
    ↓
Stored Procedure (task.sp_GetTasks)
    ↓
SQL Server Database
    ↓
task.Tasks Table
    ↓
Resultados → Backend → JSON → Mobile App
```

---

## 🛡️ 8. Consideraciones de Seguridad

### ✅ Implementado en este Proyecto

- ✅ **Datos Paramétricos**: Los Stored Procedures usan parámetros para evitar SQL Injection
- ✅ **Esquema Separado**: `task` schema organiza los objetos
- ✅ **Sem Datos Sensibles**: La tabla solo almacena información de tareas

### ⚠️ Para Producción (No Implementado)

- [ ] **Encriptación de Conexión**: Usar `Encrypt=true` en connection string
- [ ] **Credenciales Seguras**: Usar secrets manager en lugar de hardcode
- [ ] **Auditoría**: Agregar triggers para tracking de cambios
- [ ] **Backups**: Implementar estrategia de backup automático
- [ ] **Permissions**: Limitar permisos de usuarios SQL Server

---

## 📋 Checklist de Verificación

- [ ] SQL Server instalado y funcional
- [ ] SSMS instalado y conectado
- [ ] Script `InitDatabase.sql` ejecutado sin errores
- [ ] Base de datos `TaskServiceDB` visible en SSMS
- [ ] Tabla `task.Tasks` contiene datos
- [ ] Stored Procedures `sp_GetTasks` y `sp_GetTaskById` existen
- [ ] Query `SELECT * FROM [task].[Tasks]` retorna resultados
- [ ] Connection string en Backend configurada correctamente
- [ ] Backend se conecta sin errores a la BD

---

## 🔗 Documentación Relacionada

- [Backend Documentation](../Backend/README.md)
- [Frontend Documentation](../Frontend/README.md)
- [OWASP Security Analysis](../ANÁLISIS-INTEGRAL-OWASP-ESCALABILIDAD.md)
- [SQL Server Documentation](https://learn.microsoft.com/en-us/sql/)

---

## ❓ Troubleshooting

### Error: "Cannot connect to server"

```
❌ A network or instance-specific error occurred
```

**Solución**:
1. Verifica que SQL Server está corriendo (Services: SQL Server)
2. Verifica el nombre del servidor (localhost vs .\SQLEXPRESS)
3. Verifica autenticación (Windows vs SQL)

### Error: "Database already exists"

```
❌ CREATE DATABASE TaskServiceDB failed. Database already exists.
```

**Solución**:
1. Elimina la BD existente:
   ```sql
   DROP DATABASE TaskServiceDB;
   ```
2. Ejecuta el script nuevamente

### Error: "Schema already exists"

```
❌ CREATE SCHEMA task failed. Schema already exists.
```

**Solución**:
1. Los scripts son idempotentes (seguros para ejecutar múltiples veces)
2. Script puede modificarse para agregar `IF NOT EXISTS`:
   ```sql
   IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'task')
   BEGIN
       CREATE SCHEMA [task];
   END;
   ```

---

**Base de datos lista para usar. Continúa con Backend y Frontend! 🎉**