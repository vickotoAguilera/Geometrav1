'use client';

import { useState } from 'react';
import { X, Star, Camera, Send } from 'lucide-react';
import { useAuth } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { FeedbackType } from '@/types/feedback';
import html2canvas from 'html2canvas';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const { user } = useAuth();
    const [tipo, setTipo] = useState<FeedbackType>('mejora');
    const [rating, setRating] = useState<number>(5);
    const [titulo, setTitulo] = useState('');
    const [comentario, setComentario] = useState('');
    const [experiencia, setExperiencia] = useState('');
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    const handleCapture = async () => {
        try {
            const canvas = await html2canvas(document.body);
            const dataUrl = canvas.toDataURL('image/png');
            setScreenshot(dataUrl);
        } catch (error) {
            console.error('Error capturando pantalla:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'feedback_general'), {
                userId: user.uid,
                userEmail: user.email,
                tipo,
                rating,
                titulo,
                comentario,
                experiencia, // Nuevo campo
                screenshot,
                pagina: window.location.pathname,
                userAgent: navigator.userAgent,
                fecha: serverTimestamp(),
                estado: 'pendiente'
            });

            setShowSuccess(true);
            setTimeout(() => {
                onClose();
                setShowSuccess(false);
                // Reset form
                setTitulo('');
                setComentario('');
                setExperiencia('');
                setScreenshot(null);
                setRating(5);
            }, 2000);
        } catch (error) {
            console.error('Error enviando feedback:', error);
            alert('Hubo un error al enviar tu feedback. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
                    <div className="mb-4 text-6xl">✨</div>
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">
                        ¡Gracias por tu feedback!
                    </h3>
                    <p className="text-gray-600">
                        Tu opinión nos ayuda a mejorar Geometra cada día.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        ¿Cómo podemos mejorar? ✨
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Tipo de feedback */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Tipo de feedback
                        </label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as FeedbackType)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        >
                            <option value="bug">🐛 Reportar un error</option>
                            <option value="mejora">💡 Sugerir una mejora</option>
                            <option value="funcionalidad">✨ Nueva funcionalidad</option>
                            <option value="contenido">📚 Sobre el contenido</option>
                            <option value="otro">💭 Otro / Comentario General</option>
                        </select>
                    </div>

                    {/* Rating */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            ¿Qué tan satisfecho estás con Geometra?
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRating(value)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${value <= rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Título */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Título (opcional)
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: El botón de ayuda no funciona"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    {/* Comentario */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Cuéntanos más *
                        </label>
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            required
                            rows={3}
                            placeholder="Describe tu experiencia, sugerencia o problema..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    {/* Experiencia General (Nuevo campo) */}
                    <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
                        <label className="mb-2 block text-sm font-medium text-blue-900">
                            ¿Cómo ha sido tu experiencia general? (Opcional)
                        </label>
                        <p className="mb-2 text-xs text-blue-700">
                            Cuéntanos libremente qué piensas de la app, si te ha servido para tus estudios o qué impacto ha tenido.
                        </p>
                        <textarea
                            value={experiencia}
                            onChange={(e) => setExperiencia(e.target.value)}
                            rows={3}
                            placeholder="Me ha servido mucho para entender..."
                            className="w-full rounded-lg border border-blue-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                        />
                    </div>

                    {/* Screenshot */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={handleCapture}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <Camera className="h-4 w-4" />
                            {screenshot ? 'Captura tomada ✓' : 'Adjuntar captura de pantalla'}
                        </button>
                        {screenshot && (
                            <div className="mt-2">
                                <img
                                    src={screenshot}
                                    alt="Screenshot preview"
                                    className="h-32 rounded border border-gray-200 object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 sticky bottom-0 bg-white pt-2 pb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !comentario.trim()}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                'Enviando...'
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Enviar Feedback
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
