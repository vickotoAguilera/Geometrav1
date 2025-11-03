'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookText, CirclePlay, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TutorTeoricoChat } from './tutor-teorico-chat';
import { getGuiaEjercicio } from '@/app/funciones-matrices-actions';
import { Card, CardContent } from './ui/card';

interface EjercicioInteractivoProps {
  ejercicioId: string;
  groupId: string;
}

export function EjercicioInteractivo({ ejercicioId, groupId }: EjercicioInteractivoProps) {
  const [respuesta, setRespuesta] = useState('');
  const [guiaHtml, setGuiaHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const storageKey = `respuesta-${groupId}-${ejercicioId}`;

  useEffect(() => {
    const savedRespuesta = localStorage.getItem(storageKey);
    if (savedRespuesta) {
      setRespuesta(savedRespuesta);
    }

    const fetchGuia = async () => {
        setIsLoading(true);
        const result = await getGuiaEjercicio(ejercicioId);
        if ('htmlContent' in result) {
            setGuiaHtml(result.htmlContent);
        } else {
            console.error(result.error);
            setGuiaHtml('<p>Error al cargar la guía.</p>');
        }
        setIsLoading(false);
    };

    fetchGuia();
  }, [storageKey, ejercicioId]);

  const handleRespuestaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRespuesta = e.target.value;
    setRespuesta(newRespuesta);
    localStorage.setItem(storageKey, newRespuesta);
  };
  
  return (
    <div className="p-4 border rounded-lg bg-secondary/50 space-y-6">
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6" dangerouslySetInnerHTML={{ __html: guiaHtml || '' }} />
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="explicacion-teorica" className="border-none">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <AccordionTrigger className="flex-1 w-full">
                    <div className="py-2 px-4 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors w-full flex justify-center items-center gap-2 font-semibold">
                         <BookText className="mr-2 h-4 w-4" />
                         Consultar al Tutor Teórico
                    </div>
                </AccordionTrigger>
                <Link href={`/applet-contextual?ejercicio=${ejercicioId}&grupo=${groupId}`} passHref className="flex-1 w-full">
                    <div className="py-2 px-4 rounded-md border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full flex justify-center items-center gap-2 font-semibold">
                        <CirclePlay className="mr-2 h-4 w-4" />
                        Resolver con Tutor de GeoGebra
                    </div>
                </Link>
            </div>
            <AccordionContent className="mt-4">
                <TutorTeoricoChat ejercicioId={ejercicioId} groupId={groupId} />
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-2">
        <Label htmlFor={`respuesta-${ejercicioId}`} className="font-semibold">
          Tu Respuesta Final:
        </Label>
        <Input
          id={`respuesta-${ejercicioId}`}
          value={respuesta}
          onChange={handleRespuestaChange}
          placeholder="Ingresa aquí tu resultado si el ejercicio lo pide..."
        />
      </div>
    </div>
  );
}
