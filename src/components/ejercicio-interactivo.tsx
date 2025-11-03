'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Bot, Calculator, FileText } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
            <Link href={`/applet-contextual?ejercicio=${ejercicioId}&grupo=${groupId}`} passHref>
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

    const crearCeldaInput = (index: number) => (
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
  groupId: string;
  initialContextFiles: string[];
}


export function EjercicioInteractivo({ groupId, initialContextFiles }: EjercicioInteractivoProps) {
  const [activeContextFiles, setActiveContextFiles] = useState<string[]>([]);
  
  useEffect(() => {
    setActiveContextFiles(initialContextFiles);
  }, [initialContextFiles]);


  return (
    <div className="border-t pt-4 mt-4">
        <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-1">
                Archivos de Contexto Cargados en la IA ({activeContextFiles.length})
            </AccordionTrigger>
            <AccordionContent className="pt-2 space-y-1">
                {activeContextFiles.map(file => (
                    <div key={file} className="flex items-center p-2 rounded-md bg-muted/50 text-sm">
                        <FileText className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                        <span className="truncate font-medium text-primary">{file}.md</span>
                    </div>
                ))}
            </AccordionContent>
        </AccordionItem>
        </Accordion>
        <TutorTeoricoChat 
            activeContextFiles={activeContextFiles}
            groupId={groupId} 
        />
    </div>
  );
}