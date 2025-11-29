# Cómo Hacerte Administrador

## Método Rápido: Consola del Navegador

1. **Abre la aplicación** en tu navegador: http://localhost:9002
2. **Inicia sesión** con tu cuenta (contacto.geometra@gmail.com)
3. **Presiona F12** para abrir las herramientas de desarrollador
4. **Ve a la pestaña "Console"**
5. **Copia y pega este código completo:**

```javascript
// Importar las funciones necesarias
const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');

// Obtener el usuario actual
const auth = getAuth();
const user = auth.currentUser;

if (!user) {
    console.error('❌ No hay usuario logueado');
} else {
    console.log('👤 Usuario:', user.email);
    
    // Obtener Firestore desde la app actual
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = getFirestore();
    
    // Actualizar el rol
    const userRef = doc(db, 'users', user.uid, 'profile', 'data');
    await updateDoc(userRef, {
        role: 'admin',
        updatedAt: serverTimestamp()
    });
    
    console.log('✅ ¡Ahora eres administrador!');
    console.log('🔄 Recargando la página...');
    setTimeout(() => location.reload(), 1000);
}
```

6. **Presiona Enter**
7. **Espera 1 segundo** - La página se recargará automáticamente
8. **Ve a tu perfil**: http://localhost:9002/perfil
9. **Verás un botón morado/azul** que dice "Panel de Administración - Solicitudes de Docentes"
10. **Haz clic** en ese botón para gestionar las solicitudes

---

## ✅ Verificar que Eres Admin

Una vez recargada la página:
1. Ve a tu perfil: http://localhost:9002/perfil
2. Si eres admin, verás un botón grande con gradiente morado-azul en "Accesos Rápidos"
3. El botón dice: **"Panel de Administración - Solicitudes de Docentes"**

---

## 🎯 Usar el Panel de Admin

1. Haz clic en el botón del panel de administración
2. Verás todas las solicitudes de docentes
3. Puedes filtrar por: Todas, Pendientes, Aprobadas, Rechazadas
4. Para cada solicitud pendiente:
   - **Aprobar**: Convierte al usuario en docente
   - **Rechazar**: Escribe una razón y rechaza la solicitud

---

## 🔧 Si el Código No Funciona

Usa este código más simple (requiere que estés en la página de la app):

```javascript
// Versión simplificada
fetch('/api/make-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}).then(() => {
    alert('✅ Ahora eres admin!');
    location.reload();
});
```

**NOTA:** Este método requiere crear un endpoint API adicional. Si prefieres este método, avísame y lo creo.

---

## 📱 Ubicación del Botón de Admin

El botón aparece en tu perfil en la sección "Accesos Rápidos", justo arriba de:
- Evaluación de Nivel
- Mi Tutor Personal
- Estadísticas Detalladas
- Continuar Estudiando

Es un botón grande con gradiente morado-azul y un ícono de escudo 🛡️
