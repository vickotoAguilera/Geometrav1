# 🔧 Script de Configuración de Variables de Entorno - Geometra

## 📍 Ubicación
Este script está guardado en: `/home/vickoto/Documentos/setup-env-geometra.sh`

## 📋 ¿Qué hace este script?

Configura automáticamente **todas las variables de entorno** necesarias para el proyecto Geometra:

### Variables incluidas:

#### 📱 Firebase (7 variables)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

#### 📧 Resend (1 variable)
- `RESEND_API_KEY`

#### ☁️ R2/Cloudflare Storage (4 variables)
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

**Total: 12 variables de entorno**

## 🚀 Cómo usar el script

### Opción 1: Configurar el proyecto actual
```bash
cd ~/Documentos
./setup-env-geometra.sh
```

### Opción 2: Configurar un proyecto en otra ubicación
```bash
cd ~/Documentos
./setup-env-geometra.sh /ruta/a/otro/proyecto
```

## ✨ Características

- ✅ **Backup automático**: Crea un backup del archivo `.env.local` existente antes de modificarlo
- ✅ **Actualización inteligente**: Si una variable ya existe, la actualiza; si no, la agrega
- ✅ **Mensajes informativos**: Te muestra qué variables se agregaron o actualizaron
- ✅ **Colores**: Output con colores para mejor legibilidad

## ⚠️ Importante

Después de ejecutar el script, **debes reiniciar el servidor de desarrollo**:

```bash
# Detén el servidor (Ctrl+C)
# Luego ejecuta:
npm run dev
```

## 📝 Ejemplo de uso

```bash
$ cd ~/Documentos
$ ./setup-env-geometra.sh

============================================
  Configuración de Variables de Entorno
  Proyecto: Geometra
============================================

✅ Backup creado: .env.local.backup.20251129_101234

Configurando variables de entorno...

📱 Configurando Firebase...
➕ Agregado: NEXT_PUBLIC_FIREBASE_API_KEY
➕ Agregado: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
...

📧 Configurando Resend...
➕ Agregado: RESEND_API_KEY

☁️  Configurando R2/Cloudflare...
➕ Agregado: R2_ACCOUNT_ID
...

============================================
✅ Configuración completada exitosamente
============================================
```

## 🔐 Seguridad

**IMPORTANTE**: Este script contiene credenciales sensibles. 

- ❌ **NO** lo subas a GitHub
- ❌ **NO** lo compartas públicamente
- ✅ Guárdalo en una ubicación segura fuera del proyecto
- ✅ Considera encriptarlo si lo guardas en la nube

## 📞 Soporte

Si necesitas agregar más variables o modificar las existentes, edita el script directamente en la sección correspondiente (Firebase, Resend, o R2).
