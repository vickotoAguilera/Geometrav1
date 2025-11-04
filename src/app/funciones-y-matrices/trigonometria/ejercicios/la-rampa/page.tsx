'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AyudaContextual, EjercicioInteractivo } from '@/components/ejercicio-interactivo';
import { ButtonVerificarConceptual } from '@/components/modulo-ejercicios';
import Link from 'next/link';
import { MarkdownImage } from '@/components/markdown-image';

const ejerciciosRampa = [
    { id: 'calculo-altura', pregunta: '**Ejercicio 1:** ¿Cuál es la altura (N) de la rampa?', respuestaCorrecta: '2.1' },
    { id: 'calculo-hipotenusa', pregunta: '**Ejercicio 2:** ¿Cuál es la longitud de la superficie inclinada (H) de la rampa?', respuestaCorrecta: '10.2' },
];


export default function PaginaEjercicioRampa() {
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
                <div className="mb-8">
                     <Link href="/funciones-y-matrices/trigonometria/ejercicios" passHref>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a los Módulos
                        </Button>
                    </Link>
                </div>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Módulo 1.1: La Rampa</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                        Aplica las razones trigonométricas para resolver un problema de construcción real.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Descripción del Problema</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-6">
                                <div className="prose prose-invert max-w-none">
                                    <p>Se necesita construir una rampa de acceso. Se sabe que la distancia horizontal (D) que cubrirá es de 10 metros y el ángulo de inclinación (`α`) debe ser de 12°. Tu misión es calcular la altura o diferencia de nivel (N) y la longitud de la superficie inclinada de la rampa (H).</p>
                                    <MarkdownImage src="/imagenes-ejercicios/la-rampa-problema.png" alt="Diagrama de la rampa" />
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
                </div>
            </main>
        </div>
    );
}
