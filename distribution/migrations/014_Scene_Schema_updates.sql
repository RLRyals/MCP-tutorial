-- Migration to add target_word_count and scene_elements to chapter_scenes
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '014_Scene_Schema_updates.sql') THEN
        RAISE NOTICE 'Migration 014_Scene_Schema_updates.sql already applied, skipping.';
        RETURN;
    END IF;

-- Add missing columns to chapter_scenes
ALTER TABLE chapter_scenes 
    ADD COLUMN IF NOT EXISTS target_word_count INTEGER,
    ADD COLUMN IF NOT EXISTS scene_elements TEXT[],
    ADD COLUMN IF NOT EXISTS scene_outline TEXT,           -- Detailed scene planning/outline
    ADD COLUMN IF NOT EXISTS scene_content TEXT,           -- The actual written scene text
    ADD COLUMN IF NOT EXISTS scene_revisions TEXT[];      -- Array to store revision history if needed

-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS idx_chapter_scenes_elements ON chapter_scenes USING GIN(scene_elements);

-- Add comments to clarify column usage
COMMENT ON COLUMN chapter_scenes.notes IS 'Quick notes and reminders for authors';
COMMENT ON COLUMN chapter_scenes.scene_outline IS 'Detailed scene planning, beat sheet, and structural notes';
COMMENT ON COLUMN chapter_scenes.scene_content IS 'The actual written content of the scene';
COMMENT ON COLUMN chapter_scenes.scene_revisions IS 'Array of previous versions for tracking major revisions';



-- Record this migration
    INSERT INTO migrations (filename) VALUES ('014_Scene_Schema_updates.sql');

END
$$;

COMMIT;