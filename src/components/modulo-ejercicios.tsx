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
import { Label } from './ui/label';
import { Switch } from './ui/switch';


interface EjercicioConceptual {
    id: string;
    pregunta: React.ReactNode;
    respuestaCorrecta: string;
    contextFile: string;
}

const ButtonVerificarConceptual = ({
  ejercicio,
  onContextToggle,
  isContextActive
}: {
  ejercicio: EjercicioConceptual;
  onContextToggle: (file: string, isActive: boolean) => void;
  isContextActive: boolean;
}) => {
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
        <div className="flex justify-between items-start">
            <div className={cn("text-sm font-medium", verificationResult === false ? "text-red-500" : "text-foreground")}>{ejercicio.pregunta}</div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                <Label htmlFor={`switch-${ejercicio.id}`} className="text-xs text-muted-foreground">Contexto IA</Label>
                <Switch
                    id={`switch-${ejercicio.id}`}
                    checked={isContextActive}
                    onCheckedChange={(checked) => onContextToggle(ejercicio.contextFile, checked)}
                />
            </div>
        </div>
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


const ejerciciosModulo1_2: EjercicioConceptual[] = [
    { id: 'act-tec-2', pregunta: '**Actividad 2:** Construye un triángulo con vértices A=(0,0), B=(4,0) y C=(4,3) usando `Polígono(A,B,C)`. Luego, usa `ÁngulosInteriores(t1)`. Escribe los tres ángulos (aprox. a dos decimales) separados por comas.', respuestaCorrecta: '36.87, 53.13, 90', contextFile: 'angulos-y-razones/tutor-geogebra/actividad' },
    { id: 'act-tec-3', pregunta: '**Actividad 3:** Usando `Ángulo()`, convierte `3pi/2`, `pi/3` y `1` rad a grados. Escribe los resultados (aprox. a un decimal) separados por comas.', respuestaCorrecta: '270, 60, 57.3', contextFile: 'angulos-y-razones/tutor-geogebra/actividad' },
    { id: 'act-tec-4', pregunta: '**Actividad 4:** Calcula `sin(30°)`, `cos(30°)` y `tan(30°)`. Escribe los resultados (aprox. a dos decimales) separados por comas.', respuestaCorrecta: '0.5, 0.87, 0.58', contextFile: 'angulos-y-razones/tutor-geogebra/actividad' },
    { id: 'act-tec-7', pregunta: '**Actividad 7:** Usando `asind(0.5)`, `acosd(0.5)` y `atand(0.5)`, ¿qué ángulos en grados obtienes? (aprox. a dos decimales)', respuestaCorrecta: '30, 60, 26.57', contextFile: 'angulos-y-razones/tutor-geogebra/actividad' },
    { id: 'act-tec-10', pregunta: '**Actividad 10 (Calculadora - DEG):** ¿Cuál es el valor de `sin(30°)`?', respuestaCorrecta: '0.5', contextFile: 'angulos-y-razones/tutor-calculadora/actividad' },
    { id: 'act-tec-13', pregunta: '**Actividad 13 (Calculadora - DEG):** ¿Cuál es el ángulo (en grados) cuyo seno es 0.5?', respuestaCorrecta: '30', contextFile: 'angulos-y-razones/tutor-calculadora/actividad' },
    { id: 'act-tec-16', pregunta: '**Actividad 16 (Calculadora - RAD):** ¿Cuál es el valor de `sin(30 rad)`? (Aprox. a dos decimales).', respuestaCorrecta: '-0.99', contextFile: 'angulos-y-razones/tutor-calculadora/actividad' },
    { id: 'act-tec-19', pregunta: '**Actividad 19 (Calculadora - RAD):** ¿Cuál es el ángulo (en radianes) cuyo seno es 0.5? (Aprox. a dos decimales).', respuestaCorrecta: '0.52', contextFile: 'angulos-y-razones/tutor-calculadora/actividad' },
    { id: 'act-tec-22', pregunta: '**Actividad 22 (Calculadora - GRA):** ¿Cuál es el valor de `sin(50g)`? (Aprox. a cuatro decimales).', respuestaCorrecta: '0.7071', contextFile: 'angulos-y-razones/tutor-calculadora/actividad' },
];



export function ModuloEjercicios() {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>('item-1');
    const [activeTeorico, setActiveTeorico] = useState<{isOpen: boolean, groupId: string | null}>({isOpen: false, groupId: null});
    
    // Estado unificado para los archivos de contexto
    const [activeContextFiles, setActiveContextFiles] = useState<string[]>([]);

    const handleContextToggle = (file: string, isActive: boolean) => {
        setActiveContextFiles(prev => {
            const newSet = new Set(prev);
            if(isActive) {
                newSet.add(file);
            } else {
                newSet.delete(file);
            }
            return Array.from(newSet);
        });
    };

    const handleTeoricoToggle = (groupId: string, initialFiles: string[]) => {
        setActiveTeorico(prev => {
            const isOpeningForFirstTime = prev.groupId !== groupId;
            if (isOpeningForFirstTime) {
                // Al abrir un nuevo tutor, se resetea el contexto a los archivos iniciales de ese módulo
                setActiveContextFiles(initialFiles);
            }
            return {
                isOpen: prev.groupId !== groupId ? true : !prev.isOpen,
                groupId: groupId
            }
        });
    };
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Accordion type="single" collapsible className="w-full" value={openAccordion} onValueChange={setOpenAccordion}>
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold">Módulo 1.0: Teorema del Ángulo Central (Plaza de Skate)</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="pt-6">
                                {/* Contenido del Módulo 1.0 */}
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xl font-semibold">Módulo 1.1: Situación de Modelación 1 (La Rampa)</AccordionTrigger>
                    <AccordionContent>
                         <Card>
                            <CardContent className="pt-6">
                                {/* Contenido del Módulo 1.1 */}
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
                                            {ejerciciosModulo1_2.slice(0, 4).map(ej => (
                                                <ButtonVerificarConceptual 
                                                    key={ej.id} 
                                                    ejercicio={ej}
                                                    onContextToggle={handleContextToggle}
                                                    isContextActive={activeContextFiles.includes(ej.contextFile)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator/>
                                    
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="font-semibold text-lg">Actividades con Calculadora (10-27)</h3>
                                        <div style={{position: 'relative', paddingBottom: '56.25%', height: '0', overflow: 'hidden', maxWidth: '100%', borderRadius: '0.5rem', marginBottom: '1rem'}}>
                                            <iframe style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%'}} src="https://www.youtube.com/embed/eFROC2qbNFI" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                        </div>
                                        <div className="space-y-4">
                                             {ejerciciosModulo1_2.slice(4).map(ej => (
                                                <ButtonVerificarConceptual 
                                                    key={ej.id} 
                                                    ejercicio={ej}
                                                    onContextToggle={handleContextToggle}
                                                    isContextActive={activeContextFiles.includes(ej.contextFile)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <Separator />

                                    <div className="flex justify-end pt-4">
                                        <AyudaContextual
                                            ejercicioId="angulos-y-razones"
                                            groupId="angulos-y-razones"
                                            onTeoricoToggle={() => handleTeoricoToggle('angulos-y-razones', ['angulos-y-razones/tutor-geogebra/actividad', 'angulos-y-razones/tutor-calculadora/actividad'])}
                                            isTeoricoOpen={activeTeorico.isOpen && activeTeorico.groupId === 'angulos-y-razones'}
                                        />
                                    </div>

                                    {activeTeorico.isOpen && activeTeorico.groupId === 'angulos-y-razones' && (
                                       <EjercicioInteractivo 
                                            key="angulos-y-razones"
                                            groupId="angulos-y-razones"
                                            activeContextFiles={activeContextFiles}
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
