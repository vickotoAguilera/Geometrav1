'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from 'react';
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';
import { TeoremaAnguloCentralSVG } from '@/components/TeoremaAnguloCentralSVG';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { AyudaContextual, EjercicioInteractivo } from '@/components/ejercicio-interactivo';


const ejerciciosPlazaSkate = [
    { id: 'angulo-central', pregunta: '**Ejercicio 1:** El ángulo inscrito `α` mide 20°. ¿Cuánto debe medir el ángulo central `2α` para que la cámara apunte correctamente al objeto sospechoso en C?', respuestaCorrecta: '40' },
    { id: 'conversion-radianes', pregunta: '**Ejercicio 2:** Si el ángulo de la cámara es de 40°, ¿cuál es su medida equivalente en radianes? Explica cómo se calcula y recuerda que `180° = π radianes`.', respuestaCorrecta: '2*pi/9' },
];


export default function NuevaPaginaEjercicios() {
    const [activeTeorico, setActiveTeorico] = useState<{isOpen: boolean, groupId: string | null}>({isOpen: false, groupId: null});

    const handleTeoricoToggle = (groupId: string) => {
        // La lógica del tutor teórico permanece desactivada por ahora
        // setActiveTeorico(prev => ({
        //     isOpen: prev.groupId !== groupId ? true : !prev.isOpen,
        //     groupId: groupId,
        // }));
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Ejercicios Interactivos de Trigonometría</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                        Resuelve los siguientes ejercicios. Podrás verificar tus respuestas con la IA.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-xl font-semibold">Módulo 1.0: Teorema del Ángulo Central (Plaza de Skate)</AccordionTrigger>
                            <AccordionContent>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Descripción del Problema</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="space-y-6">
                                            <div className="prose prose-invert max-w-none">
                                                <p>En el parque de una ciudad hay instaladas cámaras de vigilancia. La ubicada en el punto B, con un ángulo de 20°, detectó un objeto sospechoso en C. Para enfocar la cámara del centro O, se necesita saber el valor del ángulo central `2α`.</p>
                                                <TeoremaAnguloCentralSVG className="w-full max-w-xs mx-auto my-4" />
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {ejerciciosPlazaSkate.map((ej, index) => (
                                                    <div key={index} className="space-y-3 p-4 border rounded-lg bg-card">
                                                        <div className="text-sm font-medium text-foreground" dangerouslySetInnerHTML={{ __html: ej.pregunta.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                        <div className="flex items-start gap-2">
                                                            <Textarea
                                                                id={ej.id}
                                                                placeholder="Escribe aquí tu respuesta..."
                                                                disabled // Deshabilitado por ahora
                                                            />
                                                            <Button size="icon" variant="secondary" className="mt-1 flex-shrink-0" disabled>
                                                                <BookOpen className="h-4 w-4" />
                                                                <span className="sr-only">Verificar</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <AyudaContextual
                                                    ejercicioId="plaza-skate"
                                                    groupId="trigonometria-basica"
                                                    onTeoricoToggle={() => handleTeoricoToggle('trigonometria-basica')}
                                                    isTeoricoOpen={activeTeorico.isOpen && activeTeorico.groupId === 'trigonometria-basica'}
                                                />
                                            </div>

                                            {/* {activeTeorico.isOpen && activeTeorico.groupId === 'trigonometria-basica' && (
                                               <EjercicioInteractivo 
                                                    key="trigonometria-basica"
                                                    groupId="trigonometria-basica"
                                                    contextFileNames={['plaza-skate/tutor-geogebra/actividad', 'conversion-radianes/tutor-geogebra/actividad']}
                                               />
                                            )} */}
                                        </div>
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </main>
        </div>
    );
}