'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import {
  generarPruebaAction,
  retroalimentacionAction,
} from '@/app/ensayo-actions';
import type {
  Pregunta,
  GeneradorPruebasOutput,
  RetroalimentacionOutput,
} from '@/ai/flows/schemas/generador-pruebas-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress";


type Fase = 'configuracion' | 'cargando' | 'realizando' | 'revisando' | 'resultados';
type TipoPrueba = 'seleccion-multiple' | 'respuesta-corta';

interface RespuestaUsuario {
  preguntaIndex: number;
  respuesta: string;
}

interface Resultado extends RetroalimentacionOutput {
  pregunta: Pregunta;
  respuestaUsuario: string;
}

const TEMAS_DISPONIBLES = [
    "Teorema de Pitágoras",
    "Ecuaciones Lineales",
    "Factorización y Productos Notables",
    "Función Cuadrática",
    "Función Exponencial",
    "Función Logarítmica",
    "Logaritmos",
    "Probabilidad Condicional",
    "Trigonometría Básica"
];

const BATCH_SIZE = 5;

const FormatoRespuestasAlert = () => (
    <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>¡A tener en cuenta!</AlertTitle>
        <AlertDescription>
            Para respuestas numéricas: usa punto (.) para decimales, redondea a dos decimales (ej: 5.57) y no uses separadores de miles (ej: 1500). Para respuestas sobre objetos o personas, usa números enteros.
        </AlertDescription>
    </Alert>
);

export function EnsayoInteractivo() {
  const [fase, setFase] = useState<Fase>('configuracion');
  const [temasSeleccionados, setTemasSeleccionados] = useState<string[]>([]);
  const [cantidadPreguntas, setCantidadPreguntas] = useState<number>(5);
  const [tipoPrueba, setTipoPrueba] = useState<TipoPrueba>('seleccion-multiple');

  const [testData, setTestData] = useState<GeneradorPruebasOutput | null>(null);
  const [respuestas, setRespuestas] = useState<RespuestaUsuario[]>([]);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ progress: 0, message: '' });

  const { toast } = useToast();

  const handleToggleTema = (tema: string) => {
    setTemasSeleccionados(prev => {
        if (prev.includes(tema)) {
            return prev.filter(t => t !== tema);
        }
        if (prev.length < 3) {
            return [...prev, tema];
        }
        toast({
            variant: 'destructive',
            title: 'Límite alcanzado',
            description: 'Puedes seleccionar hasta 3 temas.',
        })
        return prev;
    })
  }

  const handleStart = () => {
    if (temasSeleccionados.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No hay temas seleccionados',
        description: 'Por favor, elige al menos un tema para la prueba.',
      });
      return;
    }
    setFase('cargando');
    const numBatches = Math.ceil(cantidadPreguntas / BATCH_SIZE);
    setLoadingProgress({ progress: 10, message: 'Generando primer lote de preguntas...' });

    startTransition(async () => {
      try {
        const temaCompuesto = temasSeleccionados.join(', ');
        const preguntasPorLote = numBatches > 1 ? BATCH_SIZE : cantidadPreguntas;

        const result: GeneradorPruebasOutput = await generarPruebaAction({
          tema: temaCompuesto,
          cantidadPreguntas: preguntasPorLote,
          tipoPrueba,
        });

        if (result.preguntas && result.preguntas.length > 0) {
          setTestData(result);
          setRespuestas(result.preguntas.map((_, index) => ({ preguntaIndex: index, respuesta: '' })));
          setPreguntaActualIndex(0);
          setLoadingProgress({ 
            progress: (result.preguntas.length / cantidadPreguntas) * 100, 
            message: `Preguntas cargadas: ${result.preguntas.length} de ${cantidadPreguntas}`
          });
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

  useEffect(() => {
    if (fase !== 'realizando' || (testData?.preguntas.length ?? 0) >= cantidadPreguntas) {
      return;
    }

    const fetchMoreQuestions = async () => {
      setIsFetchingMore(true);
      const temaCompuesto = temasSeleccionados.join(', ');
      let currentQuestions = testData?.preguntas ?? [];
      const lotesRestantes = Math.ceil((cantidadPreguntas - currentQuestions.length) / BATCH_SIZE);

      for (let i = 0; i < lotesRestantes; i++) {
        try {
          const result = await generarPruebaAction({ tema: temaCompuesto, cantidadPreguntas: BATCH_SIZE, tipoPrueba });
          currentQuestions = [...currentQuestions, ...result.preguntas];
          
          setTestData({ ...testData, preguntas: currentQuestions });
          setRespuestas(currentQuestions.map((_, index) => respuestas[index] || { preguntaIndex: index, respuesta: '' }));
          
          const progress = (currentQuestions.length / cantidadPreguntas) * 100;
          setLoadingProgress({ 
            progress: progress, 
            message: `Preguntas cargadas: ${currentQuestions.length} de ${cantidadPreguntas}` 
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

    fetchMoreQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);
  
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

  const handleFinish = () => {
    if (!testData) return;
    
    // Solo valida las preguntas cargadas
    const preguntasCargadas = testData.preguntas.length;
    const respuestasCargadas = respuestas.slice(0, preguntasCargadas);

    const todasRespondidas = respuestasCargadas.every(r => r.respuesta.trim() !== '');
    if (!todasRespondidas) {
        toast({
            variant: 'destructive',
            title: 'Preguntas sin responder',
            description: 'Por favor, responde todas las preguntas cargadas antes de finalizar.',
        });
        return;
    }
    
    setFase('revisando');
    startTransition(async () => {
        try {
            const revisiones = await Promise.all(
                testData.preguntas.map((pregunta, index) => 
                    retroalimentacionAction({
                        pregunta: pregunta,
                        respuestaUsuario: respuestas[index].respuesta,
                    })
                )
            );
            const resultadosFinales = revisiones.map((revision, index) => ({
                ...revision,
                pregunta: testData.preguntas[index],
                respuestaUsuario: respuestas[index].respuesta,
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
    setTemasSeleccionados([]);
    setCantidadPreguntas(5);
    setTipoPrueba('seleccion-multiple');
    setTestData(null);
    setRespuestas([]);
    setResultados([]);
    setPreguntaActualIndex(0);
    setLoadingProgress({ progress: 0, message: '' });
  }

  if (fase === 'configuracion') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configura tu Ensayo</CardTitle>
          <CardDescription>Define los parámetros para tu prueba personalizada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>1. Elige hasta 3 temas que quieras practicar</Label>
            <div className="flex flex-wrap gap-2">
                {TEMAS_DISPONIBLES.map(tema => (
                    <Button 
                        key={tema}
                        variant={temasSeleccionados.includes(tema) ? 'default' : 'outline'}
                        onClick={() => handleToggleTema(tema)}
                    >
                        {tema}
                    </Button>
                ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>2. Elige la modalidad</Label>
             <RadioGroup defaultValue="5" onValueChange={(value) => setCantidadPreguntas(parseInt(value))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="r1" />
                <Label htmlFor="r1">Ensayo (5 preguntas)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="15" id="r2" />
                <Label htmlFor="r2">Desafío (15 preguntas)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="40" id="r3" />
                <Label htmlFor="r3">Prueba Final (40 preguntas)</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex items-center space-x-4">
            <Label>3. Elige el tipo de pregunta</Label>
            <div className="flex items-center space-x-2">
                <Label htmlFor="tipo-prueba" className={tipoPrueba === 'seleccion-multiple' ? 'text-primary' : 'text-muted-foreground'}>Selección Múltiple</Label>
                <Switch 
                    id="tipo-prueba" 
                    checked={tipoPrueba === 'respuesta-corta'}
                    onCheckedChange={(checked) => setTipoPrueba(checked ? 'respuesta-corta' : 'seleccion-multiple')}
                />
                <Label htmlFor="tipo-prueba" className={tipoPrueba === 'respuesta-corta' ? 'text-primary' : 'text-muted-foreground'}>Respuesta Escrita</Label>
            </div>
          </div>
          {tipoPrueba === 'respuesta-corta' && (
              <FormatoRespuestasAlert />
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleStart} disabled={temasSeleccionados.length === 0 || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Comenzar Ensayo
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (fase === 'cargando') {
    return (
        <div className="text-center max-w-md mx-auto space-y-4">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">La IA está generando tu prueba...</p>
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

    return (
        <div className='max-w-4xl mx-auto space-y-4'>
            {isFetchingMore && (
                <div className="p-2 rounded-lg bg-secondary">
                    <div className="flex justify-between items-center text-sm text-secondary-foreground mb-1 px-1">
                        <span>Cargando más preguntas en segundo plano...</span>
                        <span>{totalPreguntasCargadas}/{cantidadPreguntas}</span>
                    </div>
                    <Progress value={(totalPreguntasCargadas / cantidadPreguntas) * 100} className="w-full h-2" />
                </div>
            )}
            {tipoPrueba === 'respuesta-corta' && <FormatoRespuestasAlert />}
            <Card>
                <CardHeader>
                    <CardTitle>Pregunta {preguntaActualIndex + 1} de {totalPreguntasCargadas}</CardTitle>
                    <CardDescription className="text-lg pt-4">{pregunta.pregunta}</CardDescription>
                </CardHeader>
                <CardContent>
                    {pregunta.tipo === 'seleccion-multiple' ? (
                        <RadioGroup 
                            value={respuestas[preguntaActualIndex]?.respuesta || ''}
                            onValueChange={handleRespuestaChange}
                            className="space-y-2"
                        >
                            {pregunta.alternativas.map((alt, i) => (
                                <div key={i} className="flex items-center space-x-2 p-3 border rounded-md has-[:checked]:bg-secondary has-[:checked]:border-primary">
                                    <RadioGroupItem value={alt} id={`alt-${i}`} />
                                    <Label htmlFor={`alt-${i}`} className="flex-1 cursor-pointer">{alt}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    ) : (
                        <Input 
                            placeholder="Escribe tu respuesta aquí..."
                            value={respuestas[preguntaActualIndex]?.respuesta || ''}
                            onChange={e => handleRespuestaChange(e.target.value)}
                        />
                    )}
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
                        <Button onClick={handleFinish} disabled={isPending || isFetchingMore}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isFetchingMore ? 'Cargando...' : 'Terminar Prueba'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
  }

  if (fase === 'resultados' && testData) {
    const correctas = resultados.filter(r => r.esCorrecta).length;
    const total = testData.preguntas.length;
    const porcentajeCorrectas = Math.round((correctas / total) * 100);
    const porcentajeIncorrectas = 100 - porcentajeCorrectas;
    const aprobado = porcentajeCorrectas >= 60;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">Resultados de la Prueba</CardTitle>
                    {aprobado ? (
                        <CardDescription className="text-xl text-blue-500 flex items-center justify-center gap-2">
                           <CheckCircle2 /> ¡Prueba Aprobada!
                        </CardDescription>
                    ) : (
                        <CardDescription className="text-xl text-red-500 flex items-center justify-center gap-2">
                           <XCircle /> Prueba Reprobada
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-5xl font-bold text-primary">{correctas} / {total}</p>
                    <p className="text-2xl font-semibold">respuestas correctas</p>

                    <div className="flex justify-center gap-6 text-lg">
                        <span className="font-semibold text-blue-500">Correctas: {porcentajeCorrectas}%</span>
                        <span className="font-semibold text-red-500">Incorrectas: {porcentajeIncorrectas}%</span>
                    </div>

                     {!aprobado && (
                        <p className="text-muted-foreground pt-2">
                            ¡Sigue practicando! Revisar tus errores es la mejor forma de aprender.
                        </p>
                    )}
                </CardContent>
                 <CardFooter className="justify-center">
                    <Button onClick={reset}>
                        <RefreshCw className="mr-2"/> Realizar otra prueba
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center">Revisión detallada</h2>
                {resultados.map((res, index) => (
                    <Card key={index} className={res.esCorrecta ? 'border-blue-500' : 'border-red-500'}>
                         <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <span>Pregunta {index + 1}</span>
                                {res.esCorrecta ? (
                                    <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">Correcta</span>
                                ) : (
                                    <span className="text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-full">Incorrecta</span>
                                )}
                            </CardTitle>
                            <p className="text-md pt-2">{res.pregunta.pregunta}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold">Tu respuesta:</p>
                                <p className="p-2 bg-muted rounded-md">{res.respuestaUsuario || "No respondida"}</p>
                            </div>
                            {!res.esCorrecta && (
                                <>
                                    <div>
                                        <p className="text-sm font-semibold">Respuesta Correcta:</p>
                                        <p className="p-2 bg-muted rounded-md">{res.pregunta.respuestaCorrecta}</p>
                                    </div>
                                    <div className="p-4 bg-blue-100/50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-md">
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Análisis del Tutor IA</h4>
                                        <p className="text-blue-700 dark:text-blue-400 mt-1">{res.feedback}</p>
                                         {res.autocorreccion && <p className="text-sm italic mt-2 text-blue-600 dark:text-blue-500">Nota: La IA ha corregido su evaluación inicial basándose en tu respuesta.</p>}
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
