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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';

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

const ejerciciosGeogebra = [
    {
        id: 'geogebra-actividad-2',
        pregunta: '**Actividad 2:** ¿Qué comando usas para crear un polígono con los vértices A, B y C?',
        respuestaCorrecta: 'Poligono(A,B,C)'
    },
    {
        id: 'geogebra-actividad-3',
        pregunta: '**Actividad 3:** ¿Qué comando usas para transformar 3π/2 radianes a grados?',
        respuestaCorrecta: 'Ángulo(3pi/2)'
    },
    {
        id: 'geogebra-actividad-4',
        pregunta: '**Actividad 4:** ¿Qué comando usas para calcular el seno de 30 grados?',
        respuestaCorrecta: 'sin(30°)'
    },
    {
        id: 'geogebra-actividad-7',
        pregunta: '**Actividad 7:** ¿Qué comando usas para encontrar el ángulo (en grados) cuyo seno es 0.5?',
        respuestaCorrecta: 'asind(0.5)'
    },
];

export default function AngulosYRazonesPage() {
    const [contenidoCalculadora, setContenidoCalculadora] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTeorico, setActiveTeorico] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const calculadoraRes = await getGuiaEjercicio('angulos-y-razones/tutor-calculadora/actividad');
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
                            <CardTitle>Parte 1: Guía Interactiva de GeoGebra</CardTitle>
                            <CardDescription>Demuestra lo que sabes sobre los comandos de GeoGebra.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose prose-invert max-w-none text-sm">
                                <p>Para esta sección, responde con el comando exacto que usarías en la barra de entrada de GeoGebra.</p>
                            </div>
                            {ejerciciosGeogebra.map(ej => (
                                <ButtonVerificarConceptual key={ej.id} ejercicio={ej} />
                            ))}
                            <div className="flex justify-end pt-4 mt-6 border-t">
                                <AyudaContextual
                                    ejercicioId="angulos-y-razones/tutor-geogebra/actividad"
                                    groupId="angulos-y-razones-geogebra"
                                    onTeoricoToggle={() => {}} // Se deshabilita para este caso
                                    isTeoricoOpen={false} 
                                    enunciado={null}
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
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Ver Guía de Uso de la Calculadora</AccordionTrigger>
                                    <AccordionContent>
                                        {contenidoCalculadora && <MarkdownRenderer content={contenidoCalculadora} />}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                             <div className="flex justify-end pt-4 mt-6 border-t">
                                 <AyudaContextual
                                    ejercicioId="angulos-y-razones/tutor-calculadora/actividad"
                                    groupId="angulos-y-razones-calculadora"
                                    onTeoricoToggle={() => handleTeoricoToggle('calculadora')}
                                    isTeoricoOpen={activeTeorico === 'calculadora'}
                                    enunciado={null}
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
