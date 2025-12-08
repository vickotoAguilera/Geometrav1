// Lista de aulas para vista de profesor

'use client';

import { ClassroomCard } from './ClassroomCard';
import { Card } from '@/components/ui/card';
import { Loader2, FolderOpen } from 'lucide-react';
import type { ClassroomWithStats } from '@/types/classroom-types';

interface TeacherClassroomListProps {
    classrooms: ClassroomWithStats[];
    isLoading: boolean;
}

export function TeacherClassroomList({ classrooms, isLoading }: TeacherClassroomListProps) {
    if (isLoading) {
        return (
            <Card className="p-12 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando aulas...</p>
                </div>
            </Card>
        );
    }

    if (classrooms.length === 0) {
        return (
            <Card className="p-12">
                <div className="text-center">
                    <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No tienes aulas creadas</h3>
                    <p className="text-muted-foreground">
                        Crea tu primera aula para comenzar a gestionar tus alumnos
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Tus Aulas ({classrooms.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((classroom) => (
                    <ClassroomCard key={classroom.id} classroom={classroom} />
                ))}
            </div>
        </div>
    );
}
