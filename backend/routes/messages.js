
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

router.get('/private', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email é obrigatório." });
        const chats = await dbManager.chats.findPrivate(email);
        res.json({ chats });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/groups/:id', async (req, res) => {
    try {
        const chat = await dbManager.chats.findById(req.params.id);
        if (!chat) return res.json({ messages: [] });
        res.json({ messages: chat.messages || [] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/send', async (req, res) => {
    try {
        const { chatId, message } = req.body;
        if (!chatId || !message) return res.status(400).json({ error: "chatId e message são obrigatórios." });
        
        let chatData = await dbManager.chats.findById(chatId);
        
        if (chatData) {
            chatData.messages.push(message);
        } else {
            chatData = { 
                id: chatId, 
                contactName: message.senderName || 'Desconhecido', 
                isBlocked: false, 
                messages: [message] 
            };
        }

        await dbManager.chats.set(chatData);

        if (!chatId.includes('@')) {
            await dbManager.groups.updateActivity(chatId);
        }

        if (req.io) {
            req.io.to(chatId).emit('new_message', { chatId, message });
        }

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/private/:chatId', async (req, res) => {
    try {
        await dbManager.chats.delete(req.params.chatId);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/groups/:id/hide', async (req, res) => {
    try {
        const { messageId, userEmail } = req.body;
        res.json({ success: true, hiddenId: messageId });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
