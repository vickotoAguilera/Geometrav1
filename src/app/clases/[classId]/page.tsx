'use client';

/**
 * Página de detalles de una clase
 * Muestra lista de alumnos para profesores
 */

import { use } from 'react';
import { useClassMembers } from '@/firebase/hooks/use-class-members';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import type { Class } from '@/types/class-types';

interface PageProps {
    params: Promise<{ classId: string }>;
}

export default function ClassDetailPage({ params }: PageProps) {
    const { classId } = use(params);
    const { user } = useUser();
    const firestore = useFirestore();
    const { teachers, students, isLoading, error } = useClassMembers(classId);
    const [classData, setClassData] = useState<Class | null>(null);
    const [isLoadingClass, setIsLoadingClass] = useState(true);

    useEffect(() => {
        if (!firestore || !classId) return;

        const fetchClass = async () => {
            try {
                const classRef = doc(firestore, 'classes', classId);
                const classDoc = await getDoc(classRef);

                if (classDoc.exists()) {
                    setClassData({ id: classDoc.id, ...classDoc.data() } as Class);
                }
            } catch (err) {
                console.error('Error fetching class:', err);
            } finally {
                setIsLoadingClass(false);
            }
        };

        fetchClass();
    }, [firestore, classId]);

    if (isLoadingClass || isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Skeleton className="h-12 w-64 mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                    ))}
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card>
                    <CardContent className="p-12 text-center">
                        <h2 className="text-2xl font-bold">Clase no encontrada</h2>
                        <Link href="/clases" className="mt-4 inline-block">
                            <Button>Volver a Clases</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            {/* Header */}
            <div>
                <Link href="/clases">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Clases
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{classData.name}</h1>
                        {classData.description && (
                            <p className="text-muted-foreground mt-2">{classData.description}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                            <Badge>{classData.subject}</Badge>
                            <Badge variant="outline">{classData.grade}</Badge>
                            <Badge variant="secondary">Código: {classData.code}</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profesores */}
            {teachers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Profesores ({teachers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {teachers.map((teacher) => (
                                <div
                                    key={teacher.userId}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={teacher.photoURL || undefined} />
                                            <AvatarFallback>
                                                {teacher.displayName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{teacher.displayName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {teacher.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={teacher.role === 'owner' ? 'default' : 'secondary'}>
                                        {teacher.role === 'owner' ? 'Propietario' : 'Asistente'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Estudiantes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Estudiantes ({students.length})
                        {classData.maxStudents > 0 && (
                            <span className="text-sm text-muted-foreground font-normal">
                                / {classData.maxStudents} máx
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Lista de estudiantes inscritos en esta clase
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {students.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Aún no hay estudiantes en esta clase</p>
                            <p className="text-sm mt-1">
                                Comparte el código <strong>{classData.code}</strong> con tus estudiantes
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {students.map((student) => (
                                <div
                                    key={student.userId}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={student.photoURL || undefined} />
                                            <AvatarFallback>
                                                {student.displayName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{student.displayName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {student.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Se unió:{' '}
                                                {new Date(
                                                    student.joinedAt.seconds * 1000
                                                ).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
