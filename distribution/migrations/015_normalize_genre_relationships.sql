-- Migration: 015_normalize_genre_relationships
-- Description: Normalizes genre storage using junction tables instead of text arrays
-- Date: 2025-10-04

BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '015_normalize_genre_relationships.sql') THEN
        RAISE NOTICE 'Migration 015_normalize_genre_relationships.sql already applied, skipping.';
        RETURN;
    END IF;

-- =============================================
-- CREATE JUNCTION TABLES FOR NORMALIZED RELATIONSHIPS
-- =============================================

-- Junction table for books-genres (many-to-many)
CREATE TABLE book_genres (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, genre_id)
);

-- Junction table for series-genres (many-to-many)
CREATE TABLE series_genres (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, genre_id)
);

-- =============================================
-- CREATE INDICES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX idx_book_genres_genre_id ON book_genres(genre_id);
CREATE INDEX idx_series_genres_series_id ON series_genres(series_id);
CREATE INDEX idx_series_genres_genre_id ON series_genres(genre_id);

-- =============================================
-- MIGRATE EXISTING DATA
-- =============================================

-- Migrate books.genre_tags (TEXT[]) to book_genres junction table
-- This handles the array of genre names and converts them to IDs
DO $migrate$
DECLARE
    book_record RECORD;
    genre_name_item TEXT;
    genre_record RECORD;
BEGIN
    -- Loop through all books that have genre_tags
    FOR book_record IN
        SELECT id, genre_tags
        FROM books
        WHERE genre_tags IS NOT NULL AND array_length(genre_tags, 1) > 0
    LOOP
        -- Loop through each genre in the array
        FOREACH genre_name_item IN ARRAY book_record.genre_tags
        LOOP
            -- Find matching genre (case-insensitive, trimmed)
            SELECT id INTO genre_record
            FROM genres
            WHERE LOWER(TRIM(genre_name)) = LOWER(TRIM(genre_name_item))
            LIMIT 1;

            -- If genre exists, create junction record
            IF FOUND THEN
                INSERT INTO book_genres (book_id, genre_id)
                VALUES (book_record.id, genre_record.id)
                ON CONFLICT (book_id, genre_id) DO NOTHING;

                RAISE NOTICE 'Migrated genre "%" for book ID %', genre_name_item, book_record.id;
            ELSE
                RAISE WARNING 'Genre "%" not found in genres table for book ID %', genre_name_item, book_record.id;
            END IF;
        END LOOP;
    END LOOP;
END $migrate$;

-- Migrate series.genre (VARCHAR) to series_genres junction table
-- This handles single genre strings
DO $migrate$
DECLARE
    series_record RECORD;
    genre_record RECORD;
BEGIN
    -- Loop through all series that have a genre set
    FOR series_record IN
        SELECT id, genre
        FROM series
        WHERE genre IS NOT NULL AND TRIM(genre) != ''
    LOOP
        -- Find matching genre (case-insensitive, trimmed)
        SELECT id INTO genre_record
        FROM genres
        WHERE LOWER(TRIM(genre_name)) = LOWER(TRIM(series_record.genre))
        LIMIT 1;

        -- If genre exists, create junction record
        IF FOUND THEN
            INSERT INTO series_genres (series_id, genre_id)
            VALUES (series_record.id, genre_record.id)
            ON CONFLICT (series_id, genre_id) DO NOTHING;

            RAISE NOTICE 'Migrated genre "%" for series ID %', series_record.genre, series_record.id;
        ELSE
            RAISE WARNING 'Genre "%" not found in genres table for series ID %', series_record.genre, series_record.id;
        END IF;
    END LOOP;
END $migrate$;

-- =============================================
-- DROP OLD COLUMNS (after data migration)
-- =============================================

-- Remove the old genre_tags column from books table
ALTER TABLE books DROP COLUMN IF EXISTS genre_tags;

-- Remove the old genre column from series table
ALTER TABLE series DROP COLUMN IF EXISTS genre;

-- =============================================
-- HELPER VIEWS FOR EASIER QUERYING
-- =============================================

-- View to get books with their genres as an aggregated array (for backwards compatibility)
CREATE OR REPLACE VIEW books_with_genres AS
SELECT
    b.*,
    COALESCE(array_agg(g.genre_name ORDER BY g.genre_name) FILTER (WHERE g.id IS NOT NULL), ARRAY[]::VARCHAR[]) as genre_names,
    COALESCE(array_agg(g.id ORDER BY g.genre_name) FILTER (WHERE g.id IS NOT NULL), ARRAY[]::INTEGER[]) as genre_ids
FROM books b
LEFT JOIN book_genres bg ON b.id = bg.book_id
LEFT JOIN genres g ON bg.genre_id = g.id
GROUP BY b.id;

-- View to get series with their genres as an aggregated array
CREATE OR REPLACE VIEW series_with_genres AS
SELECT
    s.*,
    COALESCE(array_agg(g.genre_name ORDER BY g.genre_name) FILTER (WHERE g.id IS NOT NULL), ARRAY[]::VARCHAR[]) as genre_names,
    COALESCE(array_agg(g.id ORDER BY g.genre_name) FILTER (WHERE g.id IS NOT NULL), ARRAY[]::INTEGER[]) as genre_ids
FROM series s
LEFT JOIN series_genres sg ON s.id = sg.series_id
LEFT JOIN genres g ON sg.genre_id = g.id
GROUP BY s.id;

-- Record this migration
INSERT INTO migrations (filename) VALUES ('015_normalize_genre_relationships.sql');

END
$$;

COMMIT;
