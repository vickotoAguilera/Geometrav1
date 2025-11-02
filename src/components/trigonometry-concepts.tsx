'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Sigma } from "lucide-react";

const concepts = [
  {
    name: "Seno (sin)",
    formula: "Cateto Opuesto / Hipotenusa",
    explanation: "El seno de un ángulo es la razón entre la longitud del lado opuesto al ángulo y la longitud de la hipotenusa. Es útil para encontrar la altura de un objeto cuando conoces un ángulo de elevación y la distancia inclinada.",
    visual: "Triangle",
    highlight: { side: "opposite", color: "text-blue-400" }
  },
  {
    name: "Coseno (cos)",
    formula: "Cateto Adyacente / Hipotenusa",
    explanation: "El coseno de un ángulo es la razón entre la longitud del lado adyacente al ángulo y la longitud de la hipotenusa. Se usa para encontrar la distancia horizontal cuando conoces un ángulo y la distancia inclinada.",
    visual: "Triangle",
    highlight: { side: "adjacent", color: "text-red-400" }
  },
  {
    name: "Tangente (tan)",
    formula: "Cateto Opuesto / Cateto Adyacente",
    explanation: "La tangente de un ángulo es la razón entre la longitud del cateto opuesto y el cateto adyacente. Es perfecta para calcular la pendiente de una rampa o la altura de un edificio conociendo la distancia horizontal y el ángulo de elevación.",
    visual: "Triangle",
    highlight: { side: "both", colorOpposite: "text-blue-400", colorAdjacent: "text-red-400" }
  },
  {
    name: "Arcoseno (sin⁻¹)",
    formula: "arcsin(Opuesto / Hipotenusa) = ángulo",
    explanation: "El arcoseno es la función inversa del seno. Se usa para encontrar un ángulo cuando conoces la razón entre el cateto opuesto y la hipotenusa. Devuelve el ángulo cuyo seno es dicha razón.",
    visual: "Triangle",
    highlight: { side: "opposite", color: "text-blue-400" }
  },
  {
    name: "Arcocoseno (cos⁻¹)",
    formula: "arccos(Adyacente / Hipotenusa) = ángulo",
    explanation: "El arcocoseno es la función inversa del coseno. Se usa para encontrar un ángulo cuando conoces la razón entre el cateto adyacente y la hipotenusa. Devuelve el ángulo cuyo coseno es dicha razón.",
    visual: "Triangle",
    highlight: { side: "adjacent", color: "text-red-400" }
  },
  {
    name: "Arcotangente (tan⁻¹)",
    formula: "arctan(Opuesto / Adyacente) = ángulo",
    explanation: "La arcotangente es la función inversa de la tangente. Se usa para encontrar un ángulo cuando conoces la razón entre el cateto opuesto y el cateto adyacente. Devuelve el ángulo cuya tangente es dicha razón.",
    visual: "Triangle",
    highlight: { side: "both", colorOpposite: "text-blue-400", colorAdjacent: "text-red-400" }
  },
  {
    name: "Teorema del Ángulo Central",
    formula: "Ángulo Central = 2 × Ángulo Inscrito",
    explanation: "La medida del ángulo del centro que subtiende un arco es siempre el doble de la medida de cualquier ángulo inscrito que subtiende el mismo arco. Esta es una relación fundamental en la geometría de la circunferencia.",
    visual: "Circle",
    highlight: {}
  }
];

const TriangleSVG = ({ highlight }: { highlight: any }) => (
  <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[150px] mx-auto">
    {/* Triangle */}
    <polygon points="10,90 90,90 10,30" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
    
    {/* Angle alpha symbol */}
    <path d="M 20 90 A 10 10 0 0 1 10 80" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
    <text x="22" y="80" fontSize="8" fill="hsl(var(--foreground))">α</text>

    {/* 90-degree angle symbol */}
    <polygon points="10,90 18,90 18,82" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />

    {/* Labels */}
    <text x="45" y="96" fontSize="6" className={highlight.side === "adjacent" || highlight.side === "both" ? highlight.colorAdjacent : "fill-muted-foreground"}>
      Cateto Adyacente
    </text>
    <text x="-5" y="60" transform="rotate(-90 10 60)" fontSize="6" className={highlight.side === "opposite" || highlight.side === "both" ? highlight.colorOpposite : "fill-muted-foreground"}>
      Cateto Opuesto
    </text>
    <text x="50" y="55" transform="rotate(-33.7 50 60)" fontSize="6" className="fill-muted-foreground">
      Hipotenusa
    </text>

    {/* Highlights */}
    {highlight.side === "opposite" && <line x1="10" y1="30" x2="10" y2="90" strokeWidth="1.5" className={highlight.color} />}
    {highlight.side === "adjacent" && <line x1="10" y1="90" x2="90" y2="90" strokeWidth="1.5" className={highlight.color} />}
    {highlight.side === "both" && (
      <>
        <line x1="10" y1="30" x2="10" y2="90" strokeWidth="1.5" className={highlight.colorOpposite} />
        <line x1="10" y1="90" x2="90" y2="90" strokeWidth="1.5" className={highlight.colorAdjacent} />
      </>
    )}
    <line x1="10" y1="30" x2="90" y2="90" strokeWidth="1.5" className={highlight.side ? "stroke-foreground" : "stroke-primary"} />

  </svg>
);

const CircleSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-auto max-w-[150px] mx-auto">
        {/* Circle */}
        <circle cx="50" cy="50" r="40" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />
        
        {/* Center Point */}
        <circle cx="50" cy="50" r="1.5" fill="hsl(var(--primary))" />
        <text x="52" y="48" fontSize="6" fill="hsl(var(--primary))">O</text>

        {/* Points on Circumference */}
        <circle cx="12" cy="35" r="1.5" fill="hsl(var(--foreground))" />
        <text x="8" y="33" fontSize="6" fill="hsl(var(--foreground))">A</text>
        
        <circle cx="88" cy="35" r="1.5" fill="hsl(var(--foreground))" />
        <text x="90" y="33" fontSize="6" fill="hsl(var(--foreground))">C</text>

        <circle cx="50" cy="90" r="1.5" fill="hsl(var(--foreground))" />
        <text x="52" y="94" fontSize="6" fill="hsl(var(--foreground))">B</text>

        {/* Central Angle */}
        <path d="M 12 35 L 50 50 L 88 35" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
        <path d="M 50 50 Q 55 45, 60 50" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
        <text x="56" y="45" fontSize="8" fill="hsl(var(--primary))">2α</text>
        
        {/* Inscribed Angle */}
        <path d="M 12 35 L 50 90 L 88 35" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1" />
        <path d="M 50 90 Q 50 85, 55 85" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" transform="translate(-5, -5) rotate(15, 50, 90)" />
        <text x="48" y="80" fontSize="8" fill="hsl(var(--foreground))">α</text>
    </svg>
);


export function TrigonometryConcepts() {
  return (
    <TooltipProvider>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept) => (
          <Card key={concept.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {concept.name}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="focus:outline-none">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-xs">
                    <p>{concept.explanation}</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription className="font-mono text-primary text-base pt-2">{concept.formula}</CardDescription>
            </CardHeader>
            <CardContent>
              {concept.visual === "Triangle" ? <TriangleSVG highlight={concept.highlight} /> : <CircleSVG />}
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
