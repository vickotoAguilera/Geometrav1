import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Inicializar Firebase
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

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 });
        }

        console.log(`🔍 Debugging user: ${userId}`);

        // 1. Check Profile
        const profileRef = doc(db, 'users', userId, 'profile', 'data');
        const profileSnap = await getDoc(profileRef);

        // 2. Check Admin Collection
        const adminRef = doc(db, 'admins', userId);
        const adminSnap = await getDoc(adminRef);

        const data = {
            userId,
            profile: {
                exists: profileSnap.exists(),
                data: profileSnap.exists() ? profileSnap.data() : null,
            },
            adminCollection: {
                exists: adminSnap.exists(),
                data: adminSnap.exists() ? adminSnap.data() : null,
            }
        };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
