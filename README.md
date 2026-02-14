# 🚀 TaskService - Aplicación FullStack de Gestión de Tareas

**Solución completa de gestión de tareas multiplataforma** con Backend .NET, Frontend React Native Web y SQL Server.

---

## 📊 Estado General

| Componente | Estado | Versión | Detalles |
|-----------|--------|---------|---------|
| **Backend** | ✅ Compilado | .NET 8 | Puerto 5000, API Key auth |
| **Frontend Web** | ✅ Funcional | React Native 0.73 | Puerto 8080, Responsive |
| **Base de Datos** | ✅ Activa | SQL Server | 31 registros de prueba |
| **Seguridad** | ✅ OWASP | 2023 | 7/10 implementado |
| **Escalabilidad** | 🟡 Preparado | 4 Niveles | Roadmap documentado |

---

## 🌐 Acceso Rápido

### Para Celular (WiFi Local)
```
http://192.168.18.8:8080
```

### Para Datos Móviles
```powershell
npm install -g localtunnel
lt --port 8080
# Obtiene URL pública
```

### Para Desarrollo
- **Frontend Web**: http://localhost:8080
- **Backend API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

---

## 📂 Estructura del Proyecto

```
Mini App de Gestión de Tareas/
│
├── 🔐 OWASP-ESCALABILIDAD-SEGURIDAD.md    ⭐ [LEER PRIMERO]
│                                            Análisis completo de seguridad
│
├── Backend/
│   ├── README_BACKEND.md                   Setup .NET, configuración
│   ├── TaskService.sln                     Solución principal
│   ├── VALIDACIÓN-SEGURIDAD-ENDPOINTS.md   Tests de seguridad
│   ├── TaskService.Api/                    Controllers, Middleware
│   ├── TaskService.Application/            DTOs, Servicios
│   ├── TaskService.Domain/                 Entidades
│   ├── TaskService.Infrastructure/         Repositorio, Dapper
│   └── TaskService.Tests/                  Tests unitarios
│
├── Frontend/
│   ├── README_FRONTEND.md                  ⭐ Setup, acceso remoto
│   ├── src/
│   │   ├── screens/                        Pantallas principales
│   │   ├── components/                     Componentes reutilizables
│   │   ├── api/                            Cliente HTTP (Axios)
│   │   └── constants/                      Configuración
│   ├── server.js                           Servidor Express
│   ├── exponer_internet.bat                Script acceso remoto
│   └── package.json                        Dependencias
│
├── Database/
│   ├── README_BD.md                        Scripts SQL
│   ├── InitDatabase.sql                    Inicialización completa
│   ├── 00_CreateDatabase.sql               BD
│   ├── 01_CreateSchema.sql                 Esquema
│   ├── 02_CreateTables.sql                 Tablas
│   ├── 03_SeedData.sql                     Datos de prueba
│   └── 04_StoredProcedures.sql             Stored procs
│
└── ACCESO_DATOS_MOVILES.md                 Guía de acceso remoto

```

---

## 🏃 Inicio Rápido (5 minutos)

### 1️⃣ Compilar Backend
```powershell
cd Backend
dotnet build
```

### 2️⃣ Inicializar Base de Datos
```powershell
sqlcmd -S localhost -E -i "Database\InitDatabase.sql"
```

### 3️⃣ Ejecutar Backend
```powershell
cd Backend
dotnet run --project TaskService.Api
# Escucha en http://localhost:5000
```

### 4️⃣ Ejecutar Frontend
```powershell
cd Frontend
npm install
node server.js
# Escucha en http://localhost:8080
```

### 5️⃣ Acceder desde Celular
```
WiFi Local:  http://192.168.18.8:8080
Datos:       npm install -g localtunnel && lt --port 8080
```

---

## 🔐 Seguridad OWASP Top 10

**Documento Completo**: [OWASP-ESCALABILIDAD-SEGURIDAD.md](OWASP-ESCALABILIDAD-SEGURIDAD.md)

### ✅ Implementado (7/10)

| # | Vulnerabilidad | Estado | Evidencia |
|---|---------------|---------|-|
| 1 | Access Control | ✅ | Middleware API Key |
| 3 | Injection | ✅ | Parámetros Dapper |
| 4 | Insecure Design | ✅ | Clean Architecture |
| 5 | Broken Auth | ✅ | API Key Middleware |
| 6 | Data Exposure | ✅ | Errores genéricos |
| 8 | Integrity | ✅ | Git + Build |
| 10 | SSRF | ✅ | Sin HTTP dinámico |

### 🟡 Parcialmente Implementado (3/10)

| # | Vulnerabilidad | Falta | Fecha Estimada |
|---|---------------|-|-|
| 2 | Cryptography | Encriptación BD | Fase 2 |
| 7 | Session Management | JWT Refresh | Fase 1 |
| 9 | Logging | Centralizado | Fase 1 |

---

## 📈 Escalabilidad: 4 Niveles

**Documento Completo**: [OWASP-ESCALABILIDAD-SEGURIDAD.md](OWASP-ESCALABILIDAD-SEGURIDAD.md#recomendaciones-de-escalabilidad)

### Nivel 1: Desarrollo ✅ (ACTUAL)
- **Usuarios**: 1-10
- **Instancias**: 1
- **Costo**: Mínimo ($0-50/mes)
- **BD**: SQL Server Local

### Nivel 2: Pequeña Producción 📋
- **Usuarios**: 100-1,000
- **Instancias**: 2-3
- **Costo**: Bajo ($50-200/mes)
- **BD**: SQL Server Cloud + Redis

### Nivel 3: Mediana Producción 📋
- **Usuarios**: 1,000-100,000
- **Instancias**: 5-10
- **Costo**: Medio ($200-2,000/mes)
- **BD**: Sharding + Redis Cluster

### Nivel 4: Gran Producción 📋
- **Usuarios**: 100,000+
- **Instancias**: 20+
- **Costo**: Alto ($2,000+/mes)
- **BD**: Multi-región + Kafka

---

## 🔑 API Key y Autenticación

### Desarrollo
```
API Key: 123456
Método: Header X-API-Key

Ejemplo:
GET /api/tasks HTTP/1.1
X-API-Key: 123456
```

### Futuro (Fase 1)
```
JWT con refresh tokens
Expiración: 1 hora
Soporte: OAuth 2.0
```

---

## 📊 Funcionalidades

### ✅ Completamente Funcional

- **Ver tareas** - Listado completo con paginación
- **Filtros** - Por estado (Pending/Completed) y prioridad
- **Crear tareas** - Formulario intuitivo
- **Editar tareas** - Actualizar información
- **Eliminar tareas** - Confirmación de seguridad
- **Detalles** - Vista completa de cada tarea
- **Responsive** - Funciona en cualquier dispositivo

### 🎯 Próximas Características

- [ ] Autenticación de usuarios (Fase 2)
- [ ] Asignación de tareas (Fase 2)
- [ ] Notificaciones (Fase 3)
- [ ] Reportes y analytics (Fase 3)
- [ ] Integración con calendario (Fase 4)

---

## 📱 Acceso desde Dispositivos

### iOS
⚠️ Requiere **macOS + Xcode**

```bash
cd Frontend
npm run ios
```

### Android Nativo
⚠️ Requiere **Android Studio**

```bash
cd Frontend
npm run android
```

### Web (✅ YA DISPONIBLE)
Sin requisitos adicionales

```
http://192.168.18.8:8080      (WiFi)
https://xxxxx.loca.lt         (Datos - Localtunnel)
```

---

## 🧪 Testing

### Unit Tests Backend
```powershell
cd Backend
dotnet test TaskService.Tests
```

### Unit Tests Frontend
```powershell
cd Frontend
npm test
```

### Integration Tests
```powershell
# Ejecutar tests de seguridad
# Ver: Backend/VALIDACIÓN-SEGURIDAD-ENDPOINTS.md
```

---

## 📚 Documentación Completa

| Documento | Propósito | Ubicación |
|-----------|-----------|-----------|
| **OWASP & Escalabilidad** | Seguridad + crecimiento | [OWASP-ESCALABILIDAD-SEGURIDAD.md](OWASP-ESCALABILIDAD-SEGURIDAD.md) |
| **Backend Setup** | .NET 8 setup | [Backend/README_BACKEND.md](Backend/README_BACKEND.md) |
| **Frontend Setup** | React Native Web | [Frontend/README_FRONTEND.md](Frontend/README_FRONTEND.md) |
| **BD Setup** | Scripts SQL | [Database/README_BD.md](Database/README_BD.md) |
| **Acceso Remoto** | Datos móviles | [ACCESO_DATOS_MOVILES.md](ACCESO_DATOS_MOVILES.md) |
| **Validación Seguridad** | Tests de endpoints | [Backend/VALIDACIÓN-SEGURIDAD-ENDPOINTS.md](Backend/VALIDACIÓN-SEGURIDAD-ENDPOINTS.md) |

---

## 🚀 Deployment

### Desarrollo Local
```powershell
# Todo está listo, solo ejecuta:
cd Backend && dotnet run --project TaskService.Api &
cd Frontend && node server.js
```

### Staging (Azure)
```yaml
Backend: App Service (.NET 8)
Frontend: Static Web App
Database: SQL Database
Cache: Redis Cache
```

### Producción
```yaml
Backend: AKS (Kubernetes)
Frontend: CDN + Static Web App
Database: SQL Database Premium
Cache: Redis Enterprise
Monitoring: Application Insights
```

---

## 📊 Requisitos de Hardware

### Desarrollo Local
- RAM: 4 GB mínimo
- Almacenamiento: 5 GB
- Procesador: i5 o equivalente

### Producción (por 1,000 usuarios)
- Instancias: 2
- RAM por instancia: 2 GB
- Almacenamiento BD: 10 GB SSD

---

## 🔧 Stack Tecnológico

### Backend
- **.NET 8** - Framework
- **ASP.NET Core** - Web API
- **Dapper** - ORM
- **SQL Server** - Base de datos
- **Middleware** - API Key Auth

### Frontend
- **React Native** - Framework
- **TypeScript** - Lenguaje
- **Express.js** - Servidor
- **Axios** - HTTP Client
- **React Navigation** - Routing

### DevOps
- **Docker** - Containerización (futuro)
- **GitHub Actions** - CI/CD (futuro)
- **Azure** - Cloud (opciones listadas)

---

## 🔐 Seguridad Checklist

### ✅ Desarrollado
- [ x] API Key validada
- [ x] Errores genéricos
- [ x] Validación DTOs
- [ x] Parámetros SQL seguros
- [ x] HTTPS recomendado

### 📋 Próximo (Fase 1)
- [ ] JWT con refresh tokens
- [ ] Rate limiting
- [ ] CORS configurado
- [ ] Headers de seguridad

### 📋 Mediano Plazo (Fase 2)
- [ ] Encriptación en BD (AES-256)
- [ ] Logging centralizado
- [ ] WAF (Web App Firewall)

---

## 📞 Soporte y FAQ

### ¿No puedo acceder desde WiFi?
Ver: [Frontend/README_FRONTEND.md - Troubleshooting](Frontend/README_FRONTEND.md#troubleshooting---acceso-remoto)

### ¿Cómo uso datos móviles?
Ver: [ACCESO_DATOS_MOVILES.md](ACCESO_DATOS_MOVILES.md)

### ¿Cómo cambio la API Key?
1. Actualiza: `Backend/TaskService.Api/appsettings.json`
2. También en: `Frontend/server.js`

### ¿Cómo añado más tareas?
En BD: `Database/03_SeedData.sql`

---

## 📝 Versionado

```
v1.0.0 - 13 de febrero de 2026
├── Backend API funcional
├── Frontend Web responsivo
├── Base de datos lista
├── Seguridad OWASP 7/10
└── Escalabilidad documentada
```

---

## 📄 Licencia

Proyecto educativo - Uso interno

---

## 🎯 Próxmos Pasos

1. **Hoy**: Usa aplikcación en http://192.168.18.8:8080
2. **Semana 1**: Lee [OWASP-ESCALABILIDAD-SEGURIDAD.md](OWASP-ESCALABILIDAD-SEGURIDAD.md)
3. **Semana 2**: Implementa JWT (Fase 1)
4. **Semana 3**: Agrega logging centralizado
5. **Después**: Elige nivel de escalabilidad

---

**Última actualización**: 13 de febrero de 2026  
**Estado**: ✅ Compilado y Funcional  
**Mantenido por**: Equipo de Desarrollo

