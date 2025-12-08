import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from '@/firebase/server';

const db = getFirestore();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';

        console.log('🔍 [API] Loading teacher requests with filter:', filter);

        // Obtener todos los usuarios
        const usersSnapshot = await db.collection('users').get();
        console.log(`📊 [API] Total users found: ${usersSnapshot.size}`);

        const allRequests: any[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            console.log(`👤 [API] Checking user: ${userId}`);

            // Obtener el perfil del usuario
            const profileSnapshot = await db
                .collection('users')
                .doc(userId)
                .collection('profile')
                .get();

            console.log(`   Profile docs: ${profileSnapshot.size}`);

            if (!profileSnapshot.empty) {
                const profileData = profileSnapshot.docs[0].data();
                console.log(`   Email: ${profileData.email}`);
                console.log(`   Has teacherRequest: ${!!profileData.teacherRequest}`);

                if (profileData.teacherRequest) {
                    const request = profileData.teacherRequest;
                    console.log(`   Request status: ${request.status}`);
                    console.log(`   Request reason: ${request.reason}`);

                    // Filtrar según el estado seleccionado
                    if (filter === 'all' || request.status === filter) {
                        const requestData = {
                            userId: userId,
                            userEmail: profileData.email || 'No disponible',
                            userName: profileData.displayName || profileData.nombre || 'Sin nombre',
                            status: request.status,
                            reason: request.reason,
                            requestedAt: request.requestedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                            reviewedAt: request.reviewedAt?.toDate?.()?.toISOString(),
                            rejectionReason: request.rejectionReason,
                        };
                        console.log(`   ✅ [API] Adding request:`, requestData);
                        allRequests.push(requestData);
                    } else {
                        console.log(`   ⏭️  [API] Skipping (filter mismatch): ${request.status} !== ${filter}`);
                    }
                }
            }
        }

        // Ordenar por fecha (más recientes primero)
        allRequests.sort((a, b) =>
            new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );

        console.log(`✅ [API] Found ${allRequests.length} teacher requests`);

        return NextResponse.json({
            success: true,
            requests: allRequests
        });
    } catch (error) {
        console.error('❌ [API] Error loading teacher requests:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
