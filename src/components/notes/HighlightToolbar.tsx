'use client';

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

    // Capture selection data immediately to prevent loss when clicking buttons
    const capturedData = (() => {
        if (!selection || selection.rangeCount === 0) {
            return null;
        }
        try {
            const range = selection.getRangeAt(0);
            const text = selection.toString().trim();
            return { range: range.cloneRange(), text };
        } catch (error) {
            console.error('Error capturing selection:', error);
            return null;
        }
    })();

    // Calculate position directly from selection
    const getPosition = () => {
        if (!selection || selection.rangeCount === 0) {
            return { top: 0, left: 0 };
        }

        try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Calcular posición absoluta considerando el scroll
            const top = rect.top + window.scrollY - 60; // 60px arriba de la selección
            const left = rect.left + window.scrollX + (rect.width / 2) - 100; // Centrado



            return { top, left };
        } catch (error) {
            console.error('Error calculating position:', error);
            return { top: 0, left: 0 };
        }
    };

    const position = getPosition();

    const handleHighlight = async (color: ColorHighlight) => {
        console.log('handleHighlight called with color:', color);
        console.log('User:', user);
        console.log('Captured data:', capturedData);

        if (!user) {
            console.error('No user authenticated');
            alert('Debes iniciar sesión para guardar resaltados');
            return;
        }

        if (!capturedData) {
            console.error('No captured selection data');
            return;
        }

        const { text, range } = capturedData;
        console.log('Selected text:', text);

        if (!text) {
            console.error('Empty text selection');
            return;
        }

        try {
            // Save to Firestore
            console.log('Saving to Firestore...');
            const docRef = await addDoc(collection(db, 'user_highlights'), {
                userId: user.uid,
                temaId,
                texto: text,
                color,
                fecha: serverTimestamp()
            });
            console.log('Saved to Firestore with ID:', docRef.id);

            // Apply visual highlight
            try {
                const span = document.createElement('mark');

                // Apply color styling
                const colorMap = {
                    yellow: 'bg-yellow-300/40 dark:bg-yellow-400/30',
                    green: 'bg-green-300/40 dark:bg-green-400/30',
                    blue: 'bg-blue-300/40 dark:bg-blue-400/30',
                    pink: 'bg-pink-300/40 dark:bg-pink-400/30'
                };

                span.className = `${colorMap[color]} rounded px-0.5`;
                span.setAttribute('data-highlight-color', color);

                // Wrap the selected text using the captured range
                range.surroundContents(span);
                console.log('Visual highlight applied successfully');
            } catch (visualError) {
                console.warn('Could not apply visual highlight:', visualError);
                console.log('Highlight saved to DB but visual wrapping failed');
            }

            onHighlight();
        } catch (error) {
            console.error('Error in handleHighlight:', error);
            alert('Error al guardar el resaltado: ' + (error as Error).message);
        }
    };

    if (!selection || selection.isCollapsed) {
        return null;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
        return null;
    }

    return (
        <div
            className="fixed z-[9999] p-3 flex gap-3 items-center shadow-2xl bg-slate-800 border border-slate-600 rounded-lg backdrop-blur-sm animate-in fade-in zoom-in duration-200"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
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
        </div>
    );
}
