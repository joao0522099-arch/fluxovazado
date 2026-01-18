
import express from 'express';
import { dbManager } from '../databaseManager.js';
import { validateAdmin } from '../middleware.js';

const router = express.Router();

router.use(validateAdmin);

// Platform Settings
router.get('/settings/fees', async (req, res) => {
    try {
        const fees = await dbManager.settings.getFees();
        res.json(fees);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/settings/fees', async (req, res) => {
    try {
        const { sale_fee_type, sale_fee_value, withdrawal_fee } = req.body;
        if (sale_fee_type && !['fixed', 'percent'].includes(sale_fee_type)) {
            return res.status(400).json({ error: "Tipo de taxa de venda inválido. Use 'fixed' ou 'percent'." });
        }
        const currentFees = await dbManager.settings.getFees();
        const updatedFees = {
            ...currentFees,
            sale_fee_type: sale_fee_type || currentFees.sale_fee_type,
            sale_fee_value: sale_fee_value !== undefined ? Number(sale_fee_value) : currentFees.sale_fee_value,
            withdrawal_fee: withdrawal_fee !== undefined ? Number(withdrawal_fee) : currentFees.withdrawal_fee
        };
        await dbManager.settings.updateFees(updatedFees);
        res.json({ success: true, fees: updatedFees });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Stats
router.get('/stats/sellers', async (req, res) => {
    try {
        const stats = await dbManager.admin.getSellersStats();
        res.json(stats);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats/financial', async (req, res) => {
    try {
        const stats = await dbManager.admin.getFinancialStats();
        res.json(stats);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats/providers', async (req, res) => {
    try {
        const stats = await dbManager.admin.getProviderStats();
        res.json(stats);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/stats/users/total', async (req, res) => {
    try {
        const count = await dbManager.admin.getTotalUsers();
        res.json({ count });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// User Management
router.get('/users', async (req, res) => {
    try {
        const usersList = await dbManager.admin.getUsersList();
        const formatted = usersList.map(u => ({
            id: u.id,
            email: u.email,
            displayName: u.profile?.nickname || u.profile?.name || 'Usuário Flux',
            role: u.email === 'admin@maintenance.com' ? 'ADMIN' : (u.paymentConfig?.isConnected ? 'CREATOR' : 'USER'),
            isBanned: !!u.isBanned,
            createdAt: u.createdAt,
            lastIp: u.lastIp || '0.0.0.0',
            strikes: u.strikes || 0,
            stats: u.stats
        }));
        res.json(formatted);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/users/:id/insights', async (req, res) => {
    try {
        const insights = await dbManager.admin.getUserInsights(req.params.id);
        res.json(insights);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/users/:id/ban', async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ error: "Motivo do banimento é obrigatório." });
        await dbManager.admin.banUser(req.params.id, reason);
        res.json({ success: true, status: "BANNED" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/users/:id/unban', async (req, res) => {
    try {
        await dbManager.admin.unbanUser(req.params.id);
        res.json({ success: true, status: "ACTIVE" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Content Deletion
router.delete('/content/feed/:id', async (req, res) => {
    try {
        await dbManager.posts.delete(req.params.id);
        res.json({ success: true, type: "FEED_POST" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/content/marketplace/:id', async (req, res) => {
    try {
        await dbManager.marketplace.delete(req.params.id);
        res.json({ success: true, type: "MARKETPLACE_ITEM" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
