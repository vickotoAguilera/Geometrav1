# Plan de Implementación: Perfil de Usuario con IA Adaptativa

## 📋 RESUMEN EJECUTIVO

Crear un **espacio personal del usuario** que incluya:
- Perfil personalizable con foto (almacenada en Cloudflare R2)
- Evaluación de nivel matemático mediante IA
- IA personal adaptativa que genera ejercicios y pruebas según áreas débiles
- Dashboard de progreso y estadísticas
- Sistema de recomendaciones inteligente

---

## 🎯 OBJETIVOS

1. **Perfil de Usuario Completo**: Foto, datos personales, preferencias
2. **Evaluación Inicial de Nivel**: IA determina nivel matemático del usuario
3. **IA Tutor Personal**: Asistente dedicado que conoce las fortalezas/debilidades
4. **Generación Adaptativa**: Ejercicios y pruebas personalizadas
5. **Almacenamiento R2**: Fotos de perfil en Cloudflare R2
6. **Dashboard Personal**: Visualización de progreso y estadísticas

---

## 🏗️ ARQUITECTURA GENERAL

### Nueva Ruta
```
/perfil
  ├── /perfil (Dashboard principal)
  ├── /perfil/editar (Editar información)
  ├── /perfil/evaluacion (Test inicial de nivel)
  ├── /perfil/mi-tutor (IA personal adaptativa)
  └── /perfil/estadisticas (Análisis detallado)
```

### Estructura de Datos en Firestore
```typescript
users/{userId}/
  ├── profile/
  │   ├── displayName: string
  │   ├── photoURL: string (URL de R2)
  │   ├── bio: string
  │   ├── grade: string (ej: "3° Medio")
  │   ├── goals: string[]
  │   └── preferences: object
  │
  ├── mathLevel/
  │   ├── overall: number (1-100)
  │   ├── algebra: number
  │   ├── geometry: number
  │   ├── calculus: number
  │   ├── trigonometry: number
  │   ├── statistics: number
  │   ├── lastEvaluated: timestamp
  │   └── evaluationHistory: array
  │
  ├── learningProfile/
  │   ├── strengths: string[] (temas dominados)
  │   ├── weaknesses: string[] (temas a reforzar)
  │   ├── learningStyle: string (visual/auditivo/kinestésico)
  │   ├── preferredDifficulty: string (fácil/medio/difícil)
  │   └── studyGoals: object
  │
  ├── progress/
  │   ├── totalPoints: number
  │   ├── level: number
  │   ├── streak: number (días consecutivos)
  │   ├── exercisesCompleted: number
  │   ├── testsCompleted: number
  │   ├── averageScore: number
  │   └── lastActivity: timestamp
  │
  └── personalTutor/
      ├── conversationHistory: array
      ├── recommendedTopics: string[]
      ├── generatedExercises: array
      └── adaptiveSettings: object
```

---

## 📝 PLAN PASO A PASO

### **FASE 1: Configuración de Cloudflare R2** (1-2 días)

#### Paso 1.1: Configurar R2 en Cloudflare
- [ ] Acceder al dashboard de Cloudflare
- [ ] Crear bucket R2 llamado `geometra-user-profiles`
- [ ] Configurar CORS para permitir uploads desde la app
- [ ] Obtener credenciales (Access Key ID, Secret Access Key)
- [ ] Configurar dominio público para acceder a las imágenes

#### Paso 1.2: Configurar Variables de Entorno
- [ ] Agregar a `.env.local`:
  ```env
  R2_ACCOUNT_ID=tu_account_id
  R2_ACCESS_KEY_ID=tu_access_key
  R2_SECRET_ACCESS_KEY=tu_secret_key
  R2_BUCKET_NAME=geometra-user-profiles
  R2_PUBLIC_URL=https://tu-dominio.r2.dev
  ```

#### Paso 1.3: Instalar Dependencias
- [ ] Instalar SDK de AWS S3 (compatible con R2):
  ```bash
  npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  ```

#### Paso 1.4: Crear Utilidad de Upload
- [ ] Crear archivo `src/lib/r2-upload.ts`
- [ ] Implementar funciones:
  - `uploadProfileImage(file: File, userId: string): Promise<string>`
  - `deleteProfileImage(imageUrl: string): Promise<void>`
  - `getPresignedUrl(key: string): Promise<string>`

---

### **FASE 2: Modelo de Datos y Firestore** (1-2 días)

#### Paso 2.1: Crear Tipos TypeScript
- [ ] Crear archivo `src/types/user-profile.ts`
- [ ] Definir interfaces:
  ```typescript
  interface UserProfile {
    displayName: string;
    photoURL: string;
    bio: string;
    grade: string;
    goals: string[];
    preferences: UserPreferences;
  }
  
  interface MathLevel {
    overall: number;
    algebra: number;
    geometry: number;
    calculus: number;
    trigonometry: number;
    statistics: number;
    lastEvaluated: Timestamp;
  }
  
  interface LearningProfile {
    strengths: string[];
    weaknesses: string[];
    learningStyle: 'visual' | 'auditivo' | 'kinestésico';
    preferredDifficulty: 'fácil' | 'medio' | 'difícil';
  }
  
  interface UserProgress {
    totalPoints: number;
    level: number;
    streak: number;
    exercisesCompleted: number;
    testsCompleted: number;
    averageScore: number;
  }
  ```

#### Paso 2.2: Crear Reglas de Firestore
- [ ] Actualizar `firestore.rules`:
  ```
  match /users/{userId}/profile/{document=**} {
    allow read: if request.auth != null;
    allow write: if request.auth.uid == userId;
  }
  
  match /users/{userId}/mathLevel/{document=**} {
    allow read: if request.auth.uid == userId;
    allow write: if request.auth.uid == userId;
  }
  ```

#### Paso 2.3: Crear Hooks de Firebase
- [ ] Crear `src/firebase/hooks/use-user-profile.ts`
- [ ] Crear `src/firebase/hooks/use-math-level.ts`
- [ ] Crear `src/firebase/hooks/use-progress.ts`

---

### **FASE 3: IA de Evaluación de Nivel** (2-3 días)

#### Paso 3.1: Crear Flow de Evaluación
- [ ] Crear archivo `src/ai/flows/evaluacion-nivel-flow.ts`
- [ ] Implementar lógica:
  - Generar 20 preguntas de diagnóstico (4 por área)
  - Dificultad progresiva (fácil → difícil)
  - Evaluar respuestas y calcular nivel por área
  - Generar reporte detallado

#### Paso 3.2: Crear Server Action
- [ ] Crear `src/app/evaluacion-actions.ts`
- [ ] Funciones:
  - `generateEvaluationTest(): Promise<Question[]>`
  - `evaluateUserLevel(answers: Answer[]): Promise<MathLevel>`
  - `saveEvaluationResults(userId: string, results: MathLevel)`

#### Paso 3.3: Crear Componente de Evaluación
- [ ] Crear `src/components/evaluacion-nivel.tsx`
- [ ] Interfaz:
  - Introducción y explicación
  - Presentación de preguntas una por una
  - Barra de progreso
  - Resultados visuales con gráficos
  - Botón para guardar y continuar

---

### **FASE 4: IA Tutor Personal Adaptativa** (3-4 días)

#### Paso 4.1: Crear Flow del Tutor Personal
- [ ] Crear archivo `src/ai/flows/tutor-personal-flow.ts`
- [ ] System Prompt especializado:
  ```
  Eres el tutor personal de [Nombre]. Conoces su nivel matemático:
  - Álgebra: [X]/100
  - Geometría: [Y]/100
  - Fortalezas: [lista]
  - Debilidades: [lista]
  
  Tu misión es:
  1. Generar ejercicios enfocados en sus áreas débiles
  2. Ajustar dificultad según su progreso
  3. Celebrar sus logros y motivar
  4. Sugerir rutas de aprendizaje personalizadas
  ```

#### Paso 4.2: Crear Generador de Ejercicios Adaptativos
- [ ] Crear `src/ai/flows/ejercicios-adaptativos-flow.ts`
- [ ] Funciones:
  - `generateAdaptiveExercises(topic: string, level: number, count: number)`
  - `adjustDifficulty(userPerformance: number, currentLevel: number)`
  - `recommendNextTopics(learningProfile: LearningProfile)`

#### Paso 4.3: Crear Componente del Tutor Personal
- [ ] Crear `src/components/tutor-personal-chat.tsx`
- [ ] Características:
  - Chat dedicado (separado del asistente principal)
  - Contexto persistente del perfil del usuario
  - Botones rápidos: "Generar ejercicios", "Recomiéndame un tema", "Evaluar mi progreso"
  - Visualización de ejercicios generados
  - Sistema de verificación y feedback

---

### **FASE 5: Interfaz de Perfil de Usuario** (3-4 días)

#### Paso 5.1: Crear Página Principal del Perfil
- [ ] Crear `src/app/perfil/page.tsx`
- [ ] Secciones:
  - **Header**: Foto de perfil, nombre, nivel, puntos
  - **Resumen**: Racha, ejercicios completados, promedio
  - **Progreso por Área**: Gráfico de radar con 6 áreas
  - **Actividad Reciente**: Timeline de últimas acciones
  - **Accesos Rápidos**: Botones a Mi Tutor, Evaluación, Estadísticas

#### Paso 5.2: Crear Página de Edición
- [ ] Crear `src/app/perfil/editar/page.tsx`
- [ ] Formulario con:
  - Upload de foto (con preview y crop)
  - Nombre y bio
  - Curso/Grado
  - Objetivos de aprendizaje
  - Preferencias (tema visual, notificaciones)
  - Botón "Guardar cambios"

#### Paso 5.3: Crear Componente de Upload de Foto
- [ ] Crear `src/components/profile-photo-upload.tsx`
- [ ] Características:
  - Drag & drop o click para seleccionar
  - Preview de imagen
  - Crop/resize antes de subir
  - Validación (tamaño máximo 5MB, formatos permitidos)
  - Barra de progreso durante upload
  - Manejo de errores

#### Paso 5.4: Crear Página de Estadísticas
- [ ] Crear `src/app/perfil/estadisticas/page.tsx`
- [ ] Visualizaciones:
  - Gráfico de progreso temporal (últimos 30 días)
  - Distribución de tiempo por tema (pie chart)
  - Evolución de nivel (line chart)
  - Comparación con objetivos
  - Heatmap de actividad (estilo GitHub)

---

### **FASE 6: Dashboard de Progreso** (2-3 días)

#### Paso 6.1: Crear Sistema de Puntos
- [ ] Crear `src/lib/points-system.ts`
- [ ] Reglas:
  - Ejercicio completado: +10 puntos
  - Prueba completada: +50 puntos
  - Racha diaria: +5 puntos
  - Perfecto en prueba: +100 puntos
  - Nivel subido: +200 puntos

#### Paso 6.2: Crear Sistema de Niveles
- [ ] Niveles basados en puntos:
  ```typescript
  const LEVELS = [
    { level: 1, name: 'Principiante', minPoints: 0 },
    { level: 2, name: 'Aprendiz', minPoints: 100 },
    { level: 3, name: 'Estudiante', minPoints: 300 },
    { level: 4, name: 'Intermedio', minPoints: 600 },
    { level: 5, name: 'Avanzado', minPoints: 1000 },
    { level: 6, name: 'Experto', minPoints: 1500 },
    { level: 7, name: 'Maestro', minPoints: 2500 },
  ];
  ```

#### Paso 6.3: Crear Componente de Progreso Visual
- [ ] Crear `src/components/progress-dashboard.tsx`
- [ ] Elementos:
  - Barra de progreso de nivel con animación
  - Cards con métricas clave
  - Gráficos interactivos (usando recharts)
  - Badges de logros desbloqueados

---

### **FASE 7: Página del Tutor Personal** (2-3 días)

#### Paso 7.1: Crear Página del Tutor
- [ ] Crear `src/app/perfil/mi-tutor/page.tsx`
- [ ] Layout:
  - Sidebar izquierdo: Perfil del tutor, recomendaciones
  - Centro: Chat con el tutor
  - Sidebar derecho: Ejercicios generados, progreso

#### Paso 7.2: Crear Componente de Recomendaciones
- [ ] Crear `src/components/tutor-recommendations.tsx`
- [ ] Mostrar:
  - "Temas recomendados para ti"
  - "Ejercicios pendientes"
  - "Próximo hito"
  - Botones de acción rápida

#### Paso 7.3: Crear Componente de Ejercicios Generados
- [ ] Crear `src/components/adaptive-exercises.tsx`
- [ ] Funcionalidades:
  - Lista de ejercicios generados por la IA
  - Resolver en línea
  - Verificación automática
  - Feedback inmediato
  - Solicitar más ejercicios similares

---

### **FASE 8: Integración y Pulido** (2-3 días)

#### Paso 8.1: Conectar con Sistema Existente
- [ ] Actualizar `src/components/header.tsx`:
  - Agregar link al perfil en el menú de usuario
  - Mostrar foto de perfil en lugar de avatar genérico
  - Badge con nivel del usuario

#### Paso 8.2: Actualizar Sistema de Puntos en Módulos Existentes
- [ ] Modificar `ensayo-interactivo.tsx`:
  - Otorgar puntos al completar pruebas
  - Actualizar progreso en Firestore
- [ ] Modificar `paes-interactivo.tsx`:
  - Otorgar puntos por pruebas PAES
- [ ] Modificar componentes de ejercicios:
  - Otorgar puntos por ejercicios completados

#### Paso 8.3: Crear Notificaciones de Logros
- [ ] Crear `src/components/achievement-toast.tsx`
- [ ] Mostrar cuando:
  - Subes de nivel
  - Alcanzas una racha de 7 días
  - Completas 10 ejercicios
  - Obtienes puntaje perfecto

#### Paso 8.4: Optimizaciones
- [ ] Implementar lazy loading de imágenes
- [ ] Cachear datos de perfil
- [ ] Optimizar queries de Firestore
- [ ] Agregar loading states

---

## 🗂️ ARCHIVOS A CREAR/MODIFICAR

### Nuevos Archivos (28 archivos)

#### Configuración y Utilidades
1. `src/lib/r2-upload.ts` - Utilidad para subir a R2
2. `src/lib/points-system.ts` - Sistema de puntos y niveles
3. `src/lib/image-utils.ts` - Crop, resize, validación de imágenes

#### Tipos
4. `src/types/user-profile.ts` - Interfaces del perfil

#### Hooks de Firebase
5. `src/firebase/hooks/use-user-profile.ts`
6. `src/firebase/hooks/use-math-level.ts`
7. `src/firebase/hooks/use-progress.ts`
8. `src/firebase/hooks/use-learning-profile.ts`

#### Flows de IA
9. `src/ai/flows/evaluacion-nivel-flow.ts` - Evaluación inicial
10. `src/ai/flows/tutor-personal-flow.ts` - IA del tutor personal
11. `src/ai/flows/ejercicios-adaptativos-flow.ts` - Generador adaptativo
12. `src/ai/flows/recomendaciones-flow.ts` - Sistema de recomendaciones

#### Server Actions
13. `src/app/evaluacion-actions.ts`
14. `src/app/profile-actions.ts`
15. `src/app/tutor-actions.ts`

#### Páginas
16. `src/app/perfil/page.tsx` - Dashboard principal
17. `src/app/perfil/editar/page.tsx` - Editar perfil
18. `src/app/perfil/evaluacion/page.tsx` - Test de nivel
19. `src/app/perfil/mi-tutor/page.tsx` - Tutor personal
20. `src/app/perfil/estadisticas/page.tsx` - Estadísticas detalladas
21. `src/app/perfil/layout.tsx` - Layout del perfil

#### Componentes
22. `src/components/profile-photo-upload.tsx` - Upload de foto
23. `src/components/progress-dashboard.tsx` - Dashboard de progreso
24. `src/components/evaluacion-nivel.tsx` - Componente de evaluación
25. `src/components/tutor-personal-chat.tsx` - Chat del tutor
26. `src/components/tutor-recommendations.tsx` - Recomendaciones
27. `src/components/adaptive-exercises.tsx` - Ejercicios adaptativos
28. `src/components/achievement-toast.tsx` - Notificaciones de logros

### Archivos a Modificar (8 archivos)

1. `.env.local` - Agregar credenciales de R2
2. `firestore.rules` - Reglas para nuevas colecciones
3. `package.json` - Agregar dependencias de AWS SDK
4. `src/components/header.tsx` - Integrar foto de perfil
5. `src/components/ensayo-interactivo.tsx` - Sistema de puntos
6. `src/components/paes-interactivo.tsx` - Sistema de puntos
7. `src/app/page.tsx` - Agregar link al perfil
8. `tailwind.config.ts` - Agregar colores para niveles

---

## 🎨 DISEÑO DE INTERFAZ

### Página Principal del Perfil (`/perfil`)

```
┌─────────────────────────────────────────────────────────┐
│ ← Volver                                    [⚙️ Editar] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────┐                                                 │
│  │ 📷 │  Juan Pérez                                     │
│  └────┘  Nivel 5 - Avanzado ⭐⭐⭐⭐⭐                    │
│          "Aprendiendo matemáticas paso a paso"          │
│          3° Medio | 1,250 puntos                        │
│                                                          │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │ 🔥 Racha     │ ✅ Ejercicios│ 📊 Promedio  │        │
│  │ 12 días      │ 145          │ 87%          │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                          │
│  📈 Tu Progreso por Área                                │
│  ┌────────────────────────────────────────────┐        │
│  │        Geometría                            │        │
│  │           /\                                │        │
│  │          /  \                               │        │
│  │  Álgebra    Cálculo                        │        │
│  │         \  /                                │        │
│  │          \/                                 │        │
│  │    Trigonometría                           │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  🎯 Accesos Rápidos                                     │
│  [🤖 Mi Tutor Personal] [📝 Evaluación] [📊 Stats]     │
│                                                          │
│  📅 Actividad Reciente                                  │
│  • Hace 2 horas: Completaste "Funciones Cuadráticas"   │
│  • Ayer: Prueba PAES M1 - 85%                          │
│  • Hace 3 días: Subiste a Nivel 5 🎉                   │
└─────────────────────────────────────────────────────────┘
```

### Página del Tutor Personal (`/perfil/mi-tutor`)

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 Mi Tutor Personal                                    │
├──────────┬────────────────────────────┬─────────────────┤
│          │                            │                 │
│ 👤 Tutor │  💬 Chat                   │ 📝 Ejercicios   │
│          │                            │                 │
│ Nivel:   │  Tutor: ¡Hola Juan! He    │ Generados para  │
│ Avanzado │  notado que te cuesta      │ ti:             │
│          │  trigonometría. Te         │                 │
│ Áreas    │  recomiendo practicar...   │ 1. Identidades  │
│ débiles: │                            │    trigonométr. │
│ • Trigo  │  Tú: ¿Puedes generarme    │    [Resolver]   │
│ • Límites│  ejercicios?               │                 │
│          │                            │ 2. Ley de senos │
│ Próximo  │  Tutor: ¡Claro! Mira el   │    [Resolver]   │
│ hito:    │  panel derecho →           │                 │
│ Dominar  │                            │ 3. Ángulos      │
│ Trigo    │  [Generar Ejercicios]     │    [Resolver]   │
│ (75%)    │  [Recomiéndame un tema]   │                 │
│          │  [Evaluar mi progreso]    │ [+ Más]         │
│          │                            │                 │
└──────────┴────────────────────────────┴─────────────────┘
```

---

## 🔧 CONFIGURACIÓN DE CLOUDFLARE R2

### Pasos Detallados

1. **Crear Bucket**:
   - Ir a Cloudflare Dashboard → R2
   - Click "Create bucket"
   - Nombre: `geometra-user-profiles`
   - Región: Automática

2. **Configurar CORS**:
   ```json
   [
     {
       "AllowedOrigins": ["https://tu-dominio.com", "http://localhost:9002"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. **Obtener Credenciales**:
   - R2 → Manage R2 API Tokens
   - Create API Token
   - Permisos: Read & Write
   - Guardar Access Key ID y Secret Access Key

4. **Configurar Dominio Público**:
   - R2 → Settings → Public Access
   - Connect Domain: `profiles.geometra.com`

---

## 📊 ESTIMACIÓN DE TIEMPO

| Fase | Descripción | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Configuración R2 | 1-2 días |
| 2 | Modelo de Datos | 1-2 días |
| 3 | IA Evaluación | 2-3 días |
| 4 | IA Tutor Personal | 3-4 días |
| 5 | Interfaz de Perfil | 3-4 días |
| 6 | Dashboard Progreso | 2-3 días |
| 7 | Página Tutor | 2-3 días |
| 8 | Integración | 2-3 días |
| **TOTAL** | | **16-24 días** |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Pre-requisitos
- [ ] Cuenta de Cloudflare con R2 habilitado
- [ ] Credenciales de R2 obtenidas
- [ ] Espacio en R2 verificado (suficiente para imágenes)

### Fase 1: R2
- [ ] Bucket creado y configurado
- [ ] CORS configurado
- [ ] Dominio público conectado
- [ ] Variables de entorno agregadas
- [ ] SDK instalado
- [ ] Utilidad de upload creada y probada

### Fase 2: Datos
- [ ] Tipos TypeScript definidos
- [ ] Reglas de Firestore actualizadas
- [ ] Hooks de Firebase creados
- [ ] Estructura de datos probada

### Fase 3: Evaluación
- [ ] Flow de evaluación creado
- [ ] Server actions implementadas
- [ ] Componente de evaluación creado
- [ ] Test de evaluación funcional

### Fase 4: Tutor IA
- [ ] Flow del tutor creado
- [ ] Generador adaptativo implementado
- [ ] Componente del tutor creado
- [ ] Sistema de recomendaciones funcional

### Fase 5: Interfaz
- [ ] Página principal del perfil
- [ ] Página de edición
- [ ] Upload de foto funcional
- [ ] Página de estadísticas

### Fase 6: Progreso
- [ ] Sistema de puntos implementado
- [ ] Sistema de niveles implementado
- [ ] Dashboard de progreso creado
- [ ] Visualizaciones funcionando

### Fase 7: Tutor Personal
- [ ] Página del tutor creada
- [ ] Recomendaciones funcionando
- [ ] Ejercicios adaptativos generándose
- [ ] Chat del tutor funcional

### Fase 8: Integración
- [ ] Header actualizado con foto
- [ ] Puntos otorgándose en módulos
- [ ] Notificaciones de logros
- [ ] Optimizaciones aplicadas
- [ ] Testing completo
- [ ] Documentación actualizada

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Configurar Cloudflare R2** (hoy)
2. **Crear estructura de datos en Firestore** (mañana)
3. **Implementar upload de foto de perfil** (día 3)
4. **Crear página básica de perfil** (día 4)
5. **Implementar IA de evaluación** (días 5-7)

---

## 📝 NOTAS IMPORTANTES

- **Privacidad**: Las fotos de perfil serán públicas (R2 público), asegurar que usuarios lo sepan
- **Límites de R2**: Verificar límites de la cuenta (requests, almacenamiento)
- **Optimización de imágenes**: Comprimir y redimensionar antes de subir (max 500x500px, 200KB)
- **Fallback**: Si R2 falla, usar avatar generado con iniciales
- **Seguridad**: Validar tipos de archivo en backend, no solo frontend
- **Costos**: R2 tiene capa gratuita generosa, pero monitorear uso

---

## 🎯 MÉTRICAS DE ÉXITO

- [ ] 90%+ de usuarios completan evaluación inicial
- [ ] 70%+ de usuarios suben foto de perfil
- [ ] 80%+ de usuarios interactúan con tutor personal
- [ ] Aumento de 50% en ejercicios completados
- [ ] Aumento de 30% en tiempo de sesión promedio
- [ ] NPS (Net Promoter Score) > 8/10

---

**Fecha de creación**: 2025-11-28  
**Versión**: 1.0  
**Autor**: Antigravity AI Assistant  
**Estado**: Planificación completa - Listo para implementación
