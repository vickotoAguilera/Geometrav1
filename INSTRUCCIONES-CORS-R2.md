# Configuración de CORS para R2

Para permitir que la aplicación suba archivos desde el navegador, necesitas configurar CORS en tu bucket de Cloudflare R2.

## Pasos:

1. **Accede a tu dashboard de Cloudflare**
   - Ve a https://dash.cloudflare.com
   - Selecciona **R2 Object Storage** en el menú lateral

2. **Selecciona tu bucket**
   - Click en el bucket `geometra`

3. **Configura CORS**
   - Ve a **Settings** → **CORS Policy**
   - Click en **Edit CORS Policy** o **Add CORS Policy**

4. **Copia la configuración**
   - Copia el contenido del archivo `r2-cors.json` que está en la raíz del proyecto
   - Pégalo en el editor de CORS
   - Guarda los cambios

## Configuración CORS (ya está en r2-cors.json):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:9002",
      "https://*.vercel.app",
      "https://geometra.com",
      "https://*.geometra.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

## ¿Qué hace esta configuración?

- **AllowedOrigins**: Permite uploads desde localhost (desarrollo) y desde tu dominio de producción
- **AllowedMethods**: Permite las operaciones necesarias (subir, descargar, eliminar archivos)
- **AllowedHeaders**: Permite todos los headers necesarios
- **ExposeHeaders**: Expone el ETag para verificación de integridad
- **MaxAgeSeconds**: Cachea la configuración CORS por 1 hora

## Verificación

Una vez configurado CORS, puedes verificar que funciona:

1. Ejecuta el servidor de desarrollo: `npm run dev`
2. Intenta subir un archivo desde la aplicación
3. Si hay errores de CORS, verifica que la configuración se guardó correctamente

## Nota sobre dominios

Si cambias tu dominio de producción en el futuro, recuerda actualizar la lista de `AllowedOrigins` en la configuración CORS.
