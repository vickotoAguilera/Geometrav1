// Tarjeta de aula para vista de alumno

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StudentClassroom {
    id: string;
    name: string;
    description: string;
    subject: string;
    grade: string;
    teacherName: string;
    studentCount: number;
}

interface StudentClassroomCardProps {
    classroom: StudentClassroom;
}

export function StudentClassroomCard({ classroom }: StudentClassroomCardProps) {
    const router = useRouter();

    const handleViewClassroom = () => {
        router.push(`/aulas/${classroom.id}`);
    };

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewClassroom}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">{classroom.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {classroom.description || 'Sin descripción'}
                        </p>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">{classroom.subject}</Badge>
                    <Badge variant="outline">{classroom.grade}</Badge>
                </div>

                {/* Profesor */}
                <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Profesor</p>
                            <p className="font-medium">{classroom.teacherName}</p>
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{classroom.studentCount} compañeros</span>
                    </div>

                    <Button size="sm" variant="default" onClick={handleViewClassroom}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Aula
                    </Button>
                </div>
            </div>
        </Card>
    );
}
