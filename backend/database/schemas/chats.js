
export const chatsSchema = `
    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY, 
        data JSONB, 
        updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_chats_updated ON chats(updated_at DESC);
`;
