'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AyudaContextual, TablaActividad1, TablaActividad4 } from '@/components/ejercicio-interactivo';
import { useState } from 'react';
import Image from 'next/image';
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';

const ejerciciosPlazaSkate = [
    { id: 'tipo-triangulo', pregunta: '¿Qué tipo de triángulo representa las rampas dibujadas?', respuestaCorrecta: 'Triángulo rectángulo' },
    { id: 'semejanzas-diferencias', pregunta: '¿Qué semejanzas y diferencias observas entre ellas?', respuestaCorrecta: 'Semejanzas: Todas son triángulos rectángulos. Diferencias: Tienen distintas pendientes y, por lo tanto, distintos ángulos de inclinación.' },
    { id: 'angulo-12-porciento', pregunta: '¿Cuál es el ángulo para la pendiente del 12%?', respuestaCorrecta: '6.84' },
    { id: 'angulo-8-porciento', pregunta: '¿Y para la del 8%?', respuestaCorrecta: '4.57' },
    { id: 'angulo-6-porciento', pregunta: '¿Cuál debería ser el ángulo para una pendiente del 6%?', respuestaCorrecta: '3.43' },
    { id: 'funciones-inversas', pregunta: '¿Qué funciones te permiten encontrar un ángulo a partir de sus lados?', respuestaCorrecta: 'Arcoseno, Arcocoseno, Arcotangente' },
    { id: 'pendiente-4-grados', pregunta: 'Si una rampa debe tener 4° de inclinación, ¿cuál es su pendiente?', respuestaCorrecta: '7%' },
    { id: 'distancia-horizontal-4-grados', pregunta: 'Para esa misma rampa de 4°, si la altura a salvar es de 25 cm, ¿qué distancia horizontal se necesita?', respuestaCorrecta: '357.5' },
];


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
                            </div>
                            <div className="space-y-4 my-4">
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[0]} />
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[1]} />
                            </div>

                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 3: Medición de Ángulos</h3>
                             <div className="prose prose-invert max-w-none mb-4">
                                <p>Con la herramienta 'Ángulo' de GeoGebra, mide los ángulos de inclinación de las rampas que construiste. Luego, responde:</p>
                            </div>
                             <div className="space-y-4 my-4">
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[2]} />
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[3]} />
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[4]} />
                            </div>

                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 4: Razones Trigonométricas</h3>
                             <p className="text-muted-foreground mb-4 text-sm">Completa la tabla calculando el ángulo y las razones trigonométricas correspondientes a cada pendiente.</p>
                            <TablaActividad4 />

                            <h3 className="text-xl font-semibold mt-8 mb-4">Actividad 5: Cierre</h3>
                             <div className="prose prose-invert max-w-none mb-4">
                                <p>Utiliza los comandos de tu calculadora o GeoGebra para responder:</p>
                            </div>
                            <div className="space-y-4 my-4">
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[5]} />
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[6]} />
                                <ButtonVerificarConceptual ejercicio={ejerciciosPlazaSkate[7]} />
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
                                <div className="border rounded-lg mt-4">
                                    {/* Aquí puedes renderizar el componente del tutor teórico si es necesario */}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
