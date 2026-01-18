
import express from 'express';
import axios from 'axios';
import { dbManager } from '../databaseManager.js';
import { paypalService } from '../services/paypalService.js';
import { stripeService } from '../services/stripeService.js';

const router = express.Router();

const SYNCPAY_API_BASE = 'https://api.syncpayments.com.br/api/partner/v1';

const getSyncPayToken = async (clientId, clientSecret) => {
    try {
        const response = await axios.post(`${SYNCPAY_API_BASE}/auth-token`, {
            client_id: clientId,
            client_secret: clientSecret
        });
        return response.data.access_token;
    } catch (e) {
        throw new Error("Falha na autenticação com o provedor de pagamentos.");
    }
};

// --- STRIPE WEBHOOK ---
router.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const event = JSON.parse(req.body);
        await stripeService.handleWebhook(event);
        res.json({ received: true });
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

// SyncPay
router.post('/syncpay/auth-token', async (req, res) => {
    try {
        const { clientId, clientSecret } = req.body;
        await getSyncPayToken(clientId, clientSecret);
        res.json({ success: true, message: "Conexão configurada com sucesso." });
    } catch (e) { res.status(401).json({ error: e.message }); }
});

router.post('/syncpay/cash-in', async (req, res) => {
    try {
        const { payload, ownerEmail, groupId } = req.body;
        const owner = await dbManager.users.findByEmail(ownerEmail);
        if (!owner || !owner.paymentConfig?.isConnected) return res.status(400).json({ error: "Recebedor não configurado." });
        const token = await getSyncPayToken(owner.paymentConfig.clientId, owner.paymentConfig.clientSecret);
        
        const response = await axios.post(`${SYNCPAY_API_BASE}/cash-in`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Analytics
        await dbManager.analytics.recordPaymentMethod({
            methodName: payload.payment_method === 'pix' ? 'Pix' : 'Boleto',
            provider: 'syncpay',
            amount: payload.amount,
            currency: 'BRL',
            country: 'BR',
            sellerId: owner.id
        });

        res.json(response.data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PayPal
router.post('/paypal/auth-token', async (req, res) => {
    try {
        const { clientId, clientSecret } = req.body;
        await paypalService.verifyCredentials(clientId, clientSecret);
        res.json({ success: true });
    } catch (e) { res.status(401).json({ error: e.message }); }
});

router.post('/paypal/create-order', async (req, res) => {
    try {
        const { amount, currency, description, ownerEmail } = req.body;
        const owner = await dbManager.users.findByEmail(ownerEmail);
        const config = owner?.paymentConfigs?.paypal || (owner?.paymentConfig?.providerId === 'paypal' ? owner.paymentConfig : null);
        if (!config?.isConnected) return res.status(400).json({ error: "PayPal não configurado." });
        const order = await paypalService.createOrder(config.clientId, config.clientSecret, amount, currency || 'BRL', description);
        
        // Analytics
        await dbManager.analytics.recordPaymentMethod({
            methodName: 'PayPal Wallet',
            provider: 'paypal',
            amount,
            currency: currency || 'BRL',
            country: 'Global',
            sellerId: owner.id
        });

        res.json(order);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Stripe Checkout Session
router.post('/stripe/create-session', async (req, res) => {
    try {
        const { group, ownerEmail, successUrl, cancelUrl } = req.body;
        const owner = await dbManager.users.findByEmail(ownerEmail);
        const config = owner?.paymentConfigs?.stripe || (owner?.paymentConfig?.providerId === 'stripe' ? owner.paymentConfig : null);
        if (!config?.isConnected) return res.status(400).json({ error: "Stripe não configurada." });
        
        const session = await stripeService.createCheckoutSession(config.clientSecret, group, ownerEmail, successUrl, cancelUrl);
        
        res.json(session);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
