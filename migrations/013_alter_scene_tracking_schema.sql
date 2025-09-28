-- Scene Implementation: Essential Fields for Book Writing
-- Add intensity_level to chapter_scenes table
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '013_alter_scene_tracking_schema.sql') THEN
        RAISE NOTICE 'Migration 013_alter_scene_tracking_schema.sql already applied, skipping.';
        RETURN;
    END IF;


ALTER TABLE chapter_scenes ADD COLUMN IF NOT EXISTS intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 10);

ALTER TABLE character_chapter_presence ADD COLUMN IF NOT EXISTS scene_id INTEGER REFERENCES chapter_scenes(id) ON DELETE SET NULL;

-- Fix missing FK relationship in relationship_dynamics table
-- (if scene_id should reference chapter_scenes)
ALTER TABLE relationship_dynamics ADD CONSTRAINT relationship_dynamics_scene_id_fkey 
    FOREIGN KEY (scene_id) REFERENCES chapter_scenes(id) ON DELETE SET NULL;

-- Add missing fields to existing trope_scenes table
ALTER TABLE trope_scenes ADD COLUMN IF NOT EXISTS scene_id INTEGER REFERENCES chapter_scenes(id) ON DELETE SET NULL;
ALTER TABLE trope_scenes ADD COLUMN IF NOT EXISTS kinks_featured TEXT[]; -- "kinks featured" request fits here
ALTER TABLE trope_scenes ADD COLUMN IF NOT EXISTS implementation_notes TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_chapter_scenes_intensity ON chapter_scenes(intensity_level);
CREATE INDEX IF NOT EXISTS idx_trope_scenes_scene_id ON trope_scenes(id);
CREATE INDEX IF NOT EXISTS idx_trope_scenes_kinks ON trope_scenes USING GIN(kinks_featured);

-- Record this migration
    INSERT INTO migrations (filename) VALUES ('013_alter_scene_tracking_schema.sql');

END
$$;

COMMIT;