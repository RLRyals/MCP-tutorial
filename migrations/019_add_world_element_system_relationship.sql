-- Migration 019: Add optional relationship between world_elements and world_systems
-- This allows world_elements to optionally belong to a parent world_system
 BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
   -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '019_add_world_element_system_relationship.sql') THEN
        RAISE NOTICE 'Migration 019_add_world_element_system_relationship.sql already applied, skipping.';
        RETURN;
    END IF;

-- Add system_id column to world_elements table
ALTER TABLE world_elements
ADD COLUMN system_id INTEGER REFERENCES world_systems(id) ON DELETE SET NULL;

-- Add index for better query performance when filtering by system
CREATE INDEX idx_world_elements_system_id ON world_elements(system_id);

-- Add comment explaining the relationship
COMMENT ON COLUMN world_elements.system_id IS 'Optional foreign key to world_systems table. Links a specific world element (e.g., "Fire Blast Spell") to its parent system (e.g., "Elemental Magic System")';


END $$;  

COMMIT;