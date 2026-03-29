# API de Gestión de Tareas

[![GitHub](https://img.shields.io/badge/GitHub-joss30sg%2FApiGestionTarea-blue?logo=github)](https://github.com/joss30sg/ApiGestionTarea)
[![.NET](https://img.shields.io/badge/.NET-8-purple)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

Aplicación fullstack para gestionar tareas con calendario interactivo. Backend en .NET 8, Frontend en React + Vite y base de datos en memoria (no requiere SQL Server).

---

## Requisitos

| Herramienta | Versión | Comprobar con |
|-------------|---------|---------------|
| .NET SDK | 8.0+ | `dotnet --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

> No necesitas instalar SQL Server. La app usa una base de datos en memoria con 33 tareas de ejemplo.

---

## Inicio rápido

Necesitas **dos terminales** abiertas al mismo tiempo:

### Terminal 1 — Backend

```powershell
cd Backend/TaskService.Api
dotnet run
```

Espera a ver el mensaje `Now listening on: http://localhost:5000`. Eso significa que el backend está listo.

### Terminal 2 — Frontend

```powershell
cd Frontend
npm install --legacy-peer-deps
npm run web:build
npm run web:serve
```

### Abrir la aplicación

Abre tu navegador en **http://localhost:8080**

Para ver la documentación de la API (Swagger): **http://localhost:5000/swagger**

---

## Autenticación

La API soporta dos formas de autenticarse:

### Opción 1: API Key (más sencillo)

Agrega este header a todas tus peticiones:

```
X-API-Key: 123456
```

### Opción 2: JWT Token (más seguro)

1. Obtén un token haciendo login:

```powershell
# PowerShell
$body = '{"username": "admin", "password": "admin123"}'
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$response.token
```

```bash
# curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

2. Usa el token en tus peticiones:

```
Authorization: Bearer <tu-token-aquí>
```

El token dura 15 minutos. Puedes renovarlo con `/api/auth/refresh`.

---

## Endpoints de la API

**URL base:** `http://localhost:5000`

### Tareas (`/api/tasks`)

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/tasks` | Lista todas las tareas (paginado) |
| GET | `/api/tasks/{id}` | Obtiene una tarea por su ID |
| POST | `/api/tasks` | Crea una nueva tarea |
| PUT | `/api/tasks/{id}` | Actualiza una tarea existente |
| DELETE | `/api/tasks/{id}` | Elimina una tarea |

### Autenticación (`/api/auth`)

| Método | Ruta | Qué hace |
|--------|------|----------|
| POST | `/api/auth/login` | Inicia sesión y devuelve un JWT |
| POST | `/api/auth/refresh` | Renueva un token expirado |

### Filtros disponibles (GET /api/tasks)

| Parámetro | Valores | Ejemplo |
|-----------|---------|---------|
| `state` | `Pending`, `InProgress`, `Completed` | `?state=Pending` |
| `priority` | `Low`, `Medium`, `High` | `?priority=High` |
| `pageNumber` | Número de página (desde 1) | `?pageNumber=2` |
| `pageSize` | Tareas por página (máx. 50) | `?pageSize=20` |

### Ejemplo: Crear una tarea

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "X-API-Key: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primera tarea",
    "description": "Descripción de la tarea",
    "priority": "Medium",
    "state": "Pending"
  }'
```

---

## Modo desarrollo (con recarga automática)

Si quieres que los cambios se reflejen automáticamente mientras desarrollas:

```powershell
# Terminal 1 — Backend
cd Backend/TaskService.Api
dotnet watch run

# Terminal 2 — Frontend con Vite (hot reload)
cd Frontend
npm run web:dev
```

El frontend de desarrollo se abre en **http://localhost:5173**.

---

## Ejecutar tests

```powershell
# Tests del Backend (xUnit) — 16 tests
cd Backend
dotnet test

# Tests del Frontend (Jest) — 45 tests
cd Frontend
npm test
```

---

## Estructura del proyecto

```
ApiGestionTarea/
├── Backend/                          # API REST (.NET 8)
│   ├── TaskService.Api/              # Controladores, Middleware, Configuración
│   │   ├── Controllers/
│   │   │   ├── TasksController.cs    # CRUD de tareas
│   │   │   └── AuthController.cs     # Login y refresh de JWT
│   │   ├── Middleware/
│   │   │   └── ApiKeyMiddleware.cs   # Autenticación dual (JWT + API Key)
│   │   ├── Program.cs               # Configuración de la app
│   │   └── appsettings.json         # Configuración (claves, puertos)
│   ├── TaskService.Application/      # Lógica de negocio, DTOs, Interfaces
│   ├── TaskService.Domain/           # Entidades del dominio
│   ├── TaskService.Infrastructure/   # Acceso a datos (EF Core InMemory)
│   └── TaskService.Tests/            # Tests unitarios (xUnit)
│
├── Frontend/                         # Interfaz de usuario (React 18 + TypeScript)
│   ├── src/web/                      # App web (calendario, modales, filtros)
│   ├── server.js                     # Servidor Express (proxy + SSE + archivos)
│   ├── vite.config.ts                # Configuración de Vite
│   └── src/                          # Código compartido (API client, types)
│
├── Database/                         # Scripts SQL (referencia, no requeridos)
│   └── InitDatabase.sql              # Script completo para SQL Server
│
├── RESUMEN OWASP.md                  # Análisis de seguridad (9.6/10)
├── MANEJO DE EDGE CASE.md            # Casos límite implementados (23/24)
└── REPORTE TEST.md                   # Reporte de tests automatizados
```

---

## Características de seguridad

| Protección | Detalle |
|------------|---------|
| Autenticación dual | JWT Bearer (15 min) + API Key legacy |
| Rate Limiting | Máximo 100 peticiones/segundo por IP |
| Validación XSS | Caracteres peligrosos rechazados en el dominio |
| Optimistic Locking | Evita conflictos de edición simultánea (409 Conflict) |
| Content-Type | Solo acepta `application/json` |
| CORS | Configurado para permitir orígenes controlados |
| Logging centralizado | Serilog (backend) + JSON logger (frontend) |

---

## Funcionalidades del Frontend

- **Calendario interactivo** con vista mensual y navegación entre meses
- **Puntos de colores** indicando tareas por día según su estado
- **Filtros** por estado (Pendiente / En Progreso / Completada)
- **CRUD completo**: Crear, editar, completar y eliminar tareas
- **Actualizaciones en tiempo real** via SSE (Server-Sent Events)
- **Diseño responsivo**: Móvil, Tablet y Escritorio

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | .NET 8, ASP.NET Core, EF Core InMemory, Serilog |
| Frontend | React 18, TypeScript, Vite |
| Servidor Web | Express.js (proxy + SSE + archivos estáticos) |
| Autenticación | JWT Bearer + API Key |
| Testing | xUnit (backend), Jest (frontend) |

---

## Solución de problemas

### "El backend no arranca"

```powershell
# Verifica que tienes .NET 8
dotnet --version

# Si el puerto 5000 está ocupado, busca el proceso
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "El frontend dice 'Error de conexión'"

Asegúrate de que el backend está corriendo en el puerto 5000 antes de abrir el frontend.

### "No puedo autenticarme"

- Con API Key: agrega el header `X-API-Key: 123456`
- Con JWT: haz POST a `/api/auth/login` con `{"username": "admin", "password": "admin123"}`

---

**Versión**: 2.0.0 — Marzo 2026  
**Repositorio**: https://github.com/joss30sg/ApiGestionTarea
