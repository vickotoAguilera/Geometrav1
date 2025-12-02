'use client';

/**
 * Dialog para crear una nueva clase (Profesores)
 */

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { createClass } from '@/lib/class-utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

export function CreateClassDialog() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        subject: '',
        grade: '',
        maxStudents: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !firestore) {
            toast({
                title: 'Error',
                description: 'Debes iniciar sesión para crear una clase',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.name || !formData.subject || !formData.grade) {
            toast({
                title: 'Error',
                description: 'Por favor completa todos los campos obligatorios',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await createClass(firestore, user.uid, formData);

            if (result.success) {
                toast({
                    title: '✅ Clase creada exitosamente',
                    description: `Código de la clase: ${result.classId}`,
                });

                // Resetear formulario
                setFormData({
                    name: '',
                    description: '',
                    subject: '',
                    grade: '',
                    maxStudents: 0,
                });

                setOpen(false);
            } else {
                toast({
                    title: 'Error al crear clase',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error creating class:', error);
            toast({
                title: 'Error',
                description: 'Ocurrió un error al crear la clase',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Clase
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Clase</DialogTitle>
                    <DialogDescription>
                        Crea una clase y comparte el código con tus estudiantes
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Nombre de la Clase <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="ej: Geometría 1° Medio A"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            placeholder="Descripción opcional de la clase"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject">
                                Materia <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.subject}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, subject: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Matemáticas">Matemáticas</SelectItem>
                                    <SelectItem value="Geometría">Geometría</SelectItem>
                                    <SelectItem value="Álgebra">Álgebra</SelectItem>
                                    <SelectItem value="Cálculo">Cálculo</SelectItem>
                                    <SelectItem value="Trigonometría">Trigonometría</SelectItem>
                                    <SelectItem value="Estadística">Estadística</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grade">
                                Curso <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.grade}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, grade: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1° Medio">1° Medio</SelectItem>
                                    <SelectItem value="2° Medio">2° Medio</SelectItem>
                                    <SelectItem value="3° Medio">3° Medio</SelectItem>
                                    <SelectItem value="4° Medio">4° Medio</SelectItem>
                                    <SelectItem value="Enseñanza Superior">
                                        Enseñanza Superior
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxStudents">
                            Límite de Estudiantes (0 = sin límite)
                        </Label>
                        <Input
                            id="maxStudents"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.maxStudents || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    maxStudents: parseInt(e.target.value) || 0,
                                })
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Clase'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
