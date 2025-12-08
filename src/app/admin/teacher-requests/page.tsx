'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { CheckCircle, XCircle, Clock, Mail, User, Calendar, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DebugPanel, { addDebugLog } from '@/components/debug/DebugPanel';

interface TeacherRequest {
    userId: string;
    userEmail: string;
    userName: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    requestedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
}

export default function TeacherRequestsPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [requests, setRequests] = useState<TeacherRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminStatus();
    }, [user]);

    useEffect(() => {
        if (isAdmin) {
            loadRequests();
        }
    }, [isAdmin, filter]);

    const checkAdminStatus = async () => {
        if (isUserLoading) {
            return; // Esperar a que termine de cargar
        }

        if (!user) {
            console.log('❌ No user found, redirecting to home');
            router.push('/');
            return;
        }

        try {
            console.log('🔍 Checking admin status for user:', user.uid, user.email);
            const userDoc = await getDocs(
                query(collection(db, 'users', user.uid, 'profile'))
            );

            if (!userDoc.empty) {
                const userData = userDoc.docs[0].data();
                console.log('👤 User data:', userData);
                console.log('🔑 User role:', userData.role);

                if (userData.role === 'admin') {
                    console.log('✅ User is admin!');
                    setIsAdmin(true);
                } else {
                    console.log('❌ User is not admin, role:', userData.role);
                    router.push('/');
                }
            } else {
                console.log('❌ No profile found');
                router.push('/');
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            router.push('/');
        }
    };

    const loadRequests = async () => {
        setLoading(true);
        try {
            addDebugLog('info', `Cargando solicitudes con filtro: ${filter}`);

            // Usar collectionGroup para encontrar documentos 'profile' directamente
            // Esto evita problemas con documentos padre vacíos y es más eficiente
            const { collectionGroup } = await import('firebase/firestore');
            const profilesSnap = await getDocs(collectionGroup(db, 'profile'));

            addDebugLog('info', `Total perfiles encontrados: ${profilesSnap.size}`);

            const allRequests: TeacherRequest[] = [];

            for (const docSnap of profilesSnap.docs) {
                // El path es users/{userId}/profile/data
                // docSnap.ref.parent.parent.id debería ser userId
                const userId = docSnap.ref.parent.parent?.id;

                // Solo nos interesa el documento 'data'
                if (userId && docSnap.id === 'data') {
                    const profileData = docSnap.data();

                    addDebugLog('info', `Usuario: ${profileData.email}`, {
                        hasRequest: !!profileData.teacherRequest
                    });

                    if (profileData.teacherRequest) {
                        const request = profileData.teacherRequest;
                        addDebugLog('info', `Solicitud encontrada`, {
                            status: request.status,
                            reason: request.reason?.substring(0, 30) + '...'
                        });

                        // Filtrar según el estado seleccionado
                        if (filter === 'all' || request.status === filter) {
                            allRequests.push({
                                userId: userId,
                                userEmail: profileData.email || 'No disponible',
                                userName: profileData.displayName || profileData.nombre || 'Sin nombre',
                                status: request.status,
                                reason: request.reason,
                                requestedAt: request.requestedAt?.toDate() || new Date(),
                                reviewedAt: request.reviewedAt?.toDate(),
                                rejectionReason: request.rejectionReason,
                            });
                            addDebugLog('success', `Solicitud agregada de ${profileData.email}`);
                        } else {
                            addDebugLog('info', `Solicitud omitida (filtro no coincide): ${request.status} !== ${filter}`);
                        }
                    }
                }
            }

            // Ordenar por fecha (más recientes primero)
            allRequests.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

            addDebugLog('success', `Total solicitudes cargadas: ${allRequests.length}`);
            setRequests(allRequests);
        } catch (error) {
            addDebugLog('error', 'Error cargando solicitudes', error);
            console.error('Error loading requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request: TeacherRequest) => {
        try {
            const userRef = doc(db, 'users', request.userId, 'profile', 'data');

            await updateDoc(userRef, {
                role: 'teacher',
                'teacherRequest.status': 'approved',
                'teacherRequest.reviewedAt': serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            alert(`✅ ${request.userName} ahora es docente`);
            loadRequests();
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Error al aprobar la solicitud');
        }
    };

    const handleReject = async (request: TeacherRequest) => {
        if (!rejectionReason.trim()) {
            alert('Por favor, proporciona una razón para el rechazo');
            return;
        }

        try {
            const userRef = doc(db, 'users', request.userId, 'profile', 'data');

            await updateDoc(userRef, {
                'teacherRequest.status': 'rejected',
                'teacherRequest.reviewedAt': serverTimestamp(),
                'teacherRequest.rejectionReason': rejectionReason,
                updatedAt: serverTimestamp(),
            });

            alert(`❌ Solicitud rechazada`);
            setSelectedRequest(null);
            setRejectionReason('');
            loadRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Error al rechazar la solicitud');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                        <Clock className="h-3 w-3" />
                        Pendiente
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Aprobado
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                        <XCircle className="h-3 w-3" />
                        Rechazado
                    </span>
                );
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Docente</h1>
                    <p className="text-gray-600">Gestiona las solicitudes para convertirse en docente</p>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`rounded-lg px-4 py-2 font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`rounded-lg px-4 py-2 font-medium transition-colors ${filter === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`rounded-lg px-4 py-2 font-medium transition-colors ${filter === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Aprobadas
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`rounded-lg px-4 py-2 font-medium transition-colors ${filter === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Rechazadas
                    </button>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow">
                            <p className="text-gray-500">Cargando solicitudes...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow">
                            <p className="text-gray-500">No hay solicitudes con este filtro</p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div key={request.userId} className="rounded-lg bg-white p-6 shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-4 flex items-center gap-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {request.userName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="h-3 w-3" />
                                                    {request.userEmail}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            Solicitado: {request.requestedAt.toLocaleDateString('es-CL')}
                                        </div>

                                        <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                                                <MessageSquare className="h-4 w-4" />
                                                Razón:
                                            </div>
                                            <p className="text-gray-700">{request.reason}</p>
                                        </div>

                                        {request.rejectionReason && (
                                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                                                <div className="mb-1 text-sm font-medium text-red-800">
                                                    Razón del rechazo:
                                                </div>
                                                <p className="text-red-700">{request.rejectionReason}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4">{getStatusBadge(request.status)}</div>
                                </div>

                                {request.status === 'pending' && (
                                    <div className="mt-4 flex gap-3 border-t border-gray-200 pt-4">
                                        <button
                                            onClick={() => handleApprove(request)}
                                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Aprobar
                                        </button>
                                        <button
                                            onClick={() => setSelectedRequest(request)}
                                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="mb-4 text-xl font-bold text-gray-900">
                            Rechazar Solicitud
                        </h3>
                        <p className="mb-4 text-gray-600">
                            Proporciona una razón para rechazar la solicitud de{' '}
                            <strong>{selectedRequest.userName}</strong>
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Ej: No cumple con los requisitos mínimos..."
                            rows={4}
                            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSelectedRequest(null);
                                    setRejectionReason('');
                                }}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleReject(selectedRequest)}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Panel */}
            <DebugPanel />
        </div>
    );
}
