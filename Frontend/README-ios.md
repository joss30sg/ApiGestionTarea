# Ejecutar en Android e iOS (React Native)

Esta guía cubre la configuración y ejecución de la aplicación móvil en **Android** y **iOS**.

---

## Requisitos comunes

| Requisito | Versión |
|-----------|---------|
| **Node.js** | 18 o superior |
| **npm** | 9 o superior |
| **React Native CLI** | `npx react-native` (incluido) |
| **Backend corriendo** | Puerto 5000 |

```bash
cd Frontend
npm install --legacy-peer-deps
```

---

## Iniciar el backend

Antes de ejecutar la app móvil, el backend debe estar corriendo. En **otra terminal**:

```bash
cd Backend/TaskService.Api
dotnet run
```

Espera a ver `Now listening on: http://localhost:5000`.

---

# Android

## Requisitos Android

1. **Android Studio** → https://developer.android.com/studio
2. **Android SDK** (API 33 o superior) — se instala desde Android Studio
3. **Java JDK 17** — incluido con Android Studio
4. **Emulador Android** o un dispositivo físico conectado por USB

### Variables de entorno (Windows)

Agrega las siguientes variables de entorno del sistema:

```
ANDROID_HOME = C:\Users\<tu-usuario>\AppData\Local\Android\Sdk
```

Y agrega al `PATH`:

```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

### Variables de entorno (macOS/Linux)

Agrega en tu `~/.bashrc`, `~/.zshrc` o equivalente:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
# export ANDROID_HOME=$HOME/Android/Sdk         # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

## Ejecutar en emulador Android

### 1. Crear un emulador (solo la primera vez)

1. Abre **Android Studio** → **Virtual Device Manager**
2. Crea un dispositivo (ej: Pixel 6 con API 34)
3. Descarga la imagen del sistema si es necesario

### 2. Ejecutar la app

```bash
cd Frontend
npx react-native run-android
```

Esto va a:
- Compilar la app (la primera vez tarda 3-5 minutos)
- Abrir el emulador automáticamente (si no está abierto)
- Instalar y abrir la app

> **Nota:** En el emulador Android, la app se conecta al backend usando `10.0.2.2:5000` automáticamente (configurado en `src/api/config.ts`).

## Ejecutar en un dispositivo Android físico

1. Habilita **Opciones de desarrollador** en tu dispositivo:
   - Ve a **Ajustes → Acerca del teléfono → Número de compilación** → toca 7 veces
2. Activa **Depuración USB** en **Ajustes → Opciones de desarrollador**
3. Conecta el dispositivo por cable USB
4. Verifica la conexión:

```bash
adb devices
```

5. Ejecuta la app:

```bash
npx react-native run-android
```

> **Importante:** Para dispositivos físicos, debes cambiar la URL del backend a la IP de tu PC (ver sección [Configurar URL del backend](#configurar-la-url-del-backend)).

## Configuración de red Android

El proyecto ya incluye la configuración necesaria para permitir conexiones HTTP en desarrollo:

- `android/app/src/main/AndroidManifest.xml` tiene `android:usesCleartextTraffic="true"` y referencia a `network_security_config`
- `android/app/src/main/res/xml/network_security_config.xml` permite tráfico HTTP a:
  - `10.0.2.2` (emulador → localhost del host)
  - `localhost`
  - `192.168.1.0/24` (red local para dispositivos físicos)

---

# iOS

> Solo funciona en **macOS**. Si usas Windows o Linux, no puedes compilar para iOS.

## Requisitos iOS

1. **macOS** (10.13 o superior)
2. **Xcode** → Descárgalo gratis desde la App Store
3. **CocoaPods** → Se instala con un comando (ver abajo)

### Instalar CocoaPods (solo la primera vez)

```bash
sudo gem install cocoapods
```

O si tienes Homebrew:

```bash
brew install cocoapods
```

### Instalar dependencias de iOS

```bash
cd Frontend/ios
pod install
cd ..
```

> `pod install` puede tardar 2-3 minutos la primera vez.

## Ejecutar en el simulador de iOS

```bash
cd Frontend
npx react-native run-ios
```

Esto va a:
- Compilar la app (la primera vez tarda 2-3 minutos)
- Abrir el simulador de iPhone
- Instalar y abrir la app automáticamente

> En el simulador de iOS, `localhost` funciona directamente para conectarse al backend.

## Ejecutar en un iPhone físico

1. Conecta tu iPhone por cable USB
2. Abre el archivo `ios/rn_temp.xcworkspace` en Xcode (**no** el `.xcodeproj`)
3. En el menú superior, selecciona tu iPhone como dispositivo
4. Ve a **Signing & Capabilities** y selecciona tu Apple ID como Team
5. Presiona el botón ▶ (Play) o `Cmd + R`

> La primera vez, iOS te pedirá que confíes en el desarrollador:  
> **Ajustes → General → Gestión de dispositivos → tu Apple ID → Confiar**

## Configuración de red iOS

El archivo `ios/rn_temp/Info.plist` ya incluye `NSAllowsLocalNetworking = true` para permitir conexiones HTTP a `localhost` durante el desarrollo.

---

# Configurar la URL del backend

La app detecta automáticamente la plataforma y usa la URL correcta (ver `src/api/config.ts`):

| Plataforma | URL por defecto | Cuándo funciona |
|------------|----------------|-----------------|
| Android (emulador) | `http://10.0.2.2:5000/api` | Automático |
| iOS (simulador) | `http://localhost:5000/api` | Automático |
| Dispositivo físico | Requiere IP de tu PC | Manual |

### Dispositivos físicos (Android e iOS)

Para dispositivos físicos, configura la variable de entorno `REACT_APP_API_URL` con la IP de tu PC:

```bash
# Antes de ejecutar la app
export REACT_APP_API_URL=http://192.168.1.100:5000/api
```

O edita directamente `Frontend/src/api/config.ts`:

```typescript
export const BASE_URL = 'http://192.168.1.100:5000/api';
```

**Encontrar tu IP:**

```bash
# Windows
ipconfig

# macOS / Linux
ifconfig | grep "inet "
```

> El dispositivo y tu PC deben estar en la **misma red WiFi**.

---

# Credenciales

Las credenciales de autenticación se encuentran en el archivo `README.md` de la raíz del proyecto.

---

# Solución de problemas

## Android

| Problema | Solución |
|----------|----------|
| `SDK location not found` | Configura la variable `ANDROID_HOME` correctamente |
| `adb devices` no muestra el dispositivo | Habilita Depuración USB y acepta el diálogo en el teléfono |
| `Could not connect to development server` | Verifica que Metro esté corriendo (`npx react-native start`) |
| Build falla con error de licencias | Ejecuta `sdkmanager --licenses` y acepta todas |
| La app no conecta al backend (emulador) | Usa `10.0.2.2` en lugar de `localhost` (ya configurado) |
| La app no conecta al backend (físico) | Usa la IP de tu PC y verifica misma red WiFi |

### Limpiar y recompilar Android

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

En Windows:

```bash
cd android
gradlew.bat clean
cd ..
npx react-native run-android
```

## iOS

| Problema | Solución |
|----------|----------|
| `pod install` falla | Ejecuta `sudo gem install cocoapods` y reintenta |
| "No signing certificate" | En Xcode: Signing & Capabilities → selecciona tu Apple ID |
| La app no conecta al backend | Verifica que el backend esté corriendo y la URL sea correcta |
| Build lento la primera vez | Es normal, las siguientes compilaciones son más rápidas |
| Simulador no aparece | Abre Xcode al menos una vez para descargar los simuladores |

### Limpiar y recompilar iOS

```bash
cd ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

---

# Tecnologías móviles

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React Native | 0.73.0 | Framework móvil |
| React | 18.2.0 | UI |
| React Navigation | 6.x | Navegación entre pantallas |
| Hermes | Habilitado | Motor JavaScript optimizado |
| TypeScript | ~5.3.0 | Tipado estático |

---

# Nota sobre el nombre del proyecto

El proyecto iOS/Android tiene el nombre interno `rn_temp` en los archivos de configuración. Esto es intencional para no romper rutas internas. El Bundle Identifier está configurado como `com.taskmobileapp`.
