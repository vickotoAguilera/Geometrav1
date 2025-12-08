'use client';

export type FeedbackType = 'bug' | 'mejora' | 'funcionalidad' | 'contenido';
export type FeedbackEstado = 'pendiente' | 'en_progreso' | 'resuelto' | 'descartado';
export type ProblemaIA = 'incorrecto' | 'confuso' | 'incompleto' | 'otro';

export interface FeedbackGeneral {
    id?: string;
    userId: string;
    userEmail: string;
    tipo: FeedbackType;
    rating: 1 | 2 | 3 | 4 | 5;
    titulo: string;
    comentario: string;
    screenshot?: string;
    pagina: string;
    userAgent: string;
    fecha: Date;
    estado: FeedbackEstado;
    respuesta_admin?: string;
    fecha_respuesta?: Date;
}

export interface FeedbackTema {
    id?: string;
    userId: string;
    temaId: string;
    temaNombre: string;
    gusto: boolean; // true = 👍, false = 👎
    claridad: 1 | 2 | 3 | 4 | 5;
    comentario?: string;
    fecha: Date;
}

export interface FeedbackIA {
    id?: string;
    userId: string;
    conversacionId: string;
    mensajeId: string;
    flujo: string;
    util: boolean;
    problema?: ProblemaIA;
    comentario?: string;
    fecha: Date;
}
