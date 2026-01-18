
export const interactionsSchema = `
    CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_id, type)
    );

    CREATE INDEX IF NOT EXISTS idx_interactions_post ON interactions(post_id);
`;
