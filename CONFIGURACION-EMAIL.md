# Configuración de Email para Geometra

## 📧 Configuración de Resend

Para que los emails de feedback y solicitudes de docente lleguen a **contacto.geometra@gmail.com**, sigue estos pasos:

### 1. Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Haz clic en "Sign Up"
3. Regístrate con **contacto.geometra@gmail.com**
4. Verifica tu email

### 2. Obtener API Key

1. Inicia sesión en Resend
2. Ve a la sección **API Keys** en el menú lateral
3. Haz clic en **Create API Key**
4. Dale un nombre (ej: "Geometra Production")
5. Copia la API key (empieza con `re_`)

### 3. Configurar en el proyecto

Abre el archivo `.env.local` y reemplaza:

```bash
RESEND_API_KEY=your_resend_api_key_here
```

Por tu API key real:

```bash
RESEND_API_KEY=re_tu_api_key_aqui
```

### 4. Reiniciar el servidor

```bash
npm run dev
```

## ✅ Verificar que funciona

### Probar Feedback:
1. Abre la aplicación
2. Haz clic en el botón de feedback (esquina inferior derecha)
3. Llena el formulario y envía
4. Revisa **contacto.geometra@gmail.com** - deberías recibir un email

### Probar Solicitud de Docente:
1. Ve a tu perfil
2. Haz clic en "Solicitar ser Docente"
3. Llena el formulario y envía
4. Revisa **contacto.geometra@gmail.com** - deberías recibir un email

## 📊 Límites del plan gratuito

- **100 emails por día**
- **3,000 emails por mes**
- Suficiente para el proyecto mientras crece

## 🔧 Troubleshooting

### Los emails no llegan:
1. Verifica que la API key esté correcta en `.env.local`
2. Reinicia el servidor de desarrollo
3. Revisa la consola del navegador por errores
4. Revisa la carpeta de spam en Gmail

### Error "Invalid API key":
- Asegúrate de copiar la API key completa
- No incluyas espacios antes o después
- La API key debe empezar con `re_`

## 📝 Notas

- Los emails se envían desde `onboarding@resend.dev` (dominio verificado de Resend)
- Para usar un dominio personalizado (ej: `noreply@geometra.com`), necesitas verificar tu dominio en Resend
- Los emails se guardan en Firestore **y** se envían por email (doble respaldo)
