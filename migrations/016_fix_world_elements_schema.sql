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
ADD COLUMN IF NOT EXISTS rarity VARCHAR(50),
ADD COLUMN IF NOT EXISTS cultural_impact TEXT,
ADD COLUMN IF NOT EXISTS access_method TEXT;

-- Rename rules_text to rules_array for consistency, but keep as TEXT[] array
-- First add the new column as array type
ALTER TABLE world_elements
ADD COLUMN IF NOT EXISTS rules TEXT[];

-- Migrate data from rules_text to rules array if rules_text exists and has content
UPDATE world_elements
SET rules = ARRAY[rules_text]::TEXT[]
WHERE rules_text IS NOT NULL AND rules_text != '' AND rules IS NULL;

-- Change limitations from TEXT to TEXT[] array type
-- First, rename the existing column
ALTER TABLE world_elements
RENAME COLUMN limitations TO limitations_old;

-- Add new array column
ALTER TABLE world_elements
ADD COLUMN limitations TEXT[];

-- Migrate data from old limitations to new array format
UPDATE world_elements
SET limitations = ARRAY[limitations_old]::TEXT[]
WHERE limitations_old IS NOT NULL AND limitations_old != '';

-- Drop the old column
ALTER TABLE world_elements
DROP COLUMN limitations_old;

-- Optional: Drop rules_text if no longer needed (keeping for backwards compatibility for now)
-- ALTER TABLE world_elements DROP COLUMN IF EXISTS rules_text;

-- Add index for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_world_elements_rarity ON world_elements(rarity);
CREATE INDEX IF NOT EXISTS idx_world_elements_element_type ON world_elements(element_type);

-- Record this migration
INSERT INTO migrations (filename) VALUES ('016_fix_world_elements_schema.sql');

END $$;

COMMIT;
