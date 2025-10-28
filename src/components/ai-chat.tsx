"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, User } from "lucide-react";

export default function AIChat() {

  return (
    <>
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="font-headline">Asistente Geometra</SheetTitle>
        <SheetDescription>
          El chat está deshabilitado en esta versión de diseño.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
            <div className="flex items-start gap-4 justify-end">
              <div className="max-w-[80%] p-3 rounded-lg text-sm bg-primary text-primary-foreground">
                <p>Hola, ¿puedes ayudarme con la mediatriz de un segmento?</p>
              </div>
              <Avatar className="w-8 h-8 border">
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-start gap-4">
              <Avatar className="w-8 h-8 border">
                <AvatarFallback>
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[80%] p-3 rounded-lg text-sm bg-secondary">
                <p>¡Claro, alumno! Para crear una mediatriz, usa el comando `Mediatriz(A, B)` donde A y B son los puntos extremos de tu segmento.</p>
              </div>
            </div>
        </div>
      </ScrollArea>

      <SheetFooter className="p-4 border-t">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full space-x-2 items-start"
          >
            <Textarea
                placeholder="El chat está deshabilitado en esta versión."
                className="resize-none"
                rows={1}
                disabled
            />
            <Button type="submit" size="icon" disabled>
              <Send className="w-4 h-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
      </SheetFooter>
    </>
  );
}