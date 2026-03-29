# API de Gestión de Tareas

[![GitHub](https://img.shields.io/badge/GitHub-joss30sg%2FApiGestionTarea-blue?logo=github)](https://github.com/joss30sg/ApiGestionTarea)
[![.NET](https://img.shields.io/badge/.NET-8-purple)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

Aplicación para gestionar tareas con un calendario interactivo. Puedes crear, editar, completar y eliminar tareas desde el navegador.

---

## ¿Qué necesito tener instalado?

Solo necesitas dos cosas:

1. **.NET 8** → Descárgalo de https://dotnet.microsoft.com/download/dotnet/8.0
2. **Node.js 18+** → Descárgalo de https://nodejs.org

Para verificar que están instalados, abre PowerShell y escribe:

```powershell
dotnet --version
node --version
```

Si ambos muestran un número de versión, estás listo.

> **No necesitas SQL Server.** La aplicación usa una base de datos en memoria que se crea sola al iniciar.

---

## ¿Cómo ejecuto la aplicación?

Necesitas abrir **dos ventanas de PowerShell** (o dos terminales). Una para el backend y otra para el frontend.

### Paso 1: Descargar el proyecto

```powershell
git clone https://github.com/joss30sg/ApiGestionTarea.git
cd ApiGestionTarea
```

### Paso 2: Iniciar el backend (primera terminal)

```powershell
cd Backend/TaskService.Api
dotnet run
```

Cuando veas este mensaje, el backend está listo:

```
Now listening on: http://localhost:5000
```

**No cierres esta terminal.** Déjala abierta.

### Paso 3: Iniciar el frontend (segunda terminal)

Abre **otra terminal** y ejecuta:

```powershell
cd Frontend
npm install --legacy-peer-deps
npm run web:build
npm run web:serve
```

> La primera vez, `npm install` descarga las dependencias (puede tardar un poco). Las siguientes veces solo necesitas `npm run web:serve`.

### Paso 4: Abrir en el navegador

Abre tu navegador y ve a:

**http://localhost:8080**

¡Listo! Ya puedes usar la aplicación.

---

## ¿Cómo uso la API?

La API tiene documentación interactiva en Swagger. Ábrela en:

**http://localhost:5000/swagger**

Ahí puedes probar todos los endpoints directamente desde el navegador.

### Credenciales

| Qué | Valor |
|-----|-------|
| API Key | `123456` |
| Usuario | `admin` |
| Contraseña | `admin123` |

### Forma más fácil: API Key

Agrega este header a cualquier petición:

```
X-API-Key: 123456
```

**Ejemplo en PowerShell** — ver todas las tareas:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Headers @{ 'X-API-Key' = '123456' }
```

**Ejemplo en curl**:

```bash
curl http://localhost:5000/api/tasks -H "X-API-Key: 123456"
```

### Forma más segura: JWT Token

1. Haz login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

2. Copia el `token` de la respuesta y úsalo así:

```
Authorization: Bearer <pega-tu-token-aquí>
```

El token dura 15 minutos. Cuando expire, renuévalo con `POST /api/auth/refresh`.

---

## Endpoints disponibles

### Tareas

| Qué hace | Método | Ruta |
|----------|--------|------|
| Ver todas las tareas | GET | `/api/tasks` |
| Ver una tarea | GET | `/api/tasks/{id}` |
| Crear una tarea | POST | `/api/tasks` |
| Editar una tarea | PUT | `/api/tasks/{id}` |
| Eliminar una tarea | DELETE | `/api/tasks/{id}` |

### Filtrar tareas

Puedes filtrar agregando parámetros a la URL:

```
/api/tasks?state=Pending              ← Solo tareas pendientes
/api/tasks?priority=High              ← Solo prioridad alta
/api/tasks?state=Completed&priority=Low  ← Combinar filtros
/api/tasks?pageNumber=2&pageSize=10   ← Página 2, 10 por página
```

**Estados válidos:** `Pending`, `InProgress`, `Completed`  
**Prioridades válidas:** `Low`, `Medium`, `High`

### Crear una tarea (ejemplo completo)

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "X-API-Key: 123456" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Comprar pan",
    "description": "Ir a la panadería",
    "priority": "Low",
    "state": "Pending"
  }'
```

### Autenticación

| Qué hace | Método | Ruta |
|----------|--------|------|
| Iniciar sesión | POST | `/api/auth/login` |
| Renovar token | POST | `/api/auth/refresh` |

---

## Ejecutar tests

```powershell
# Backend (16 tests)
cd Backend
dotnet test

# Frontend (45 tests)
cd Frontend
npm test
```

---

## Modo desarrollo (opcional)

Si vas a modificar el código y quieres ver los cambios en tiempo real:

```powershell
# Terminal 1 — Backend con recarga automática
cd Backend/TaskService.Api
dotnet watch run

# Terminal 2 — Frontend con recarga automática
cd Frontend
npm run web:dev
```

En este modo, el frontend se abre en **http://localhost:5173** (en vez del 8080).

---

## Ver la app desde el celular (navegador)

Si quieres abrir la app en tu celular (conectado a la misma WiFi):

1. Busca la IP de tu PC:

```powershell
ipconfig | findstr "IPv4"
```

2. En el celular, abre: `http://<tu-ip>:8080`  
   Ejemplo: `http://192.168.1.100:8080`

---

## Ejecutar como app nativa en Android

> Necesitas [Android Studio](https://developer.android.com/studio) instalado con un emulador configurado.

### 1. Configurar el entorno

Asegúrate de tener estas variables de entorno configuradas (una sola vez):

```powershell
# Ver si ya están configuradas
echo $env:ANDROID_SDK_ROOT

# Si está vacío, configúralo (ajusta tu usuario)
[Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', "$env:LOCALAPPDATA\Android\sdk", 'User')
```

### 2. Iniciar el emulador

Abre Android Studio → Device Manager → ▶ (Play) en tu dispositivo virtual.

O desde la terminal:

```powershell
# Ver emuladores disponibles
emulator -list-avds

# Iniciar uno
emulator -avd <nombre_del_emulador>
```

### 3. Instalar dependencias y ejecutar

```powershell
cd Frontend
npm install --legacy-peer-deps
npx react-native run-android
```

La primera vez tarda 3-5 minutos compilando. Las siguientes veces es más rápido.

### En un celular Android físico

1. En tu celular: **Ajustes → Acerca del teléfono → toca "Número de compilación" 7 veces** (activa las opciones de desarrollador)
2. Ve a **Opciones de desarrollador → activa "Depuración USB"**
3. Conecta el celular por USB y acepta la ventana de "¿Confiar en esta PC?"
4. Ejecuta:

```powershell
adb devices          # Verifica que detecta tu celular
npx react-native run-android
```

> **Importante:** En el emulador Android, `localhost` no funciona. La app ya está configurada para usar `10.0.2.2` (IP especial que apunta a tu PC). En un celular físico, edita `Frontend/src/api/config.ts` y pon la IP de tu PC.

---

## Ejecutar como app nativa en iOS (solo macOS)

> **Requisito:** Necesitas una Mac con Xcode instalado. Desde Windows no se puede compilar para iOS.

### Resumen rápido

```bash
cd Frontend
npm install --legacy-peer-deps

cd ios
pod install
cd ..

npx react-native run-ios
```

Esto abre el simulador de iPhone y ejecuta la app automáticamente.

Para instrucciones detalladas (iPhone físico, firma, troubleshooting): ver [Frontend/README-ios.md](Frontend/README-ios.md)

---

## Estructura del proyecto

```
ApiGestionTarea/
│
├── Backend/                    ← API en .NET 8
│   ├── TaskService.Api/        ← Controladores y configuración
│   ├── TaskService.Application/← Lógica de negocio
│   ├── TaskService.Domain/     ← Entidades (TaskItem)
│   ├── TaskService.Infrastructure/ ← Base de datos (InMemory)
│   └── TaskService.Tests/      ← Tests unitarios
│
├── Frontend/                   ← Interfaz web en React
│   ├── src/web/                ← Componentes del calendario
│   ├── server.js               ← Servidor Express
│   └── vite.config.ts          ← Configuración de Vite
│
└── Database/                   ← Scripts SQL (solo referencia)
```

---

## Tecnologías usadas

| | Tecnología |
|-|-----------|
| Backend | .NET 8, ASP.NET Core, EF Core InMemory |
| Frontend | React 18, TypeScript, Vite |
| Servidor | Express.js |
| Auth | JWT + API Key |
| Tests | xUnit + Jest |
| Logging | Serilog |

---

## Seguridad implementada

- **Autenticación dual**: JWT (15 min) y API Key
- **Rate Limiting**: Máx. 100 peticiones/segundo por IP
- **Protección XSS**: Caracteres peligrosos rechazados
- **Optimistic Locking**: Evita conflictos al editar al mismo tiempo
- **Solo JSON**: No acepta otros formatos
- **Logging**: Registra todas las operaciones

---

## ¿Algo no funciona?

| Problema | Solución |
|----------|----------|
| `dotnet --version` no funciona | Instala .NET 8 desde https://dotnet.microsoft.com/download/dotnet/8.0 |
| `node --version` no funciona | Instala Node.js desde https://nodejs.org |
| El backend no arranca | Verifica que el puerto 5000 no esté ocupado |
| El frontend dice "Error de conexión" | Asegúrate de que el backend esté corriendo primero |
| Error 401 (No autorizado) | Agrega el header `X-API-Key: 123456` |
| `npm install` falla | Usa `npm install --legacy-peer-deps` |

### Liberar el puerto 5000 si está ocupado

```powershell
netstat -ano | findstr :5000
taskkill /PID <número-que-aparece> /F
```

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [Backend/README_BACKEND.md](Backend/README_BACKEND.md) | Detalle de la API y endpoints |
| [Frontend/README_FRONTEND.md](Frontend/README_FRONTEND.md) | Configuración del frontend y app móvil |
| [Frontend/README-ios.md](Frontend/README-ios.md) | Guía detallada para iOS (Xcode, iPhone físico) |
| [Database/README_BD.md](Database/README_BD.md) | Scripts SQL para producción |
| [RESUMEN OWASP.md](RESUMEN%20OWASP.md) | Análisis de seguridad (9.6/10) |
| [REPORTE TEST.md](REPORTE%20TEST.md) | Reporte de tests automatizados |
| [MANEJO DE EDGE CASE.md](MANEJO%20DE%20EDGE%20CASE.md) | Casos límite implementados |

---

**Versión**: 2.0.0 — Marzo 2026  
**Repositorio**: https://github.com/joss30sg/ApiGestionTarea
