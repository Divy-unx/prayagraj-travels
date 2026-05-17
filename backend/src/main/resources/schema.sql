-- ============================================================
-- Prayagraj Travels – Idempotent Schema
-- Safe to run on every startup: CREATE IF NOT EXISTS + INSERT IGNORE
-- ============================================================

CREATE TABLE IF NOT EXISTS buses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    destination VARCHAR(100),
    capacity INT,
    fare DOUBLE,
    UNIQUE KEY uq_bus_name (name),
    INDEX idx_buses_source_destination (source, destination)
);

CREATE TABLE IF NOT EXISTS users (
    id               BIGINT       PRIMARY KEY AUTO_INCREMENT,
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    phone            VARCHAR(20)  DEFAULT NULL,
    password_hash    VARCHAR(255) NOT NULL DEFAULT '',
    role             VARCHAR(20)  NOT NULL DEFAULT 'USER',
    auth_provider    ENUM('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL',
    google_id        VARCHAR(100) DEFAULT NULL,
    avatar_url       VARCHAR(500) DEFAULT NULL,
    is_email_verified TINYINT(1)  NOT NULL DEFAULT 0,
    is_phone_verified TINYINT(1)  NOT NULL DEFAULT 0,
    is_active        TINYINT(1)   NOT NULL DEFAULT 1,
    last_login_at    TIMESTAMP    NULL DEFAULT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id      INT PRIMARY KEY AUTO_INCREMENT,
    bus_id          INT          NOT NULL,
    seat_number     VARCHAR(5)   NOT NULL,
    travel_date     DATE         NOT NULL,
    user_id         VARCHAR(100) NOT NULL,
    passenger_name  VARCHAR(100) NOT NULL DEFAULT 'Passenger',
    passenger_phone VARCHAR(15)  DEFAULT NULL,
    status          ENUM('CONFIRMED','CANCELLED','PENDING') NOT NULL DEFAULT 'CONFIRMED',
    fare_paid       DOUBLE       NOT NULL DEFAULT 0,
    booked_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at    TIMESTAMP    NULL DEFAULT NULL,
    refund_status   ENUM('NONE','PENDING','PROCESSED','FAILED') NOT NULL DEFAULT 'NONE',
    refund_amount   DOUBLE       DEFAULT 0,
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    INDEX idx_bus_id (bus_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_bus_date_status (bus_id, travel_date, status)
);

-- Cancellation audit log for tracking history
CREATE TABLE IF NOT EXISTS cancellation_logs (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    booking_id      INT          NOT NULL,
    user_id         VARCHAR(100) NOT NULL,
    reason          VARCHAR(255) DEFAULT 'User requested cancellation',
    refund_amount   DOUBLE       NOT NULL DEFAULT 0,
    refund_status   ENUM('PENDING','PROCESSED','FAILED') NOT NULL DEFAULT 'PENDING',
    cancelled_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    INDEX idx_cancel_user (user_id),
    INDEX idx_cancel_booking (booking_id)
);

CREATE TABLE IF NOT EXISTS favorite_routes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    notes VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_favorite_route (user_id, source, destination),
    INDEX idx_favorite_user (user_id)
);

CREATE TABLE IF NOT EXISTS bus_live_location (
    bus_id          INT PRIMARY KEY,
    latitude        DOUBLE       NOT NULL DEFAULT 25.4358,
    longitude       DOUBLE       NOT NULL DEFAULT 81.8463,
    speed_kmh       INT          NOT NULL DEFAULT 0,
    heading_degrees INT          NOT NULL DEFAULT 0,
    next_stop       VARCHAR(100) DEFAULT 'Prayagraj Junction',
    status          ENUM('ON_TIME','DELAYED','ARRIVED') NOT NULL DEFAULT 'ON_TIME',
    last_updated    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id)
);

-- ============================================================
-- Seed Data  (INSERT IGNORE skips rows that already exist)
-- ============================================================

INSERT IGNORE INTO buses (name, source, destination, capacity, fare) VALUES
-- Civil Lines routes
('City Bus 1','Civil Lines','Naini',40,30),
('City Bus 2','Civil Lines','Jhunsi',40,25),
('City Bus 3','Civil Lines','Phaphamau',40,35),
('City Bus 4','Civil Lines','Kareli',40,28),
('City Bus 5','Civil Lines','Chowk',40,20),
('City Bus 6','Civil Lines','Bamrauli',40,32),
('City Bus 7','Civil Lines','Airport',40,50),
('City Bus 8','Civil Lines','Sangam',40,22),
('City Bus 9','Civil Lines','Allahabad University',40,18),
('City Bus 10','Civil Lines','Teliyarganj',40,26),

-- Reverse routes
('City Bus 11','Naini','Civil Lines',40,30),
('City Bus 12','Jhunsi','Civil Lines',40,25),
('City Bus 13','Phaphamau','Civil Lines',40,35),
('City Bus 14','Kareli','Civil Lines',40,28),
('City Bus 15','Chowk','Civil Lines',40,20),

-- Chowk routes
('City Bus 16','Chowk','Naini',40,30),
('City Bus 17','Chowk','Jhunsi',40,25),
('City Bus 18','Chowk','Kareli',40,28),
('City Bus 19','Chowk','Phaphamau',40,35),
('City Bus 20','Chowk','Teliyarganj',40,26),

-- Naini routes
('City Bus 21','Naini','Jhunsi',40,22),
('City Bus 22','Naini','Kareli',40,20),
('City Bus 23','Naini','Phaphamau',40,32),
('City Bus 24','Naini','Airport',40,45),
('City Bus 25','Naini','Sangam',40,18),

-- Jhunsi routes
('City Bus 26','Jhunsi','Phaphamau',40,20),
('City Bus 27','Jhunsi','Kareli',40,25),
('City Bus 28','Jhunsi','Airport',40,48),
('City Bus 29','Jhunsi','Teliyarganj',40,30),

-- Kareli routes
('City Bus 30','Kareli','Phaphamau',40,27),
('City Bus 31','Kareli','Airport',40,40),
('City Bus 32','Kareli','Sangam',40,22),
('City Bus 33','Kareli','University',40,18),

-- Airport routes
('City Bus 34','Airport','Bamrauli',40,15),
('City Bus 35','Airport','Sangam',40,35),
('City Bus 36','Airport','Civil Lines',40,50),
('City Bus 37','Airport','Kareli',40,40),

-- Sangam routes
('City Bus 38','Sangam','Daraganj',40,12),
('City Bus 39','Sangam','High Court',40,15),
('City Bus 40','Sangam','Civil Lines',40,22),

-- High Court routes
('City Bus 41','High Court','University',40,10),
('City Bus 42','High Court','Zero Road',40,14),

-- University routes
('City Bus 43','University','Zero Road',40,10),
('City Bus 44','University','Civil Lines',40,18),

-- Zero Road routes
('City Bus 45','Zero Road','Mundera',40,20),
('City Bus 46','Zero Road','Teliyarganj',40,22),

-- Teliyarganj routes
('City Bus 47','Teliyarganj','Phaphamau',40,25),
('City Bus 48','Teliyarganj','Kareli',40,30),
('City Bus 49','Teliyarganj','Civil Lines',40,26),

-- Mundera routes
('City Bus 50','Mundera','Jhunsi',40,28),
('City Bus 51','Mundera','Naini',40,30),

-- Extra variations
('City Bus 52','Civil Lines','Naini',40,35),
('City Bus 53','Civil Lines','Naini',40,28),
('City Bus 54','Civil Lines','Naini',40,32),
('City Bus 55','Civil Lines','Jhunsi',40,27),
('City Bus 56','Civil Lines','Jhunsi',40,24),
('City Bus 57','Civil Lines','Phaphamau',40,36),
('City Bus 58','Civil Lines','Phaphamau',40,34),
('City Bus 59','Civil Lines','Kareli',40,29),
('City Bus 60','Civil Lines','Kareli',40,26),

('City Bus 61','Naini','Civil Lines',40,31),
('City Bus 62','Naini','Civil Lines',40,29),
('City Bus 63','Jhunsi','Civil Lines',40,24),
('City Bus 64','Jhunsi','Civil Lines',40,26),
('City Bus 65','Phaphamau','Civil Lines',40,33),
('City Bus 66','Phaphamau','Civil Lines',40,37),

('City Bus 67','Chowk','Naini',40,28),
('City Bus 68','Chowk','Naini',40,32),
('City Bus 69','Chowk','Jhunsi',40,24),
('City Bus 70','Chowk','Jhunsi',40,26),

('City Bus 71','Airport','Civil Lines',40,48),
('City Bus 72','Airport','Civil Lines',40,52),

('City Bus 73','Sangam','Civil Lines',40,20),
('City Bus 74','Sangam','Civil Lines',40,23),

('City Bus 75','Teliyarganj','Civil Lines',40,27),
('City Bus 76','Teliyarganj','Civil Lines',40,25),

('City Bus 77','Mundera','Jhunsi',40,29),
('City Bus 78','Mundera','Jhunsi',40,31),

('City Bus 79','Zero Road','Mundera',40,21),
('City Bus 80','Zero Road','Mundera',40,23),

('City Bus 81','University','Civil Lines',40,19),
('City Bus 82','University','Civil Lines',40,17),

('City Bus 83','High Court','Zero Road',40,15),
('City Bus 84','High Court','Zero Road',40,13),

('City Bus 85','Airport','Sangam',40,36),
('City Bus 86','Airport','Sangam',40,34),

('City Bus 87','Jhunsi','Airport',40,49),
('City Bus 88','Jhunsi','Airport',40,46),

('City Bus 89','Kareli','Airport',40,41),
('City Bus 90','Kareli','Airport',40,39),

('City Bus 91','Naini','Airport',40,44),
('City Bus 92','Naini','Airport',40,47),

('City Bus 93','Civil Lines','Sangam',40,21),
('City Bus 94','Civil Lines','Sangam',40,23),

('City Bus 95','Civil Lines','University',40,18),
('City Bus 96','Civil Lines','University',40,17),

('City Bus 97','Chowk','Teliyarganj',40,27),
('City Bus 98','Chowk','Teliyarganj',40,25),

('City Bus 99','Phaphamau','Jhunsi',40,21),
('City Bus 100','Phaphamau','Jhunsi',40,23);

-- ============================================================
-- Schema Migrations (idempotent: ADD COLUMN IF NOT EXISTS)
-- Handles production DBs created before these columns were added.
-- MySQL 8.0+ required for IF NOT EXISTS on ALTER TABLE.
-- ============================================================

-- bookings: columns added after initial production deployment
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booked_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at   TIMESTAMP    NULL     DEFAULT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_status  ENUM('NONE','PENDING','PROCESSED','FAILED') NOT NULL DEFAULT 'NONE';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount  DOUBLE       DEFAULT 0;

-- users: columns added after initial production deployment
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider     ENUM('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id         VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url        VARCHAR(500) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified TINYINT(1)  NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_phone_verified TINYINT(1)  NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active         TINYINT(1)  NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at     TIMESTAMP   NULL DEFAULT NULL;

-- Fix: if is_active column was added with DEFAULT 0 (wrong), activate existing users.
-- Safe because no deactivation/ban feature exists in the codebase.
UPDATE users SET is_active = 1 WHERE is_active = 0;

-- cancellation_logs: ensure table has all expected columns
ALTER TABLE cancellation_logs ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================================
-- Ghost Booking Cleanup
-- Run this ONCE manually on production after deploying the
-- schema-migration fix (the fix that added booked_at etc.).
--
-- Context: before the fix, INSERT into bookings succeeded but
-- findBookingById() threw a 500 (missing columns). Users saw
-- an error but their seat was marked CONFIRMED in the DB.
-- After the fix, those ghost rows block seats with a 409.
--
-- Replace '<CUTOFF_TIMESTAMP>' with the first deploy timestamp
-- of the fixed version (e.g. '2026-05-17 12:00:00').
-- Only bookings confirmed BEFORE that timestamp with no
-- matching user-visible confirmation can be ghosts.
--
-- UPDATE bookings
-- SET status = 'CANCELLED',
--     cancelled_at = NOW(),
--     refund_status = 'NONE',
--     refund_amount = 0
-- WHERE status = 'CONFIRMED'
--   AND booked_at < '<CUTOFF_TIMESTAMP>';
-- ============================================================

-- ============================================================
-- Auth Extension Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    otp CHAR(6) DEFAULT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_evt_user (user_id),
    INDEX idx_evt_token (token)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    otp CHAR(6) DEFAULT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_prt_user (user_id),
    INDEX idx_prt_token (token)
);
