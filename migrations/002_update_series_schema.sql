-- Migration: 002_update_series_schema
-- Description: Updates series table to add status and start_year fields, and fixes id column naming
-- Date: 2025-09-07

BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '002_update_series_schema.sql') THEN
        RAISE NOTICE 'Migration 002_update_series_schema.sql already applied, skipping.';
        RETURN;
    END IF;

    -- First rename series_id to id for consistency with code
    ALTER TABLE books DROP CONSTRAINT books_series_id_fkey;
    ALTER TABLE series_timeline DROP CONSTRAINT series_timeline_series_id_fkey;
    ALTER TABLE series_metadata DROP CONSTRAINT series_metadata_series_id_fkey;

    --ALTER TABLE series RENAME COLUMN series_id TO id;

    -- Update foreign key constraints to point to new column name
    ALTER TABLE books ADD CONSTRAINT books_series_id_fkey 
        FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;
    ALTER TABLE series_timeline ADD CONSTRAINT series_timeline_series_id_fkey 
        FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;
    ALTER TABLE series_metadata ADD CONSTRAINT series_metadata_series_id_fkey 
        FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;

    -- Add new columns
    ALTER TABLE series ADD COLUMN status VARCHAR(50) 
        CHECK (status IN ('ongoing', 'completed', 'hiatus')) DEFAULT 'ongoing';
    ALTER TABLE series ADD COLUMN start_year INTEGER;

    ALTER TABLE authors ADD COLUMN bio TEXT;
    ALTER TABLE authors ADD COLUMN birth_year INTEGER;
    ALTER TABLE books ADD COLUMN publication_year INTEGER;
    ALTER TABLE books ADD COLUMN description TEXT;
    ALTER TABLE books ADD COLUMN isbn VARCHAR(20);
    ALTER TABLE books ADD COLUMN page_count INTEGER;

    -- Update indices to use new column name
    DROP INDEX idx_series_author_id;
    CREATE INDEX idx_series_author_id ON series(author_id);

    -- Add new indices for new columns
    CREATE INDEX idx_series_status ON series(status);
    CREATE INDEX idx_series_start_year ON series(start_year);

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('002_update_series_schema.sql');
END
$$;

COMMIT;
