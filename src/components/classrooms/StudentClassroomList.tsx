// Lista de aulas para vista de alumno

'use client';

import { StudentClassroomCard } from './StudentClassroomCard';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen } from 'lucide-react';

interface StudentClassroom {
    id: string;
    name: string;
    description: string;
    subject: string;
    grade: string;
    teacherName: string;
    studentCount: number;
}

interface StudentClassroomListProps {
    classrooms: StudentClassroom[];
    isLoading: boolean;
}

export function StudentClassroomList({ classrooms, isLoading }: StudentClassroomListProps) {
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
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No estás inscrito en ningún aula</h3>
                    <p className="text-muted-foreground">
                        Solicita la contraseña a tu profesor para unirte a un aula
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Mis Aulas ({classrooms.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((classroom) => (
                    <StudentClassroomCard key={classroom.id} classroom={classroom} />
                ))}
            </div>
        </div>
    );
}
