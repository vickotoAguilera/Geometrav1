import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        firebase: {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
        },
        gemini: {
            apiKey: process.env.GOOGLE_GENAI_API_KEY ? '✅ Set' : '❌ Missing',
        },
        r2: {
            accountId: process.env.R2_ACCOUNT_ID || '❌ UNDEFINED',
            accessKeyId: process.env.R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
            bucketName: process.env.R2_BUCKET_NAME || '❌ UNDEFINED (default: geometra-user-profiles)',
            publicUrl: process.env.R2_PUBLIC_URL || '❌ UNDEFINED',
        },
    });
}
