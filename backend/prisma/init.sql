-- PostgreSQL initialization script for EduShorts database

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto extension for password hashing (if needed)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database user if not exists (optional, mainly for production)
-- Note: In Docker, the user is already created via environment variables

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'EduShorts database initialized successfully at %', NOW();
END $$;