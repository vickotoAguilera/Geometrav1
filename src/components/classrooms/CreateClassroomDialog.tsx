// Diálogo para crear un aula nueva

'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { createClassroom } from '@/lib/classroom-utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check } from 'lucide-react';

interface CreateClassroomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateClassroomDialog({ open, onOpenChange }: CreateClassroomDialogProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        subject: '',
        grade: '',
        maxStudents: '40',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Error',
                description: 'Debes iniciar sesión',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await createClassroom(
                {
                    name: formData.name,
                    description: formData.description,
                    subject: formData.subject,
                    grade: formData.grade,
                    maxStudents: parseInt(formData.maxStudents) || undefined,
                },
                user.uid
            );

            if (result.success && result.password) {
                setGeneratedPassword(result.password);
                toast({
                    title: '¡Aula creada!',
                    description: `Contraseña: ${result.password}`,
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
                description: 'No se pudo crear el aula',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPassword = () => {
        if (generatedPassword) {
            navigator.clipboard.writeText(generatedPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: 'Copiado',
                description: 'Contraseña copiada al portapapeles',
            });
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            subject: '',
            grade: '',
            maxStudents: '40',
        });
        setGeneratedPassword(null);
        setCopied(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Aula</DialogTitle>
                    <DialogDescription>
                        Completa la información para crear un aula virtual
                    </DialogDescription>
                </DialogHeader>

                {!generatedPassword ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Aula *</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Matemáticas 3° Medio A"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe el contenido del aula..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Materia *</Label>
                                <Input
                                    id="subject"
                                    placeholder="Ej: Matemáticas"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">Curso *</Label>
                                <Input
                                    id="grade"
                                    placeholder="Ej: 3° Medio"
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxStudents">Límite de Estudiantes (opcional)</Label>
                            <Input
                                id="maxStudents"
                                type="number"
                                placeholder="40"
                                value={formData.maxStudents}
                                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                                min="1"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading} className="flex-1">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Aula
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">Contraseña del Aula</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-4xl font-bold font-mono tracking-wider">
                                    {generatedPassword}
                                </p>
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
                            <p className="text-xs text-muted-foreground mt-4">
                                Comparte esta contraseña con tus alumnos para que puedan unirse
                            </p>
                        </div>

                        <Button onClick={handleClose} className="w-full">
                            Cerrar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
