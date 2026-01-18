
export const reportsSchema = `
    CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY, 
        target_id UUID NOT NULL, 
        reporter_id UUID REFERENCES users(id), 
        reason TEXT NOT NULL, 
        status TEXT DEFAULT 'pending', 
        created_at TIMESTAMP DEFAULT NOW()
    );
`;
