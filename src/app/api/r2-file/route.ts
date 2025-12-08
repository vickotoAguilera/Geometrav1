/**
 * API Route para obtener el contenido de un archivo de R2
 * Evita problemas de CORS al hacer fetch desde el cliente
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'geometra';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const fileKey = searchParams.get('key');
        const download = searchParams.get('download') === 'true';

        if (!fileKey) {
            return NextResponse.json(
                { error: 'File key is required' },
                { status: 400 }
            );
        }

        // Obtener el archivo de R2
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileKey,
        });

        const response = await r2Client.send(command);

        if (!response.Body) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        // Convertir el stream a bytes
        const bytes = await response.Body.transformToByteArray();
        const buffer = Buffer.from(bytes);

        // Extraer nombre del archivo
        const fileName = fileKey.split('/').pop() || 'download';

        const headers: Record<string, string> = {
            'Content-Type': response.ContentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=3600',
        };

        // Si es descarga, agregar Content-Disposition
        if (download) {
            headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
        }

        return new NextResponse(buffer, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Error fetching file from R2:', error);
        return NextResponse.json(
            { error: 'Failed to fetch file' },
            { status: 500 }
        );
    }
}
