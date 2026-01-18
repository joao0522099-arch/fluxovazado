
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const groups = await dbManager.groups.list();
        res.json({ data: groups });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/ranking', async (req, res) => {
    try {
        const { type } = req.query;
        const groups = await dbManager.groups.ranking(type);
        res.json({ data: groups });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const group = await dbManager.groups.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Grupo não encontrado' });
        res.json({ group });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/create', async (req, res) => {
    try {
        await dbManager.groups.create(req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        await dbManager.groups.update(req.body);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await dbManager.groups.delete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
