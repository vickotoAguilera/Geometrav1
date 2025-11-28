# Prueba Manual: Upload de Foto de Perfil a R2

## ✅ Estado: R2 Configurado y Código Habilitado

El sistema de upload de fotos de perfil a Cloudflare R2 está completamente configurado y listo para probar.

## 🧪 Cómo Probar

### 1. Iniciar el Servidor de Desarrollo

Si no está corriendo, ejecuta:
```bash
npm run dev
```

El servidor debería estar en: http://localhost:9002

### 2. Navegar a la Página de Editar Perfil

1. Abre tu navegador y ve a: http://localhost:9002
2. Inicia sesión con tu cuenta
3. Ve a tu perfil: http://localhost:9002/perfil
4. Click en el botón **"Editar"**
5. Deberías ver la página de editar perfil

### 3. Subir una Foto de Perfil

1. En la sección "Foto de Perfil", click en **"Cambiar Foto"**
2. Selecciona una imagen (JPG, PNG o WebP, máx. 5MB)
3. Espera a que se procese:
   - Verás un toast: "🔄 Optimizando imagen..."
   - Luego: "📤 Subiendo a R2..."
   - Finalmente: "✅ Foto subida a R2"
4. La imagen se optimizará automáticamente a 500x500px
5. Se subirá a R2 en la ruta: `profiles/{userId}/{timestamp}.jpg`

### 4. Verificar que se Guardó

1. Click en **"Guardar Cambios"**
2. Deberías ver: "✅ Perfil actualizado"
3. Vuelve a la página de perfil: http://localhost:9002/perfil
4. Tu nueva foto debería aparecer en el avatar

### 5. Verificar en R2

1. Ve a tu dashboard de Cloudflare R2
2. Abre el bucket `geometra`
3. Navega a la carpeta `profiles/{tu-user-id}/`
4. Deberías ver tu foto subida con un timestamp

### 6. Verificar en Firestore

1. Ve a Firebase Console → Firestore
2. Navega a: `users/{tu-user-id}/profile/data`
3. El campo `photoURL` debería tener la URL de R2:
   ```
   https://pub-2a83ab50446de777fc1800f1db8ad34c.r2.dev/profiles/{userId}/{timestamp}.jpg
   ```

## 🔍 Qué Verificar

### ✅ Checklist de Pruebas

- [ ] La imagen se optimiza correctamente (se ve el preview)
- [ ] Se muestra el toast de "Optimizando imagen"
- [ ] Se muestra el toast de "Subiendo a R2"
- [ ] Se muestra el toast de "Foto subida a R2"
- [ ] La foto aparece en el perfil después de guardar
- [ ] La foto está en R2 en la carpeta correcta
- [ ] La URL en Firestore es correcta
- [ ] La foto se carga correctamente desde R2 (no hay errores de CORS)

### 🐛 Posibles Errores

**Error: "Formato no permitido"**
- Solución: Usa solo JPG, PNG o WebP

**Error: "El archivo es demasiado grande"**
- Solución: La imagen debe ser menor a 5MB

**Error de CORS al cargar la imagen**
- Solución: Configura CORS en R2 siguiendo `INSTRUCCIONES-CORS-R2.md`

**Error: "No se pudo subir la foto"**
- Verifica que las credenciales de R2 en `.env.local` sean correctas
- Verifica que el bucket `geometra` exista
- Revisa la consola del navegador para más detalles

## 📊 Flujo Completo

```
Usuario selecciona imagen
    ↓
Validación (tipo, tamaño)
    ↓
Optimización en el cliente (resize a 500x500, compresión)
    ↓
Upload a R2 (server action)
    ↓
Actualización de Firestore (photoURL)
    ↓
Foto visible en perfil
```

## 🎯 Resultado Esperado

Al completar la prueba exitosamente:

1. ✅ La foto se sube a R2
2. ✅ La URL se guarda en Firestore
3. ✅ La foto aparece en el perfil del usuario
4. ✅ La foto se carga correctamente desde R2
5. ✅ No hay errores de CORS

## 📝 Notas

- Las fotos se optimizan automáticamente a 500x500px
- Se comprimen al 80% de calidad
- Se guardan siempre como JPG
- El nombre incluye un timestamp para evitar colisiones
- Las fotos antiguas NO se eliminan automáticamente (puedes hacerlo manualmente en R2)
