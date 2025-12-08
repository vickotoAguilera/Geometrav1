// Vista detallada de un aula específica

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useClassroomMembers } from '@/firebase/hooks/useClassroomMembers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowLeft,
    Users,
    Copy,
    Check,
    Trash2,
    RefreshCw,
    GraduationCap,
    BookOpen,
    BarChart,
    MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { removeStudentFromClassroom, changeClassroomPassword } from '@/lib/classroom-utils';
import { ClassroomTermsModal } from '@/components/classrooms/ClassroomTermsModal';
import { useClassroomAgreement } from '@/firebase/hooks/useClassroomAgreement';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ClassroomChat } from '@/components/classrooms/chat/ClassroomChat';
import type { Classroom } from '@/types/classroom-types';

export default function ClassroomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const user = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const classroomId = params.id as string;

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Hook para verificar aceptación de términos
    const { agreementStatus, isLoading: loadingAgreement, acceptTerms, needsAcceptance } =
        useClassroomAgreement(user?.user?.uid || null, classroomId);

    const { members, isLoading: loadingMembers } = useClassroomMembers(classroomId);

    // Cargar datos del aula
    useEffect(() => {
        if (!firestore || !classroomId) return;

        const loadClassroom = async () => {
            try {
                const classroomRef = doc(firestore, `classrooms/${classroomId}`);
                const classroomDoc = await getDoc(classroomRef);

                if (classroomDoc.exists()) {
                    setClassroom({ id: classroomDoc.id, ...classroomDoc.data() } as Classroom);
                } else {
                    toast({
                        title: 'Error',
                        description: 'Aula no encontrada',
                        variant: 'destructive',
                    });
                    router.push('/aulas');
                }
            } catch (error) {
                console.error('Error loading classroom:', error);
                toast({
                    title: 'Error',
                    description: 'No se pudo cargar el aula',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadClassroom();
    }, [firestore, classroomId, router, toast]);

    const isTeacher = user?.user?.role === 'teacher' || user?.user?.role === 'admin';
    const isOwner = classroom?.createdBy === user?.user?.uid || user?.user?.role === 'admin';

    const handleCopyPassword = () => {
        if (classroom) {
            navigator.clipboard.writeText(classroom.password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: 'Contraseña copiada',
                description: `Contraseña: ${classroom.password}`,
            });
        }
    };

    const handleChangePassword = async () => {
        if (!user?.user || !classroom) return;

        setIsChangingPassword(true);
        try {
            const result = await changeClassroomPassword(classroom.id, user.user.uid);

            if (result.success && result.newPassword) {
                setClassroom({ ...classroom, password: result.newPassword });
                toast({
                    title: 'Contraseña actualizada',
                    description: `Nueva contraseña: ${result.newPassword}`,
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo cambiar la contraseña',
                variant: 'destructive',
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleRemoveStudent = async (studentId: string, studentName: string) => {
        if (!user?.user || !classroom) return;

        const confirmed = confirm(`¿Estás seguro de remover a ${studentName} del aula?`);
        if (!confirmed) return;

        try {
            const result = await removeStudentFromClassroom(classroom.id, studentId, user.user.uid);

            if (result.success) {
                toast({
                    title: 'Estudiante removido',
                    description: result.message,
                });
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo remover al estudiante',
                variant: 'destructive',
            });
        }
    };

    if (isLoading || !classroom) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Cargando aula...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={() => router.push('/aulas')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Mis Aulas
                    </Button>

                    {/* Campana de notificaciones */}
                    {user?.user && (
                        <NotificationBell userId={user.user.uid} />
                    )}
                </div>

                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{classroom.name}</h1>
                            <p className="text-muted-foreground mb-4">{classroom.description}</p>
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary">{classroom.subject}</Badge>
                                <Badge variant="outline">{classroom.grade}</Badge>
                                {classroom.isActive ? (
                                    <Badge variant="default" className="bg-green-600">Activa</Badge>
                                ) : (
                                    <Badge variant="destructive">Inactiva</Badge>
                                )}
                            </div>
                        </div>

                        {/* Contraseña - Solo para profesores */}
                        {isTeacher && (
                            <div className="bg-muted p-4 rounded-lg min-w-[200px]">
                                <p className="text-xs text-muted-foreground mb-1">Contraseña</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold font-mono tracking-wider">
                                        {classroom.password}
                                    </p>
                                    <Button size="icon" variant="ghost" onClick={handleCopyPassword}>
                                        {copied ? (
                                            <Check className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Copy className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                                {isOwner && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full mt-2"
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${isChangingPassword ? 'animate-spin' : ''}`} />
                                        Cambiar
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="chat" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="chat">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                    </TabsTrigger>
                    <TabsTrigger value="students">
                        <Users className="h-4 w-4 mr-2" />
                        {isTeacher ? 'Alumnos' : 'Compañeros'} ({members.students.length})
                    </TabsTrigger>
                    {isTeacher && (
                        <TabsTrigger value="teachers">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Profesores ({members.teachers.length})
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="materials">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Materiales
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                        <BarChart className="h-4 w-4 mr-2" />
                        Estadísticas
                    </TabsTrigger>
                </TabsList>

                {/* Tab de Chat */}
                <TabsContent value="chat">
                    {user?.user && (
                        <ClassroomChat
                            classroomId={classroomId}
                            userId={user.user.uid}
                            userName={user.user.displayName || 'Usuario'}
                            userRole={user.user.role as 'teacher' | 'student'}
                            userPhotoURL={user.user.photoURL || undefined}
                        />
                    )}
                </TabsContent>

                {/* Lista de Alumnos */}
                <TabsContent value="students">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isTeacher ? 'Lista de Alumnos' : 'Mis Compañeros'}
                        </h2>
                        {members.students.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No hay alumnos inscritos en esta aula
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {members.students.map((student) => (
                                    <div
                                        key={student.userId}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={student.photoURL} />
                                                <AvatarFallback>
                                                    {student.displayName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{student.displayName}</p>
                                                {isTeacher && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.email}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Inscrito: {student.joinedAt.toDate().toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleRemoveStudent(student.userId, student.displayName)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remover
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Lista de Profesores */}
                {isTeacher && (
                    <TabsContent value="teachers">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Profesores del Aula</h2>
                            <div className="space-y-3">
                                {members.teachers.map((teacher) => (
                                    <div
                                        key={teacher.userId}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={teacher.photoURL} />
                                                <AvatarFallback>
                                                    {teacher.displayName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{teacher.displayName}</p>
                                                <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                            </div>
                                        </div>
                                        <Badge variant={teacher.role === 'owner' ? 'default' : 'secondary'}>
                                            {teacher.role === 'owner' ? 'Propietario' : 'Asistente'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>
                )}

                {/* Materiales */}
                <TabsContent value="materials">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Materiales del Aula</h2>
                        <p className="text-muted-foreground text-center py-8">
                            Próximamente: Gestión de materiales y recursos
                        </p>
                    </Card>
                </TabsContent>

                {/* Estadísticas */}
                <TabsContent value="stats">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Estadísticas del Aula</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Alumnos</p>
                                <p className="text-3xl font-bold">{members.students.length}</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">Profesores</p>
                                <p className="text-3xl font-bold">{members.teachers.length}</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">Límite</p>
                                <p className="text-3xl font-bold">
                                    {classroom.maxStudents || '∞'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal de Términos y Condiciones */}
            {classroom && needsAcceptance && !loadingAgreement && (
                <ClassroomTermsModal
                    open={true}
                    classroomName={classroom.name}
                    onAccept={async () => {
                        await acceptTerms('v1.0');
                    }}
                    onReject={() => {
                        router.push('/perfil');
                    }}
                />
            )}
        </div>
    );
}
