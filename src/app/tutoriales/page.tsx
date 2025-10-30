import Header from '@/components/header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';


const tutoriales = [
  {
    titulo: "Guía 1: Cómo graficar una función simple",
    descripcion: "Aprende a dibujar tu primera función, una parábola, usando la barra de Entrada.",
    pasos: [
      "Ve a la barra de 'Entrada' en la parte inferior o lateral de la pantalla.",
      "Escribe la ecuación de la función. Por ejemplo: f(x) = x^2",
      "Presiona la tecla 'Enter'.",
      "¡Listo! Verás la parábola dibujada en la 'Vista Gráfica' y la ecuación aparecerá en la 'Vista Algebraica'."
    ]
  },
  {
    titulo: "Guía 2: Cómo encontrar la intersección de dos rectas",
    descripcion: "Descubre cómo GeoGebra puede calcular automáticamente el punto donde se cruzan dos rectas.",
    pasos: [
      "Grafica la primera recta. Escribe en la Entrada: y = 2x + 1 y presiona Enter.",
      "Grafica la segunda recta. Escribe en la Entrada: y = -x + 4 y presiona Enter.",
      "Selecciona la herramienta 'Intersección' (es un punto con una 'X' encima).",
      "Haz clic sobre la primera recta y luego sobre la segunda recta en la Vista Gráfica.",
      "GeoGebra creará un nuevo punto 'A' exactamente donde se cruzan. En la Vista Algebraica podrás ver sus coordenadas (1, 3)."
    ]
  },
  {
    titulo: "Guía 3: Construye un triángulo y mide sus ángulos",
    descripcion: "Usa las herramientas de polígono y medición para crear y analizar figuras geométricas.",
    pasos: [
      "Selecciona la herramienta 'Polígono'.",
      "Haz clic en tres lugares diferentes de la 'Vista Gráfica' para crear los vértices A, B y C. Vuelve a hacer clic en el punto A para cerrar el triángulo.",
      "Ahora tienes un triángulo. GeoGebra te mostrará la longitud de cada lado.",
      "Selecciona la herramienta 'Ángulo'.",
      "Para medir el ángulo en el vértice B, haz clic en los puntos en este orden: A, luego B y finalmente C.",
      "GeoGebra mostrará la medida del ángulo en grados."
    ]
  },
  {
    titulo: "Guía 4: Crea un deslizador para animar tus construcciones",
    descripcion: "Los deslizadores te permiten crear parámetros variables para ver cómo afectan a tus gráficos.",
    pasos: [
      "Selecciona la herramienta 'Deslizador'.",
      "Haz clic en cualquier parte de la Vista Gráfica. Aparecerá un cuadro de diálogo.",
      "Dale un nombre al deslizador, por ejemplo, 'a'. Define su intervalo (mínimo y máximo).",
      "Ahora, en la barra de Entrada, escribe una función que use ese parámetro. Por ejemplo: f(x) = a*x^2",
      "Mueve el deslizador y observa cómo la parábola cambia su concavidad y apertura en tiempo real."
    ]
  },
  {
    titulo: "Guía 5: Resuelve ecuaciones con el comando Resuelve",
    descripcion: "Usa la potencia del cálculo simbólico de GeoGebra para resolver ecuaciones complejas.",
    pasos: [
      "Ve a la barra de 'Entrada'.",
      "Escribe el comando 'Resuelve' seguido de la ecuación entre paréntesis.",
      "Por ejemplo, para una ecuación cuadrática, escribe: Resuelve(x^2 + 2*x - 8 = 0)",
      "Presiona 'Enter'. GeoGebra te devolverá una lista con las soluciones: {x = -4, x = 2}.",
      "También puedes usarlo para sistemas de ecuaciones: Resuelve({x+y=5, x-y=1}, {x, y})"
    ]
  },
  {
    titulo: "Guía 6: Dibuja una circunferencia (centro y radio)",
    descripcion: "Aprende a construir un círculo perfecto conociendo su centro y la medida de su radio.",
    pasos: [
      "Primero, crea el punto que será el centro del círculo. Usa la herramienta 'Punto' y haz clic en la Vista Gráfica. Se creará un punto, por ejemplo 'A'.",
      "Selecciona la herramienta 'Circunferencia (centro, radio)'.",
      "Haz clic sobre el punto 'A' que acabas de crear.",
      "Aparecerá un cuadro de diálogo pidiéndote el radio. Escribe un número, por ejemplo, 3.",
      "Presiona OK. ¡Listo! Tendrás una circunferencia con centro en A y radio 3."
    ]
  }
]

export default function TutorialesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-foreground">Aprende GeoGebra (Tutoriales)</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
          Explora nuestras guías interactivas, diseñadas para llevarte desde los conceptos más básicos hasta las funciones más avanzadas de GeoGebra.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tutoriales.map((tutorial, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>{tutorial.titulo}</CardTitle>
                        <CardDescription>{tutorial.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {tutorial.pasos.map((paso, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">{paso}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
