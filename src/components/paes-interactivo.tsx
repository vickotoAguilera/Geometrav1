'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  generarPruebaPaesAction,
  retroalimentacionPaesAction,
} from '@/app/paes-actions';
import type {
  PaesPregunta,
  GeneradorPaesOutput,
  RetroalimentacionPaesOutput,
} from '@/ai/flows/schemas/generador-paes-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, XCircle, BrainCircuit, BookCheck, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


type Fase = 'configuracion' | 'cargando' | 'realizando' | 'revisando' | 'resultados';
type TipoPrueba = 'M1' | 'M2';

interface RespuestaUsuario {
  preguntaIndex: number;
  respuesta: string;
}

interface Resultado extends RetroalimentacionPaesOutput {
  pregunta: PaesPregunta;
  respuestaUsuario: string;
}

const TOTAL_PREGUNTAS = 50;
const LOTE_PREGUNTAS = 5;

export function PaesInteractivo() {
  const [fase, setFase] = useState<Fase>('configuracion');
  const [tipoPrueba, setTipoPrueba] = useState<TipoPrueba | null>(null);

  const [testData, setTestData] = useState<GeneradorPaesOutput | null>(null);
  const [respuestas, setRespuestas] = useState<RespuestaUsuario[]>([]);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ progress: 0, message: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (fase !== 'realizando' || !tipoPrueba || (testData?.preguntas.length ?? 0) >= TOTAL_PREGUNTAS) {
      return;
    }

    const fetchMoreQuestions = async () => {
      setIsFetchingMore(true);
      const lotesRestantes = (TOTAL_PREGUNTAS / LOTE_PREGUNTAS) - 1;
      let currentQuestions = testData?.preguntas ?? [];

      for (let i = 0; i < lotesRestantes; i++) {
        if(currentQuestions.length >= TOTAL_PREGUNTAS) break;

        try {
          const result = await generarPruebaPaesAction({ tipoPrueba });
          currentQuestions = [...currentQuestions, ...result.preguntas];
          
          setTestData({ preguntas: currentQuestions });
          setRespuestas(prev => {
              const newResponses = [...prev];
              for(let j = prev.length; j < currentQuestions.length; j++) {
                  newResponses[j] = {preguntaIndex: j, respuesta: ''};
              }
              return newResponses;
          });
          
          const progress = ((i + 2) / (TOTAL_PREGUNTAS / LOTE_PREGUNTAS)) * 100;
          setLoadingProgress({ 
            progress: progress, 
            message: `Preguntas cargadas: ${currentQuestions.length} de ${TOTAL_PREGUNTAS}` 
          });

        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Error al cargar más preguntas',
            description: "No se pudieron cargar más preguntas. Puedes continuar con las actuales.",
          });
          break; 
        }
      }
      setIsFetchingMore(false);
    };

    if(!isFetchingMore) {
        fetchMoreQuestions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, tipoPrueba]);


  const handleStart = (prueba: TipoPrueba) => {
    setTipoPrueba(prueba);
    setFase('cargando');
    setLoadingProgress({ progress: 10, message: 'Generando primer lote de preguntas...' });

    startTransition(async () => {
      try {
        const result: GeneradorPaesOutput = await generarPruebaPaesAction({ tipoPrueba: prueba });
        if (result.preguntas && result.preguntas.length > 0) {
          setTestData(result);
          setRespuestas(
            Array.from({ length: TOTAL_PREGUNTAS }, (_, index) => ({
              preguntaIndex: index,
              respuesta: '',
            }))
          );
          setPreguntaActualIndex(0);
          setLoadingProgress({ progress: (LOTE_PREGUNTAS / TOTAL_PREGUNTAS) * 100, message: `Preguntas cargadas: ${result.preguntas.length} de ${TOTAL_PREGUNTAS}`});
          setFase('realizando');
        } else {
          throw new Error("La IA no generó el primer lote de preguntas.");
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error al generar la prueba',
          description: error instanceof Error ? error.message : "Hubo un problema al contactar a la IA.",
        });
        setFase('configuracion');
      }
    });
  };
  
  const handleRespuestaChange = (respuesta: string) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActualIndex] = { preguntaIndex: preguntaActualIndex, respuesta };
    setRespuestas(nuevasRespuestas);
  };

  const irAPregunta = (index: number) => {
    if (testData && index >= 0 && index < testData.preguntas.length) {
      setPreguntaActualIndex(index);
    }
  };

  const handleToggleFlag = (index: number) => {
    setFlaggedQuestions(prev => {
      if(prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    })
  }

  const handleFinish = () => {
    if (!testData) return;
    setFase('revisando');
    startTransition(async () => {
        try {
            const finalRespuestas = testData.preguntas.map((_, index) => {
                return respuestas[index] || { preguntaIndex: index, respuesta: '' };
            });

            const revisiones = await Promise.all(
                testData.preguntas.map((pregunta, index) => 
                    retroalimentacionPaesAction({
                        pregunta: pregunta,
                        respuestaUsuario: finalRespuestas[index].respuesta,
                    })
                )
            );
            const resultadosFinales = revisiones.map((revision, index) => ({
                ...revision,
                pregunta: testData.preguntas[index],
                respuestaUsuario: finalRespuestas[index].respuesta,
            }));
            setResultados(resultadosFinales);
            setFase('resultados');
        } catch(error) {
            console.error(error);
            toast({
              variant: 'destructive',
              title: 'Error al revisar la prueba',
              description: "No se pudo obtener la retroalimentación de la IA.",
            });
            setFase('realizando');
        }
    });
  }

  const reset = () => {
    setFase('configuracion');
    setTipoPrueba(null);
    setTestData(null);
    setRespuestas([]);
    setResultados([]);
    setPreguntaActualIndex(0);
    setLoadingProgress({ progress: 0, message: '' });
    setFlaggedQuestions([]);
  }

  if (fase === 'configuracion') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Elige tu Ensayo PAES</CardTitle>
          <CardDescription>Selecciona la prueba de matemática que deseas rendir. Se generará un ensayo de {TOTAL_PREGUNTAS} preguntas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full h-20 text-lg" onClick={() => handleStart('M1')} disabled={isPending}>
            {isPending && tipoPrueba === 'M1' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <BookCheck className="mr-3 h-6 w-6" />}
            Iniciar Ensayo M1 (Obligatoria)
          </Button>
          <Button variant="secondary" className="w-full h-20 text-lg" onClick={() => handleStart('M2')} disabled={isPending}>
             {isPending && tipoPrueba === 'M2' ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <BrainCircuit className="mr-3 h-6 w-6" />}
             Iniciar Ensayo M2 (Electiva)
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (fase === 'cargando') {
    return (
        <div className="text-center max-w-md mx-auto space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Preparando tu ensayo PAES...</p>
            <Progress value={loadingProgress.progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{loadingProgress.message}</p>
        </div>
    )
  }

  if (fase === 'revisando') {
     return (
        <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">El Tutor IA está revisando tus respuestas...</p>
        </div>
    )
  }

  if (fase === 'realizando' && testData) {
    const pregunta = testData.preguntas[preguntaActualIndex];
    const totalPreguntasCargadas = testData.preguntas.length;
    const preguntasSinResponder = respuestas.slice(0, totalPreguntasCargadas).filter(r => !r.respuesta.trim()).length;

    return (
        <div className='max-w-4xl mx-auto space-y-4'>
            {isFetchingMore && (
                <div className="p-2 rounded-lg bg-secondary">
                    <div className="flex justify-between items-center text-sm text-secondary-foreground mb-1 px-1">
                        <span>Cargando más preguntas en segundo plano...</span>
                        <span>{totalPreguntasCargadas}/{TOTAL_PREGUNTAS}</span>
                    </div>
                    <Progress value={(totalPreguntasCargadas / TOTAL_PREGUNTAS) * 100} className="w-full h-2" />
                </div>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle>Navegación de Preguntas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {Array.from({ length: totalPreguntasCargadas }, (_, i) => i).map(index => {
                         const isAnswered = respuestas[index]?.respuesta.trim() !== '';
                         const isFlagged = flaggedQuestions.includes(index);
                         
                         return (
                            <Button
                                key={index}
                                variant={isAnswered ? 'default' : 'outline'}
                                className={cn(
                                    "h-10 w-10",
                                    preguntaActualIndex === index && 'ring-2 ring-ring ring-offset-2',
                                    isFlagged && !isAnswered && "bg-yellow-400/20 border-yellow-500 hover:bg-yellow-400/30 text-yellow-700 dark:text-yellow-400"
                                )}
                                onClick={() => irAPregunta(index)}
                            >
                                {index + 1}
                            </Button>
                         )
                    })}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle>Pregunta {preguntaActualIndex + 1} de {totalPreguntasCargadas}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleFlag(preguntaActualIndex)} title="Marcar pregunta para revisar">
                            <Flag className={cn("h-5 w-5", flaggedQuestions.includes(preguntaActualIndex) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground')}/>
                        </Button>
                    </div>
                    <CardDescription className="text-lg pt-4 whitespace-pre-wrap">{pregunta.pregunta}</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup 
                        value={respuestas[preguntaActualIndex]?.respuesta || ''}
                        onValueChange={handleRespuestaChange}
                        className="space-y-2"
                    >
                        {pregunta.alternativas.map((alt, i) => (
                            <div key={i} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:bg-secondary has-[:checked]:border-primary">
                                <RadioGroupItem value={alt} id={`alt-${i}`} />
                                <Label htmlFor={`alt-${i}`} className="flex-1 cursor-pointer">{String.fromCharCode(65 + i)}) {alt}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => irAPregunta(preguntaActualIndex - 1)} disabled={preguntaActualIndex === 0}>
                        <ArrowLeft className="mr-2" /> Anterior
                    </Button>
                    {preguntaActualIndex < totalPreguntasCargadas - 1 ? (
                        <Button onClick={() => irAPregunta(preguntaActualIndex + 1)}>
                            Siguiente <ArrowRight className="ml-2" />
                        </Button>
                    ) : (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isPending || isFetchingMore}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isFetchingMore ? 'Cargando...' : 'Terminar Ensayo'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Finalizar la prueba?</AlertDialogTitle>
                                {preguntasSinResponder > 0 ? (
                                    <AlertDialogDescription>
                                        Hay {preguntasSinResponder} pregunta(s) sin responder. Si continúas, se contarán como incorrectas. ¿Deseas finalizar la prueba de todas formas?
                                    </AlertDialogDescription>
                                ) : (
                                    <AlertDialogDescription>
                                        ¿Estás seguro de que quieres finalizar y revisar tu prueba?
                                    </AlertDialogDescription>
                                )}
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Volver a la prueba</AlertDialogCancel>
                                <AlertDialogAction onClick={handleFinish}>Finalizar de todas formas</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
  }

  if (fase === 'resultados' && testData) {
    const correctas = resultados.filter(r => r.esCorrecta).length;
    const total = testData.preguntas.length;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">Resultados del Ensayo PAES {tipoPrueba}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-5xl font-bold">
                        <span className="text-blue-500">{correctas}</span> / <span className="text-red-500">{total - correctas}</span>
                    </p>
                    <p className="text-lg text-muted-foreground">
                        <span className="text-blue-500 font-semibold">Correctas</span> / <span className="text-red-500 font-semibold">Incorrectas</span>
                    </p>
                </CardContent>
                 <CardFooter className="justify-center">
                    <Button onClick={reset}>
                        <RefreshCw className="mr-2"/> Realizar otro ensayo
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center">Revisión detallada</h2>
                {resultados.map((res, index) => (
                    <Card key={index} className={res.esCorrecta ? 'border-blue-500/50' : 'border-red-500/50'}>
                         <CardHeader>
                            <CardTitle className="flex justify-between items-start text-xl">
                                <span>Pregunta {index + 1}</span>
                                {res.esCorrecta ? (
                                    <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Correcta</span>
                                ) : (
                                    <span className="text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-full flex items-center gap-1"><XCircle className="w-4 h-4"/> Incorrecta</span>
                                )}
                            </CardTitle>
                            <p className="text-md pt-2 whitespace-pre-wrap">{res.pregunta.pregunta}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold">Tu respuesta:</p>
                                <p className={cn("p-2 rounded-md", res.esCorrecta ? 'bg-blue-100/50 dark:bg-blue-900/20' : 'bg-red-100/50 dark:bg-red-900/20')}>{res.respuestaUsuario || "No respondida"}</p>
                            </div>
                            {!res.esCorrecta && (
                                <>
                                    <div>
                                        <p className="text-sm font-semibold">Respuesta Correcta:</p>
                                        <p className="p-2 bg-muted rounded-md">{res.pregunta.respuestaCorrecta}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-md border">
                                        <h4 className="font-semibold text-foreground">Explicación del Tutor IA</h4>
                                        <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{res.feedback}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
  }

  return null;
}
