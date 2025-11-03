import Header from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EjercicioInteractivo, TablaActividad1, TablaActividad4 } from "@/components/ejercicio-interactivo";
import { Separator } from "@/components/ui/separator";
import { MarkdownImage } from "@/components/markdown-image";


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
                {/* Módulo 1.2 es ahora el único módulo principal */}
                <AccordionItem value="item-1">
                    <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex flex-col items-start text-left">
                                <CardTitle>Módulo 1.2: Situación de Modelación - La Rampa</CardTitle>
                                <CardDescription className="mt-2">
                                    Aprende sobre accesibilidad, pendientes y trigonometría aplicando tus conocimientos en un contexto real e interactivo.
                                </CardDescription>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <CardContent className="space-y-6 divide-y">
                                 {/* SECCIÓN 1: INTRODUCCIÓN */}
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
                                <Separator className="my-6" />

                                {/* SECCIÓN 2: ACTIVIDADES INTERACTIVAS */}
                                <div className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                                    <EjercicioInteractivo ejercicioId="la-rampa-actividad-1" groupId="la-rampa" />
                                </div>

                             </CardContent>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>
        </div>
      </main>
    </div>
  );
}
