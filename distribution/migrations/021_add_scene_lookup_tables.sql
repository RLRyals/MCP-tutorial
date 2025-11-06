-- Migration: 021_add_scene_lookup_tables
-- Description: Add dynamic lookup tables for scene purposes and scene types
-- Date: 2025-11-03

BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '021_add_scene_lookup_tables.sql') THEN
        RAISE NOTICE 'Migration 021_add_scene_lookup_tables.sql already applied, skipping.';
        RETURN;
    END IF;

-- =============================================
-- SCENE LOOKUP TABLES
-- =============================================

-- Scene purposes (dynamic, not hardcoded)
CREATE TABLE IF NOT EXISTS scene_purposes (
    id SERIAL PRIMARY KEY,
    purpose_name VARCHAR(50) NOT NULL UNIQUE,
    purpose_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scene types (dynamic, not hardcoded)
CREATE TABLE IF NOT EXISTS scene_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    type_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Writing statuses (dynamic, not hardcoded)
CREATE TABLE IF NOT EXISTS writing_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    status_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- POPULATE DEFAULT VALUES
-- =============================================

-- Insert default scene purposes
INSERT INTO scene_purposes (purpose_name, purpose_description) VALUES
    ('action', 'Scene focused on physical action, movement, or events'),
    ('dialogue', 'Scene focused on character conversation and interaction'),
    ('description', 'Scene focused on setting, atmosphere, or environmental details'),
    ('transition', 'Scene that bridges other scenes or moves the story forward'),
    ('exposition', 'Scene that reveals background information or world details'),
    ('conflict', 'Scene that introduces or escalates tension between characters or forces'),
    ('resolution', 'Scene that resolves conflicts or provides closure')
ON CONFLICT (purpose_name) DO NOTHING;

-- Insert default scene types
INSERT INTO scene_types (type_name, type_description) VALUES
    ('dramatic', 'Serious, emotionally intense scene'),
    ('comedic', 'Humorous or lighthearted scene'),
    ('romantic', 'Scene focused on romantic relationships or feelings'),
    ('suspenseful', 'Scene that builds tension or anticipation'),
    ('action', 'Scene with physical conflict or high-energy sequences'),
    ('introspective', 'Scene exploring character thoughts and internal conflicts'),
    ('transitional', 'Scene that moves between major plot points')
ON CONFLICT (type_name) DO NOTHING;

-- Insert default writing statuses
INSERT INTO writing_statuses (status_name, status_description) VALUES
    ('planned', 'Scene is planned but not yet written'),
    ('draft', 'Scene has been written in draft form'),
    ('revision', 'Scene is undergoing revision'),
    ('final', 'Scene is complete and finalized'),
    ('cut', 'Scene has been removed from the manuscript')
ON CONFLICT (status_name) DO NOTHING;

-- =============================================
-- RECORD MIGRATION
-- =============================================

-- Record that this migration has been applied
INSERT INTO migrations (filename, applied_at)
VALUES ('021_add_scene_lookup_tables.sql', CURRENT_TIMESTAMP);

RAISE NOTICE 'Migration 021_add_scene_lookup_tables.sql applied successfully.';

END $$;

COMMIT;
