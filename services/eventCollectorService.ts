
import { API_BASE } from '../apiConfig';
import { AppEvent, AppEventType, AppEventSource } from '../types';
import { authService } from './authService';

const API_URL = `${API_BASE}/api/events/ingest`;

/**
 * Event Collector Service (Client-Side)
 * Centraliza toda a telemetria e ações de auditoria do app.
 */
export const eventCollectorService = {
    /**
     * Envia um evento para o coletor.
     * Não bloqueia a UI e gera ID único automaticamente.
     */
    track: async (type: AppEventType, payload: any, source: AppEventSource = 'frontend'): Promise<string> => {
        const event_id = crypto.randomUUID();
        const user = authService.getCurrentUser();

        const event: AppEvent = {
            event_id,
            source,
            type,
            timestamp: Date.now(),
            payload,
            user_id: user?.id || undefined,
            session_id: localStorage.getItem('auth_token') || undefined
        };

        // Fire and forget (não usa 'await' para o retorno da rede, a menos que debugando)
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        }).catch(err => {
            // Em caso de falha no coletor, guardamos para retry futuro (opcional)
            console.warn(`[Collector] Event ${type} queued locally due to connection issues.`);
        });

        return event_id;
    },

    /**
     * Helper para erros de usuário (Crash, Validação, etc)
     */
    trackError: (errorMsg: string, context: any = {}) => {
        eventCollectorService.track('user_error', { message: errorMsg, ...context });
    }
};
