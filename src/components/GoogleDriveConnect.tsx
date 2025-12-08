'use client';

import { useState, useEffect } from 'react';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, FolderOpen, XCircle } from 'lucide-react';
import { useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface GoogleDriveConnection {
    isConnected: boolean;
    accessToken?: string;
    expiresAt?: number;
    email?: string;
}

export function GoogleDriveConnect() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [connection, setConnection] = useState<GoogleDriveConnection>({ isConnected: false });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Configurar el login de Google con los scopes de Drive
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse: TokenResponse) => {
            console.log('✅ OAuth Success:', tokenResponse);

            try {
                setLoading(true);

                const accessToken = tokenResponse.access_token;
                const expiresIn = tokenResponse.expires_in; // segundos
                const expiresAt = Date.now() + (expiresIn * 1000);

                // Obtener info del usuario de Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const userInfo = await userInfoResponse.json();

                // Guardar en Firestore
                if (user) {
                    const driveConnectionRef = doc(firestore, `users/${user.uid}/integrations/google-drive`);
                    await setDoc(driveConnectionRef, {
                        isConnected: true,
                        accessToken: accessToken,
                        expiresAt: expiresAt,
                        email: userInfo.email,
                        connectedAt: new Date().toISOString(),
                    });

                    setConnection({
                        isConnected: true,
                        accessToken,
                        expiresAt,
                        email: userInfo.email,
                    });

                    setMessage({ type: 'success', text: '✅ Google Drive conectado exitosamente!' });
                }
            } catch (error) {
                console.error('Error saving connection:', error);
                setMessage({ type: 'error', text: 'Error al guardar la conexión' });
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error('❌ OAuth Error:', error);
            setMessage({ type: 'error', text: 'Error al conectar con Google Drive' });
        },
        scope: 'https://www.googleapis.com/auth/drive',
    });


    // Cargar estado de conexión al montar
    useEffect(() => {
        if (user) {
            loadConnectionStatus();
        }
    }, [user]);

    const loadConnectionStatus = async () => {
        if (!user) return;

        try {
            const driveConnectionRef = doc(firestore, `users/${user.uid}/integrations/google-drive`);
            const docSnap = await getDoc(driveConnectionRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const now = Date.now();

                // Verificar si el token expiró
                if (data.expiresAt && data.expiresAt > now) {
                    setConnection({
                        isConnected: true,
                        accessToken: data.accessToken,
                        expiresAt: data.expiresAt,
                        email: data.email,
                    });
                } else {
                    // Token expirado
                    setConnection({ isConnected: false });
                    setMessage({ type: 'error', text: 'Tu conexión a Drive expiró. Reconecta para continuar.' });
                }
            }
        } catch (error) {
            console.error('Error loading connection status:', error);
        }
    };

    const handleConnect = () => {
        login();
    };

    const handleDisconnect = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const driveConnectionRef = doc(firestore, `users/${user.uid}/integrations/google-drive`);
            await setDoc(driveConnectionRef, { isConnected: false });

            setConnection({ isConnected: false });
            setMessage({ type: 'success', text: 'Google Drive desconectado' });
        } catch (error) {
            console.error('Error disconnecting:', error);
            setMessage({ type: 'error', text: 'Error al desconectar' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Google Drive
                </CardTitle>
                <CardDescription>
                    Conecta tu Google Drive para adjuntar archivos directamente en el chat
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {message && (
                    <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                        {message.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <XCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{message.text}</AlertDescription>
                    </Alert>
                )}

                {connection.isConnected ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Conectado</p>
                                {connection.email && (
                                    <p className="text-xs text-muted-foreground">{connection.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="default"
                                onClick={() => window.location.href = '/drive-manager'}
                                className="flex-1"
                            >
                                <FolderOpen className="w-4 h-4 mr-2" />
                                Ir al Gestor de Drive
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleDisconnect}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Desconectando...
                                    </>
                                ) : (
                                    'Desconectar'
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        onClick={handleConnect}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Conectando...
                            </>
                        ) : (
                            <>
                                <FolderOpen className="w-4 h-4 mr-2" />
                                Conectar Google Drive
                            </>
                        )}
                    </Button>
                )}

                <p className="text-xs text-muted-foreground">
                    Al conectar, autorizas a Geometra a acceder a tus archivos de Google Drive.
                    Puedes desconectar en cualquier momento.
                </p>
            </CardContent>
        </Card>
    );
}
