'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, Bot, Calculator, X } from 'lucide-react';
import Link from 'next/link';
import { TutorTeoricoChat } from './tutor-teorico-chat';
import { verificarTablaAction } from '@/app/verificador-tablas-actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getGuiaEjercicio } from '@/app/funciones-matrices-actions';
import { Label } from '@/components/ui/label';
import { ButtonVerificarConceptual } from './modulo-ejercicios';


// Este componente contendrá los dos botones de ayuda
export function AyudaContextual({ ejercicioId, groupId, onTeoricoToggle, isTeoricoOpen }: { ejercicioId: string; groupId: string; onTeoricoToggle: () => void; isTeoricoOpen: boolean; }) {

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
              <Button
                variant="outline"
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
            <Link href={`/applet-contextual?ejercicio=plaza-skate/tutor-geogebra/consolidado&grupo=${groupId}`} passHref>
                <div className="h-9 w-9 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    <Bot className="h-5 w-5" />
                </div>
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
export const TablaActividad1 = ({ onVerify }: { onVerify: (results: (boolean | null)[]) => void }) => {
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
     onVerify(nuevosResultados);
  };

  const handleVerificar = () => {
    setIsPending(true);
    verificarTablaAction({
      tablaId: 'tabla-actividad-1',
      respuestasUsuario: respuestas,
    })
      .then((res) => {
        setResultados(res.resultados);
        onVerify(res.resultados);
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
       <Button onClick={handleVerificar} disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        Verificar Tabla 1
      </Button>
    </div>
  );
};

export const TablaActividad4 = ({ onVerify }: { onVerify: (results: (boolean | null)[]) => void }) => {
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
        onVerify(nuevosResultados);
    };

    const handleVerificar = () => {
        setIsPending(true);
        verificarTablaAction({
            tablaId: 'tabla-actividad-4',
            respuestasUsuario: respuestas,
        }).then(res => {
            setResultados(res.resultados);
            onVerify(res.resultados);
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
                            {renderInputCell(0)}
                            {renderInputCell(1)}
                            {renderInputCell(2)}
                            {renderInputCell(3)}
                            {renderInputCell(4)}
                            {renderInputCell(5)}
                            {renderInputCell(6)}
                        </TableRow>
                         <TableRow>
                            <TableCell className="font-semibold">8%</TableCell>
                            {renderInputCell(7)}
                            {renderInputCell(8)}
                            {renderInputCell(9)}
                            {renderInputCell(10)}
                            {renderInputCell(11)}
                            {renderInputCell(12)}
                            {renderInputCell(13)}
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-semibold">6%</TableCell>
                            {renderInputCell(14)}
                            {renderInputCell(15)}
                            {renderInputCell(16)}
                            {renderInputCell(17)}
                            {renderInputCell(18)}
                            {renderInputCell(19)}
                            {renderInputCell(20)}
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
  groupId: string;
  contextFileName: string;
}


export function EjercicioInteractivo({ groupId, contextFileName }: EjercicioInteractivoProps) {
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
      }
      setIsLoading(false);
    };

    loadContext();
  }, [contextFileName]);


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
              <p className="text-xs text-muted-foreground">Por favor, revisa que el archivo '{contextFileName}.md' exista y sea accesible.</p>
          </div>
      )
  }

  return (
    <div className="border-t pt-4 mt-4">
      {loadedContext !== null && (
        <TutorTeoricoChat 
          initialContext={loadedContext}
          groupId={groupId} 
          contextFileName={`${contextFileName}.md`}
        />
      )}
    </div>
  );
}
