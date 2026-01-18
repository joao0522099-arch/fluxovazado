
export const marketplaceSchema = `
    CREATE TABLE IF NOT EXISTS marketplace (
        id TEXT PRIMARY KEY, 
        seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        data JSONB, 
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace(seller_id);
`;
