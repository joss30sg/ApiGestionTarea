# 🔧 Backend - TaskService API

API REST desarrollada en **.NET 8** con **Clean Architecture** y **Repository Pattern**.

---

## � Tabla de Contenidos

1. [Requisitos Previos](#-requisitos-previos)
2. [Configurar Base de Datos](#-1-configurar-base-de-datos)
3. [Configurar Cadena de Conexión](#-2-configurar-cadena-de-conexión)
4. [Compilar y Ejecutar Backend](#-3-compilar-y-ejecutar-backend)
5. [Verificar API Funcionando](#-4-verificar-api-funcionando)
6. [Seguridad - API Key](#-5-seguridad---api-key)
7. [Ejecutar Tests](#-6-ejecutar-tests)
8. [Estructura del Proyecto](#-7-estructura-del-proyecto)
9. [Configuración Avanzada](#-8-configuración-avanzada)
10. [Troubleshooting](#-9-troubleshooting)
11. [Debugging, Variables de Entorno, Quick Start](#-10-debugging-y-variables-de-entorno)
12. [Documentación Adicional](#-11-documentación-adicional)
13. [Checklist de Implementación](#-12-checklist-de-implementación)

---

## �📋 Requisitos Previos

### Software Requerido

- ✅ [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- ✅ [SQL Server 2019 o superior](https://www.microsoft.com/es-es/sql-server/sql-server-downloads) o [SQL Server Express](https://www.microsoft.com/es-es/sql-server/sql-server-express)
- ✅ [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
- ✅ [Visual Studio Code](https://code.visualstudio.com/) o [Visual Studio Community](https://visualstudio.microsoft.com/es/vs/community/)
- ✅ Un terminal PowerShell o CMD

### Verificar Instalación

```powershell
# Verificar .NET
dotnet --version

# Verificar SQL Server (desde SSMS)
# En SSMS: Server name debe ser accesible (ej: localhost o .\SQLEXPRESS)
```

---

## 🗄️ 1. Configurar Base de Datos

### Paso 1: Conectarse a SQL Server

Abre **SQL Server Management Studio**:

1. Pantalla de conexión:
   - **Server name**: `localhost` o `.\SQLEXPRESS` (si usas Express)
   - **Authentication**: Windows Authentication o SQL Server Authentication
   - Click en **Connect**

### Paso 2: Ejecutar Scripts de Base de Datos

En SQL Server Management Studio:

1. Click en **File → Open → File**
2. Navega a: `Database/InitDatabase.sql`
3. Click en **Execute** (o presiona **F5**)

Esto creará:
- ✅ Base de datos: **TaskServiceDB**
- ✅ Esquema: **task**
- ✅ Tabla: **task.Tasks**
- ✅ Stored Procedures (sp_GetTasks, sp_GetTaskById)
- ✅ Datos de prueba (seed data)

### Paso 3: Verificar la Creación

En SSMS, ejecuta:
```sql
-- Verificar base de datos
SELECT * FROM [TaskServiceDB].task.Tasks;

-- Listar stored procedures
SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = 'task' AND ROUTINE_TYPE = 'PROCEDURE';
```

---

## 🛠️ 2. Configurar Cadena de Conexión

Archivo: `Backend/TaskService.Api/appsettings.json`

### Opción A: Autenticación de Windows (Recomendado)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskServiceDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Para SQL Server Express**:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=TaskServiceDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### Opción B: Autenticación SQL Server

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TaskServiceDB;User Id=sa;Password=TuPassword123;TrustServerCertificate=True;"
  }
}
```

---

## 🚀 3. Compilar y Ejecutar Backend

### Opción A: Ejecución Normal (Recomendado para Desarrollo)

Desde la raíz del proyecto:

```powershell
# Paso 1: Navegar a Backend
cd Backend

# Paso 2: Restaurar dependencias
dotnet restore

# Paso 3: Compilar solución
dotnet build

# Paso 4: Ejecutar API
dotnet run --project TaskService.Api
```

**Output Esperado:**

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### Opción B: Modo Watch (Recompila automáticamente al cambiar código)

```powershell
cd Backend
dotnet watch run --project TaskService.Api
```

Esto es útil durante el desarrollo. Presiona `Ctrl+C` para detener.

### Opción C: Ejecutar usando los scripts de la raíz

```powershell
# Desde la raíz del proyecto
.\EJECUTAR-APLICACION.bat
```

Esto ejecuta la API y abre Swagger automáticamente.

---

## 🌐 4. Verificar API Funcionando

### Swagger UI

Una vez ejecutada, abre tu navegador:

📍 **http://localhost:5000/swagger**

Aquí puedes ver todos los endpoints disponibles y hacer pruebas.

### Endpoints Disponibles

```
GET /api/tasks
GET /api/tasks?state=Pending
GET /api/tasks?state=Completed
GET /api/tasks?priority=High
GET /api/tasks?priority=Low
GET /api/tasks?priority=Medium
GET /api/tasks/{id}
```

### Header Requerido

Todos los requests requieren:

```
X-API-KEY: 123456
```

### Ejemplo de Request (cURL)

```bash
curl -X GET "http://localhost:5000/api/tasks" \
  -H "X-API-KEY: 123456"
```

### Ejemplo de Request (PowerShell)

```powershell
$headers = @{ 'X-API-KEY' = '123456' }
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Headers $headers
```

### Ejemplos de Respuestas

#### GET /api/tasks - Listar todas las tareas

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implementar autenticación",
      "description": "Implementar JWT en el backend",
      "priority": "High",
      "status": "InProgress",
      "createdAt": "2026-02-14T10:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Diseñar UI",
      "description": "Crear mockups del frontend",
      "priority": "Medium",
      "status": "Pending",
      "createdAt": "2026-02-14T10:25:00Z"
    }
  ],
  "totalCount": 2,
  "pageNumber": 1,
  "pageSize": 50
}
```

#### GET /api/tasks?state=Completed - Filtrar por estado

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "title": "Crear base de datos",
      "description": "Diseñar schema SQL Server",
      "priority": "High",
      "status": "Completed",
      "createdAt": "2026-02-10T15:00:00Z"
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 50
}
```

#### GET /api/tasks/{id} - Ver detalle de tarea

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Implementar autenticación",
  "description": "Implementar JWT en el backend",
  "priority": "High",
  "status": "InProgress",
  "createdAt": "2026-02-14T10:30:00Z"
}
```

#### Respuesta de Error (401 - Sin API Key)

```json
{
  "error": "No autorizado",
  "message": "API Key no proporcionada o inválida",
  "code": "UNAUTHORIZED"
}
```

#### Respuesta de Error (400 - Validación)

```json
{
  "error": "El estado 'InvalidState' no es válido",
  "message": "Valores permitidos: Pending, InProgress, Completed",
  "code": "INVALID_STATE"
}
```

---

## 🔐 5. Seguridad - API Key

### Credenciales por Defecto

| Variable | Valor | Ubicación |
|----------|-------|-----------|
| API Key | `123456` | `appsettings.json` |
| Header Requerido | `X-API-KEY` | Todos los requests |

### ⚠️ IMPORTANTE: Cambiar en Producción

En producción, **NUNCA** uses credenciales por defecto:

```json
// ❌ MAL - No hacer en producción
"ApiKey": "123456"

// ✅ BIEN - Usar variables de entorno
"ApiKey": "${API_KEY}"
```

Configurar en producción:
```powershell
# Variables de entorno del sistema
$env:API_KEY = "TuClaveSeguraAqui!2026"
```

---

## 🧪 6. Ejecutar Tests

### Ejecutar todos los tests

```powershell
cd Backend
dotnet test
```

### Ejecutar tests de un proyecto específico

```powershell
dotnet test TaskService.Tests
```

### Ejecutar tests con salida detallada

```powershell
dotnet test --verbosity detailed
```

### Ejecutar tests y generar reporte de cobertura

```powershell
dotnet test /p:CollectCoverage=true
```

---

## 📊 7. Estructura del Proyecto

```
Backend/
├── TaskService.sln                    # Solución principal
│
├── TaskService.Domain/                # Entidades del dominio
│   ├── TaskService.Domain.csproj
│   └── Entities/
│       └── TaskItem.cs               # Entidad Task
│
├── TaskService.Application/           # Lógica de aplicación (CQRS/Queries)
│   ├── TaskService.Application.csproj
│   ├── DTOs/
│   │   └── TaskDto.cs                # DTO para transferencia de datos
│   ├── Interfaces/
│   │   ├── ITaskRepository.cs        # Contrato del repositorio
│   │   └── ITaskService.cs           # Contrato de servicio
│   ├── Services/
│   │   └── TaskService.cs            # Implementación de lógica
│   └── Common/
│       └── PagedResult.cs            # Modelo para paginación
│
├── TaskService.Infrastructure/        # Acceso a datos (Dapper)
│   ├── TaskService.Infrastructure.csproj
│   ├── AppDbContext.cs               # Contexto de BD
│   └── Repositories/
│       └── TaskRepository.cs         # Implementación con Stored Procedures
│
└── TaskService.Api/                   # Controladores y configuración
    ├── TaskService.Api.csproj
    ├── appsettings.json              # Configuración de desarrollo
    ├── appsettings.Production.json   # Configuración de producción
    ├── Program.cs                     # Punto de entrada
    ├── Controllers/
    │   └── TasksController.cs        # Controlador de tareas
    └── Middleware/
        └── ApiKeyMiddleware.cs       # Validación de API Key
```



---

## ⚙️ 8. Configuración Avanzada

### Cambiar Puerto

En `Backend/TaskService.Api/Program.cs`:

```csharp
app.Urls.Add("http://localhost:3000");
```

Luego actualiza el Frontend con la nueva URL.

### Habilitar CORS

En `Backend/TaskService.Api/Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowAll");
```

### Cambiar Nivel de Logging

En `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

---

## 🔧 9. Troubleshooting

### Error: "Cannot connect to database"

```
❌ Message: A network or instance-specific error occurred while establishing 
   a connection to SQL Server
```

**Solución**:
1. Verifica que SQL Server está corriendo
2. Verifica el nombre del servidor en appsettings.json
3. Verifica que la base de datos TaskServiceDB existe (SSMS)

### Error: "The specified module could not be found"

```
❌ A NativeLibrary handle cannot be created for path: ...
```

**Solución**:
1. Instala `Visual C++ Redistributable` (requerido por SQL Server drivers)
2. Ejecuta: `dotnet tool restore`

### Error: "401 Unauthorized"

```
❌ Response code 401 al llamar a la API
```

**Solución**:
1. Verifica que incluyes el header `X-API-KEY: 123456`
2. Revisa que la API Key en appsettings.json es correcta

### Puerto 5000 ya está en uso

```
❌ Address already in use
```

**Solución**:
```powershell
# Encontrar proceso usando el puerto
netstat -ano | findstr :5000

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F

# O cambiar puerto en Program.cs
```

---

## 9.1 Debugging

### Ejecutar con Logging Detallado

```powershell
cd Backend
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run --project TaskService.Api
```

### Ejecutar en Visual Studio Code

1. Instala la extensión **C# Dev Kit** (Microsoft)
2. Abre `Backend/TaskService.sln` en VS Code
3. Presiona **F5** para iniciar el debugger
4. Establece breakpoints haciendo click en el margen izquierdo

### Inspeccionar variables y estado

Durante el debug:
- Click izquierdo en variables para verlas
- Usa la consola de debug para ejecutar comandos LINQ
- Inspecciona la base de datos en tiempo real con SSMS

---

## 9.2 Variables de Entorno

### Desarrollo (Automático)

```powershell
# Al ejecutar dotnet run, automáticamente usa:
# ASPNETCORE_ENVIRONMENT = Development
# Base de datos: TaskServiceDB (local)
# API Key: 123456
```

### Producción

```powershell
# Configurar antes de ejecutar
$env:ASPNETCORE_ENVIRONMENT = "Production"
$env:API_KEY = "TuClaveSeguraAqui2026"
$env:DATABASE_URL = "Server=prod-server;Database=TaskServiceDB;..."

# Ejecutar
dotnet run --project TaskService.Api
```

---

## 9.3 Quick Start (Resumen Rápido)

**Si ya tienes todo instalado, esta es la ruta más corta:**

```powershell
# 1. Abrir terminal en Backend/
cd Backend

# 2. Restaurar y compilar
dotnet restore
dotnet build

# 3. Ejecutar API (abre http://localhost:5000/swagger)
dotnet run --project TaskService.Api
```

✅ **Listo.** La API está disponible en `http://localhost:5000/swagger`

---

## �📚 10. Documentación Adicional

- [OWASP Analysis](../ANÁLISIS-INTEGRAL-OWASP-ESCALABILIDAD.md)
- [Database Documentation](../Database/README.md)
- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8)
- [Clean Architecture Pattern](https://learn.microsoft.com/en-us/dotnet/architecture/clean-code/)

---

## ✅ 11. Checklist de Implementación

- [ ] SQL Server instalado y corriendo
- [ ] Base de datos TaskServiceDB creada (scripts ejecutados)
- [ ] .NET 8 SDK instalado
- [ ] Cadena de conexión configurada en appsettings.json
- [ ] Backend compilado sin errores (`dotnet build`)
- [ ] API ejecutándose (`dotnet run`)
- [ ] Swagger accesible en http://localhost:5000/swagger
- [ ] Endpoints respondiendo correctamente con API Key

---

**Backend listo para usar. Procede a configurar el Frontend.**
