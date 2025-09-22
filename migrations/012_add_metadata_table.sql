-- Migration 012: Add universal metadata table for both series and book metadata
-- This migration creates a flexible metadata table that can store metadata for both series and books
-- replacing the more limited series_metadata table approach
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '012_add_metadata_table.sql') THEN
        RAISE NOTICE 'Migration 012_add_metadata_table.sql already applied, skipping.';
        RETURN;
    END IF;

    -- Create the universal metadata table
    CREATE TABLE metadata (
        id SERIAL PRIMARY KEY,
        series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        metadata_key VARCHAR(255) NOT NULL,
        metadata_value TEXT NOT NULL,
        metadata_type VARCHAR(50) NOT NULL DEFAULT 'string' CHECK (metadata_type IN ('string', 'number', 'date', 'url', 'json')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- Ensure either series_id or book_id is provided, but not both
        CONSTRAINT metadata_context_check CHECK (
            (series_id IS NOT NULL AND book_id IS NULL) OR 
            (series_id IS NULL AND book_id IS NOT NULL)
        ),
        -- Ensure unique metadata keys within the same context
        CONSTRAINT unique_series_metadata_key UNIQUE (series_id, metadata_key) DEFERRABLE INITIALLY DEFERRED,
        CONSTRAINT unique_book_metadata_key UNIQUE (book_id, metadata_key) DEFERRABLE INITIALLY DEFERRED
    );

    -- Create indexes for better query performance
    CREATE INDEX idx_metadata_series_id ON metadata(series_id) WHERE series_id IS NOT NULL;
    CREATE INDEX idx_metadata_book_id ON metadata(book_id) WHERE book_id IS NOT NULL;
    CREATE INDEX idx_metadata_key ON metadata(metadata_key);
    CREATE INDEX idx_metadata_type ON metadata(metadata_type);

    -- Add trigger for automatic timestamp updates
    CREATE TRIGGER metadata_update_timestamp
        BEFORE UPDATE ON metadata
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();

    -- Migrate existing data from series_metadata to new metadata table
    INSERT INTO metadata (series_id, metadata_key, metadata_value, metadata_type, created_at, updated_at)
    SELECT 
        series_id,
        key as metadata_key,
        value as metadata_value,
        'string' as metadata_type,  -- Assume string type for existing data
        created_at,
        CURRENT_TIMESTAMP as updated_at
    FROM series_metadata;

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('012_add_metadata_table.sql');

    RAISE NOTICE 'Migration 012_add_metadata_table.sql completed successfully. Created metadata table and migrated % existing series_metadata records.', 
        (SELECT COUNT(*) FROM series_metadata);

END
$$;

COMMIT;