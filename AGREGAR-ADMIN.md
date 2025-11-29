# Agregar Usuario a Colección de Admins

## Método Rápido: Consola del Navegador

1. **Abre la aplicación** en tu navegador: http://localhost:9002
2. **Inicia sesión** con contacto.geometra@gmail.com
3. **Presiona F12** para abrir las herramientas de desarrollador
4. **Ve a la pestaña "Console"**
5. **Copia y pega este código completo:**

```javascript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (!user) {
    console.error('❌ No hay usuario logueado');
} else {
    console.log('👤 Usuario:', user.email, user.uid);
    
    // Agregar a la colección de admins
    await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        role: 'admin'
    });
    
    console.log('✅ Usuario agregado a la colección de admins!');
    console.log('🎯 Ahora puedes acceder al panel de admin');
    console.log('🔗 Ve a: http://localhost:9002/admin/teacher-requests');
}
```

6. **Presiona Enter**
7. **Deberías ver**: `✅ Usuario agregado a la colección de admins!`
8. **Ve al panel de admin**: http://localhost:9002/admin/teacher-requests
9. **Recarga la página** y deberías ver las solicitudes de docentes

---

## Verificar que Eres Admin

Para verificar que estás en la colección de admins, ejecuta esto en la consola:

```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

const adminDoc = await getDoc(doc(db, 'admins', user.uid));
if (adminDoc.exists()) {
    console.log('✅ Eres admin!', adminDoc.data());
} else {
    console.log('❌ No estás en la colección de admins');
}
```

---

## ¿Por Qué Esto?

Las reglas de Firestore verifican si tu usuario existe en la colección `/admins/{userId}`. Una vez que estés ahí, podrás:
- Listar todos los usuarios
- Ver todos los perfiles
- Acceder al panel de administración
- Aprobar/rechazar solicitudes de docentes
