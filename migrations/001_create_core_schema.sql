-- Migration: 001_create_core_schema
-- Description: Creates the core database schema based on core-series-schema.md
-- Date: 2025-09-03

BEGIN;

-- Migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Authors table
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series table - the top-level container for all content
CREATE TABLE series (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    target_audience VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table - individual books within a series
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    book_number INTEGER,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, draft, editing, published
    target_word_count INTEGER,
    actual_word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, book_number)
);

-- Series timeline - master timeline for the series
CREATE TABLE series_timeline (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series metadata - flexible metadata storage for series-level information
-- CREATE TABLE series_metadata (
--     id SERIAL PRIMARY KEY,
--     series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
--     key VARCHAR(100) NOT NULL,
--     value TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(series_id, key)
-- );

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


-- Utility function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_authors_timestamp
    BEFORE UPDATE ON authors
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_series_timestamp
    BEFORE UPDATE ON series
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_books_timestamp
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_series_timeline_timestamp
    BEFORE UPDATE ON series_timeline
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger for automatic timestamp updates
CREATE TRIGGER metadata_update_timestamp
    BEFORE UPDATE ON metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create indices for performance optimization
-- Optimize author lookups
CREATE INDEX idx_authors_name ON authors(name);
CREATE INDEX idx_authors_email ON authors(email);

-- Optimize series lookups
CREATE INDEX idx_series_title ON series(title);
CREATE INDEX idx_series_author_id ON series(author_id);

-- Optimize book lookups within series
CREATE INDEX idx_books_series_id ON books(series_id);
CREATE INDEX idx_books_status ON books(status);

-- Optimize timeline lookups
CREATE INDEX idx_series_timeline_series_id ON series_timeline(series_id);

-- Optimize metadata lookups
--CREATE INDEX idx_series_metadata_series_id_key ON series_metadata(series_id, key);

   -- Create indexes for better query performance
    CREATE INDEX idx_metadata_series_id ON metadata(series_id) WHERE series_id IS NOT NULL;
    CREATE INDEX idx_metadata_book_id ON metadata(book_id) WHERE book_id IS NOT NULL;
    CREATE INDEX idx_metadata_key ON metadata(metadata_key);
    CREATE INDEX idx_metadata_type ON metadata(metadata_type);

 
-- Record this migration
INSERT INTO migrations (filename) VALUES ('001_create_core_schema.sql');

COMMIT;
