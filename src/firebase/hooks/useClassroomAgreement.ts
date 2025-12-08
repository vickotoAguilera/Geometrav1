// Hook para verificar y gestionar aceptación de términos

'use client';

import { useState, useEffect } from 'react';
import { checkUserAgreement, createUserAgreement } from '@/lib/classroom-agreements';
import type { AgreementCheckResult } from '@/types/agreement-types';

export function useClassroomAgreement(userId: string | null, classroomId: string | null) {
    const [agreementStatus, setAgreementStatus] = useState<AgreementCheckResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId || !classroomId) {
            setIsLoading(false);
            return;
        }

        const checkAgreement = async () => {
            try {
                setIsLoading(true);
                const result = await checkUserAgreement(userId, classroomId);
                setAgreementStatus(result);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error desconocido'));
            } finally {
                setIsLoading(false);
            }
        };

        checkAgreement();
    }, [userId, classroomId]);

    const acceptTerms = async (version: string = 'v1.0') => {
        if (!userId || !classroomId) {
            throw new Error('Usuario o aula no especificados');
        }

        try {
            const result = await createUserAgreement({
                userId,
                classroomId,
                version,
            });

            if (result.success) {
                // Actualizar estado local
                setAgreementStatus({
                    hasAccepted: true,
                    needsUpdate: false,
                    currentVersion: version,
                    acceptedVersion: version,
                });
            }

            return result;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Error al aceptar términos');
        }
    };

    return {
        agreementStatus,
        isLoading,
        error,
        acceptTerms,
        needsAcceptance: agreementStatus && (!agreementStatus.hasAccepted || agreementStatus.needsUpdate),
    };
}
