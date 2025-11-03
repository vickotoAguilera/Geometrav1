'use client';

import { useState, useEffect, createElement, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookText, CirclePlay, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TutorTeoricoChat } from './tutor-teorico-chat';
import { getGuiaEjercicio } from '@/app/funciones-matrices-actions';
import { verificarTablaAction } from '@/app/verificador-tablas-actions';
import { Card, CardContent } from './ui/card';
import { MarkdownImage } from './markdown-image';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeReact from 'rehype-react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Tabla Interactiva para la Actividad 1 de "La Rampa"
const TablaActividad1 = () => {
  const { toast } = useToast();
  const [isPending, startTransition] = useState(false);
  const [respuestas, setRespuestas] = useState(new Array(6).fill(''));
  const [resultados, setResultados] = useState<(boolean | null)[]>(new Array(6).fill(null));

  const handleInputChange = (index: number, value: string) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[index] = value;
    setRespuestas(nuevasRespuestas);
    // Limpiar resultado al cambiar la respuesta
    const nuevosResultados = [...resultados];
    nuevosResultados[index] = null;
    setResultados(nuevosResultados);
  };

  const handleVerificar = () => {
    startTransition(true);
    verificarTablaAction({
      tablaId: 'tabla-actividad-1',
      respuestasUsuario: respuestas,
    })
      .then((res) => {
        setResultados(res.resultados);
        toast({ title: 'Respuestas verificadas', description: 'Revisa los colores para ver los resultados.' });
      })
      .catch((err) => {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo verificar la tabla.' });
      })
      .finally(() => startTransition(false));
  };

  const celdas = [
    { label: 'Distancia horizontal (cm)', valorInicial: '100', respuestaIndex: 0 },
    { label: 'Distancia horizontal (cm)', valorInicial: '150', respuestaIndex: 1 },
    { label: 'Distancia horizontal (cm)', valorInicial: '50', respuestaIndex: 2 },
    { label: 'Distancia horizontal (cm)', valorInicial: '200', respuestaIndex: 3 },
    { label: 'Distancia horizontal (cm)', valorInicial: '300', respuestaIndex: 4 },
    { label: 'Distancia horizontal (cm)', valorInicial: '180', respuestaIndex: 5 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {celdas.map((celda, i) => (
          <div key={i} className="p-3 border rounded-lg bg-background space-y-2">
            <Label htmlFor={`celda-${i}`}>{celda.label}: <span className="font-bold">{celda.valorInicial}</span></Label>
            <p className="text-sm text-muted-foreground">Tu respuesta (Diferencia de nivel):</p>
            <Input
              id={`celda-${i}`}
              type="text"
              placeholder="Escribe el número"
              value={respuestas[celda.respuestaIndex]}
              onChange={(e) => handleInputChange(celda.respuestaIndex, e.target.value)}
              className={cn(
                'transition-colors',
                resultados[celda.respuestaIndex] === true && 'bg-green-100 dark:bg-green-900/50 border-green-500',
                resultados[celda.respuestaIndex] === false && 'bg-red-100 dark:bg-red-900/50 border-red-500'
              )}
            />
          </div>
        ))}
      </div>
       <Button onClick={handleVerificar} disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        Verificar Tabla
      </Button>
    </div>
  );
};


interface EjercicioInteractivoProps {
  ejercicioId: string;
  groupId: string;
}

const reactComponents = {
    // La clave 'img' es importante porque le dice al procesador:
    // "cuando encuentres una etiqueta <img>, en lugar de renderizarla
    // como una imagen normal, usa mi componente MarkdownImage".
    img: (props: any) => {
      // Decodificamos la ruta de la imagen que puede venir con caracteres especiales.
      const decodedSrc = decodeURIComponent(props.src);
      return createElement(MarkdownImage, { src: decodedSrc, alt: props.alt });
    },
    // También permitimos iframes para los videos.
    iframe: (props: any) => {
        return createElement('iframe', props);
    }
  };

export function EjercicioInteractivo({ ejercicioId, groupId }: EjercicioInteractivoProps) {
  const [respuesta, setRespuesta] = useState('');
  const [guiaContent, setGuiaContent] = useState<React.ReactNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const storageKey = `respuesta-${groupId}-${ejercicioId}`;

  useEffect(() => {
    const savedRespuesta = localStorage.getItem(storageKey);
    if (savedRespuesta) {
      setRespuesta(savedRespuesta);
    }

    const fetchAndProcessGuia = async () => {
        setIsLoading(true);
        const result = await getGuiaEjercicio(ejercicioId);
        if ('content' in result) {
            // Se procesa el contenido del archivo .md
            const processedContent = await unified()
                .use(remarkParse) // Parsea el Markdown
                .use(remarkRehype, { allowDangerousHtml: true }) // Lo convierte a un formato intermedio (hast)
                .use(rehypeRaw) // Permite el HTML crudo (como <iframe>)
                // Convierte el formato intermedio a React, usando nuestros componentes personalizados.
                // @ts-ignore
                .use(rehypeReact, { createElement, Fragment, jsx, jsxs, components: reactComponents })
                .process(result.content);
            setGuiaContent(processedContent.result);
        } else {
            console.error(result.error);
            setGuiaContent(<p>Error al cargar la guía.</p>);
        }
        setIsLoading(false);
    };

    fetchAndProcessGuia();
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
            <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6">
               {guiaContent}
               {/* Renderizado condicional de la tabla interactiva */}
               {ejercicioId === 'la-rampa' && <TablaActividad1 />}
            </CardContent>
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
