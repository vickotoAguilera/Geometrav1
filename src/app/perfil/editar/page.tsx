'use client';

/**
 * Página de edición del perfil de usuario
 */

import { useState } from 'react';
import { useUserProfile } from '@/firebase/hooks/use-user-profile';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { uploadProfilePhoto } from '@/app/profile-actions';
import { optimizeImage, validateImageFile } from '@/lib/r2-upload';

export default function EditarPerfilPage() {
    const { user } = useUser();
    const { profile, updateProfile, isLoading } = useUserProfile();
    const { toast } = useToast();
    const router = useRouter();

    const [displayName, setDisplayName] = useState(profile?.displayName || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [grade, setGrade] = useState(profile?.grade || '');
    const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photoURL || null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        console.log('🚀 [CLIENT] handleSave iniciado');
        console.log('👤 [CLIENT] User ID:', user.uid);
        console.log('📸 [CLIENT] ¿Hay foto nueva?', photoFile ? 'SÍ' : 'NO');

        try {
            setIsSaving(true);

            // Primero subir foto si hay una nueva
            let photoURL = profile?.photoURL || null;
            if (photoFile) {
                console.log('📤 [CLIENT] Iniciando upload de foto...');
                console.log('📦 [CLIENT] Archivo original:', {
                    name: photoFile.name,
                    size: photoFile.size,
                    type: photoFile.type
                });

                setIsUploadingPhoto(true);

                try {
                    // Validar archivo
                    console.log('✅ [CLIENT] Validando archivo...');
                    const validation = validateImageFile(photoFile);
                    console.log('📋 [CLIENT] Resultado validación:', validation);

                    if (!validation.valid) {
                        throw new Error(validation.error);
                    }

                    // Optimizar imagen en el cliente
                    console.log('🔄 [CLIENT] Optimizando imagen...');
                    const optimizedBlob = await optimizeImage(photoFile);
                    console.log('✅ [CLIENT] Imagen optimizada:', {
                        size: optimizedBlob.size,
                        type: optimizedBlob.type
                    });

                    // Subir blob optimizado a R2
                    console.log('📤 [CLIENT] Preparando FormData...');
                    const formData = new FormData();
                    formData.append('photo', optimizedBlob);
                    formData.append('userId', user.uid);
                    console.log('📤 [CLIENT] FormData preparado, llamando a uploadProfilePhoto...');

                    const { url } = await uploadProfilePhoto(formData);
                    console.log('✅ [CLIENT] Upload exitoso! URL:', url);
                    photoURL = url;

                    toast({
                        title: '✅ Foto subida a R2',
                        description: 'Tu foto de perfil se ha guardado correctamente',
                    });
                } catch (error) {
                    console.error('❌ [CLIENT] Error uploading photo:', error);
                    toast({
                        variant: 'destructive',
                        title: 'Error al subir foto',
                        description: error instanceof Error ? error.message : 'Error desconocido',
                    });
                    setIsUploadingPhoto(false);
                    return;
                }

                setIsUploadingPhoto(false);
            }


            // Actualizar perfil
            await updateProfile({
                displayName,
                bio,
                grade,
                photoURL,
            });

            // TEMPORALMENTE DESHABILITADO: Redirigir con query param para mostrar toast en la página de perfil
            // router.push('/perfil?saved=true');

            // Mostrar toast de éxito aquí mismo
            toast({
                title: '✅ Perfil actualizado',
                description: 'Tus cambios se han guardado correctamente. Revisa los logs abajo para ver el detalle del upload.',
            });
        } catch (error) {
            console.error('Error saving profile:', error);
            toast({
                variant: 'destructive',
                title: '❌ Error al guardar cambios',
                description: 'No se pudieron guardar tus cambios. Por favor, intenta de nuevo o contacta al administrador usando el botón de "Reportar Bug" en el menú.',
            });
        } finally {
            setIsSaving(false);
            setIsUploadingPhoto(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Cargando...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Perfil</CardTitle>
                        <CardDescription>Inicia sesión para editar tu perfil</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/perfil">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Editar Perfil</h1>
                    <p className="text-muted-foreground">Actualiza tu información personal</p>
                </div>
            </div>

            {/* Formulario */}
            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Foto de Perfil */}
                    <div className="space-y-2">
                        <Label>Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={photoPreview || undefined} />
                                <AvatarFallback className="text-2xl">
                                    {displayName?.charAt(0) || user.displayName?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <Label htmlFor="photo-upload">
                                    <Button variant="outline" size="sm" asChild>
                                        <span className="cursor-pointer">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Cambiar Foto
                                        </span>
                                    </Button>
                                </Label>
                                <p className="text-xs text-muted-foreground mt-2">
                                    JPG, PNG o WebP. Máximo 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Tu nombre"
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Cuéntanos sobre ti..."
                            rows={3}
                        />
                    </div>

                    {/* Curso */}
                    <div className="space-y-2">
                        <Label htmlFor="grade">Curso</Label>
                        <Select value={grade} onValueChange={setGrade}>
                            <SelectTrigger id="grade">
                                <SelectValue placeholder="Selecciona tu curso" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5° Básico">5° Básico</SelectItem>
                                <SelectItem value="6° Básico">6° Básico</SelectItem>
                                <SelectItem value="7° Básico">7° Básico</SelectItem>
                                <SelectItem value="8° Básico">8° Básico</SelectItem>
                                <SelectItem value="1° Medio">1° Medio</SelectItem>
                                <SelectItem value="2° Medio">2° Medio</SelectItem>
                                <SelectItem value="3° Medio">3° Medio</SelectItem>
                                <SelectItem value="4° Medio">4° Medio</SelectItem>
                                <SelectItem value="Enseñanza Superior">Enseñanza Superior</SelectItem>
                                {profile?.role === 'teacher' && (
                                    <SelectItem value="Docente">Docente</SelectItem>
                                )}
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 justify-end">
                        <Link href="/perfil">
                            <Button variant="outline">Cancelar</Button>
                        </Link>
                        <Button onClick={handleSave} disabled={isSaving || isUploadingPhoto}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isUploadingPhoto ? 'Subiendo foto...' : 'Guardando...'}
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

