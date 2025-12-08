// Modal de Términos y Condiciones del Aula Virtual

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClassroomTermsModalProps {
    open: boolean;
    onAccept: () => Promise<void>;
    onReject: () => void;
    classroomName: string;
}

export function ClassroomTermsModal({
    open,
    onAccept,
    onReject,
    classroomName,
}: ClassroomTermsModalProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [hasReadTerms, setHasReadTerms] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    const handleAccept = async () => {
        if (!hasReadTerms) {
            toast({
                title: 'Debes leer los términos',
                description: 'Por favor, marca la casilla para continuar',
                variant: 'destructive',
            });
            return;
        }

        setIsAccepting(true);
        try {
            await onAccept();
            toast({
                title: '✅ Términos aceptados',
                description: 'Bienvenido al aula virtual',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo registrar la aceptación',
                variant: 'destructive',
            });
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = () => {
        toast({
            title: 'Términos rechazados',
            description: 'Regresando a tu perfil...',
        });
        onReject();
        router.push('/perfil');
    };

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <DialogTitle className="text-2xl">Términos y Condiciones</DialogTitle>
                    </div>
                    <DialogDescription>
                        Aula Virtual: <span className="font-semibold">{classroomName}</span>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4 text-sm">
                        {/* Introducción */}
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Al usar esta aula virtual de Geometra, aceptas cumplir con las siguientes normas de convivencia y uso responsable.
                            </AlertDescription>
                        </Alert>

                        {/* Sección 1: Respeto y Convivencia */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                1. Respeto y Convivencia
                            </h3>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li>Tratar a profesores y compañeros con respeto</li>
                                <li>No usar lenguaje ofensivo, discriminatorio o amenazante</li>
                                <li>No realizar acoso, bullying o intimidación de ningún tipo</li>
                                <li>Mantener un ambiente de aprendizaje positivo</li>
                            </ul>
                        </div>

                        {/* Sección 2: Uso Apropiado */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                2. Uso Apropiado del Aula
                            </h3>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li>Usar el chat solo para fines educativos</li>
                                <li>No compartir contenido inapropiado o ilegal</li>
                                <li>No hacer spam ni enviar mensajes repetitivos</li>
                                <li>Respetar la propiedad intelectual</li>
                            </ul>
                        </div>

                        {/* Sección 3: Privacidad y Seguridad */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                3. Privacidad y Seguridad
                            </h3>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li>No compartir información personal de otros</li>
                                <li>Mantener la contraseña del aula confidencial</li>
                                <li>Reportar cualquier actividad sospechosa</li>
                                <li>No intentar acceder a cuentas de otros usuarios</li>
                            </ul>
                        </div>

                        {/* Sección 4: Responsabilidad */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                4. Responsabilidad Académica
                            </h3>
                            <ul className="list-disc list-inside space-y-1 pl-4">
                                <li>Entregar trabajos propios y originales</li>
                                <li>No hacer trampa ni plagiar</li>
                                <li>Cumplir con las fechas de entrega</li>
                                <li>Participar activamente en las actividades</li>
                            </ul>
                        </div>

                        {/* Sección 5: Monitoreo y Moderación */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                5. Monitoreo y Moderación
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                                <p className="text-sm">
                                    <strong>Geometra monitorea todas las interacciones</strong> en las aulas virtuales para garantizar un ambiente seguro. Esto incluye:
                                </p>
                                <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
                                    <li>Análisis automático de mensajes</li>
                                    <li>Detección de contenido inapropiado</li>
                                    <li>Revisión de reportes de usuarios</li>
                                    <li>Registro de todas las actividades</li>
                                </ul>
                            </div>
                        </div>

                        {/* Sección 6: Consecuencias */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                6. Consecuencias por Incumplimiento
                            </h3>
                            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                                <p className="text-sm mb-2">
                                    El incumplimiento de estos términos puede resultar en:
                                </p>
                                <ul className="list-disc list-inside space-y-1 pl-4">
                                    <li><strong>Advertencia:</strong> Primera infracción menor</li>
                                    <li><strong>Suspensión temporal:</strong> Infracciones repetidas (7-30 días)</li>
                                    <li><strong>Suspensión permanente:</strong> Infracciones graves</li>
                                    <li><strong>Reporte a autoridades:</strong> Contenido ilegal o amenazas</li>
                                </ul>
                            </div>
                        </div>

                        {/* Sección 7: Sistema de Reportes */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <Shield className="h-4 w-4 text-purple-600" />
                                7. Sistema de Reportes
                            </h3>
                            <p className="text-sm">
                                Puedes reportar conductas inapropiadas usando el botón de reporte (🚨) en cualquier mensaje o a través del sistema de feedback.
                            </p>
                            <p className="text-sm">
                                Los reportes son revisados por el equipo de Geometra y pueden incluir capturas de pantalla como evidencia.
                            </p>
                        </div>

                        {/* Sección 8: Contacto */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base">8. Contacto</h3>
                            <p className="text-sm">
                                Para consultas o reportes urgentes, contacta a:{' '}
                                <a href="mailto:contacto.geometra@gmail.com" className="text-primary hover:underline">
                                    contacto.geometra@gmail.com
                                </a>
                            </p>
                        </div>

                        {/* Versión */}
                        <div className="text-xs text-muted-foreground pt-4 border-t">
                            <p>Versión: v1.0</p>
                            <p>Última actualización: 5 de Diciembre de 2024</p>
                        </div>
                    </div>
                </ScrollArea>

                {/* Checkbox de aceptación */}
                <div className="flex items-start space-x-2 pt-4 border-t">
                    <Checkbox
                        id="terms"
                        checked={hasReadTerms}
                        onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
                    />
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        He leído y acepto los términos y condiciones del aula virtual de Geometra
                    </label>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleReject}>
                        Rechazar
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={!hasReadTerms || isAccepting}
                    >
                        {isAccepting ? 'Aceptando...' : 'Aceptar y Continuar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
