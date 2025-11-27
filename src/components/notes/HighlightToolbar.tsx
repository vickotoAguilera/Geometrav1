'use client';

import { useState, useEffect } from 'react';
import { Highlighter, PenTool, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/firebase/provider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ColorHighlight } from '@/types/notes';

interface HighlightToolbarProps {
    selection: Selection | null;
    temaId: string;
    onHighlight: () => void;
    onClose: () => void;
}

export default function HighlightToolbar({ selection, temaId, onHighlight, onClose }: HighlightToolbarProps) {
    const { user } = useUser();
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Calcular posición absoluta considerando el scroll
            setPosition({
                top: rect.top + window.scrollY - 50, // 50px arriba de la selección
                left: rect.left + window.scrollX + (rect.width / 2) - 100 // Centrado
            });
        }
    }, [selection]);

    const handleHighlight = async (color: ColorHighlight) => {
        if (!user || !selection) return;

        const text = selection.toString();
        if (!text) return;

        try {
            await addDoc(collection(db, 'user_highlights'), {
                userId: user.uid,
                temaId,
                texto: text,
                color,
                fecha: serverTimestamp()
            });

            onHighlight();
        } catch (error) {
            console.error('Error guardando highlight:', error);
        }
    };

    if (!selection || selection.isCollapsed) return null;

    return (
        <Card
            className="fixed z-50 p-2 flex gap-2 items-center shadow-xl animate-in fade-in zoom-in duration-200"
            style={{ top: position.top, left: position.left }}
        >
            <div className="flex gap-1 border-r pr-2 mr-2">
                <button
                    onClick={() => handleHighlight('yellow')}
                    className="w-6 h-6 rounded-full bg-yellow-300 hover:scale-110 transition-transform border border-yellow-400"
                    title="Resaltar Amarillo"
                />
                <button
                    onClick={() => handleHighlight('green')}
                    className="w-6 h-6 rounded-full bg-green-300 hover:scale-110 transition-transform border border-green-400"
                    title="Resaltar Verde"
                />
                <button
                    onClick={() => handleHighlight('blue')}
                    className="w-6 h-6 rounded-full bg-blue-300 hover:scale-110 transition-transform border border-blue-400"
                    title="Resaltar Azul"
                />
                <button
                    onClick={() => handleHighlight('pink')}
                    className="w-6 h-6 rounded-full bg-pink-300 hover:scale-110 transition-transform border border-pink-400"
                    title="Resaltar Rosa"
                />
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
        </Card>
    );
}
