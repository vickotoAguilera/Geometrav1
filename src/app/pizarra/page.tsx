import { LearningBoard } from '@/components/learning-board';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pizarra de Aprendizaje | Geometra',
    description: 'Aprende geometría de forma interactiva con tu tutor IA y GeoGebra.',
};

export default function PizarraPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-4">
            <div className="container mx-auto max-w-[1800px]">
                <h1 className="text-3xl font-bold mb-4 px-4 flex items-center gap-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Pizarra de Aprendizaje
                    </span>
                    <span className="text-sm font-normal text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                        Beta
                    </span>
                </h1>
                <LearningBoard />
            </div>
        </main>
    );
}
