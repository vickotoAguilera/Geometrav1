'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/firebase/provider';
import type { FeedbackGeneral, FeedbackEstado, FeedbackType } from '@/types/feedback';
import { Star, Filter, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function FeedbackDashboard() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackGeneral[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTipo, setFilterTipo] = useState<FeedbackType | 'todos'>('todos');
    const [filterEstado, setFilterEstado] = useState<FeedbackEstado | 'todos'>('todos');
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackGeneral | null>(null);
    const [respuesta, setRespuesta] = useState('');

    useEffect(() => {
        loadFeedback();
    }, [filterTipo, filterEstado]);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            let q = query(
                collection(db, 'feedback_general'),
                orderBy('fecha', 'desc')
            );

            const snapshot = await getDocs(q);
            let data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                fecha: doc.data().fecha?.toDate() || new Date()
            })) as FeedbackGeneral[];

            // Filtrar en cliente
            if (filterTipo !== 'todos') {
                data = data.filter(f => f.tipo === filterTipo);
            }
            if (filterEstado !== 'todos') {
                data = data.filter(f => f.estado === filterEstado);
            }

            setFeedbacks(data);
        } catch (error) {
            console.error('Error cargando feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEstado = async (feedbackId: string, nuevoEstado: FeedbackEstado) => {
        try {
            await updateDoc(doc(db, 'feedback_general', feedbackId), {
                estado: nuevoEstado
            });
            loadFeedback();
        } catch (error) {
            console.error('Error actualizando estado:', error);
        }
    };

    const handleResponder = async () => {
        if (!selectedFeedback || !respuesta.trim()) return;

        try {
            await updateDoc(doc(db, 'feedback_general', selectedFeedback.id!), {
                respuesta_admin: respuesta,
                fecha_respuesta: new Date(),
                estado: 'resuelto'
            });
            setSelectedFeedback(null);
            setRespuesta('');
            loadFeedback();
        } catch (error) {
            console.error('Error respondiendo:', error);
        }
    };

    const getEstadoIcon = (estado: FeedbackEstado) => {
        switch (estado) {
            case 'pendiente': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'en_progreso': return <MessageSquare className="h-5 w-5 text-blue-500" />;
            case 'resuelto': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'descartado': return <XCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTipoEmoji = (tipo: FeedbackType) => {
        switch (tipo) {
            case 'bug': return '🐛';
            case 'mejora': return '💡';
            case 'funcionalidad': return '✨';
            case 'contenido': return '📚';
        }
    };

    const stats = {
        total: feedbacks.length,
        pendientes: feedbacks.filter(f => f.estado === 'pendiente').length,
        resueltos: feedbacks.filter(f => f.estado === 'resuelto').length,
        ratingPromedio: feedbacks.length > 0
            ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
            : '0'
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard de Feedback</h1>
                    <p className="text-gray-600">Gestiona el feedback de los usuarios</p>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm text-gray-600">Pendientes</div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pendientes}</div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm text-gray-600">Resueltos</div>
                        <div className="text-3xl font-bold text-green-600">{stats.resueltos}</div>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="text-sm text-gray-600">Rating Promedio</div>
                        <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold text-gray-900">{stats.ratingPromedio}</div>
                            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-4 rounded-lg bg-white p-4 shadow">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            value={filterTipo}
                            onChange={(e) => setFilterTipo(e.target.value as any)}
                            className="rounded border border-gray-300 px-3 py-2"
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="bug">🐛 Bugs</option>
                            <option value="mejora">💡 Mejoras</option>
                            <option value="funcionalidad">✨ Funcionalidades</option>
                            <option value="contenido">📚 Contenido</option>
                        </select>
                    </div>
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value as any)}
                        className="rounded border border-gray-300 px-3 py-2"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="pendiente">⏳ Pendientes</option>
                        <option value="en_progreso">🔄 En progreso</option>
                        <option value="resuelto">✅ Resueltos</option>
                        <option value="descartado">❌ Descartados</option>
                    </select>
                </div>

                {/* Feedback List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow">
                            <div className="text-gray-500">Cargando feedback...</div>
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow">
                            <div className="text-gray-500">No hay feedback con estos filtros</div>
                        </div>
                    ) : (
                        feedbacks.map((feedback) => (
                            <div key={feedback.id} className="rounded-lg bg-white p-6 shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className="text-2xl">{getTipoEmoji(feedback.tipo)}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {feedback.titulo || 'Sin título'}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span>{feedback.userEmail}</span>
                                                    <span>•</span>
                                                    <span>{feedback.fecha.toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{feedback.pagina}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-3 flex gap-1">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <Star
                                                    key={value}
                                                    className={`h-4 w-4 ${value <= feedback.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {/* Comentario */}
                                        <p className="mb-4 text-gray-700">{feedback.comentario}</p>

                                        {/* Screenshot */}
                                        {feedback.screenshot && (
                                            <div className="mb-4">
                                                <img
                                                    src={feedback.screenshot}
                                                    alt="Screenshot"
                                                    className="h-32 rounded border border-gray-200 object-cover cursor-pointer hover:opacity-80"
                                                    onClick={() => window.open(feedback.screenshot, '_blank')}
                                                />
                                            </div>
                                        )}

                                        {/* Respuesta admin */}
                                        {feedback.respuesta_admin && (
                                            <div className="mt-4 rounded-lg bg-blue-50 p-4">
                                                <div className="mb-1 text-sm font-medium text-blue-900">
                                                    Respuesta del equipo:
                                                </div>
                                                <p className="text-blue-800">{feedback.respuesta_admin}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Estado y acciones */}
                                    <div className="ml-4 flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            {getEstadoIcon(feedback.estado)}
                                            <span className="text-sm font-medium capitalize text-gray-700">
                                                {feedback.estado.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <select
                                            value={feedback.estado}
                                            onChange={(e) => handleUpdateEstado(feedback.id!, e.target.value as FeedbackEstado)}
                                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="en_progreso">En progreso</option>
                                            <option value="resuelto">Resuelto</option>
                                            <option value="descartado">Descartado</option>
                                        </select>

                                        {!feedback.respuesta_admin && (
                                            <button
                                                onClick={() => setSelectedFeedback(feedback)}
                                                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                            >
                                                Responder
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de respuesta */}
            {selectedFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Responder a {selectedFeedback.userEmail}
                        </h3>
                        <div className="mb-4 rounded-lg bg-gray-50 p-4">
                            <p className="text-gray-700">{selectedFeedback.comentario}</p>
                        </div>
                        <textarea
                            value={respuesta}
                            onChange={(e) => setRespuesta(e.target.value)}
                            rows={4}
                            placeholder="Escribe tu respuesta..."
                            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedFeedback(null);
                                    setRespuesta('');
                                }}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleResponder}
                                disabled={!respuesta.trim()}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                Enviar Respuesta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
