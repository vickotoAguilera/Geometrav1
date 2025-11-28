'use client';

/**
 * Componente para subir y editar foto de perfil
 * Sube imágenes a Cloudflare R2
 */

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { optimizeImage, validateImageFile } from '@/lib/r2-upload';
import { uploadProfilePhoto } from '@/app/profile-actions';
import { updateDoc, doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

interface ProfilePhotoUploadProps {
    currentPhotoURL?: string;
    displayName?: string;
    onPhotoUpdated?: (newPhotoURL: string) => void;
}

export function ProfilePhotoUpload({
    currentPhotoURL,
    displayName,
    onPhotoUpdated
}: ProfilePhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validar archivo
        const validation = validateImageFile(file);
        if (!validation.valid) {
            toast({
                title: '❌ Error',
                description: validation.error,
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsUploading(true);

            // Optimizar imagen en el cliente
            toast({
                title: '🔄 Optimizando imagen...',
                description: 'Preparando tu foto de perfil',
            });

            const optimizedBlob = await optimizeImage(file);

            // Crear preview
            const previewUrl = URL.createObjectURL(optimizedBlob);
            setPreviewURL(previewUrl);

            // Subir a R2
            toast({
                title: '📤 Subiendo a R2...',
                description: 'Guardando tu foto de perfil',
            });

            const formData = new FormData();
            formData.append('photo', optimizedBlob);
            formData.append('userId', user.uid);

            const { url } = await uploadProfilePhoto(formData);

            // Actualizar Firestore
            const userProfileRef = doc(firestore, 'users', user.uid, 'profile', 'data');
            await updateDoc(userProfileRef, {
                photoURL: url,
                updatedAt: new Date(),
            });

            toast({
                title: '✅ ¡Foto actualizada!',
                description: 'Tu foto de perfil se ha guardado correctamente',
            });

            onPhotoUpdated?.(url);

            // Limpiar preview después de un momento
            setTimeout(() => {
                URL.revokeObjectURL(previewUrl);
                setPreviewURL(null);
            }, 2000);

        } catch (error) {
            console.error('Error uploading photo:', error);
            toast({
                title: '❌ Error al subir foto',
                description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const displayPhotoURL = previewURL || currentPhotoURL;
    const initials = displayName?.charAt(0) || 'U';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Foto de Perfil
                </CardTitle>
                <CardDescription>
                    Sube una foto para personalizar tu perfil (máx. 5MB)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={displayPhotoURL} />
                            <AvatarFallback className="text-3xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Button
                            onClick={handleClick}
                            disabled={isUploading}
                            variant="outline"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {currentPhotoURL ? 'Cambiar foto' : 'Subir foto'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            JPG, PNG o WebP (máx. 5MB)
                        </p>
                    </div>
                </div>

                {displayPhotoURL && (
                    <div className="text-xs text-muted-foreground">
                        <p className="font-medium">URL de la foto:</p>
                        <p className="truncate">{displayPhotoURL}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
