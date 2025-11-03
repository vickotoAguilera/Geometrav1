'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AyudaContextual, EjercicioInteractivo } from "@/components/ejercicio-interactivo";
import { TeoremaAnguloCentralSVG } from './TeoremaAnguloCentralSVG';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ModuloEjercicios() {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>('item-1');
    const [isTeoricoOpen, setIsTeoricoOpen] = useState(false);
    const [activeContextFiles, setActiveContextFiles] = useState<string[]>(['plaza-skate']);
    const [respuestaSkate, setRespuestaSkate] = useState('');
    const { toast } = useToast();


    const handleTeoricoToggle = (ejercicioId: string) => {
        setIsTeoricoOpen(prev => !prev);
        if (!activeContextFiles.includes(ejercicioId)) {
            setActiveContextFiles(prev => [...prev, ejercicioId]);
        }
    };

    const handleVerificarSkate = () => {
        const respuestaCorrecta1 = "40";
        const respuestaCorrecta2 = "40°";
        if (respuestaSkate.trim() === respuestaCorrecta1 || respuestaSkate.trim() === respuestaCorrecta2) {
            toast({
                title: "¡Respuesta Correcta!",
                description: "La medida del ángulo central es 40°. ¡Bien hecho!",
                variant: 'default',
            });
        } else {
            toast({
                title: "Respuesta Incorrecta",
                description: "Inténtalo de nuevo. Recuerda la relación entre el ángulo inscrito y el ángulo central.",
                variant: 'destructive',
            });
        }
    };


    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                {/* Módulo 1.0 */}
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">Módulo 1.0: Teorema del Ángulo Central (Plaza de Skate)</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1 space-y-4">
                                            <p className="text-muted-foreground max-w-prose">
                                                En el parque de una ciudad hay instaladas cámaras de vigilancia. Una de ellas, ubicada en el punto B de una plaza circular, enfoca con un ángulo de 20° (ángulo inscrito) un objeto sospechoso en el punto C. El encargado de seguridad necesita dirigir la cámara principal, ubicada en el centro O, hacia el mismo objeto. Para ello, necesita saber cuál es la medida del ángulo central (α) que debe formar la cámara principal.
                                            </p>
                                            <div className="space-y-2 pt-4">
                                                <Label htmlFor="respuesta-skate">Tu respuesta (medida del ángulo α):</Label>
                                                <Input 
                                                    id="respuesta-skate" 
                                                    placeholder="Ej: 40°" 
                                                    value={respuestaSkate}
                                                    onChange={(e) => setRespuestaSkate(e.target.value)}
                                                />
                                                <Button onClick={handleVerificarSkate} className="w-full md:w-auto">
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Verificar Respuesta
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <h4 className="font-semibold text-foreground">Teorema del Ángulo Central</h4>
                                            <p className="text-xs text-muted-foreground max-w-xs">La medida del ángulo del centro que subtiende un arco es siempre el doble de la medida de cualquier ángulo inscrito que subtiende el mismo arco.</p>
                                            <TeoremaAnguloCentralSVG className="w-48 h-48" />
                                            <AyudaContextual 
                                                ejercicioId="plaza-skate"
                                                groupId="trigonometria-basica"
                                                onTeoricoToggle={() => handleTeoricoToggle('plaza-skate')}
                                                isTeoricoOpen={isTeoricoOpen}
                                            />
                                        </div>
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
            </Accordion>
        </div>
    );
}
