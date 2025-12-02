'use client';

/**
 * Página principal de clases
 * Muestra diferentes vistas según el rol del usuario (profesor/alumno)
 */

import { useUserProfile } from '@/firebase/hooks/use-user-profile';
import { useUser } from '@/firebase';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { JoinClassDialog } from '@/components/classes/JoinClassDialog';
import { TeacherClassList } from '@/components/classes/TeacherClassList';
import { StudentClassList } from '@/components/classes/StudentClassList';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Users } from 'lucide-react';

export default function ClasesPage() {
    const { user, isUserLoading } = useUser();
    const { profile, isLoading: isLoadingProfile } = useUserProfile();

    if (isUserLoading || isLoadingProfile) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <div className="space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-64" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <Card>
                    <CardContent className="p-12 text-center">
                        <h2 className="text-2xl font-bold">Inicia sesión para ver tus clases</h2>
                        <p className="text-muted-foreground mt-2">
                            Necesitas iniciar sesión para acceder a esta página
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isTeacher = profile?.role === 'teacher' || profile?.role === 'admin';

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {isTeacher ? (
                            <>
                                <GraduationCap className="w-8 h-8" />
                                Mis Clases
                            </>
                        ) : (
                            <>
                                <Users className="w-8 h-8" />
                                Mis Clases
                            </>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isTeacher
                            ? 'Gestiona tus clases y estudiantes'
                            : 'Accede a tus clases y materiales'}
                    </p>
                </div>

                {/* Botón de acción según rol */}
                {isTeacher ? <CreateClassDialog /> : <JoinClassDialog />}
            </div>

            {/* Lista de clases según rol */}
            {isTeacher ? <TeacherClassList /> : <StudentClassList />}
        </div>
    );
}
