-- Migration 006: Add book metadata plot thread and tropes tables
-- This migration adds missing fields to the books table for cover images and genres
-- It also ensures plot thread related tables are properly set up
-- and adds universal trope tracking tables and relationship enhancement tables for polyamorous support.
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '006_add_book_metadata_plot_thread_and_tropes_tables.sql') THEN
        RAISE NOTICE 'Migration  006_add_book_metadata_plot_thread_and_tropes_tables.sql already applied, skipping.';
        RETURN;
    END IF;

-- Add cover_image_url and genre_tags to books table
ALTER TABLE books
    ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(512),
    ADD COLUMN IF NOT EXISTS genre_tags TEXT[];

-- Add to your next migration file
-- For character throughlines
CREATE TABLE character_throughlines (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    character_id INTEGER REFERENCES characters(id),
    throughline_type VARCHAR(50), -- main_character, influence_character, etc.
    character_arc TEXT,
    character_problem TEXT,
    character_solution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, character_id, throughline_type)
);

-- For story appreciations
CREATE TABLE story_appreciations (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    appreciation_type VARCHAR(100),
    appreciation_value TEXT,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
    supporting_evidence TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, appreciation_type, appreciation_value)
);

-- For problem-solution mapping
CREATE TABLE problem_solutions (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    problem TEXT,
    solution TEXT,
    problem_level VARCHAR(50),
    effectiveness VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, problem, solution)
);
-- =============================================
-- UNIVERSAL TROPE TRACKING TABLES
-- =============================================

-- Core trope definitions
CREATE TABLE tropes (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    trope_name VARCHAR(255) NOT NULL,
    trope_category VARCHAR(100), -- romance_trope, character_trope, plot_trope, etc.
    description TEXT,
    common_elements TEXT[],
    typical_trajectory TEXT, -- description of how this trope typically unfolds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trope scene types - the "standard" scenes for a particular trope
CREATE TABLE trope_scene_types (
    id SERIAL PRIMARY KEY,
    trope_id INTEGER REFERENCES tropes(id) ON DELETE CASCADE,
    scene_function VARCHAR(100) NOT NULL, -- opening, middle_build, obstacle, revelation, climax, resolution, etc.
    scene_description TEXT NOT NULL, -- e.g., "Age gap is revealed and causes initial tension"
    typical_placement VARCHAR(50), -- early, middle, climax, resolution
    required BOOLEAN DEFAULT false, -- is this scene essential to the trope
    narrative_purpose TEXT, -- what this scene accomplishes in the narrative
    emotional_beats TEXT[], -- typical emotions evoked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trope_id, scene_function)
);

-- Trope instances in specific books
CREATE TABLE trope_instances (
    id SERIAL PRIMARY KEY,
    trope_id INTEGER REFERENCES tropes(id),
    book_id INTEGER REFERENCES books(id),
    instance_notes TEXT, -- how this trope instance plays out in this book
    subversion_notes TEXT, -- how this instance might subvert the trope
    completion_status VARCHAR(50) DEFAULT 'in_progress', -- planned, in_progress, complete, subverted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specific scenes implementing trope scene types in a book
CREATE TABLE trope_scenes (
    id SERIAL PRIMARY KEY,
    instance_id INTEGER REFERENCES trope_instances(id) ON DELETE CASCADE,
    scene_type_id INTEGER REFERENCES trope_scene_types(id),
    chapter_id INTEGER, -- where this scene appears
    scene_number INTEGER, -- which scene within chapter
    scene_summary TEXT, -- how this specific scene implements the trope scene type
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 10),
    variation_notes TEXT, -- how this differs from the typical implementation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(instance_id, scene_type_id) -- each trope scene type appears once per instance
);

-- =============================================
-- RELATIONSHIP ENHANCEMENT TABLES FOR POLYAMOROUS SUPPORT
-- =============================================

-- Relationship participants for family or polyamorous/"why choose" relationships
-- CREATE TABLE relationship_participants (
--     id SERIAL PRIMARY KEY,
--     --arc_id INTEGER REFERENCES romance_arcs(id) ON DELETE CASCADE,
--     character_id INTEGER REFERENCES characters(id),
--     join_chapter INTEGER, -- when they joined the relationship
--     role_in_relationship TEXT, -- optional descriptor
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(arc_id, character_id)
-- );

-- Dynamics between specific participants in a relationship
-- CREATE TABLE participant_dynamics (
--     id SERIAL PRIMARY KEY,
--     arc_id INTEGER REFERENCES romance_arcs(id),
--     character_a_id INTEGER REFERENCES characters(id),
--     character_b_id INTEGER REFERENCES characters(id),
--     dynamic_type VARCHAR(100), -- romantic, platonic, rivalrous, etc.
--     connection_strength INTEGER CHECK (connection_strength BETWEEN 1 AND 10),
--     notes TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     CHECK (character_a_id != character_b_id)
-- );

-- -- Relationship evolution tracking
-- CREATE TABLE relationship_evolution (
--     evolution_id SERIAL PRIMARY KEY,
--     --arc_id INTEGER REFERENCES romance_arcs(arc_id),
--     chapter_id INTEGER,
--     previous_stage VARCHAR(100),
--     new_stage VARCHAR(100),
--     catalyst TEXT,
--     notes TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


-- Create appropriate triggers for timestamp updates
-- Record this migration
INSERT INTO migrations (filename) VALUES ('006_add_book_metadata_plot_thread_and_tropes_tables.sql');

END
$$;

COMMIT;