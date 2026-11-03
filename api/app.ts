import express, { Request, Response } from 'express';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const app = express();
const IS_VERCEL = Boolean(process.env.VERCEL);
const SEED_DB_PATH = path.resolve(process.cwd(), 'database', 'parking_system.db');
const RUNTIME_DB_PATH = IS_VERCEL ? path.join('/tmp', 'parking_system.db') : SEED_DB_PATH;
const SCHEMA_PATH = path.resolve(process.cwd(), 'database', 'seed.sql');
const SALT = 'ParkEase_Secure_Salt_2026_DBMS';

// On Vercel serverless environments, copy seed database to writable /tmp directory
function ensureRuntimeDatabase() {
  if (IS_VERCEL && !fs.existsSync(RUNTIME_DB_PATH)) {
    try {
      if (fs.existsSync(SEED_DB_PATH)) {
        fs.copyFileSync(SEED_DB_PATH, RUNTIME_DB_PATH);
      }
    } catch (err) {
      console.warn('[Vercel SQLite] Seed DB copy to /tmp failed, will create new DB:', err);
    }
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SALT).digest('hex');
}

interface UniversalDb {
  exec(sql: string): void;
  prepare(sql: string): { all(): any[]; get?(): any; run?(): any };
  close(): void;
}

// Open (or create) the SQLite database using better-sqlite3 or Node.js built-in node:sqlite
function openDb(): UniversalDb {
  ensureRuntimeDatabase();
  try {
    const BetterSqlite = require('better-sqlite3');
    const test = new BetterSqlite(':memory:');
    test.close();
    return new BetterSqlite(RUNTIME_DB_PATH);
  } catch {
    const { DatabaseSync } = require('node:sqlite');
    const syncDb = new DatabaseSync(RUNTIME_DB_PATH);
    return {
      exec: (sql: string) => syncDb.exec(sql),
      prepare: (sql: string) => {
        const stmt = syncDb.prepare(sql);
        return {
          all: () => stmt.all() as any[],
          get: () => stmt.get() as any,
          run: () => stmt.run() as any,
        };
      },
      close: () => syncDb.close(),
    };
  }
}

app.use(express.json());

// Helper function to safely execute SQLite SELECT queries returning rows
function executeSqlJson(query: string): any[] {
  const db = openDb();
  try {
    const stmt = db.prepare(query);
    return stmt.all() as any[];
  } catch (err: any) {
    throw new Error(err.message || 'SQLite query execution failed');
  } finally {
    db.close();
  }
}

// Helper to run non-SELECT or DDL statements
function executeSqlStatement(statement: string): void {
  const db = openDb();
  try {
    db.exec(statement);
  } catch (err: any) {
    throw new Error(err.message || 'SQLite statement failed');
  } finally {
    db.close();
  }
}

const api = express.Router();

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

    const schemaDdl = fs.existsSync(SCHEMA_PATH) ? fs.readFileSync(SCHEMA_PATH, 'utf-8') : '';

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
api.post('/db/reset', (_req: Request, res: Response) => {
  try {
    execSync('node scripts/init_database.js', { encoding: 'utf-8', cwd: process.cwd() });
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

export { openDb, executeSqlJson, executeSqlStatement, RUNTIME_DB_PATH };
export default app;
