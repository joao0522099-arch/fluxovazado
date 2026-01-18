
export const groupsSchema = `
    CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY, 
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        data JSONB, 
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_id);
`;
