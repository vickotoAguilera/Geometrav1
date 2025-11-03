'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from './ui/button';
import { ImageIcon } from 'lucide-react';


interface MarkdownImageProps {
  src: string;
  alt: string;
}

export function MarkdownImage({ src, alt }: MarkdownImageProps) {

  // The markdown path might be URL encoded, so we decode it.
  const decodedSrc = decodeURIComponent(src);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="my-2">
            <ImageIcon className="mr-2 h-4 w-4"/>
            Ver Imagen de Apoyo ({alt})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{alt}</DialogTitle>
          <DialogDescription>
            Imagen de apoyo para la guía.
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full aspect-video mt-4">
           <Image 
                src={decodedSrc} 
                alt={alt} 
                layout="fill"
                objectFit="contain"
                className="rounded-md"
            />
        </div>
      </DialogContent>
    </Dialog>
  )
}
