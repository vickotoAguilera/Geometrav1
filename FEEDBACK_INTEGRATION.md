# Guía de Integración - Sistema de Feedback

## 1. Integrar TopicFeedback en Páginas de Temas

### Ubicación
`/src/app/estudia/[...slug]/page.tsx`

### Código a agregar

```tsx
import TopicFeedback from '@/components/feedback/TopicFeedback';

export default async function StudyTopicPage({ params }: { params: { slug: string[] } }) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  // Crear ID único del tema
  const temaId = params.slug.join('/');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <article className="prose prose-invert lg:prose-xl max-w-none mx-auto bg-card p-8 rounded-lg">
          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>
        
        {/* AGREGAR FEEDBACK AQUÍ */}
        <div className="max-w-none mx-auto mt-8">
          <TopicFeedback 
            temaId={temaId}
            temaNombre={post.title}
          />
        </div>
      </main>
    </div>
  );
}
```

---

## 2. Integrar AIFeedback en Chat Assistant

### Ubicación
`/src/components/chat-assistant.tsx`

### Código a agregar

```tsx
import AIFeedback from '@/components/feedback/AIFeedback';

// Dentro del map de mensajes, después del contenido del mensaje del asistente:

{message.role === 'assistant' && message.content !== '...' && (
  <>
    {/* Botón de audio existente */}
    <div className='-mb-2 -mr-2 mt-2 flex justify-end'>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-7 w-7 text-muted-foreground"
        onClick={() => handlePlayAudio(message.id, message.content)}
        disabled={!!isGeneratingAudio}
      >
        {/* ... código del botón de audio ... */}
      </Button>
    </div>
    
    {/* AGREGAR FEEDBACK AQUÍ */}
    <AIFeedback
      conversacionId={user?.uid || 'anonymous'}
      mensajeId={message.id}
      flujo="math-assistant"
    />
  </>
)}
```

---

## 3. Configurar Admin en Firestore

### Paso 1: Ir a Firebase Console
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `geogebra-476523`
3. Ve a Firestore Database

### Paso 2: Crear colección `admins`
1. Click en "Iniciar colección"
2. ID de colección: `admins`
3. ID de documento: `[TU_USER_ID]` (obtener de Firebase Auth)
4. Agregar campo:
   - Campo: `email`
   - Tipo: `string`
   - Valor: `tu-email@example.com`
5. Agregar campo:
   - Campo: `role`
   - Tipo: `string`
   - Valor: `admin`

### Paso 3: Obtener tu User ID
```javascript
// En la consola del navegador (cuando estés logueado):
console.log(firebase.auth().currentUser.uid);
```

---

## 4. Desplegar Reglas de Firestore

### Opción A: Desde Firebase Console
1. Ve a Firestore Database → Reglas
2. Copia el contenido de `firestore.rules`
3. Pega y publica

### Opción B: Desde CLI
```bash
firebase deploy --only firestore:rules
```

---

## 5. Acceder al Dashboard de Admin

### URL
```
http://localhost:9002/admin/feedback
```

### Producción
```
https://tu-dominio.com/admin/feedback
```

### Protección (Opcional)
Agregar middleware para proteger la ruta:

```tsx
// /src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar si es ruta de admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Aquí puedes agregar lógica de autenticación
    // Por ahora, las reglas de Firestore protegen los datos
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

---

## 6. Testing Completo

### Test 1: Feedback General
1. ✅ Abrir cualquier página
2. ✅ Click en botón flotante (esquina inferior derecha)
3. ✅ Llenar formulario
4. ✅ Capturar screenshot (opcional)
5. ✅ Enviar
6. ✅ Verificar en Firestore: colección `feedback_general`

### Test 2: Feedback de Tema
1. ✅ Ir a cualquier tema de estudio
2. ✅ Scroll hasta el final
3. ✅ Click en 👍 o 👎
4. ✅ Dar rating de claridad
5. ✅ Agregar comentario (opcional)
6. ✅ Enviar
7. ✅ Verificar en Firestore: colección `feedback_temas`

### Test 3: Feedback de IA
1. ✅ Abrir chat con IA
2. ✅ Hacer una pregunta
3. ✅ Esperar respuesta
4. ✅ Click en 👍 (debe enviar directo)
5. ✅ Hacer otra pregunta
6. ✅ Click en 👎 (debe abrir modal)
7. ✅ Seleccionar tipo de problema
8. ✅ Enviar
9. ✅ Verificar en Firestore: colección `feedback_ia`

### Test 4: Dashboard Admin
1. ✅ Configurar usuario como admin en Firestore
2. ✅ Ir a `/admin/feedback`
3. ✅ Ver lista de feedback
4. ✅ Filtrar por tipo
5. ✅ Filtrar por estado
6. ✅ Cambiar estado de un feedback
7. ✅ Responder a un feedback
8. ✅ Verificar que se guardó la respuesta

---

## 7. Próximos Pasos Opcionales

### A. Notificaciones por Email
Crear Cloud Function para enviar emails:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

export const onFeedbackCreated = functions.firestore
  .document('feedback_general/{feedbackId}')
  .onCreate(async (snap, context) => {
    const feedback = snap.data();
    
    // Configurar transporter de email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tu-email@gmail.com',
        pass: 'tu-app-password'
      }
    });
    
    // Email a admin
    await transporter.sendMail({
      from: 'Geometra <noreply@geometra.com>',
      to: 'admin@geometra.com',
      subject: `Nuevo feedback: ${feedback.tipo}`,
      html: `
        <h2>Nuevo feedback recibido</h2>
        <p><strong>De:</strong> ${feedback.userEmail}</p>
        <p><strong>Tipo:</strong> ${feedback.tipo}</p>
        <p><strong>Rating:</strong> ${feedback.rating}/5</p>
        <p><strong>Comentario:</strong> ${feedback.comentario}</p>
      `
    });
    
    // Email de agradecimiento a usuario
    await transporter.sendMail({
      from: 'Geometra <noreply@geometra.com>',
      to: feedback.userEmail,
      subject: '¡Gracias por tu feedback!',
      html: `
        <h2>¡Gracias por ayudarnos a mejorar!</h2>
        <p>Hemos recibido tu feedback y lo revisaremos pronto.</p>
        <p>Tu opinión es muy valiosa para nosotros.</p>
      `
    });
  });
```

### B. Analytics de Feedback
Agregar tracking con Google Analytics:

```typescript
// En FeedbackModal.tsx
import { analytics } from '@/firebase/config';
import { logEvent } from 'firebase/analytics';

const handleSubmit = async (e: React.FormEvent) => {
  // ... código existente ...
  
  // Track evento
  logEvent(analytics, 'feedback_submitted', {
    tipo: tipo,
    rating: rating,
    tiene_screenshot: !!screenshot
  });
};
```

### C. Migrar Screenshots a Firebase Storage
Actualmente los screenshots se guardan en base64 en Firestore. Para optimizar:

```typescript
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/config';

const uploadScreenshot = async (base64: string): Promise<string> => {
  const storageRef = ref(storage, `feedback-screenshots/${Date.now()}.png`);
  await uploadString(storageRef, base64, 'data_url');
  return await getDownloadURL(storageRef);
};

// Usar en FeedbackModal:
let screenshotUrl = null;
if (screenshot) {
  screenshotUrl = await uploadScreenshot(screenshot);
}
```

---

## 8. Troubleshooting

### Problema: "Permission denied" al enviar feedback
**Solución**: Verificar que las reglas de Firestore estén desplegadas correctamente.

### Problema: No aparece el botón flotante
**Solución**: Verificar que `FeedbackButton` esté en el layout principal.

### Problema: Dashboard admin vacío
**Solución**: 
1. Verificar que tu usuario esté en la colección `admins`
2. Verificar que haya feedback en Firestore

### Problema: Screenshot no se captura
**Solución**: Verificar que `html2canvas` esté instalado: `npm install html2canvas`

---

## ✅ Checklist Final

- [ ] FeedbackButton visible en todas las páginas
- [ ] TopicFeedback integrado en páginas de temas
- [ ] AIFeedback integrado en chat
- [ ] Reglas de Firestore desplegadas
- [ ] Usuario admin configurado
- [ ] Dashboard admin accesible
- [ ] Todos los tests pasados
- [ ] (Opcional) Emails configurados
- [ ] (Opcional) Analytics configurado
- [ ] (Opcional) Screenshots en Storage

---

**Sistema de Feedback completamente funcional** ✨
