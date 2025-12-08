'use client';

/**
 * Tarjeta de clase para alumnos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, LogOut } from 'lucide-react';
import type { ClassWithStats } from '@/types/class-types';
import Link from 'next/link';

interface StudentClassCardProps {
    classData: ClassWithStats;
}

export function StudentClassCard({ classData }: StudentClassCardProps) {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="text-xl">{classData.name}</CardTitle>
                {classData.description && (
                    <CardDescription>{classData.description}</CardDescription>
                )}

                <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{classData.subject}</Badge>
                    <Badge variant="outline">{classData.grade}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Información del Profesor */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    <span>Profesor</span>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                        {classData.studentCount}{' '}
                        {classData.studentCount === 1 ? 'compañero' : 'compañeros'}
                    </span>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                    <Link href={`/clases/${classData.id}`} className="flex-1">
                        <Button variant="default" className="w-full">
                            Ver Clase
                        </Button>
                    </Link>
                    <Button variant="outline" size="icon" title="Salir de la clase">
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
