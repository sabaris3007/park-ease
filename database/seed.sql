
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

INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S1', 'cbe-gandhipuram', 1, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S2', 'cbe-gandhipuram', 2, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S3', 'cbe-gandhipuram', 3, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S4', 'cbe-gandhipuram', 4, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S5', 'cbe-gandhipuram', 5, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S6', 'cbe-gandhipuram', 6, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S7', 'cbe-gandhipuram', 7, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S8', 'cbe-gandhipuram', 8, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S9', 'cbe-gandhipuram', 9, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S10', 'cbe-gandhipuram', 10, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S11', 'cbe-gandhipuram', 11, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S12', 'cbe-gandhipuram', 12, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S13', 'cbe-gandhipuram', 13, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S14', 'cbe-gandhipuram', 14, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S15', 'cbe-gandhipuram', 15, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S16', 'cbe-gandhipuram', 16, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S17', 'cbe-gandhipuram', 17, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S18', 'cbe-gandhipuram', 18, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S19', 'cbe-gandhipuram', 19, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S20', 'cbe-gandhipuram', 20, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S21', 'cbe-gandhipuram', 21, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S22', 'cbe-gandhipuram', 22, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S23', 'cbe-gandhipuram', 23, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S24', 'cbe-gandhipuram', 24, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S25', 'cbe-gandhipuram', 25, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S26', 'cbe-gandhipuram', 26, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S27', 'cbe-gandhipuram', 27, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S28', 'cbe-gandhipuram', 28, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S29', 'cbe-gandhipuram', 29, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S30', 'cbe-gandhipuram', 30, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S31', 'cbe-gandhipuram', 31, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S32', 'cbe-gandhipuram', 32, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S33', 'cbe-gandhipuram', 33, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S34', 'cbe-gandhipuram', 34, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S35', 'cbe-gandhipuram', 35, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S36', 'cbe-gandhipuram', 36, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S37', 'cbe-gandhipuram', 37, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S38', 'cbe-gandhipuram', 38, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S39', 'cbe-gandhipuram', 39, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S40', 'cbe-gandhipuram', 40, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S41', 'cbe-gandhipuram', 41, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S42', 'cbe-gandhipuram', 42, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S43', 'cbe-gandhipuram', 43, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S44', 'cbe-gandhipuram', 44, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S45', 'cbe-gandhipuram', 45, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S46', 'cbe-gandhipuram', 46, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S47', 'cbe-gandhipuram', 47, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S48', 'cbe-gandhipuram', 48, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S49', 'cbe-gandhipuram', 49, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-gandhipuram-S50', 'cbe-gandhipuram', 50, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S1', 'cbe-brookefields', 1, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S2', 'cbe-brookefields', 2, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S3', 'cbe-brookefields', 3, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S4', 'cbe-brookefields', 4, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S5', 'cbe-brookefields', 5, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S6', 'cbe-brookefields', 6, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S7', 'cbe-brookefields', 7, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S8', 'cbe-brookefields', 8, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S9', 'cbe-brookefields', 9, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S10', 'cbe-brookefields', 10, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S11', 'cbe-brookefields', 11, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S12', 'cbe-brookefields', 12, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S13', 'cbe-brookefields', 13, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S14', 'cbe-brookefields', 14, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S15', 'cbe-brookefields', 15, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S16', 'cbe-brookefields', 16, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S17', 'cbe-brookefields', 17, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S18', 'cbe-brookefields', 18, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S19', 'cbe-brookefields', 19, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S20', 'cbe-brookefields', 20, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S21', 'cbe-brookefields', 21, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S22', 'cbe-brookefields', 22, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S23', 'cbe-brookefields', 23, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S24', 'cbe-brookefields', 24, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S25', 'cbe-brookefields', 25, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S26', 'cbe-brookefields', 26, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S27', 'cbe-brookefields', 27, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S28', 'cbe-brookefields', 28, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S29', 'cbe-brookefields', 29, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S30', 'cbe-brookefields', 30, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S31', 'cbe-brookefields', 31, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S32', 'cbe-brookefields', 32, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S33', 'cbe-brookefields', 33, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S34', 'cbe-brookefields', 34, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S35', 'cbe-brookefields', 35, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S36', 'cbe-brookefields', 36, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S37', 'cbe-brookefields', 37, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S38', 'cbe-brookefields', 38, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S39', 'cbe-brookefields', 39, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S40', 'cbe-brookefields', 40, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S41', 'cbe-brookefields', 41, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S42', 'cbe-brookefields', 42, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S43', 'cbe-brookefields', 43, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S44', 'cbe-brookefields', 44, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S45', 'cbe-brookefields', 45, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S46', 'cbe-brookefields', 46, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S47', 'cbe-brookefields', 47, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S48', 'cbe-brookefields', 48, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S49', 'cbe-brookefields', 49, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-brookefields-S50', 'cbe-brookefields', 50, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S1', 'cbe-airport', 1, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S2', 'cbe-airport', 2, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S3', 'cbe-airport', 3, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S4', 'cbe-airport', 4, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S5', 'cbe-airport', 5, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S6', 'cbe-airport', 6, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S7', 'cbe-airport', 7, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S8', 'cbe-airport', 8, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S9', 'cbe-airport', 9, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S10', 'cbe-airport', 10, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S11', 'cbe-airport', 11, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S12', 'cbe-airport', 12, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S13', 'cbe-airport', 13, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S14', 'cbe-airport', 14, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S15', 'cbe-airport', 15, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S16', 'cbe-airport', 16, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S17', 'cbe-airport', 17, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S18', 'cbe-airport', 18, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S19', 'cbe-airport', 19, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S20', 'cbe-airport', 20, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S21', 'cbe-airport', 21, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S22', 'cbe-airport', 22, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S23', 'cbe-airport', 23, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S24', 'cbe-airport', 24, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S25', 'cbe-airport', 25, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S26', 'cbe-airport', 26, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S27', 'cbe-airport', 27, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S28', 'cbe-airport', 28, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S29', 'cbe-airport', 29, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S30', 'cbe-airport', 30, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S31', 'cbe-airport', 31, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S32', 'cbe-airport', 32, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S33', 'cbe-airport', 33, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S34', 'cbe-airport', 34, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S35', 'cbe-airport', 35, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S36', 'cbe-airport', 36, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S37', 'cbe-airport', 37, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S38', 'cbe-airport', 38, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S39', 'cbe-airport', 39, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S40', 'cbe-airport', 40, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S41', 'cbe-airport', 41, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S42', 'cbe-airport', 42, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S43', 'cbe-airport', 43, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S44', 'cbe-airport', 44, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S45', 'cbe-airport', 45, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S46', 'cbe-airport', 46, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S47', 'cbe-airport', 47, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S48', 'cbe-airport', 48, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S49', 'cbe-airport', 49, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-airport-S50', 'cbe-airport', 50, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S1', 'cbe-funmall', 1, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S2', 'cbe-funmall', 2, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S3', 'cbe-funmall', 3, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S4', 'cbe-funmall', 4, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S5', 'cbe-funmall', 5, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S6', 'cbe-funmall', 6, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S7', 'cbe-funmall', 7, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S8', 'cbe-funmall', 8, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S9', 'cbe-funmall', 9, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S10', 'cbe-funmall', 10, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S11', 'cbe-funmall', 11, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S12', 'cbe-funmall', 12, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S13', 'cbe-funmall', 13, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S14', 'cbe-funmall', 14, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S15', 'cbe-funmall', 15, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S16', 'cbe-funmall', 16, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S17', 'cbe-funmall', 17, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S18', 'cbe-funmall', 18, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S19', 'cbe-funmall', 19, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S20', 'cbe-funmall', 20, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S21', 'cbe-funmall', 21, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S22', 'cbe-funmall', 22, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S23', 'cbe-funmall', 23, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S24', 'cbe-funmall', 24, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S25', 'cbe-funmall', 25, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S26', 'cbe-funmall', 26, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S27', 'cbe-funmall', 27, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S28', 'cbe-funmall', 28, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S29', 'cbe-funmall', 29, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S30', 'cbe-funmall', 30, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S31', 'cbe-funmall', 31, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S32', 'cbe-funmall', 32, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S33', 'cbe-funmall', 33, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S34', 'cbe-funmall', 34, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S35', 'cbe-funmall', 35, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S36', 'cbe-funmall', 36, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S37', 'cbe-funmall', 37, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S38', 'cbe-funmall', 38, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S39', 'cbe-funmall', 39, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S40', 'cbe-funmall', 40, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S41', 'cbe-funmall', 41, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S42', 'cbe-funmall', 42, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S43', 'cbe-funmall', 43, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S44', 'cbe-funmall', 44, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S45', 'cbe-funmall', 45, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S46', 'cbe-funmall', 46, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S47', 'cbe-funmall', 47, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S48', 'cbe-funmall', 48, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S49', 'cbe-funmall', 49, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-funmall-S50', 'cbe-funmall', 50, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S1', 'cbe-railway', 1, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S2', 'cbe-railway', 2, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S3', 'cbe-railway', 3, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S4', 'cbe-railway', 4, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S5', 'cbe-railway', 5, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S6', 'cbe-railway', 6, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S7', 'cbe-railway', 7, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S8', 'cbe-railway', 8, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S9', 'cbe-railway', 9, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S10', 'cbe-railway', 10, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S11', 'cbe-railway', 11, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S12', 'cbe-railway', 12, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S13', 'cbe-railway', 13, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S14', 'cbe-railway', 14, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S15', 'cbe-railway', 15, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S16', 'cbe-railway', 16, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S17', 'cbe-railway', 17, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S18', 'cbe-railway', 18, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S19', 'cbe-railway', 19, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S20', 'cbe-railway', 20, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S21', 'cbe-railway', 21, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S22', 'cbe-railway', 22, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S23', 'cbe-railway', 23, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S24', 'cbe-railway', 24, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S25', 'cbe-railway', 25, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S26', 'cbe-railway', 26, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S27', 'cbe-railway', 27, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S28', 'cbe-railway', 28, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S29', 'cbe-railway', 29, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S30', 'cbe-railway', 30, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S31', 'cbe-railway', 31, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S32', 'cbe-railway', 32, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S33', 'cbe-railway', 33, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S34', 'cbe-railway', 34, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S35', 'cbe-railway', 35, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S36', 'cbe-railway', 36, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S37', 'cbe-railway', 37, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S38', 'cbe-railway', 38, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S39', 'cbe-railway', 39, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S40', 'cbe-railway', 40, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S41', 'cbe-railway', 41, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S42', 'cbe-railway', 42, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S43', 'cbe-railway', 43, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S44', 'cbe-railway', 44, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S45', 'cbe-railway', 45, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S46', 'cbe-railway', 46, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S47', 'cbe-railway', 47, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S48', 'cbe-railway', 48, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S49', 'cbe-railway', 49, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-railway-S50', 'cbe-railway', 50, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S1', 'cbe-prozone', 1, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S2', 'cbe-prozone', 2, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S3', 'cbe-prozone', 3, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S4', 'cbe-prozone', 4, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S5', 'cbe-prozone', 5, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S6', 'cbe-prozone', 6, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S7', 'cbe-prozone', 7, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S8', 'cbe-prozone', 8, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S9', 'cbe-prozone', 9, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S10', 'cbe-prozone', 10, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S11', 'cbe-prozone', 11, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S12', 'cbe-prozone', 12, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S13', 'cbe-prozone', 13, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S14', 'cbe-prozone', 14, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S15', 'cbe-prozone', 15, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S16', 'cbe-prozone', 16, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S17', 'cbe-prozone', 17, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S18', 'cbe-prozone', 18, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S19', 'cbe-prozone', 19, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S20', 'cbe-prozone', 20, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S21', 'cbe-prozone', 21, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S22', 'cbe-prozone', 22, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S23', 'cbe-prozone', 23, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S24', 'cbe-prozone', 24, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S25', 'cbe-prozone', 25, 1, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S26', 'cbe-prozone', 26, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S27', 'cbe-prozone', 27, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S28', 'cbe-prozone', 28, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S29', 'cbe-prozone', 29, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S30', 'cbe-prozone', 30, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S31', 'cbe-prozone', 31, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S32', 'cbe-prozone', 32, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S33', 'cbe-prozone', 33, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S34', 'cbe-prozone', 34, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S35', 'cbe-prozone', 35, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S36', 'cbe-prozone', 36, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S37', 'cbe-prozone', 37, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S38', 'cbe-prozone', 38, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S39', 'cbe-prozone', 39, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S40', 'cbe-prozone', 40, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S41', 'cbe-prozone', 41, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S42', 'cbe-prozone', 42, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S43', 'cbe-prozone', 43, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S44', 'cbe-prozone', 44, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S45', 'cbe-prozone', 45, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S46', 'cbe-prozone', 46, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S47', 'cbe-prozone', 47, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S48', 'cbe-prozone', 48, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S49', 'cbe-prozone', 49, 2, 0);
INSERT INTO parking_slots (id, centre_id, slot_number, floor_level, is_occupied) VALUES ('cbe-prozone-S50', 'cbe-prozone', 50, 2, 0);
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
