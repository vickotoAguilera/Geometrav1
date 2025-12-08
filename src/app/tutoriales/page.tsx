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
  },
  {
    titulo: "Guía 7: Calcula la derivada de una función",
    descripcion: "Visualiza la función derivada y entiende su relación con la pendiente de la función original.",
    pasos: [
      "Primero, grafica la función que quieres derivar. Por ejemplo, escribe en la Entrada: f(x) = x^3 - 3x",
      "Ahora, en la barra de Entrada, escribe el comando 'Derivada'.",
      "Dentro del paréntesis, escribe el nombre de tu función: Derivada(f)",
      "Presiona Enter. GeoGebra dibujará una nueva función (en otro color), que es la derivada f'(x) = 3x^2 - 3."
    ]
  },
  {
    titulo: "Guía 8: Calcula una integral definida y sombrea el área",
    descripcion: "Usa el comando Integral para calcular el área bajo una curva entre dos puntos.",
    pasos: [
      "Grafica una función, por ejemplo: f(x) = -x^2 + 4x",
      "En la barra de Entrada, escribe el comando 'Integral'.",
      "GeoGebra te sugerirá varias opciones. Elige la que dice 'Integral(<Función>, <Extremo inferior del intervalo>, <Extremo superior del intervalo>)'",
      "Escribe: Integral(f, 0, 4)",
      "Al presionar Enter, GeoGebra sombreará el área bajo la parábola entre x=0 y x=4, y te dará el valor numérico del área."
    ]
  },
  {
    titulo: "Guía 9: Construye la mediatriz de un segmento",
    descripcion: "Aprende a trazar la recta perpendicular que divide un segmento en dos partes iguales.",
    pasos: [
      "Usa la herramienta 'Punto' para crear dos puntos en la Vista Gráfica, por ejemplo A y B.",
      "Selecciona la herramienta 'Mediatriz'. La encontrarás en el mismo grupo que 'Recta Perpendicular'.",
      "Haz clic sobre el punto A y luego sobre el punto B (o viceversa).",
      "Inmediatamente, GeoGebra dibujará la recta mediatriz del segmento que une A y B."
    ]
  },
  {
    titulo: "Guía 10: Rota un objeto alrededor de un punto",
    descripcion: "Aprende a usar la herramienta de rotación para girar figuras un ángulo determinado.",
    pasos: [
      "Primero, crea un objeto para rotar, por ejemplo, un 'Polígono' (un triángulo).",
      "Crea un 'Punto' que será el centro de rotación.",
      "Selecciona la herramienta 'Rota en torno a un Punto'.",
      "Haz clic primero en el objeto que quieres rotar (el triángulo) y luego en el punto que es el centro de rotación.",
      "Aparecerá un cuadro de diálogo pidiéndote el ángulo. Escribe, por ejemplo, 90° y elige un sentido (horario o antihorario).",
      "Presiona OK y verás tu objeto rotado."
    ]
  },
  {
    titulo: "Guía 11: Encuentra las raíces de una función",
    descripcion: "Usa un comando para marcar automáticamente los puntos donde una función corta el eje X.",
    pasos: [
        "Grafica una función que corte el eje X varias veces, por ejemplo: f(x) = x^3 - 4x",
        "En la barra de Entrada, escribe el comando 'Raíces'.",
        "Elige la opción 'Raíces(<Función>, <Extremo inferior>, <Extremo superior>)' para buscar en un intervalo.",
        "Escribe: Raíces(f, -5, 5)",
        "GeoGebra creará automáticamente los puntos en las intersecciones con el eje X: (-2, 0), (0, 0) y (2, 0)."
    ]
  },
  {
    titulo: "Guía 12: Crea un punto medio",
    descripcion: "Encuentra fácilmente el punto medio entre dos puntos dados o de un segmento.",
    pasos: [
      "Crea dos puntos, A y B, en la Vista Gráfica.",
      "Selecciona la herramienta 'Medio o Centro'.",
      "Haz clic en el punto A y luego en el punto B.",
      "GeoGebra creará un nuevo punto, C, que es exactamente el punto medio entre A y B."
    ]
  },
  {
    titulo: "Guía 13: Refleja un objeto (simetría axial)",
    descripcion: "Crea una imagen especular de una figura a través de una recta (eje de simetría).",
    pasos: [
      "Dibuja un objeto, por ejemplo un 'Polígono'.",
      "Dibuja una 'Recta' que actuará como el espejo o eje de simetría.",
      "Selecciona la herramienta 'Refleja Objeto en Recta'.",
      "Haz clic primero en el objeto (el polígono) y luego en la recta.",
      "Verás una copia idéntica de tu polígono al otro lado de la recta."
    ]
  },
  {
    titulo: "Guía 14: Crea texto dinámico",
    descripcion: "Muestra valores de variables y objetos directamente en la Vista Gráfica.",
    pasos: [
      "Crea un deslizador llamado 'a'.",
      "Selecciona la herramienta 'Texto'. Haz clic en la Vista Gráfica.",
      "En el cuadro de texto, escribe: 'El valor actual es: '",
      "Luego, ve a la pestaña 'Avanzado' o busca un botón 'Objetos'. Selecciona tu deslizador 'a' de la lista. Se insertará en el texto.",
      "Presiona OK. Ahora, cuando muevas el deslizador, el texto se actualizará en tiempo real mostrando su valor."
    ]
  },
  {
    titulo: "Guía 15: Mide la distancia entre dos puntos",
    descripcion: "Calcula y muestra la distancia entre dos puntos, un punto y una recta, etc.",
    pasos: [
      "Crea dos puntos, A y B.",
      "Selecciona la herramienta 'Distancia o Longitud'.",
      "Haz clic en el punto A y luego en el punto B.",
      "GeoGebra mostrará una etiqueta con la distancia exacta entre ellos. Este valor se actualizará si mueves cualquiera de los puntos."
    ]
  },
  {
    titulo: "Guía 16: Construye un vector entre dos puntos",
    descripcion: "Aprende a representar un vector y a ver sus componentes en la Vista Algebraica.",
    pasos: [
      "Crea dos puntos, A (origen) y B (extremo).",
      "Selecciona la herramienta 'Vector'.",
      "Haz clic primero en el punto de origen (A) y luego en el punto extremo (B).",
      "GeoGebra dibujará una flecha desde A hasta B. En la Vista Algebraica, mostrará el vector con sus componentes, por ejemplo, u = (3, 2)."
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
