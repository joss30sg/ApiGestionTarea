# ⚡ API de Gestión de Tareas — Aplicación FullStack

[![GitHub](https://img.shields.io/badge/GitHub-joss30sg%2FApiGestionTarea-blue?logo=github)](https://github.com/joss30sg/ApiGestionTarea)
[![.NET](https://img.shields.io/badge/.NET-8-purple)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-yellow)](https://vite.dev/)

**Aplicación de gestión de tareas** con Backend .NET 8, Frontend React (Vite) y calendario interactivo. Incluye operaciones CRUD completas, diseño responsivo para móvil/tablet/escritorio y seguridad OWASP.

---

## 📋 Requisitos Previos

| Herramienta | Versión mínima | Verificar instalación |
|-------------|---------------|----------------------|
| **.NET SDK** | 8.0 | `dotnet --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Git** | 2.x | `git --version` |

> **Nota**: La base de datos usa **EF Core InMemory** — no necesitas SQL Server instalado.

---

## 🚀 Instrucciones para Ejecutar la Aplicación

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/joss30sg/ApiGestionTarea.git
cd ApiGestionTarea
```

### Paso 2: Ejecutar el Backend (.NET 8)

```powershell
cd Backend/TaskService.Api
dotnet run
```

El backend iniciará en **http://localhost:5000** con 33 tareas de ejemplo precargadas (febrero - marzo 2026).

> **Swagger UI** disponible en: http://localhost:5000/swagger

### Paso 3: Instalar dependencias del Frontend

```powershell
cd Frontend
npm install --legacy-peer-deps
```

### Paso 4: Compilar el Frontend (React + Vite)

```powershell
npm run web:build
```

Esto genera la carpeta `dist/` con el build de producción.

### Paso 5: Iniciar el servidor web

```powershell
npm run web:serve
```

El frontend iniciará en **http://localhost:8080**

### 🎉 ¡Listo! Abre http://localhost:8080 en tu navegador

---

## ⚡ Inicio Rápido (Resumen)

```powershell
# Terminal 1 — Backend
cd Backend/TaskService.Api
dotnet run

# Terminal 2 — Frontend
cd Frontend
npm install --legacy-peer-deps
npm run web:build
npm run web:serve
```

Abrir: **http://localhost:8080**

---

## 🖥️ Modo Desarrollo (Hot Reload)

Para desarrollo con recarga automática:

```powershell
# Terminal 1 — Backend
cd Backend/TaskService.Api
dotnet run

# Terminal 2 — Vite dev server
cd Frontend
npm run web:dev
```

El servidor Vite abrirá en **http://localhost:5173** con HMR (Hot Module Replacement).

---

## 📊 Funcionalidades

### Calendario Interactivo
- Vista mensual con navegación entre meses
- Puntos de colores indicando tareas por día
- Filtro por estado (Pendiente / En Progreso / Completada)
- Detalle de tareas agrupadas por estado al seleccionar un día

### CRUD Completo de Tareas
- ✅ **Crear** — Botón flotante "＋" para nueva tarea
- ✅ **Leer** — Calendario muestra todas las tareas con colores por estado
- ✅ **Actualizar** — Botón "Editar" en cada tarea
- ✅ **Eliminar** — Botón "Eliminar" con confirmación
- ✅ **Marcar Completada** — Botón "Completar" (solo en tareas no completadas)

### Diseño Responsivo
- 📱 **Móvil** (≤480px) — Interfaz compacta, botones en columna
- 📱 **Tablet** (481–768px) — Layout intermedio optimizado
- 🖥️ **Escritorio** (>768px) — Vista completa, máximo 900px

---

## 🏗️ Arquitectura del Proyecto

```
ApiGestionTarea/
├── Backend/                        # .NET 8 — API REST
│   ├── TaskService.Api/            # Controllers, Middleware, Program.cs
│   ├── TaskService.Application/    # DTOs, Services, Interfaces
│   ├── TaskService.Domain/         # Entidades (TaskItem, Enums)
│   ├── TaskService.Infrastructure/ # Repositorio, DbContext (InMemory)
│   └── TaskService.Tests/          # Tests unitarios (xUnit)
│
├── Frontend/                       # React 18 + Vite + Express
│   ├── src/web/                    # Código fuente React
│   │   ├── App.tsx                 # Componente principal
│   │   ├── api.ts                  # Servicio API (fetch/create/update/delete)
│   │   ├── styles.css              # CSS responsivo (móvil/tablet/desktop)
│   │   ├── main.tsx                # Entry point
│   │   └── components/             # Componentes React
│   │       ├── Calendar.tsx        # Grilla del calendario
│   │       ├── StatusSummary.tsx   # Resumen con filtros por estado
│   │       ├── DayTasks.tsx        # Tareas del día seleccionado
│   │       ├── TaskModal.tsx       # Modal crear/editar tarea
│   │       └── ConfirmDialog.tsx   # Diálogo de confirmación
│   ├── server.js                   # Express proxy (puerto 8080)
│   ├── vite.config.ts              # Configuración Vite
│   └── dist/                       # Build de producción (generado)
│
└── Database/                       # Scripts SQL (referencia)
    ├── InitDatabase.sql
    └── 0x_*.sql
```

---

## 🔌 API Endpoints

**Base URL**: `http://localhost:5000/api/tasks`  
**Autenticación**: Header `X-API-Key: 123456`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tasks` | Listar tareas (paginado, filtros) |
| GET | `/api/tasks/{id}` | Obtener una tarea por ID |
| POST | `/api/tasks` | Crear nueva tarea |
| PUT | `/api/tasks/{id}` | Actualizar tarea |
| DELETE | `/api/tasks/{id}` | Eliminar tarea |

### Ejemplo: Crear tarea

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "X-API-Key: 123456" \
  -H "Content-Type: application/json" \
  -d '{"title":"Mi tarea","description":"Descripción","priority":"Medium","state":"Pending"}'
```

### Parámetros de filtro (GET)
- `state`: `Pending`, `InProgress`, `Completed`
- `priority`: `Low`, `Medium`, `High`
- `pageNumber`: Número de página (default: 1)
- `pageSize`: Items por página (default: 10, max: 50)

---

## 🔐 Seguridad

- **API Key** en middleware — todas las peticiones requieren `X-API-Key`
- **Validación XSS** — caracteres peligrosos rechazados en la capa de dominio
- **CORS** configurado
- **Validación de entrada** con Data Annotations en DTOs
- **Errores genéricos** — no expone stack traces en producción

---

## 🧪 Tests

```powershell
# Tests Backend (xUnit)
cd Backend
dotnet test TaskService.Tests

# Tests Frontend (Jest)
cd Frontend
npm test
```

---

## 🔧 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | .NET 8, ASP.NET Core, EF Core InMemory |
| **Frontend** | React 18, TypeScript, Vite 8 |
| **Servidor Web** | Express.js (proxy + static) |
| **Base de Datos** | EF Core InMemory (33 tareas seed) |
| **Testing** | xUnit (.NET), Jest (React) |

---

## 📝 Scripts npm disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `web:dev` | `npm run web:dev` | Servidor Vite con HMR |
| `web:build` | `npm run web:build` | Build de producción |
| `web:serve` | `npm run web:serve` | Express sirviendo `dist/` |
| `test` | `npm test` | Ejecutar tests Jest |

## 📞 Contacto y Soporte

### Reportar Problemas
- **Website**: https://github.com/Jossg36/ApiGestionTarea/issues
- **Email**: developer@taskapp.com

### ¿No puedo acceder desde WiFi?
Ver: [Frontend/README_FRONTEND.md - Troubleshooting](Frontend/README_FRONTEND.md#troubleshooting---acceso-remoto)

### ¿Cómo uso datos móviles?
Ver: [ACCESO_DATOS_MOVILES.md](ACCESO_DATOS_MOVILES.md)

### ¿Cómo cambio la API Key?
1. Actualiza: `Backend/TaskService.Api/appsettings.json`
2. También en: `Frontend/server.js`

---

## 📝 Versionado

```
v1.0.0 - 14 de febrero de 2026
├── ✅ Backend API .NET 8 funcional
├── ✅ Frontend Web React Native responsivo
├── ✅ Base de datos SQL Server con seed data
├── ✅ 61 Tests automatizados (100% pasando)
├── ✅ Seguridad OWASP 7/10 implementada
├── ✅ 6 Edge cases críticos manejados
├── ✅ Documentación completa con Swagger
└── ✅ Acceso remoto para datos móviles
```

---

## 📄 Licencia

Proyecto educativo - Uso interno - MIT License

---

**Última actualización**: 14 de febrero de 2026  
**Estado**: ✅ Completamente Funcional  
**Repositorio**: https://github.com/Jossg36/ApiGestionTarea  
**Mantenido por**: Equipo de Desarrollo

---

## 🎯 Demostración Rápida

**URL de Acceso:**
```
WiFi Local:    http://192.168.18.8:8080
API Swagger:   http://192.168.18.8:5000
API Key:       123456 (en header X-API-Key)
```

**Para verlo en acción:**
1. Conecta tu móvil al WiFi del PC
2. Abre: http://192.168.18.8:8080
3. ¡Listo! Usa la aplicación

¡Gracias por revisar TaskService! 🚀
