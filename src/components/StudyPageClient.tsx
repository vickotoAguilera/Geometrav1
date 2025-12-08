'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotesPanel from '@/components/notes/NotesPanel';
import TopicFeedback from '@/components/feedback/TopicFeedback';
import HighlightToolbar from '@/components/notes/HighlightToolbar';

interface StudyPageClientProps {
    temaId: string;
    temaNombre: string;
    contentHtml: string;
}

export default function StudyPageClient({ temaId, temaNombre, contentHtml }: StudyPageClientProps) {
    const [notesOpen, setNotesOpen] = useState(false);
    const [selection, setSelection] = useState<Selection | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const handleSelection = () => {
            // Small delay to ensure selection is complete
            setTimeout(() => {
                const sel = window.getSelection();
                if (sel && sel.toString().trim().length > 0 && !sel.isCollapsed) {
                    setSelection(sel);
                } else {
                    setSelection(null);
                }
            }, 10);
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('touchend', handleSelection); // Add touch support

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('touchend', handleSelection);
        };
    }, []);

    return (
        <>
            {/* Botón de Notas flotante */}
            <Button
                onClick={() => setNotesOpen(true)}
                className="fixed bottom-24 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
                size="icon"
                title="Mis Notas"
            >
                <FileText className="h-6 w-6" />
            </Button>

            {/* Contenido del tema */}
            <article className="prose prose-invert lg:prose-xl max-w-none mx-auto bg-card p-8 rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            </article>

            {/* Topic Feedback Widget */}
            <div className="max-w-none mx-auto mt-8">
                <TopicFeedback temaId={temaId} temaNombre={temaNombre} />
            </div>

            {/* Highlight Toolbar */}
            {selection && (
                <HighlightToolbar
                    selection={selection}
                    temaId={temaId}
                    onHighlight={() => {
                        setRefreshKey(prev => prev + 1);
                        setSelection(null);
                        window.getSelection()?.removeAllRanges();
                    }}
                    onClose={() => {
                        setSelection(null);
                        window.getSelection()?.removeAllRanges();
                    }}
                />
            )}

            {/* Panel de Notas */}
            <NotesPanel
                key={refreshKey}
                temaId={temaId}
                temaNombre={temaNombre}
                isOpen={notesOpen}
                onClose={() => setNotesOpen(false)}
            />
        </>
    );
}
