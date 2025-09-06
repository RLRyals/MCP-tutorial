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
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series table - the top-level container for all content
CREATE TABLE series (
    series_id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(author_id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    target_audience VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table - individual books within a series
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(series_id) ON DELETE CASCADE,
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
    timeline_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(series_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series metadata - flexible metadata storage for series-level information
CREATE TABLE series_metadata (
    metadata_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(series_id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, key)
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
CREATE INDEX idx_series_metadata_series_id_key ON series_metadata(series_id, key);

-- Record this migration
INSERT INTO migrations (filename) VALUES ('001_create_core_schema.sql');

COMMIT;
