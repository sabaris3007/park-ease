-- ===================================================================
-- PARKEASE: SMART PARKING LOT MANAGEMENT SYSTEM
-- Coursework Project: JAVA & DBMS (Database Management Systems)
-- Native Target Engine: MySQL 8.0+ (InnoDB)
-- Driver: MySQL Connector/J (com.mysql.cj.jdbc.Driver)
-- ===================================================================

CREATE DATABASE IF NOT EXISTS parking_system_db;
USE parking_system_db;

-- -------------------------------------------------------------------
-- 1. USERS TABLE (User Management Module)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 2. VEHICLES TABLE (User Vehicle Management)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_type ENUM('Car', 'Bike', 'Truck', 'Bus') NOT NULL DEFAULT 'Car',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 3. PARKING CENTRES TABLE (Master Entity)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parking_centres (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(80) NOT NULL,
    locality VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    landmark VARCHAR(150),
    phone VARCHAR(30),
    total_slots INT NOT NULL DEFAULT 50,
    rating DECIMAL(2,1) DEFAULT 4.5,
    reviews_count INT DEFAULT 120,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    opening_hours VARCHAR(50) DEFAULT '24 Hours Open',
    is_24x7 TINYINT(1) DEFAULT 1,
    tariff_bike DECIMAL(8, 2) NOT NULL DEFAULT 20.0,
    tariff_car DECIMAL(8, 2) NOT NULL DEFAULT 40.0,
    tariff_truck DECIMAL(8, 2) NOT NULL DEFAULT 80.0,
    amenities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 4. VEHICLE TARIFFS TABLE
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_tariffs (
    vehicle_type VARCHAR(30) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(8, 2) NOT NULL,
    slots_required INT NOT NULL DEFAULT 1,
    icon_name VARCHAR(50),
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 5. PARKING SLOTS TABLE (50 Slots per Centre)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parking_slots (
    id VARCHAR(80) PRIMARY KEY, -- {centre_id}-S{slot_number}
    centre_id VARCHAR(50) NOT NULL,
    slot_number INT NOT NULL,
    floor_level INT NOT NULL DEFAULT 1,
    is_occupied TINYINT(1) NOT NULL DEFAULT 0,
    occupied_ticket_id VARCHAR(50),
    occupied_vehicle_type VARCHAR(30),
    occupied_plate_number VARCHAR(30),
    occupied_owner_name VARCHAR(100),
    occupied_entry_time TIMESTAMP NULL,
    is_primary_slot TINYINT(1) DEFAULT 0,
    companion_slot INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_slot_centre FOREIGN KEY (centre_id) REFERENCES parking_centres(id) ON DELETE CASCADE,
    UNIQUE KEY uk_centre_slot (centre_id, slot_number),
    INDEX idx_slot_status (centre_id, is_occupied)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 6. PARKING TICKETS TABLE (Transaction Entity)
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parking_tickets (
    ticket_id VARCHAR(50) PRIMARY KEY,
    centre_id VARCHAR(50) NOT NULL,
    user_id INT NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    vehicle_type ENUM('Bike', 'Car', 'Truck') NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    allocated_slots_json VARCHAR(255) NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP NULL,
    duration_hours DECIMAL(6, 2) NULL,
    billable_hours INT NULL,
    hourly_rate DECIMAL(8, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NULL,
    status ENUM('ACTIVE', 'EXITED') NOT NULL DEFAULT 'ACTIVE',
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_centre FOREIGN KEY (centre_id) REFERENCES parking_centres(id),
    CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_ticket_centre_status (centre_id, status),
    INDEX idx_ticket_vehicle (vehicle_number),
    INDEX idx_ticket_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 7. AUDIT / ACTIVITY LOGS TABLE
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    centre_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_type VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(30),
    plate_number VARCHAR(30),
    slot_number INT,
    amount DECIMAL(10, 2),
    details TEXT,
    CONSTRAINT fk_log_centre FOREIGN KEY (centre_id) REFERENCES parking_centres(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 8. RELATIONAL ANALYTICAL VIEWS
-- -------------------------------------------------------------------

CREATE OR REPLACE VIEW v_centre_occupancy AS
SELECT 
    c.id AS centre_id,
    c.name AS centre_name,
    c.city,
    c.total_slots,
    COUNT(CASE WHEN s.is_occupied = 1 THEN 1 END) AS occupied_slots,
    (c.total_slots - COUNT(CASE WHEN s.is_occupied = 1 THEN 1 END)) AS available_slots,
    ROUND((COUNT(CASE WHEN s.is_occupied = 1 THEN 1 END) / c.total_slots) * 100.0, 1) AS occupancy_rate_pct,
    COALESCE(SUM(t.total_amount), 0.0) AS total_revenue
FROM parking_centres c
LEFT JOIN parking_slots s ON c.id = s.centre_id
LEFT JOIN parking_tickets t ON c.id = t.centre_id AND t.status = 'EXITED'
GROUP BY c.id, c.name, c.city, c.total_slots;

CREATE OR REPLACE VIEW v_revenue_by_vehicle AS
SELECT 
    vehicle_type,
    COUNT(ticket_id) AS total_trips,
    ROUND(AVG(duration_hours), 2) AS avg_duration_hours,
    ROUND(SUM(total_amount), 2) AS total_revenue
FROM parking_tickets
WHERE status = 'EXITED'
GROUP BY vehicle_type;

-- -------------------------------------------------------------------
-- 9. SAMPLE SEED DATA FOR MYSQL
-- -------------------------------------------------------------------

-- Sample Users (Passwords hashed with SHA-256 + salt "ParkEase_Secure_Salt_2026_DBMS")
-- 'Password@123' -> 'b67c268800b329432fba557fc99577c223c7f9999a8cb404c10c1c8f61feaaef'
INSERT IGNORE INTO users (user_id, name, email, phone, password_hash) VALUES
(1, 'Kavitha R.', 'kavitha@example.com', '+91 98401 11223', 'b67c268800b329432fba557fc99577c223c7f9999a8cb404c10c1c8f61feaaef'),
(2, 'Rajesh Kumar', 'rajesh@example.com', '+91 98402 33445', 'b67c268800b329432fba557fc99577c223c7f9999a8cb404c10c1c8f61feaaef'),
(3, 'Dr. Arvind Swamy', 'arvind@example.com', '+91 98403 55667', 'b67c268800b329432fba557fc99577c223c7f9999a8cb404c10c1c8f61feaaef');

-- Sample User Vehicles
INSERT IGNORE INTO vehicles (vehicle_id, user_id, vehicle_number, vehicle_type) VALUES
(1, 1, 'TN 38 BH 1234', 'Bike'),
(2, 2, 'TN 38 AZ 5678', 'Car'),
(3, 3, 'TN 38 AA 9999', 'Car'),
(4, 1, 'TN 38 CD 4321', 'Car');
