-- ===================================================================
-- PARKEASE: SMART PARKING MANAGEMENT SYSTEM
-- Integrated Coursework Project: JAVA & DATABASE MANAGEMENT SYSTEMS (DBMS)
-- Database Engine: SQLite / SQL Relational Database
-- ===================================================================

PRAGMA foreign_keys = ON;

-- Drop existing tables/views if resetting
DROP VIEW IF EXISTS v_revenue_by_vehicle;
DROP VIEW IF EXISTS v_recent_transactions;
DROP VIEW IF EXISTS v_centre_occupancy;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS parking_tickets;
DROP TABLE IF EXISTS parking_slots;
DROP TABLE IF EXISTS vehicle_tariffs;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS parking_centres;

-- -------------------------------------------------------------------
-- 0. USERS & VEHICLES TABLES (User Management Module)
-- -------------------------------------------------------------------
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_number TEXT UNIQUE NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('Car', 'Bike', 'Truck', 'Bus')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_vehicle_user ON vehicles(user_id);
CREATE INDEX idx_vehicle_plate ON vehicles(vehicle_number);

-- -------------------------------------------------------------------
-- 1. PARKING CENTRES TABLE (Master Entity)
-- -------------------------------------------------------------------
CREATE TABLE parking_centres (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    locality TEXT NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    phone TEXT,
    total_slots INTEGER NOT NULL DEFAULT 50,
    rating REAL DEFAULT 4.5,
    reviews_count INTEGER DEFAULT 120,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    opening_hours TEXT DEFAULT '24 Hours Open',
    is_24x7 INTEGER DEFAULT 1,
    tariff_bike REAL NOT NULL DEFAULT 20.0,
    tariff_car REAL NOT NULL DEFAULT 40.0,
    tariff_truck REAL NOT NULL DEFAULT 80.0,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------
-- 2. VEHICLE TARIFFS TABLE
-- -------------------------------------------------------------------
CREATE TABLE vehicle_tariffs (
    vehicle_type TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    hourly_rate REAL NOT NULL,
    slots_required INTEGER NOT NULL DEFAULT 1,
    icon_name TEXT,
    description TEXT
);

-- -------------------------------------------------------------------
-- 3. PARKING SLOTS TABLE (50 Slots per Centre, with floor & coordinates)
-- -------------------------------------------------------------------
CREATE TABLE parking_slots (
    id TEXT PRIMARY KEY, -- Format: {centre_id}-S{slot_number}
    centre_id TEXT NOT NULL,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 50),
    floor_level INTEGER NOT NULL DEFAULT 1, -- Floor 1 (1-25), Floor 2 (26-50)
    is_occupied INTEGER NOT NULL DEFAULT 0 CHECK (is_occupied IN (0, 1)),
    occupied_ticket_id TEXT,
    occupied_vehicle_type TEXT,
    occupied_plate_number TEXT,
    occupied_owner_name TEXT,
    occupied_entry_time TIMESTAMP,
    is_primary_slot INTEGER DEFAULT 0,
    companion_slot INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (centre_id) REFERENCES parking_centres(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_centre_slot ON parking_slots(centre_id, slot_number);
CREATE INDEX idx_slot_status ON parking_slots(centre_id, is_occupied);

-- -------------------------------------------------------------------
-- 4. PARKING TICKETS TABLE (Transaction Entity)
-- -------------------------------------------------------------------
CREATE TABLE parking_tickets (
    ticket_id TEXT PRIMARY KEY,
    centre_id TEXT NOT NULL,
    user_id INTEGER,
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('Bike', 'Car', 'Truck')),
    owner_name TEXT NOT NULL,
    allocated_slots_json TEXT NOT NULL, -- JSON array of slots e.g. "[1]" or "[3, 4]"
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP,
    duration_hours REAL,
    billable_hours INTEGER,
    hourly_rate REAL NOT NULL,
    total_amount REAL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXITED')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (centre_id) REFERENCES parking_centres(id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_ticket_centre ON parking_tickets(centre_id, status);
CREATE INDEX idx_ticket_vehicle ON parking_tickets(vehicle_number);
CREATE INDEX idx_ticket_user ON parking_tickets(user_id);

-- -------------------------------------------------------------------
-- 5. ACTIVITY / AUDIT LOGS TABLE
-- -------------------------------------------------------------------
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    centre_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_type TEXT NOT NULL, -- 'PARK', 'EXIT', 'RESERVE', 'RESET'
    vehicle_type TEXT,
    plate_number TEXT,
    slot_number INTEGER,
    amount REAL,
    details TEXT,
    FOREIGN KEY (centre_id) REFERENCES parking_centres(id)
);

-- -------------------------------------------------------------------
-- 6. RELATIONAL VIEWS (DBMS Analytical Features)
-- -------------------------------------------------------------------

-- Centre Occupancy & Utilization View
CREATE VIEW v_centre_occupancy AS
SELECT 
    c.id AS centre_id,
    c.name AS centre_name,
    c.city,
    c.total_slots,
    COUNT(CASE WHEN s.is_occupied = 1 THEN 1 END) AS occupied_slots,
    (c.total_slots - COUNT(CASE WHEN s.is_occupied = 1 THEN 1 END)) AS available_slots,
    ROUND((CAST(COUNT(CASE WHEN s.is_occupied = 1 THEN 1 END) AS REAL) / c.total_slots) * 100.0, 1) AS occupancy_rate_pct,
    COALESCE(SUM(t.total_amount), 0.0) AS total_revenue
FROM parking_centres c
LEFT JOIN parking_slots s ON c.id = s.centre_id
LEFT JOIN parking_tickets t ON c.id = t.centre_id AND t.status = 'EXITED'
GROUP BY c.id;

-- Revenue by Vehicle Type View
CREATE VIEW v_revenue_by_vehicle AS
SELECT 
    vehicle_type,
    COUNT(ticket_id) AS total_trips,
    ROUND(AVG(duration_hours), 2) AS avg_duration_hours,
    ROUND(SUM(total_amount), 2) AS total_revenue
FROM parking_tickets
WHERE status = 'EXITED'
GROUP BY vehicle_type;

-- Recent Transactions View
CREATE VIEW v_recent_transactions AS
SELECT 
    t.ticket_id,
    c.name AS centre_name,
    t.vehicle_number,
    t.vehicle_type,
    t.owner_name,
    t.entry_time,
    t.exit_time,
    t.total_amount,
    t.status
FROM parking_tickets t
JOIN parking_centres c ON t.centre_id = c.id
ORDER BY t.created_at DESC
LIMIT 50;

-- -------------------------------------------------------------------
-- 7. DBMS TRIGGERS (Automated Audit Logging)
-- -------------------------------------------------------------------

CREATE TRIGGER trg_ticket_parked_audit
AFTER INSERT ON parking_tickets
BEGIN
    INSERT INTO activity_logs (centre_id, action_type, vehicle_type, plate_number, details)
    VALUES (NEW.centre_id, 'PARK', NEW.vehicle_type, NEW.vehicle_number, 'Allocated: ' || NEW.allocated_slots_json);
END;

CREATE TRIGGER trg_ticket_exited_audit
AFTER UPDATE OF status ON parking_tickets
WHEN NEW.status = 'EXITED' AND OLD.status = 'ACTIVE'
BEGIN
    INSERT INTO activity_logs (centre_id, action_type, vehicle_type, plate_number, amount, details)
    VALUES (NEW.centre_id, 'EXIT', NEW.vehicle_type, NEW.vehicle_number, NEW.total_amount, 'Exited after ' || ROUND(NEW.duration_hours, 1) || ' hrs. Billed: ₹' || NEW.total_amount);
END;
