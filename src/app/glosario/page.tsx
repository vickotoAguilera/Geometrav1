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
      },
      {
        nombre: "PuntoMedio( <Punto>, <Punto> )",
        descripcion: "Calcula y crea el punto medio entre dos puntos.",
        ejemplo: "Crea A=(0,0) y B=(4,6). El comando PuntoMedio(A, B) creará el punto C=(2,3)."
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
      },
      {
        nombre: "Paralela( <Punto>, <Recta o Vector> )",
        descripcion: "Crea una recta que pasa por el punto y es paralela a la recta o vector dado.",
        ejemplo: "Crea un punto A=(2,4) y una recta f: y=x. El comando Paralela(A, f) creará una recta paralela a f que pasa por A."
      },
      {
        nombre: "Mediatriz( <Punto>, <Punto> )",
        descripcion: "Crea la recta perpendicular al segmento que une los dos puntos y que pasa por su punto medio.",
        ejemplo: "Crea A=(1,1) y B=(5,5). El comando Mediatriz(A, B) creará la recta mediatriz del segmento AB."
      }
    ]
  },
  {
    categoria: "Polígonos y Cónicas",
    comandos: [
      {
        nombre: "Polígono( <Punto1>, <Punto2>, ..., <PuntoN> )",
        descripcion: "Crea un polígono conectando una secuencia de puntos.",
        ejemplo: "Crea los puntos A=(1,1), B=(4,1), C=(3,3). El comando Polígono(A, B, C) creará el triángulo ABC."
      },
      {
        nombre: "Circunferencia( <Punto Centro>, <Radio> )",
        descripcion: "Crea una circunferencia con un centro y radio definidos.",
        ejemplo: "Crea un punto A=(2,2). El comando Circunferencia(A, 3) dibujará un círculo con centro en A y radio 3."
      },
      {
        nombre: "Elipse( <Foco1>, <Foco2>, <Longitud Semieje Mayor> )",
        descripcion: "Crea una elipse a partir de sus dos focos y la longitud de su semieje mayor.",
        ejemplo: "Crea A=(-2,0), B=(2,0). El comando Elipse(A, B, 3) creará una elipse con focos en A y B."
      },
      {
        nombre: "Hipérbola( <Foco1>, <Foco2>, <Longitud Semieje Real> )",
        descripcion: "Crea una hipérbola a partir de sus dos focos y la longitud de su semieje real (o transverso).",
        ejemplo: "Crea A=(-3,0), B=(3,0). El comando Hipérbola(A, B, 2) creará una hipérbola con focos en A y B."
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
      },
      {
        nombre: "Extremo( <Función>, <Extremo Inferior>, <Extremo Superior> )",
        descripcion: "Encuentra los máximos y mínimos locales de una función en un intervalo.",
        ejemplo: "Para f(x) = x^3 - 3x, el comando Extremo(f, -2, 2) encontrará los puntos (-1, 2) y (1, -2)."
      },
      {
        nombre: "Tangente( <Punto>, <Función o Cónica> )",
        descripcion: "Crea la recta tangente a una curva en un punto dado de la misma.",
        ejemplo: "Crea la función f(x)=x^2 y un punto A en la función. El comando Tangente(A, f) dibujará la recta tangente en A."
      }
    ]
  },
  {
    categoria: "Medidas y Propiedades",
    comandos: [
       {
        nombre: "Distancia( <Punto>, <Objeto> )",
        descripcion: "Mide la distancia más corta desde un punto a un objeto (otro punto, recta, etc.).",
        ejemplo: "Crea un punto A=(3,4) y una recta f: y=1. El comando Distancia(A, f) devolverá el valor 3."
      },
      {
        nombre: "Área( <Polígono o Cónica> )",
        descripcion: "Calcula el área de una figura cerrada.",
        ejemplo: "Crea un triángulo o un círculo. Usa el comando Área(nombreDelObjeto) para obtener su área."
      },
       {
        nombre: "Pendiente( <Recta> )",
        descripcion: "Calcula la pendiente de una recta.",
        ejemplo: "Crea una recta f: y = 3x - 2. El comando Pendiente(f) devolverá el número 3."
      },
      {
        nombre: "Ángulo( <Lado>, <Lado> )",
        descripcion: "Mide el ángulo entre dos rectas.",
        ejemplo: "Crea dos rectas f y g. El comando Ángulo(f, g) mostrará el ángulo que forman."
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
      },
      {
        nombre: "Homotecia( <Objeto>, <Factor>, <Centro> )",
        descripcion: "Realiza una homotecia (ampliación o reducción) de un objeto desde un punto central.",
        ejemplo: "Crea un cuadrado y un punto A. El comando Homotecia(cuadrado, 2, A) creará un cuadrado el doble de grande."
      }
    ]
  }
];

export default function GlosarioPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-foreground">Glosario de Funciones de GeoGebra</h1>
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
