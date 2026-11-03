import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createRequire } from 'module';
import { SCHEMA_SQL, SEED_SQL } from './dbData';

const require = createRequire(import.meta.url);

const app = express();
const IS_VERCEL = Boolean(process.env.VERCEL);
const SEED_DB_PATH = path.resolve(process.cwd(), 'database', 'parking_system.db');
const RUNTIME_DB_PATH = IS_VERCEL ? path.join('/tmp', 'parking_system.db') : SEED_DB_PATH;
const SALT = 'ParkEase_Secure_Salt_2026_DBMS';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

interface UniversalDb {
  exec(sql: string): void;
  prepare(sql: string): { all(): any[]; get?(): any; run?(): any };
  close(): void;
}

let dbInstance: any = null;
let initPromise: Promise<any> | null = null;

// Universal SQLite Engine: Powered by WebAssembly SQLite (sql.js inline wasm).
// Runs reliably on Vercel Serverless Functions, AWS Lambda, Linux, macOS, and Windows
// with zero native C++ compile steps, no node-gyp, and zero missing binary issues.
async function getDb(): Promise<any> {
  if (dbInstance) return dbInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const initSqlJs = require('sql.js/dist/sql-wasm-inline.js');
      const SQL = await initSqlJs();

      // Check if persistent database exists on disk (e.g. /tmp on Vercel)
      if (fs.existsSync(RUNTIME_DB_PATH)) {
        try {
          const fileBuffer = fs.readFileSync(RUNTIME_DB_PATH);
          if (fileBuffer.length > 0) {
            const loadedDb = new SQL.Database(fileBuffer);
            const check = loadedDb.exec("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='parking_centres'");
            if (check.length > 0 && check[0].values[0][0] > 0) {
              dbInstance = loadedDb;
              return dbInstance;
            }
          }
        } catch (err) {
          console.warn('[DB] Could not load existing DB file, creating fresh in-memory DB:', err);
        }
      }

      // Initialize fresh SQLite database from embedded schema & seed data
      const freshDb = new SQL.Database();
      freshDb.run(SCHEMA_SQL);
      freshDb.run(SEED_SQL);
      dbInstance = freshDb;

      // Persist to disk if directory is writable
      persistDb();
      return dbInstance;
    })();
  }
  return initPromise;
}

// Trigger eager initialization
getDb().catch((err) => console.error('[DB] Eager init failed:', err));

function persistDb(): void {
  if (!dbInstance) return;
  try {
    const exported = dbInstance.export();
    fs.mkdirSync(path.dirname(RUNTIME_DB_PATH), { recursive: true });
    fs.writeFileSync(RUNTIME_DB_PATH, Buffer.from(exported));
  } catch {
    // Non-fatal if filesystem is read-only
  }
}

// Open (or return) the SQLite database interface
function openDb(): UniversalDb {
  if (!dbInstance) {
    throw new Error('Database not initialized yet.');
  }
  return {
    exec: (sql: string) => {
      dbInstance.run(sql);
      persistDb();
    },
    prepare: (sql: string) => {
      return {
        all: () => {
          const res = dbInstance.exec(sql);
          if (!res || res.length === 0) return [];
          const { columns, values } = res[0];
          return values.map((row: any[]) => {
            const obj: Record<string, any> = {};
            columns.forEach((col: string, idx: number) => {
              obj[col] = row[idx];
            });
            return obj;
          });
        },
        get: () => {
          const res = dbInstance.exec(sql);
          if (!res || res.length === 0 || res[0].values.length === 0) return undefined;
          const { columns, values } = res[0];
          const obj: Record<string, any> = {};
          columns.forEach((col: string, idx: number) => {
            obj[col] = values[0][idx];
          });
          return obj;
        },
        run: () => {
          dbInstance.run(sql);
          persistDb();
          return {};
        },
      };
    },
    close: () => {},
  };
}

// CORS & Preflight Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Vercel Path Normalization Middleware
// Ensures req.url is properly resolved if Vercel serverless rewrites pass original paths
app.use((req, _res, next) => {
  const matchedPath = req.headers['x-matched-path'] as string;
  if (matchedPath && matchedPath.startsWith('/api') && (req.url === '/' || req.url === '/api')) {
    req.url = matchedPath;
  }
  next();
});

app.use(express.json());

// Database readiness middleware: guarantees DB is loaded before handling requests
app.use(async (_req, _res, next) => {
  try {
    await getDb();
    next();
  } catch (err: any) {
    console.error('Database connection error:', err);
    next(err);
  }
});

// Helper function to safely execute SQLite SELECT queries returning rows
function executeSqlJson(query: string): any[] {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  const res = dbInstance.exec(query);
  if (!res || res.length === 0) return [];
  const { columns, values } = res[0];
  return values.map((row: any[]) => {
    const obj: Record<string, any> = {};
    columns.forEach((col: string, idx: number) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// Helper to run non-SELECT or DDL statements
function executeSqlStatement(statement: string): void {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  dbInstance.run(statement);
  persistDb();
}

const api = express.Router();

// Health Check & Root API Endpoints
api.get('/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', service: 'ParkEase API', timestamp: new Date().toISOString() });
});

api.get('/', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    service: 'ParkEase Smart Parking Management System API',
    endpoints: [
      '/api/centres',
      '/api/slots/:centreId',
      '/api/tickets',
      '/api/users/login',
      '/api/users/register',
      '/api/users/:userId/dashboard',
      '/api/users/:userId/vehicles',
      '/api/reports/occupancy',
      '/api/reports/revenue',
      '/api/reports/transactions',
      '/api/db/query',
      '/api/db/schema'
    ]
  });
});

// -----------------------------------------------------------------------------
// 1. DBMS & SQL API Endpoints
// -----------------------------------------------------------------------------

// Live SQL Query Executor (DBMS Studio)
api.post('/db/query', (req: Request, res: Response) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'SQL query string required' });
  }

  const startTime = Date.now();
  const trimmed = sql.trim();
  const isSelect = /^(SELECT|PRAGMA|EXPLAIN|WITH)/i.test(trimmed);

  try {
    if (isSelect) {
      const rows = executeSqlJson(trimmed);
      const executionTimeMs = Date.now() - startTime;
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      return res.json({
        success: true,
        isSelect: true,
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs,
      });
    } else {
      executeSqlStatement(trimmed);
      const executionTimeMs = Date.now() - startTime;
      return res.json({
        success: true,
        isSelect: false,
        message: 'Statement executed successfully',
        executionTimeMs,
      });
    }
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message,
      executionTimeMs: Date.now() - startTime,
    });
  }
});

// Database Schema Inspector (Tables, Views, Triggers, Columns, Row Counts)
api.get('/db/schema', (_req: Request, res: Response) => {
  try {
    const tables = executeSqlJson(`
      SELECT name, type, sql 
      FROM sqlite_master 
      WHERE type IN ('table', 'view', 'trigger') AND name NOT LIKE 'sqlite_%'
      ORDER BY type, name;
    `);

    // Get row counts for tables
    const tableCounts: Record<string, number> = {};
    for (const item of tables) {
      if (item.type === 'table') {
        try {
          const countRes = executeSqlJson(`SELECT count(*) as count FROM "${item.name}";`);
          tableCounts[item.name] = countRes[0]?.count ?? 0;
        } catch {
          tableCounts[item.name] = 0;
        }
      }
    }

    const schemaDdl = SCHEMA_SQL;

    return res.json({
      success: true,
      tables,
      tableCounts,
      schemaDdl,
      dbPath: RUNTIME_DB_PATH,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Reset Database to Fresh Initial Seed
api.post('/db/reset', async (_req: Request, res: Response) => {
  try {
    const initSqlJs = require('sql.js/dist/sql-wasm-inline.js');
    const SQL = await initSqlJs();
    const freshDb = new SQL.Database();
    freshDb.run(SCHEMA_SQL);
    freshDb.run(SEED_SQL);
    dbInstance = freshDb;
    persistDb();
    return res.json({ success: true, message: 'SQLite database reset to initial 50 slots state.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// 2. User Management Module Endpoints
// -----------------------------------------------------------------------------

// Register New User
api.post('/users/register', (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Full name is required.' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email address is required.' });
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    return res.status(400).json({ success: false, error: 'Valid phone number is required (min 7 digits).' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  try {
    const existingEmail = executeSqlJson(`SELECT user_id FROM users WHERE LOWER(email) = '${cleanEmail.replace(/'/g, "''")}' LIMIT 1;`);
    if (existingEmail.length > 0) {
      return res.status(400).json({ success: false, error: `An account with email '${cleanEmail}' already exists.` });
    }

    const existingPhone = executeSqlJson(`SELECT user_id FROM users WHERE phone = '${cleanPhone.replace(/'/g, "''")}' LIMIT 1;`);
    if (existingPhone.length > 0) {
      return res.status(400).json({ success: false, error: `An account with phone number '${cleanPhone}' already exists.` });
    }

    const hashedPassword = hashPassword(password);
    executeSqlStatement(`
      INSERT INTO users (name, email, phone, password_hash)
      VALUES ('${cleanName.replace(/'/g, "''")}', '${cleanEmail.replace(/'/g, "''")}', '${cleanPhone.replace(/'/g, "''")}', '${hashedPassword}');
    `);

    const newUser = executeSqlJson(`SELECT user_id, name, email, phone, created_at FROM users WHERE email = '${cleanEmail.replace(/'/g, "''")}' LIMIT 1;`);
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      user: newUser[0],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// User Login & Authentication
api.post('/users/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const hashedPassword = hashPassword(String(password));

  try {
    const users = executeSqlJson(`
      SELECT user_id, name, email, phone, password_hash, created_at 
      FROM users 
      WHERE LOWER(email) = '${cleanEmail.replace(/'/g, "''")}' 
      LIMIT 1;
    `);

    if (users.length === 0 || users[0].password_hash !== hashedPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password. Please verify your credentials.' });
    }

    const user = {
      userId: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      phone: users[0].phone,
      createdAt: users[0].created_at,
    };

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get User Profile
api.get('/users/:userId/profile', (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const users = executeSqlJson(`SELECT user_id, name, email, phone, created_at FROM users WHERE user_id = ${parseInt(userId, 10)} LIMIT 1;`);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    return res.json({ success: true, user: users[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Update User Profile
api.put('/users/:userId/profile', (req: Request, res: Response) => {
  const { userId } = req.params;
  const uid = parseInt(userId, 10);
  const { name, email, phone } = req.body || {};

  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, error: 'Name, email and phone are all required.' });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPhone = String(phone).trim();

  try {
    const dupEmail = executeSqlJson(`SELECT user_id FROM users WHERE LOWER(email) = '${cleanEmail.replace(/'/g, "''")}' AND user_id != ${uid} LIMIT 1;`);
    if (dupEmail.length > 0) {
      return res.status(400).json({ success: false, error: 'Email is already in use by another account.' });
    }

    const dupPhone = executeSqlJson(`SELECT user_id FROM users WHERE phone = '${cleanPhone.replace(/'/g, "''")}' AND user_id != ${uid} LIMIT 1;`);
    if (dupPhone.length > 0) {
      return res.status(400).json({ success: false, error: 'Phone number is already in use by another account.' });
    }

    executeSqlStatement(`
      UPDATE users 
      SET name = '${cleanName.replace(/'/g, "''")}', email = '${cleanEmail.replace(/'/g, "''")}', phone = '${cleanPhone.replace(/'/g, "''")}' 
      WHERE user_id = ${uid};
    `);

    const updated = executeSqlJson(`SELECT user_id, name, email, phone, created_at FROM users WHERE user_id = ${uid} LIMIT 1;`);
    return res.json({ success: true, message: 'Profile updated successfully!', user: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Change Password
api.put('/users/:userId/password', (req: Request, res: Response) => {
  const { userId } = req.params;
  const uid = parseInt(userId, 10);
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
  }

  try {
    const users = executeSqlJson(`SELECT password_hash FROM users WHERE user_id = ${uid} LIMIT 1;`);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (users[0].password_hash !== hashPassword(String(currentPassword))) {
      return res.status(400).json({ success: false, error: 'Incorrect current password.' });
    }

    const newHash = hashPassword(String(newPassword));
    executeSqlStatement(`UPDATE users SET password_hash = '${newHash}' WHERE user_id = ${uid};`);
    return res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Get User's Vehicles
api.get('/users/:userId/vehicles', (req: Request, res: Response) => {
  const { userId } = req.params;
  const uid = parseInt(userId, 10);
  try {
    const vehicles = executeSqlJson(`SELECT * FROM vehicles WHERE user_id = ${uid} ORDER BY created_at DESC;`);
    return res.json({ success: true, vehicles });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Register New Vehicle for User
api.post('/users/:userId/vehicles', (req: Request, res: Response) => {
  const { userId } = req.params;
  const uid = parseInt(userId, 10);
  const { vehicleNumber, vehicleType } = req.body || {};

  if (!vehicleNumber || !vehicleType) {
    return res.status(400).json({ success: false, error: 'Vehicle number and type are required.' });
  }

  const cleanPlate = String(vehicleNumber).trim().toUpperCase();
  const cleanType = String(vehicleType).trim();

  try {
    const dup = executeSqlJson(`SELECT vehicle_id FROM vehicles WHERE UPPER(REPLACE(vehicle_number, ' ', '')) = '${cleanPlate.replace(/\s+/g, '')}' LIMIT 1;`);
    if (dup.length > 0) {
      return res.status(400).json({ success: false, error: `Vehicle number '${cleanPlate}' is already registered in the system.` });
    }

    executeSqlStatement(`
      INSERT INTO vehicles (user_id, vehicle_number, vehicle_type) 
      VALUES (${uid}, '${cleanPlate.replace(/'/g, "''")}', '${cleanType.replace(/'/g, "''")}');
    `);

    const created = executeSqlJson(`SELECT * FROM vehicles WHERE user_id = ${uid} AND vehicle_number = '${cleanPlate.replace(/'/g, "''")}' LIMIT 1;`);
    return res.status(201).json({ success: true, message: 'Vehicle registered successfully!', vehicle: created[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Update User Vehicle
api.put('/users/:userId/vehicles/:vehicleId', (req: Request, res: Response) => {
  const { userId, vehicleId } = req.params;
  const uid = parseInt(userId, 10);
  const vid = parseInt(vehicleId, 10);
  const { vehicleNumber, vehicleType } = req.body || {};

  if (!vehicleNumber || !vehicleType) {
    return res.status(400).json({ success: false, error: 'Vehicle number and type are required.' });
  }

  const cleanPlate = String(vehicleNumber).trim().toUpperCase();
  const cleanType = String(vehicleType).trim();

  try {
    const dup = executeSqlJson(`SELECT vehicle_id FROM vehicles WHERE UPPER(REPLACE(vehicle_number, ' ', '')) = '${cleanPlate.replace(/\s+/g, '')}' AND vehicle_id != ${vid} LIMIT 1;`);
    if (dup.length > 0) {
      return res.status(400).json({ success: false, error: `Vehicle number '${cleanPlate}' is already registered to another vehicle.` });
    }

    executeSqlStatement(`
      UPDATE vehicles 
      SET vehicle_number = '${cleanPlate.replace(/'/g, "''")}', vehicle_type = '${cleanType.replace(/'/g, "''")}' 
      WHERE vehicle_id = ${vid} AND user_id = ${uid};
    `);

    const updated = executeSqlJson(`SELECT * FROM vehicles WHERE vehicle_id = ${vid} LIMIT 1;`);
    return res.json({ success: true, message: 'Vehicle details updated successfully!', vehicle: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete User Vehicle
api.delete('/users/:userId/vehicles/:vehicleId', (req: Request, res: Response) => {
  const { userId, vehicleId } = req.params;
  const uid = parseInt(userId, 10);
  const vid = parseInt(vehicleId, 10);
  try {
    executeSqlStatement(`DELETE FROM vehicles WHERE vehicle_id = ${vid} AND user_id = ${uid};`);
    return res.json({ success: true, message: 'Vehicle removed from your account.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Comprehensive User Dashboard Aggregator
api.get('/users/:userId/dashboard', (req: Request, res: Response) => {
  const { userId } = req.params;
  const uid = parseInt(userId, 10);
  try {
    const users = executeSqlJson(`SELECT user_id, name, email, phone, created_at FROM users WHERE user_id = ${uid} LIMIT 1;`);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    const user = users[0];

    const vehicles = executeSqlJson(`SELECT * FROM vehicles WHERE user_id = ${uid} ORDER BY created_at DESC;`);

    let plateFilter = '';
    if (vehicles.length > 0) {
      const platesList = vehicles.map((v: any) => `'${String(v.vehicle_number).replace(/'/g, "''")}'`).join(', ');
      plateFilter = `OR vehicle_number IN (${platesList})`;
    }

    const tickets = executeSqlJson(`
      SELECT t.*, c.name as centre_name, c.locality, c.city 
      FROM parking_tickets t 
      LEFT JOIN parking_centres c ON t.centre_id = c.id 
      WHERE (t.user_id = ${uid} ${plateFilter}) 
      ORDER BY t.created_at DESC;
    `);

    const activeTickets = tickets.filter((t: any) => t.status === 'ACTIVE');
    const historyTickets = tickets.filter((t: any) => t.status === 'EXITED');
    const totalSpent = historyTickets.reduce((sum: number, t: any) => sum + (Number(t.total_amount) || 0), 0);

    return res.json({
      success: true,
      user,
      vehicles,
      activeTickets,
      historyTickets,
      totalSpent,
      activeCount: activeTickets.length,
      historyCount: historyTickets.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------------------------------
// 3. Application Domain Endpoints (Centres, Slots, Tickets, Reports)
// -----------------------------------------------------------------------------

// Get All Parking Centres
api.get('/centres', (_req: Request, res: Response) => {
  try {
    const centres = executeSqlJson(`SELECT * FROM parking_centres ORDER BY name ASC;`);
    return res.json(centres);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get 50 Slots for a Parking Centre
api.get('/slots/:centreId', (req: Request, res: Response) => {
  const { centreId } = req.params;
  try {
    const slots = executeSqlJson(`
      SELECT * FROM parking_slots 
      WHERE centre_id = '${centreId.replace(/'/g, "''")}' 
      ORDER BY slot_number ASC;
    `);
    return res.json(slots);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Get All Active and Exited Tickets
api.get('/tickets', (req: Request, res: Response) => {
  const centreId = req.query.centreId as string;
  try {
    const where = centreId ? `WHERE centre_id = '${centreId.replace(/'/g, "''")}'` : '';
    const tickets = executeSqlJson(`SELECT * FROM parking_tickets ${where} ORDER BY created_at DESC;`);
    return res.json(tickets);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DBMS Analytical Reports Endpoints
api.get('/reports/occupancy', (_req: Request, res: Response) => {
  try {
    const report = executeSqlJson(`SELECT * FROM v_centre_occupancy;`);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

api.get('/reports/revenue', (_req: Request, res: Response) => {
  try {
    const report = executeSqlJson(`SELECT * FROM v_revenue_by_vehicle;`);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

api.get('/reports/transactions', (_req: Request, res: Response) => {
  try {
    const report = executeSqlJson(`SELECT * FROM v_recent_transactions;`);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Mount router on both '/api' (standard prefix) and '/' (in case of Vercel path rewrites)
app.use('/api', api);
app.use(api);

export { getDb, openDb, executeSqlJson, executeSqlStatement, RUNTIME_DB_PATH, persistDb };
export default app;
