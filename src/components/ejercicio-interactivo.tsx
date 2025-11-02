'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookText, CirclePlay } from 'lucide-react';
import Link from 'next/link';

interface EjercicioInteractivoProps {
  ejercicioId: string;
  groupId: string;
}

export function EjercicioInteractivo({ ejercicioId, groupId }: EjercicioInteractivoProps) {
  const [respuesta, setRespuesta] = useState('');
  
  // La clave de almacenamiento ahora depende del grupo del ejercicio.
  const storageKey = `respuesta-${groupId}-${ejercicioId}`;

  // Cargar la respuesta guardada al montar el componente.
  useEffect(() => {
    const savedRespuesta = localStorage.getItem(storageKey);
    if (savedRespuesta) {
      setRespuesta(savedRespuesta);
    }
  }, [storageKey]);

  // Guardar la respuesta en localStorage cada vez que cambia.
  const handleRespuestaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRespuesta = e.target.value;
    setRespuesta(newRespuesta);
    localStorage.setItem(storageKey, newRespuesta);
  };
  
  return (
    <div className="p-4 border rounded-lg bg-secondary/50 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button variant={'outline'}>
          <BookText className="mr-2 h-4 w-4" />
          Explicación Teórica (Próximamente)
        </Button>
        {/* Se pasa tanto el ID del ejercicio como el ID del grupo al applet */}
        <Link href={`/applet?ejercicio=${ejercicioId}&grupo=${groupId}`} passHref>
            <Button>
                <CirclePlay className="mr-2 h-4 w-4" />
                Resolver con Tutor IA en GeoGebra
            </Button>
        </Link>
      </div>

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
