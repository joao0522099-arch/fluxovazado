
import express from 'express';
import { z } from 'zod';
import { eventProcessor } from '../services/eventProcessor.js';

const router = express.Router();

// Cache simples de idempotência (Em prod usaria Redis EX)
const idempotencyCache = new Set();

const eventSchema = z.object({
    event_id: z.string().uuid(),
    source: z.enum(['frontend', 'backend', 'payment_gateway', 'auth_service', 'moderation_service']),
    type: z.string(),
    timestamp: z.number(),
    payload: z.any()
});

/**
 * POST /api/events/ingest
 * O Coletor "Fan-In" Profissional.
 */
router.post('/ingest', async (req, res) => {
    try {
        // 1. Validação do Schema
        const validated = eventSchema.safeParse(req.body);
        if (!validated.success) {
            return res.status(400).json({ error: "INVALID_EVENT_FORMAT", details: validated.error });
        }

        const event = validated.data;

        // 2. Checagem de Idempotência (Evita duplicação)
        if (idempotencyCache.has(event.event_id)) {
            return res.status(202).json({ status: "ACCEPTED", duplicate: true });
        }

        // Adiciona ao cache (limita o tamanho em memória)
        idempotencyCache.add(event.event_id);
        if (idempotencyCache.size > 5000) {
            const first = idempotencyCache.values().next().value;
            idempotencyCache.delete(first);
        }

        // 3. DESACOPLAMENTO (A mágica acontece aqui)
        // Dispara o evento internamente e NÃO espera o processamento.
        // O eventProcessor cuidará da lógica pesada em background.
        eventProcessor.emit('ingested_event', event);

        // 4. Resposta Imediata
        res.status(202).json({ 
            status: "ACCEPTED", 
            event_id: event.event_id,
            timestamp: Date.now()
        });

    } catch (e) {
        // O coletor deve ser o mais resiliente possível
        res.status(500).json({ error: "COLLECTOR_BUSY" });
    }
});

// Endpoint de status interno (para o Adaptive System ou Dashboard Admin)
router.get('/health', (req, res) => {
    res.json({
        collector: 'ONLINE',
        processor: eventProcessor.getStats(),
        cache_size: idempotencyCache.size
    });
});

export default router;
