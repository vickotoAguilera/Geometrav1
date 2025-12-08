# Página de Prueba: Integración Google Drive

**URL:** `/test-drive`

## 🎯 Propósito

Página aislada para probar la integración con Google Drive antes de integrarla al chat principal.

## ✨ Funcionalidades

1. **Listar archivos** de Google Drive del usuario
2. **Procesar archivos** (PDFs, imágenes, DOCX)
3. **Ver resultados** del procesamiento
4. **Debug info** para troubleshooting

## 🚀 Cómo Usar

1. Inicia sesión en la aplicación
2. Ve a `/test-drive`
3. Haz clic en "Listar Archivos de Google Drive"
4. Selecciona un archivo y haz clic en "Procesar"
5. Observa el resultado

## 📋 Qué Probar

### ✅ Casos de Éxito

- [ ] Listar archivos de Drive
- [ ] Procesar un PDF
- [ ] Procesar una imagen
- [ ] Procesar un DOCX
- [ ] Ver mensaje de éxito con ID

### ⚠️ Casos de Error

- [ ] Sin permisos de Drive (debería pedir permisos)
- [ ] Archivo muy grande (>5MB)
- [ ] Tipo de archivo no soportado
- [ ] Sin conexión a internet

## 🔍 Qué Observar

1. **En la consola del navegador:**
   - Logs de procesamiento
   - Errores de API
   - Access token

2. **En Firestore:**
   - Nuevo documento en `users/{userId}/messages`
   - Campos: `source: 'google-drive'`, `driveFileId`, etc.

3. **En la UI:**
   - Estados de carga
   - Mensajes de error claros
   - Información del archivo

## 🐛 Problemas Conocidos

1. **Access Token:** Actualmente usa ID token en lugar de OAuth access token
   - **Solución temporal:** Funciona para testing básico
   - **Solución final:** Implementar flujo OAuth completo

2. **Versión de Node:** Warnings sobre Node v18 vs v20
   - **Impacto:** Ninguno, funciona correctamente

## 📝 Notas

- Esta página NO afecta el chat principal
- Los archivos procesados SÍ se guardan en Firestore
- Puedes eliminar esta página después de las pruebas

## 🔗 Archivos Relacionados

- `/src/app/test-drive/page.tsx` - Página de prueba
- `/src/app/actions.ts` - Server action
- `/src/lib/file-processor.ts` - Orquestador
- `/src/lib/processors/*` - Procesadores específicos
