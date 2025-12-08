'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Nota } from '@/types/notes';
import Header from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star, Trash2, FileText, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoteEditor from '@/components/notes/NoteEditor';
import { cn } from '@/lib/utils';
import { exportNoteToPDF } from '@/lib/pdf-utils';

export default function MisNotasPage() {
    const { user } = useUser();
    const [notas, setNotas] = useState<Nota[]>([]);
    const [notasFiltradas, setNotasFiltradas] = useState<Nota[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [filtroFavoritos, setFiltroFavoritos] = useState(false);
    const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            cargarNotas();
        }
    }, [user]);

    useEffect(() => {
        filtrarNotas();
    }, [busqueda, filtroFavoritos, notas]);

    const cargarNotas = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const q = query(
                collection(db, 'user_notes'),
                where('userId', '==', user.uid),
                orderBy('fecha_modificacion', 'desc')
            );

            const snapshot = await getDocs(q);
            const notasData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                fecha_creacion: doc.data().fecha_creacion?.toDate() || new Date(),
                fecha_modificacion: doc.data().fecha_modificacion?.toDate() || new Date()
            })) as Nota[];

            setNotas(notasData);
        } catch (error) {
            console.error('Error cargando notas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarNotas = () => {
        let resultado = [...notas];

        if (busqueda) {
            resultado = resultado.filter(nota =>
                nota.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                nota.contenido.toLowerCase().includes(busqueda.toLowerCase()) ||
                nota.temaNombre?.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        if (filtroFavoritos) {
            resultado = resultado.filter(nota => nota.favorito);
        }

        setNotasFiltradas(resultado);
    };

    const eliminarNota = async (notaId: string) => {
        if (!confirm('¿Eliminar esta nota?')) return;

        try {
            await deleteDoc(doc(db, 'user_notes', notaId));
            await cargarNotas();
            if (notaSeleccionada?.id === notaId) {
                setNotaSeleccionada(null);
            }
        } catch (error) {
            console.error('Error eliminando nota:', error);
        }
    };

    const toggleFavorito = async (nota: Nota) => {
        if (!nota.id) return;

        try {
            await updateDoc(doc(db, 'user_notes', nota.id), {
                favorito: !nota.favorito
            });
            await cargarNotas();
        } catch (error) {
            console.error('Error actualizando favorito:', error);
        }
    };

    const actualizarNota = async (contenido: string) => {
        if (!notaSeleccionada || !notaSeleccionada.id) return;

        try {
            await updateDoc(doc(db, 'user_notes', notaSeleccionada.id), {
                contenido,
                fecha_modificacion: new Date()
            });
            setNotaSeleccionada({ ...notaSeleccionada, contenido });
        } catch (error) {
            console.error('Error actualizando nota:', error);
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container mx-auto py-8 px-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">Inicia sesión para ver tus notas</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Mis Notas</h1>
                    <p className="text-muted-foreground">
                        {notas.length} {notas.length === 1 ? 'nota' : 'notas'} en total
                    </p>
                </div>

                {/* Búsqueda y filtros */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar en notas..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant={filtroFavoritos ? 'default' : 'outline'}
                        onClick={() => setFiltroFavoritos(!filtroFavoritos)}
                    >
                        <Star className={cn('h-4 w-4 mr-2', filtroFavoritos && 'fill-current')} />
                        Favoritos
                    </Button>
                </div>

                {/* Grid de notas */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Cargando notas...</p>
                    </div>
                ) : notaSeleccionada ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                value={notaSeleccionada.titulo}
                                onChange={(e) => {
                                    setNotaSeleccionada({ ...notaSeleccionada, titulo: e.target.value });
                                    if (notaSeleccionada.id) {
                                        updateDoc(doc(db, 'user_notes', notaSeleccionada.id), {
                                            titulo: e.target.value
                                        });
                                    }
                                }}
                                className="text-2xl font-bold bg-transparent border-none focus:outline-none flex-1"
                            />
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => exportNoteToPDF(notaSeleccionada)} title="Exportar PDF">
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => setNotaSeleccionada(null)}>
                                    Volver a la lista
                                </Button>
                            </div>
                        </div>
                        {notaSeleccionada.temaNombre && (
                            <p className="text-sm text-muted-foreground">
                                Tema: {notaSeleccionada.temaNombre}
                            </p>
                        )}
                        <NoteEditor
                            contenido={notaSeleccionada.contenido}
                            onUpdate={actualizarNota}
                        />
                    </div>
                ) : notasFiltradas.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                            {busqueda || filtroFavoritos ? 'No se encontraron notas' : 'No tienes notas aún'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {notasFiltradas.map((nota) => (
                            <div
                                key={nota.id}
                                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => setNotaSeleccionada(nota)}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-semibold line-clamp-1">{nota.titulo}</h3>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorito(nota);
                                        }}
                                    >
                                        <Star
                                            className={cn(
                                                'h-4 w-4',
                                                nota.favorito ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                            )}
                                        />
                                    </button>
                                </div>

                                {nota.temaNombre && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {nota.temaNombre}
                                    </p>
                                )}

                                <div
                                    className="text-sm text-muted-foreground line-clamp-3 mb-3"
                                    dangerouslySetInnerHTML={{ __html: nota.contenido || 'Sin contenido' }}
                                />

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{nota.fecha_modificacion.toLocaleDateString()}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            eliminarNota(nota.id!);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
