'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Loader2 } from 'lucide-react';
import { DriveFilePicker } from '@/components/drive/DriveFilePicker';
import { useUser } from '@/firebase';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/config';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export default function TestDrivePage() {
    const { user } = useUser();
    const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
    const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<string>('');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<Array<{ role: string, content: string }>>([]);
    const [fileContent, setFileContent] = useState<string>('');

    // Cargar token de Drive desde Firestore
    useEffect(() => {
        if (!user) return;

        const loadDriveToken = async () => {
            try {
                const db = getFirestore(app);
                const driveConnectionRef = doc(db, `users/${user.uid}/integrations/google-drive`);
                const docSnap = await getDoc(driveConnectionRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const now = Date.now();

                    // Verificar si el token expiró
                    if (data.expiresAt && data.expiresAt > now) {
                        setDriveAccessToken(data.accessToken);
                        console.log('✅ Drive token cargado desde Firestore');
                    } else {
                        console.log('⚠️ Drive token expirado');
                        setDriveAccessToken(null);
                    }
                } else {
                    console.log('❌ No hay Drive token en Firestore');
                }
            } catch (error) {
                console.error('Error cargando Drive token:', error);
            }
        };

        loadDriveToken();
    }, [user]);

    const handleConnectDrive = () => {
        // Redirigir a la página de perfil para conectar Drive
        window.location.href = '/perfil';
    };

    const handleDriveFilesSelected = async (files: any[]) => {
        console.log('📁 Archivos seleccionados:', files);
        setSelectedFiles(files.map(f => ({
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
            size: f.sizeBytes || 0
        })));
        setIsDrivePickerOpen(false);

        // Procesar archivos
        setProcessing(true);
        setResult('Procesando archivos...');

        try {
            for (const file of files) {
                console.log(`🔄 Procesando: ${file.name}`);

                // Llamar a la función de procesamiento
                const response = await fetch('/api/test-drive-process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        driveFileId: file.id,
                        userId: user?.uid,
                        accessToken: driveAccessToken,
                    }),
                });

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`Error procesando ${file.name}: ${error}`);
                }

                const data = await response.json();
                console.log('✅ Resultado:', data);

                // Guardar contenido del archivo para la IA
                if (data.success && data.data) {
                    const content = `Archivo: ${data.data.fileName}\nTipo: ${data.data.type}\nTamaño: ${(data.data.downloadedSize / 1024).toFixed(2)} KB\n\nNota: ${data.data.note}`;
                    setFileContent(prev => prev + '\n\n' + content);
                }

                setResult(prev => prev + `\n\n✅ ${file.name}:\n${JSON.stringify(data, null, 2)}`);
            }

            setResult(prev => prev + '\n\n🎉 ¡Todos los archivos procesados correctamente!');
        } catch (error) {
            console.error('❌ Error:', error);
            setResult(prev => prev + `\n\n❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !fileContent) return;

        const userMessage = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setProcessing(true);

        try {
            const response = await fetch('/api/test-ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    fileContext: fileContent,
                }),
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta de la IA');
            }

            const data = await response.json();
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error:', error);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }]);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>🧪 Test: Procesamiento de Archivos de Drive</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Página de prueba para verificar que el procesamiento de archivos de Google Drive funciona correctamente.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Estado de conexión */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Estado:</h3>
                        <p>Usuario: {user ? `✅ ${user.email}` : '❌ No autenticado'}</p>
                        <p>Drive Token: {driveAccessToken ? '✅ Conectado' : '❌ No conectado'}</p>
                    </div>

                    {/* Botón para conectar Drive si no está conectado */}
                    {!driveAccessToken && (
                        <Button
                            onClick={handleConnectDrive}
                            variant="outline"
                            className="w-full"
                        >
                            🔗 Conectar Google Drive
                        </Button>
                    )}

                    {/* Botón para abrir Drive */}
                    {driveAccessToken && (
                        <Button
                            onClick={() => setIsDrivePickerOpen(true)}
                            disabled={processing}
                            className="w-full"
                        >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Seleccionar Archivos de Drive
                        </Button>
                    )}

                    {/* Archivos seleccionados */}
                    {selectedFiles.length > 0 && (
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">Archivos Seleccionados:</h3>
                            <ul className="space-y-1">
                                {selectedFiles.map(file => (
                                    <li key={file.id} className="text-sm">
                                        📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Resultado */}
                    {result && (
                        <div className="p-4 border rounded-lg bg-muted">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                Resultado:
                            </h3>
                            <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-96">
                                {result}
                            </pre>
                        </div>
                    )}

                    {/* Instrucciones */}
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                        <h3 className="font-semibold mb-2">📋 Instrucciones:</h3>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                            <li>Asegúrate de estar autenticado</li>
                            <li>Conecta Google Drive en /perfil si no lo has hecho</li>
                            <li>Haz clic en "Seleccionar Archivos de Drive"</li>
                            <li>Selecciona un archivo (PDF, imagen o DOCX)</li>
                            <li>Observa el resultado del procesamiento</li>
                        </ol>
                    </div>

                    {/* Chat con IA */}
                    {fileContent && (
                        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                            <h3 className="font-semibold mb-2">💬 Chat con IA sobre el archivo:</h3>

                            {/* Mensajes */}
                            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <p className="text-xs font-semibold">{msg.role === 'user' ? '👤 Tú:' : '🤖 IA:'}</p>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Pregunta sobre el archivo..."
                                    className="flex-1 px-3 py-2 border rounded text-sm"
                                    disabled={processing}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={processing || !chatInput.trim()}
                                    size="sm"
                                >
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Drive */}
            {driveAccessToken && (
                <DriveFilePicker
                    isOpen={isDrivePickerOpen}
                    onClose={() => setIsDrivePickerOpen(false)}
                    onSelectFiles={handleDriveFilesSelected}
                    multiSelect={true}
                    accessToken={driveAccessToken}
                />
            )}
        </div>
    );
}
