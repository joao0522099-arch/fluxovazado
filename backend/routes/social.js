
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

router.post('/reports', async (req, res) => {
    try {
        const { targetId, reporterId, reason } = req.body;
        if (!targetId || !reason) return res.status(400).json({ error: "Dados obrigatórios ausentes." });
        await dbManager.reports.create({ targetId, reporterId, reason });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/relationships/follow', async (req, res) => {
    try {
        await dbManager.relationships.create(req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/relationships/unfollow', async (req, res) => {
    try {
        await dbManager.relationships.delete(req.body.followerId, req.body.followingId);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/relationships/me', async (req, res) => {
    try {
        const { followerId } = req.query;
        if (!followerId) return res.status(400).json({ error: "followerId obrigatório" });
        const rels = await dbManager.relationships.findByFollower(followerId);
        res.json({ relationships: rels });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/rankings/top', async (req, res) => {
    try {
        const top = await dbManager.relationships.getTopCreators();
        res.json({ data: top });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
