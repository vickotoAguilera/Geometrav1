'use client';

/**
 * Tarjeta de clase para profesores
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Settings, Check } from 'lucide-react';
import type { ClassWithStats } from '@/types/class-types';
import Link from 'next/link';

interface ClassCardProps {
    classData: ClassWithStats;
}

export function ClassCard({ classData }: ClassCardProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(classData.code);
            setCopied(true);
            toast({
                title: '📋 Código copiado',
                description: `Código ${classData.code} copiado al portapapeles`,
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo copiar el código',
                variant: 'destructive',
            });
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl">{classData.name}</CardTitle>
                        {classData.description && (
                            <CardDescription className="mt-1">
                                {classData.description}
                            </CardDescription>
                        )}
                    </div>
                    {classData.isOwner && (
                        <Badge variant="secondary" className="ml-2">
                            Owner
                        </Badge>
                    )}
                </div>

                <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{classData.subject}</Badge>
                    <Badge variant="outline">{classData.grade}</Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Código de Clase */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Código de Clase</p>
                        <p className="text-2xl font-bold font-mono tracking-wider">
                            {classData.code}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="shrink-0"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copiado
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar
                            </>
                        )}
                    </Button>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                            {classData.studentCount}{' '}
                            {classData.studentCount === 1 ? 'estudiante' : 'estudiantes'}
                        </span>
                    </div>
                    {classData.maxStudents > 0 && (
                        <span className="text-xs">
                            (máx: {classData.maxStudents})
                        </span>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                    <Link href={`/clases/${classData.id}`} className="flex-1">
                        <Button variant="default" className="w-full">
                            <Users className="w-4 h-4 mr-2" />
                            Ver Alumnos
                        </Button>
                    </Link>
                    {classData.isOwner && (
                        <Button variant="outline" size="icon">
                            <Settings className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
