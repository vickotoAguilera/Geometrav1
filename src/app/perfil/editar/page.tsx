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
import { uploadProfilePhoto } from '@/app/profile-actions';

export default function EditarPerfilPage() {
    const { user } = useUser();
    const { profile, updateProfile, isLoading } = useUserProfile();
    const { toast } = useToast();

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

        try {
            setIsSaving(true);

            // Primero subir foto si hay una nueva
            let photoURL = profile?.photoURL || null;
            if (photoFile) {
                setIsUploadingPhoto(true);
                const formData = new FormData();
                formData.append('photo', photoFile);
                formData.append('userId', user.uid);

                const { url } = await uploadProfilePhoto(formData);
                photoURL = url;
                setIsUploadingPhoto(false);
            }

            // Actualizar perfil
            await updateProfile({
                displayName,
                bio,
                grade,
                photoURL,
            });

            toast({
                title: 'Perfil actualizado',
                description: 'Tus cambios han sido guardados exitosamente.',
            });
        } catch (error) {
            console.error('Error saving profile:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo guardar el perfil. Inténtalo de nuevo.',
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
                                <SelectItem value="Universidad">Universidad</SelectItem>
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
