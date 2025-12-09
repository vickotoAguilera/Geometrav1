'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { FilePanel } from './FilePanel';
import { TutorModeSelector } from './TutorModeSelector';
import { Message, TutorMode } from './types';
import { getAiResponse, processGoogleDriveFile } from '@/app/actions';
import { processLocalFile } from '@/app/actions-local-files';
import { DriveFilePicker } from '../drive/DriveFilePicker';
import { DriveFile } from '@/types/drive';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ChatBeta() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
    const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
    const [tutorMode, setTutorMode] = useState<TutorMode>('math');
    const [showClearDialog, setShowClearDialog] = useState(false);

    // Load tutor mode from localStorage
    useEffect(() => {
        const savedMode = localStorage.getItem('chatBeta_tutorMode') as TutorMode;
        if (savedMode) setTutorMode(savedMode);
    }, []);

    const handleModeChange = (mode: TutorMode) => {
        setTutorMode(mode);
        localStorage.setItem('chatBeta_tutorMode', mode);
    };

    const handleClearConversation = async () => {
        if (!user || !firestore) return;

        try {
            // Delete all messages
            const messagesToDelete = messages.filter(m => m.id);
            await Promise.all(
                messagesToDelete.map(msg =>
                    deleteDoc(doc(firestore, `users/${user.uid}/messages`, msg.id))
                )
            );
            setShowClearDialog(false);
        } catch (error) {
            console.error("Error clearing conversation:", error);
        }
    };

    // Load messages
    useEffect(() => {
        if (!user || !firestore) return;

        const q = query(
            collection(firestore, `users/${user.uid}/messages`),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    // Load Drive Token
    useEffect(() => {
        if (!user || !firestore) return;
        const loadToken = async () => {
            try {
                const docRef = doc(firestore, `users/${user.uid}/integrations/google-drive`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.accessToken) {
                        setDriveAccessToken(data.accessToken);
                    }
                }
            } catch (error) {
                console.error("Error loading drive token:", error);
            }
        };
        loadToken();
    }, [user, firestore]);

    const fileMessages = messages.filter(m => m.type === 'fileContext');
    const chatMessages = messages.filter(m => m.type === 'text' || m.type === 'chat');

    const handleSendMessage = async (content: string, screenshot?: string) => {
        if (!user || !firestore || isSending) return;

        setIsSending(true);

        try {
            // Group chunked files by groupId
            const fileGroups = new Map<string, Message[]>();
            fileMessages.forEach(file => {
                if (file.groupId) {
                    if (!fileGroups.has(file.groupId)) {
                        fileGroups.set(file.groupId, []);
                    }
                    fileGroups.get(file.groupId)!.push(file);
                }
            });

            // Reconstruct chunked files
            const reconstructedFiles = Array.from(fileGroups.values()).map(chunks => {
                // Sort by part number
                chunks.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));

                // Combine extracted content
                const combinedContent = chunks.map(c => c.extractedContent || '').join('');

                return {
                    ...chunks[0],
                    extractedContent: combinedContent,
                    fileName: chunks[0].fileName?.replace(/ - Parte \d+\/\d+/, '') || 'archivo',
                };
            });

            // Add standalone files (not chunked)
            const standaloneFiles = fileMessages.filter(f => !f.groupId);
            const allFiles = [...reconstructedFiles, ...standaloneFiles];

            // Save user message
            const userMessageData: any = {
                type: 'chat',
                role: 'user',
                content,
                createdAt: serverTimestamp(),
            };

            // Add screenshot if provided
            if (screenshot) {
                userMessageData.screenshot = screenshot;
            }

            await addDoc(collection(firestore, `users/${user.uid}/messages`), userMessageData);

            // Prepare history for AI
            const history = chatMessages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                content: [{ text: m.content }]
            }));

            // Prepare active files
            const activeFiles = allFiles.map(f => ({
                fileName: f.fileName || '',
                fileDataUri: f.extractedContent || f.fileDataUri || '',
            }));

            // Get AI response
            const response = await getAiResponse(
                content,
                history as any,
                tutorMode,
                screenshot, // imageQueryDataUri (screenshot)
                activeFiles
            );

            // Save AI response
            await addDoc(collection(firestore, `users/${user.uid}/messages`), {
                type: 'chat',
                role: 'assistant',
                content: response.response,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileSelect = async (file: File) => {
        if (!user || !firestore) return;

        try {
            // Mostrar toast de procesamiento
            const processingToast = toast({
                title: "🔄 Procesando archivo...",
                description: `Extrayendo contenido de ${file.name}`,
                duration: 30000, // 30 segundos
            });

            // Process file (extract text from PDFs/DOCX, convert images to base64)
            const processed = await processLocalFile(file);

            // Cerrar toast de procesamiento
            processingToast.dismiss();

            const CHUNK_SIZE = 900000; // 900KB per chunk
            const content = processed.extractedContent || '';

            // Check if file needs chunking
            if (content.length > CHUNK_SIZE) {
                // Large file - needs chunking
                const totalParts = Math.ceil(content.length / CHUNK_SIZE);
                const groupId = `group-${Date.now()}`;

                for (let i = 0; i < totalParts; i++) {
                    const chunkContent = content.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

                    await addDoc(collection(firestore, `users/${user.uid}/messages`), {
                        type: 'fileContext',
                        role: 'user',
                        fileName: `${file.name} - Parte ${i + 1}/${totalParts}`,
                        mimeType: file.type,
                        source: 'local',
                        fileSize: file.size,
                        isActive: true,
                        createdAt: serverTimestamp(),
                        extractedContent: chunkContent,
                        groupId,
                        partNumber: i + 1,
                        totalParts,
                    });
                }

                toast({
                    title: "✅ Archivo procesado",
                    description: `${file.name} dividido en ${totalParts} partes`,
                });
            } else {
                // Small file - no chunking needed
                const fileData: any = {
                    type: 'fileContext',
                    role: 'user',
                    fileName: file.name,
                    mimeType: file.type,
                    source: 'local',
                    fileSize: file.size,
                    isActive: true,
                    createdAt: serverTimestamp(),
                    extractedContent: content,
                };

                // Only add thumbnailBase64 if it exists
                if (processed.thumbnailBase64) {
                    fileData.thumbnailBase64 = processed.thumbnailBase64;
                }

                await addDoc(collection(firestore, `users/${user.uid}/messages`), fileData);

                toast({
                    title: "✅ Archivo listo",
                    description: `${file.name} agregado al contexto`,
                });
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            toast({
                variant: "destructive",
                title: "❌ Error al procesar archivo",
                description: error instanceof Error ? error.message : "Error desconocido",
            });
        }
    };

    const handleDriveFilesSelected = async (files: DriveFile[]) => {
        if (!user || !firestore || !driveAccessToken) return;

        setIsDrivePickerOpen(false);
        // TODO: Show global loading state for file processing?

        for (const file of files) {
            try {
                const result = await processGoogleDriveFile(file.id, user.uid, driveAccessToken);

                if (result.success && result.data) {
                    // Filter out undefined fields to avoid Firestore errors
                    const fileData: any = {
                        type: 'fileContext',
                        role: 'user',
                        fileName: result.data.fileName,
                        mimeType: result.data.mimeType,
                        source: 'google-drive',
                        driveFileId: result.data.driveFileId,
                        driveUrl: result.data.driveUrl,
                        fileSize: result.data.fileSize,
                        isActive: true,
                        createdAt: serverTimestamp(),
                    };

                    // Only add optional fields if they exist
                    if (result.data.extractedContent) fileData.extractedContent = result.data.extractedContent;
                    if (result.data.visualDescription) fileData.visualDescription = result.data.visualDescription;
                    if (result.data.detectedText) fileData.detectedText = result.data.detectedText;
                    if (result.data.detectedMath) fileData.detectedMath = result.data.detectedMath;
                    if (result.data.thumbnailBase64) fileData.thumbnailBase64 = result.data.thumbnailBase64;

                    await addDoc(collection(firestore, `users/${user.uid}/messages`), fileData);
                } else {
                    console.error("Error processing drive file:", result.error);
                }
            } catch (error) {
                console.error("Error processing drive file:", error);
            }
        }
    };

    const handleToggleFile = async (id: string, isActive: boolean) => {
        if (!user || !firestore) return;
        await updateDoc(doc(firestore, `users/${user.uid}/messages`, id), { isActive });
    };

    const handleDeleteFile = async (id: string) => {
        if (!user || !firestore) return;
        await deleteDoc(doc(firestore, `users/${user.uid}/messages`, id));
    };

    if (!user) {
        return (
            <div className="flex flex-col h-full items-center justify-center p-4 text-center">
                <p className="text-muted-foreground">Inicia sesión para usar el chat.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-semibold">Asistente Geometra</h1>
                    <div className="text-xs text-muted-foreground">v0.5</div>
                </div>
                <div className="flex items-center gap-2">
                    <TutorModeSelector mode={tutorMode} onModeChange={handleModeChange} />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowClearDialog(true)}
                        disabled={messages.length === 0}
                        title="Borrar conversación"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <FilePanel
                files={fileMessages}
                onToggle={handleToggleFile}
                onDelete={handleDeleteFile}
            />

            <MessageList messages={chatMessages} isLoading={isSending} fileMessages={fileMessages} />

            <ChatInput
                onSendMessage={handleSendMessage}
                onFileSelect={handleFileSelect}
                onOpenDrivePicker={() => setIsDrivePickerOpen(true)}
                isLoading={isSending}
            />

            {driveAccessToken && (
                <DriveFilePicker
                    isOpen={isDrivePickerOpen}
                    onClose={() => setIsDrivePickerOpen(false)}
                    onSelectFiles={handleDriveFilesSelected}
                    accessToken={driveAccessToken}
                    multiSelect={true}
                />
            )}

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Borrar conversación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará todos los mensajes y archivos adjuntos. No se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearConversation}>
                            Borrar todo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
