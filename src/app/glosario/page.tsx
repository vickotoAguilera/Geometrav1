import Header from '@/components/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code } from 'lucide-react';

const glossarioComandos = [
  {
    categoria: "Puntos, Vectores y Coordenadas",
    comandos: [
      {
        nombre: "Punto( <Objeto> )",
        descripcion: "Crea un punto sobre un objeto geométrico (recta, cónica, función, etc.).",
        ejemplo: "Crea una recta f: y = 2x + 1. Luego, escribe Punto(f) para crear un punto que solo puede moverse sobre esa recta."
      },
      {
        nombre: "Vector( <Punto Inicial>, <Punto Final> )",
        descripcion: "Crea un vector que va desde el punto inicial hasta el punto final.",
        ejemplo: "Crea dos puntos A = (1,1) y B = (4,3). Escribe Vector(A, B) para obtener el vector u = (3, 2)."
      },
      {
        nombre: "Coordenadas( <Punto> )",
        descripcion: "Devuelve las coordenadas de un punto.",
        ejemplo: "Crea un punto A = (2, 5). El comando Coordenadas(A) devolverá (2, 5)."
      }
    ]
  },
  {
    categoria: "Rectas y Segmentos",
    comandos: [
      {
        nombre: "Recta( <Punto>, <Punto> )",
        descripcion: "Crea una recta que pasa por los dos puntos especificados.",
        ejemplo: "Crea dos puntos A = (1,1) y B = (4,3). Escribe Recta(A, B) para trazar la línea que los une."
      },
      {
        nombre: "Segmento( <Punto>, <Punto> )",
        descripcion: "Crea un segmento de recta entre los dos puntos especificados.",
        ejemplo: "Crea A = (1,1) y B = (4,3). El comando Segmento(A, B) dibujará solo el tramo entre A y B."
      },
      {
        nombre: "Interseca( <Objeto>, <Objeto> )",
        descripcion: "Encuentra y crea el punto de intersección entre dos objetos (rectas, cónicas, etc.).",
        ejemplo: "Crea dos rectas f: y = x y g: y = -x + 2. El comando Interseca(f, g) creará el punto de cruce A = (1, 1)."
      },
      {
        nombre: "Perpendicular( <Punto>, <Recta o Vector> )",
        descripcion: "Crea una recta que pasa por el punto y es perpendicular al objeto dado.",
        ejemplo: "Crea un punto A = (2,3) y una recta f: y = x. El comando Perpendicular(A, f) creará una recta perpendicular a f que pasa por A."
      }
    ]
  },
  {
    categoria: "Funciones y Cálculo",
    comandos: [
      {
        nombre: "Función( <Expresión>, <Variable>, <Valor Inicial>, <Valor Final> )",
        descripcion: "Grafica una función en un intervalo específico.",
        ejemplo: "Función(x^2, x, -2, 2) dibujará la parábola y = x^2 solo en el intervalo de x desde -2 hasta 2."
      },
      {
        nombre: "Derivada( <Función> )",
        descripcion: "Calcula y grafica la función derivada.",
        ejemplo: "Escribe f(x) = x^3. Luego, el comando Derivada(f) graficará la función f'(x) = 3x^2."
      },
      {
        nombre: "Integral( <Función>, <Extremo Inferior>, <Extremo Superior> )",
        descripcion: "Calcula el valor de la integral definida y sombrea el área bajo la curva.",
        ejemplo: "Crea la función f(x) = x^2. El comando Integral(f, 0, 2) calculará el área bajo la curva de 0 a 2 y devolverá el valor 2.67."
      },
      {
        nombre: "Raíces( <Función>, <Extremo Inferior>, <Extremo Superior> )",
        descripcion: "Encuentra los puntos donde la función cruza el eje x (las raíces) en un intervalo.",
        ejemplo: "Para la función f(x) = x^2 - 4, el comando Raíces(f, -5, 5) creará los puntos A = (-2, 0) y B = (2, 0)."
      }
    ]
  },
  {
    categoria: "Transformaciones Geométricas",
    comandos: [
      {
        nombre: "Rota( <Objeto>, <Ángulo>, <Punto de Rotación> )",
        descripcion: "Gira un objeto alrededor de un punto un determinado ángulo.",
        ejemplo: "Crea un punto A=(3,1) y un punto B=(1,1). El comando Rota(A, 90°, B) rotará el punto A 90 grados alrededor de B."
      },
      {
        nombre: "Traslada( <Objeto>, <Vector> )",
        descripcion: "Mueve un objeto según la dirección y magnitud de un vector.",
        ejemplo: "Crea un triángulo y un vector u = (2,1). El comando Traslada(triángulo, u) moverá el triángulo 2 unidades a la derecha y 1 hacia arriba."
      },
      {
        nombre: "Refleja( <Objeto>, <Recta o Punto> )",
        descripcion: "Crea una imagen especular de un objeto con respecto a una recta o un punto.",
        ejemplo: "Crea un punto A=(2,3) y una recta f: y=1. El comando Refleja(A, f) creará un punto A' en (2,-1)."
      }
    ]
  }
];

export default function GlosarioPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-primary-foreground/90">Glosario de Funciones de GeoGebra</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
            Un diccionario completo de comandos y herramientas de GeoGebra. Úsalo como referencia para potenciar tus construcciones.
        </p>
        <div className="mt-8 max-w-4xl mx-auto">
           <Accordion type="single" collapsible className="w-full">
            {glossarioComandos.map((categoria) => (
              <AccordionItem key={categoria.categoria} value={categoria.categoria}>
                <AccordionTrigger className="text-xl font-semibold text-foreground hover:no-underline">
                  {categoria.categoria}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {categoria.comandos.map((comando) => (
                      <div key={comando.nombre} className="p-4 bg-card rounded-md border">
                        <h4 className="font-mono text-base font-semibold text-primary">{comando.nombre}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{comando.descripcion}</p>
                        <div className="mt-3 flex items-start gap-2 text-sm text-foreground/70">
                            <Code className="w-4 h-4 mt-0.5 flex-shrink-0"/>
                            <div>
                                <span className="font-semibold">Ejemplo:</span> {comando.ejemplo}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}
