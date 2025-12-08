'use client';

/**
 * Dialog para que alumnos se unan a una clase mediante código
 */

import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { joinClass } from '@/lib/class-utils';
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
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';

export function JoinClassDialog() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [code, setCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !firestore) {
            toast({
                title: 'Error',
                description: 'Debes iniciar sesión para unirte a una clase',
                variant: 'destructive',
            });
            return;
        }

        if (!code || code.length !== 6) {
            toast({
                title: 'Error',
                description: 'El código debe tener 6 caracteres',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await joinClass(firestore, {
                code: code.toUpperCase(),
                userId: user.uid,
            });

            if (result.success) {
                toast({
                    title: '✅ ¡Te has unido a la clase!',
                    description: result.message,
                });

                setCode('');
                setOpen(false);
            } else {
                toast({
                    title: 'Error al unirse a la clase',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error joining class:', error);
            toast({
                title: 'Error',
                description: 'Ocurrió un error al unirse a la clase',
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
                    <UserPlus className="w-5 h-5 mr-2" />
                    Unirse a Clase
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Unirse a una Clase</DialogTitle>
                    <DialogDescription>
                        Ingresa el código de 6 caracteres que te proporcionó tu profesor
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Código de Clase</Label>
                        <Input
                            id="code"
                            placeholder="ABC123"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="text-center text-2xl font-mono tracking-wider"
                            required
                        />
                        <p className="text-xs text-muted-foreground text-center">
                            El código tiene 6 caracteres (letras y números)
                        </p>
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
                        <Button type="submit" disabled={isLoading || code.length !== 6}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uniéndose...
                                </>
                            ) : (
                                'Unirse'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
