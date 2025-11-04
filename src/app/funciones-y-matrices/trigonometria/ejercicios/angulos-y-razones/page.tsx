'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { MarkdownImage } from '@/components/markdown-image';
import { AyudaContextual, EjercicioInteractivo } from '@/components/ejercicio-interactivo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GeogebraIntegrado } from '@/components/geogebra-integrado';
import { Button } from '@/components/ui/button';
import { Bot, Calculator } from 'lucide-react';

const ejerciciosGeogebra = [
    { id: 'actividad-1', pregunta: '**Actividad 1:** ¿Cuál es la dirección del sitio web de GeoGebra Clásico?', respuestaCorrecta: 'https://www.geogebra.org/classic' },
    { id: 'actividad-2', pregunta: '**Actividad 2:** ¿Qué comando se utiliza para crear un triángulo con los vértices A=(0,0), B=(4,0) y C=(4,3)?', respuestaCorrecta: 'Polígono(A,B,C)' },
    { id: 'actividad-3', pregunta: '**Actividad 3:** ¿Qué comando se usa para convertir π/3 radianes a grados?', respuestaCorrecta: 'Ángulo(pi/3)' },
    { id: 'actividad-4', pregunta: '**Actividad 4:** ¿Qué comando se usa para calcular el seno de 30 grados?', respuestaCorrecta: 'sin(30°)' },
    { id: 'actividad-5', pregunta: '**Actividad 5:** ¿Qué comando se usa para calcular el coseno de 30 radianes?', respuestaCorrecta: 'cos(30rad)' },
    { id: 'actividad-6', pregunta: '**Actividad 6:** Si GeoGebra no usa gradianes, ¿qué cálculo debes escribir para encontrar `tan(50g)`?', respuestaCorrecta: 'tan(0.9*50°)' },
    { id: 'actividad-7', pregunta: '**Actividad 7:** ¿Qué comando usas para encontrar el ángulo (en grados) cuyo seno es 0.5?', respuestaCorrecta: 'asind(0.5)' },
    { id: 'actividad-8', pregunta: '**Actividad 8:** ¿Qué comando usas para encontrar el ángulo (en radianes) cuyo coseno es 0.5?', respuestaCorrecta: 'pi/180°*acosd(0.5)' },
    { id: 'actividad-9', pregunta: '**Actividad 9:** ¿Qué comando usas para encontrar el ángulo (en gradianes) cuyo tangente es 0.5?', respuestaCorrecta: '100/90°*atand(0.5)' },
];

const enunciadosGeogebra: Record<string, React.ReactNode> = {
    'actividad-1': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Ingresa a la siguiente dirección: https://www.geogebra.org/classic. <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/2.png" alt="Interfaz de GeoGebra Clásico" /></div>,
    'actividad-2': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Para construir el triángulo con vértices A = (0, 0), B = (4, 0) y C = (4, 3) y determinar las medidas de los ángulos interiores, ¿qué comando único debes usar después de definir los puntos? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/4.png" alt="Resultado de Actividad 2 en GeoGebra" /></div>,
    'actividad-3': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Para transformar la medida en radianes del ángulo π/3 a grados, ¿qué comando debes escribir en la barra de entrada? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/6.png" alt="Resultado de Actividad 3 en GeoGebra" /></div>,
    'actividad-4': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Para calcular el valor del seno de un ángulo que mide 30°, ¿qué comando escribes? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/8.png" alt="Resultado de Actividad 4 en GeoGebra" /></div>,
    'actividad-5': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Para calcular el valor del coseno de un ángulo que mide 30 radianes, ¿qué comando escribes? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/10.png" alt="Resultado de Actividad 5 en GeoGebra" /></div>,
    'actividad-6': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">GeoGebra no calcula directamente con gradianes. Para calcular la tangente de 50g, debes convertirlo a grados multiplicando por 0.9. ¿Qué comando final escribes? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/11.png" alt="Resultado de Actividad 6 en GeoGebra" /></div>,
    'actividad-7': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Para calcular la medida en grados de un ángulo cuyo valor de seno es 0.5, ¿qué comando utilizas? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/13.png" alt="Resultado de Actividad 7 en GeoGebra" /></div>,
    'actividad-8': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Para obtener el valor del ángulo en radianes cuyo coseno es 0.5, ¿qué comando debes escribir? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/15.png" alt="Resultado de Actividad 8 en GeoGebra" /></div>,
    'actividad-9': <div className="prose prose-invert max-w-none text-muted-foreground mb-4">Para obtener el valor en gradianes del ángulo cuyo tangente es 0.5, ¿qué comando debes escribir? <MarkdownImage src="/imagenes-ejercicios/imagenes Actividad tecnológica 1 Ángulos y razones trigonométricas/17.png" alt="Resultado de Actividad 9 en GeoGebra" /></div>
};

const ejerciciosCalculadora = [
    { id: 'actividad-10', pregunta: '**Actividad 10:** Configura tu calculadora en modo DEG. ¿Qué resultado obtienes al calcular `sin(30°)`?', respuestaCorrecta: '0.5' },
    { id: 'actividad-11', pregunta: '**Actividad 11:** En modo DEG, ¿cuál es el resultado de `cos(30°)`?', respuestaCorrecta: '0.8660' },
    { id: 'actividad-12', pregunta: '**Actividad 12:** En modo DEG, ¿cuál es el resultado de `tan(30°)`?', respuestaCorrecta: '0.5774' },
    { id: 'actividad-13', pregunta: '**Actividad 13:** En modo DEG, ¿qué ángulo obtienes con `sin⁻¹(0.5)`?', respuestaCorrecta: '30' },
    { id: 'actividad-14', pregunta: '**Actividad 14:** En modo DEG, ¿qué ángulo obtienes con `cos⁻¹(0.5)`?', respuestaCorrecta: '60' },
    { id: 'actividad-15', pregunta: '**Actividad 15:** En modo DEG, ¿qué ángulo obtienes con `tan⁻¹(0.5)`?', respuestaCorrecta: '26.57' },
    { id: 'actividad-16', pregunta: '**Actividad 16:** Configura en modo RAD. ¿Cuál es el resultado de `sin(30)`?', respuestaCorrecta: '-0.9880' },
    { id: 'actividad-19', pregunta: '**Actividad 19:** En modo RAD, ¿qué ángulo obtienes con `sin⁻¹(0.5)`?', respuestaCorrecta: '0.52' },
];

const videoCalculadora = `
### Video de Apoyo

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; height: auto; margin-bottom: 1rem; border-radius: 0.5rem;">
  <iframe 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    src="https://www.youtube.com/embed/eFROC2qbNFI" 
    title="YouTube video player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
`;


export default function AngulosYRazonesPage() {
    const [activeTeorico, setActiveTeorico] = useState<string | null>(null);
    
    const handleTeoricoToggle = (groupId: string) => {
        setActiveTeorico(prev => (prev === groupId ? null : groupId));
    };

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

                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Tarjeta para la Parte 1: GeoGebra */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Parte 1: Guía Interactiva de GeoGebra</CardTitle>
                            <CardDescription>Demuestra lo que sabes sobre los comandos de GeoGebra respondiendo a cada actividad.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <Accordion type="multiple" className="w-full">
                                {ejerciciosGeogebra.map(ej => (
                                    <AccordionItem value={ej.id} key={ej.id}>
                                        <AccordionTrigger>
                                            <h3 className="text-lg font-semibold text-left">{ej.pregunta}</h3>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {enunciadosGeogebra[ej.id]}
                                            <ButtonVerificarConceptual key={ej.id} ejercicio={ej} />
                                             <div className="flex justify-end pt-4 mt-4 border-t">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                         <Button variant="outline" size="sm">
                                                            <Bot className="mr-2 h-4 w-4" />
                                                            Ayuda con Tutor GeoGebra
                                                         </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
                                                        <GeogebraIntegrado 
                                                            ejercicioId={`angulos-y-razones/tutor-geogebra/actividad.md`}
                                                            grupoId={`angulos-y-razones-geogebra-${ej.id}`}
                                                            enunciado={enunciadosGeogebra[ej.id]}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    {/* Tarjeta para la Parte 2: Calculadora */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Parte 2: Guía de Calculadora Científica</CardTitle>
                            <CardDescription>Configura y utiliza tu calculadora para resolver problemas trigonométricos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                                <AccordionItem value="video-guia">
                                    <AccordionTrigger>Ver Guía y Video de Apoyo</AccordionTrigger>
                                    <AccordionContent>
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{videoCalculadora}</ReactMarkdown>
                                    </AccordionContent>
                                </AccordionItem>
                                {ejerciciosCalculadora.map(ej => (
                                    <AccordionItem value={ej.id} key={ej.id}>
                                         <AccordionTrigger>
                                            <h3 className="text-lg font-semibold text-left">{ej.pregunta}</h3>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ButtonVerificarConceptual key={ej.id} ejercicio={ej} />
                                             <div className="flex justify-end pt-4 mt-4 border-t">
                                                 <AyudaContextual
                                                    ejercicioId={ej.id}
                                                    groupId={`angulos-y-razones-calculadora-${ej.id}`}
                                                    onTeoricoToggle={() => handleTeoricoToggle(ej.id)}
                                                    isTeoricoOpen={activeTeorico === ej.id}
                                                    tutorType="calculadora"
                                                />
                                            </div>
                                            {activeTeorico === ej.id && (
                                               <div className="mt-4 border-t pt-4">
                                                    <EjercicioInteractivo 
                                                        groupId={`angulos-y-razones-calculadora-${ej.id}`}
                                                        initialContext={`Necesito ayuda con la siguiente pregunta de la calculadora: "${ej.pregunta}"`}
                                                    />
                                               </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
