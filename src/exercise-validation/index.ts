/**
 * Índice de validaciones de ejercicios
 * 
 * Este archivo exporta todas las validaciones organizadas por curso y materia.
 */

import ecuacionesLinealesValidation from './1-medio/ecuaciones-lineales';
import factorizacionValidation from './1-medio/factorizacion';
import homoteciaValidation from './1-medio/homotecia';
import medidasDeTendenciaCentralValidation from './1-medio/medidas-de-tendencia-central';
import numerosRealesValidation from './1-medio/numeros-reales';
import potenciasYRaicesValidation from './1-medio/potencias-y-raices';
import probabilidadBasicaValidation from './1-medio/probabilidad-basica';
import productosNotablesValidation from './1-medio/productos-notables';
import semejanzaTriangulosValidation from './1-medio/semejanza-triangulos';
import sistemasEcuacionesLinealesValidation from './1-medio/sistemas-ecuaciones-lineales';
import testValidation from './1-medio/test';
import transformacionesIsometricasValidation from './1-medio/transformaciones-isometricas';
import vectoresEnElPlanoValidation from './1-medio/vectores-en-el-plano';
import funcionCuadraticaValidation from './2-medio/funcion-cuadratica';
import funcionLinealValidation from './2-medio/funcion-lineal';
import logaritmosValidation from './2-medio/logaritmos';
import numerosIrracionalesValidation from './2-medio/numeros-irracionales';
import potenciasExponenteRacionalValidation from './2-medio/potencias-exponente-racional';
import probabilidadCondicionalValidation from './2-medio/probabilidad-condicional';
import raicesPropiedadesValidation from './2-medio/raices-propiedades';
import sectoresCircularesValidation from './2-medio/sectores-circulares';
import trigonometriaValidation from './2-medio/trigonometria';
import ecuacionDeLaRectaValidation from './3-medio/ecuacion-de-la-recta';
import estadisticaInferencialValidation from './3-medio/estadistica-inferencial';
import funcionExponencialValidation from './3-medio/funcion-exponencial';
import funcionLogaritmicaValidation from './3-medio/funcion-logaritmica';
import geometriaAnaliticaValidation from './3-medio/geometria-analitica';
import modelosProbabilisticosValidation from './3-medio/modelos-probabilisticos';
import numerosComplejosValidation from './3-medio/numeros-complejos';
import relacionesMetricasCircunferenciaValidation from './3-medio/relaciones-metricas-circunferencia';
import distribucionBinomialValidation from './4-medio/distribucion-binomial';
import distribucionNormalValidation from './4-medio/distribucion-normal';
import funcionesPeriodicasValidation from './4-medio/funciones-periodicas';
import funcionesTrigonometricasValidation from './4-medio/funciones-trigonometricas';
import geometria3dValidation from './4-medio/geometria-3d';
import geometriaConicaValidation from './4-medio/geometria-conica';
import matematicaFinancieraValidation from './4-medio/matematica-financiera';
import modelamientoMatematicoValidation from './4-medio/modelamiento-matematico';

export const validationsBySubject = {
    '1-medio': {
        'ecuaciones-lineales': ecuacionesLinealesValidation,
        'factorizacion': factorizacionValidation,
        'homotecia': homoteciaValidation,
        'medidas-de-tendencia-central': medidasDeTendenciaCentralValidation,
        'numeros-reales': numerosRealesValidation,
        'potencias-y-raices': potenciasYRaicesValidation,
        'probabilidad-basica': probabilidadBasicaValidation,
        'productos-notables': productosNotablesValidation,
        'semejanza-triangulos': semejanzaTriangulosValidation,
        'sistemas-ecuaciones-lineales': sistemasEcuacionesLinealesValidation,
        'test': testValidation,
        'transformaciones-isometricas': transformacionesIsometricasValidation,
        'vectores-en-el-plano': vectoresEnElPlanoValidation,
    },
    '2-medio': {
        'funcion-cuadratica': funcionCuadraticaValidation,
        'funcion-lineal': funcionLinealValidation,
        'logaritmos': logaritmosValidation,
        'numeros-irracionales': numerosIrracionalesValidation,
        'potencias-exponente-racional': potenciasExponenteRacionalValidation,
        'probabilidad-condicional': probabilidadCondicionalValidation,
        'raices-propiedades': raicesPropiedadesValidation,
        'sectores-circulares': sectoresCircularesValidation,
        'trigonometria': trigonometriaValidation,
    },
    '3-medio': {
        'ecuacion-de-la-recta': ecuacionDeLaRectaValidation,
        'estadistica-inferencial': estadisticaInferencialValidation,
        'funcion-exponencial': funcionExponencialValidation,
        'funcion-logaritmica': funcionLogaritmicaValidation,
        'geometria-analitica': geometriaAnaliticaValidation,
        'modelos-probabilisticos': modelosProbabilisticosValidation,
        'numeros-complejos': numerosComplejosValidation,
        'relaciones-metricas-circunferencia': relacionesMetricasCircunferenciaValidation,
    },
    '4-medio': {
        'distribucion-binomial': distribucionBinomialValidation,
        'distribucion-normal': distribucionNormalValidation,
        'funciones-periodicas': funcionesPeriodicasValidation,
        'funciones-trigonometricas': funcionesTrigonometricasValidation,
        'geometria-3d': geometria3dValidation,
        'geometria-conica': geometriaConicaValidation,
        'matematica-financiera': matematicaFinancieraValidation,
        'modelamiento-matematico': modelamientoMatematicoValidation,
    },
};

export function getValidation(course: string, subject: string) {
    return validationsBySubject[course]?.[subject] || [];
}

export default validationsBySubject;
