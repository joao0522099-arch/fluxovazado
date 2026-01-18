
export const relationshipsSchema = `
    CREATE TABLE IF NOT EXISTS relationships (
        id TEXT PRIMARY KEY, 
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        status TEXT DEFAULT 'accepted',
        data JSONB, 
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_rel_follower ON relationships(follower_id);
    CREATE INDEX IF NOT EXISTS idx_rel_following ON relationships(following_id);
`;
