'use client';

import { SVGProps } from "react";

export function LaRampaSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Triangle */}
      <polygon points="10,80 110,80 110,30" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />

      {/* Angle alpha symbol */}
      <path d="M 20 80 A 10 10 0 0 1 10 70" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
      <text x="22" y="72" fontSize="8" fill="hsl(var(--foreground))" fontWeight="bold">α</text>

      {/* 90-degree angle symbol */}
      <polygon points="110,80 102,80 102,72" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.8" />

      {/* Labels */}
      <text x="55" y="90" fontSize="8" className="fill-muted-foreground" textAnchor="middle">
        Distancia (D)
      </text>
      <text x="115" y="55" fontSize="8" className="fill-muted-foreground" writingMode="vertical-rl" textAnchor="middle">
        Nivel (N)
      </text>
      <text x="60" y="45" transform="rotate(-26.5 60 55)" fontSize="8" className="fill-primary font-bold">
        Hipotenusa (H)
      </text>
    </svg>
  );
}
