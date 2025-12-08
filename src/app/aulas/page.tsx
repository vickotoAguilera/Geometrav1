'use client';

import { useUser } from '@/firebase';
import { useUserProfile } from '@/firebase/hooks/use-user-profile';
import { useTeacherClassrooms } from '@/firebase/hooks/useTeacherClassrooms';
import { useStudentClassrooms } from '@/firebase/hooks/useStudentClassrooms';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { CreateClassroomDialog } from '@/components/classrooms/CreateClassroomDialog';
import { JoinClassroomDialog } from '@/components/classrooms/JoinClassroomDialog';
import { TeacherClassroomList } from '@/components/classrooms/TeacherClassroomList';
import { StudentClassroomList } from '@/components/classrooms/StudentClassroomList';

export default function AulasPage() {
    const { user } = useUser();
    const { profile, isLoading: profileLoading } = useUserProfile();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showJoinDialog, setShowJoinDialog] = useState(false);

    // Obtener aulas según el rol
    const { classrooms: teacherClassrooms, isLoading: loadingTeacher } = useTeacherClassrooms(
        profile?.role === 'teacher' && user ? user.uid : null
    );
    const { classrooms: studentClassrooms, isLoading: loadingStudent } = useStudentClassrooms(
        profile?.role === 'student' && user ? user.uid : null
    );

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Debes iniciar sesión para ver tus aulas</p>
                </Card>
            </div>
        );
    }

    if (profileLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Cargando perfil...</p>
                </Card>
            </div>
        );
    }

    const isTeacher = profile?.role === 'teacher';
    const isStudent = profile?.role === 'student';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        Mis Aulas
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {isTeacher && 'Gestiona tus clases y alumnos'}
                        {isStudent && 'Accede a tus clases y materiales'}
                    </p>
                </div>

                {/* Botones de acción según rol */}
                <div className="flex gap-2">
                    {isTeacher && (
                        <Button onClick={() => setShowCreateDialog(true)} size="lg">
                            <Plus className="h-5 w-5 mr-2" />
                            Crear Aula
                        </Button>
                    )}
                    {isStudent && (
                        <Button onClick={() => setShowJoinDialog(true)} size="lg">
                            <BookOpen className="h-5 w-5 mr-2" />
                            Unirse a Aula
                        </Button>
                    )}
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {isTeacher && (
                    <>
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Aulas</p>
                                    <p className="text-3xl font-bold">{teacherClassrooms.length}</p>
                                </div>
                                <Users className="h-12 w-12 text-primary opacity-20" />
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Alumnos</p>
                                    <p className="text-3xl font-bold">
                                        {teacherClassrooms.reduce((sum, c) => sum + c.studentCount, 0)}
                                    </p>
                                </div>
                                <Users className="h-12 w-12 text-green-500 opacity-20" />
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Alumnos Activos</p>
                                    <p className="text-3xl font-bold">
                                        {teacherClassrooms.reduce((sum, c) => sum + c.activeStudentCount, 0)}
                                    </p>
                                </div>
                                <Users className="h-12 w-12 text-blue-500 opacity-20" />
                            </div>
                        </Card>
                    </>
                )}
                {isStudent && (
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Mis Aulas</p>
                                <p className="text-3xl font-bold">{studentClassrooms.length}</p>
                            </div>
                            <BookOpen className="h-12 w-12 text-primary opacity-20" />
                        </div>
                    </Card>
                )}
            </div>

            {/* Lista de aulas */}
            {isTeacher && (
                <TeacherClassroomList
                    classrooms={teacherClassrooms}
                    isLoading={loadingTeacher}
                />
            )}
            {isStudent && (
                <StudentClassroomList
                    classrooms={studentClassrooms}
                    isLoading={loadingStudent}
                />
            )}

            {/* Diálogos */}
            {isTeacher && (
                <CreateClassroomDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                />
            )}
            {isStudent && (
                <JoinClassroomDialog
                    open={showJoinDialog}
                    onOpenChange={setShowJoinDialog}
                />
            )}
        </div>
    );
}
