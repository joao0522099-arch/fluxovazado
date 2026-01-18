
import pg from 'pg';
import { usersSchema } from './database/schemas/users.js';
import { groupsSchema } from './database/schemas/groups.js';
import { postsSchema } from './database/schemas/posts.js';
import { interactionsSchema } from './database/schemas/interactions.js';
import { chatsSchema } from './database/schemas/chats.js';
import { marketplaceSchema } from './database/schemas/marketplace.js';
import { relationshipsSchema } from './database/schemas/relationships.js';
import { notificationsSchema } from './database/schemas/notifications.js';
import { vipSchema } from './database/schemas/vip.js';
import { financialSchema } from './database/schemas/financial.js';
import { adsSchema } from './database/schemas/ads.js';
import { reportsSchema } from './database/schemas/reports.js';
import { settingsSchema } from './database/schemas/settings.js';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    console.error("❌ ERRO CRÍTICO: DATABASE_URL não definida no ambiente.");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20
});

const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (error) {
        if (!error.message.includes('already exists')) {
            console.error(`❌ DB Query Error [${text.substring(0, 100)}...]:`, error.message);
        }
        throw error;
    }
};

const toUuid = (val) => {
    if (!val || val === "" || val === "undefined" || val === "null") return null;
    return val;
};

const safeParse = (data) => {
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch (e) { return {}; }
    }
    return data || {};
};

export const dbManager = {
    async init() {
        console.log("🔄 DB: Inicializando Modular Schema...");
        try {
            await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

            const schemas = [
                { name: 'Users', sql: usersSchema },
                { name: 'Settings', sql: settingsSchema },
                { name: 'Groups', sql: groupsSchema },
                { name: 'Posts', sql: postsSchema },
                { name: 'Interactions', sql: interactionsSchema },
                { name: 'Chats', sql: chatsSchema },
                { name: 'Marketplace', sql: marketplaceSchema },
                { name: 'Relationships', sql: relationshipsSchema },
                { name: 'Notifications', sql: notificationsSchema },
                { name: 'VIP Access', sql: vipSchema },
                { name: 'Financial', sql: financialSchema },
                { name: 'Ads', sql: adsSchema },
                { name: 'Reports', sql: reportsSchema }
            ];

            for (const schema of schemas) {
                await query(schema.sql);
            }

            console.log("✅ DB: Estrutura modular validada com sucesso.");
        } catch (e) {
            console.error("❌ DB: Falha na inicialização modular:", e.message);
        }
    },

    analytics: {
        async recordPaymentMethod(data) {
            const { methodName, provider, amount, currency, country, sellerId } = data;
            await query(`
                INSERT INTO payment_methods_usage (method_name, provider, amount, currency, country, seller_id)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [methodName, provider, amount, currency, country, toUuid(sellerId)]);
            return true;
        },
        async getPaymentRanking(sellerId = null) {
            let whereClause = '';
            const params = [];
            if (sellerId) {
                whereClause = 'WHERE seller_id = $1';
                params.push(toUuid(sellerId));
            }
            const res = await query(`
                SELECT 
                    method_name as method,
                    provider,
                    COUNT(*) as usage_count,
                    SUM(amount) as total_volume,
                    MAX(created_at) as last_used
                FROM payment_methods_usage
                ${whereClause}
                GROUP BY method_name, provider
                ORDER BY usage_count DESC
            `, params);
            return res.rows;
        }
    },

    settings: {
        async getFees() {
            const res = await query("SELECT value FROM platform_settings WHERE key = 'fees'");
            return res.rows[0]?.value || { sale_fee_type: "percent", sale_fee_value: 10, withdrawal_fee: 5.00 };
        },
        async updateFees(newFees) {
            await query(
                "UPDATE platform_settings SET value = $1, updated_at = NOW() WHERE key = 'fees'",
                [JSON.stringify(newFees)]
            );
            return true;
        }
    },

    users: {
        async findByEmail(email) {
            if (!email) return null;
            const res = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
            if (res.rows.length > 0) {
                const row = res.rows[0];
                const data = safeParse(row.data);
                return { ...data, id: row.id, email: row.email, googleId: row.google_id, referredById: row.referred_by_id };
            }
            return null;
        },
        async findByGoogleId(googleId) {
            if (!googleId) return null;
            const res = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
            if (res.rows.length > 0) {
                const row = res.rows[0];
                const data = safeParse(row.data);
                return { ...data, id: row.id, email: row.email, googleId: row.google_id, referredById: row.referred_by_id };
            }
            return null;
        },
        async findById(id) {
            const uuid = toUuid(id);
            if (!uuid) return null;
            const res = await query('SELECT * FROM users WHERE id = $1', [uuid]);
            if (res.rows.length > 0) {
                const row = res.rows[0];
                const data = safeParse(row.data);
                return { ...data, id: row.id, email: row.email, googleId: row.google_id, referredById: row.referred_by_id };
            }
            return null;
        },
        async create(user) {
            const { email, password, googleId, referredById, ...userData } = user;
            const res = await query(
                `INSERT INTO users (email, password, google_id, referred_by_id, data) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id`,
                [email.toLowerCase().trim(), password, googleId || null, toUuid(referredById), JSON.stringify(userData)]
            );
            return res.rows[0].id;
        },
        async update(user) {
            const { id, googleId, password, ...userData } = user;
            const uuid = toUuid(id);
            if (!uuid) return false;
            if (password) {
                await query(`UPDATE users SET password = $1, google_id = $2, data = $3 WHERE id = $4`, [password, googleId || null, JSON.stringify(userData), uuid]);
            } else {
                await query(`UPDATE users SET google_id = $1, data = $2 WHERE id = $3`, [googleId || null, JSON.stringify(userData), uuid]);
            }
            return true;
        },
        async getAll() {
            const res = await query('SELECT * FROM users LIMIT 1000', []);
            return res.rows.map(row => {
                const data = safeParse(row.data);
                return { ...data, id: row.id, email: row.email, googleId: row.google_id };
            });
        }
    },

    groups: {
        async create(group) {
            const creatorUuid = toUuid(group.creatorId);
            if (!creatorUuid) throw new Error("ID do criador inválido");
            await query(`
                INSERT INTO groups (id, creator_id, data, updated_at) 
                VALUES ($1, $2, $3, NOW()) 
                ON CONFLICT (id) DO UPDATE SET data = $3, creator_id = $2, updated_at = NOW()
            `, [group.id, creatorUuid, JSON.stringify(group)]);
            return true;
        },
        async findById(id) {
            const res = await query('SELECT * FROM groups WHERE id = $1', [id]);
            if (res.rows.length > 0) {
                const row = res.rows[0];
                return safeParse(row.data);
            }
            return null;
        },
        async list() {
            const res = await query('SELECT * FROM groups ORDER BY updated_at DESC', []);
            return res.rows.map(r => safeParse(r.data));
        },
        async ranking(type = 'public') {
            let filter = '';
            if (type === 'vip') {
                filter = "WHERE (data->>'isVip')::boolean = true";
            } else if (type === 'private') {
                filter = "WHERE (data->>'isPrivate')::boolean = true AND (data->>'isVip')::boolean = false";
            } else {
                filter = "WHERE (data->>'isPrivate')::boolean = false AND (data->>'isVip')::boolean = false";
            }
            const sql = `
                SELECT *, jsonb_array_length(COALESCE(data->'memberIds', '[]'::jsonb)) as member_count
                FROM groups
                ${filter}
                ORDER BY member_count DESC
                LIMIT 100
            `;
            const res = await query(sql);
            return res.rows.map(r => safeParse(r.data));
        },
        async update(group) {
            await query(`UPDATE groups SET data = $2, updated_at = NOW() WHERE id = $1`, [group.id, JSON.stringify(group)]);
            return true;
        },
        async updateActivity(groupId) {
            await query(`UPDATE groups SET updated_at = NOW() WHERE id = $1`, [groupId]);
        },
        async delete(id) {
            await query('DELETE FROM groups WHERE id = $1', [id]);
            return true;
        }
    },

    posts: {
        async create(post) {
            const authorUuid = toUuid(post.authorId);
            if (!authorUuid) throw new Error("ID do autor inválido para post");
            await query(`
                INSERT INTO posts (id, author_id, data) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (id) DO UPDATE SET data = $3, author_id = $2
            `, [post.id, authorUuid, JSON.stringify(post)]);
            return true;
        },
        async list(limit = 50, cursor = null) {
            let sql = 'SELECT * FROM posts';
            let params = [limit];
            if (cursor) {
                sql += ' WHERE created_at < $2 ORDER BY created_at DESC LIMIT $1';
                params.push(new Date(Number(cursor)));
            } else {
                sql += ' ORDER BY created_at DESC LIMIT $1';
            }
            const res = await query(sql, params);
            return res.rows.map(r => {
                const data = safeParse(r.data);
                return { ...data, authorId: r.author_id, timestamp: new Date(r.created_at).getTime() };
            });
        },
        async delete(id) {
            await query('DELETE FROM interactions WHERE post_id = $1', [id]);
            await query('DELETE FROM posts WHERE id = $1', [id]);
            return true;
        },
        async addComment(postId, comment) {
            await query(`
                UPDATE posts 
                SET data = jsonb_set(
                    jsonb_set(
                        data, 
                        '{commentsList}', 
                        COALESCE(data->'commentsList', '[]'::jsonb) || $2::jsonb
                    ),
                    '{comments}',
                    ((COALESCE(data->>'comments', '0')::int) + 1)::text::jsonb
                )
                WHERE id = $1
            `, [postId, JSON.stringify(comment)]);
            return true;
        }
    },

    marketplace: {
        async create(item) {
            const sellerUuid = toUuid(item.sellerId);
            if (!sellerUuid) throw new Error("ID do vendedor inválido");
            await query(`
                INSERT INTO marketplace (id, seller_id, data)
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE SET data = $3, seller_id = $2
            `, [item.id, sellerUuid, JSON.stringify(item)]);
            return true;
        },
        async findById(id) {
            const res = await query('SELECT * FROM marketplace WHERE id = $1', [id]);
            if (res.rows.length > 0) {
                const row = res.rows[0];
                return safeParse(row.data);
            }
            return null;
        },
        async list() {
            const res = await query('SELECT * FROM marketplace ORDER BY created_at DESC', []);
            return res.rows.map(r => {
                const data = safeParse(r.data);
                return { ...data, sellerId: r.seller_id };
            });
        },
        async delete(id) {
            await query('DELETE FROM marketplace WHERE id = $1', [id]);
            return true;
        }
    },

    chats: {
        async findPrivate(email) {
            const sql = `
                SELECT * FROM chats 
                WHERE id LIKE '%@%' AND id LIKE $1 
                ORDER BY updated_at DESC
            `;
            const res = await query(sql, [`%${email}%`]);
            return res.rows.map(row => safeParse(row.data));
        },
        async findById(id) {
            const res = await query('SELECT * FROM chats WHERE id = $1', [id]);
            if (res.rows.length > 0) {
                return safeParse(res.rows[0].data);
            }
            return null;
        },
        async set(chat) {
            await query(`
                INSERT INTO chats (id, data, updated_at) 
                VALUES ($1, $2, NOW()) 
                ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()
            `, [chat.id, JSON.stringify(chat)]);
        },
        async delete(id) {
            await query('DELETE FROM chats WHERE id = $1', [id]);
        }
    },

    vip: {
        async grantAccess(userId, groupId, status = 'active', metadata = {}) {
            const uUuid = toUuid(userId);
            if (!uUuid) throw new Error("ID de usuário inválido para VIP");
            const accessId = `${userId}_${groupId}`;
            const data = { status, ...metadata };
            await query(`
                INSERT INTO vip_access (id, user_id, group_id, data)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO UPDATE SET data = $4
            `, [accessId, uUuid, groupId, JSON.stringify(data)]);
            await query(`
                UPDATE groups 
                SET data = jsonb_set(
                    data, 
                    '{memberIds}', 
                    COALESCE(data->'memberIds', '[]'::jsonb) || $2::jsonb
                )
                WHERE id = $1 AND NOT (data->'memberIds' ? $3)
            `, [groupId, JSON.stringify(userId), userId]);
            return true;
        }
    },

    financial: {
        async recordTransaction({ userId, type, amount, status, providerTxId, currency = 'BRL', data = {} }) {
            const uUuid = toUuid(userId);
            if (!uUuid) throw new Error("ID de usuário inválido para transação");
            const res = await query(`
                INSERT INTO financial_transactions (user_id, type, amount, status, provider_tx_id, currency, data)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [uUuid, type, amount, status, providerTxId, currency, JSON.stringify(data)]);
            return res.rows[0].id;
        }
    },

    interactions: {
        async record(postId, userId, type) {
            const userUuid = toUuid(userId);
            if (!userUuid) return; 
            await query(`
                INSERT INTO interactions (post_id, user_id, type) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (post_id, user_id, type) DO NOTHING
            `, [postId, userUuid, type]);
            if (type === 'like' || type === 'view') {
                const column = type === 'like' ? 'likes' : 'views';
                const arrayColumn = type === 'like' ? 'likedByIds' : 'viewedByIds';
                await query(`
                    UPDATE posts 
                    SET data = jsonb_set(
                        jsonb_set(
                            data, 
                            '{${column}}', 
                            (SELECT count(*) FROM interactions WHERE post_id = $1 AND type = $2)::text::jsonb
                        ),
                        '{${arrayColumn}}',
                        (SELECT json_agg(user_id) FROM interactions WHERE post_id = $1 AND type = $2)::jsonb
                    )
                    WHERE id = $1
                `, [postId, type]);
            }
        }
    },

    relationships: {
        async create(rel) {
            const f1 = toUuid(rel.followerId);
            const f2 = toUuid(rel.followingId);
            if (!f1 || !f2) return;
            const id = `${rel.followerId}_${rel.followingId}`;
            await query(`
                INSERT INTO relationships (id, follower_id, following_id, status, data) 
                VALUES ($1, $2, $3, $4, $5) 
                ON CONFLICT (id) DO UPDATE SET status = $4, data = $5
            `, [id, f1, f2, rel.status || 'accepted', JSON.stringify(rel)]);
        },
        async delete(followerId, followingId) {
            const f1 = toUuid(followerId);
            const f2 = toUuid(followingId);
            if (!f1 || !f2) return;
            await query('DELETE FROM relationships WHERE follower_id = $1 AND following_id = $2', [f1, f2]);
        },
        async findByFollower(followerId) {
            const fUuid = toUuid(followerId);
            if (!fUuid) return [];
            const res = await query('SELECT data FROM relationships WHERE follower_id = $1', [fUuid]);
            return res.rows.map(r => safeParse(r.data));
        },
        async getTopCreators() {
            const sql = `
                SELECT u.id, u.data, COUNT(r.id) as follower_count
                FROM users u
                LEFT JOIN relationships r ON u.id = r.following_id AND r.status = 'accepted'
                GROUP BY u.id
                ORDER BY follower_count DESC
                LIMIT 50
            `;
            const res = await query(sql);
            return res.rows.map(row => {
                const data = safeParse(row.data);
                return { ...data, id: row.id, followerCount: parseInt(row.follower_count) };
            });
        }
    },

    admin: {
        async getTotalUsers() {
            const res = await query('SELECT count(*) FROM users');
            return parseInt(res.rows[0].count);
        },
        async banUser(id, reason) {
            const uuid = toUuid(id);
            if (!uuid) throw new Error("ID inválido");
            const res = await query('SELECT data FROM users WHERE id = $1', [uuid]);
            if (res.rows.length === 0) throw new Error("Usuário não encontrado");
            let data = safeParse(res.rows[0].data);
            data.isBanned = true;
            data.banReason = reason;
            await query('UPDATE users SET data = $1 WHERE id = $2', [JSON.stringify(data), uuid]);
            return true;
        },
        async unbanUser(id) {
            const uuid = toUuid(id);
            if (!uuid) throw new Error("ID inválido");
            const res = await query('SELECT data FROM users WHERE id = $1', [uuid]);
            if (res.rows.length === 0) throw new Error("Usuário não encontrado");
            let data = safeParse(res.rows[0].data);
            data.isBanned = false;
            data.banReason = null;
            await query('UPDATE users SET data = $1 WHERE id = $2', [JSON.stringify(data), uuid]);
            return true;
        },
        async recordIp(userId, ip, userAgent) {
            const uuid = toUuid(userId);
            if (!uuid) return;
        },
        async getUsersList() {
            const sql = `SELECT u.id, u.email, u.google_id, u.created_at, u.data FROM users u ORDER BY u.created_at DESC`;
            const res = await query(sql);
            return res.rows.map(row => {
                const userData = safeParse(row.data);
                return { id: row.id, email: row.email, googleId: row.google_id, createdAt: row.created_at, ...userData };
            });
        }
    },

    reports: {
        async create(report) {
            const tUuid = toUuid(report.targetId);
            const rUuid = toUuid(report.reporterId);
            await query(
                'INSERT INTO reports (target_id, reporter_id, reason) VALUES ($1, $2, $3)',
                [tUuid, rUuid, report.reason]
            );
        }
    },

    query
};
