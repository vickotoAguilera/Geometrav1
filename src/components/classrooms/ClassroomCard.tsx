// Tarjeta de aula para vista de profesor

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Check, Eye } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { ClassroomWithStats } from '@/types/classroom-types';

interface ClassroomCardProps {
    classroom: ClassroomWithStats;
}

export function ClassroomCard({ classroom }: ClassroomCardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopyPassword = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(classroom.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            title: 'Contraseña copiada',
            description: `Contraseña: ${classroom.password}`,
        });
    };

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

                {/* Contraseña */}
                <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Contraseña</p>
                            <p className="text-2xl font-bold font-mono tracking-wider">
                                {classroom.password}
                            </p>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCopyPassword}
                        >
                            {copied ? (
                                <Check className="h-5 w-5 text-green-600" />
                            ) : (
                                <Copy className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{classroom.studentCount} alumnos</span>
                        </div>
                        {classroom.maxStudents && (
                            <span className="text-xs">
                                (máx: {classroom.maxStudents})
                            </span>
                        )}
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
