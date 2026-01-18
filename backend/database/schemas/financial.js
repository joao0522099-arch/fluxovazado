
export const financialSchema = `
    CREATE TABLE IF NOT EXISTS financial_transactions (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        type TEXT,
        amount NUMERIC(10,2),
        status TEXT,
        provider_tx_id TEXT,
        currency TEXT DEFAULT 'BRL',
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_methods_usage (
        id SERIAL PRIMARY KEY,
        method_name TEXT NOT NULL,
        provider TEXT NOT NULL,
        amount NUMERIC(10,2),
        currency TEXT,
        country TEXT,
        seller_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_financial_user ON financial_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_pay_method_seller ON payment_methods_usage (seller_id);
`;
