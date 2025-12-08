'use client';

export interface Nota {
    id?: string;
    userId: string;
    temaId?: string;
    temaNombre?: string;
    titulo: string;
    contenido: string; // HTML del editor
    tags: string[];
    color?: string;
    favorito: boolean;
    fecha_creacion: Date;
    fecha_modificacion: Date;
}

export interface Highlight {
    id?: string;
    userId: string;
    temaId: string;
    texto: string;
    color: 'yellow' | 'green' | 'blue' | 'pink';
    posicion: {
        start: number;
        end: number;
    };
    nota?: string;
    fecha: Date;
}

export type ColorHighlight = 'yellow' | 'green' | 'blue' | 'pink';
