-- Migration to remove NOT NULL and UNIQUE constraints from email field in authors table
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '010_update_table_schema.sql') THEN
        RAISE NOTICE 'Migration 010_update_table_schema.sql already applied, skipping.';
        RETURN;
    END IF;

ALTER TABLE books 
    --add subtitle, blurb, pitch and hook text columns
    ADD COLUMN IF NOT EXISTS subtitle TEXT,
    ADD COLUMN IF NOT EXISTS blurb TEXT,
    ADD COLUMN IF NOT EXISTS pitch TEXT,
    ADD COLUMN IF NOT EXISTS hook TEXT;


-- Record this migration
    INSERT INTO migrations (filename) VALUES ('010_update_table_schema.sql');

END
$$;

COMMIT;