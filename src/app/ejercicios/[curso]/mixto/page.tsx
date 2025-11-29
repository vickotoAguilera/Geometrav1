'use client';

import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import { getGradeById } from '@/data/curriculum';

export default function MixtoExercisesPage() {
    const params = useParams();
    const router = useRouter();
    const gradeId = params.curso as string;
    const grade = getGradeById(gradeId);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <Button
                    variant="outline"
                    onClick={() => router.push('/ejercicios')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Ejercicios
                </Button>

                <Card>
                    <CardContent className="text-center py-12">
                        <Construction className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">Ejercicios Mixtos - {grade?.name}</h2>
                        <p className="text-muted-foreground mb-4">
                            50 ejercicios combinando todas las materias
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Esta funcionalidad estará disponible próximamente
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
