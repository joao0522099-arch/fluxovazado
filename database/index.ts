
import { User, Post, Group, NotificationItem, Relationship, ChatData, VerificationSession, LockoutState, VipAccess, MarketplaceItem, AdCampaign } from '../types';

// --- Constantes de Armazenamento ---
const IDB_NAME = 'FluxPlatformDB_v1';
const IDB_VERSION = 1;
const IDB_STORE = 'snapshots';
const IDB_KEY = 'sqlite_main';
const BROADCAST_CHANNEL_NAME = 'flux_realtime_sync';
const STORAGE_KEY_SESSION_ID = 'app_current_user_id';

type TableName = 'users' | 'posts' | 'groups' | 'chats' | 'notifications' | 'relationships' | 'vip_access' | 'profile' | 'marketplace' | 'ads';
type Listener = () => void;

// --- Helper do IndexedDB para Persistência Binária ---
const idbHelper = {
    open: (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(IDB_NAME, IDB_VERSION);
            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
            };
            request.onsuccess = (event: any) => resolve(event.target.result);
            request.onerror = (event: any) => reject(event.target.error);
        });
    },
    saveSnapshot: async (data: string) => {
        const db = await idbHelper.open();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            const store = tx.objectStore(IDB_STORE);
            const req = store.put(data, IDB_KEY);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    },
    getSnapshot: async (): Promise<string | null> => {
        const db = await idbHelper.open();
        return new Promise((resolve) => {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const store = tx.objectStore(IDB_STORE);
            const req = store.get(IDB_KEY);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    }
};

class SQLiteDB {
  private db: any = null;
  private isReady: boolean = false;
  private lastSnapshot: string | null = null;
  private channel: BroadcastChannel;
  private listeners: Map<string, Set<Listener>> = new Map();

  constructor() {
    this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    this.init();
    this.setupSync();
  }

  private async init() {
    try {
      // @ts-ignore - sql.js carregado via CDN no index.html
      const SQL = await window.initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      const savedDb = await idbHelper.getSnapshot();
      if (savedDb) {
        this.db = new SQL.Database(this.base64ToUint8(savedDb));
        this.lastSnapshot = savedDb;
      } else {
        this.db = new SQL.Database();
        this.createTables();
        this.save();
      }
      this.isReady = true;
      console.log("📦 Flux Local DB: Pronto e Persistente");
    } catch (err) {
      console.error("❌ Flux Local DB: Falha ao iniciar SQLite", err);
    }
  }

  private setupSync() {
      this.channel.onmessage = async (e) => {
          if (e.data.type === 'DB_UPDATE') {
              const current = await idbHelper.getSnapshot();
              if (current && current !== this.lastSnapshot) {
                  // Reload logic is handled on next read or manual refresh to avoid loops
                  this.notifyListeners(e.data.table);
              }
          }
      };
  }

  private createTables() {
    const schemas = [
      `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, timestamp INTEGER, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY, timestamp INTEGER, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS relationships (id TEXT PRIMARY KEY, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS vip_access (id TEXT PRIMARY KEY, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS marketplace (id TEXT PRIMARY KEY, timestamp INTEGER, data TEXT)`,
      `CREATE TABLE IF NOT EXISTS ads (id TEXT PRIMARY KEY, timestamp INTEGER, data TEXT)`
    ];
    schemas.forEach(sql => this.db.run(sql));
  }

  private save(table: TableName | null = null) {
    if (!this.db) return;
    const data = this.db.export();
    const base64 = this.uint8ToBase64(data);
    this.lastSnapshot = base64;
    idbHelper.saveSnapshot(base64).then(() => {
        if (table) {
            this.channel.postMessage({ type: 'DB_UPDATE', table });
            this.notifyListeners(table);
        }
    });
  }

  public subscribe(table: TableName | 'all', callback: Listener) {
      if (!this.listeners.has(table)) this.listeners.set(table, new Set());
      this.listeners.get(table)!.add(callback);
      return () => this.listeners.get(table)?.delete(callback);
  }

  private notifyListeners(table: string) {
      if (this.listeners.has(table)) this.listeners.get(table)!.forEach(cb => cb());
      if (this.listeners.has('all')) this.listeners.get('all')!.forEach(cb => cb());
  }

  public getAll<T>(table: string): T[] {
    if (!this.db) return [];
    try {
      const res = this.db.exec(`SELECT data FROM ${table}`);
      if (res.length === 0) return [];
      return res[0].values.map((row: any) => JSON.parse(row[0]));
    } catch (e) { return []; }
  }

  public getOne<T>(table: string, id: string | number): T | undefined {
    if (!this.db) return undefined;
    try {
      const stmt = this.db.prepare(`SELECT data FROM ${table} WHERE id = :id`);
      const res = stmt.getAsObject({ ':id': String(id) });
      stmt.free();
      return res.data ? JSON.parse(res.data) : undefined;
    } catch (e) { return undefined; }
  }

  public set(table: TableName, id: string | number, data: any, extra?: any) {
    if (!this.db) return;
    try {
        const json = JSON.stringify(data);
        const timestamp = extra?.timestamp || Date.now();
        
        if (table === 'posts' || table === 'marketplace' || table === 'ads' || table === 'notifications') {
            this.db.run(`INSERT OR REPLACE INTO ${table} (id, timestamp, data) VALUES (?, ?, ?)`, [String(id), timestamp, json]);
        } else {
            this.db.run(`INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`, [String(id), json]);
        }
        this.save(table);
    } catch(e) { console.error(e); }
  }

  public delete(table: TableName, id: string | number) {
    if (!this.db) return;
    this.db.run(`DELETE FROM ${table} WHERE id = ?`, [String(id)]);
    this.save(table);
  }

  private uint8ToBase64(u8: Uint8Array): string {
    let b = '';
    for (let i = 0; i < u8.byteLength; i++) b += String.fromCharCode(u8[i]);
    return window.btoa(b);
  }

  private base64ToUint8(base64: string): Uint8Array {
    const b = window.atob(base64);
    const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  }
}

const sqlite = new SQLiteDB();

export const db = {
  subscribe: (t: TableName | 'all', cb: Listener) => sqlite.subscribe(t, cb),
  users: {
    getAll: () => sqlite.getAll<User>('users').reduce((acc, u) => { acc[u.id] = u; return acc; }, {} as Record<string, User>),
    get: (id: string) => sqlite.getOne<User>('users', id),
    set: (user: User) => sqlite.set('users', user.id, user)
  },
  posts: {
    getAll: () => sqlite.getAll<Post>('posts').sort((a,b) => b.timestamp - a.timestamp),
    getCursorPaginated: (limit: number, cursor?: number) => {
        let items = sqlite.getAll<Post>('posts').sort((a,b) => b.timestamp - a.timestamp);
        if (cursor) items = items.filter(i => i.timestamp < cursor);
        return items.slice(0, limit);
    },
    saveAll: (data: Post[]) => data.forEach(p => sqlite.set('posts', p.id, p, { timestamp: p.timestamp })),
    add: (post: Post) => sqlite.set('posts', post.id, post, { timestamp: post.timestamp }),
    update: (post: Post) => sqlite.set('posts', post.id, post, { timestamp: post.timestamp }),
    delete: (id: string) => sqlite.delete('posts', id),
    findById: (id: string) => sqlite.getOne<Post>('posts', id)
  },
  groups: {
    getAll: () => sqlite.getAll<Group>('groups'),
    saveAll: (data: Group[]) => data.forEach(g => sqlite.set('groups', g.id, g)),
    add: (group: Group) => sqlite.set('groups', group.id, group),
    update: (group: Group) => sqlite.set('groups', group.id, group),
    delete: (id: string) => sqlite.delete('groups', id),
    findById: (id: string) => sqlite.getOne<Group>('groups', id)
  },
  chats: {
    getAll: () => sqlite.getAll<ChatData>('chats').reduce((acc, c) => { acc[c.id] = c; return acc; }, {} as Record<string, ChatData>),
    get: (id: string) => sqlite.getOne<ChatData>('chats', id),
    set: (chat: ChatData) => sqlite.set('chats', chat.id, chat)
  },
  notifications: {
    getAll: () => sqlite.getAll<NotificationItem>('notifications'),
    add: (item: NotificationItem) => sqlite.set('notifications', item.id, item, { timestamp: item.timestamp }),
    delete: (id: number) => sqlite.delete('notifications', id)
  },
  relationships: {
    getAll: () => sqlite.getAll<Relationship>('relationships'),
    add: (rel: Relationship) => sqlite.set('relationships', `${rel.followerId}_${rel.followingId}`, rel),
    remove: (f1: string, f2: string) => sqlite.delete('relationships', `${f1}_${f2}`)
  },
  vipAccess: {
      grant: (access: VipAccess) => sqlite.set('vip_access', `${access.userId}_${access.groupId}`, access),
      check: (uId: string, gId: string) => sqlite.getOne<VipAccess>('vip_access', `${uId}_${gId}`)?.status === 'active',
      // Fix: added missing get method
      get: (uId: string, gId: string) => sqlite.getOne<VipAccess>('vip_access', `${uId}_${gId}`)
  },
  marketplace: {
      getAll: () => sqlite.getAll<MarketplaceItem>('marketplace'),
      add: (i: MarketplaceItem) => sqlite.set('marketplace', i.id, i, { timestamp: i.timestamp }),
      delete: (id: string) => sqlite.delete('marketplace', id)
  },
  ads: {
      getAll: () => sqlite.getAll<AdCampaign>('ads'),
      add: (ad: AdCampaign) => sqlite.set('ads', ad.id, ad, { timestamp: ad.timestamp }),
      update: (ad: AdCampaign) => sqlite.set('ads', ad.id, ad, { timestamp: ad.timestamp }),
      delete: (id: string) => sqlite.delete('ads', id)
  },
  auth: {
    currentUserId: () => localStorage.getItem(STORAGE_KEY_SESSION_ID),
    setCurrentUserId: (id: string) => localStorage.setItem(STORAGE_KEY_SESSION_ID, id),
    clearSession: () => localStorage.removeItem(STORAGE_KEY_SESSION_ID)
  }
};
