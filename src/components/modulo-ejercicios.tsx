'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X, BookOpen } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { TeoremaAnguloCentralSVG } from './TeoremaAnguloCentralSVG';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { AyudaContextual, TablaActividad1, TablaActividad4, EjercicioInteractivo } from "@/components/ejercicio-interactivo";
import { verificarRespuestaAction } from '@/app/verificador-respuestas-actions';
import { Textarea } from './ui/textarea';
import { MarkdownImage } from './markdown-image';


interface EjercicioConceptual {
    id: string;
    pregunta: React.ReactNode;
    respuestaCorrecta: string;
}

export const ButtonVerificarConceptual = ({ ejercicio }: { ejercicio: EjercicioConceptual; }) => {
  const [respuesta, setRespuesta] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!respuesta.trim()) {
      toast({ title: 'Respuesta vacía', description: 'Por favor, escribe una respuesta.', variant: 'destructive' });
      setVerificationResult(false);
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verificarRespuestaAction({ preguntaId: ejercicio.id, respuestaUsuario: respuesta, respuestaCorrecta: ejercicio.respuestaCorrecta });
      setVerificationResult(res.esCorrecta);
      toast({ title: res.esCorrecta ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta', description: res.feedback, duration: 5000 });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo verificar la respuesta.', variant: 'destructive' });
      setVerificationResult(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRespuesta(e.target.value);
    setVerificationResult(null);
  };
  
  const getIcon = () => {
    if (isVerifying) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (verificationResult === true) return <Check className="h-4 w-4 text-green-500" />;
    if (verificationResult === false) return <X className="h-4 w-4 text-red-500" />;
    return <BookOpen className="h-4 w-4" />;
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
        <div className={cn("text-sm font-medium", verificationResult === false ? "text-red-500" : "text-foreground")}>{ejercicio.pregunta}</div>
      <div className="flex items-start gap-2">
        <Textarea
          id={ejercicio.id}
          placeholder="Escribe aquí tu conclusión..."
          value={respuesta}
          onChange={handleInputChange}
           className={cn(
            'transition-colors',
            verificationResult === true && 'border-green-500 focus-visible:ring-green-500',
            verificationResult === false && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        <Button onClick={handleVerify} disabled={isVerifying} size="icon" variant="secondary" className="mt-1 flex-shrink-0">
          {getIcon()}
          <span className="sr-only">Verificar</span>
        </Button>
      </div>
    </div>
  );
};


export function ModuloEjercicios() {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>('item-3');
    const [activeTeorico, setActiveTeorico] = useState<{isOpen: boolean, groupId: string | null}>({isOpen: false, groupId: null});
    
    const handleTeoricoToggle = (groupId: string) => {
        setActiveTeorico(prev => ({
            isOpen: prev.groupId !== groupId ? true : !prev.isOpen,
            groupId: groupId,
        }));
    };
    
    const ejerciciosPlazaSkate: EjercicioConceptual[] = [
        { id: 'angulo-central', pregunta: '**Ejercicio 1:** El ángulo inscrito `α` mide 20°. ¿Cuánto debe medir el ángulo central `2α` para que la cámara apunte correctamente al objeto sospechoso en C?', respuestaCorrecta: '40' },
        { id: 'conversion-radianes', pregunta: '**Ejercicio 2:** Si el ángulo de la cámara es de 40°, ¿cuál es su medida equivalente en radianes? Explica cómo se calcula y recuerda que `180° = π radianes`.', respuestaCorrecta: '2*pi/9' },
    ];
    
    const ejerciciosLaRampa: EjercicioConceptual[] = [
        { id: 'la-rampa-act-2', pregunta: 'Describe tus conclusiones sobre los triángulos que representan las rampas (tipo, semejanzas, diferencias).', respuestaCorrecta: 'Son triángulos rectángulos. Los que tienen misma pendiente son semejantes entre sí. Se diferencian en el tamaño de sus lados.'},
        { id: 'la-rampa-act-3', pregunta: '¿Cuál es el ángulo para la pendiente del 12% y para la del 8%? (aprox. a dos decimales)', respuestaCorrecta: '6.84, 4.57'},
        { id: 'la-rampa-act-5a', pregunta: '**a.** ¿Qué comandos de GeoGebra y funciones de tu calculadora te permiten encontrar el ángulo conociendo los lados?', respuestaCorrecta: 'atand'},
        { id: 'la-rampa-act-5b', pregunta: '**b.** Para un ángulo de 4°, ¿cuál debe ser la pendiente porcentual aproximada? (Recuerda: `pendiente = tan(ángulo)`)', respuestaCorrecta: '7%'},
        { id: 'la-rampa-act-5c', pregunta: '**c.** Si la diferencia de nivel es de 25 cm con un ángulo de 4°, ¿cuál es la distancia horizontal (aprox. a un decimal)? (Pista: `D = N / tan(α)`)', respuestaCorrecta: '357.5'}
    ];
    
    const ejerciciosModulo1_2: EjercicioConceptual[] = [
        { id: 'act-tec-2', pregunta: '**Actividad 2:** Construye un triángulo con vértices A=(0,0), B=(4,0) y C=(4,3) usando `Polígono(A,B,C)`. Luego, usa `ÁngulosInteriores(t1)`. Escribe los tres ángulos (aprox. a dos decimales) separados por comas.', respuestaCorrecta: '36.87, 53.13, 90' },
        { id: 'act-tec-3', pregunta: '**Actividad 3:** Usando `Ángulo()`, convierte `3pi/2`, `pi/3` y `1` rad a grados. Escribe los resultados (aprox. a un decimal) separados por comas.', respuestaCorrecta: '270, 60, 57.3' },
        { id: 'act-tec-4', pregunta: '**Actividad 4:** Calcula `sin(30°)`, `cos(30°)` y `tan(30°)`. Escribe los resultados (aprox. a dos decimales) separados por comas.', respuestaCorrecta: '0.5, 0.87, 0.58' },
        { id: 'act-tec-5', pregunta: '**Actividad 5 (GeoGebra):** Calcula `sin`, `cos` y `tan` para `30rad`.', respuestaCorrecta: '-0.99, 0.15, -6.41' },
        { id: 'act-tec-6', pregunta: '**Actividad 6 (GeoGebra):** Calcula `sin`, `cos` y `tan` para `50g` (gradianes). (Recuerda: convertir a grados `0.9 * 50°`)', respuestaCorrecta: '0.71, 0.71, 1' },
        { id: 'act-tec-7', pregunta: '**Actividad 7 (GeoGebra):** Usando `asind(0.5)`, `acosd(0.5)` y `atand(0.5)`, ¿qué ángulos en grados obtienes?', respuestaCorrecta: '30, 60, 26.57' },
        { id: 'act-tec-8', pregunta: '**Actividad 8 (GeoGebra):** Convierte a radianes los ángulos de la actividad 7. (Pista: `(π/180) * angulo_en_grados`)', respuestaCorrecta: '0.52, 1.05, 0.46' },
        { id: 'act-tec-9', pregunta: '**Actividad 9 (GeoGebra):** Convierte a gradianes los ángulos de la actividad 7. (Pista: `(100/90) * angulo_en_grados`)', respuestaCorrecta: '33.33, 66.67, 29.52' },
        { id: 'act-tec-10', pregunta: '**Actividad 10 (Calculadora - DEG):** ¿Cuál es el valor de `sin(30°)`?', respuestaCorrecta: '0.5' },
        { id: 'act-tec-11', pregunta: '**Actividad 11 (Calculadora - DEG):** ¿`cos(30°)`? (aprox. a 4 decimales)', respuestaCorrecta: '0.8660' },
        { id: 'act-tec-12', pregunta: '**Actividad 12 (Calculadora - DEG):** ¿`tan(30°)`? (aprox. a 4 decimales)', respuestaCorrecta: '0.5774' },
        { id: 'act-tec-13', pregunta: '**Actividad 13 (Calculadora - DEG):** ¿Ángulo cuyo seno es 0.5?', respuestaCorrecta: '30' },
        { id: 'act-tec-14', pregunta: '**Actividad 14 (Calculadora - DEG):** ¿Ángulo cuyo coseno es 0.5?', respuestaCorrecta: '60' },
        { id: 'act-tec-15', pregunta: '**Actividad 15 (Calculadora - DEG):** ¿Ángulo cuyo tangente es 0.5? (aprox. a 2 decimales)', respuestaCorrecta: '26.57' },
        { id: 'act-tec-16', pregunta: '**Actividad 16 (Calculadora - RAD):** ¿`sin(30 rad)`? (aprox. a 4 decimales)', respuestaCorrecta: '-0.9880' },
        { id: 'act-tec-17', pregunta: '**Actividad 17 (Calculadora - RAD):** ¿`cos(30 rad)`? (aprox. a 4 decimales)', respuestaCorrecta: '0.1543' },
        { id: 'act-tec-18', pregunta: '**Actividad 18 (Calculadora - RAD):** ¿`tan(30 rad)`? (aprox. a 4 decimales)', respuestaCorrecta: '-6.4053' },
        { id: 'act-tec-19', pregunta: '**Actividad 19 (Calculadora - RAD):** ¿Ángulo cuyo seno es 0.5? (aprox. a 2 decimales)', respuestaCorrecta: '0.52' },
        { id: 'act-tec-20', pregunta: '**Actividad 20 (Calculadora - RAD):** ¿Ángulo cuyo coseno es 0.5? (aprox. a 2 decimales)', respuestaCorrecta: '1.05' },
        { id: 'act-tec-21', pregunta: '**Actividad 21 (Calculadora - RAD):** ¿Ángulo cuyo tangente es 0.5? (aprox. a 2 decimales)', respuestaCorrecta: '0.46' },
        { id: 'act-tec-22', pregunta: '**Actividad 22 (Calculadora - GRA):** ¿`sin(50g)`? (aprox. a 4 decimales)', respuestaCorrecta: '0.7071' },
        { id: 'act-tec-23', pregunta: '**Actividad 23 (Calculadora - GRA):** ¿`cos(50g)`? (aprox. a 4 decimales)', respuestaCorrecta: '0.7071' },
        { id: 'act-tec-24', pregunta: '**Actividad 24 (Calculadora - GRA):** ¿`tan(50g)`?', respuestaCorrecta: '1' },
        { id: 'act-tec-25', pregunta: '**Actividad 25 (Calculadora - GRA):** ¿Ángulo cuyo seno es 0.5? (aprox. a 2 decimales)', respuestaCorrecta: '33.33' },
        { id: 'act-tec-26', pregunta: '**Actividad 26 (Calculadora - GRA):** ¿Ángulo cuyo coseno es 0.5? (aprox. a 2 decimales)', respuestaCorrecta: '66.67' },
        { id: 'act-tec-27', pregunta: '**Actividad 27 (Calculadora - GRA):** ¿Ángulo cuyo tangente es 0.5? (aprox. a 2 decimales)', respuestaCorrecta: '29.52' },
    ];
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">Módulo 1.0: Teorema del Ángulo Central (Plaza de Skate)</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <p>En el parque de una ciudad hay instaladas cámaras de vigilancia. La ubicada en el punto B, con un ángulo de 20°, detectó un objeto sospechoso en C. Para enfocar la cámara del centro O, se necesita saber el valor del ángulo central `2α`.</p>
                                        <TeoremaAnguloCentralSVG className="w-full max-w-xs mx-auto my-4" />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {ejerciciosPlazaSkate.map(ej => (
                                             <ButtonVerificarConceptual 
                                                key={ej.id} 
                                                ejercicio={ej}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <AyudaContextual
                                            ejercicioId="plaza-skate"
                                            groupId="trigonometria-basica"
                                            onTeoricoToggle={() => handleTeoricoToggle('trigonometria-basica')}
                                            isTeoricoOpen={activeTeorico.isOpen && activeTeorico.groupId === 'trigonometria-basica'}
                                        />
                                    </div>

                                    {activeTeorico.isOpen && activeTeorico.groupId === 'trigonometria-basica' && (
                                       <EjercicioInteractivo 
                                            key="trigonometria-basica"
                                            groupId="trigonometria-basica"
                                            contextFileNames={['plaza-skate/tutor-geogebra/actividad', 'conversion-radianes/tutor-geogebra/actividad']}
                                       />
                                    )}

                                </div>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xl font-semibold">Módulo 1.1: Situación de Modelación 1 (La Rampa)</AccordionTrigger>
                    <AccordionContent>
                         <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <p>Las rampas son esenciales para la accesibilidad. La norma chilena establece una pendiente máxima del 12% para tramos de hasta 150 cm y del 8% para tramos más largos. Vamos a analizarlo.</p>
                                        <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/1.png" alt="Ilustración de una persona en silla de ruedas usando una rampa."/>
                                        
                                        <h3 className="font-semibold text-lg">Actividad 1: Pendiente y Diferencia de Nivel</h3>
                                        <TablaActividad1 onVerify={() => {}} />

                                        <Separator className="my-8" />
                                        
                                        <h3 className="font-semibold text-lg">Actividad 2: Representación en GeoGebra</h3>
                                        <p>Utiliza GeoGebra para dibujar las rampas de la tabla anterior con el comando `Polígono`. ¿Qué tipo de triángulo representan? ¿Qué semejanzas y diferencias observas entre ellas?</p>
                                        <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/2.png" alt="Representación de una rampa en GeoGebra."/>
                                        <ButtonVerificarConceptual 
                                            ejercicio={ejerciciosLaRampa[0]}
                                        />

                                        <Separator className="my-8" />

                                        <h3 className="font-semibold text-lg">Actividad 3: Medición de Ángulos</h3>
                                        <p>Usa la herramienta `Ángulo` en GeoGebra para medir la inclinación de las rampas que dibujaste.</p>
                                        <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/3.png" alt="Medición de ángulos en GeoGebra."/>
                                         <ButtonVerificarConceptual 
                                            ejercicio={ejerciciosLaRampa[1]}
                                        />

                                        <Separator className="my-8" />

                                        <h3 className="font-semibold text-lg">Actividad 4: Razones Trigonométricas</h3>
                                        <TablaActividad4 onVerify={() => {}}/>

                                        <Separator className="my-8" />
                                        
                                        <h3 className="font-semibold text-lg">Actividad 5: Conclusiones</h3>
                                        <div className="space-y-4">
                                            {ejerciciosLaRampa.slice(2).map(ej => (
                                                <ButtonVerificarConceptual key={ej.id} ejercicio={ej} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <AyudaContextual
                                            ejercicioId="la-rampa"
                                            groupId="la-rampa"
                                            onTeoricoToggle={() => handleTeoricoToggle('la-rampa')}
                                            isTeoricoOpen={activeTeorico.isOpen && activeTeorico.groupId === 'la-rampa'}
                                        />
                                    </div>
                                     {activeTeorico.isOpen && activeTeorico.groupId === 'la-rampa' && (
                                       <EjercicioInteractivo 
                                            key="la-rampa"
                                            groupId="la-rampa"
                                            contextFileNames={['la-rampa/tutor-calculadora/la-rampa-calculadora-consolidado']}
                                       />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="item-3">
                    <AccordionTrigger className="text-xl font-semibold">Módulo 1.2: Ángulos y Razones Trigonométricas</AccordionTrigger>
                    <AccordionContent>
                         <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                     <div className="prose prose-invert max-w-none">
                                        <p className="text-muted-foreground">Esta actividad te familiarizará con el uso de GeoGebra y la calculadora para trabajar con ángulos y razones trigonométricas.</p>
                                        <h3 className="font-semibold text-lg">Actividades en GeoGebra (1-9)</h3>
                                        <div className="space-y-4">
                                            {ejerciciosModulo1_2.slice(0, 9).map(ej => (
                                                <ButtonVerificarConceptual 
                                                    key={ej.id} 
                                                    ejercicio={ej}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator/>
                                    
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="font-semibold text-lg">Actividades con Calculadora (10-27)</h3>
                                        <p className="text-muted-foreground">Revisa el siguiente video para aprender a configurar tu calculadora en modo DEG, RAD o GRA.</p>
                                        <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%', background: '#000', borderRadius: '0.5rem'}}><iframe style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} src="https://www.youtube.com/embed/eFROC2qbNFI" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>
                                        <div className="space-y-4 mt-4">
                                             {ejerciciosModulo1_2.slice(9).map(ej => (
                                                <ButtonVerificarConceptual 
                                                    key={ej.id} 
                                                    ejercicio={ej}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator />

                                    <div className="flex justify-end pt-4">
                                        <AyudaContextual
                                            ejercicioId="angulos-y-razones"
                                            groupId="angulos-y-razones"
                                            onTeoricoToggle={() => handleTeoricoToggle('angulos-y-razones')}
                                            isTeoricoOpen={activeTeorico.isOpen && activeTeorico.groupId === 'angulos-y-razones'}
                                        />
                                    </div>

                                    {activeTeorico.isOpen && activeTeorico.groupId === 'angulos-y-razones' && (
                                       <EjercicioInteractivo 
                                            key="angulos-y-razones"
                                            groupId="angulos-y-razones"
                                            contextFileNames={['angulos-y-razones/tutor-geogebra/actividad', 'angulos-y-razones/tutor-calculadora/actividad']}
                                       />
                                    )}

                                </div>
                            </CardContent>
                        </Card>
                    </AccordionContent>
                 </AccordionItem>
            </Accordion>
        </div>
    );
}