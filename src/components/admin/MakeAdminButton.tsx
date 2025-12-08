'use client';

/**
 * Componente temporal para hacer admin al usuario actual
 * Agregar a cualquier página y hacer clic en el botón
 */

import { useUser } from '@/firebase/provider';

export default function MakeAdminButton() {
    const { user, isUserLoading } = useUser();

    const handleMakeAdmin = async () => {
        if (!user) {
            alert('❌ No hay usuario logueado. Por favor inicia sesión primero.');
            return;
        }

        try {
            console.log('👤 Usuario actual:', user.uid, user.email);

            const response = await fetch('/api/make-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Ahora eres administrador! Recarga la página.');
                window.location.reload();
            } else {
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert(`Error al hacer admin: ${error}`);
        }
    };

    // No mostrar el botón si está cargando o en producción
    if (isUserLoading || process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <button
            onClick={handleMakeAdmin}
            className="fixed bottom-4 right-4 z-50 rounded-lg bg-purple-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-purple-700"
            title={user ? `Hacer admin a ${user.email}` : 'Debes iniciar sesión primero'}
        >
            🔑 Hacerme Admin
        </button>
    );
}
