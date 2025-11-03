import Header from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sigma, Calculator, MonitorPlay, Accessibility } from "lucide-react";
import { EjercicioInteractivo } from "@/components/ejercicio-interactivo";
import { Separator } from "@/components/ui/separator";
import { MarkdownImage } from "@/components/markdown-image";


const CentralAngleTheoremVisual = () => (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-background/50 h-full">
        <h4 className="text-sm font-semibold text-center mb-2">Teorema del Ángulo Central</h4>
        <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[200px] mx-auto">
            {/* Circle */}
            <circle cx="50" cy="50" r="45" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
            
            {/* Center Point */}
            <circle cx="50" cy="50" r="1.5" fill="hsl(var(--primary))" />
            <text x="53" y="48" fontSize="6" fill="hsl(var(--primary))">O</text>

            {/* Points on Circumference */}
            <circle cx="10" cy="30" r="1.5" fill="hsl(var(--foreground))" />
            <text x="6" y="28" fontSize="6" fill="hsl(var(--foreground))">A</text>
            
            <circle cx="90" cy="30" r="1.5" fill="hsl(var(--foreground))" />
            <text x="92" y="28" fontSize="6" fill="hsl(var(--foreground))">C</text>

            <circle cx="50" cy="95" r="1.5" fill="hsl(var(--foreground))" />
            <text x="52" y="99" fontSize="6" fill="hsl(var(--foreground))">B</text>

            {/* Central Angle */}
            <path d="M 10 30 L 50 50 L 90 30" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
            <path d="M 60 38 A 15 15 0 0 0 40 38" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
            <text x="46" y="35" fontSize="8" fill="hsl(var(--primary))">2α</text>
            
            {/* Inscribed Angle */}
            <path d="M 10 30 L 50 95 L 90 30" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1" />
            <path d="M 45 85 A 10 10 0 0 1 55 85" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
            <text x="48" y="78" fontSize="8" fill="hsl(var(--foreground))">α</text>
        </svg>
        <p className="text-xs text-center text-muted-foreground mt-2 px-2">
           El ángulo del centro (`2α`) es siempre el doble que el ángulo inscrito (`α`) que abarca el mismo arco.
        </p>
    </div>
);

const RadianConversionVisual = () => (
    <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-background/50 h-full">
        <h4 className="text-sm font-semibold text-center mb-2">Conversión de Grados a Radianes</h4>
        <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[200px] mx-auto">
            {/* Semicircle */}
            <path d="M 5,50 A 45,45 0 0,1 95,50" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(var(--foreground))" strokeWidth="1" />
            
            {/* Center Point */}
            <circle cx="50" cy="50" r="1.5" fill="hsl(var(--foreground))" />

            {/* Labels */}
            <text x="45" y="30" fontSize="8" fill="hsl(var(--primary))" className="font-semibold">π rad</text>
            <text x="45" y="65" fontSize="8" fill="hsl(var(--foreground))">180°</text>
        </svg>
        <p className="text-xs text-center text-muted-foreground mt-2 px-2">
            La equivalencia fundamental es: <strong>π radianes = 180 grados</strong>. Se usa para convertir cualquier ángulo entre estas dos unidades.
        </p>
    </div>
);


export default function EjerciciosTrigonometriaPage() {

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">Ejercicios de Trigonometría</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
            Aplica los conceptos aprendidos para resolver los siguientes problemas.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex flex-col items-start text-left">
                                <CardTitle>Módulo 1: La Plaza de Skate</CardTitle>
                                <CardDescription className="mt-2">
                                    Los siguientes ejercicios se basan en la misma situación. Resuélvelos usando la ayuda del tutor de GeoGebra si lo necesitas.
                                </CardDescription>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <CardContent className="space-y-6 divide-y">
                                <div className="pt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-4 border rounded-lg bg-background flex flex-col">
                                            <h4 className="font-semibold flex items-center gap-2"><Sigma/>Ejercicio A: Ángulo de la Cámara Central</h4>
                                            <p className="mt-2 text-muted-foreground flex-1">
                                                La cámara situada en el punto B, enfocada hacia el punto C, forma un ángulo <strong>α de 20°</strong> con respecto al centro de la plaza. Si un guardia ha detectado un movimiento sospechoso en el punto C, ¿cuántos grados debe girar la cámara que se encuentra en el centro del árbol (O), actualmente dirigida al punto A, para obtener una mejor visualización del punto C?
                                            </p>
                                        </div>
                                        <CentralAngleTheoremVisual/>
                                    </div>
                                    
                                    <EjercicioInteractivo ejercicioId="plaza-skate" groupId="trigonometria-basica" />
                                </div>

                                <div className="pt-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="p-4 border rounded-lg bg-background flex flex-col">
                                            <h4 className="font-semibold flex items-center gap-2"><Sigma/>Ejercicio B: Conversión a Radianes</h4>
                                            <p className="mt-2 text-muted-foreground flex-1">
                                                Si el programa de la cámara sólo permitiera ingresar las medidas de los ángulos en radianes para realizar los giros, ¿cuál sería la expresión algebraica para convertir el ángulo de giro (en grados) a radianes, considerando que <strong>π radianes son equivalentes a 180°</strong>?
                                            </p>
                                        </div>
                                        <RadianConversionVisual />
                                    </div>

                                    <EjercicioInteractivo ejercicioId="conversion-radianes" groupId="trigonometria-basica" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-xs text-muted-foreground">Todos los ejercicios de este módulo comparten el mismo chat y pizarra de GeoGebra.</p>
                            </CardFooter>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                 <AccordionItem value="item-1.2">
                    <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex flex-col items-start text-left">
                                <CardTitle>Módulo 1.2: Situación de Modelación - La Rampa</CardTitle>
                                <CardDescription className="mt-2">
                                    Aprende sobre accesibilidad, pendientes y trigonometría aplicando tus conocimientos en un contexto real.
                                </CardDescription>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <CardContent className="space-y-6 divide-y">
                                 <div className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                                    <h3>SITUACIÓN DE MODELACIÓN 1: LA RAMPA</h3>
                                    <p>
                                        Las rampas son esenciales para garantizar la accesibilidad en espacios públicos y privados, permitiendo a las personas con discapacidad una movilidad segura y autónoma. Factores como la pendiente máxima permitida y las dimensiones óptimas son determinantes para facilitar el acceso sin comprometer la estabilidad o la comodidad del usuario. La correcta implementación de materiales antideslizantes y barras de apoyo también juega un papel vital en la funcionalidad y seguridad de estas estructuras.
                                    </p>
                                    <MarkdownImage src="/imagenes-ejercicios/Situación de modelación 1 La rampa/1.png" alt="Ilustración de una persona en silla de ruedas usando una rampa." />
                                    <p>
                                        Para asegurar que las rampas sean accesibles y seguras, la norma vigente en Chile establece que la pendiente máxima permitida para rampas es del <strong>12%</strong> para distancias horizontales de hasta 150 cm. Esto significa que, por cada 100 cm de recorrido horizontal, la rampa puede tener hasta 12 cm de altura. Cuando la distancia horizontal es mayor a 150 cm, la pendiente debe reducirse a un <strong>8%</strong>.
                                    </p>
                                </div>
                             </CardContent>
                             <CardFooter>
                                <p className="text-xs text-muted-foreground">Este módulo es una combinación de teoría y actividades interactivas.</p>
                            </CardFooter>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                <AccordionItem value="item-1.1">
                    <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex flex-col items-start text-left">
                                <CardTitle>Módulo 1.1: Actividad Tecnológica - Ángulos y Razones Trigonométricas</CardTitle>
                                <CardDescription className="mt-2">
                                    Este módulo te enseñará a usar GeoGebra y una calculadora científica para trabajar con trigonometría.
                                </CardDescription>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <CardContent className="space-y-6 divide-y">
                                <div className="pt-6">
                                    <div className="p-4 border rounded-lg bg-background flex flex-col">
                                        <h4 className="font-semibold flex items-center gap-2"><MonitorPlay />Guía de Uso de GeoGebra</h4>
                                        <p className="mt-2 text-muted-foreground flex-1">
                                            Aprende a construir triángulos, transformar ángulos y calcular razones trigonométricas usando los comandos de GeoGebra.
                                        </p>
                                    </div>
                                    <EjercicioInteractivo ejercicioId="nuevo-ejercicio-geogebra" groupId="actividad-tecnologica" />
                                </div>

                                <div className="pt-6">
                                    <div className="p-4 border rounded-lg bg-background flex flex-col">
                                        <h4 className="font-semibold flex items-center gap-2"><Calculator />Guía de Uso de Calculadora Científica</h4>
                                        <p className="mt-2 text-muted-foreground flex-1">
                                            Aprende a configurar tu calculadora en modo Grados (DEG), Radianes (RAD) y Gradianes (GRA) para resolver problemas trigonométricos.
                                        </p>
                                    </div>
                                    <EjercicioInteractivo ejercicioId="nuevo-ejercicio-calculadora" groupId="actividad-tecnologica" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-xs text-muted-foreground">Cada guía tiene su propio tutor especializado.</p>
                            </CardFooter>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
        </div>

      </main>
    </div>
  );
}
