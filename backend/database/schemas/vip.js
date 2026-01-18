
export const vipSchema = `
    CREATE TABLE IF NOT EXISTS vip_access (
        id TEXT PRIMARY KEY, 
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE, 
        data JSONB, 
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_vip_user_group ON vip_access(user_id, group_id);
`;
