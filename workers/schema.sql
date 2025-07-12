-- D1 database schema for shared store
-- This schema defines the table structure for the D1 database

-- Create the store table
CREATE TABLE IF NOT EXISTS store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the key column for faster lookups
CREATE INDEX IF NOT EXISTS idx_store_key ON store(key);
