'use client';

/**
 * Botón para resetear la solicitud de docente (solo para desarrollo)
 */

import { useUser } from '@/firebase/provider';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { addDebugLog } from './DebugPanel';

export default function ResetTeacherRequestButton() {
    const { user } = useUser();

    const handleReset = async () => {
        if (!user) {
            addDebugLog('error', 'No hay usuario logueado');
            alert('❌ No hay usuario logueado');
            return;
        }

        if (!confirm('¿Estás seguro de que quieres resetear tu solicitud de docente? Esto te permitirá enviar una nueva.')) {
            addDebugLog('info', 'Reset cancelado por el usuario');
            return;
        }

        try {
            addDebugLog('info', `Reseteando solicitud para usuario: ${user.email}`);
            const userRef = doc(db, 'users', user.uid, 'profile', 'data');

            await updateDoc(userRef, {
                teacherRequest: deleteField()
            });

            addDebugLog('success', 'Solicitud reseteada exitosamente');
            alert('✅ Solicitud reseteada! La página se recargará en 2 segundos para que veas los cambios.');

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            addDebugLog('error', 'Error al resetear solicitud', error);
            console.error('❌ Error:', error);
            alert(`Error al resetear: ${error}`);
        }
    };

    return (
        <button
            onClick={handleReset}
            className="fixed bottom-36 right-4 z-50 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-red-700"
            title="Resetear solicitud de docente"
        >
            🔄 Reset Solicitud
        </button>
    );
}
