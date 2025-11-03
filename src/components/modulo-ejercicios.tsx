'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AyudaContextual, EjercicioInteractivo, TablaActividad1 } from "@/components/ejercicio-interactivo";
import { TeoremaAnguloCentralSVG } from './TeoremaAnguloCentralSVG';
import { Button } from './ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { verificarRespuestaAction } from '@/app/verificador-respuestas-actions';
import { cn } from '@/lib/utils';

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
                                    <h3 className="font-semibold text-lg">Actividad 1</h3>
                                    <p className="text-muted-foreground">Considerando la normativa de accesibilidad, completa la tabla calculando la "diferencia de nivel" (altura) para cada rampa.</p>
                                    <TablaActividad1 onVerify={(results) => console.log('Tabla 1 verificada', results)} />
                                    
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
