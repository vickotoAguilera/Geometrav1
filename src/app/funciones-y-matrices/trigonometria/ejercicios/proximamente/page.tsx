'use client';

import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function PaginaProximamente() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4 flex items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                           <Construction className="w-8 h-8 text-primary"/>
                           Módulo en Construcción
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Estamos trabajando en nuevos ejercicios interactivos para esta sección. ¡Vuelve pronto para descubrir más desafíos!
                        </p>
                         <Link href="/funciones-y-matrices/trigonometria/ejercicios" passHref>
                            <Button variant="outline" className="mt-6">
                                Volver al menú de ejercicios
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
