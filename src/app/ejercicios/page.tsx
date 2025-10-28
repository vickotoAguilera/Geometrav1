'use client';

import { useState, useRef } from 'react';
import Header from '@/components/header';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { Upload, FileText, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { uploadAndProcessDocument } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface UserDocument {
    id: string;
    fileName: string;
    createdAt: {
        toDate: () => Date;
    };
}

const FileUploadPlaceholder = ({ onUploadClick }: { onUploadClick: () => void }) => (
    <button
        onClick={onUploadClick}
        className="relative block w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center hover:border-primary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
    >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <span className="mt-2 block text-sm font-semibold text-foreground">
            Sube tu primer archivo
        </span>
        <p className="mt-1 block text-sm text-muted-foreground">
            Arrastra y suelta o haz clic para subir PDF, Word o TXT.
        </p>
    </button>
);

const DocumentList = ({ documents }: { documents: UserDocument[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg hover:border-primary/50 transition-all group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium truncate">{doc.fileName}</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">
                        Subido: {doc.createdAt.toDate().toLocaleDateString()}
                    </p>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </CardContent>
            </Card>
        ))}
    </div>
);


export default function EjerciciosPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const documentsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'userDocuments'), where('userId', '==', user.uid));
    }, [user, firestore]);

    const { data: documents, isLoading: isLoadingDocuments } = useCollection<UserDocument>(documentsQuery);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const fileDataUri = reader.result as string;
            try {
                await uploadAndProcessDocument(fileDataUri, file.name, user.uid);
                toast({
                    title: "Archivo procesado",
                    description: `${file.name} ha sido analizado y guardado.`,
                });
            } catch (error) {
                console.error("Error processing document:", error);
                toast({
                    variant: "destructive",
                    title: "Error al procesar",
                    description: "Hubo un problema al analizar tu archivo.",
                });
            } finally {
                setIsUploading(false);
                // Reset file input
                if(fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            toast({
                variant: "destructive",
                title: "Error al leer archivo",
                description: "No se pudo leer el archivo seleccionado.",
            });
            setIsUploading(false);
        };
    };

    const renderContent = () => {
        if (isUserLoading || (user && isLoadingDocuments)) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        if (!user) {
            return (
                <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
                    <p className="text-muted-foreground">Inicia sesión para subir tus ejercicios y ver tu historial.</p>
                </div>
            );
        }

        if (isUploading) {
             return (
                <div className="flex flex-col justify-center items-center h-64 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Analizando tu documento...</p>
                </div>
            );
        }

        if (!documents || documents.length === 0) {
            return <FileUploadPlaceholder onUploadClick={handleUploadClick} />;
        }

        return <DocumentList documents={documents} />;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
                disabled={isUploading}
            />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-primary-foreground/90">Ejercítate con la IA</h1>
                        <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                            Sube tus problemas y deja que Geometra te guíe. Tus archivos se guardarán para futuras consultas.
                        </p>
                    </div>
                    {user && (
                        <Button onClick={handleUploadClick} disabled={isUploading}>
                            {isUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <PlusCircle className="mr-2 h-4 w-4" />
                            )}
                            Subir Nuevo
                        </Button>
                    )}
                </div>

                <div className="mt-8">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
