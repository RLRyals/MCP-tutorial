-- Migration: Add missing columns for world-building features
-- Created: 2025-10-06
-- Purpose: Add purpose, allies, and enemies columns for organizations needed for:
--   - Organization relationship tracking
--   - World consistency validation
--   - Organization creation with relationships
DO $$ 
BEGIN     
    -- Check if migration was already applied     
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '008_add_world_schema.sql') THEN         
        RAISE NOTICE 'Migration 017_add_missing_feature_columns.sql already applied, skipping.';         
        RETURN;     
    END IF;  

-- Add purpose to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Add allies and enemies arrays to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS allies INTEGER[] DEFAULT '{}';

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS enemies INTEGER[] DEFAULT '{}';

-- Add helpful comments
COMMENT ON COLUMN organizations.purpose IS 'Purpose/mission of the organization';
COMMENT ON COLUMN organizations.allies IS 'Array of allied organization IDs';
COMMENT ON COLUMN organizations.enemies IS 'Array of enemy organization IDs';


-- Record this migration     
INSERT INTO migrations (filename) VALUES ('017_add_missing_feature_columns.sql');  

END $$;  

COMMIT;