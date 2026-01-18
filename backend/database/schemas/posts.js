
export const postsSchema = `
    CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY, 
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        data JSONB, 
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
`;
