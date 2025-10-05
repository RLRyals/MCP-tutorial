-- Migration: 016_fix_world_elements_schema
-- Description: Adds missing columns to world_elements table to match world server expectations
-- Date: 2025-10-05

BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '016_fix_world_elements_schema.sql') THEN
        RAISE NOTICE 'Migration 016_fix_world_elements_schema.sql already applied, skipping.';
        RETURN;
    END IF;

-- ========================================
-- FIX WORLD_ELEMENTS TABLE SCHEMA
-- ========================================

-- Add missing columns that the world server expects
ALTER TABLE world_elements
ADD COLUMN IF NOT EXISTS power_source TEXT,
ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'common',
ADD COLUMN IF NOT EXISTS cultural_impact TEXT,
ADD COLUMN IF NOT EXISTS access_method TEXT;

-- Add rules column as TEXT[] array (distinct from rules_text)
ALTER TABLE world_elements
ADD COLUMN IF NOT EXISTS rules TEXT[];

-- Migrate data from rules_text to rules array if rules_text exists and has content
UPDATE world_elements
SET rules = ARRAY[rules_text]::TEXT[]
WHERE rules_text IS NOT NULL AND rules_text != '' AND (rules IS NULL OR array_length(rules, 1) IS NULL);

-- Change limitations from TEXT to TEXT[] array type
-- Only migrate if limitations is currently TEXT type (not already an array)
DO $limitations_migration$
BEGIN
    -- Check if limitations column exists and is TEXT type
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'world_elements'
        AND column_name = 'limitations'
        AND data_type = 'text'
    ) THEN
        -- Rename the existing TEXT column
        ALTER TABLE world_elements RENAME COLUMN limitations TO limitations_old;

        -- Add new array column
        ALTER TABLE world_elements ADD COLUMN limitations TEXT[];

        -- Migrate data from old limitations to new array format
        UPDATE world_elements
        SET limitations = ARRAY[limitations_old]::TEXT[]
        WHERE limitations_old IS NOT NULL AND limitations_old != '';

        -- Drop the old column
        ALTER TABLE world_elements DROP COLUMN limitations_old;

        RAISE NOTICE 'Migrated limitations from TEXT to TEXT[] array';
    ELSIF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'world_elements'
        AND column_name = 'limitations'
    ) THEN
        -- Column doesn't exist at all, create it
        ALTER TABLE world_elements ADD COLUMN limitations TEXT[];
        RAISE NOTICE 'Created limitations column as TEXT[] array';
    ELSE
        RAISE NOTICE 'Limitations column already exists as array type, skipping migration';
    END IF;
END $limitations_migration$;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_world_elements_rarity ON world_elements(rarity);
CREATE INDEX IF NOT EXISTS idx_world_elements_element_type ON world_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_world_elements_series_id ON world_elements(series_id);

-- Record this migration
INSERT INTO migrations (filename) VALUES ('016_fix_world_elements_schema.sql');

END $$;

COMMIT;
