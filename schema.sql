-- =============================================================================
-- Hoply — Database Schema (MySQL 8.0+)
-- Find your travel companion. Share the ride. Save money. Meet people.
-- =============================================================================
-- Engine: InnoDB (FK + transaction support)
-- Charset: utf8mb4 (full Unicode incl. emoji, multilingual names)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS hoply
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hoply;

-- Drop in dependency order (children first) so the script is re-runnable.
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS travel_plans;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_languages;


-- =============================================================================
-- 1. users
-- =============================================================================
CREATE TABLE users (
  user_id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100)    NOT NULL,
  email          VARCHAR(255)    NOT NULL,
  password_hash  VARCHAR(255)    NOT NULL,               -- store a bcrypt/argon2 hash, never plain text
  phone_number   VARCHAR(20)     NOT NULL,
  age            TINYINT UNSIGNED NULL,
  gender         ENUM('male','female','other','prefer_not_to_say') NOT NULL DEFAULT 'prefer_not_to_say',
  description    TEXT            NULL,
  profile_photo  VARCHAR(500)    NULL,                   -- [added] URL, referenced by traveller profiles
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone_number),
  CONSTRAINT chk_users_age CHECK (age IS NULL OR (age BETWEEN 13 AND 120))
) ENGINE=InnoDB;


-- =============================================================================
-- 2. locations
-- Reusable catalog of known places (airports, bus depots, localities).
-- Coordinates are optional; stored as DECIMAL for portability + precision.
-- =============================================================================
CREATE TABLE locations (
  location_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(150)    NOT NULL,                 -- e.g. "Kempegowda International Airport"
  region       VARCHAR(100)    NOT NULL,                 -- broader area / district, e.g. "Devanahalli"
  city         VARCHAR(100)    NOT NULL,                 -- city, e.g. "Bengaluru"
  country      VARCHAR(100)    NOT NULL DEFAULT 'India', -- country, e.g. "India"
  place_type   ENUM('airport','railway_station','bus_depot','metro_station','locality','other')
               NOT NULL DEFAULT 'locality',
  latitude     DECIMAL(9,6)    NULL,                     -- optional; ~0.11 m precision
  longitude    DECIMAL(9,6)    NULL,                     -- optional
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (location_id),
  UNIQUE KEY uq_locations_name_city (name, city),
  KEY idx_locations_region (region),
  KEY idx_locations_city (city),
  KEY idx_locations_country (country),
  KEY idx_locations_type (place_type),
  KEY idx_locations_coords (latitude, longitude),
  CONSTRAINT chk_loc_lat CHECK (latitude  IS NULL OR (latitude  BETWEEN -90  AND 90)),
  CONSTRAINT chk_loc_lng CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180))
) ENGINE=InnoDB;


-- =============================================================================
-- 3. travel_plans
-- A user's request to travel from a source to a destination in a time window.
-- Source/destination reference the locations catalog. Destination also keeps
-- free-form landmark + precise map coordinates for the exact drop point.
-- =============================================================================
CREATE TABLE travel_plans (
  plan_id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NOT NULL,
  source_location_id  BIGINT UNSIGNED NOT NULL,
  dest_location_id    BIGINT UNSIGNED NOT NULL,

  -- Time range the traveller is flexible within.
  depart_from         DATETIME        NOT NULL,          -- earliest departure
  depart_until        DATETIME        NOT NULL,          -- latest departure

  -- Precise destination detail (beyond the general location row).
  landmark            VARCHAR(200)    NULL,              -- optional landmark near drop point
  dest_latitude       DECIMAL(9,6)    NULL,              -- exact destination coords (optional)
  dest_longitude      DECIMAL(9,6)    NULL,
  other_info          TEXT            NULL,              -- free-form notes

  -- Luggage.
  luggage_type        ENUM('none','backpack','carry_on','suitcase','oversized') NOT NULL DEFAULT 'none',
  luggage_quantity    TINYINT UNSIGNED NOT NULL DEFAULT 0,

  -- [added] supporting fields for the matching + expiry business rules.
  passenger_count     TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status              ENUM('active','matched','cancelled','expired') NOT NULL DEFAULT 'active',
  expires_at          DATETIME        NULL,              -- request auto-expires (business rule #4)
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (plan_id),
  KEY idx_plans_user (user_id),
  KEY idx_plans_dest (dest_location_id),
  KEY idx_plans_source (source_location_id),
  KEY idx_plans_status (status),
  KEY idx_plans_window (depart_from, depart_until),

  CONSTRAINT fk_plans_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_plans_source
    FOREIGN KEY (source_location_id) REFERENCES locations (location_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_plans_dest
    FOREIGN KEY (dest_location_id) REFERENCES locations (location_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT chk_plans_window   CHECK (depart_until >= depart_from),
  CONSTRAINT chk_plans_luggage  CHECK (luggage_quantity BETWEEN 0 AND 20),
  CONSTRAINT chk_plans_pax      CHECK (passenger_count  BETWEEN 1 AND 10),
  CONSTRAINT chk_plans_dlat     CHECK (dest_latitude  IS NULL OR (dest_latitude  BETWEEN -90  AND 90)),
  CONSTRAINT chk_plans_dlng     CHECK (dest_longitude IS NULL OR (dest_longitude BETWEEN -180 AND 180))
) ENGINE=InnoDB;


-- =============================================================================
-- [added] matches
-- Links two travel plans (requester -> receiver) with a compatibility score
-- and an accept/reject lifecycle. Contact is only shared once accepted.
-- =============================================================================
CREATE TABLE matches (
  match_id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  requester_plan_id    BIGINT UNSIGNED NOT NULL,         -- plan that sent the request
  receiver_plan_id     BIGINT UNSIGNED NOT NULL,         -- plan that received it
  compatibility_score  TINYINT UNSIGNED NULL,            -- 0-100 %
  status               ENUM('pending','accepted','rejected','cancelled') NOT NULL DEFAULT 'pending',
  created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (match_id),
  -- Prevent duplicate requests between the same pair of plans (business rule).
  UNIQUE KEY uq_match_pair (requester_plan_id, receiver_plan_id),
  KEY idx_match_receiver (receiver_plan_id),
  KEY idx_match_status (status),

  CONSTRAINT fk_match_requester
    FOREIGN KEY (requester_plan_id) REFERENCES travel_plans (plan_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_match_receiver
    FOREIGN KEY (receiver_plan_id) REFERENCES travel_plans (plan_id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT chk_match_score     CHECK (compatibility_score IS NULL OR (compatibility_score BETWEEN 0 AND 100))
) ENGINE=InnoDB;


-- =============================================================================
-- [added] notifications
-- Simple in-app notification feed (mirrors the Notification entity in the doc).
-- =============================================================================
CREATE TABLE notifications (
  notification_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  receiver_id      BIGINT UNSIGNED NOT NULL,             -- user receiving the notification
  match_id         BIGINT UNSIGNED NULL,                 -- related match, if any
  message          VARCHAR(255)    NOT NULL,
  status           ENUM('unread','read') NOT NULL DEFAULT 'unread',
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (notification_id),
  KEY idx_notif_receiver (receiver_id, status),

  CONSTRAINT fk_notif_receiver
    FOREIGN KEY (receiver_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notif_match
    FOREIGN KEY (match_id) REFERENCES matches (match_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
