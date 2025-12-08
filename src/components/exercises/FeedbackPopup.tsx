'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface FeedbackPopupProps {
    blankId: string;
    userAnswer: string;
    correctAnswer: string | string[];
    isCorrect: boolean;
}

export function FeedbackPopup({ blankId, userAnswer, correctAnswer, isCorrect }: FeedbackPopupProps) {
    const [open, setOpen] = useState(false);

    if (isCorrect) {
        return null; // No mostrar popup si la respuesta es correcta
    }

    // Generar mensaje de retroalimentación inteligente
    const getFeedbackMessage = (): { title: string; message: string; suggestion?: string } => {
        const correct = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
        const user = userAnswer.trim();

        // Caso 1: Respuesta vacía
        if (!user) {
            return {
                title: '💡 Pista',
                message: 'No has ingresado ninguna respuesta.',
                suggestion: 'Intenta resolver el problema paso a paso.',
            };
        }

        // Caso 2: Respuesta numérica cercana
        const userNum = parseFloat(user);
        const correctNum = parseFloat(correct);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
            const diff = Math.abs(userNum - correctNum);
            const percentDiff = (diff / correctNum) * 100;

            if (percentDiff < 10) {
                return {
                    title: '🎯 ¡Casi!',
                    message: `Tu respuesta "${user}" está muy cerca de la correcta.`,
                    suggestion: 'Revisa tus cálculos, especialmente los decimales o redondeos.',
                };
            } else if (percentDiff < 50) {
                return {
                    title: '🔍 Revisa tu procedimiento',
                    message: `Tu respuesta "${user}" tiene el enfoque correcto pero hay un error en el cálculo.`,
                    suggestion: 'Verifica cada paso de tu operación.',
                };
            }
        }

        // Caso 3: Respuesta con unidades incorrectas o faltantes
        const hasUnits = /[a-zA-Z°%]/.test(user);
        const correctHasUnits = /[a-zA-Z°%]/.test(correct);

        if (!hasUnits && correctHasUnits) {
            return {
                title: '📏 Faltan las unidades',
                message: 'Tu respuesta numérica parece correcta, pero falta indicar las unidades.',
                suggestion: `Intenta agregar las unidades apropiadas (ej: km/h, °, m, etc.)`,
            };
        }

        // Caso 4: Respuesta algebraica
        if (/[a-z()]/i.test(correct)) {
            return {
                title: '🧮 Expresión algebraica',
                message: 'Revisa la forma de tu expresión algebraica.',
                suggestion: 'Verifica los signos, paréntesis y factores.',
            };
        }

        // Caso 5: Respuesta genérica incorrecta
        return {
            title: '❌ Respuesta incorrecta',
            message: `Tu respuesta "${user}" no es correcta.`,
            suggestion: 'Revisa el enunciado y vuelve a intentarlo. Si necesitas más ayuda, consulta los ejemplos.',
        };
    };

    const feedback = getFeedbackMessage();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                    title="Ver ayuda"
                >
                    <HelpCircle className="w-3 h-3" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start" side="top">
                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <span className="text-lg">{feedback.title.split(' ')[0]}</span>
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm">{feedback.title.substring(2)}</h4>
                        </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {feedback.message}
                    </p>

                    {feedback.suggestion && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                <strong>💡 Sugerencia:</strong> {feedback.suggestion}
                            </p>
                        </div>
                    )}

                    <div className="pt-2 text-xs text-gray-500 dark:text-gray-500">
                        Haz clic fuera para cerrar
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
