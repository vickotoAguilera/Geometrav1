# Sistema de Exportación a PDF - Notas Personales

## 📄 Descripción General

El sistema de notas personales de Geometra ahora incluye funcionalidad completa de exportación a PDF con formato profesional. Los usuarios pueden exportar sus notas junto con los textos resaltados del tema de estudio.

---

## ✨ Características Implementadas

### 1. **Formato Profesional**
- Encabezado con título destacado
- Metadatos organizados (tema, fechas de creación y modificación)
- Líneas separadoras entre secciones
- Pie de página con numeración de páginas

### 2. **Contenido Completo**
- **Título de la nota**: Tamaño grande y en negrita
- **Metadatos**:
  - 📚 Tema asociado (si aplica)
  - 📅 Fecha de creación
  - ✏️ Fecha de última modificación
- **Contenido de la nota**: Texto completo con conversión de HTML a texto plano
- **Textos resaltados**: Incluye todos los highlights del tema con:
  - Indicador de color visual
  - Texto resaltado entre comillas
  - Fecha del resaltado

### 3. **Paginación Inteligente**
- Detección automática de saltos de página
- Manejo de contenido largo sin cortes abruptos
- Numeración automática de páginas

### 4. **Detalles de Calidad**
- Formato de fechas en español (es-CL)
- Soporte para caracteres especiales (áéíóúñ)
- Nombre de archivo descriptivo con timestamp
- Pie de página: "Generado con Geometra"

---

## 🎨 Estructura del PDF Generado

```
┌─────────────────────────────────────┐
│  TÍTULO DE LA NOTA (24pt, negrita) │
│                                     │
│  📚 Tema: Geometría Analítica       │
│  📅 Creado: 15 de noviembre 2025    │
│  ✏️  Modificado: 20 de nov. 2025    │
│  ─────────────────────────────────  │
│                                     │
│  Contenido                          │
│  Texto de la nota...                │
│  [contenido completo]               │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Textos Resaltados                  │
│  🟡 "Texto resaltado 1"             │
│     15/11/2025                      │
│                                     │
│  🟢 "Texto resaltado 2"             │
│     18/11/2025                      │
│                                     │
│  ─────────────────────────────────  │
│  Página 1 de 2 • Generado con...   │
└─────────────────────────────────────┘
```

---

## 🚀 Uso

### Desde el Panel de Notas

1. Abre una nota en el panel de notas
2. Click en el botón **"Exportar PDF"**
3. El PDF se descarga automáticamente con el nombre: `titulo_nota_YYYY-MM-DD.pdf`

### Qué se Incluye

- **Si la nota está asociada a un tema**: Se exportan la nota + todos los highlights del tema
- **Si es una nota general**: Solo se exporta el contenido de la nota

---

## 🔧 Detalles Técnicos

### Archivos Modificados

#### 1. `/src/lib/pdf-utils.ts`
**Función principal**: `exportNoteToPDF(nota: Nota, highlights?: Highlight[])`

**Mejoras implementadas**:
- Paginación automática con función `checkPageBreak()`
- Manejo de márgenes y anchos dinámicos
- Conversión de HTML a texto plano
- Renderizado de highlights con colores
- Formato de fechas localizado (es-CL)
- Generación de pie de página en todas las páginas

#### 2. `/src/components/notes/NotesPanel.tsx`
**Cambio**: Línea 232
```tsx
onClick={() => exportNoteToPDF(notaActual, temaId ? highlights : undefined)}
```

**Lógica**: 
- Si hay `temaId`, pasa los highlights al exportador
- Si no hay tema, solo exporta la nota

### Dependencias

- **jsPDF** v3.0.4 (ya instalada)
- No requiere instalación adicional

---

## 📋 Casos de Uso

### Caso 1: Nota de Estudio con Highlights
**Escenario**: Estudiante toma notas sobre "Función Cuadrática" y resalta conceptos clave.

**Resultado**: PDF con:
- Título: "Apuntes Función Cuadrática"
- Tema: Segundo Medio / Función Cuadrática
- Notas del estudiante
- 5 textos resaltados con colores

### Caso 2: Nota General sin Tema
**Escenario**: Usuario crea una nota de ideas generales sin asociarla a un tema.

**Resultado**: PDF con:
- Título de la nota
- Fechas de creación/modificación
- Solo el contenido de la nota
- Sin sección de highlights

### Caso 3: Nota Larga (Múltiples Páginas)
**Escenario**: Estudiante escribe resumen extenso de un capítulo.

**Resultado**: PDF de 3-4 páginas con:
- Paginación automática
- Contenido distribuido correctamente
- Numeración en cada página

---

## ✅ Testing Recomendado

Para verificar que todo funciona correctamente:

1. **Test básico**: Exportar una nota simple
2. **Test con highlights**: Exportar nota de un tema con textos resaltados
3. **Test de contenido largo**: Exportar nota con mucho texto (verificar paginación)
4. **Test de caracteres especiales**: Verificar que áéíóúñ se muestren correctamente
5. **Test de nombre de archivo**: Verificar que el nombre sea descriptivo y válido

---

## 🎯 Estado Actual

✅ **COMPLETAMENTE IMPLEMENTADO**

### Funcionalidades Listas
- ✅ Exportación básica de notas
- ✅ Inclusión de highlights
- ✅ Formato profesional
- ✅ Paginación automática
- ✅ Metadatos completos
- ✅ Soporte de español

### Pendiente (Opcional - Mejoras Futuras)
- [ ] Exportar múltiples notas en un solo PDF
- [ ] Incluir imágenes del contenido (requiere html2canvas)
- [ ] Opciones de personalización (tamaño de fuente, colores)
- [ ] Vista previa antes de exportar

---

## 📝 Notas de Implementación

- La conversión de HTML a texto plano es simple pero efectiva
- Los emojis en metadatos (📚📅✏️) se renderizan correctamente en la mayoría de visores PDF
- El formato de fecha usa `toLocaleDateString('es-CL')` para consistencia regional
- Los highlights mantienen su color mediante cuadros de color en el PDF

---

**Última actualización**: 27 de noviembre de 2025
**Versión**: 1.0
**Estado**: ✅ Producción
