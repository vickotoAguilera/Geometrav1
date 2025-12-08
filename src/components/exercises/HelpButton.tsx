'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface HelpButtonProps {
    onClick: () => void;
    currentLevel: number;
    disabled?: boolean;
}

export default function HelpButton({ onClick, currentLevel, disabled }: HelpButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getLevelText = () => {
        if (currentLevel === 0) return 'Pedir Ayuda';
        if (currentLevel === 3) return 'Sin más pistas';
        return `Pista Nivel ${currentLevel + 1}`;
    };

    const getPenalty = () => {
        const penalties = [2, 5, 8];
        return currentLevel < 3 ? penalties[currentLevel] : 0;
    };

    return (
        <div className="relative">
            <Button
                onClick={onClick}
                disabled={disabled || currentLevel >= 3}
                variant="outline"
                className="gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 transition-all"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Lightbulb className={`h-4 w-4 ${isHovered ? 'animate-pulse' : ''}`} />
                {getLevelText()}
                {currentLevel < 3 && (
                    <span className="text-xs bg-yellow-100 px-2 py-0.5 rounded-full">
                        -{getPenalty()} pts
                    </span>
                )}
            </Button>

            {currentLevel > 0 && currentLevel < 3 && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {currentLevel}
                </div>
            )}
        </div>
    );
}
