-- Migration to remove NOT NULL and UNIQUE constraints from email field in authors table
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '007_add_event_chapter_mapping.sql') THEN
        RAISE NOTICE 'Migration 007_add_event_chapter_mapping.sql already applied, skipping.';
        RETURN;
    END IF;

-- =============================================
-- CREATE TIMELINE EVENTS TABLE
-- =============================================

-- Create the timeline_events table with all required columns
CREATE TABLE timeline_events (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_date DATE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    time_period VARCHAR(100),
    significance VARCHAR(50) DEFAULT 'minor',
    is_public_knowledge BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event participants table for many-to-many relationship
CREATE TABLE IF NOT EXISTS event_participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES timeline_events(id) ON DELETE CASCADE,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    role_in_event VARCHAR(100), -- e.g., "witness", "victim", "perpetrator"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, character_id)
);

-- =============================================
-- EVENT-CHAPTER MAPPING TABLE
-- =============================================

-- Maps timeline events to their appearance in chapters
CREATE TABLE event_chapter_mappings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES timeline_events(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    scene_number INTEGER, -- Optional: specific scene within chapter
    
    -- How the event is presented
    presentation_type VARCHAR(100), -- direct_scene, flashback, memory, reference, foreshadowing, dream, retelling
    pov_character_id INTEGER REFERENCES characters(id), -- Who experiences/relates this event
    
    -- What portion of the event is shown
    event_aspect VARCHAR(255), -- Which part or perspective of the event is shown
    completeness VARCHAR(50), -- full, partial, glimpse
    
    -- Narrative purpose
    narrative_function TEXT, -- Why this event appears here in the story
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRIGGER FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

CREATE TRIGGER update_event_chapter_mappings_timestamp
    BEFORE UPDATE ON event_chapter_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Event mapping indices
CREATE INDEX idx_event_chapter_mappings_event_id ON event_chapter_mappings(event_id);
CREATE INDEX idx_event_chapter_mappings_chapter_id ON event_chapter_mappings(chapter_id);
CREATE INDEX idx_event_chapter_mappings_presentation ON event_chapter_mappings(presentation_type);
CREATE INDEX idx_event_chapter_mappings_pov ON event_chapter_mappings(pov_character_id);

-- Add indices for new columns and relationships
CREATE INDEX IF NOT EXISTS idx_timeline_events_time_period ON timeline_events(time_period);
CREATE INDEX IF NOT EXISTS idx_timeline_events_significance ON timeline_events(significance);
CREATE INDEX IF NOT EXISTS idx_timeline_events_public ON timeline_events(is_public_knowledge);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_character_id ON event_participants(character_id);

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Create view for events with participants
CREATE OR REPLACE VIEW events_with_participants AS
SELECT 
    t.id as event_id,
    t.event_name,
    t.event_date,
    t.event_description,
    t.series_id,
    t.book_id,
    t.time_period,
    t.significance,
    t.is_public_knowledge,
    array_agg(c.id) FILTER (WHERE c.id IS NOT NULL) AS participant_ids,
    array_agg(c.name) FILTER (WHERE c.id IS NOT NULL) AS participant_names
FROM 
    timeline_events t
    LEFT JOIN event_participants ep ON t.id = ep.event_id
    LEFT JOIN characters c ON ep.character_id = c.id
GROUP BY 
    t.id;


-- Record this migration
    INSERT INTO migrations (filename) VALUES ('007_add_event_chapter_mapping.sql');

END
$$;

COMMIT;