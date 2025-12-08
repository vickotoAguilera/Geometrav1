import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { driveFileId, userId, accessToken } = await request.json();

        console.log('🧪 Test Drive Process:', { driveFileId, userId });

        if (!driveFileId || !userId || !accessToken) {
            return NextResponse.json(
                { error: 'Faltan parámetros requeridos' },
                { status: 400 }
            );
        }

        // 1. Obtener metadata del archivo
        const metadataResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${driveFileId}?fields=id,name,mimeType,size,webViewLink`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!metadataResponse.ok) {
            throw new Error('Error obteniendo metadata del archivo');
        }

        const metadata = await metadataResponse.json();
        console.log('📋 Metadata:', metadata);

        // 2. Descargar archivo
        const downloadResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!downloadResponse.ok) {
            throw new Error('Error descargando archivo');
        }

        const fileData = await downloadResponse.arrayBuffer();
        console.log('📥 Archivo descargado:', fileData.byteLength, 'bytes');

        // 3. Procesar según tipo
        let processedData: any = {
            fileName: metadata.name,
            mimeType: metadata.mimeType,
            size: metadata.size,
            downloadedSize: fileData.byteLength,
        };

        if (metadata.mimeType === 'application/pdf') {
            processedData.type = 'PDF';
            processedData.note = 'PDF detectado - Procesamiento de texto deshabilitado por DOMMatrix error';
        } else if (metadata.mimeType.startsWith('image/')) {
            processedData.type = 'Imagen';
            processedData.note = 'Imagen detectada - Análisis con Gemini Vision disponible';
        } else if (metadata.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            processedData.type = 'DOCX';
            processedData.note = 'DOCX detectado - Extracción de texto disponible';
        } else {
            processedData.type = 'Otro';
            processedData.note = 'Tipo de archivo no soportado';
        }

        // 4. Retornar resultado SIN guardar en Firestore
        return NextResponse.json({
            success: true,
            message: 'Archivo procesado correctamente (sin guardar en Firestore)',
            data: processedData,
        });

    } catch (error) {
        console.error('❌ Error en test-drive-process:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Error desconocido',
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
