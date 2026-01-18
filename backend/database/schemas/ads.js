
export const adsSchema = `
    CREATE TABLE IF NOT EXISTS ads (
        id TEXT PRIMARY KEY,
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_ads_owner ON ads(owner_id);
`;
