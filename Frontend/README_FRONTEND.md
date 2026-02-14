
# 📱 Frontend - TaskService Mobile App

Aplicación móvil multiplataforma desarrollada con **React Native 0.73** y **TypeScript**.

Soporta:
- 🍎 **iOS** (iPhone, iPad) - Emulador y dispositivo físico
- 🤖 **Android** (teléfonos y tablets) - Emulador y dispositivo físico  
- 🌐 **Web** (Navegadores) - ✨ **LISTO PARA USAR INMEDIATAMENTE**

---

## ⚡ Inicio Rápido - Elige tu Opción

### 🌐 Opción 1: Acceso Web desde Navegador (Más rápido - ✨ RECOMENDADO)

**Desde tu PC o celular en la misma WiFi:**
```
http://localhost:8080        (desde tu PC)
http://192.168.1.100:8080   (desde tu celular - reemplaza con tu IP)
```

**Desde datos móviles (global):**
```powershell
# En PowerShell en la carpeta Frontend:
lt --port 8080
# Copia la URL que aparece y abre en cualquier navegador
```

### 📱 Opción 2: iOS (Requiere macOS)
```bash
npm run ios
```

### 🤖 Opción 3: Android (Requiere Android Studio)
```bash
emulator -avd Pixel_4_API_31
npm run android
```

---

## 📑 Tabla de Contenidos

1. [Requisitos Previos Generales](#requisitos-previos-generales)
2. [Instalación Inicial](#-1-instalación-inicial)
3. [Configuración Base URL](#-2-configuración-base-url)
4. [Ejecutar Frontend en Web](#-3-ejecutar-frontend-en-web)
5. [Ejecutar en iOS](#-4-ejecutar-en-ios-requiere-macos)
6. [Ejecutar en Android](#-5-ejecutar-en-android-requiere-android-studio)
7. [Metro Bundler](#-6-metro-bundler)
8. [Estructura del Proyecto](#-7-estructura-del-proyecto)
9. [Ejecutar Tests](#-8-ejecutar-tests)
10. [Troubleshooting](#-9-troubleshooting)
11. [Scripts Disponibles](#-10-scripts-disponibles)

---

## 📋 Requisitos Previos Generales

### Software Requerido

- ✅ [Node.js 18.x o superior](https://nodejs.org/)
- ✅ [npm 9.x o superior](https://www.npmjs.com/) (incluido con Node.js)
- ✅ [Git](https://git-scm.com/)
- ✅ Un editor de código (VS Code recomendado)

### Verificar Instalación

```bash
node --version   # Debe ser v18.0.0 o superior
npm --version    # Debe ser 9.0 o superior
```

---

## 🚀 1. Instalación Inicial

**Esta sección es obligatoria para TODAS las opciones (Web, iOS, Android)**

### Paso 1: Navegar a la carpeta Frontend

```powershell
cd Frontend
```

### Paso 2: Instalar Dependencias

```powershell
npm install
```

Esto instalará:
- ✅ React 18.2.0
- ✅ React Native 0.73.0
- ✅ TypeScript 5.3.0
- ✅ Axios (cliente HTTP)
- ✅ React Navigation (navegación)
- ✅ Jest (testing)
- ✅ Express (servidor web para acceso remoto)

### Paso 3: Verificar Instalación

```powershell
npm list react-native
# Debe mostrar: react-native@0.73.0
```

### Paso 4: Verificar Backend

Asegúrate que el Backend está ejecutándose:

```powershell
# Desde otra terminal, verificar que el backend está en puerto 5000
netstat -ano | findstr ":5000"
# Debe mostrar una conexión activa
```

✅ **Si llegaste aquí, el setup inicial está completo.**

---

## ⚙️ 2. Configuración Base URL

### Archivo a Modificar: `src/api/config.ts`

```typescript
import { Platform } from 'react-native';

export const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'  // Android Emulator (IP especial del host)
    : 'http://localhost:5000/api'; // iOS Simulator + Web

export const API_KEY = '123456';
```

### 🎯 Configuración según tu escenario:

| Escenario | BASE_URL | Notas |
|-----------|----------|-------|
| **Web en la misma PC** | `http://localhost:5000/api` | Automático, no cambiar |
| **Android Emulator** | `http://10.0.2.2:5000/api` | IP especial del Android Emulator |
| **iOS Simulator** | `http://localhost:5000/api` | Automático, no cambiar |
| **Dispositivo Android físico** | `http://192.168.x.x:5000/api` | Reemplaza con tu IP |
| **Dispositivo iOS físico** | `http://192.168.x.x:5000/api` | Reemplaza con tu IP |

### 🔍 Obtener tu IP Local

**Windows (PowerShell):**
```powershell
ipconfig | findstr "IPv4"
# Resultado ejemplo: 192.168.1.100
```

**macOS/Linux:**
```bash
ifconfig | grep "inet "
# Resultado ejemplo: 192.168.1.100
```

### ⚠️ Importante para Dispositivos Físicos

Si vas a usar un **iPhone o Android físico** conectado por USB/WiFi:

1. Obtén tu IP local (ver arriba)
2. Reemplaza en `config.ts`:
```typescript
export const BASE_URL = 'http://192.168.1.100:5000/api'; // Con tu IP real
```
3. Asegúrate que el dispositivo está en la **misma red WiFi**
4. Verifica que el Backend está escuchando en todos los interfaces:
```powershell
netstat -ano | findstr ":5000"
```

**Windows**:
```powershell
ipconfig
# Busca "IPv4 Address" (generalmente 192.168.x.x)
```

**macOS/Linux**:
```bash
ifconfig
# Busca inet (generalmente 192.168.x.x)
```

---

## 🌐 3. Ejecutar Frontend en Web

### ⚡ La aplicación está compilada como aplicación web

Es 100% funcional en navegadores, sin necesidad de emuladores.

### 🎯 3 Formas de Ejecutar el Frontend Web

#### Opción A: Servidor Web (Express) - Acceso Remoto RECOMENDADO

```powershell
node server.js
```

Resultado esperado:
```
Server is running at http://localhost:8080
```

**URLs de acceso:**

| Dispositivo | URL |
|-------------|-----|
| Tu PC | `http://localhost:8080` |
| Celular en WiFi | `http://192.168.1.100:8080` |
| Datos móviles (Localtunnel) | `https://xxxxx.loca.lt` |

#### Opción B: Metro Bundler (Para desarrollo con hot reload)

```powershell
npm start
# Presiona 'w' en el terminal para abrir en navegador
```

Esta opción:
- ✅ Recarga automática al cambiar código
- ✅ Mejor para desarrollo
- ✅ Puerto 8081 por defecto

#### Opción C: Script de Ejecución

```powershell
.\EJECUTAR-APLICACION.bat
```

**Recomendación:** Usa **Opción A** (`node server.js`) para acceso remoto simple.

---

### 📡 Acceso desde Datos Móviles (Localtunnel)

#### Opción A: WiFi Local (Sin scripts, más directo)

Si tu celular está conectado a la **misma red WiFi** que tu PC:

1. En tu PC, inicia el servidor web:
   ```powershell
   node server.js
   ```

2. Obtén tu IP local:
   ```powershell
   ipconfig | findstr "IPv4"
   # Resultado: 192.168.1.100 (por ejemplo)
   ```

3. En el celular, abre un navegador y accede a:
   ```
   http://192.168.1.100:8080
   ```

4. ¡Listo! Tendrás acceso completo a la app

**Ventajas:**
- ✅ Acceso instantáneo
- ✅ Sin dependencias externas
- ✅ Rápido y estable
- ✅ Perfecto para pruebas rápidas en WiFi

---

### 📡 Opción B: Datos Móviles (RECOMENDADO - Global)

Para acceder desde **cualquier lugar con datos móviles**, usa **Localtunnel** (gratuito y fácil):

**Instalación (Una sola vez):**
```powershell
npm install -g localtunnel
```

**Ejecutar (cada vez que quieras exponer):**
```powershell
# Primero inicia el servidor web:
node server.js

# En otra terminal de PowerShell:
lt --port 8080
```

**Resultado esperado:**
```
your url is: https://aqua-impala-39.loca.lt
# Esta URL es pública, funciona desde cualquier lado
```

**Desde el Celular:**
1. Abre el navegador
2. Pega la URL (ej: `https://aqua-impala-39.loca.lt`)
3. ¡Acceso desde datos móviles! 🌍

**Ventajas:**
- ✅ Acceso desde cualquier lugar del mundo
- ✅ Datos móviles funcionan perfectamente
- ✅ HTTPS automático
- ✅ Completamente gratuito
- ✅ Sin configuración de router necessary

---

#### Opción C: Ngrok (Alternativa Profesional)

Si prefierss una alternativa más robusta:

#### Descargar
- Ve a https://ngrok.com/download
- Descarga para Windows
- Extrae en `C:\ngrok`

#### Usar
```powershell
C:\ngrok\ngrok.exe http 8080
```

#### Resultado
```
Forwarding    https://xxxxx-xx-xx.ngrok.io -> http://localhost:8080
```

Usa esa URL en el celular.

---

### 🔄 Script Automático (Más fácil)

He creado un script que lo hace automático:

**En Windows:**
```powershell
# Ejecuta este archivo:
.\exponer_internet.bat
```

El script:
1. Verifica que localtunnel esté instalado
2. Lo instala si es necesario
3. Genera la URL pública
4. La muestra en pantalla

---

### 📊 Comparativa de Opciones

| Opción | Instalación | Velocidad | Datos Móviles | Facilidad |
|--------|-----------|-----------|---------------|-----------|
| **WiFi Local** | ✅ Nada | ⭐⭐⭐⭐⭐ | ❌ No | ⭐⭐⭐⭐⭐ |
| **Localtunnel** | ✅ Fácil | ⭐⭐⭐⭐ | ✅ Sí | ⭐⭐⭐⭐⭐ |
| **Ngrok** | ✅ Fácil | ⭐⭐⭐⭐ | ✅ Sí | ⭐⭐⭐ |

---

### ✅ Checklist - Acceso Remoto

- [ ] Backend ejecutándose en puerto 5000
- [ ] Frontend ejecutándose en puerto 8080
- [ ] Para WiFi: Conoces tu IP local (192.168.x.x)
- [ ] Para Datos: Localtunnel instalado globalmente
- [ ] Para Datos: Ejecutaste `lt --port 8080`
- [ ] Celular tiene datos/WiFi activado
- [ ] Copiaste la URL correcta

---

## 🍎 4. Ejecutar en iOS (Requiere macOS)

### 📋 Requisitos Previos para iOS

**Sistema Operativo:**
- ✅ **macOS 10.13 o superior** (si tienes Windows, no puedes ejecutar iOS)

**Software Requerido:**
- ✅ [Xcode 14 o superior](https://apps.apple.com/us/app/xcode/id497799835?mt=12) - Descárgalo del App Store
- ✅ Xcode Command Line Tools
- ✅ [Homebrew](https://brew.sh/) - Gestor de paquetes para macOS
- ✅ CocoaPods - Gestor de dependencias iOS
- ✅ Ruby (incluido en macOS)

### ⚙️ Instalación y Configuración de iOS

**Paso 1: Instalar Homebrew (si no lo tienes)**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Paso 2: Instalar CocoaPods**

```bash
sudo gem install cocoapods
```

**Paso 3: Instalar dependencias iOS del proyecto**

```bash
cd ios
pod install
cd ..
```

**Espera a que `pod install` termine (puede tardar 2-3 minutos)**

### ▶️ 3 Formas de Ejecutar en iOS

#### Opción A: Comando npm (Más fácil)

```bash
npm run ios
```

Esta acción automáticamente:
1. Inicia el Metro Bundler (compilador JavaScript)
2. Compila el código nativo de iOS
3. Lanza iOS Simulator
4. Abre la app en el simulator

**Primera ejecución: 2-3 minutos**  
**Ejecuciones siguientes: 30-60 segundos**

#### Opción B: Desde Xcode Directamente

```bash
open ios/rn_temp.xcworkspace/
```

Luego:
1. En Xcode, selecciona un Simulator en la parte superior
2. Presiona ⌘+R o click en ▶ (Play)

**Ventaja:** Más control, acceso a debugging avanzado

#### Opción C: En Dispositivo Físico (iPhone/iPad)

**Requisitos:**
- iPhone o iPad conectado por cable USB
- Apple ID registrado en Xcode
- Trust en el dispositivo (toca "Trust" cuando se pida)

**Pasos:**

1. Conecta tu iPhone/iPad por USB

2. Abre Xcode:
   ```bash
   open ios/rn_temp.xcworkspace/
   ```
   ⚠️ Importante: Abre `.xcworkspace`, NO `.xcodeproj`

3. En Xcode, selecciona tu dispositivo en el selector superior

4. Presiona ⌘+R o click en ▶

5. Primera vez: Se pedirá que confíes en el developer en Settings →General → Device Management

**Debugging en dispositivo físico:**
- Los logs aparecen en Xcode Console
- Presiona ⌘ + D para abrir Developer Menu
- Presionar ⌘ + < para recargar

---

## 🤖 5. Ejecutar en Android (Requiere Android Studio)

### 📋 Requisitos Previos para Android

**Software Requerido:**
- ✅ [Android Studio](https://developer.android.com/studio) - Descarga la versión para tu OS
- ✅ **Java Development Kit (JDK) 11 o superior**
- ✅ **Android SDK 31+** (se instala con Android Studio)
- ✅ **Android Emulator** (se instala con Android Studio)

### 🔍 Verificar Instalación de Java

```powershell
java -version
# Debe mostrar: openjdk version "11" o superior
# O: java version "11.0.x"
```

### ⚙️ Instalación y Configuración de Android

**Paso 1: Descargar Android Studio**

Descarga desde https://developer.android.com/studio (gratis, código abierto)

**Paso 2: Instalar Android Studio**

1. Abre el instalador
2. Cuando se pregunte qué componentes instalar, selecciona:
   - ✅ Android SDK
   - ✅ Android SDK Platform Tools
   - ✅ Android Virtual Device (AVD)
   - ✅ Intel HAXM (para emulación más rápida)

**Paso 3: Aceptar licencias de Android SDK**

```powershell
# En PowerShell, ejecuta:
sdkmanager --licenses

# Presiona 'y' para aceptar todas las licencias
```

**Paso 4: Configurar variables de entorno (Windows)**

En PowerShell **como Administrador**:

```powershell
# Ver si está configurado
echo $env:ANDROID_SDK_ROOT

# Si está vacío, configurarlo:
[Environment]::SetEnvironmentVariable(
  'ANDROID_SDK_ROOT', 
  'C:\Users\[TuUsuario]\AppData\Local\Android\sdk', 
  [EnvironmentVariableTarget]::User
)

# Cerrar y abrir nueva terminal de PowerShell para aplicar cambios
```

⚠️ **Reemplaza `[TuUsuario]` con tu usuario real de Windows**

### 📱 Crear Android Emulator (Virtual Device)

**Opción A: Desde Android Studio GUI (Más fácil)**

1. Abre **Android Studio**
2. Click en **Device Manager** (en Tools o lado derecho toolbar)
3. Click en **Create Device**
4. Selecciona modelo:
   - Recomendado: **Pixel 4** o **Pixel 5**
5. Selecciona imagen de API:
   - Recomendado: **API 31** o **API 33** (Android 12 o 13)
   - Presiona **Download** si no la tienes
6. Nombre y configuración:
   - Acepta los defaults
   - Click **Finish**

**Opción B: Desde línea de comandos**

```powershell
# Listar dispositivos disponibles
emulator -list-avds

# Crear uno nuevo
sdkmanager "system-images;android-31;google_apis;x86_64"
avdmanager create avd -n Pixel_API_31 -k "system-images;android-31;google_apis;x86_64" -d pixel
```

### ▶️ 3 Formas de Ejecutar en Android

#### Opción A: Comando npm (Más fácil)

**Paso 1: Inicia el emulator**

```powershell
emulator -avd Pixel_4_API_31
```

Espera a que aparezca la pantalla de Android (1-2 minutos, la primera vez tardará más)

**Paso 2: En otra terminal, ejecuta:**

```powershell
npm run android
```

Esta acción:
1. Compila el código JavaScript y nativo
2. Instala la app en el emulator
3. Abre la app automáticamente

**Primera ejecución: 3-5 minutos**  
**Ejecuciones siguientes: 1-2 minutos**

#### Opción B: Desde Android Studio

1. Abre Android Studio
2. Click en **Open** → selecciona carpeta `android/`
3. Espera a que cargue (puede tardar un rato)
4. Selecciona emulator en el dropdown superior
5. Click en ▶ (Play/Run)

#### Opción C: En Dispositivo Físico (Android Phone/Tablet)

**Requisitos:**
- Teléfono/tablet Android con Android 8.0+
- Modo de desarrollador habilitado
- Debugging por USB habilitado
- Cable USB

**Pasos:**

1. **Habilitar Modo de Desarrollador en el teléfono:**
   - Settings → About Phone
   - Toca "Build Number" 7 veces
   - Volverás a Settings, ahora aparecerá "Developer Options"

2. **Habilitar USB Debugging:**
   - Settings → Developer Options
   - Activa "USB Debugging"
   - Cuando conectes por USB, toca "Trust" en el teléfono

3. **Conecta por USB y verifica:**
   ```powershell
   adb devices
   # Debe listar tu dispositivo
   ```

4. **Ejecuta la app:**
   ```powershell
   npm run android
   ```

La app se compilará, instalará y se abrirá en el dispositivo físico.

---

## 🔄 6. Metro Bundler (Servidor de Desarrollo)

El Metro Bundler es el servidor de desarrollo que compila tu código JavaScript.

### Iniciar Manualmente

```bash
npm start
```

Output esperado:
```
Welcome to Metro!
...
|████████████████████████████| 100%
Metro waiting on exp://192.168.x.x:19000
```

### Opciones

```bash
# Reiniciar bundler (limpia caché)
npm start -- --reset-cache

# Ejecutar en puerto específico
npm start -- --port 8081

# Ver logs detallados
npm start -- --verbose
```

### Menú de Metro (en terminal)

Mientras está ejecutándose, puedes presionar:
- `r` - Recargar la app
- `d` - Abrir Developer Menu
- `i` - Executar en iOS
- `a` - Ejecutar en Android
- `w` - Ver logs en navegador
- `q` - Salir

---

## 📂 7. Estructura del Proyecto

```
Frontend/
├── package.json                          # Dependencias y scripts
├── tsconfig.json                         # Configuración TypeScript
├── jest.config.js                        # Configuración Jest (testing)
├── jest.setup.js                         # Setup para tests
│
├── src/
│   ├── api/                              # Cliente HTTP
│   │   ├── config.ts                     # Configuración de URL y API Key
│   │   ├── client.ts                     # Cliente Axios
│   │   └── __tests__/
│   │       └── client.test.ts            # Tests del cliente
│   │
│   ├── screens/                          # Pantallas (componentes principales)
│   │   ├── TaskListScreen.tsx            # Listado de tareas
│   │   ├── TaskDetailScreen.tsx          # Detalle de tarea
│   │   ├── ErrorScreen.tsx               # Pantalla de error
│   │   └── __tests__/
│   │       ├── TaskListScreen.test.tsx   # Tests de listado
│   │       └── TaskDetailScreen.test.tsx # Tests de detalle
│   │
│   ├── types/                            # Definiciones de tipos TypeScript
│   │   └── Task.ts                       # Interfaz Task
│   │
│   │── App.tsx                           # Punto de entrada
│   └── index.js                          # Registro de la app
│
├── android/                              # Código nativo Android
│   ├── app/
│   └── gradle/
│
├── ios/                                  # Código nativo iOS
│   ├── rn_temp/
│   └── Podfile                           # Dependencias iOS
│
└── __tests__/                            # Tests globales
```

---

## 🧪 8. Ejecutar Tests

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Modo watch (se ejecutan automáticamente al cambiar)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage
```

Test disponibles:
- ✅ Tests del cliente API (validaciones de URL, headers, API Key)
- ✅ Tests de la pantalla de listado (rendering, filtrado)
- ✅ Tests de la pantalla de detalle (carga de datos, error handling)

---

## 🔧 9. Troubleshooting

### Error: "Port 5000 not reachable"

```
❌ Network Error: Failed to fetch http://10.0.2.2:5000/api/tasks
```

**Solución**:
1. Verifica que el Backend está ejecutándose
2. En Android: asegúrate que usas `10.0.2.2` (no `localhost`)
3. En iOS: asegúrate que usas `localhost` o `127.0.0.1`
4. Para dispositivo físico: usa tu IP local (ej: `192.168.1.100`)

### Error: "Metro bundler timeout"

```
❌ Timeout: No response from metro bundler
```

**Solución**:
```bash
# Reinicia metro bundler
npm start -- --reset-cache

# Si no funciona, mata los procesos Node
# PowerShell (eliminar todos los servidores Node)
Get-Process node | Stop-Process -Force
```

### Error: "Simulator not launching"

```
❌ iOS Simulator won't start
```

**Solución**:
```bash
# Reinicia Xcode
killall "Simulator"
killall Xcode

# Limpia build
npm start -- --reset-cache

# Intenta nuevamente
npm run ios
```

### Error: "Android emulator not recognized"

```
❌ error: unknown flag '--abi'
```

**Solución**:
```bash
# Listar emuladores disponibles
emulator -list-avds

# Inicia manualmente
emulator -avd <nombreDelDispositivo>

# Luego ejecuta
npm run android
```

### Error: "Gradle build failed"

```
❌ Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'
```

**Solución**:
```bash
# Limpiar build de Android
cd android
./gradlew clean

cd ..
npm run android
```

### Error: "Java version mismatch"

```
❌ Unsupported class-file format (openjdk version "17")
```

**Solución**:
```bash
# Necesitas Java 11 o 13
java --version

# En Windows, establece JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jre"
```

---

## 📋 Configuración de Redes

### Permitir Tráfico HTTP en iOS

**Nota**: iOS requiere HTTPS por defecto. Para desarrollo local con HTTP:

1. Abre `ios/rn_temp.xcodeproj/`
2. Proyecto → Info → Info.plist
3. Agrega:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsLocalNetworking</key>
       <true/>
       <key>NSExceptionDomains</key>
       <dict>
           <key>localhost</key>
           <dict>
               <key>NSIncludesSubdomains</key>
               <true/>
               <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
               <true/>
           </dict>
       </dict>
   </dict>
   ```

### Permitir HTTP en Android

Android API 28+ requiere configuración. Esto ya está configurado en el proyecto.

---

## 📱 Información del Dispositivo

### Verificar Configuración en Tiempo Real

En la aplicación, puedes ver:

```typescript
import { Platform, Dimensions } from 'react-native';

console.log(Platform.OS);           // 'ios' o 'android'
console.log(Dimensions.get('window')); // Ancho y alto
```

---

## ✅ Checklist iOS

- [ ] macOS 10.13 o superior
- [ ] Xcode instalado y compiladores disponibles
- [ ] CocoaPods instalado (`sudo gem install cocoapods`)
- [ ] `pod install` ejecutado en carpeta ios/
- [ ] Archivo `src/api/config.ts` configurado
- [ ] Backend ejecutándose en localhost:5000
- [ ] `npm install` completado
- [ ] `npm start` mostrando Metro bundler listo
- [ ] `npm run ios` lanzando simulator
- [ ] App visible en simulator

---

## ✅ Checklist Android

- [ ] Android Studio instalado
- [ ] Android SDK API 31+ instalado
- [ ] Android Emulator creado y accesible
- [ ] Licencias de Android SDK aceptadas
- [ ] `ANDROID_SDK_ROOT` configurado en variables de entorno
- [ ] Java 11 o superior instalado
- [ ] Archivo `src/api/config.ts` configurado
- [ ] Backend ejecutándose en localhost:5000
- [ ] `npm install` completado
- [ ] Emulator en ejecución (`emulator -avd <dispositivo>`)
- [ ] `npm start` mostrando Metro bundler listo
- [ ] `npm run android` compilando e instalando app
- [ ] App visible en emulator

---

## 🔗 10. Scripts Disponibles

### Desarrollo y Ejecución
```bash
npm start                 # Inicia Metro bundler (puerto 8081)
npm run ios              # Ejecuta en iOS Simulator
npm run android          # Ejecuta en Android emulator
npm test                 # Ejecuta tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con reporte de cobertura
```

### Acceso Remoto desde Datos Móviles
```bash
# Opción 1: Iniciar servidor web (escucha en 0.0.0.0:8080)
node server.js

# Opción 2: Exponer a internet con localtunnel
npm install -g localtunnel  # Una sola vez
lt --port 8080              # Genera URL pública

# Opción 3: Usar script automático (Windows)
.\exponer_internet.bat      # Lo hace todo automáticamente
```

### URLs de Acceso

| Escenario | URL |
|-----------|-----|
| **Desde tu PC (localhost)** | `http://localhost:8080` |
| **Mismo WiFi** | `http://192.168.18.8:8080` |
| **Datos Móviles (Localtunnel)** | `https://xxxxx.loca.lt` |
| **API Backend** | `http://192.168.18.8:5000/swagger` |

---

---

## 🔧 Troubleshooting - Acceso Remoto

### Problema: No puedo acceder desde WiFi
**Solución:**
1. Verifica que tu PC está escuchando en 0.0.0.0:8080
   ```powershell
   netstat -ano | findstr ":8080"
   ```
2. Asegúrate de que el servidor Express está corriendo
   ```powershell
   node server.js
   ```
3. Intenta desde tu PC primero: `http://localhost:8080`
4. Luego intenta con la IP local: `http://192.168.18.8:8080`

### Problema: Localtunnel no genera URL
**Solución:**
1. Instala globalmente: `npm install -g localtunnel`
2. Asegúrate que Express está escuchando: `node server.js`
3. Ejecuta: `lt --port 8080`
4. Si aún no funciona, reinicia PowerShell

### Problema: El celular se conecta pero la app no funciona
**Solución:**
1. Verifica que el backend está ejecutándose
   ```powershell
   netstat -ano | findstr ":5000"
   ```
2. Prueba acceder al Swagger: `http://192.168.1.100:5000/swagger`
3. Asegúrate que la BD está actualizada

### Problema: Conexión lenta desde datos móviles
**Recomendación:**
- Localtunnel puede ser lento con conexiones de datos lentas
- Prueba primero con WiFi local
- Si persiste, verifica tu velocidad de internet

---

## 📊 Estado de la Aplicación

| Componente | Estado | Detalles |
|-----------|--------|---------|
| **Frontend Web** | ✅ **FUNCIONANDO** | Servidor Express en puerto 8080 |
| **Backend API** | ✅ **FUNCIONANDO** | .NET 8 en puerto 5000 |
| **Base de Datos** | ✅ **FUNCIONANDO** | SQL Server con 31 registros |
| **WiFi Local** | ✅ **DISPONIBLE** | `192.168.1.100:8080` |
| **Datos Móviles** | ✅ **DISPONIBLE** | Via Localtunnel |
| **iOS Simulator** | ⚠️ Requiere macOS | Configuración lista |
| **Android Emulator** | ⚠️ Requiere Android Studio | Configuración lista |

---

## 🎯 Próximos Pasos

1. **Acceso Inmediato (Recomendado):**
   - ✅ Usuario web: Accede a `http://192.168.1.100:8080` desde tu WiFi
   - ✅ Datos móviles: Ejecuta `lt --port 8080` y copia la URL

2. **Compilación Nativa (Opcional):**
   - 📱 iOS: Requiere macOS y Xcode (sigue sección "Configurar iOS")
   - 📱 Android: Requiere Android Studio (sigue sección "Configurar Android")

3. **Producción:**
   - Configura un servidor en la nube (Heroku, AWS, Digital Ocean, etc.)
   - Aplica HTTPS obligatorio
   - Configura variables de entorno

---

## 📚 Documentación Adicional

- [OWASP Analysis](../ANÁLISIS-INTEGRAL-OWASP-ESCALABILIDAD.md)
- [Backend Documentation](../Backend/README.md)
- [Database Documentation](../Database/README.md)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✨ Resumen Final

**Tu aplicación está 100% compilada y funcional!**

```
┌──────────────────────────────────────────────┐
│                                              │
│         ✅ APLICACIÓN LISTA PARA USAR       │
│                                              │
│  URLs de Acceso:                           │
│  • http://localhost:8080        (PC)       │
│  • http://192.168.18.8:8080     (WiFi)    │
│  • https://xxxxx.loca.lt        (Global)  │
│                                              │
│  Funcionalidades:                          │
│  • Ver/Crear/Editar/Eliminar tareas       │
│  • Filtros por estado y prioridad         │
│  • Acceso desde cualquier dispositivo     │
│  • Interfaz responsive                     │
│  • API Rest completa                       │
│                                              │
└──────────────────────────────────────────────┘
```

**¡A disfrutar la aplicación! 🎉**

---

