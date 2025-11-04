'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from 'react';
import { TeoremaAnguloCentralSVG } from '@/components/TeoremaAnguloCentralSVG';
import { LaRampaSVG } from '@/components/LaRampaSVG';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { AyudaContextual, EjercicioInteractivo } from '@/components/ejercicio-interactivo';
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';
import Link from 'next/link';


const ejerciciosPlazaSkate = [
    { id: 'angulo-central', pregunta: '**Ejercicio 1:** El ángulo inscrito `α` mide 20°. ¿Cuánto debe medir el ángulo central `2α` para que la cámara apunte correctamente al objeto sospechoso en C?', respuestaCorrecta: '40' },
    { id: 'conversion-radianes', pregunta: '**Ejercicio 2:** Si el ángulo de la cámara es de 40°, ¿cuál es su medida equivalente en radianes? Explica cómo se calcula y recuerda que `180° = π radianes`.', respuestaCorrecta: '2*pi/9' },
];

const ejerciciosRampa = [
    { id: 'calculo-altura', pregunta: '**Ejercicio 1:** ¿Cuál es la altura (N) de la rampa?', respuestaCorrecta: '2.1' },
    { id: 'calculo-hipotenusa', pregunta: '**Ejercicio 2:** ¿Cuál es la longitud de la superficie inclinada (H) de la rampa?', respuestaCorrecta: '10.2' },
];


export default function NuevaPaginaEjercicios() {
    const [activeTeorico, setActiveTeorico] = useState<{isOpen: boolean, groupId: string | null}>({isOpen: false, groupId: null});

    const handleTeoricoToggle = (groupId: string) => {
        setActiveTeorico(prev => ({
            isOpen: prev.groupId !== groupId ? true : !prev.isOpen,
            groupId: groupId,
        }));
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Ejercicios Interactivos de Trigonometría</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                        Resuelve los siguientes ejercicios. Podrás verificar tus respuestas con la IA y pedir ayuda a los tutores especializados.
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
                                                {ejerciciosPlazaSkate.map((ej) => (
                                                     <ButtonVerificarConceptual 
                                                        key={ej.id} 
                                                        ejercicio={ej}
                                                    />
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
                                             {activeTeorico.isOpen && activeTeorico.groupId === 'trigonometria-basica' && (
                                               <EjercicioInteractivo 
                                                    key="trigonometria-basica"
                                                    groupId="trigonometria-basica"
                                                    contextFileName={'plaza-skate/tutor-calculadora/consolidado'}
                                               />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                        
                         <AccordionItem value="item-2">
                            <AccordionTrigger className="text-xl font-semibold">Módulo 1.1: Aplicación de Razones Trigonométricas (La Rampa)</AccordionTrigger>
                             <AccordionContent>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Descripción del Problema</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="space-y-6">
                                            <div className="prose prose-invert max-w-none">
                                                <p>Se necesita construir una rampa de acceso. Se sabe que la distancia horizontal (D) que cubrirá es de 10 metros y el ángulo de inclinación (`α`) debe ser de 12°. Tu misión es calcular la altura o diferencia de nivel (N) y la longitud de la superficie inclinada de la rampa (H).</p>
                                                <LaRampaSVG className="w-full max-w-xs mx-auto my-4" />
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {ejerciciosRampa.map((ej) => (
                                                    <ButtonVerificarConceptual 
                                                        key={ej.id} 
                                                        ejercicio={ej}
                                                    />
                                                ))}
                                            </div>
                                        
                                            <div className="flex justify-end pt-4">
                                                <AyudaContextual
                                                    ejercicioId="la-rampa"
                                                    groupId="rampa-trigonometria"
                                                    onTeoricoToggle={() => handleTeoricoToggle('rampa-trigonometria')}
                                                    isTeoricoOpen={activeTeorico.isOpen && activeTeorico.groupId === 'rampa-trigonometria'}
                                                />
                                            </div>
                                            {activeTeorico.isOpen && activeTeorico.groupId === 'rampa-trigonometria' && (
                                                <EjercicioInteractivo 
                                                    key="rampa-trigonometria"
                                                    groupId="rampa-trigonometria"
                                                    contextFileName={'la-rampa/tutor-calculadora/consolidado'}
                                                />
                                            )}
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
