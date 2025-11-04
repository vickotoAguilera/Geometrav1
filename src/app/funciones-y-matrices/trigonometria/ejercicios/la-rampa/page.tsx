'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AyudaContextual, EjercicioInteractivo, TablaActividad1, TablaActividad4 } from '@/components/ejercicio-interactivo';
import { useState } from 'react';
import Image from 'next/image';
import { LaRampaSVG } from '@/components/LaRampaSVG';
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';

const ejerciciosRampa = [
    { id: 'calculo-altura', pregunta: '**Ejercicio 1:** ¿Cuál es la altura (N) de la rampa?', respuestaCorrecta: '2.1' },
    { id: 'calculo-hipotenusa', pregunta: '**Ejercicio 2:** ¿Cuál es la longitud de la superficie inclinada (H) de la rampa?', respuestaCorrecta: '10.2' },
];

export default function PaginaLaRampa() {
    const [activeTeorico, setActiveTeorico] = useState<{isOpen: boolean, groupId: string | null}>({isOpen: false, groupId: null});
    const [resultadosActividad1, setResultadosActividad1] = useState<(boolean | null)[]>([]);
    const [resultadosActividad4, setResultadosActividad4] = useState<(boolean | null)[]>([]);

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
                    <h1 className="text-4xl font-bold text-foreground">Módulo 1.1: La Rampa</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                        Aplica tus conocimientos sobre accesibilidad, pendientes y trigonometría en este desafío interactivo.
                    </p>
                </div>
                
                <div className="max-w-4xl mx-auto space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Situación de Modelación: La Rampa</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="prose prose-invert max-w-none mb-6">
                                <p>Las rampas son esenciales para garantizar la accesibilidad. La norma en Chile establece que la pendiente máxima permitida es del **12%** para distancias horizontales de hasta 1.5 metros, y se reduce a un **8%** para distancias mayores.</p>
                                <div className="flex justify-center">
                                    <Image src="/imagenes-ejercicios/rampa/imagen pendiente de ejemplo.jpg" alt="Ejemplo de pendiente en una rampa" width={500} height={200} className="rounded-lg shadow-md" />
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-semibold mt-8 mb-4">Actividad 1: Cálculo de Diferencia de Nivel</h3>
                            <p className="text-muted-foreground mb-4 text-sm">Completa la siguiente tabla calculando la "Diferencia de nivel" para cada rampa según su pendiente y distancia horizontal.</p>
                            <TablaActividad1 onVerify={setResultadosActividad1} />

                            <h3 className="text-lg font-semibold mt-8 mb-4">Actividad 4: Razones Trigonométricas</h3>
                             <p className="text-muted-foreground mb-4 text-sm">Completa la tabla calculando el ángulo y las razones trigonométricas correspondientes a cada pendiente.</p>
                            <TablaActividad4 onVerify={setResultadosActividad4} />

                            <div className="flex justify-end pt-4 mt-6">
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

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Problema Central</CardTitle>
                             <CardDescription>Usa los conceptos aprendidos para resolver el siguiente problema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-invert max-w-none mb-6">
                                <p>Se necesita construir una rampa de acceso. Se sabe que la distancia horizontal (D) que cubrirá es de 10 metros y el ángulo de inclinación (`α`) debe ser de 12°. Tu misión es calcular la altura o diferencia de nivel (N) y la longitud de la superficie inclinada de la rampa (H).</p>
                                <LaRampaSVG className="w-full max-w-lg mx-auto my-4" />
                            </div>
                            
                            <div className="space-y-4">
                                {ejerciciosRampa.map((ej) => (
                                    <ButtonVerificarConceptual 
                                        key={ej.id} 
                                        ejercicio={ej}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
