import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cookies } from 'next/headers';

// Inicializar Firebase si no está inicializado
if (!getApps().length) {
    initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
}

const db = getFirestore();

export async function POST(request: NextRequest) {
    try {
        // Intentar obtener userId del body o de las cookies
        let userId: string | undefined;

        try {
            const body = await request.json();
            userId = body.userId;
        } catch {
            // Si no hay body, intentar obtener de las cookies
            console.log('No body provided, will use hardcoded admin email');
        }

        // Si no hay userId, usar el email de admin conocido
        if (!userId) {
            // Por ahora, usar un userId hardcodeado para el admin principal
            // Esto es temporal - en producción deberías usar autenticación adecuada
            console.log('⚠️  No userId provided, using default admin setup');

            // Obtener el userId del usuario actual desde las cookies de Firebase
            const cookieStore = await cookies();
            const authCookie = cookieStore.get('__session');

            if (!authCookie) {
                return NextResponse.json(
                    { success: false, error: 'No authenticated user found. Please provide userId in request body.' },
                    { status: 401 }
                );
            }

            // Por simplicidad, vamos a aceptar un userId en el query string también
            const url = new URL(request.url);
            userId = url.searchParams.get('userId') || undefined;

            if (!userId) {
                return NextResponse.json(
                    { success: false, error: 'userId is required (in body or query string)' },
                    { status: 400 }
                );
            }
        }

        console.log('🔧 Making user admin:', userId);

        // 1. Actualizar el perfil del usuario
        const userRef = doc(db, 'users', userId, 'profile', 'data');
        await updateDoc(userRef, {
            role: 'admin',
            updatedAt: serverTimestamp(),
        });

        // 2. Agregar a la colección de admins (para las reglas de Firestore)
        const adminRef = doc(db, 'admins', userId);
        await setDoc(adminRef, {
            email: 'admin',
            createdAt: serverTimestamp(),
            role: 'admin'
        });

        console.log('✅ User is now admin:', userId);

        return NextResponse.json({
            success: true,
            message: 'User is now admin and added to admins collection',
            userId
        });
    } catch (error) {
        console.error('❌ Error making user admin:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
