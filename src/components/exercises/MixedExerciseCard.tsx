'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface MixedExerciseCardProps {
    subjectName: string;
    subjectIcon: string;
    difficulty: 'facil' | 'medio' | 'dificil';
}

export default function MixedExerciseCard({ subjectName, subjectIcon, difficulty }: MixedExerciseCardProps) {
    const difficultyColors = {
        facil: 'bg-green-500/10 text-green-700 dark:text-green-400',
        medio: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        dificil: 'bg-red-500/10 text-red-700 dark:text-red-400',
    };

    const difficultyLabels = {
        facil: 'Fácil',
        medio: 'Medio',
        dificil: 'Difícil',
    };

    const difficultyStars = {
        facil: '⭐',
        medio: '⭐⭐',
        dificil: '⭐⭐⭐',
    };

    return (
        <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-base px-3 py-1">
                <span className="mr-2">{subjectIcon}</span>
                {subjectName}
            </Badge>
            <Badge className={difficultyColors[difficulty]}>
                <span className="mr-1">{difficultyStars[difficulty]}</span>
                {difficultyLabels[difficulty]}
            </Badge>
        </div>
    );
}
