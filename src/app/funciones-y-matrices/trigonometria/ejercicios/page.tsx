'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Construction } from 'lucide-react';
import Link from 'next/link';
import { TeoremaAnguloCentralSVG } from '@/components/TeoremaAnguloCentralSVG';
import { LaRampaSVG } from '@/components/LaRampaSVG';


export default function PaginaEjerciciosTrigonometria() {

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground">Ejercicios Interactivos de Trigonometría</h1>
                    <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                        Elige un módulo para aplicar tus conocimientos con la ayuda de tutores de IA especializados.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Módulo 1.0: Teorema del Ángulo Central</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center">
                            <TeoremaAnguloCentralSVG className="w-full max-w-xs mx-auto my-4" />
                            <p className="text-sm text-muted-foreground text-center mt-4">
                                Resuelve problemas relacionados con ángulos inscritos y centrales en una circunferencia.
                            </p>
                        </CardContent>
                        <div className="p-6 pt-0">
                             <Link href="/funciones-y-matrices/trigonometria/ejercicios/plaza-skate" passHref>
                                <Button className="w-full">
                                    Iniciar Módulo <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                     <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Módulo 1.1: Aplicación de Razones Trigonométricas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center">
                             <LaRampaSVG className="w-full max-w-lg mx-auto my-4" />
                             <p className="text-sm text-muted-foreground text-center mt-4">
                                Calcula las dimensiones de una rampa usando seno, coseno y tangente.
                            </p>
                        </CardContent>
                         <div className="p-6 pt-0">
                            <Link href="/funciones-y-matrices/trigonometria/ejercicios/la-rampa" passHref>
                                <Button className="w-full">
                                    Iniciar Módulo <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="flex flex-col bg-muted/50 border-dashed">
                        <CardHeader>
                            <CardTitle>Módulo 1.2: Próximamente</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center">
                            <Construction className="w-16 h-16 text-muted-foreground/50 mx-auto my-4" />
                             <p className="text-sm text-muted-foreground text-center mt-4">
                                Nuevos desafíos y ejercicios interactivos estarán disponibles aquí muy pronto.
                            </p>
                        </CardContent>
                         <div className="p-6 pt-0">
                            <Button className="w-full" disabled>
                                En construcción
                            </Button>
                        </div>
                    </Card>

                </div>
            </main>
        </div>
    );
}
