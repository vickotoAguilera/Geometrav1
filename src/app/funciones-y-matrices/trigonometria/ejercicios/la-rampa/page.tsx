'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AyudaContextual, EjercicioInteractivo, TablaActividad1, TablaActividad4 } from '@/components/ejercicio-interactivo';
import { useState } from 'react';
import Image from 'next/image';

export default function PaginaLaRampa() {
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
                            
                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 1: Cálculo de Diferencia de Nivel</h3>
                            <p className="text-muted-foreground mb-4 text-sm">Completa la siguiente tabla calculando la "Diferencia de nivel" para cada rampa según su pendiente y distancia horizontal.</p>
                            <TablaActividad1 />

                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 2: Construcción en GeoGebra</h3>
                             <div className="prose prose-invert max-w-none mb-4">
                                <p>Utiliza GeoGebra para dibujar las rampas de la tabla anterior usando el comando <code>Polígono</code>. Luego, responde:</p>
                                <ul>
                                    <li>¿Qué tipo de triángulo representa las rampas dibujadas?</li>
                                    <li>¿Qué semejanzas y diferencias observas entre ellas?</li>
                                </ul>
                                <div className="flex justify-center">
                                     <Image src="/imagenes-ejercicios/rampa/2.png" alt="Representación de una rampa en GeoGebra" width={500} height={300} className="rounded-lg shadow-md" />
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 3: Medición de Ángulos</h3>
                             <div className="prose prose-invert max-w-none mb-4">
                                <p>Con la herramienta 'Ángulo' de GeoGebra, mide los ángulos de inclinación de las rampas que construiste. Luego, responde:</p>
                                <ul>
                                    <li>¿Cuál es el ángulo para la pendiente del 12%?</li>
                                    <li>¿Y para la del 8%?</li>
                                    <li>¿Cuál debería ser el ángulo para una pendiente del 6%?</li>
                                </ul>
                                <div className="flex justify-center">
                                     <Image src="/imagenes-ejercicios/rampa/3.png" alt="Medición de ángulos en GeoGebra" width={500} height={300} className="rounded-lg shadow-md" />
                                </div>
                            </div>


                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 4: Razones Trigonométricas</h3>
                             <p className="text-muted-foreground mb-4 text-sm">Completa la tabla calculando el ángulo y las razones trigonométricas correspondientes a cada pendiente.</p>
                            <TablaActividad4 />

                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 5: Cierre</h3>
                             <div className="prose prose-invert max-w-none mb-4">
                                <p>Utiliza los comandos de tu calculadora o GeoGebra para responder:</p>
                                <ul>
                                    <li>¿Qué funciones te permiten encontrar un ángulo a partir de sus lados?</li>
                                    <li>Si una rampa debe tener 4° de inclinación, ¿cuál es su pendiente?</li>
                                    <li>Para esa misma rampa de 4°, si la altura a salvar es de 25 cm, ¿qué distancia horizontal se necesita?</li>
                                </ul>
                                <div className="flex justify-center">
                                     <Image src="/imagenes-ejercicios/rampa/5.png" alt="Cálculos en calculadora científica" width={500} height={150} className="rounded-lg shadow-md" />
                                </div>
                            </div>

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
                </div>
            </main>
        </div>
    );
}
