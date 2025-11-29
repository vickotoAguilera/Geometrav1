'use client';

/**
 * Página principal del perfil de usuario
 */

import { useUserProfile } from '@/firebase/hooks/use-user-profile';
import { useMathLevel } from '@/firebase/hooks/use-math-level';
import { useProgress } from '@/firebase/hooks/use-progress';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Edit, TrendingUp, Award, Calendar, Target, GraduationCap, Shield } from 'lucide-react';
import { getLevelProgress } from '@/lib/points-system';
import { useToast } from '@/hooks/use-toast';
import { StorageManager } from '@/components/storage/StorageManager';
import { TeacherRequestButton } from '@/components/profile/TeacherRequestButton';
import DebugPanel from '@/components/debug/DebugPanel';
import ResetTeacherRequestButton from '@/components/debug/ResetTeacherRequestButton';

function PerfilPageContent() {
    const { user, isUserLoading } = useUser();
    const { profile, isLoading: isLoadingProfile } = useUserProfile();
    const { mathLevel, isLoading: isLoadingMathLevel } = useMathLevel();
    const { progress, isLoading: isLoadingProgress } = useProgress();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Mostrar toast si viene de guardar cambios
    useEffect(() => {
        if (searchParams.get('saved') === 'true') {
            toast({
                title: '✅ Cambios guardados exitosamente',
                description: 'Tu perfil ha sido actualizado correctamente.',
            });
            // Limpiar el query param de la URL
            window.history.replaceState({}, '', '/perfil');
        }
    }, [searchParams, toast]);

    if (isUserLoading || isLoadingProfile || isLoadingMathLevel || isLoadingProgress) {
        return <PerfilSkeleton />;
    }

    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Perfil de Usuario</CardTitle>
                        <CardDescription>Inicia sesión para ver tu perfil</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const levelData = progress ? getLevelProgress(progress.totalPoints) : null;

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            {/* Header del Perfil */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20">
                                <AvatarImage src={profile?.photoURL || undefined} />
                                <AvatarFallback className="text-2xl">
                                    {profile?.displayName?.charAt(0) || user.displayName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold">{profile?.displayName || user.displayName || 'Usuario'}</h1>
                                {profile?.bio && <p className="text-muted-foreground mt-1">{profile.bio}</p>}
                                {profile?.grade && (
                                    <Badge variant="secondary" className="mt-2 mr-2">
                                        {profile.grade}
                                    </Badge>
                                )}
                                {profile?.role === 'teacher' && (
                                    <Badge variant="default" className="mt-2 mr-2 bg-blue-600 hover:bg-blue-700">
                                        <GraduationCap className="w-3 h-3 mr-1" />
                                        Docente
                                    </Badge>
                                )}
                                {profile?.role === 'admin' && (
                                    <Badge variant="default" className="mt-2 mr-2 bg-purple-600 hover:bg-purple-700">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Admin
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Link href="/perfil/editar">
                                <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Nivel y Progreso */}
            {levelData && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Nivel y Progreso
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Nivel Actual</p>
                                <p className="text-2xl font-bold flex items-center gap-2">
                                    <span>{levelData.currentLevel.icon}</span>
                                    {levelData.currentLevel.name}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Puntos Totales</p>
                                <p className="text-2xl font-bold">{progress?.totalPoints || 0}</p>
                            </div>
                        </div>

                        {/* Barra de Progreso */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progreso al siguiente nivel</span>
                                <span className="font-medium">
                                    {levelData.currentLevelPoints} / {levelData.currentLevelPoints + levelData.pointsToNextLevel}
                                </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-3">
                                <div
                                    className="h-3 rounded-full transition-all"
                                    style={{
                                        width: `${levelData.progressPercentage}%`,
                                        backgroundColor: levelData.currentLevel.color,
                                    }}
                                />
                            </div>
                            {levelData.nextLevel && (
                                <p className="text-xs text-muted-foreground text-center">
                                    {levelData.pointsToNextLevel} puntos para {levelData.nextLevel.icon} {levelData.nextLevel.name}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Racha
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{progress?.streak || 0} días</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Récord: {progress?.longestStreak || 0} días
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Ejercicios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{progress?.exercisesCompleted || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Completados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Promedio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{progress?.averageScore || 0}%</p>
                        <p className="text-xs text-muted-foreground mt-1">En pruebas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Accesos Rápidos */}
            <Card>
                <CardHeader>
                    <CardTitle>Accesos Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Botón de Admin - Solo visible para admins */}
                    {profile?.role === 'admin' && (
                        <Link href="/admin/teacher-requests" className="md:col-span-2">
                            <Button variant="default" className="w-full justify-start bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" size="lg">
                                <Shield className="w-5 h-5 mr-2" />
                                Panel de Administración - Solicitudes de Docentes
                            </Button>
                        </Link>
                    )}

                    <Link href="/perfil/evaluacion">
                        <Button variant="outline" className="w-full justify-start" size="lg">
                            <Award className="w-5 h-5 mr-2" />
                            Evaluación de Nivel
                        </Button>
                    </Link>
                    <Link href="/perfil/mi-tutor">
                        <Button variant="outline" className="w-full justify-start" size="lg">
                            <Target className="w-5 h-5 mr-2" />
                            Mi Tutor Personal
                        </Button>
                    </Link>
                    <Link href="/perfil/estadisticas">
                        <Button variant="outline" className="w-full justify-start" size="lg">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Estadísticas Detalladas
                        </Button>
                    </Link>
                    <Link href="/estudia">
                        <Button variant="outline" className="w-full justify-start" size="lg">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Continuar Estudiando
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Nivel Matemático */}
            {mathLevel && mathLevel.overall > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tu Nivel Matemático</CardTitle>
                        <CardDescription>Basado en tu última evaluación</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Álgebra</p>
                                <p className="text-2xl font-bold">{mathLevel.algebra}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Geometría</p>
                                <p className="text-2xl font-bold">{mathLevel.geometry}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cálculo</p>
                                <p className="text-2xl font-bold">{mathLevel.calculus}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Trigonometría</p>
                                <p className="text-2xl font-bold">{mathLevel.trigonometry}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Estadística</p>
                                <p className="text-2xl font-bold">{mathLevel.statistics}/100</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Funciones</p>
                                <p className="text-2xl font-bold">{mathLevel.functions}/100</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Solicitud de Docente */}
            {profile && user && (
                <TeacherRequestButton
                    profile={profile}
                    userId={user.uid}
                    onRequestSent={() => window.location.reload()}
                />
            )}

            {/* Gestión de Almacenamiento R2 */}
            <StorageManager />

            {/* Debug Tools */}
            {/* Debug Tools - Solo visibles en desarrollo */}
            {process.env.NODE_ENV === 'development' && (
                <>
                    <DebugPanel />
                    <ResetTeacherRequestButton />
                </>
            )}
        </div>
    );
}

function PerfilSkeleton() {
    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                </CardHeader>
            </Card>
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        </div>
    );
}

export default function PerfilPage() {
    return (
        <Suspense fallback={<PerfilSkeleton />}>
            <PerfilPageContent />
        </Suspense>
    );
}
