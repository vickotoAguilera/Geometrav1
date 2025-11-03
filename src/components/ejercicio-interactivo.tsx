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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


// Tabla Interactiva para la Actividad 1 de "La Rampa"
const TablaActividad1 = () => {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
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
    setIsPending(true);
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
      .finally(() => setIsPending(false));
  };

  const celdas = [
    { label: '100 cm', respuestaIndex: 0, pendiente: '12%' },
    { label: '150 cm', respuestaIndex: 1, pendiente: '12%' },
    { label: '50 cm', respuestaIndex: 2, pendiente: '12%' },
    { label: '200 cm', respuestaIndex: 3, pendiente: '8%' },
    { label: '300 cm', respuestaIndex: 4, pendiente: '8%' },
    { label: '180 cm', respuestaIndex: 5, pendiente: '8%' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {celdas.map((celda, i) => (
          <div key={i} className="p-3 border rounded-lg bg-background space-y-2">
            <Label htmlFor={`celda-${i}`}>Distancia Horizontal (D): <span className="font-bold">{celda.label}</span></Label>
            <p className='text-xs text-muted-foreground'>Pendiente: {celda.pendiente}</p>
            <Input
              id={`celda-${i}`}
              type="text"
              placeholder="Diferencia de nivel..."
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
        Verificar Tabla 1
      </Button>
    </div>
  );
};

const TablaActividad4 = () => {
    const { toast } = useToast();
    const [isPending, setIsPending] = useState(false);
    const [respuestas, setRespuestas] = useState(new Array(21).fill(''));
    const [resultados, setResultados] = useState<(boolean | null)[]>(new Array(21).fill(null));

    const handleInputChange = (index: number, value: string) => {
        const nuevasRespuestas = [...respuestas];
        nuevasRespuestas[index] = value;
        setRespuestas(nuevasRespuestas);
        const nuevosResultados = [...resultados];
        nuevosResultados[index] = null;
        setResultados(nuevosResultados);
    };

    const handleVerificar = () => {
        setIsPending(true);
        verificarTablaAction({
            tablaId: 'tabla-actividad-4',
            respuestasUsuario: respuestas,
        }).then(res => {
            setResultados(res.resultados);
            toast({ title: 'Tabla 4 verificada', description: 'Revisa los colores para ver los resultados.' });
        }).catch(err => {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo verificar la tabla 4.' });
        }).finally(() => setIsPending(false));
    };

    const crearCeldaInput = (index: number) => (
        <TableCell>
            <Input
                type="text"
                placeholder="..."
                value={respuestas[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className={cn(
                    'w-24 text-center',
                    resultados[index] === true && 'bg-green-100 dark:bg-green-900/50 border-green-500',
                    resultados[index] === false && 'bg-red-100 dark:bg-red-900/50 border-red-500'
                )}
            />
        </TableCell>
    );

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Completa la tabla con los valores solicitados y luego verifica tus respuestas.</p>
            <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pendiente</TableHead>
                            <TableHead>Ángulo (α)</TableHead>
                            <TableHead>sen(α)</TableHead>
                            <TableHead>cos(α)</TableHead>
                            <TableHead>tan(α)</TableHead>
                            <TableHead>N/H</TableHead>
                            <TableHead>N/D</TableHead>
                            <TableHead>D/H</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-semibold">12%</TableCell>
                            {Array.from({ length: 7 }, (_, i) => crearCeldaInput(i))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">8%</TableCell>
                            {Array.from({ length: 7 }, (_, i) => crearCeldaInput(i + 7))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">6%</TableCell>
                            {Array.from({ length: 7 }, (_, i) => crearCeldaInput(i + 14))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <Button onClick={handleVerificar} disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Verificar Tabla 4
            </Button>
        </div>
    );
};


interface EjercicioInteractivoProps {
  ejercicioId: string;
  groupId: string;
}

const reactComponents = {
    // CORRECCIÓN: El nombre del componente debe empezar con Mayúscula.
    MarkdownImage: MarkdownImage,
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
            const processor = unified()
                .use(remarkParse)
                .use(remarkRehype, { allowDangerousHtml: true })
                .use(rehypeRaw)
                 // @ts-ignore
                .use(rehypeReact, { createElement, Fragment, jsx, jsxs, components: reactComponents });
            const processedContent = await processor.process(result.content);
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
               {ejercicioId === 'la-rampa' && (
                <>
                    <h3 id="actividad-1-interactiva">ACTIVIDAD 1 (interactiva)</h3>
                    <TablaActividad1 />
                    <h3 id="actividad-4-interactiva" className='mt-8'>ACTIVIDAD 4 (interactiva)</h3>
                    <TablaActividad4 />
                </>
               )}
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
