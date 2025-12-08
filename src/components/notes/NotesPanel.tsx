'use client';

import { useState, useEffect } from 'react';
import { X, Plus, FileText, Star, Download, Highlighter, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, useUser } from '@/firebase/provider';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Nota, Highlight } from '@/types/notes';
import NoteEditor from './NoteEditor';
import { cn } from '@/lib/utils';
import { exportNoteToPDF } from '@/lib/pdf-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotesPanelProps {
    temaId?: string;
    temaNombre?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function NotesPanel({ temaId, temaNombre, isOpen, onClose }: NotesPanelProps) {
    const { user } = useUser();
    const [notas, setNotas] = useState<Nota[]>([]);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [notaActual, setNotaActual] = useState<Nota | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notas');

    useEffect(() => {
        if (user && isOpen) {
            cargarDatos();
        }
    }, [user, isOpen, temaId]);

    const cargarDatos = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Cargar Notas
            let qNotas = query(
                collection(db, 'user_notes'),
                where('userId', '==', user.uid),
                orderBy('fecha_modificacion', 'desc')
            );

            if (temaId) {
                qNotas = query(
                    collection(db, 'user_notes'),
                    where('userId', '==', user.uid),
                    where('temaId', '==', temaId),
                    orderBy('fecha_modificacion', 'desc')
                );
            }

            const snapshotNotas = await getDocs(qNotas);
            const notasData = snapshotNotas.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                fecha_creacion: doc.data().fecha_creacion?.toDate() || new Date(),
                fecha_modificacion: doc.data().fecha_modificacion?.toDate() || new Date()
            })) as Nota[];

            setNotas(notasData);

            // Cargar Highlights (solo si hay temaId, ya que son específicos del tema)
            if (temaId) {
                const qHighlights = query(
                    collection(db, 'user_highlights'),
                    where('userId', '==', user.uid),
                    where('temaId', '==', temaId),
                    orderBy('fecha', 'desc')
                );

                const snapshotHighlights = await getDocs(qHighlights);
                const highlightsData = snapshotHighlights.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    fecha: doc.data().fecha?.toDate() || new Date()
                })) as Highlight[];

                setHighlights(highlightsData);
            }

        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const crearNota = async () => {
        if (!user) return;

        const nuevaNota: Omit<Nota, 'id'> = {
            userId: user.uid,
            temaId,
            temaNombre,
            titulo: 'Nueva nota',
            contenido: '',
            tags: [],
            favorito: false,
            fecha_creacion: new Date(),
            fecha_modificacion: new Date()
        };

        try {
            const docRef = await addDoc(collection(db, 'user_notes'), {
                ...nuevaNota,
                fecha_creacion: serverTimestamp(),
                fecha_modificacion: serverTimestamp()
            });

            const notaConId = { ...nuevaNota, id: docRef.id };
            setNotaActual(notaConId);
            setIsCreating(true);
            await cargarDatos();
        } catch (error) {
            console.error('Error creando nota:', error);
        }
    };

    const actualizarNota = async (contenido: string) => {
        if (!notaActual || !notaActual.id) return;

        try {
            await updateDoc(doc(db, 'user_notes', notaActual.id), {
                contenido,
                fecha_modificacion: serverTimestamp()
            });

            setNotaActual({ ...notaActual, contenido });
        } catch (error) {
            console.error('Error actualizando nota:', error);
        }
    };

    const eliminarNota = async (notaId: string) => {
        try {
            await deleteDoc(doc(db, 'user_notes', notaId));
            await cargarDatos();
            if (notaActual?.id === notaId) {
                setNotaActual(null);
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Error eliminando nota:', error);
            alert('Error al eliminar la nota: ' + (error as Error).message);
        }
    };

    const eliminarHighlight = async (highlightId: string) => {
        console.log('Intentando eliminar highlight con ID:', highlightId);

        if (!highlightId) {
            console.error('ID de highlight inválido');
            alert('Error: No se puede eliminar un resaltado sin ID');
            return;
        }

        try {
            console.log('Eliminando de Firestore...');
            await deleteDoc(doc(db, 'user_highlights', highlightId));
            console.log('Eliminado exitosamente, recargando datos...');
            await cargarDatos();
            console.log('Datos recargados');
        } catch (error) {
            console.error('Error eliminando highlight:', error);
            alert('Error al eliminar el resaltado: ' + (error as Error).message);
        }
    };

    const toggleFavorito = async (nota: Nota) => {
        if (!nota.id) return;

        try {
            await updateDoc(doc(db, 'user_notes', nota.id), {
                favorito: !nota.favorito
            });
            await cargarDatos();
        } catch (error) {
            console.error('Error actualizando favorito:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background border-l shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-muted/30">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {temaId ? 'Apuntes del Tema' : 'Mis Notas'}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <Tabs defaultValue="notas" className="flex-1 flex flex-col">
                <div className="px-4 pt-2">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="notas">Notas</TabsTrigger>
                        <TabsTrigger value="highlights" disabled={!temaId}>Resaltados</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="notas" className="flex-1 flex flex-col mt-0 h-full">
                    {isCreating && notaActual ? (
                        <div className="flex flex-col h-full">
                            <div className="border-b p-4">
                                <input
                                    type="text"
                                    value={notaActual.titulo}
                                    onChange={(e) => {
                                        setNotaActual({ ...notaActual, titulo: e.target.value });
                                        if (notaActual.id) {
                                            updateDoc(doc(db, 'user_notes', notaActual.id), {
                                                titulo: e.target.value
                                            });
                                        }
                                    }}
                                    className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none"
                                    placeholder="Título de la nota"
                                />
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                <NoteEditor
                                    contenido={notaActual.contenido}
                                    onUpdate={actualizarNota}
                                />
                            </ScrollArea>
                            <div className="border-t p-4 space-y-2 bg-muted/10">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => exportNoteToPDF(notaActual, temaId ? highlights : undefined)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNotaActual(null);
                                    }}
                                >
                                    Volver a la lista
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b">
                                <Button onClick={crearNota} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Nota
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 max-h-[calc(100vh-300px)]" style={{ height: '100%' }}>
                                {loading ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                                        Cargando...
                                    </div>
                                ) : notas.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>No hay notas aún</p>
                                        <p className="text-sm opacity-70">Crea tu primera nota para este tema</p>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-3">
                                        {notas.map((nota) => (
                                            <div
                                                key={nota.id}
                                                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all hover:shadow-sm bg-card"
                                                onClick={() => {
                                                    setNotaActual(nota);
                                                    setIsCreating(true);
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-medium line-clamp-1">{nota.titulo}</h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorito(nota);
                                                        }}
                                                        className="flex-shrink-0 hover:scale-110 transition-transform"
                                                    >
                                                        <Star
                                                            className={cn(
                                                                'h-4 w-4',
                                                                nota.favorito ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40'
                                                            )}
                                                        />
                                                    </button>
                                                </div>
                                                <div
                                                    className="text-sm text-muted-foreground line-clamp-2 mt-2"
                                                    dangerouslySetInnerHTML={{ __html: nota.contenido || '<span class="italic opacity-50">Sin contenido...</span>' }}
                                                />
                                                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground/60">
                                                    <span>
                                                        {nota.fecha_modificacion.toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            eliminarNota(nota.id!);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="highlights" className="flex-1 flex flex-col mt-0 overflow-hidden">
                    <ScrollArea className="flex-1 max-h-[calc(100vh-250px)]" style={{ height: '100%' }}>
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Cargando...
                            </div>
                        ) : highlights.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Highlighter className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>No hay textos resaltados</p>
                                <p className="text-sm opacity-70">Selecciona texto en el tema para resaltar</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {highlights.map((highlight) => (
                                    <div
                                        key={highlight.id}
                                        className="p-4 border rounded-lg bg-card hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "w-1 h-full min-h-[2rem] rounded-full flex-shrink-0",
                                                highlight.color === 'yellow' && "bg-yellow-400",
                                                highlight.color === 'green' && "bg-green-400",
                                                highlight.color === 'blue' && "bg-blue-400",
                                                highlight.color === 'pink' && "bg-pink-400",
                                            )} />
                                            <div className="flex-1">
                                                <p className="text-sm italic text-foreground/90 mb-2">
                                                    "{highlight.texto}"
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>
                                                        {highlight.fecha.toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (highlight.id) {
                                                                eliminarHighlight(highlight.id);
                                                            } else {
                                                                console.error('Highlight sin ID:', highlight);
                                                                alert('Error: Este resaltado no tiene ID');
                                                            }
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 p-1 rounded transition-colors"
                                                        title="Eliminar resaltado"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
