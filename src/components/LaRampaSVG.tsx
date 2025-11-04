'use client';

import { SVGProps } from "react";

export function LaRampaSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Triangle */}
      <polygon points="10,80 110,80 110,30" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />

      {/* Angle alpha symbol with value - CORRECTED */}
      <path d="M 25 80 A 15 15 0 0 1 24.3 65.7" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" />
      <text x="28" y="70" fontSize="8" fill="hsl(var(--primary))" fontWeight="bold">α = 12°</text>

      {/* 90-degree angle symbol */}
      <polygon points="110,80 102,80 102,72" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.8" />

      {/* Labels with values */}
      <text x="60" y="92" fontSize="8" className="fill-muted-foreground" textAnchor="middle">
        Distancia (D) = 10 m
      </text>
      <text x="115" y="55" fontSize="8" className="fill-muted-foreground" writingMode="vertical-rl" textAnchor="middle">
        Nivel (N) = ?
      </text>
      <text x="55" y="48" transform="rotate(-26.5 60 55)" fontSize="8" className="fill-primary font-bold">
        Hipotenusa (H) = ?
      </text>
    </svg>
  );
}
