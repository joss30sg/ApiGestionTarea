# Backend — TaskService API

API REST en **.NET 8** con Clean Architecture. Usa EF Core InMemory como base de datos (no necesitas SQL Server).

---

## Cómo ejecutar

```powershell
cd Backend/TaskService.Api
dotnet run
```

La API estará disponible en **http://localhost:5000**.  
Swagger UI: **http://localhost:5000/swagger**

---

## Autenticación

La API acepta dos métodos de autenticación. Usa el que prefieras:

### API Key

Agrega el header en cada petición:

```
X-API-Key: 123456
```

### JWT (JSON Web Token)

1. Haz login para obtener un token:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Body '{"username": "admin", "password": "admin123"}' `
  -ContentType "application/json"
```

2. Usa el token en tus peticiones:

```
Authorization: Bearer <token>
```

El token expira en 15 minutos. Renuévalo con `POST /api/auth/refresh`.

**Credenciales por defecto** (configurables en `appsettings.json`):

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin123` |
| API Key | `123456` |

---

## Endpoints

### Tareas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tasks` | Listar tareas (paginado + filtros) |
| GET | `/api/tasks/{id}` | Obtener una tarea |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/{id}` | Actualizar tarea |
| DELETE | `/api/tasks/{id}` | Eliminar tarea |

**Filtros para GET /api/tasks:**

```
GET /api/tasks?state=Pending
GET /api/tasks?priority=High
GET /api/tasks?state=InProgress&priority=Medium
GET /api/tasks?pageNumber=2&pageSize=20
```

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Obtener JWT + Refresh Token |
| POST | `/api/auth/refresh` | Renovar token expirado |

---

## Ejemplos de uso

### PowerShell

```powershell
# Listar tareas
$headers = @{ 'X-API-Key' = '123456' }
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Headers $headers

# Crear tarea
$body = '{"title": "Nueva tarea", "description": "Descripción", "priority": "High", "state": "Pending"}'
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### curl

```bash
# Listar tareas
curl http://localhost:5000/api/tasks -H "X-API-Key: 123456"

# Crear tarea
curl -X POST http://localhost:5000/api/tasks \
  -H "X-API-Key: 123456" \
  -H "Content-Type: application/json" \
  -d '{"title": "Nueva tarea", "description": "Descripción", "priority": "High", "state": "Pending"}'
```

---

## Ejecutar tests

```powershell
cd Backend
dotnet test
```

Para ver más detalle:

```powershell
dotnet test --verbosity detailed
```

---

## Estructura del proyecto

```
Backend/
├── TaskService.Api/                  # Capa de presentación
│   ├── Program.cs                    # Configuración (JWT, Rate Limiting, Serilog, CORS)
│   ├── appsettings.json              # Claves y configuración
│   ├── Controllers/
│   │   ├── TasksController.cs        # CRUD de tareas
│   │   └── AuthController.cs         # Login y refresh JWT
│   └── Middleware/
│       └── ApiKeyMiddleware.cs       # Autenticación dual (JWT + API Key)
│
├── TaskService.Application/          # Lógica de negocio
│   ├── DTOs/TaskDto.cs               # Objeto de transferencia de datos
│   ├── Interfaces/                   # Contratos (ITaskService, ITaskRepository)
│   ├── Services/TaskService.cs       # Implementación de la lógica
│   └── Common/PagedResult.cs         # Modelo de paginación
│
├── TaskService.Domain/               # Entidades del dominio
│   └── Entities/TaskItem.cs          # Entidad Task (con validación XSS y ConcurrencyStamp)
│
├── TaskService.Infrastructure/       # Acceso a datos
│   ├── Persistence/AppDbContext.cs   # Contexto EF Core (InMemory)
│   └── Repositories/TaskRepository.cs # Repositorio con manejo de concurrencia
│
└── TaskService.Tests/                # Tests unitarios (xUnit)
    └── TaskServiceTests.cs
```

---

## Características de seguridad

| Característica | Descripción |
|----------------|-------------|
| JWT Authentication | Tokens HMAC-SHA256 con expiración de 15 min |
| Refresh Tokens | Rotación automática, expiración de 7 días |
| API Key | Autenticación legacy por header `X-API-Key` |
| Rate Limiting | 100 peticiones/segundo por IP (FixedWindow) |
| Optimistic Locking | ConcurrencyStamp para evitar ediciones simultáneas |
| Validación XSS | Rechazo de caracteres peligrosos (`<`, `>`, `script`) |
| Content-Type | Solo acepta `application/json` |
| Logging | Serilog con salida a consola y archivo (`logs/`) |

---

## Configuración

Todo se configura en `appsettings.json`:

```json
{
  "Security": {
    "ApiKey": "123456"
  },
  "Jwt": {
    "Key": "TaskServiceSecretKey2026!MinLength32Chars",
    "Issuer": "TaskService.Api",
    "Audience": "TaskService.Client",
    "ExpirationMinutes": "15"
  },
  "Auth": {
    "Username": "admin",
    "Password": "admin123"
  }
}
```

### Cambiar el puerto

Modifica `Program.cs` — busca la línea con `webBuilder.UseUrls` o `ListenAnyIP(5000)`.

### Modo desarrollo con recarga automática

```powershell
cd Backend
dotnet watch run --project TaskService.Api
```

---

## Solución de problemas

### El puerto 5000 está ocupado

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error 401 (No autorizado)

Verifica que incluyes uno de estos headers:
- `X-API-Key: 123456`
- `Authorization: Bearer <token>`

### Error 409 (Conflicto de concurrencia)

Otro usuario modificó la tarea al mismo tiempo. Vuelve a obtener la tarea (GET) y reintenta la actualización.

### Error 415 (Content-Type no soportado)

Asegúrate de enviar el header `Content-Type: application/json` en peticiones POST y PUT.
