'use client';

import { useState, useTransition } from 'react';
import {
  generarPruebaAction,
  retroalimentacionAction,
} from '@/app/ensayo-actions';
import type {
  Pregunta,
  GeneradorPruebasOutput,
  RetroalimentacionOutput,
} from '@/ai/flows/generador-pruebas-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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

export function EnsayoInteractivo() {
  const [fase, setFase] = useState<Fase>('configuracion');
  const [tema, setTema] = useState('');
  const [cantidadPreguntas, setCantidadPreguntas] = useState<number>(5);
  const [tipoPrueba, setTipoPrueba] = useState<TipoPrueba>('seleccion-multiple');

  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<RespuestaUsuario[]>([]);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStart = () => {
    if (!tema.trim()) {
      toast({
        variant: 'destructive',
        title: 'Tema no especificado',
        description: 'Por favor, escribe un tema para la prueba.',
      });
      return;
    }
    setFase('cargando');
    startTransition(async () => {
      try {
        const result: GeneradorPruebasOutput = await generarPruebaAction({
          tema,
          cantidadPreguntas,
          tipoPrueba,
        });
        if (result.preguntas && result.preguntas.length > 0) {
          setPreguntas(result.preguntas);
          setRespuestas(
            result.preguntas.map((_, index) => ({
              preguntaIndex: index,
              respuesta: '',
            }))
          );
          setPreguntaActualIndex(0);
          setFase('realizando');
        } else {
            throw new Error("La IA no generó preguntas. Inténtalo de nuevo.");
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
    if (index >= 0 && index < preguntas.length) {
      setPreguntaActualIndex(index);
    }
  };

  const handleFinish = () => {
    const todasRespondidas = respuestas.every(r => r.respuesta.trim() !== '');
    if (!todasRespondidas) {
        toast({
            variant: 'destructive',
            title: 'Preguntas sin responder',
            description: 'Por favor, responde todas las preguntas antes de finalizar.',
        });
        return;
    }
    
    setFase('revisando');
    startTransition(async () => {
        try {
            const revisiones = await Promise.all(
                preguntas.map((pregunta, index) => 
                    retroalimentacionAction({
                        pregunta: pregunta,
                        respuestaUsuario: respuestas[index].respuesta,
                    })
                )
            );
            const resultadosFinales = revisiones.map((revision, index) => ({
                ...revision,
                pregunta: preguntas[index],
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
    setTema('');
    setCantidadPreguntas(5);
    setTipoPrueba('seleccion-multiple');
    setPreguntas([]);
    setRespuestas([]);
    setResultados([]);
    setPreguntaActualIndex(0);
  }

  if (fase === 'configuracion') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configura tu Ensayo</CardTitle>
          <CardDescription>Define los parámetros para tu prueba personalizada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tema">1. Escribe el tema que quieres practicar</Label>
            <Input id="tema" value={tema} onChange={e => setTema(e.target.value)} placeholder="Ej: Teorema de Pitágoras" />
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
              <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>¡A tener en cuenta!</AlertTitle>
                  <AlertDescription>
                      Para respuestas numéricas: usa punto (.) para decimales, redondea a dos decimales (ej: 5.56) y no uses separadores de miles (ej: 1500). Para respuestas sobre objetos o personas, usa números enteros.
                  </AlertDescription>
              </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleStart} disabled={!tema.trim() || isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Comenzar Ensayo
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (fase === 'cargando' || fase === 'revisando') {
    return (
        <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">{fase === 'cargando' ? 'La IA está generando tu prueba...' : 'El Tutor IA está revisando tus respuestas...'}</p>
        </div>
    )
  }

  if (fase === 'realizando') {
    const pregunta = preguntas[preguntaActualIndex];
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Pregunta {preguntaActualIndex + 1} de {preguntas.length}</CardTitle>
                <CardDescription className="text-lg pt-4">{pregunta.pregunta}</CardDescription>
            </CardHeader>
            <CardContent>
                {pregunta.tipo === 'seleccion-multiple' ? (
                    <RadioGroup 
                        value={respuestas[preguntaActualIndex].respuesta}
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
                        value={respuestas[preguntaActualIndex].respuesta}
                        onChange={e => handleRespuestaChange(e.target.value)}
                    />
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => irAPregunta(preguntaActualIndex - 1)} disabled={preguntaActualIndex === 0}>
                    <ArrowLeft className="mr-2" /> Anterior
                </Button>
                {preguntaActualIndex < preguntas.length - 1 ? (
                    <Button onClick={() => irAPregunta(preguntaActualIndex + 1)}>
                        Siguiente <ArrowRight className="ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleFinish} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Terminar Prueba
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
  }

  if (fase === 'resultados') {
    const correctas = resultados.filter(r => r.esCorrecta).length;
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">Resultados de la Prueba</CardTitle>
                    <CardDescription className="text-xl">Obtuviste</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-6xl font-bold text-primary">{correctas} / {preguntas.length}</p>
                    <p className="text-2xl font-semibold">respuestas correctas</p>
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
                    <Card key={index} className={res.esCorrecta ? 'border-green-500' : 'border-red-500'}>
                         <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <span>Pregunta {index + 1}</span>
                                {res.esCorrecta ? (
                                    <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">Correcta</span>
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
