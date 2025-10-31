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
import Image from 'next/image';

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
  const [tema, setTema] = useState<string>('');
  const [cantidadPreguntas, setCantidadPreguntas] = useState<number>(5);
  const [tipoPrueba, setTipoPrueba] = useState<TipoPrueba>('seleccion-multiple');

  const [testData, setTestData] = useState<GeneradorPruebasOutput | null>(null);
  const [respuestas, setRespuestas] = useState<RespuestaUsuario[]>([]);
  const [preguntaActualIndex, setPreguntaActualIndex] = useState(0);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStart = () => {
    if (!tema) {
      toast({
        variant: 'destructive',
        title: 'Selecciona un tema',
        description: 'Por favor, elige un tema para comenzar la prueba.',
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
          setTestData(result);
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
    if (testData && index >= 0 && index < testData.preguntas.length) {
      setPreguntaActualIndex(index);
    }
  };

  const handleFinish = () => {
    if (!testData) return;
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
    setTema('');
    setCantidadPreguntas(5);
    setTipoPrueba('seleccion-multiple');
    setTestData(null);
    setRespuestas([]);
    setResultados([]);
    setPreguntaActualIndex(0);
  }

  if (fase === 'configuracion') {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Configura tu Ensayo</CardTitle>
          <CardDescription>Elige el tema, la modalidad y el tipo de preguntas para tu prueba.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>1. Elige un tema</Label>
            <div className="flex flex-wrap gap-2">
                {TEMAS_DISPONIBLES.map(t => (
                    <Button 
                        key={t}
                        variant={tema === t ? 'default' : 'outline'}
                        onClick={() => setTema(t)}
                    >
                        {t}
                    </Button>
                ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>2. Elige la modalidad</Label>
            <RadioGroup defaultValue="5" value={String(cantidadPreguntas)} onValueChange={(value) => setCantidadPreguntas(parseInt(value))}>
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
           {tipoPrueba === 'respuesta-corta' && <FormatoRespuestasAlert />}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleStart} disabled={!tema || isPending}>
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

  if (fase === 'realizando' && testData) {
    const pregunta = testData.preguntas[preguntaActualIndex];
    const showFormula = preguntaActualIndex === 0 && testData.formula === 'formula_cuadratica';

    return (
        <div className='max-w-4xl mx-auto space-y-4'>
            {showFormula && (
                <Card>
                    <CardHeader>
                        <CardTitle>Fórmula Clave: Ecuación Cuadrática</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                       <Image src="https://storage.googleapis.com/genkit-assets/formula-cuadratica.png" alt="Fórmula cuadrática" width={400} height={250} />
                    </CardContent>
                </Card>
            )}
            {tipoPrueba === 'respuesta-corta' && <FormatoRespuestasAlert />}
            <Card>
                <CardHeader>
                    <CardTitle>Pregunta {preguntaActualIndex + 1} de {testData.preguntas.length}</CardTitle>
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
                    {preguntaActualIndex < testData.preguntas.length - 1 ? (
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
