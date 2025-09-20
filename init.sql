
-- Initialize database with any required setup
-- This file will be run when the PostgreSQL container first starts

-- Enable UUID extension which might be needed for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone to UTC by default
SET timezone = 'UTC';

-- You can add more initialization commands here as needed

SELECT 'Database initialization complete' as status;

