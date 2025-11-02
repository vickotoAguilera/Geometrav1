'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

const concepts = [
  {
    name: "Seno (sin)",
    formula: "Cateto Opuesto / Hipotenusa",
    explanation: "El seno de un ángulo es la razón entre la longitud del lado opuesto al ángulo y la longitud de la hipotenusa. Es útil para encontrar la altura de un objeto cuando conoces un ángulo de elevación y la distancia inclinada.",
    highlight: { side: "opposite", color: "text-blue-400" }
  },
  {
    name: "Coseno (cos)",
    formula: "Cateto Adyacente / Hipotenusa",
    explanation: "El coseno de un ángulo es la razón entre la longitud del lado adyacente al ángulo y la longitud de la hipotenusa. Se usa para encontrar la distancia horizontal cuando conoces un ángulo y la distancia inclinada.",
    highlight: { side: "adjacent", color: "text-red-400" }
  },
  {
    name: "Tangente (tan)",
    formula: "Cateto Opuesto / Cateto Adyacente",
    explanation: "La tangente de un ángulo es la razón entre la longitud del cateto opuesto y el cateto adyacente. Es perfecta para calcular la pendiente de una rampa o la altura de un edificio conociendo la distancia horizontal y el ángulo de elevación.",
    highlight: { side: "both", colorOpposite: "text-blue-400", colorAdjacent: "text-red-400" }
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


export function TrigonometryConcepts() {
  return (
    <TooltipProvider>
      <div className="grid md:grid-cols-3 gap-8">
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
              <TriangleSVG highlight={concept.highlight} />
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
