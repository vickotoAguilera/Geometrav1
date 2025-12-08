'use client';

/**
 * Lista de clases para profesores
 */

import { useTeacherClasses } from '@/firebase/hooks/use-teacher-classes';
import { ClassCard } from './ClassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export function TeacherClassList() {
    const { classes, isLoading, error } = useTeacherClasses();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-destructive">
                        Error al cargar las clases: {error.message}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (classes.length === 0) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <GraduationCap className="w-8 h-8 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">No tienes clases aún</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Crea tu primera clase para comenzar a gestionar tus estudiantes
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classData) => (
                <ClassCard key={classData.id} classData={classData} />
            ))}
        </div>
    );
}
