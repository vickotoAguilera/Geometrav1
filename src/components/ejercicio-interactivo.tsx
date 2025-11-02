'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookText, CirclePlay } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TutorTeoricoChat } from './tutor-teorico-chat';

interface EjercicioInteractivoProps {
  ejercicioId: string;
  groupId: string;
}

export function EjercicioInteractivo({ ejercicioId, groupId }: EjercicioInteractivoProps) {
  const [respuesta, setRespuesta] = useState('');
  
  const storageKey = `respuesta-${groupId}-${ejercicioId}`;

  useEffect(() => {
    const savedRespuesta = localStorage.getItem(storageKey);
    if (savedRespuesta) {
      setRespuesta(savedRespuesta);
    }
  }, [storageKey]);

  const handleRespuestaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRespuesta = e.target.value;
    setRespuesta(newRespuesta);
    localStorage.setItem(storageKey, newRespuesta);
  };
  
  return (
    <div className="p-4 border rounded-lg bg-secondary/50 space-y-6">
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="explicacion-teorica" className="border-none">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <AccordionTrigger className="flex-1 w-full">
                    <div className="py-2 px-4 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors w-full flex justify-center items-center gap-2 font-semibold">
                         <BookText className="mr-2 h-4 w-4" />
                         Explicación Teórica
                    </div>
                </AccordionTrigger>
                <Link href={`/applet-contextual?ejercicio=${ejercicioId}&grupo=${groupId}`} passHref className="flex-1 w-full">
                    <div className="py-2 px-4 rounded-md border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full flex justify-center items-center gap-2 font-semibold">
                        <CirclePlay className="mr-2 h-4 w-4" />
                        Resolver con Tutor IA en GeoGebra
                    </div>
                </Link>
            </div>
            <AccordionContent>
                <TutorTeoricoChat ejercicioId={ejercicioId} groupId={groupId} />
            </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-2">
        <Label htmlFor={`respuesta-${ejercicioId}`} className="font-semibold">
          Tu Respuesta:
        </Label>
        <Input
          id={`respuesta-${ejercicioId}`}
          value={respuesta}
          onChange={handleRespuestaChange}
          placeholder="Ingresa aquí tu resultado..."
        />
      </div>
    </div>
  );
}
