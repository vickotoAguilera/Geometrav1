'use client';

import { SVGProps } from "react";

export function TeoremaAnguloCentralSVG(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Circle */}
      <circle cx="60" cy="60" r="50" fill="hsl(var(--muted))" stroke="hsl(var(--foreground))" strokeWidth="1" />

      {/* Center Point O */}
      <circle cx="60" cy="60" r="2" fill="hsl(var(--primary))" />
      <text x="58" y="68" fontSize="8" fill="hsl(var(--primary))" fontWeight="bold">O</text>

      {/* Points on Circumference */}
      <circle cx="21.6" cy="30.5" r="2" fill="hsl(var(--foreground))" />
      <text x="15" y="28" fontSize="8" fill="hsl(var(--foreground))">A</text>
      
      <circle cx="98.4" cy="30.5" r="2" fill="hsl(var(--foreground))" />
      <text x="102" y="28" fontSize="8" fill="hsl(var(--foreground))">C</text>
      
      <circle cx="60" cy="110" r="2" fill="hsl(var(--foreground))" />
      <text x="63" y="114" fontSize="8" fill="hsl(var(--foreground))">B</text>

      {/* Central Angle (2 * alpha) */}
      <path d="M 21.6 30.5 L 60 60 L 98.4 30.5" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <path d="M 75 48 A 20 20 0 0 0 45 48" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.8" />
      <text x="56" y="52" fontSize="8" fill="hsl(var(--primary))" fontWeight="bold">2α</text>

      {/* Inscribed Angle (alpha) */}
      <path d="M 21.6 30.5 L 60 110 L 98.4 30.5" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1" />
      <path d="M 70 95 A 15 15 0 0 0 50 95" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
      <text x="58" y="98" fontSize="8" fill="hsl(var(--foreground))">α</text>
    </svg>
  );
}
