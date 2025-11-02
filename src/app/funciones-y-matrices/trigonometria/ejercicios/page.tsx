import Header from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sigma } from "lucide-react";
import { EjercicioInteractivo } from "@/components/ejercicio-interactivo";

const CentralAngleTheoremVisual = () => (
    <div className="flex justify-center items-center my-4">
        <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[250px] mx-auto">
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
            <path d="M 50 50 Q 58 42, 65 40" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
            <text x="62" y="45" fontSize="8" fill="hsl(var(--primary))">2α</text>
            
            {/* Inscribed Angle */}
            <path d="M 10 30 L 50 95 L 90 30" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1" />
             <path d="M 50 95 Q 50 88, 57 86" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" transform="translate(-8, -8) rotate(20, 50, 95)" />
            <text x="48" y="82" fontSize="8" fill="hsl(var(--foreground))">α</text>
        </svg>
    </div>
);


export default function EjerciciosTrigonometriaPage() {
  const groupId = "trigonometria-basica";

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
            <Card>
                <CardHeader>
                    <CardTitle>Módulo 1: La Plaza de Skate</CardTitle>
                    <CardDescription>
                        Los siguientes ejercicios se basan en la misma situación. Resuélvelos usando la ayuda del tutor de GeoGebra si lo necesitas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 divide-y">
                    <div className="pt-6">
                        <CentralAngleTheoremVisual/>
                        <div className="p-4 border rounded-lg bg-background">
                            <h4 className="font-semibold flex items-center gap-2"><Sigma/>Ejercicio A: Ángulo de la Cámara Central</h4>
                            <p className="mt-2 text-muted-foreground">
                                La cámara situada en el punto B, enfocada hacia el punto C, forma un ángulo **α** con respecto al centro de la plaza. Si un guardia ha detectado un movimiento sospechoso en el punto C, ¿cuántos grados debe girar la cámara que se encuentra en el centro del árbol (O), actualmente dirigida al punto A, para obtener una mejor visualización del punto C?
                            </p>
                        </div>
                        
                        <EjercicioInteractivo ejercicioId="plaza-skate" groupId={groupId} />
                    </div>

                     <div className="pt-6">
                        <div className="p-4 border rounded-lg bg-background">
                            <h4 className="font-semibold flex items-center gap-2"><Sigma/>Ejercicio B: Conversión a Radianes</h4>
                            <p className="mt-2 text-muted-foreground">
                                Si el programa de la cámara sólo permitiera ingresar las medidas de los ángulos en radianes para realizar los giros, ¿cuál sería la expresión algebraica para convertir el ángulo de giro (en grados) a radianes, considerando que **π radianes son equivalentes a 180°**?
                            </p>
                        </div>

                        <EjercicioInteractivo ejercicioId="conversion-radianes" groupId={groupId} />
                    </div>
                </CardContent>
            </Card>
        </div>

      </main>
    </div>
  );
}
