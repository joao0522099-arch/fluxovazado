
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

// Listar Posts (Feed) com Paginação
router.get('/', async (req, res) => {
    try {
        const { limit, cursor } = req.query;
        const posts = await dbManager.posts.list(Number(limit) || 50, cursor);
        
        let nextCursor = null;
        if (posts.length > 0) {
            nextCursor = posts[posts.length - 1].timestamp;
        }

        res.json({ data: posts, nextCursor });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Criar Post
router.post('/create', async (req, res) => {
    try {
        const post = req.body;
        if (!post.id || !post.authorId) {
            return res.status(400).json({ error: "ID e authorId são obrigatórios" });
        }
        await dbManager.posts.create(post);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Interagir (Like / View)
router.post('/:id/interact', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, userId } = req.body;
        if (!userId || !type) return res.status(400).json({ error: "userId e type são obrigatórios" });
        
        await dbManager.interactions.record(id, userId, type);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Adicionar Comentário
router.post('/:id/comment', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        if (!comment) return res.status(400).json({ error: "Comentário ausente" });
        
        await dbManager.posts.addComment(id, comment);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Deletar Post
router.delete('/:id', async (req, res) => {
    try {
        await dbManager.posts.delete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
