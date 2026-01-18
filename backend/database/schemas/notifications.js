
export const notificationsSchema = `
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY, 
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
        data JSONB, 
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
`;
