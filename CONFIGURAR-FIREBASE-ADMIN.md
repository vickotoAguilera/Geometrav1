# Configurar Firebase Admin SDK

Para que el panel de administración funcione, necesitas configurar Firebase Admin SDK con credenciales de servicio.

## Pasos:

### 1. Obtener las credenciales de Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **geogebra-476523**
3. Ve a **Configuración del proyecto** (ícono de engranaje)
4. Ve a la pestaña **Cuentas de servicio**
5. Haz clic en **Generar nueva clave privada**
6. Se descargará un archivo JSON

### 2. Extraer las credenciales

Abre el archivo JSON descargado y copia estos valores:

```json
{
  "project_id": "tu-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@tu-project.iam.gserviceaccount.com"
}
```

### 3. Agregar al `.env.local`

Abre `/home/vickoto/Documentos/geometra/.env.local` y agrega:

```bash
# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@geogebra-476523.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...tu-clave-completa...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANTE:** 
- La clave privada debe estar entre comillas dobles
- Mantén los `\n` en la clave
- NO compartas estas credenciales públicamente

### 4. Reiniciar el servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
npm run dev
```

### 5. Probar

1. Ve a http://localhost:9002/admin/teacher-requests
2. Deberías ver las solicitudes de docentes

---

## Alternativa Temporal (Sin Admin SDK)

Si no quieres configurar Admin SDK ahora, puedo crear una solución temporal que lea directamente desde el cliente, pero tendrás que ajustar las reglas de Firestore para permitir que los admins lean todos los perfiles.

¿Qué prefieres?
