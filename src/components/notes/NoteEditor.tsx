'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Code, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
    contenido: string;
    onUpdate: (contenido: string) => void;
    placeholder?: string;
    autoSave?: boolean;
}

export default function NoteEditor({
    contenido,
    onUpdate,
    placeholder = 'Escribe tus notas aquí...',
    autoSave = true
}: NoteEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            CharacterCount,
        ],
        content: contenido,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onUpdate(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] max-w-none p-4',
            },
        },
    });

    // Auto-save cada 3 segundos
    useEffect(() => {
        if (!autoSave || !editor) return;

        const timer = setTimeout(() => {
            const currentContent = editor.getHTML();
            if (currentContent !== contenido) {
                setIsSaving(true);
                onUpdate(currentContent);
                setTimeout(() => {
                    setIsSaving(false);
                    setLastSaved(new Date());
                }, 500);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [editor?.getHTML(), autoSave]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b bg-muted/50 p-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(editor.isActive('bold') && 'bg-muted')}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(editor.isActive('italic') && 'bg-muted')}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(editor.isActive('bulletList') && 'bg-muted')}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(editor.isActive('orderedList') && 'bg-muted')}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={cn(editor.isActive('code') && 'bg-muted')}
                >
                    <Code className="h-4 w-4" />
                </Button>

                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    {isSaving && (
                        <span className="flex items-center gap-1">
                            <Save className="h-3 w-3 animate-pulse" />
                            Guardando...
                        </span>
                    )}
                    {!isSaving && lastSaved && (
                        <span>Guardado ✓</span>
                    )}
                    <span>
                        {editor.storage.characterCount.characters()} caracteres
                    </span>
                </div>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} className="bg-background" />
        </div>
    );
}
