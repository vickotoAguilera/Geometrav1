'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { ProblemaIA } from '@/types/feedback';

interface AIFeedbackProps {
    conversacionId: string;
    mensajeId: string;
    flujo: string;
}

export default function AIFeedback({ conversacionId, mensajeId, flujo }: AIFeedbackProps) {
    const { user } = useAuth();
    const [feedback, setFeedback] = useState<boolean | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [problema, setProblema] = useState<ProblemaIA>('otro');
    const [comentario, setComentario] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFeedback = async (util: boolean) => {
        if (!user) return;

        setFeedback(util);

        if (util) {
            // Feedback positivo: enviar directamente
            try {
                await addDoc(collection(db, 'feedback_ia'), {
                    userId: user.uid,
                    conversacionId,
                    mensajeId,
                    flujo,
                    util: true,
                    fecha: serverTimestamp()
                });
            } catch (error) {
                console.error('Error enviando feedback de IA:', error);
            }
        } else {
            // Feedback negativo: mostrar modal para detalles
            setShowModal(true);
        }
    };

    const handleSubmitNegative = async () => {
        if (!user) return;

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'feedback_ia'), {
                userId: user.uid,
                conversacionId,
                mensajeId,
                flujo,
                util: false,
                problema,
                comentario: comentario.trim() || null,
                fecha: serverTimestamp()
            });

            setShowModal(false);
        } catch (error) {
            console.error('Error enviando feedback de IA:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Botones inline */}
            <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">¿Te ayudó esta respuesta?</span>
                <button
                    onClick={() => handleFeedback(true)}
                    disabled={feedback !== null}
                    className={`rounded p-1 transition-colors ${feedback === true
                            ? 'bg-green-100 text-green-600'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-green-600'
                        } disabled:cursor-not-allowed`}
                    title="Útil"
                >
                    <ThumbsUp className="h-4 w-4" />
                </button>
                <button
                    onClick={() => handleFeedback(false)}
                    disabled={feedback !== null}
                    className={`rounded p-1 transition-colors ${feedback === false
                            ? 'bg-red-100 text-red-600'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-red-600'
                        } disabled:cursor-not-allowed`}
                    title="No útil"
                >
                    <ThumbsDown className="h-4 w-4" />
                </button>
            </div>

            {/* Modal para feedback negativo */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                ¿Qué salió mal?
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Tipo de problema */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tipo de problema
                                </label>
                                <select
                                    value={problema}
                                    onChange={(e) => setProblema(e.target.value as ProblemaIA)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="incorrecto">❌ Respuesta incorrecta</option>
                                    <option value="confuso">🤔 Respuesta confusa</option>
                                    <option value="incompleto">📝 Respuesta incompleta</option>
                                    <option value="otro">🔧 Otro problema</option>
                                </select>
                            </div>

                            {/* Comentario */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Cuéntanos más (opcional)
                                </label>
                                <textarea
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    rows={3}
                                    placeholder="Describe el problema..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmitNegative}
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
