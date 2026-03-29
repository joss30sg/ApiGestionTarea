# Ejecutar en iOS

> Solo funciona en **macOS**. Si usas Windows o Linux, no puedes compilar para iOS.

---

## ¿Qué necesito?

1. **macOS** (10.13 o superior)
2. **Xcode** → Descárgalo gratis desde la App Store
3. **CocoaPods** → Se instala con un comando (ver abajo)
4. **Node.js 18+** → https://nodejs.org
5. El **backend corriendo** en el puerto 5000

---

## Paso a paso

### 1. Instalar CocoaPods (solo la primera vez)

```bash
sudo gem install cocoapods
```

O si tienes Homebrew:

```bash
brew install cocoapods
```

### 2. Instalar dependencias del proyecto

```bash
cd Frontend
npm install --legacy-peer-deps
```

### 3. Instalar dependencias de iOS

```bash
cd ios
pod install
cd ..
```

> `pod install` puede tardar 2-3 minutos la primera vez.

### 4. Iniciar el backend

En **otra terminal**:

```bash
cd Backend/TaskService.Api
dotnet run
```

Espera a ver `Now listening on: http://localhost:5000`.

### 5. Ejecutar en el simulador de iOS

```bash
npx react-native run-ios
```

Esto va a:
- Compilar la app (la primera vez tarda 2-3 minutos)
- Abrir el simulador de iPhone
- Instalar y abrir la app automáticamente

---

## Ejecutar en un iPhone físico

1. Conecta tu iPhone por cable USB
2. Abre el archivo `ios/rn_temp.xcworkspace` en Xcode (no el `.xcodeproj`)
3. En el menú superior, selecciona tu iPhone como dispositivo
4. Ve a **Signing & Capabilities** y selecciona tu Apple ID como Team
5. Presiona el botón ▶ (Play) o `Cmd + R`

> La primera vez, iOS te pedirá que confíes en el desarrollador:  
> **Ajustes → General → Gestión de dispositivos → tu Apple ID → Confiar**

---

## Configurar la URL del backend

Si ejecutas en un iPhone físico, necesitas cambiar la URL para que apunte a tu PC.

Edita `Frontend/src/api/config.ts`:

```typescript
// Cambia localhost por la IP de tu Mac
export const BASE_URL = 'http://192.168.1.100:5000/api';
```

Para encontrar tu IP:

```bash
ifconfig | grep "inet "
```

> En el simulador de iOS no necesitas cambiar nada — `localhost` funciona directamente.

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `pod install` falla | Ejecuta `sudo gem install cocoapods` y reintenta |
| "No signing certificate" | En Xcode: Signing & Capabilities → selecciona tu Apple ID |
| La app no conecta al backend | Verifica que el backend esté corriendo y la URL sea correcta |
| Build lento la primera vez | Es normal, las siguientes compilaciones son más rápidas |
| Simulador no aparece | Abre Xcode al menos una vez para que descargue los simuladores |

### Limpiar y recompilar

Si algo falla después de actualizar dependencias:

```bash
cd ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

---

## Nota sobre el nombre del proyecto

El proyecto iOS tiene el nombre interno `rn_temp` en los archivos de Xcode. Esto es intencional para no romper rutas internas. El Bundle Identifier ya está configurado como `com.taskmobileapp`.
