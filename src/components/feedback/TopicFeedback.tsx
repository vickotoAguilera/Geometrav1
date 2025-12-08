'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface TopicFeedbackProps {
    temaId: string;
    temaNombre: string;
}

export default function TopicFeedback({ temaId, temaNombre }: TopicFeedbackProps) {
    const { user } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [gusto, setGusto] = useState<boolean | null>(null);
    const [claridad, setClaridad] = useState<number>(5);
    const [comentario, setComentario] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleLike = (liked: boolean) => {
        setGusto(liked);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!user || gusto === null) return;

        try {
            await addDoc(collection(db, 'feedback_temas'), {
                userId: user.uid,
                temaId,
                temaNombre,
                gusto,
                claridad,
                comentario: comentario.trim() || null,
                fecha: serverTimestamp()
            });

            setSubmitted(true);
        } catch (error) {
            console.error('Error enviando feedback del tema:', error);
        }
    };

    if (submitted) {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
                <div className="mb-2 text-4xl">✨</div>
                <p className="font-medium text-green-900">
                    ¡Gracias por tu feedback!
                </p>
                <p className="text-sm text-green-700">
                    Nos ayuda a mejorar el contenido.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                ¿Te ayudó este tema?
            </h3>

            {!showForm ? (
                <div className="flex gap-3">
                    <button
                        onClick={() => handleLike(true)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-3 font-medium text-green-700 transition-all hover:bg-green-50 hover:border-green-400"
                    >
                        <ThumbsUp className="h-5 w-5" />
                        Sí, me ayudó
                    </button>
                    <button
                        onClick={() => handleLike(false)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 font-medium text-red-700 transition-all hover:bg-red-50 hover:border-red-400"
                    >
                        <ThumbsDown className="h-5 w-5" />
                        No mucho
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Claridad */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            ¿Qué tan claro fue?
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setClaridad(value)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-7 w-7 ${value <= claridad
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comentario opcional */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            💬 Sugerencias (opcional)
                        </label>
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            rows={3}
                            placeholder="¿Qué faltó o qué sobró?"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    {/* Botón enviar */}
                    <button
                        onClick={handleSubmit}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Enviar Feedback
                    </button>
                </div>
            )}
        </div>
    );
}
