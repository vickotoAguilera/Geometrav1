'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, Bot, Calculator, X, Camera } from 'lucide-react';
import Link from 'next/link';
import { TutorTeoricoChat } from './tutor-teorico-chat';
import { verificarTablaAction } from '@/app/verificador-tablas-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import html2canvas from 'html2canvas';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from '@/components/ui/label';
import { getGuiaEjercicio } from '@/app/funciones-matrices-actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Este componente contendrá los dos botones de ayuda
export function AyudaContextual({ 
    ejercicioId, 
    groupId, 
    onTeoricoToggle, 
    isTeoricoOpen 
}: { 
    ejercicioId: string; 
    groupId: string; 
    onTeoricoToggle: () => void;
    isTeoricoOpen: boolean;
}) {
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
              <Button
                variant={isTeoricoOpen ? 'default' : 'outline'}
                size="icon"
                className="h-9 w-9"
                onClick={onTeoricoToggle}
              >
                  <Calculator className="h-5 w-5"/>
              </Button>
          </TooltipTrigger>
          <TooltipContent>
              <p>Ayuda con el Tutor Teórico</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/applet-contextual?ejercicio=${ejercicioId}&grupo=${groupId}`} passHref>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <Bot className="h-5 w-5" />
                </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Resolver con Tutor de GeoGebra</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}


// Tabla Interactiva para la Actividad 1 de "La Rampa"
export const TablaActividad1 = () => {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [respuestas, setRespuestas] = useState(new Array(6).fill(''));
  const [resultados, setResultados] = useState<(boolean | null)[]>(new Array(6).fill(null));
  const [isTeoricoOpen, setIsTeoricoOpen] = useState(false);


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
        const correctas = res.resultados.filter(r => r === true).length;
        if(correctas === res.resultados.length){
            toast({ title: '¡Tabla Correcta!', description: 'Todos los valores son correctos. ¡Excelente trabajo!' });
        } else {
            toast({ title: 'Respuestas verificadas', description: 'Algunos valores son incorrectos. El tutor puede ayudarte a revisarlos.' });
        }
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
    <div className="space-y-4 my-6">
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
       <div className="flex gap-2">
            <Button onClick={handleVerificar} disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Verificar Tabla
            </Button>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant={isTeoricoOpen ? "default" : "outline"} size="icon" onClick={() => setIsTeoricoOpen(prev => !prev)} disabled={isPending}>
                            <Bot className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Ayuda del Tutor de Tablas</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
       </div>
       {isTeoricoOpen && (
        <div className="mt-4">
            <EjercicioInteractivo 
              key="tabla-actividad-1"
              groupId="la-rampa-actividad-1"
              contextFileName='la-rampa/tutor-calculadora/consolidado'
              tableRef={null}
            />
          </div>
       )}
    </div>
  );
};

export const TablaActividad4 = ({ onTeoricoToggle, isTeoricoOpen }: { onTeoricoToggle: () => void; isTeoricoOpen: boolean }) => {
    const { toast } = useToast();
    const [isPending, setIsPending] = useState(false);
    const [respuestas, setRespuestas] = useState(new Array(21).fill(''));
    const [resultados, setResultados] = useState<(boolean | null)[]>(new Array(21).fill(null));
    const tablaRef = useRef<HTMLDivElement>(null);


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
            const correctas = res.resultados.filter(r => r === true).length;
            if(correctas === res.resultados.length){
                toast({ title: '¡Tabla Correcta!', description: 'Todos los valores son correctos. ¡Excelente trabajo!' });
            } else {
                toast({ title: 'Respuestas verificadas', description: 'Algunos valores son incorrectos. El tutor puede ayudarte a revisarlos.' });
            }
        }).catch(err => {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo verificar la tabla 4.' });
        }).finally(() => setIsPending(false));
    };

    const renderInputCell = (index: number) => (
      <TableCell key={index}>
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
        <div className="space-y-4" ref={tablaRef}>
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
                            {Array.from({length: 7}).map((_, i) => renderInputCell(i))}
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-semibold">8%</TableCell>
                            {Array.from({length: 7}).map((_, i) => renderInputCell(i + 7))}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">6%</TableCell>
                            {Array.from({length: 7}).map((_, i) => renderInputCell(i + 14))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleVerificar} disabled={isPending} className="w-full">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Verificar Tabla
                </Button>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant={isTeoricoOpen ? "default" : "outline"} size="icon" onClick={onTeoricoToggle} disabled={isPending}>
                                <Bot className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Ayuda del Tutor de Tablas</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
             {isTeoricoOpen && (
                <div className="mt-4">
                    <EjercicioInteractivo 
                        key="tabla-actividad-4"
                        groupId="la-rampa-actividad-4"
                        contextFileName='la-rampa/tutor-calculadora/consolidado'
                        tableRef={tablaRef}
                    />
                </div>
            )}
        </div>
    );
};


interface EjercicioInteractivoProps {
  groupId: string;
  contextFileName: string;
  tableRef: React.RefObject<HTMLDivElement> | null;
}


export function EjercicioInteractivo({ groupId, contextFileName, tableRef }: EjercicioInteractivoProps) {
  const [loadedContext, setLoadedContext] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const loadContext = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const result = await getGuiaEjercicio(contextFileName);
        if ('content' in result) {
          setLoadedContext(result.content);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("Error cargando el contexto del ejercicio:", error);
        setLoadedContext(null);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadContext();
  }, [contextFileName]);

  const takeScreenshot = async (): Promise<string | null> => {
    if (!tableRef || !tableRef.current) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar la tabla para capturar.' });
      return null;
    }
    try {
      const canvas = await html2canvas(tableRef.current, { useCORS: true, logging: false, scale: window.devicePixelRatio });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({ variant: 'destructive', title: 'Error de Captura', description: 'No se pudo tomar la captura de pantalla de la tabla.' });
      return null;
    }
  };

  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="border-t pt-4 mt-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando tutor...</span>
      </div>
    );
  }

  if (isError) {
      return (
          <div className="border-t pt-4 mt-4 text-center text-red-500">
              <p>Error: No se pudo cargar el contexto para el tutor teórico.</p>
              <p className="text-xs text-muted-foreground">Por favor, revisa que el archivo de contexto exista.</p>
          </div>
      )
  }

  return (
    <div className="border rounded-lg shadow-md bg-background">
      {loadedContext !== null && (
        <TutorTeoricoChat 
          initialContext={loadedContext}
          groupId={groupId} 
          contextFileName={`${contextFileName}.md`}
          takeScreenshot={tableRef ? takeScreenshot : undefined}
        />
      )}
    </div>
  );
}
