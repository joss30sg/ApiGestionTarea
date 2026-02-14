# Ejecutar en iOS (macOS)

Requisitos:
- macOS con Xcode instalado
- CocoaPods (`sudo gem install cocoapods` o `brew install cocoapods`)

Pasos:

1. Abrir terminal y posicionarse en la carpeta `Frontend`:

```bash
cd Frontend
```

2. Instalar dependencias JS (si no lo hiciste antes):

```bash
npm install
```

3. Instalar pods para iOS:

```bash
cd ios
pod install
cd ..
```

4. Abrir el workspace en Xcode y ajustar el Bundle Identifier si es necesario:

- Abre `Frontend/ios/rn_temp.xcworkspace` en Xcode.
- Selecciona el target `rn_temp` y en la pestaña `Signing & Capabilities` ajusta el `Bundle Identifier` (por ejemplo `com.taskmobileapp`).
- Ajusta el `Display Name` si quieres (ya se ha cambiado a `TaskMobileApp`), y selecciona un team para firmar la app.

5. Ejecutar en un simulador (desde Xcode) o desde la terminal:

```bash
npx react-native run-ios
```

Notas:
- El proyecto iOS mantiene el nombre interno `rn_temp` (archivo Xcode project). Esto es intencional para no romper rutas relativas; el Bundle Identifier ya se actualizó a `com.taskmobileapp`.
- Si quieres renombrar por completo el proyecto en Xcode, hazlo desde Xcode (target → Rename), teniendo en cuenta que puede requerir ajustes adicionales.
