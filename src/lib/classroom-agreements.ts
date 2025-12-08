// Funciones para gestionar términos y condiciones del aula

'use server';

import { getFirestore } from '@/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';
import type { CreateAgreementData, AgreementCheckResult } from '@/types/agreement-types';

const CURRENT_TERMS_VERSION = 'v1.0';

/**
 * Verifica si un usuario ha aceptado los términos de un aula
 */
export async function checkUserAgreement(
    userId: string,
    classroomId: string
): Promise<AgreementCheckResult> {
    try {
        const firestore = getFirestore();

        const agreementRef = firestore
            .collection('userAgreements')
            .doc(`${userId}_${classroomId}`);

        const agreementDoc = await agreementRef.get();

        if (!agreementDoc.exists) {
            return {
                hasAccepted: false,
                needsUpdate: false,
            };
        }

        const data = agreementDoc.data();
        const acceptedVersion = data?.version || 'v0.0';

        return {
            hasAccepted: true,
            needsUpdate: acceptedVersion !== CURRENT_TERMS_VERSION,
            currentVersion: CURRENT_TERMS_VERSION,
            acceptedVersion,
        };
    } catch (error) {
        console.error('Error checking user agreement:', error);
        throw error;
    }
}

/**
 * Registra la aceptación de términos y condiciones
 */
export async function createUserAgreement(
    data: CreateAgreementData
): Promise<{ success: boolean; message: string }> {
    try {
        const firestore = getFirestore();

        const agreementRef = firestore
            .collection('userAgreements')
            .doc(`${data.userId}_${data.classroomId}`);

        await agreementRef.set({
            userId: data.userId,
            classroomId: data.classroomId,
            acceptedAt: Timestamp.now(),
            version: data.version || CURRENT_TERMS_VERSION,
            ipAddress: data.ipAddress || null,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });

        return {
            success: true,
            message: 'Términos aceptados correctamente',
        };
    } catch (error) {
        console.error('Error creating user agreement:', error);
        return {
            success: false,
            message: 'Error al registrar aceptación',
        };
    }
}

/**
 * Obtiene todas las aceptaciones de un usuario
 */
export async function getUserAgreements(userId: string) {
    try {
        const firestore = getFirestore();

        const snapshot = await firestore
            .collection('userAgreements')
            .where('userId', '==', userId)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting user agreements:', error);
        return [];
    }
}

/**
 * Obtiene todas las aceptaciones de un aula (para admin)
 */
export async function getClassroomAgreements(classroomId: string) {
    try {
        const firestore = getFirestore();

        const snapshot = await firestore
            .collection('userAgreements')
            .where('classroomId', '==', classroomId)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error getting classroom agreements:', error);
        return [];
    }
}
