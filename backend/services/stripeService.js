
import axios from 'axios';
import { dbManager } from '../databaseManager.js';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

/**
 * Serviço de integração com Stripe API v1
 */
export const stripeService = {
    /**
     * Verifica as credenciais da Stripe buscando informações da conta
     */
    verifyCredentials: async (secretKey) => {
        try {
            const response = await axios.get(`${STRIPE_API_BASE}/account`, {
                auth: { username: secretKey, password: '' }
            });
            return response.data;
        } catch (error) {
            console.error('Stripe Auth Error:', error.response?.data || error.message);
            throw new Error('Falha na autenticação com a Stripe. Verifique sua chave secreta.');
        }
    },

    /**
     * Cria uma sessão de Checkout para pagamento ou assinatura
     */
    createCheckoutSession: async (secretKey, group, ownerEmail, successUrl, cancelUrl) => {
        try {
            const isSubscription = group.accessType === 'temporary';
            const params = new URLSearchParams();
            
            params.append('mode', isSubscription ? 'subscription' : 'payment');
            params.append('automatic_payment_methods[enabled]', 'true');

            params.append('line_items[0][price_data][currency]', (group.currency || 'BRL').toLowerCase());
            params.append('line_items[0][price_data][product_data][name]', `Acesso VIP: ${group.name}`);
            params.append('line_items[0][price_data][unit_amount]', Math.round(parseFloat(group.price) * 100));
            
            if (isSubscription) {
                params.append('line_items[0][price_data][recurring][interval]', 'month');
            }
            
            params.append('line_items[0][quantity]', '1');
            params.append('success_url', successUrl);
            params.append('cancel_url', cancelUrl);
            
            params.append('metadata[groupId]', group.id);
            params.append('metadata[ownerEmail]', ownerEmail);
            
            if (group.buyerEmail) {
                params.append('customer_email', group.buyerEmail);
            }

            const response = await axios.post(`${STRIPE_API_BASE}/checkout/sessions`, params, {
                auth: { username: secretKey, password: '' },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            return {
                id: response.data.id,
                url: response.data.url
            };
        } catch (error) {
            console.error('Stripe Session Error:', error.response?.data || error.message);
            throw new Error('Erro ao criar checkout na Stripe.');
        }
    },

    /**
     * Processador central de Webhooks da Stripe
     */
    handleWebhook: async (event) => {
        const type = event.type;
        const data = event.data.object;

        switch (type) {
            case 'checkout.session.completed':
                await stripeService.fulfillOrder(data);
                break;
            default:
                console.log(`[Stripe Webhook] Evento ignorado: ${type}`);
        }
    },

    /**
     * Finaliza o pedido e EXTRAI O MÉTODO REAL usado (✅ Resolve o problema internacional)
     */
    fulfillOrder: async (session) => {
        const { groupId, ownerEmail } = session.metadata;
        const amount = session.amount_total / 100;
        const currency = session.currency.toUpperCase();
        
        // No checkout.session.completed, a Stripe injeta os métodos usados
        // Pode ser 'card', 'pix', 'sepa_debit', 'ideal', 'klarna', etc.
        const methodType = session.payment_method_types?.[0] || 'stripe_other';
        const country = session.customer_details?.address?.country || 'Global';

        // Mapeamento amigável para o ranking do ADMF LUX
        const methodMap = {
            'card': 'Cartão de Crédito',
            'pix': 'Pix (Stripe)',
            'sepa_debit': 'Débito Direto (SEPA)',
            'ach_debit': 'ACH (Transferência EUA)',
            'link': 'Stripe Link',
            'klarna': 'Klarna / Parcelado',
            'ideal': 'iDEAL',
            'giropay': 'Giropay',
            'bancontact': 'Bancontact',
            'eps': 'EPS',
            'p24': 'Przelewy24'
        };

        const finalMethodName = methodMap[methodType] || `Stripe ${methodType}`;

        try {
            const buyerEmail = session.customer_details?.email;
            const buyer = buyerEmail ? await dbManager.users.findByEmail(buyerEmail) : null;

            if (buyer) {
                // 1. Libera VIP
                await dbManager.vip.grantAccess(buyer.id, groupId);
                
                // 2. Registra Transação Financeira
                await dbManager.financial.recordTransaction({
                    userId: buyer.id,
                    type: 'sale',
                    amount: amount,
                    status: 'paid',
                    providerTxId: session.id,
                    currency: currency,
                    data: { providerId: 'stripe', groupId, method: finalMethodName }
                });
            }

            // 3. REGISTRA NO RANKING DE ANALYTICS (✅ TRANSFORMA ❌ EM ✅)
            await dbManager.analytics.recordPaymentMethod({
                methodName: finalMethodName,
                provider: 'stripe',
                amount: amount,
                currency: currency,
                country: country
            });

            console.log(`✅ [Stripe Ranking Update] ${finalMethodName} registrado para o país ${country}`);
        } catch (e) {
            console.error(`❌ [Stripe Fulfill Error]:`, e.message);
        }
    }
};
