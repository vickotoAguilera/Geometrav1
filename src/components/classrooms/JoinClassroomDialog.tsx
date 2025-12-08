// Diálogo para que un alumno se una a un aula

'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { joinClassroom } from '@/lib/classroom-utils';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key } from 'lucide-react';

interface JoinClassroomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function JoinClassroomDialog({ open, onOpenChange }: JoinClassroomDialogProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');

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

        if (password.length !== 6) {
            toast({
                title: 'Error',
                description: 'La contraseña debe tener 6 caracteres',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await joinClassroom(password.toUpperCase(), user.uid);

            if (result.success) {
                toast({
                    title: '¡Te has unido al aula!',
                    description: result.message,
                });
                handleClose();
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
                description: 'No se pudo unir al aula',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Unirse a un Aula</DialogTitle>
                    <DialogDescription>
                        Ingresa la contraseña que te proporcionó tu profesor
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña del Aula</Label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="password"
                                placeholder="Ej: ABC123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value.toUpperCase())}
                                maxLength={6}
                                className="pl-10 text-2xl font-mono tracking-wider text-center"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            La contraseña tiene 6 caracteres
                        </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading || password.length !== 6} className="flex-1">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Unirse
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
