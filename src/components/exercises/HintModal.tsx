'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import type { ExerciseHint } from '@/ai/flows/hints-generator';

interface HintModalProps {
    open: boolean;
    onClose: () => void;
    hint: ExerciseHint | null;
    exerciseTitle: string;
    onRequestMoreHelp: () => void;
    onShowSolution: () => void;
    canRequestMore: boolean;
    screenshot?: string;
}

export default function HintModal({
    open,
    onClose,
    hint,
    exerciseTitle,
    onRequestMoreHelp,
    onShowSolution,
    canRequestMore,
    screenshot
}: HintModalProps) {
    if (!hint) return null;

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1: return 'text-green-600 bg-green-50 border-green-200';
            case 2: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getLevelIcon = (level: number) => {
        switch (level) {
            case 1: return <HelpCircle className="h-5 w-5" />;
            case 2: return <Lightbulb className="h-5 w-5" />;
            case 3: return <AlertTriangle className="h-5 w-5" />;
            default: return <Lightbulb className="h-5 w-5" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <span className="text-2xl">🤖</span>
                        Asistente Geometra
                    </DialogTitle>
                    <DialogDescription>
                        Aquí tienes una pista para ayudarte con este ejercicio
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Exercise Title */}
                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm text-gray-600 font-medium">Ejercicio:</p>
                        <p className="text-gray-900">{exerciseTitle}</p>
                    </div>

                    {/* Screenshot if available */}
                    {screenshot && (
                        <div className="border rounded-lg overflow-hidden">
                            <img
                                src={screenshot}
                                alt="Screenshot del ejercicio"
                                className="w-full h-auto"
                            />
                        </div>
                    )}

                    {/* Hint */}
                    <Alert className={`${getLevelColor(hint.level)} border-2`}>
                        <div className="flex items-start gap-3">
                            {getLevelIcon(hint.level)}
                            <div className="flex-1">
                                <h4 className="font-semibold mb-2">
                                    💡 Pista Nivel {hint.level}
                                </h4>
                                <AlertDescription className="text-base">
                                    {hint.text}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>

                    {/* Penalty Warning */}
                    <Alert variant="destructive" className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Penalización:</strong> -{hint.pointsPenalty} puntos por usar esta pista
                        </AlertDescription>
                    </Alert>

                    {/* Tips */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Consejo:</strong> Intenta resolver el ejercicio con esta pista antes de pedir más ayuda.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto"
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Entendido, volver al ejercicio
                    </Button>

                    {canRequestMore && (
                        <Button
                            variant="outline"
                            onClick={onRequestMoreHelp}
                            className="w-full sm:w-auto border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                        >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Necesito más ayuda
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        onClick={onShowSolution}
                        className="w-full sm:w-auto"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Ver solución completa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
