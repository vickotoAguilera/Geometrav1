'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Pause, Play } from 'lucide-react';

interface ExerciseTimerProps {
    onTimeUpdate?: (seconds: number) => void;
    onComplete?: (totalSeconds: number) => void;
    autoStart?: boolean;
    showControls?: boolean;
}

export default function ExerciseTimer({
    onTimeUpdate,
    onComplete,
    autoStart = true,
    showControls = true,
}: ExerciseTimerProps) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(autoStart);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    const newTime = prev + 1;
                    onTimeUpdate?.(newTime);
                    return newTime;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, onTimeUpdate]);

    const toggleTimer = () => {
        setIsRunning((prev) => !prev);
    };

    const resetTimer = () => {
        setSeconds(0);
        setIsRunning(autoStart);
    };

    const stopTimer = () => {
        setIsRunning(false);
        onComplete?.(seconds);
    };

    const formatTime = (totalSeconds: number): string => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Exponer métodos para uso externo
    useEffect(() => {
        // Guardar referencia para que el componente padre pueda llamar stop
        (window as any).__exerciseTimer = {
            stop: stopTimer,
            reset: resetTimer,
            getTime: () => seconds,
        };
    }, [seconds]);

    return (
        <Card className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-lg font-semibold tabular-nums">
                {formatTime(seconds)}
            </span>
            {showControls && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTimer}
                    className="h-8 w-8 p-0"
                >
                    {isRunning ? (
                        <Pause className="w-4 h-4" />
                    ) : (
                        <Play className="w-4 h-4" />
                    )}
                </Button>
            )}
        </Card>
    );
}

// Hook personalizado para usar el timer
export function useExerciseTimer() {
    const [timeSpent, setTimeSpent] = useState(0);

    const handleTimeUpdate = (seconds: number) => {
        setTimeSpent(seconds);
    };

    const handleComplete = (totalSeconds: number) => {
        setTimeSpent(totalSeconds);
        return totalSeconds;
    };

    const resetTime = () => {
        setTimeSpent(0);
    };

    return {
        timeSpent,
        handleTimeUpdate,
        handleComplete,
        resetTime,
    };
}
