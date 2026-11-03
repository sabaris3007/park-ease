import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Universal SQLite connection: uses better-sqlite3 if native binding is available,
// otherwise falls back to Node.js built-in node:sqlite (zero dependency, cross-platform)
function getDatabase(dbFilePath) {
  try {
    const BetterSqlite = require('better-sqlite3');
    const test = new BetterSqlite(':memory:');
    test.close();
    return new BetterSqlite(dbFilePath);
  } catch {
    const { DatabaseSync } = require('node:sqlite');
    const syncDb = new DatabaseSync(dbFilePath);
    return {
      exec: (sql) => syncDb.exec(sql),
      prepare: (sql) => {
        const stmt = syncDb.prepare(sql);
        return {
          all: (...args) => stmt.all(...args),
          get: (...args) => stmt.get(...args),
          run: (...args) => stmt.run(...args),
        };
      },
      close: () => syncDb.close(),
    };
  }
}

const ROOT_DIR = process.cwd();
const DB_PATH = path.join(ROOT_DIR, 'database', 'parking_system.db');
const SCHEMA_PATH = path.join(ROOT_DIR, 'java-backend', 'schema.sql');
const SEED_SQL_PATH = path.join(ROOT_DIR, 'database', 'seed.sql');

console.log('--- Initializing SQLite Database for ParkEase Java & DBMS Project ---');
console.log('Database path:', DB_PATH);
console.log('Schema path:', SCHEMA_PATH);

fs.mkdirSync(path.join(ROOT_DIR, 'database'), { recursive: true });

// 2. Generate Seed SQL
let seedSql = `
-- Insert Vehicle Tariffs
INSERT INTO vehicle_tariffs (vehicle_type, display_name, hourly_rate, slots_required, icon_name, description) VALUES
('Bike', 'Two Wheeler (Motorcycle / Scooter)', 10.0, 1, 'Bike', 'Requires single compact slot'),
('Car', 'Four Wheeler (Sedan / SUV / Hatchback)', 30.0, 1, 'Car', 'Standard passenger vehicle bay'),
('Truck', 'Heavy Vehicle (Truck / Bus / Van)', 60.0, 2, 'Truck', 'Requires 2 tandem adjacent slots');

-- Insert Seed Users (Password: 'Password@123', hashed with SHA-256 + salt)
INSERT INTO users (user_id, name, email, phone, password_hash) VALUES
(1, 'Kavitha R.', 'kavitha@example.com', '+91 98401 11223', '110e31e4c1177048876b34d1f90b2c6fa2dfb0f36423e078926388586d41adc8'),
(2, 'Rajesh Kumar', 'rajesh@example.com', '+91 98402 33445', '110e31e4c1177048876b34d1f90b2c6fa2dfb0f36423e078926388586d41adc8'),
(3, 'Dr. Arvind Swamy', 'arvind@example.com', '+91 98403 55667', '110e31e4c1177048876b34d1f90b2c6fa2dfb0f36423e078926388586d41adc8');

-- Insert Seed Vehicles
INSERT INTO vehicles (vehicle_id, user_id, vehicle_number, vehicle_type) VALUES
(1, 1, 'TN 38 BH 1234', 'Bike'),
(2, 2, 'TN 38 AZ 5678', 'Car'),
(3, 3, 'TN 38 AA 9999', 'Car'),
(4, 1, 'TN 38 CD 4321', 'Car');

-- Insert Parking Centres
INSERT INTO parking_centres (id, name, city, locality, address, landmark, phone, total_slots, rating, reviews_count, latitude, longitude, opening_hours, is_24x7, tariff_bike, tariff_car, tariff_truck, amenities) VALUES
('cbe-gandhipuram', 'Gandhipuram Central Plaza', 'Coimbatore', 'Gandhipuram', 'Cross Cut Road, Opp. Central Bus Stand', 'Near Gandhipuram Signal & Bus Terminal', '+91 422 249 1001', 50, 4.8, 384, 11.0183, 76.9644, 'Open 24/7', 1, 10.0, 30.0, 60.0, 'Covered Parking, EV Fast Charging, CCTV 24/7, Boom Barrier, Valet Assist, Wheelchair Access'),
('cbe-brookefields', 'Brookefields Grand Multi-Level Garage', 'Coimbatore', 'RS Puram', '67-71, Dr Krishnasamy Mudaliar Rd, Brookefields', 'Adjacent to Brookefields Mall North Gate', '+91 422 254 2200', 50, 4.9, 512, 11.0085, 76.9575, '07:00 AM - 11:30 PM', 0, 10.0, 30.0, 60.0, 'Mall Direct Access, EV Charging, Automated Boom, Security Patrol, Air Pump'),
('cbe-airport', 'Airport Terminal Smart Parking', 'Coimbatore', 'Civil Aerodrome', 'Avinashi Road, Peelamedu', 'Terminal Departure Forecourt T1', '+91 422 257 1956', 50, 4.7, 420, 11.0298, 77.0434, 'Open 24/7', 1, 10.0, 30.0, 60.0, 'Long-term Parking, Flight Displays, Luggage Trolleys, FastTag Support'),
('cbe-funmall', 'Fun Republic Mall Parking Deck', 'Coimbatore', 'Peelamedu', 'Avinashi Road, Near Krishnammal College', 'Opposite PSG Tech Campus', '+91 422 452 7000', 50, 4.6, 290, 11.0242, 77.0028, '09:00 AM - 11:00 PM', 0, 10.0, 30.0, 60.0, 'Cinemas Direct Elevator, Multi-level ramps, Car Spa, Disabled bays'),
('cbe-railway', 'Coimbatore Junction Multi-Tier Transit Hub', 'Coimbatore', 'Town Hall', 'Station Road, Gopalapuram', 'Opposite Railway Main Concourse Gate 2', '+91 422 230 0110', 50, 4.5, 680, 10.9984, 76.9658, 'Open 24/7', 1, 10.0, 30.0, 60.0, '24/7 Express Entry, 2-Wheeler Shed, Platform Overbridge Link, UPI Gates'),
('cbe-prozone', 'Prozone Mall Mega Parking Arena', 'Coimbatore', 'Saravanampatti', 'Sathy Road, Sivanandapuram', 'Near Prozone Celebration Mall Entry 3', '+91 422 662 8100', 50, 4.8, 350, 11.0560, 76.9950, '10:00 AM - 10:30 PM', 0, 10.0, 30.0, 60.0, '1000+ Capacity grounds, EV Supercharger, Valet desk, Family bays');
`;

// Insert 50 slots for each centre
const centreIds = [
  'cbe-gandhipuram',
  'cbe-brookefields',
  'cbe-airport',
  'cbe-funmall',
  'cbe-railway',
  'cbe-prozone'
];

for (const cId of centreIds) {
  for (let s = 1; s <= 50; s++) {
    const floor = s <= 25 ? 1 : 2;
    seedSql += `\nINSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('${cId}-S${s}', '${cId}', ${s}, ${floor}, 0);`;
  }
}

// Pre-occupy a few slots in Gandhipuram for realistic initial state
seedSql += `
-- Occupy Slot 1: Bike
UPDATE parking_slots SET 
  is_occupied = 1,
  occupied_ticket_id = 'T-1001',
  occupied_vehicle_type = 'Bike',
  occupied_plate_number = 'TN 38 BH 1234',
  occupied_owner_name = 'Kavitha R.',
  occupied_entry_time = '2026-10-18 08:30:00',
  is_primary_slot = 1
WHERE id = 'cbe-gandhipuram-S1';

INSERT INTO parking_tickets (ticket_id, centre_id, user_id, vehicle_number, vehicle_type, owner_name, allocated_slots_json, entry_time, hourly_rate, status)
VALUES ('T-1001', 'cbe-gandhipuram', 1, 'TN 38 BH 1234', 'Bike', 'Kavitha R.', '[1]', '2026-10-18 08:30:00', 10.0, 'ACTIVE');

-- Occupy Slot 3 & 4: Truck (Tandem)
UPDATE parking_slots SET 
  is_occupied = 1,
  occupied_ticket_id = 'T-1002',
  occupied_vehicle_type = 'Truck',
  occupied_plate_number = 'TN 37 TR 8899',
  occupied_owner_name = 'Sundaram Logistics',
  occupied_entry_time = '2026-10-18 09:15:00',
  is_primary_slot = 1,
  companion_slot = 4
WHERE id = 'cbe-gandhipuram-S3';

UPDATE parking_slots SET 
  is_occupied = 1,
  occupied_ticket_id = 'T-1002',
  occupied_vehicle_type = 'Truck',
  occupied_plate_number = 'TN 37 TR 8899',
  occupied_owner_name = 'Sundaram Logistics',
  occupied_entry_time = '2026-10-18 09:15:00',
  is_primary_slot = 0,
  companion_slot = 3
WHERE id = 'cbe-gandhipuram-S4';

INSERT INTO parking_tickets (ticket_id, centre_id, vehicle_number, vehicle_type, owner_name, allocated_slots_json, entry_time, hourly_rate, status)
VALUES ('T-1002', 'cbe-gandhipuram', 'TN 37 TR 8899', 'Truck', 'Sundaram Logistics', '[3, 4]', '2026-10-18 09:15:00', 60.0, 'ACTIVE');

-- Occupy Slot 7: Car
UPDATE parking_slots SET 
  is_occupied = 1,
  occupied_ticket_id = 'T-1003',
  occupied_vehicle_type = 'Car',
  occupied_plate_number = 'TN 38 AZ 5678',
  occupied_owner_name = 'Rajesh Kumar',
  occupied_entry_time = '2026-10-18 09:45:00',
  is_primary_slot = 1
WHERE id = 'cbe-gandhipuram-S7';

INSERT INTO parking_tickets (ticket_id, centre_id, user_id, vehicle_number, vehicle_type, owner_name, allocated_slots_json, entry_time, hourly_rate, status)
VALUES ('T-1003', 'cbe-gandhipuram', 2, 'TN 38 AZ 5678', 'Car', 'Rajesh Kumar', '[7]', '2026-10-18 09:45:00', 30.0, 'ACTIVE');

-- Add completed historical tickets to demonstrate DBMS analytical queries and reports
INSERT INTO parking_tickets (ticket_id, centre_id, user_id, vehicle_number, vehicle_type, owner_name, allocated_slots_json, entry_time, exit_time, duration_hours, billable_hours, hourly_rate, total_amount, status, notes)
VALUES 
('T-0980', 'cbe-gandhipuram', 3, 'TN 38 AA 9999', 'Car', 'Dr. Arvind Swamy', '[5]', '2026-10-18 06:00:00', '2026-10-18 08:30:00', 2.5, 3, 30.0, 90.0, 'EXITED', 'Paid via FastTag'),
('T-0981', 'cbe-gandhipuram', NULL, 'TN 37 CC 1122', 'Bike', 'Vimal Nathan', '[2]', '2026-10-18 07:10:00', '2026-10-18 08:40:00', 1.5, 2, 10.0, 20.0, 'EXITED', 'Paid via UPI'),
('T-0982', 'cbe-gandhipuram', NULL, 'TN 33 ZZ 4455', 'Truck', 'Apex Cargo Movers', '[9, 10]', '2026-10-17 22:00:00', '2026-10-18 06:00:00', 8.0, 8, 60.0, 480.0, 'EXITED', 'Overnight cargo docking');
`;

fs.writeFileSync(SEED_SQL_PATH, seedSql);

// Delete old DB if exists, then create fresh via better-sqlite3 (no sqlite3 CLI needed)
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

const db = getDatabase(DB_PATH);

// Execute schema DDL
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schemaSql);

// Execute seed data
db.exec(seedSql);

// Print summary
const centres = db.prepare("SELECT count(*) as count FROM parking_centres").get();
const slots = db.prepare("SELECT count(*) as count FROM parking_slots").get();
const tickets = db.prepare("SELECT count(*) as count FROM parking_tickets").get();

db.close();

console.log('Database created successfully at ' + DB_PATH);
console.log(`DB Summary:\nCentres: ${centres.count}\nSlots:   ${slots.count}\nTickets: ${tickets.count}`);
