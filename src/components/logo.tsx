import type { SVGProps } from 'react';

export default function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12h18" />
      <path d="M3 6h18" />
      <path d="M3 18h18" />
      <path d="M12 3v18" />
      <path d="M6 3v18" />
      <path d="M18 3v18" />
      <circle cx="12" cy="12" r="4" fill="hsl(var(--primary))" stroke="none" />
    </svg>
  );
}