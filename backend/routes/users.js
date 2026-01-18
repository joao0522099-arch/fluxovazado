
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

router.get('/sync', async (req, res) => {
    try {
        const users = await dbManager.users.getAll();
        res.json({ users });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const users = await dbManager.users.getAll();
        const filtered = users.filter(u => 
            u.profile?.name?.toLowerCase().includes(q.toLowerCase()) || 
            u.profile?.nickname?.toLowerCase().includes(q.toLowerCase())
        );
        res.json(filtered);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/update', async (req, res) => {
    try {
        const { email, updates } = req.body;
        const user = await dbManager.users.findByEmail(email);
        if (user) {
            const updated = { ...user, ...updates };
            await dbManager.users.update(updated);
            res.json({ user: updated });
        } else res.status(404).json({ error: 'Usuário não encontrado' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
