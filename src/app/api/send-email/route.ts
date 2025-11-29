import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, subject, userEmail, userName, content, metadata } = body;

        // Email de destino
        const TO_EMAIL = 'contacto.geometra@gmail.com';

        // Construir el HTML del email según el tipo
        let htmlContent = '';

        if (type === 'feedback') {
            const { tipo, rating, titulo, comentario, experiencia, screenshot, pagina } = metadata;

            htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .field { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #4b5563; }
                        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
                        .rating { color: #fbbf24; font-size: 20px; }
                        .screenshot { margin-top: 10px; }
                        .screenshot img { max-width: 100%; border-radius: 4px; }
                        .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>📬 Nuevo Feedback - Geometra</h2>
                        </div>
                        <div class="content">
                            <div class="field">
                                <div class="label">👤 Usuario:</div>
                                <div class="value">${userName || 'Anónimo'} (${userEmail})</div>
                            </div>
                            
                            <div class="field">
                                <div class="label">📋 Tipo:</div>
                                <div class="value">${getTipoEmoji(tipo)} ${tipo}</div>
                            </div>
                            
                            <div class="field">
                                <div class="label">⭐ Calificación:</div>
                                <div class="value rating">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)</div>
                            </div>
                            
                            ${titulo ? `
                            <div class="field">
                                <div class="label">📌 Título:</div>
                                <div class="value">${titulo}</div>
                            </div>
                            ` : ''}
                            
                            <div class="field">
                                <div class="label">💬 Comentario:</div>
                                <div class="value">${comentario}</div>
                            </div>
                            
                            ${experiencia ? `
                            <div class="field">
                                <div class="label">✨ Experiencia General:</div>
                                <div class="value">${experiencia}</div>
                            </div>
                            ` : ''}
                            
                            <div class="field">
                                <div class="label">📍 Página:</div>
                                <div class="value">${pagina}</div>
                            </div>
                            
                            ${screenshot ? `
                            <div class="field">
                                <div class="label">📸 Captura de pantalla:</div>
                                <div class="screenshot">
                                    <a href="${screenshot}" target="_blank">Ver captura completa</a>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        <div class="footer">
                            <p>Este email fue generado automáticamente desde Geometra</p>
                            <p>Fecha: ${new Date().toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        } else if (type === 'teacher_request') {
            const { reason } = metadata;

            htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                        .field { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #4b5563; }
                        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
                        .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280; }
                        .action-button { display: inline-block; margin-top: 15px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🎓 Nueva Solicitud de Docente</h2>
                        </div>
                        <div class="content">
                            <div class="field">
                                <div class="label">👤 Solicitante:</div>
                                <div class="value">${userName || 'Sin nombre'}</div>
                            </div>
                            
                            <div class="field">
                                <div class="label">📧 Email:</div>
                                <div class="value">${userEmail}</div>
                            </div>
                            
                            <div class="field">
                                <div class="label">📝 Razón de la solicitud:</div>
                                <div class="value">${reason}</div>
                            </div>
                            
                            <div style="text-align: center; margin-top: 20px;">
                                <p>Para aprobar o rechazar esta solicitud, ve al panel de administración:</p>
                                <a href="https://geometra.app/admin/teacher-requests" class="action-button">
                                    Ver Panel de Admin
                                </a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Este email fue generado automáticamente desde Geometra</p>
                            <p>Fecha: ${new Date().toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
        }

        // Enviar email usando Resend
        const data = await resend.emails.send({
            from: 'Geometra <onboarding@resend.dev>', // Resend's verified domain
            to: TO_EMAIL,
            subject: subject,
            html: htmlContent,
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send email' },
            { status: 500 }
        );
    }
}

// Helper function para emojis de tipo de feedback
function getTipoEmoji(tipo: string): string {
    const emojis: Record<string, string> = {
        'bug': '🐛',
        'mejora': '💡',
        'funcionalidad': '✨',
        'contenido': '📚',
        'otro': '💭'
    };
    return emojis[tipo] || '📝';
}
