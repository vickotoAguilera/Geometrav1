'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getGuiaEjercicio } from '@/app/funciones-matrices-actions';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { MarkdownImage } from '@/components/markdown-image';
import { Loader2 } from 'lucide-react';
import { AyudaContextual, EjercicioInteractivo } from '@/components/ejercicio-interactivo';

// Componente para renderizar el contenido de Markdown
const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            components={{
                img: (props) => <MarkdownImage src={props.src || ''} alt={props.alt || ''} />,
            }}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            className="prose prose-invert max-w-none"
        >
            {content}
        </ReactMarkdown>
    );
};

export default function AngulosYRazonesPage() {
    const [contenidoGeogebra, setContenidoGeogebra] = useState<string | null>(null);
    const [contenidoCalculadora, setContenidoCalculadora] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTeorico, setActiveTeorico] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const [geogebraRes, calculadoraRes] = await Promise.all([
                    getGuiaEjercicio('angulos-y-razones/tutor-geogebra/actividad'),
                    getGuiaEjercicio('angulos-y-razones/tutor-calculadora/actividad')
                ]);

                if ('content' in geogebraRes) setContenidoGeogebra(geogebraRes.content);
                if ('content' in calculadoraRes) setContenidoCalculadora(calculadoraRes.content);

            } catch (error) {
                console.error("Error cargando guías:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, []);
    
    const handleTeoricoToggle = (groupId: string) => {
        setActiveTeorico(prev => (prev === groupId ? null : groupId));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 container mx-auto py-8 px-4 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Módulo 1.2: Ángulos y Razones Trigonométricas</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                        Una guía interactiva para familiarizarte con el trabajo de ángulos y razones trigonométricas tanto en GeoGebra como en una calculadora científica.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Parte 1: Guía de GeoGebra</CardTitle>
                            <CardDescription>Aprende a usar los comandos de GeoGebra para trabajar con trigonometría.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contenidoGeogebra && <MarkdownRenderer content={contenidoGeogebra} />}
                             <div className="flex justify-end pt-4 mt-6 border-t">
                                <AyudaContextual
                                    ejercicioId="angulos-y-razones/tutor-geogebra/actividad"
                                    groupId="angulos-y-razones-geogebra"
                                    onTeoricoToggle={() => handleTeoricoToggle('geogebra')}
                                    isTeoricoOpen={false} // Ocultamos el tutor teórico
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Parte 2: Guía de Calculadora Científica</CardTitle>
                            <CardDescription>Configura y utiliza tu calculadora para resolver problemas trigonométricos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {contenidoCalculadora && <MarkdownRenderer content={contenidoCalculadora} />}
                             <div className="flex justify-end pt-4 mt-6 border-t">
                                 <AyudaContextual
                                    ejercicioId="angulos-y-razones/tutor-calculadora/actividad"
                                    groupId="angulos-y-razones-calculadora"
                                    onTeoricoToggle={() => handleTeoricoToggle('calculadora')}
                                    isTeoricoOpen={activeTeorico === 'calculadora'}
                                />
                            </div>
                            {activeTeorico === 'calculadora' && (
                                <EjercicioInteractivo
                                    groupId="angulos-y-razones-calculadora"
                                    contextFileName="angulos-y-razones/tutor-calculadora/actividad"
                                    tableRef={null}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    );
}
