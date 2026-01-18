
export const usersSchema = `
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL, 
        password TEXT, 
        google_id TEXT UNIQUE,
        data JSONB, 
        referred_by_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Índice para busca rápida por email (frequentemente usado no login)
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;
