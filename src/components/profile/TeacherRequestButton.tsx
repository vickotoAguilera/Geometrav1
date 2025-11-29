'use client';

/**
 * Componente para solicitar ser docente
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestTeacherRole } from '@/app/profile-actions';
import type { UserProfile } from '@/types/user-profile';
import { addDebugLog } from '@/components/debug/DebugPanel';

interface TeacherRequestButtonProps {
    profile: UserProfile;
    userId: string;
    onRequestSent: () => void;
}

export function TeacherRequestButton({ profile, userId, onRequestSent }: TeacherRequestButtonProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Si ya es docente o admin, no mostrar nada
    if (profile.role === 'teacher' || profile.role === 'admin') {
        return null;
    }

    const handleSubmit = async () => {
        addDebugLog('info', 'Iniciando solicitud de docente', { userId, reasonLength: reason.length });

        if (!reason.trim()) {
            addDebugLog('warning', 'Solicitud rechazada: razón vacía');
            toast({
                title: '❌ Error',
                description: 'Por favor, explica por qué quieres ser docente',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);
            addDebugLog('info', 'Llamando a requestTeacherRole...', { userId, reason: reason.substring(0, 50) + '...' });

            await requestTeacherRole(userId, reason);

            addDebugLog('success', 'Solicitud de docente enviada exitosamente');
            toast({
                title: '✅ Solicitud enviada',
                description: 'Tu solicitud para ser docente ha sido enviada. El administrador la revisará pronto.',
            });

            setIsOpen(false);
            setReason('');

            addDebugLog('info', 'Esperando 2 segundos antes de recargar...');
            setTimeout(() => {
                addDebugLog('info', 'Recargando página...');
                onRequestSent();
            }, 2000);
        } catch (error) {
            addDebugLog('error', 'Error al enviar solicitud de docente', error);
            console.error('Error requesting teacher role:', error);
            toast({
                title: '❌ Error',
                description: 'No se pudo enviar la solicitud. Intenta de nuevo.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Si tiene solicitud pendiente
    if (profile.teacherRequest?.status === 'pending') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        Solicitud de Docente
                    </CardTitle>
                    <CardDescription>
                        Tu solicitud está siendo revisada
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Badge variant="secondary" className="text-yellow-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente de aprobación
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                        El administrador revisará tu solicitud pronto. Te notificaremos cuando haya una respuesta.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Si fue rechazada
    if (profile.teacherRequest?.status === 'rejected') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        Solicitud Rechazada
                    </CardTitle>
                    <CardDescription>
                        Tu solicitud para ser docente fue rechazada
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {profile.teacherRequest.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800">
                                <strong>Razón:</strong> {profile.teacherRequest.rejectionReason}
                            </p>
                        </div>
                    )}
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                Solicitar nuevamente
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Solicitar ser Docente</DialogTitle>
                                <DialogDescription>
                                    Explica por qué quieres ser docente en la plataforma
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="reason">Razón de la solicitud</Label>
                                    <Textarea
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Soy profesor de matemáticas en..."
                                        rows={4}
                                        className="mt-2"
                                    />
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        );
    }

    // No ha solicitado aún
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    ¿Eres Docente?
                </CardTitle>
                <CardDescription>
                    Solicita acceso como docente para crear tareas y dar retroalimentación
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Solicitar ser Docente
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Solicitar ser Docente</DialogTitle>
                            <DialogDescription>
                                Explica por qué quieres ser docente en la plataforma. El administrador revisará tu solicitud.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="reason">Razón de la solicitud</Label>
                                <Textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Soy profesor de matemáticas en el Liceo X y me gustaría usar la plataforma con mis estudiantes..."
                                    rows={4}
                                    className="mt-2"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Incluye información sobre tu institución y experiencia docente
                                </p>
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
