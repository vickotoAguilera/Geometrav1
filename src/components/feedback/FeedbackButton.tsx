'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Enviar feedback"
                title="¿Cómo podemos mejorar?"
            >
                <MessageCircle className="h-6 w-6" />
            </button>

            {/* Modal de feedback */}
            <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
