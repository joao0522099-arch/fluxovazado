
export const settingsSchema = `
    CREATE TABLE IF NOT EXISTS platform_settings (
        key TEXT PRIMARY KEY,
        value JSONB,
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Inserir taxas padrão se não existirem
    INSERT INTO platform_settings (key, value) 
    VALUES ('fees', '{"sale_fee_type": "percent", "sale_fee_value": 10, "withdrawal_fee": 5.00}')
    ON CONFLICT (key) DO NOTHING;
`;
