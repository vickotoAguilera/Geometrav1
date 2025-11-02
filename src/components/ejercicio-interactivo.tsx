'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookText, CirclePlay } from 'lucide-react';
import Link from 'next/link';

interface EjercicioInteractivoProps {
  ejercicioId: string;
}

export function EjercicioInteractivo({ ejercicioId }: EjercicioInteractivoProps) {
  const [respuesta, setRespuesta] = useState('');
  const [ayuda, setAyuda] = useState<'teoria' | 'geogebra' | null>(null);

  // --- INICIO DE LA LÓGICA DE PERSISTENCIA ---

  // Efecto para cargar la respuesta guardada desde localStorage al montar el componente.
  useEffect(() => {
    const savedRespuesta = localStorage.getItem(`respuesta-${ejercicioId}`);
    if (savedRespuesta) {
      setRespuesta(savedRespuesta);
    }
  }, [ejercicioId]);

  // Efecto para guardar la respuesta en localStorage cada vez que cambia.
  useEffect(() => {
    if (respuesta) {
      localStorage.setItem(`respuesta-${ejercicioId}`, respuesta);
    } else {
      // Si la respuesta está vacía, la eliminamos del storage.
      localStorage.removeItem(`respuesta-${ejercicioId}`);
    }
  }, [respuesta, ejercicioId]);
  
  // --- FIN DE LA LÓGICA DE PERSISTENCIA ---


  // En fases futuras, el contenido de la ayuda se cargará dinámicamente.
  const contenidoTeorico = "Aquí irá la explicación teórica paso a paso, sin dar el resultado final.";
  const contenidoGeoGebra = "Aquí irá la guía paso a paso para resolver el ejercicio usando GeoGebra.";


  return (
    <div className="p-4 border rounded-lg bg-secondary/50 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button variant={ayuda === 'teoria' ? 'default' : 'outline'} onClick={() => setAyuda(ayuda === 'teoria' ? null : 'teoria')}>
          <BookText className="mr-2 h-4 w-4" />
          Explicación Teórica
        </Button>
        <Link href={`/applet?ejercicio=${ejercicioId}`} passHref>
            <Button variant={ayuda === 'geogebra' ? 'default' : 'outline'}>
                <CirclePlay className="mr-2 h-4 w-4" />
                Resolver con GeoGebra
            </Button>
        </Link>
      </div>

      {ayuda && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {ayuda === 'teoria' ? contenidoTeorico : contenidoGeoGebra}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor={`respuesta-${ejercicioId}`} className="font-semibold">
          Tu Respuesta:
        </Label>
        <Input
          id={`respuesta-${ejercicioId}`}
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          placeholder="Ingresa aquí tu resultado..."
        />
      </div>
    </div>
  );
}
