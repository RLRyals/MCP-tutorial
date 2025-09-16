-- Migration to remove NOT NULL and UNIQUE constraints from email field in authors table
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '005.sql') THEN
        RAISE NOTICE 'Migration 005.sql already applied, skipping.';
        RETURN;
    END IF;

ALTER TABLE authors 
    ALTER COLUMN email DROP NOT NULL;

ALTER TABLE authors 
    DROP CONSTRAINT IF EXISTS authors_email_key;

-- Record this migration
    INSERT INTO migrations (filename) VALUES ('005.sql');

END
$$;

COMMIT;