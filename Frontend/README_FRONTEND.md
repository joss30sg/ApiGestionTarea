# Frontend — TaskService App

Aplicación web y móvil con **React 18**, **TypeScript** y **Vite**. Incluye calendario interactivo con CRUD de tareas y actualizaciones en tiempo real.

---

## Inicio rápido (Web)

> Asegúrate de que el Backend esté corriendo en el puerto 5000 antes de continuar.

```powershell
cd Frontend
npm install --legacy-peer-deps
npm run web:build
npm run web:serve
```

Abre **http://localhost:8080** en tu navegador.

---

## Modo desarrollo (con recarga automática)

```powershell
cd Frontend
npm run web:dev
```

Abre **http://localhost:5173**. Los cambios en el código se reflejan automáticamente.

---

## Acceso desde el celular

### Desde la misma red WiFi

1. Obtén la IP de tu PC:

```powershell
ipconfig | findstr "IPv4"
# Ejemplo: 192.168.1.100
```

2. En el celular, abre: `http://192.168.1.100:8080`

### Desde datos móviles (internet)

```powershell
# Instalar Localtunnel (una sola vez)
npm install -g localtunnel

# Generar URL pública
lt --port 8080
# Te dará algo como: https://aqua-impala-39.loca.lt
```

Abre esa URL desde cualquier dispositivo.

---

## Plataformas móviles nativas

### iOS (requiere macOS + Xcode)

```bash
cd ios
pod install
cd ..
npm run ios
```

### Android (requiere Android Studio)

```powershell
# Primero inicia un emulador
emulator -avd <nombre_del_dispositivo>

# Luego ejecuta la app
npm run android
```

> Para dispositivos físicos Android, habilita "USB Debugging" en opciones de desarrollador y conecta por cable.

---

## Ejecutar tests

```powershell
cd Frontend
npm test
```

Modo watch (se ejecutan al cambiar código):

```powershell
npm run test:watch
```

---

## Scripts disponibles

| Script | Comando | Qué hace |
|--------|---------|----------|
| `web:dev` | `npm run web:dev` | Inicia Vite con recarga automática (puerto 5173) |
| `web:build` | `npm run web:build` | Compila el frontend para producción |
| `web:serve` | `npm run web:serve` | Sirve el build con Express (puerto 8080) |
| `test` | `npm test` | Ejecuta los tests con Jest |
| `test:watch` | `npm run test:watch` | Tests en modo watch |
| `test:coverage` | `npm run test:coverage` | Tests con reporte de cobertura |
| `ios` | `npm run ios` | Ejecuta en iOS Simulator |
| `android` | `npm run android` | Ejecuta en Android Emulator |
| `start` | `npm start` | Inicia Metro Bundler (desarrollo nativo) |

---

## Estructura del proyecto

```
Frontend/
├── src/
│   ├── web/                      # Aplicación web
│   │   ├── App.tsx               # Componente principal (calendario + CRUD)
│   │   ├── api.ts                # Servicio API (fetch, create, update, delete)
│   │   ├── styles.css            # Estilos responsivos
│   │   ├── main.tsx              # Punto de entrada web
│   │   └── components/
│   │       ├── Calendar.tsx      # Grilla del calendario
│   │       ├── StatusSummary.tsx  # Resumen con filtros por estado
│   │       ├── DayTasks.tsx      # Tareas del día seleccionado
│   │       ├── TaskModal.tsx     # Modal para crear/editar
│   │       └── ConfirmDialog.tsx # Diálogo de confirmación
│   │
│   ├── api/                      # Cliente HTTP compartido
│   │   ├── config.ts             # URL base y API Key
│   │   └── client.ts             # Cliente Axios
│   │
│   ├── screens/                  # Pantallas (React Native)
│   │   ├── TaskListScreen.tsx
│   │   ├── TaskDetailScreen.tsx
│   │   └── ErrorScreen.tsx
│   │
│   └── types/Task.ts             # Tipos TypeScript
│
├── server.js                     # Servidor Express (proxy + SSE + estáticos)
├── vite.config.ts                # Configuración de Vite
├── jest.config.js                # Configuración de tests
├── package.json                  # Dependencias y scripts
│
├── android/                      # Código nativo Android
└── ios/                          # Código nativo iOS
```

---

## Funcionalidades

- **Calendario mensual** con navegación entre meses
- **Indicadores de color** por estado de tarea en cada día
- **Filtros** por estado: Pendiente, En Progreso, Completada
- **CRUD completo**: crear, editar, completar y eliminar tareas
- **Actualizaciones en tiempo real** con SSE (Server-Sent Events)
- **Diseño responsivo**: se adapta a móvil (≤480px), tablet (481-768px) y escritorio (>768px)

---

## Configuración de la API

El archivo `src/api/config.ts` define la URL del backend:

```typescript
export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'   // Android Emulator
    : 'http://localhost:5000/api';  // iOS / Web

export const API_KEY = '123456';
```

> Para dispositivos físicos, reemplaza con la IP de tu PC (ej: `http://192.168.1.100:5000/api`).

---

## Solución de problemas

### "Error de conexión" o "Network Error"

Verifica que el backend esté corriendo en el puerto 5000.

### "npm install falla"

Usa la flag `--legacy-peer-deps`:

```powershell
npm install --legacy-peer-deps
```

### Metro Bundler no responde

```powershell
npm start -- --reset-cache
```

### El emulador Android no se detecta

```powershell
adb devices
# Debe mostrar tu dispositivo en la lista
```
