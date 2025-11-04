'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AyudaContextual, EjercicioInteractivo } from '@/components/ejercicio-interactivo';
import { useState } from 'react';
import { TeoremaAnguloCentralSVG } from '@/components/TeoremaAnguloCentralSVG';
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';

const ejerciciosPlazaSkate = [
    { id: 'angulo-central', pregunta: '**Ejercicio 1:** El ángulo inscrito `α` mide 20°. ¿Cuánto debe medir el ángulo central `2α` para que la cámara apunte correctamente al objeto sospechoso en C?', respuestaCorrecta: '40' },
    { id: 'conversion-radianes', pregunta: '**Ejercicio 2:** Si el ángulo de la cámara es de 40°, ¿cuál es su medida equivalente en radianes? Explica cómo se calcula y recuerda que `180° = π radianes`.', respuestaCorrecta: '2*pi/9' },
];

export default function PaginaPlazaSkate() {
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
                    <h1 className="text-4xl font-bold text-foreground">Módulo 1.0: Plaza de Skate</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                        Aplica el Teorema del Ángulo Central para resolver los desafíos de vigilancia en la plaza.
                    </p>
                </div>
                
                <div className="max-w-4xl mx-auto space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Descripción del Problema</CardTitle>
                             <CardDescription>
                                En el parque de una ciudad hay instaladas cámaras de vigilancia. La ubicada en el punto B, con un ángulo de 20°, detectó un objeto sospechoso en C. Para enfocar la cámara del centro O, se necesita saber el valor del ángulo central `2α`.
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-invert max-w-none mb-6">
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
                           
                            <div className="flex justify-end pt-4 mt-6">
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
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
