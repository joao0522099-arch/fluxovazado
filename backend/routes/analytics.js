
import express from 'express';
import { dbManager } from '../databaseManager.js';
import { validateAdmin } from '../middleware.js';

const router = express.Router();

router.use(validateAdmin);

/**
 * GET /api/analytics/payment-ranking
 * Retorna o ranking consolidado global.
 */
router.get('/payment-ranking', async (req, res) => {
    try {
        const { country } = req.query; 
        
        let querySql = `
            SELECT 
                method_name as method,
                provider,
                country,
                COUNT(*) as usage_count,
                SUM(amount) as total_volume,
                MAX(created_at) as last_used
            FROM payment_methods_usage
        `;

        const params = [];
        if (country) {
            querySql += ` WHERE country = $1 `;
            params.push(country.toUpperCase());
        }

        querySql += ` 
            GROUP BY method_name, provider, country
            ORDER BY usage_count DESC
        `;

        const result = await dbManager.query(querySql, params);
        
        res.json({
            success: true,
            filters: { country: country || 'ALL' },
            ranking: result.rows.map(item => ({
                method: item.method,
                provider: item.provider,
                country: item.country,
                count: parseInt(item.usage_count),
                volume: parseFloat(item.total_volume || 0),
                lastUsed: item.last_used
            }))
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/analytics/user/:userId/payment-ranking
 * Retorna o ranking de métodos de pagamento usados nas vendas de um usuário específico.
 * Utilizado pelo painel interno de insights por criador.
 */
router.get('/user/:userId/payment-ranking', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const ranking = await dbManager.analytics.getPaymentRanking(userId);
        
        res.json({
            success: true,
            userId,
            ranking: ranking.map(item => ({
                method: item.method,
                provider: item.provider,
                count: parseInt(item.usage_count),
                volume: parseFloat(item.total_volume || 0),
                lastUsed: item.last_used
            }))
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/log-payment-method', async (req, res) => {
    try {
        const { methodName, provider, amount, currency, country, sellerId } = req.body;
        if (!methodName || !provider) {
            return res.status(400).json({ error: "methodName and provider are required." });
        }

        await dbManager.analytics.recordPaymentMethod({
            methodName, 
            provider, 
            amount: amount || 0, 
            currency: currency || 'BRL', 
            country: country || 'BR',
            sellerId: sellerId
        });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
