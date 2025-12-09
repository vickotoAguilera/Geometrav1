"use client";

import Link from "next/link";
import Logo from "./logo";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, User as UserIcon, Bot, MessageSquareHeart, Menu, UserCircle } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, VisuallyHidden } from "./ui/sheet";
import { ChatAssistant } from "./chat-assistant";
import { ChatBeta } from "./chat-beta/ChatBeta";
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (isUserLoading) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <Button variant="outline" size="icon" onClick={handleSignIn} title="Iniciar sesión con Google">
        <GoogleIcon className="h-5 w-5" />
        <span className="sr-only">Iniciar sesión con Google</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.photoURL || user.photoURL || ''} alt={profile?.displayName || user.displayName || 'Usuario'} />
            <AvatarFallback>
              <UserIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.displayName || user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Mi Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AIChatButton = () => {
  // Ocultar el asistente IA principal
  return null;
}

const AIChatBetaButton = () => {
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-full lg:max-w-md p-0 flex flex-col h-full">
        <VisuallyHidden>
          <SheetTitle>Asistente Geometra</SheetTitle>
        </VisuallyHidden>
        <ChatBeta />
      </SheetContent>
    </Sheet>
  );
}


        </div>
      </SheetContent>
    </Sheet>
  )
}


export default function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // No renderizar el header en la página del applet
  if (pathname === '/applet') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {isMobile ? (
          <div className="flex w-full justify-between items-center">
            <MobileNav />
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="font-bold font-headline sm:inline-block">Geometra</span>
            </Link>
            <div className="flex items-center gap-2">
              <PointsBadge />
              <AuthButton />
            </div>
          </div>
        ) : (
          <>
            <div className="mr-4 flex items-center">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Logo className="h-6 w-6" />
                <span className="font-bold font-headline sm:inline-block">
                  Geometra
                </span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-auto px-4 rounded-md">
                    <Menu className="h-5 w-5 mr-2" />
                    Menú
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>Secciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/estudia">Estudio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tutoriales">Tutoriales</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/glosario">Glosario</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/ensaya">Ensayos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/paes">PAES</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/funciones-y-matrices">Funciones y Matrices</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ScreenshotGuideButton />
              <AIChatButton />
<<<<<<< HEAD
              <AIChatBetaButton />
=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
              <Link href="/perfil?tab=feedback">
                <Button variant="outline" size="icon" title="Enviar Feedback">
                  <MessageSquareHeart className="h-5 w-5" />
                </Button>
              </Link>
              <PointsBadge />
              <AuthButton />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
