'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AyudaContextual, EjercicioInteractivo, TablaActividad1, TablaActividad4 } from "@/components/ejercicio-interactivo";
import { TeoremaAnguloCentralSVG } from './TeoremaAnguloCentralSVG';
import { Button } from './ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { verificarRespuestaAction } from '@/app/verificador-respuestas-actions';
import { cn } from '@/lib/utils';
import { MarkdownImage } from './markdown-image';

export function ModuloEjercicios() {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>('item-1');
    const [isTeoricoOpen, setIsTeoricoOpen] = useState(false);
    const [activeContextFiles, setActiveContextFiles] = useState<string[]>(['plaza-skate']);
    
    const [respuestaSkate, setRespuestaSkate] = useState('');
    const [respuestaRadianes, setRespuestaRadianes] = useState('');
    
    const [isVerifyingSkate, setIsVerifyingSkate] = useState(false);
    const [isVerifyingRadianes, setIsVerifyingRadianes] = useState(false);
    
    const [resultadoSkate, setResultadoSkate] = useState<boolean | null>(null);
    const [resultadoRadianes, setResultadoRadianes] = useState<boolean | null>(null);

    const [resultadosTabla1, setResultadosTabla1] = useState<(boolean | null)[]>([]);
    const [resultadosTabla4, setResultadosTabla4] = useState<(boolean | null)[]>([]);


    const { toast } = useToast();

    const handleTeoricoToggle = (ejercicioId: string) => {
        setIsTeoricoOpen(prev => !prev);
        if (!activeContextFiles.includes(ejercicioId)) {
            setActiveContextFiles(prev => [...prev, ejercicioId]);
        }
    };

    const handleVerificarSkate = async () => {
        if (!respuestaSkate.trim()) {
            toast({ title: "Respuesta vacía", description: "Por favor, escribe una respuesta.", variant: "destructive" });
            return;
        }
        setIsVerifyingSkate(true);
        setResultadoSkate(null);
        try {
            const res = await verificarRespuestaAction({
                preguntaId: 'angulo-central',
                respuestaUsuario: respuestaSkate,
                respuestaCorrecta: '40'
            });
            setResultadoSkate(res.esCorrecta);
            toast({ title: res.esCorrecta ? "¡Respuesta Correcta!" : "Respuesta Incorrecta", description: res.feedback });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo verificar la respuesta.", variant: "destructive" });
        } finally {
            setIsVerifyingSkate(false);
        }
    };

    const handleVerificarRadianes = async () => {
        if (!respuestaRadianes.trim()) {
            toast({ title: "Respuesta vacía", description: "Por favor, escribe una respuesta.", variant: "destructive" });
            return;
        }
        setIsVerifyingRadianes(true);
        setResultadoRadianes(null);
        try {
            const res = await verificarRespuestaAction({
                preguntaId: 'conversion-radianes',
                respuestaUsuario: respuestaRadianes,
                respuestaCorrecta: '2*pi/9'
            });
            setResultadoRadianes(res.esCorrecta);
            toast({ title: res.esCorrecta ? "¡Respuesta Correcta!" : "Respuesta Incorrecta", description: res.feedback });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo verificar la respuesta.", variant: "destructive" });
        } finally {
            setIsVerifyingRadianes(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                {/* Módulo 1.0 y 1.1 unificados */}
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
                                                <Label htmlFor="respuesta-skate">Tu respuesta (medida del ángulo α):</Label>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        id="respuesta-skate" 
                                                        placeholder="Escribe la medida del ángulo..."
                                                        value={respuestaSkate}
                                                        onChange={(e) => { setRespuestaSkate(e.target.value); setResultadoSkate(null); }}
                                                        className={cn(resultadoSkate === true && 'border-green-500', resultadoSkate === false && 'border-red-500')}
                                                    />
                                                    <Button onClick={handleVerificarSkate} disabled={isVerifyingSkate}>
                                                        {isVerifyingSkate ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                                                        Verificar
                                                    </Button>
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
                                        <p className="text-muted-foreground max-w-prose">
                                            Ahora, convierte el ángulo central que calculaste en el ejercicio anterior a radianes. Utiliza `pi` o `π` en tu respuesta para que sea exacta.
                                        </p>
                                        
                                        <div className="p-4 border rounded-lg bg-background text-sm space-y-2">
                                            <h4 className="font-semibold text-foreground">¿Cómo convertir grados a radianes?</h4>
                                            <p className="text-muted-foreground">Existe una fórmula muy directa. Es una "regla de tres" o un factor de conversión.</p>
                                            <p className="text-muted-foreground">La relación fundamental es: <code className="bg-muted px-1.5 py-0.5 rounded">180° = π radianes</code></p>
                                            <p className="text-muted-foreground">A partir de esa equivalencia, la fórmula para convertir cualquier ángulo de grados a radianes es:</p>
                                            <code className="block text-center bg-muted p-2 rounded-md font-semibold">radianes = grados × (π / 180)</code>
                                        </div>

                                        <div className="space-y-2 pt-4">
                                            <Label htmlFor="respuesta-radianes">Respuesta en radianes:</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    id="respuesta-radianes" 
                                                    placeholder="Escribe tu respuesta en radianes..."
                                                    value={respuestaRadianes}
                                                    onChange={(e) => { setRespuestaRadianes(e.target.value); setResultadoRadianes(null); }}
                                                    className={cn(resultadoRadianes === true && 'border-green-500', resultadoRadianes === false && 'border-red-500')}
                                                />
                                                <Button onClick={handleVerificarRadianes} disabled={isVerifyingRadianes}>
                                                    {isVerifyingRadianes ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                                                    Verificar
                                                </Button>
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
                {/* Módulo 1.1 */}
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
                                    <TablaActividad1 onVerify={(results) => setResultadosTabla1(results)} />

                                    <Separator/>

                                    <h3 className="font-semibold text-lg">Actividad 2 y 3</h3>
                                    <p className="text-muted-foreground">Usa GeoGebra para dibujar las rampas de la tabla anterior y medir sus ángulos. Esto te ayudará a entender la relación entre pendiente y ángulo. ¿Qué tipo de triángulo representan? ¿Qué semejanzas y diferencias observas? ¿Cuál es el ángulo para una pendiente del 12%? ¿Y del 8%?</p>
                                    <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/3.png" alt="Medición de ángulos en GeoGebra" />

                                    <Separator/>

                                    <h3 className="font-semibold text-lg">Actividad 4</h3>
                                    <p className="text-muted-foreground">Completa la siguiente tabla usando GeoGebra o tu calculadora para encontrar las razones trigonométricas. Considera **D** (Distancia horizontal), **N** (Diferencia de Nivel/altura) y **H** (Hipotenusa/largo de la rampa).</p>
                                    <TablaActividad4 onVerify={(results) => setResultadosTabla4(results)} />

                                    <Separator/>
                                    
                                    <h3 className="font-semibold text-lg">Actividad 5 (Cierre)</h3>
                                    <p className="text-muted-foreground">Ahora reflexiona sobre lo aprendido: ¿Qué herramientas de GeoGebra o tu calculadora te permiten obtener un ángulo a partir de sus lados? Si quisieras una rampa con 4° de inclinación, ¿qué pendiente debería tener? Y si la altura debe ser de 25 cm, ¿cuál sería la distancia horizontal?</p>
                                    <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/5.png" alt="Calculadora científica" />

                                    <Separator />
                                    
                                    <div className="flex justify-end pt-4">
                                        <AyudaContextual
                                            ejercicioId="la-rampa-actividad-1"
                                            groupId="la-rampa"
                                            onTeoricoToggle={() => handleTeoricoToggle('la-rampa-actividad-1')}
                                            isTeoricoOpen={isTeoricoOpen}
                                        />
                                    </div>
                                    {isTeoricoOpen && (
                                       <EjercicioInteractivo 
                                            ejercicioId="la-rampa-actividad-1"
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
