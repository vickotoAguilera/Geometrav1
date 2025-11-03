'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Bot, Calculator, FileText, ChevronDown, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { TeoremaAnguloCentralSVG } from './TeoremaAnguloCentralSVG';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import { AyudaContextual, TablaActividad1, TablaActividad4 } from "@/components/ejercicio-interactivo";
import { verificarRespuestaAction } from '@/app/verificador-respuestas-actions';
import { Textarea } from './ui/textarea';
import { MarkdownImage } from './markdown-image';

const ButtonVerificarConceptual = ({
  respuesta,
  preguntaId,
  respuestaCorrecta,
  onResult,
  onRespuestaChange,
  children,
}: {
  respuesta: string;
  preguntaId: string;
  respuestaCorrecta: string;
  onResult: (result: boolean | null) => void;
  onRespuestaChange: (value: string) => void;
  children: React.ReactNode;
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!respuesta.trim()) {
      toast({ title: 'Respuesta vacía', description: 'Por favor, escribe una respuesta.', variant: 'destructive' });
      setVerificationResult(false);
      onResult(false);
      return;
    }
    setIsVerifying(true);
    setVerificationResult(null);
    onResult(null);

    try {
      const res = await verificarRespuestaAction({ preguntaId, respuestaUsuario: respuesta, respuestaCorrecta });
      setVerificationResult(res.esCorrecta);
      onResult(res.esCorrecta);
      toast({ title: res.esCorrecta ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta', description: res.feedback, duration: 5000 });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo verificar la respuesta.', variant: 'destructive' });
      setVerificationResult(false);
      onResult(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onRespuestaChange(e.target.value);
    setVerificationResult(null); // Reset verification on change
    onResult(null);
  };
  
  const getIcon = () => {
    if (isVerifying) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (verificationResult === true) return <Check className="h-4 w-4 text-green-500" />;
    if (verificationResult === false) return <X className="h-4 w-4 text-red-500" />;
    return <BookOpen className="h-4 w-4" />;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={preguntaId}>{children}</Label>
      <div className="flex items-start gap-2">
        <Textarea
          id={preguntaId}
          placeholder="Escribe aquí tu conclusión..."
          value={respuesta}
          onChange={handleInputChange}
           className={cn(
            'transition-colors',
            verificationResult === true && 'border-green-500 focus-visible:ring-green-500',
            verificationResult === false && 'border-red-500 focus-visible:ring-red-500'
          )}
        />
        <Button onClick={handleVerify} disabled={isVerifying} size="sm" variant="secondary" className="mt-1">
          {getIcon()}
          <span className="sr-only">Verificar</span>
        </Button>
      </div>
    </div>
  );
};


export function ModuloEjercicios() {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>('item-1');
    
    // Estados para Módulo 1.0
    const [respuestaSkate, setRespuestaSkate] = useState('');
    const [resultadoSkate, setResultadoSkate] = useState<boolean | null>(null);
    const [respuestaRadianes, setRespuestaRadianes] = useState('');
    const [resultadoRadianes, setResultadoRadianes] = useState<boolean | null>(null);

    // Estados para Módulo 1.1 - Actividad 2
    const [respAct2a, setRespAct2a] = useState('');
    const [resAct2a, setResAct2a] = useState<boolean | null>(null);
    const [respAct2b, setRespAct2b] = useState('');
    const [resAct2b, setResAct2b] = useState<boolean | null>(null);
    const [respAct2c, setRespAct2c] = useState('');
    const [resAct2c, setResAct2c] = useState<boolean | null>(null);

    // Estados para Módulo 1.1 - Actividad 3
    const [respAct3a, setRespAct3a] = useState('');
    const [resAct3a, setResAct3a] = useState<boolean | null>(null);
    const [respAct3b, setRespAct3b] = useState('');
    const [resAct3b, setResAct3b] = useState<boolean | null>(null);
    const [respAct3c, setRespAct3c] = useState('');
    const [resAct3c, setResAct3c] = useState<boolean | null>(null);

    // Estados para Módulo 1.1 - Actividad 5
    const [respAct5a, setRespAct5a] = useState('');
    const [resAct5a, setResAct5a] = useState<boolean | null>(null);
    const [respAct5b, setRespAct5b] = useState('');
    const [resAct5b, setResAct5b] = useState<boolean | null>(null);
    const [respAct5c, setRespAct5c] = useState('');
    const [resAct5c, setResAct5c] = useState<boolean | null>(null);
    
    const [isTeoricoOpen, setIsTeoricoOpen] = useState(false);
    const [activeContextFiles, setActiveContextFiles] = useState<string[]>(['plaza-skate']);

    const handleTeoricoToggle = (ejercicioId: string) => {
        setIsTeoricoOpen(prev => !prev);
        if (!activeContextFiles.includes(ejercicioId)) {
            setActiveContextFiles(prev => [...prev, ejercicioId]);
        }
    };
    

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">Módulo 1.0: Teorema del Ángulo Central (Plaza de Skate)</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1 space-y-4">
                                            <p className="text-muted-foreground max-w-prose">
                                                En el parque de una ciudad hay instaladas cámaras de vigilancia. Una de ellas, ubicada en el punto B de una plaza circular, enfoca con un ángulo de 20° (ángulo inscrito) un objeto sospechoso en el punto C. El encargado de seguridad necesita dirigir la cámara principal, ubicada en el centro O, hacia el mismo objeto. Para ello, necesita saber cuál es la medida del ángulo central (α) que debe formar la cámara principal.
                                            </p>
                                             <div className="space-y-2 pt-4">
                                                <Label htmlFor="respuesta-skate">Tu respuesta (medida del ángulo α en grados):</Label>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        id="respuesta-skate" 
                                                        placeholder="Escribe la medida del ángulo..."
                                                        value={respuestaSkate}
                                                        onChange={(e) => { setRespuestaSkate(e.target.value); setResultadoSkate(null); }}
                                                        className={cn('transition-colors', resultadoSkate === true && 'border-green-500 focus-visible:ring-green-500', resultadoSkate === false && 'border-red-500 focus-visible:ring-red-500')}
                                                    />
                                                     <ButtonVerificarConceptual
                                                        respuesta={respuestaSkate}
                                                        preguntaId="angulo-central"
                                                        respuestaCorrecta="40"
                                                        onResult={setResultadoSkate}
                                                        onRespuestaChange={setRespuestaSkate}
                                                     >Verificar</ButtonVerificarConceptual>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <h4 className="font-semibold text-foreground">Teorema del Ángulo Central</h4>
                                            <p className="text-xs text-muted-foreground max-w-xs">La medida del ángulo del centro que subtiende un arco es siempre el doble de la medida de cualquier ángulo inscrito que subtiende el mismo arco.</p>
                                            <TeoremaAnguloCentralSVG className="w-48 h-48" />
                                        </div>
                                    </div>
                                    
                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="p-4 border rounded-lg bg-background text-sm space-y-2">
                                            <h4 className="font-semibold text-foreground">Existe una fórmula muy directa para convertir grados a radianes.</h4>
                                            <p className="text-muted-foreground">La relación fundamental es: <code className="bg-muted px-1.5 py-0.5 rounded">180° = π radianes</code>. A partir de esa equivalencia, la fórmula para convertir cualquier ángulo de grados a radianes es:</p>
                                            <code className="block text-center bg-muted p-2 rounded-md font-semibold">radianes = grados × (π / 180)</code>
                                        </div>

                                        <div className="space-y-2 pt-4">
                                            <Label htmlFor="respuesta-radianes">Ahora, convierte el ángulo central que calculaste en el ejercicio anterior a radianes (usa 'pi' si es necesario):</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    id="respuesta-radianes" 
                                                    placeholder="Escribe tu respuesta en radianes..."
                                                    value={respuestaRadianes}
                                                    onChange={(e) => { setRespuestaRadianes(e.target.value); setResultadoRadianes(null); }}
                                                    className={cn('transition-colors', resultadoRadianes === true && 'border-green-500 focus-visible:ring-green-500', resultadoRadianes === false && 'border-red-500 focus-visible:ring-red-500')}
                                                />
                                                 <ButtonVerificarConceptual
                                                    respuesta={respuestaRadianes}
                                                    preguntaId="conversion-radianes"
                                                    respuestaCorrecta="2*pi/9"
                                                    onResult={setResultadoRadianes}
                                                    onRespuestaChange={setRespuestaRadianes}
                                                >Verificar</ButtonVerificarConceptual>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-end pt-4">
                                        <AyudaContextual
                                            ejercicioId="plaza-skate"
                                            groupId="trigonometria-basica"
                                            onTeoricoToggle={() => handleTeoricoToggle('plaza-skate')}
                                            isTeoricoOpen={isTeoricoOpen}
                                        />
                                    </div>
                                     {isTeoricoOpen && (
                                       <EjercicioInteractivo 
                                            ejercicioId="plaza-skate"
                                            groupId="trigonometria-basica"
                                            initialContextFiles={activeContextFiles}
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
                                        <p className="text-muted-foreground">Las rampas son esenciales para garantizar la accesibilidad en espacios públicos y privados, permitiendo a las personas con discapacidad una movilidad segura y autónoma. La norma en Chile establece que la pendiente máxima es del 12% para distancias de hasta 150 cm, y del 8% para distancias mayores.</p>
                                        <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/1.png" alt="Ilustración de persona en silla de ruedas" />
                                    </div>
                                    
                                    <Separator/>

                                    <h3 className="font-semibold text-lg">Actividad 1</h3>
                                    <p className="text-muted-foreground">Considerando la normativa, completa la tabla calculando la "diferencia de nivel" (altura) para cada rampa.</p>
                                    <TablaActividad1 onVerify={() => {}} />

                                    <Separator/>
                                    
                                     <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Actividad 2</h3>
                                        <div className="space-y-4">
                                            <ButtonVerificarConceptual respuesta={respAct2a} preguntaId="tipo-triangulo-rampa" respuestaCorrecta="triángulo rectángulo" onResult={setResAct2a} onRespuestaChange={setRespAct2a}>
                                                a. ¿Qué tipo de triángulo representan las rampas dibujadas?
                                            </ButtonVerificarConceptual>
                                            <ButtonVerificarConceptual respuesta={respAct2b} preguntaId="semejanzas-rampa" respuestaCorrecta="misma pendiente implica mismos ángulos" onResult={setResAct2b} onRespuestaChange={setRespAct2b}>
                                                b. ¿Qué semejanzas observas entre las rampas dibujadas?
                                            </ButtonVerificarConceptual>
                                             <ButtonVerificarConceptual respuesta={respAct2c} preguntaId="diferencias-rampa" respuestaCorrecta="diferente pendiente implica diferente inclinación" onResult={setResAct2c} onRespuestaChange={setRespAct2c}>
                                                c. ¿Qué diferencias observas entre las rampas dibujadas?
                                            </ButtonVerificarConceptual>
                                        </div>
                                        <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/2.png" alt="Dibujo de rampa en GeoGebra" />
                                    </div>
                                    
                                    <Separator/>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Actividad 3</h3>
                                        <div className="space-y-4">
                                            <ButtonVerificarConceptual respuesta={respAct3a} preguntaId="angulo-12-porciento" respuestaCorrecta="6.84" onResult={setResAct3a} onRespuestaChange={setRespAct3a}>
                                               a. ¿Cuál es la medida del ángulo de inclinación de las rampas con una pendiente del 12%? (grados)
                                            </ButtonVerificarConceptual>
                                             <ButtonVerificarConceptual respuesta={respAct3b} preguntaId="angulo-8-porciento" respuestaCorrecta="4.57" onResult={setResAct3b} onRespuestaChange={setRespAct3b}>
                                               b. ¿Cuál es la medida del ángulo de inclinación de las rampas con una pendiente del 8%? (grados)
                                            </ButtonVerificarConceptual>
                                            <ButtonVerificarConceptual respuesta={respAct3c} preguntaId="angulo-6-porciento" respuestaCorrecta="3.43" onResult={setResAct3c} onRespuestaChange={setRespAct3c}>
                                               c. ¿Cuál debería ser la medida del ángulo de inclinación de una rampa cuya pendiente sea del 6%? (grados)
                                            </ButtonVerificarConceptual>
                                        </div>
                                        <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/3.png" alt="Medición de ángulos en GeoGebra" />
                                    </div>

                                    <Separator/>

                                    <h3 className="font-semibold text-lg">Actividad 4</h3>
                                    <p className="text-muted-foreground">Completa la siguiente tabla usando GeoGebra o tu calculadora para encontrar las razones trigonométricas. Considera **D** (Distancia horizontal), **N** (Diferencia de Nivel/altura) y **H** (Hipotenusa/largo de la rampa).</p>
                                    <TablaActividad4 onVerify={() => {}} />

                                    <Separator/>
                                    
                                    <div className="space-y-6">
                                        <h3 className="font-semibold text-lg">Actividad 5 (Cierre)</h3>
                                        <div className="space-y-4">
                                            <ButtonVerificarConceptual respuesta={respAct5a} preguntaId="comandos-inversos" respuestaCorrecta="acosd, asind, atand" onResult={setResAct5a} onRespuestaChange={setRespAct5a}>
                                               a. ¿Qué comandos de GeoGebra y qué funciones de tu calculadora te permiten determinar el ángulo de un triángulo rectángulo conociendo sus lados, sin necesidad de representarlo gráficamente?
                                            </ButtonVerificarConceptual>
                                            <ButtonVerificarConceptual respuesta={respAct5b} preguntaId="pendiente-4-grados" respuestaCorrecta="7%" onResult={setResAct5b} onRespuestaChange={setRespAct5b}>
                                               b. Si se desea que el ángulo de inclinación de una rampa sea de 4°, ¿cuál debería ser el porcentaje aproximado de su pendiente?
                                            </ButtonVerificarConceptual>
                                             <ButtonVerificarConceptual respuesta={respAct5c} preguntaId="distancia-rampa-4-grados" respuestaCorrecta="357.5" onResult={setResAct5c} onRespuestaChange={setRespAct5c}>
                                               c. Si la altura es 25 cm, ¿cuál sería la distancia horizontal para esa rampa de 4°? (en cm)
                                            </ButtonVerificarConceptual>
                                        </div>
                                        <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/5.png" alt="Calculadora científica" />
                                    </div>

                                    <Separator />
                                    
                                    <div className="flex justify-end pt-4">
                                        <AyudaContextual
                                            ejercicioId="la-rampa"
                                            groupId="la-rampa"
                                            onTeoricoToggle={() => handleTeoricoToggle('la-rampa')}
                                            isTeoricoOpen={isTeoricoOpen}
                                        />
                                    </div>
                                     {isTeoricoOpen && (
                                       <EjercicioInteractivo 
                                            ejercicioId="la-rampa"
                                            groupId="la-rampa"
                                            initialContextFiles={activeContextFiles}
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
