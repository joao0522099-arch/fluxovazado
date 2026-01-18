
import express from 'express';
import { dbManager } from '../databaseManager.js';
import { googleAuthConfig } from '../authConfig.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const router = express.Router();
const client = new OAuth2Client(googleAuthConfig.clientId);

router.get('/config', (req, res) => {
    res.json({ clientId: googleAuthConfig.clientId });
});

router.post('/register', async (req, res) => {
    try {
        const user = req.body;
        if (user.referredById === "") user.referredById = null;
        const userId = await dbManager.users.create(user);
        res.json({ success: true, user: { ...user, id: userId } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await dbManager.users.findByEmail(email);
        if (user && user.password === password) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ua = req.headers['user-agent'];
            await dbManager.admin.recordIp(user.id, ip, ua);
            res.json({ user, token: 'session_' + crypto.randomUUID() });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/google', async (req, res) => {
    try {
        const { googleToken, referredBy } = req.body;
        let googleId, email, name;
        if (googleAuthConfig.clientId !== "GOOGLE_CLIENT_ID_NAO_CONFIGURADO" && googleToken && googleToken.length > 50) {
            try {
                const ticket = await client.verifyIdToken({ idToken: googleToken, audience: googleAuthConfig.clientId });
                const payload = ticket.getPayload();
                googleId = payload['sub']; email = payload['email']; name = payload['name'];
            } catch (err) {}
        }
        if (!googleId) {
            googleId = `mock_${crypto.randomUUID().substring(0, 8)}`;
            email = `guest_${googleId}@gmail.com`;
        }
        let user = await dbManager.users.findByGoogleId(googleId);
        let isNew = false;
        if (!user) {
            const existingByEmail = await dbManager.users.findByEmail(email);
            if (existingByEmail) {
                user = existingByEmail; user.googleId = googleId; await dbManager.users.update(user);
            } else {
                isNew = true;
                const newUser = { email, googleId, isVerified: true, isProfileCompleted: false, referredById: referredBy || null, profile: { name: `user_${googleId.slice(-4)}`, nickname: name || 'Usuário Flux', isPrivate: false, photoUrl: '' } };
                const id = await dbManager.users.create(newUser);
                user = { ...newUser, id };
            }
        }
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ua = req.headers['user-agent'];
        await dbManager.admin.recordIp(user.id, ip, ua);
        res.json({ user, token: 'g_session_' + crypto.randomUUID(), isNew });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
