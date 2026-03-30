# Base de Datos — TaskService

La aplicación usa **EF Core InMemory** por defecto, así que no necesitas configurar nada para ejecutarla. Al iniciar el backend, se cargan automáticamente 33 tareas de ejemplo.

Los scripts SQL en esta carpeta son de **referencia** para cuando quieras migrar a SQL Server en producción.

---

## No necesitas SQL Server para desarrollo

El backend carga una base de datos en memoria automáticamente. Solo ejecuta:

```powershell
cd Backend/TaskService.Api
dotnet run
```

Las 33 tareas de ejemplo se crean al iniciar la aplicación.

---

## Migrar a SQL Server (opcional, para producción)

Si quieres usar SQL Server en lugar de la base de datos en memoria:

### Paso 1: Instalar SQL Server

Descarga [SQL Server Express](https://www.microsoft.com/es-es/sql-server/sql-server-express) (gratuito).

### Paso 2: Crear la base de datos

Abre **SQL Server Management Studio** y ejecuta el archivo `InitDatabase.sql`:

1. Archivo → Abrir → selecciona `Database/InitDatabase.sql`
2. Presiona F5 o click en "Execute"

Esto crea:
- Base de datos `TaskServiceDB`
- Esquema `task`
- Tabla `task.Tasks`
- Datos de prueba

### Paso 3: Configurar la conexión

Edita `Backend/TaskService.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskServiceDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

Para SQL Server Express:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=TaskServiceDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

---

## Scripts incluidos

| Archivo | Qué hace |
|---------|----------|
| `InitDatabase.sql` | Ejecuta todo de una vez (recomendado) |
| `00_CreateDatabase.sql` | Crea la base de datos `TaskServiceDB` |
| `01_CreateSchema.sql` | Crea el esquema `task` |
| `02_CreateTables.sql` | Crea la tabla `task.Tasks` |
| `03_SeedData.sql` | Inserta datos de ejemplo |

> **Nota:** Los stored procedures fueron eliminados porque el backend usa Entity Framework Core con LINQ queries directamente, sin necesidad de procedimientos almacenados.

---

## Estructura de la tabla Tasks

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Id | UNIQUEIDENTIFIER | Identificador único (GUID) |
| Title | NVARCHAR(200) | Título (obligatorio) |
| Description | NVARCHAR(1000) | Descripción |
| Priority | NVARCHAR(20) | `High`, `Medium` o `Low` |
| State | NVARCHAR(20) | `Pending`, `InProgress` o `Completed` |
| CreatedAt | DATETIME2 | Fecha de creación (UTC) |

---

## Verificar que funciona

Después de ejecutar los scripts en SSMS:

```sql
SELECT * FROM [TaskServiceDB].[task].[Tasks];
```

Deberías ver las tareas de ejemplo insertadas.
