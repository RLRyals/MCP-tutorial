-- Idempotent Database Initialization Script
-- This script safely initializes the database and can be run multiple times

-- Migrations table to track applied migrations (must exist before any DO blocks)
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- First migration block
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '001_create_core_schema.sql') THEN
        RAISE NOTICE 'Migration 001_create_core_schema.sql already applied, skipping.';
        RETURN;
    END IF;

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series table - the top-level container for all content
CREATE TABLE IF NOT EXISTS series (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    target_audience VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table - individual books within a series
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    book_number INTEGER,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, draft, editing, published
    target_word_count INTEGER,
    actual_word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, book_number)
);

-- Series timeline - master timeline for the series
CREATE TABLE IF NOT EXISTS series_timeline (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

 -- Create the universal metadata table
    CREATE TABLE IF NOT EXISTS metadata (
        id SERIAL PRIMARY KEY,
        series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        metadata_key VARCHAR(255) NOT NULL,
        metadata_value TEXT NOT NULL,
        metadata_type VARCHAR(50) NOT NULL DEFAULT 'string' CHECK (metadata_type IN ('string', 'number', 'date', 'url', 'json')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- Ensure either series_id or book_id is provided, but not both
        CONSTRAINT metadata_context_check CHECK (
            (series_id IS NOT NULL AND book_id IS NULL) OR 
            (series_id IS NULL AND book_id IS NOT NULL)
        ),
        -- Ensure unique metadata keys within the same context
        CONSTRAINT unique_series_metadata_key UNIQUE (series_id, metadata_key) DEFERRABLE INITIALLY DEFERRED,
        CONSTRAINT unique_book_metadata_key UNIQUE (book_id, metadata_key) DEFERRABLE INITIALLY DEFERRED
    );

-- Utility function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_authors_timestamp ON authors;
DROP TRIGGER IF EXISTS update_authors_timestamp ON authors;
CREATE TRIGGER update_authors_timestamp
    BEFORE UPDATE ON authors
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_series_timestamp ON series;
DROP TRIGGER IF EXISTS update_series_timestamp ON series;
CREATE TRIGGER update_series_timestamp
    BEFORE UPDATE ON series
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_books_timestamp ON books;
DROP TRIGGER IF EXISTS update_books_timestamp ON books;
CREATE TRIGGER update_books_timestamp
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_series_timeline_timestamp ON series_timeline;
DROP TRIGGER IF EXISTS update_series_timeline_timestamp ON series_timeline;
CREATE TRIGGER update_series_timeline_timestamp
    BEFORE UPDATE ON series_timeline
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS metadata_update_timestamp ON metadata;
DROP TRIGGER IF EXISTS metadata_update_timestamp ON metadata;
CREATE TRIGGER metadata_update_timestamp
    BEFORE UPDATE ON metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Create indices for performance optimization
-- Optimize author lookups
CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email);

-- Optimize series lookups
CREATE INDEX IF NOT EXISTS idx_series_title ON series(title);
CREATE INDEX IF NOT EXISTS idx_series_author_id ON series(author_id);

-- Optimize book lookups within series
CREATE INDEX IF NOT EXISTS idx_books_series_id ON books(series_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);

-- Optimize timeline lookups
CREATE INDEX IF NOT EXISTS idx_series_timeline_series_id ON series_timeline(series_id);

-- Optimize metadata lookups
--CREATE INDEX IF NOT EXISTS idx_series_metadata_series_id_key ON series_metadata(series_id, key);

   -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_metadata_series_id ON metadata(series_id) WHERE series_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_metadata_book_id ON metadata(book_id) WHERE book_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_metadata_key ON metadata(metadata_key);
    CREATE INDEX IF NOT EXISTS idx_metadata_type ON metadata(metadata_type);

-- Record this migration
INSERT INTO migrations (filename) VALUES ('001_create_core_schema.sql')
    ON CONFLICT (filename) DO NOTHING;

END $$;
-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '002_update_series_schema.sql') THEN
        RAISE NOTICE 'Migration 002_update_series_schema.sql already applied, skipping.';
        RETURN;
    END IF;

    -- First rename series_id to id for consistency with code
    ALTER TABLE books DROP CONSTRAINT books_series_id_fkey;
    ALTER TABLE series_timeline DROP CONSTRAINT series_timeline_series_id_fkey;
    --ALTER TABLE series_metadata DROP CONSTRAINT series_metadata_series_id_fkey;

    --ALTER TABLE series RENAME COLUMN series_id TO id;

    -- Update foreign key constraints to point to new column name
    ALTER TABLE books ADD CONSTRAINT books_series_id_fkey
        FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;
    ALTER TABLE series_timeline ADD CONSTRAINT series_timeline_series_id_fkey
        FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;
    -- ALTER TABLE series_metadata ADD CONSTRAINT series_metadata_series_id_fkey
    --     FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE;

    -- Add new columns
    ALTER TABLE series ADD COLUMN IF NOT EXISTS status VARCHAR(50) 
        CHECK (status IN ('ongoing', 'completed', 'hiatus')) DEFAULT 'ongoing';
    ALTER TABLE series ADD COLUMN IF NOT EXISTS start_year INTEGER;

    ALTER TABLE authors ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE authors ADD COLUMN IF NOT EXISTS birth_year INTEGER;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS publication_year INTEGER;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS isbn VARCHAR(20);
    ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER;

    -- Update indices to use new column name
    DROP INDEX IF EXISTS idx_series_author_id;
    CREATE INDEX IF NOT EXISTS idx_series_author_id ON series(author_id);

    -- Add new indices for new columns

    CREATE INDEX IF NOT EXISTS idx_series_status ON series(status);
    CREATE INDEX IF NOT EXISTS idx_series_start_year ON series(start_year);

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('002_update_series_schema.sql')
        ON CONFLICT (filename) DO NOTHING;
END
$$;
-- Migration: 003_add_character_and_chapter_schema
-- Description: Adds comprehensive character and chapter tracking tables for the MCP system
-- Date: 2025-09-09
-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '003_add_character_schema.sql') THEN
        RAISE NOTICE 'Migration 003_add_character_schema.sql already applied, skipping.';
        RETURN;
    END IF;

-- =============================================
-- CHARACTER MANAGEMENT TABLES
-- =============================================

-- Characters table - core character information
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(500),
    aliases TEXT[], -- Array of alternative names/nicknames
    character_type VARCHAR(50) DEFAULT 'main', -- main, supporting, minor, antagonist
    first_appearance_book_id INTEGER REFERENCES books(id),
    last_appearance_book_id INTEGER REFERENCES books(id),
    status VARCHAR(50) DEFAULT 'alive', -- alive, dead, missing, unknown
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character details - physical and personality traits
CREATE TABLE IF NOT EXISTS character_details (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- physical, personality, background, skills, etc.
    attribute VARCHAR(100) NOT NULL, -- eye_color, height, temperament, etc.
    value TEXT NOT NULL,
    source_book_id INTEGER REFERENCES books(id), -- where this was established
    confidence_level VARCHAR(20) DEFAULT 'established', -- established, mentioned, implied
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, category, attribute)
);

-- Character arcs - development tracking across books
CREATE TABLE IF NOT EXISTS character_arcs (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    arc_name VARCHAR(255),
    starting_state TEXT,
    ending_state TEXT,
    key_events TEXT[],
    growth_areas TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, book_id)
);

-- Character knowledge - tracks what each character knows and when
CREATE TABLE IF NOT EXISTS character_knowledge (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    knowledge_category VARCHAR(100) NOT NULL, -- secret, skill, person, location, event
    knowledge_item VARCHAR(255) NOT NULL,
    knowledge_level VARCHAR(50) DEFAULT 'knows', -- knows, suspects, unaware, forgot
    learned_book_id INTEGER REFERENCES books(id),
    learned_context TEXT, -- how/when they learned this
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CHAPTER MANAGEMENT TABLES
-- =============================================

-- Core chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255), -- "The Discovery", "Into the Night", etc.
    subtitle VARCHAR(255), -- optional subtitle or alternate title
    
    -- Structure and organization
    part_number INTEGER, -- for books divided into parts
    section_name VARCHAR(100), -- "Part I: The Beginning", etc.
    
    -- Content metadata
    summary TEXT, -- brief chapter summary
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER, -- planned length
    page_count INTEGER, -- actual pages in published version
    
    -- Writing process tracking
    status VARCHAR(50) DEFAULT 'planned', -- planned, outlined, drafted, revised, final
    draft_number INTEGER DEFAULT 1,
    
    -- Timing and structure
    story_time_start TEXT, -- "Day 1, 3pm" or "January 15th, morning"
    story_time_end TEXT, -- when chapter events end
    story_duration TEXT, -- "2 hours", "3 days", "instant"
    
    -- Narrative structure
    pov_character_id INTEGER REFERENCES characters(id), -- whose POV
    narrative_style VARCHAR(50), -- first_person, third_limited, third_omniscient
    tense VARCHAR(20), -- present, past, mixed
    
    -- Chapter function in story
    chapter_purpose TEXT[], -- setup, character_development, plot_advancement, climax, resolution
    dramatic_function VARCHAR(50), -- exposition, rising_action, climax, falling_action, resolution
    
    -- Location and setting
    primary_location TEXT, -- main setting for this chapter
    secondary_locations TEXT[], -- other locations visited
    
    -- Chapter notes and planning
    author_notes TEXT, -- planning notes, reminders
    writing_notes TEXT, -- notes about the writing process
    revision_notes TEXT, -- what needs to be changed
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure chapter numbers are unique within a book
    UNIQUE(book_id, chapter_number)
);

-- Chapter scenes - for more granular tracking within chapters
CREATE TABLE IF NOT EXISTS chapter_scenes (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    scene_number INTEGER NOT NULL, -- 1, 2, 3 within the chapter
    scene_title VARCHAR(255), -- optional scene name
    
    -- Scene structure
    scene_purpose VARCHAR(100), -- action, dialogue, description, transition
    scene_type VARCHAR(50), -- dramatic, comedic, action, romance, mystery
    
    -- Location and time
    location TEXT,
    time_of_day VARCHAR(50),
    duration TEXT, -- how long this scene takes
    
    -- Content
    summary TEXT,
    word_count INTEGER DEFAULT 0,
    
    -- Characters in scene
    pov_character_id INTEGER REFERENCES characters(id),
    scene_participants INTEGER[], -- array of character_ids present
    
    -- Scene notes
    notes TEXT,
    writing_status VARCHAR(50) DEFAULT 'planned',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(chapter_id, scene_number)
);

-- Character presence in chapters - who appears where
CREATE TABLE IF NOT EXISTS character_chapter_presence (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    
    -- Type of presence
    presence_type VARCHAR(50) NOT NULL, -- present, mentioned, flashback, dream, phone_call
    importance_level VARCHAR(50), -- major, minor, cameo, background
    
    -- Physical state and description
    physical_state TEXT, -- healthy, injured, tired, disguised, etc.
    emotional_state TEXT, -- happy, angry, confused, suspicious, etc.
    clothing_description TEXT,
    notable_appearance_details TEXT,
    
    -- Character's role in this chapter
    character_function TEXT[], -- protagonist, antagonist, comic_relief, exposition, catalyst
    goals_in_chapter TEXT[], -- what they're trying to achieve
    obstacles_faced TEXT[], -- what's blocking them
    
    -- Arrival and departure
    enters_at_scene INTEGER, -- which scene number they arrive
    exits_at_scene INTEGER, -- which scene number they leave
    arrival_method TEXT, -- how they got there
    departure_method TEXT, -- how they left
    
    -- Interactions
    interacts_with INTEGER[], -- character_ids they interact with
    conflicts_with INTEGER[], -- character_ids they conflict with
    allies_with INTEGER[], -- character_ids they work with
    
    -- Knowledge and secrets
    learns_this_chapter TEXT[], -- new information gained
    reveals_this_chapter TEXT[], -- secrets they reveal
    suspects_this_chapter TEXT[], -- new suspicions formed
    
    -- Character development
    character_growth TEXT, -- how they change in this chapter
    key_decisions TEXT[], -- important choices they make
    mistakes_made TEXT[], -- errors that will have consequences
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(character_id, chapter_id)
);

-- Chapter relationships - how chapters connect to each other
-- CREATE TABLE chapter_relationships (
--     relationship_id SERIAL PRIMARY KEY,
--     chapter_a_id INTEGER NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
--     chapter_b_id INTEGER NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    
--     relationship_type VARCHAR(50), -- sequel, prequel, parallel, flashback, callback
--     connection_description TEXT, -- how they're connected
--     dependency_level VARCHAR(50), -- must_read_first, helpful_context, standalone
    
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
--     CHECK (chapter_a_id != chapter_b_id)
-- );

-- Chapter plot points - key events that happen (foundation for Plot-Timeline MCP)
CREATE TABLE IF NOT EXISTS chapter_plot_points (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    scene_id INTEGER REFERENCES chapter_scenes(id), -- optional: specific scene
    
    -- Plot point details
    plot_point_type VARCHAR(50), -- inciting_incident, plot_twist, revelation, climax, resolution
    event_description TEXT,
    importance_level VARCHAR(50), -- critical, major, minor, setup
    
    -- Story impact
    affects_characters INTEGER[], -- character_ids affected by this event
    changes_relationships TEXT[], -- how relationships change
    reveals_information TEXT[], -- what's revealed
    creates_conflicts TEXT[], -- new conflicts started
    resolves_conflicts TEXT[], -- conflicts resolved
    
    -- Consequences and setup
    immediate_consequences TEXT[],
    long_term_consequences TEXT[],
    sets_up_future_events TEXT[], -- what this enables later
    pays_off_previous_setup TEXT[], -- what previous setup this resolves
    
    -- Timing within chapter
    occurs_at_scene INTEGER, -- which scene this happens in
    timing_within_scene VARCHAR(50), -- beginning, middle, end, throughout
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

-- Character table triggers
DROP TRIGGER IF EXISTS update_characters_timestamp ON characters;
CREATE TRIGGER update_characters_timestamp
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_character_details_timestamp ON character_details;
CREATE TRIGGER update_character_details_timestamp
    BEFORE UPDATE ON character_details
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_character_arcs_timestamp ON character_arcs;
CREATE TRIGGER update_character_arcs_timestamp
    BEFORE UPDATE ON character_arcs
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_character_knowledge_timestamp ON character_knowledge;
CREATE TRIGGER update_character_knowledge_timestamp
    BEFORE UPDATE ON character_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Chapter table triggers
DROP TRIGGER IF EXISTS update_chapters_timestamp ON chapters;
CREATE TRIGGER update_chapters_timestamp
    BEFORE UPDATE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_chapter_scenes_timestamp ON chapter_scenes;
CREATE TRIGGER update_chapter_scenes_timestamp
    BEFORE UPDATE ON chapter_scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_character_chapter_presence_timestamp ON character_chapter_presence;
CREATE TRIGGER update_character_chapter_presence_timestamp
    BEFORE UPDATE ON character_chapter_presence
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_chapter_plot_points_timestamp ON chapter_plot_points;
CREATE TRIGGER update_chapter_plot_points_timestamp
    BEFORE UPDATE ON chapter_plot_points
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Character indices
CREATE INDEX IF NOT EXISTS idx_characters_series_id ON characters(series_id);
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);
CREATE INDEX IF NOT EXISTS idx_characters_type ON characters(character_type);
CREATE INDEX IF NOT EXISTS idx_characters_status ON characters(status);

CREATE INDEX IF NOT EXISTS idx_character_details_character_id ON character_details(character_id);
CREATE INDEX IF NOT EXISTS idx_character_details_category ON character_details(category);
CREATE INDEX IF NOT EXISTS idx_character_details_category_attribute ON character_details(character_id, category, attribute);

CREATE INDEX IF NOT EXISTS idx_character_arcs_character_id ON character_arcs(character_id);
CREATE INDEX IF NOT EXISTS idx_character_arcs_book_id ON character_arcs(book_id);

CREATE INDEX IF NOT EXISTS idx_character_knowledge_character_id ON character_knowledge(character_id);
CREATE INDEX IF NOT EXISTS idx_character_knowledge_category ON character_knowledge(knowledge_category);

-- Chapter indices
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book_chapter ON chapters(book_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapters_status ON chapters(status);
CREATE INDEX IF NOT EXISTS idx_chapters_pov_character ON chapters(pov_character_id);

CREATE INDEX IF NOT EXISTS idx_chapter_scenes_chapter_id ON chapter_scenes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_scenes_chapter_scene ON chapter_scenes(chapter_id, scene_number);

CREATE INDEX IF NOT EXISTS idx_character_chapter_presence_character ON character_chapter_presence(character_id);
CREATE INDEX IF NOT EXISTS idx_character_chapter_presence_chapter ON character_chapter_presence(chapter_id);
CREATE INDEX IF NOT EXISTS idx_character_chapter_presence_type ON character_chapter_presence(presence_type);

CREATE INDEX IF NOT EXISTS idx_chapter_plot_points_chapter ON chapter_plot_points(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_plot_points_type ON chapter_plot_points(plot_point_type);
CREATE INDEX IF NOT EXISTS idx_chapter_plot_points_scene ON chapter_plot_points(scene_id);

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('003_add_character_schema.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- Description: Fixed plot management with dynamic lookup tables (no hardcoded enums)
-- Date: 2025-09-13
-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '004_plot_structure_and_universal_framework.sql') THEN
        RAISE NOTICE 'Migration 004_plot_structure_and_universal_framework.sql already applied, skipping.';
        RETURN;
    END IF;

-- =============================================
-- UNIVERSAL LOOKUP TABLES (NO HARDCODED ENUMS!)
-- =============================================

-- Base genres (foundation for all genre-specific work)
CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL UNIQUE,
    genre_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plot thread types (dynamic, not hardcoded)
CREATE TABLE IF NOT EXISTS plot_thread_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    type_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plot thread statuses (dynamic, not hardcoded)  
CREATE TABLE IF NOT EXISTS plot_thread_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    status_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationship types (dynamic, not hardcoded)
CREATE TABLE IF NOT EXISTS relationship_types (
    id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    type_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story concerns 
CREATE TABLE IF NOT EXISTS story_concerns (
    id SERIAL PRIMARY KEY,
    concern_name VARCHAR(100) NOT NULL UNIQUE,
    concern_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story outcomes (expandable)
CREATE TABLE IF NOT EXISTS story_outcomes (
    id SERIAL PRIMARY KEY,
    outcome_name VARCHAR(50) NOT NULL UNIQUE,
    outcome_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story judgments (expandable)
CREATE TABLE IF NOT EXISTS story_judgments (
    id SERIAL PRIMARY KEY,
    judgment_name VARCHAR(50) NOT NULL UNIQUE,
    judgment_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CORE PLOT THREAD MANAGEMENT (LOOKUP-BASED)
-- =============================================

-- Plot threads - story arcs, subplots, character arcs
CREATE TABLE IF NOT EXISTS plot_threads (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Thread categorization (using lookup tables)
    thread_type_id INTEGER REFERENCES plot_thread_types(id),
    importance_level INTEGER DEFAULT 5 CHECK (importance_level >= 1 AND importance_level <= 10),
    complexity_level INTEGER DEFAULT 5 CHECK (complexity_level >= 1 AND complexity_level <= 10),
    
    -- Thread span and status (using lookup table)
    start_book INTEGER,
    end_book INTEGER,
    current_status_id INTEGER DEFAULT 1 REFERENCES plot_thread_statuses(id),
    
    -- Thread relationships
    parent_thread_id INTEGER REFERENCES plot_threads(id),
    related_characters INTEGER[],
    
    -- Resolution tracking
    resolution_notes TEXT,
    resolution_book INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (end_book IS NULL OR end_book >= start_book)
);

-- Plot thread relationships (using lookup table)
CREATE TABLE IF NOT EXISTS plot_thread_relationships (
    id SERIAL PRIMARY KEY,
    thread_a_id INTEGER NOT NULL REFERENCES plot_threads(id) ON DELETE CASCADE,
    thread_b_id INTEGER NOT NULL REFERENCES plot_threads(id) ON DELETE CASCADE,
    
    relationship_type_id INTEGER NOT NULL REFERENCES relationship_types(id),
    relationship_description TEXT,
    strength INTEGER DEFAULT 5 CHECK (strength >= 1 AND strength <= 10),
    
    established_book INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (thread_a_id != thread_b_id)
);

-- =============================================
-- STORY ANALYSIS 
-- =============================================

-- Core story analysis table for  flexible analysis
-- CREATE TABLE IF NOT EXISTS story_analysis (
--     id SERIAL PRIMARY KEY,
--     book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
--     -- Plot elements (using lookup tables)
--     story_concern_id INTEGER REFERENCES story_concerns(id),
--     main_character_problem TEXT,
--     influence_character_impact TEXT,
--     story_outcome_id INTEGER REFERENCES story_outcomes(id),
--     story_judgment_id INTEGER REFERENCES story_judgments(id),
--     thematic_elements JSONB,
    
--     -- General analysis notes
--     analysis_notes TEXT,
    
--     -- Metadata
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- -- Story analysis triggers
-- CREATE TRIGGER update_story_analysis_timestamp
--     BEFORE UPDATE ON story_analysis
--     FOR EACH ROW
--     EXECUTE FUNCTION update_timestamp();
-- -- Analysis indices
-- CREATE INDEX IF NOT EXISTS idx_story_analysis_book_id ON story_analysis(book_id);
-- CREATE INDEX IF NOT EXISTS idx_story_analysis_concern ON story_analysis(story_concern_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

-- Plot thread triggers
DROP TRIGGER IF EXISTS update_plot_threads_timestamp ON plot_threads;
CREATE TRIGGER update_plot_threads_timestamp
    BEFORE UPDATE ON plot_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_plot_thread_relationships_timestamp ON plot_thread_relationships;
CREATE TRIGGER update_plot_thread_relationships_timestamp
    BEFORE UPDATE ON plot_thread_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Genre and lookup indices
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(genre_name);
CREATE INDEX IF NOT EXISTS idx_plot_thread_types_name ON plot_thread_types(type_name);
CREATE INDEX IF NOT EXISTS idx_plot_thread_statuses_name ON plot_thread_statuses(status_name);
CREATE INDEX IF NOT EXISTS idx_relationship_types_name ON relationship_types(type_name);

-- Plot thread indices
CREATE INDEX IF NOT EXISTS idx_plot_threads_series_id ON plot_threads(id);
CREATE INDEX IF NOT EXISTS idx_plot_threads_type_status ON plot_threads(thread_type_id, current_status_id);
CREATE INDEX IF NOT EXISTS idx_plot_threads_books ON plot_threads(start_book, end_book);
CREATE INDEX IF NOT EXISTS idx_plot_threads_parent ON plot_threads(parent_thread_id);

-- Relationship indices
CREATE INDEX IF NOT EXISTS idx_plot_thread_relationships_thread_a ON plot_thread_relationships(thread_a_id);
CREATE INDEX IF NOT EXISTS idx_plot_thread_relationships_thread_b ON plot_thread_relationships(thread_b_id);
CREATE INDEX IF NOT EXISTS idx_plot_thread_relationships_type ON plot_thread_relationships(relationship_type_id);

-- =============================================
-- INITIAL LOOKUP DATA
-- =============================================

-- Insert base genres
INSERT INTO genres (genre_name, genre_description) VALUES
('romance', 'Stories focused on romantic relationships and emotional connection'),
('fantasy', 'Stories set in imaginary worlds with magical or supernatural elements'),
('mystery', 'Stories involving puzzles, crimes, or unexplained events to be solved'),
('thriller', 'Stories designed to create suspense, excitement, and tension'),
('science_fiction', 'Stories set in the future or alternative worlds with advanced technology'),
('historical_fiction', 'Stories set in the past with historical accuracy and detail'),
('contemporary', 'Stories set in the present day with realistic scenarios'),
('young_adult', 'Stories targeted at teenage readers with coming-of-age themes'),
('literary_fiction', 'Character-driven stories with artistic and literary merit'),
('action_adventure', 'Fast-paced stories with exciting adventures and conflicts');

-- Insert plot thread types
INSERT INTO plot_thread_types (type_name, type_description) VALUES
('series_arc', 'Multi-book overarching storyline'),
('mini_arc', 'Short storyline spanning 2-3 books'),
('main_case', 'Primary mystery or central conflict of a book'),
('subplot', 'Secondary storyline that supports the main plot'),
('character_arc', 'Character development and growth storyline'),
('mystery_element', 'Specific mystery or puzzle element'),
('romance_arc', 'Romantic relationship development'),
('world_building', 'Elements that build and expand the fictional world');

-- Insert plot thread statuses  
INSERT INTO plot_thread_statuses (status_name, status_description) VALUES
('active', 'Thread is currently progressing'),
('resolved', 'Thread has been completed and resolved'),
('on_hold', 'Thread is paused but will continue later'),
('abandoned', 'Thread has been permanently discontinued'),
('planning', 'Thread is in planning phase but not yet active'),
('suspended', 'Thread is temporarily suspended pending other developments');

-- Insert relationship types
INSERT INTO relationship_types (type_name, type_description) VALUES
('enables', 'One thread enables or makes possible another thread'),
('conflicts_with', 'Threads are in direct opposition or conflict'),
('supports', 'One thread supports or reinforces another'),
('reveals', 'One thread reveals information about another'),
('resolves', 'One thread resolves or concludes another'),
('depends_on', 'One thread depends on another for resolution'),
('parallels', 'Threads run parallel with similar themes'),
('contrasts', 'Threads contrast to highlight differences');

-- Insert story concerns 
INSERT INTO story_concerns (concern_name, concern_description) VALUES
('obtaining', 'Story about getting or acquiring something'),
('understanding', 'Story about learning or comprehending'),
('becoming', 'Story about transformation or change'),
('conceiving', 'Story about creating or developing ideas'),
('doing', 'Story about actions and activities'),
('being', 'Story about states of existence or identity');

-- Insert story outcomes
INSERT INTO story_outcomes (outcome_name, outcome_description) VALUES
('success', 'The story goal is achieved'),
('failure', 'The story goal is not achieved'),
('partial_success', 'The story goal is partially achieved'),
('pyrrhic_victory', 'Success achieved at great cost'),
('ambiguous', 'Outcome is unclear or open to interpretation');

-- Insert story judgments
INSERT INTO story_judgments (judgment_name, judgment_description) VALUES
('good', 'The outcome feels positive and satisfying'),
('bad', 'The outcome feels negative or unsatisfying'),
('bittersweet', 'Mixed feelings about the outcome'),
('neutral', 'No strong emotional judgment about the outcome'),
('cathartic', 'Emotionally cleansing or purifying outcome');

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('004_plot_structure_and_universal_framework_fixed.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '005_update_author_email_constraint.sql') THEN
        RAISE NOTICE 'Migration 005_update_author_email_constraint.sql already applied, skipping.';
        RETURN;
    END IF;

ALTER TABLE authors 
    ALTER COLUMN email DROP NOT NULL;

ALTER TABLE authors 
    DROP CONSTRAINT IF EXISTS authors_email_key;

-- Record this migration
    INSERT INTO migrations (filename) VALUES ('005_update_author_email_constraint.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- This migration adds missing fields to the books table for cover images and genres
-- It also ensures plot thread related tables are properly set up
-- and adds universal trope tracking tables and relationship enhancement tables for polyamorous support.
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
-- CREATE TABLE character_throughlines (
--     id SERIAL PRIMARY KEY,
--     book_id INTEGER REFERENCES books(id),
--     character_id INTEGER REFERENCES characters(id),
--     throughline_type VARCHAR(50), -- main_character, influence_character, etc.
--     character_arc TEXT,
--     character_problem TEXT,
--     character_solution TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(book_id, character_id, throughline_type)
-- );

-- -- For story appreciations
-- CREATE TABLE story_appreciations (
--     id SERIAL PRIMARY KEY,
--     book_id INTEGER REFERENCES books(id),
--     appreciation_type VARCHAR(100),
--     appreciation_value TEXT,
--     confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
--     supporting_evidence TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(book_id, appreciation_type, appreciation_value)
-- );

-- -- For problem-solution mapping
-- CREATE TABLE problem_solutions (
--     id SERIAL PRIMARY KEY,
--     book_id INTEGER REFERENCES books(id),
--     problem TEXT,
--     solution TEXT,
--     problem_level VARCHAR(50),
--     effectiveness VARCHAR(50),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(book_id, problem, solution)
-- );
-- =============================================
-- UNIVERSAL TROPE TRACKING TABLES
-- =============================================

-- Core trope definitions
CREATE TABLE IF NOT EXISTS tropes (
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
CREATE TABLE IF NOT EXISTS trope_scene_types (
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

-- Create appropriate triggers for timestamp updates
-- Record this migration
INSERT INTO migrations (filename) VALUES ('006_add_book_metadata_plot_thread_and_tropes_tables.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

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

DROP TRIGGER IF EXISTS update_event_chapter_mappings_timestamp ON event_chapter_mappings;
CREATE TRIGGER update_event_chapter_mappings_timestamp
    BEFORE UPDATE ON event_chapter_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Event mapping indices
CREATE INDEX IF NOT EXISTS idx_event_chapter_mappings_event_id ON event_chapter_mappings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_chapter_mappings_chapter_id ON event_chapter_mappings(chapter_id);
CREATE INDEX IF NOT EXISTS idx_event_chapter_mappings_presentation ON event_chapter_mappings(presentation_type);
CREATE INDEX IF NOT EXISTS idx_event_chapter_mappings_pov ON event_chapter_mappings(pov_character_id);

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
    INSERT INTO migrations (filename) VALUES ('007_add_event_chapter_mapping.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- Check if migration was already applied and execute migration if needed 
DO $$ 
BEGIN     
    -- Check if migration was already applied     
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '008_add_world_schema.sql') THEN         
        RAISE NOTICE 'Migration 008_add_world_schema.sql already applied, skipping.';         
        RETURN;     
    END IF;  

-- ========================================
-- LOCATIONS TABLE - Physical world places
-- ========================================

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(100) NOT NULL, -- city, forest, building, region, landmark, etc.
    description TEXT,
    
    -- Geographic relationships
    parent_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    
    -- Environmental details
    climate VARCHAR(100),
    terrain VARCHAR(100),
    notable_features TEXT[], -- array of notable landmarks or features
    atmosphere TEXT, -- mood or feel of the location
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- WORLD ELEMENTS TABLE - Magic, tech, natural laws
-- ========================================

CREATE TABLE world_elements (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    element_type VARCHAR(100) NOT NULL, -- magic_system, technology, natural_law, supernatural, etc.
    description TEXT,
    
    -- System details
    rules_text TEXT, -- how this element works
    limitations TEXT, -- what restricts this element
    power_level INTEGER CHECK (power_level BETWEEN 1 AND 10),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ORGANIZATIONS TABLE - Groups, guilds, governments
-- ========================================

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100) NOT NULL, -- government, guild, criminal, religious, military, etc.
    description TEXT,
    
    -- Structure and relationships
    headquarters_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    parent_organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Power and influence
    influence_level INTEGER CHECK (influence_level BETWEEN 1 AND 10),
    member_count INTEGER,
    status VARCHAR(50) DEFAULT 'active', -- active, disbanded, dormant, secret
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- WORLD ELEMENT USAGE TABLE - Track where world elements appear
-- ========================================

CREATE TABLE world_element_usage (
    id SERIAL PRIMARY KEY,
    element_type VARCHAR(50) NOT NULL, -- location, world_element, organization
    element_id INTEGER NOT NULL,
    
    -- Story context
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    
    -- Usage details
    usage_notes TEXT,
    importance_level VARCHAR(50) DEFAULT 'minor', -- major, minor, background, mention
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDICES FOR PERFORMANCE
-- ========================================

-- Location indices
CREATE INDEX IF NOT EXISTS idx_locations_series_id ON locations(series_id);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(location_type);
CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_location_id);

-- World element indices
CREATE INDEX IF NOT EXISTS idx_world_elements_series_id ON world_elements(series_id);
CREATE INDEX IF NOT EXISTS idx_world_elements_name ON world_elements(name);
CREATE INDEX IF NOT EXISTS idx_world_elements_type ON world_elements(element_type);

-- Organization indices
CREATE INDEX IF NOT EXISTS idx_organizations_series_id ON organizations(series_id);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_organizations_headquarters ON organizations(headquarters_location_id);

-- Usage tracking indices
CREATE INDEX IF NOT EXISTS idx_world_usage_element ON world_element_usage(element_type, element_id);
CREATE INDEX IF NOT EXISTS idx_world_usage_book ON world_element_usage(book_id);
CREATE INDEX IF NOT EXISTS idx_world_usage_chapter ON world_element_usage(chapter_id);

-- ========================================
-- UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ========================================

DROP TRIGGER IF EXISTS update_locations_timestamp ON locations;
CREATE TRIGGER update_locations_timestamp
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_world_elements_timestamp ON world_elements;
CREATE TRIGGER update_world_elements_timestamp
    BEFORE UPDATE ON world_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_organizations_timestamp ON organizations;
CREATE TRIGGER update_organizations_timestamp
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Record this migration     
INSERT INTO migrations (filename) VALUES ('008_add_world_schema.sql')
    ON CONFLICT (filename) DO NOTHING;  

END $$;  

-- Description: Adds writing sessions, goals, validation, and export tracking for AI writing team
-- Date: 2025-09-16
-- Check if migration was already applied and execute migration if needed 
DO $$ 
BEGIN     
    -- Check if migration was already applied     
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '009_writing_migration.sql') THEN         
        RAISE NOTICE 'Migration 009_writing_migration.sql already applied, skipping.';         
        RETURN;     
    END IF;  

-- =============================================
-- WRITING SESSIONS TABLE
-- =============================================

-- Writing sessions - AI team tracks productivity automatically
CREATE TABLE writing_sessions (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id), -- optional specific chapter focus
    
    -- Session timing
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    
    -- Productivity metrics for AI team analysis
    words_written INTEGER DEFAULT 0,
    words_edited INTEGER DEFAULT 0,
    net_words INTEGER DEFAULT 0, -- calculated: words_written - words_edited
    
    -- Session context for AI team insights
    session_type VARCHAR(50) DEFAULT 'writing', -- writing, editing, planning, research
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    focus_quality VARCHAR(50), -- excellent, good, fair, poor
    
    -- Environment and notes
    writing_location VARCHAR(100),
    distractions TEXT,
    session_notes TEXT,
    goals_for_session TEXT,
    goals_achieved BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link sessions to multiple chapters worked on
CREATE TABLE session_chapters (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES writing_sessions(id) ON DELETE CASCADE,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    words_written_on_chapter INTEGER DEFAULT 0,
    
    UNIQUE(session_id, chapter_id)
);

-- =============================================
-- WRITING GOALS TABLE
-- =============================================

-- Writing goals - AI team tracks progress automatically
CREATE TABLE writing_goals (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
    -- Goal definition
    goal_type VARCHAR(50) NOT NULL, -- daily_words, weekly_words, monthly_words, chapter_completion, book_completion
    target_value INTEGER NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    
    -- Progress tracking for AI team
    current_progress INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed BOOLEAN DEFAULT false,
    completion_date DATE,
    
    -- Goal context
    description TEXT,
    motivation TEXT,
    reward TEXT, -- what happens when goal is achieved
    
    -- Status
    active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a partial unique index for active goals
CREATE UNIQUE INDEX idx_unique_active_goals ON writing_goals (book_id, goal_type, target_date) 
WHERE active = true;

-- =============================================
-- MANUSCRIPT EXPORTS TABLE
-- =============================================

-- Manuscript exports - AI team prepares manuscripts automatically
CREATE TABLE manuscript_exports (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
    -- Export details
    export_format VARCHAR(50) NOT NULL, -- txt, rtf, md, pdf, docx, standard_manuscript
    export_type VARCHAR(50) NOT NULL, -- full_manuscript, partial, outline, summary
    chapters_included INTEGER[], -- array of chapter IDs included
    
    -- Export metadata for AI team tracking
    total_word_count INTEGER,
    total_pages INTEGER,
    export_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- File information
    filename VARCHAR(255),
    file_size INTEGER, -- in bytes
    file_path TEXT, -- if stored to filesystem
    
    -- Export settings used by AI team
    include_chapter_summaries BOOLEAN DEFAULT false,
    include_character_notes BOOLEAN DEFAULT false,
    include_metadata BOOLEAN DEFAULT true,
    formatting_template VARCHAR(100),
    
    -- Export context
    export_notes TEXT,
    intended_use VARCHAR(100), -- submission, review, backup, publication, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- VALIDATION RULES TABLE
-- =============================================

-- Validation rules - AI team uses for automated quality checking
CREATE TABLE validation_rules (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE, -- null = series-wide rule
    series_id INTEGER REFERENCES series(id) ON DELETE CASCADE, -- null = book-specific rule
    
    -- Rule definition
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- word_count, consistency, structure, custom, character_continuity
    rule_category VARCHAR(50), -- structure, content, consistency, style
    rule_description TEXT,
    
    -- Rule parameters (flexible JSON for different rule types)
    rule_parameters JSONB,
    
    -- Rule settings for AI team
    severity VARCHAR(20) DEFAULT 'warning', -- error, warning, info
    active BOOLEAN DEFAULT true,
    auto_check BOOLEAN DEFAULT true, -- AI team runs automatically
    
    -- Author customization
    author_notes TEXT,
    custom_message TEXT, -- custom message when rule is triggered
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure rule applies to either book or series, not both
    CHECK ((book_id IS NULL) != (series_id IS NULL))
);

-- =============================================
-- VALIDATION RESULTS TABLE
-- =============================================

-- Validation results - AI team stores automatic checks
CREATE TABLE validation_results (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    validation_rule_id INTEGER REFERENCES validation_rules(id) ON DELETE CASCADE,
    
    -- Validation context
    chapter_id INTEGER REFERENCES chapters(id), -- specific chapter if applicable
    scene_id INTEGER REFERENCES chapter_scenes(id), -- specific scene if applicable
    
    -- Result details
    validation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result_status VARCHAR(50) NOT NULL, -- passed, failed, warning, info
    violation_count INTEGER DEFAULT 0,
    
    -- Issue details for AI team reporting
    issue_description TEXT,
    suggested_fix TEXT,
    violation_details JSONB, -- flexible details about what was found
    
    -- AI team processing
    auto_generated BOOLEAN DEFAULT true, -- true if generated by AI team
    acknowledged BOOLEAN DEFAULT false, -- if author has seen this
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WORD COUNT TRACKING TABLE
-- =============================================

-- Word count snapshots - AI team tracks changes over time
CREATE TABLE word_count_snapshots (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    
    -- Snapshot details
    snapshot_date DATE DEFAULT CURRENT_DATE,
    snapshot_type VARCHAR(50) DEFAULT 'daily', -- daily, session, milestone
    
    -- Word counts at time of snapshot
    book_word_count INTEGER,
    chapter_word_count INTEGER,
    scene_word_count INTEGER,
    
    -- Changes since last snapshot
    words_added INTEGER DEFAULT 0,
    words_removed INTEGER DEFAULT 0,
    net_change INTEGER DEFAULT 0,
    
    -- Context
    trigger_event VARCHAR(100), -- what caused this snapshot
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

DROP TRIGGER IF EXISTS update_writing_sessions_timestamp ON writing_sessions;
CREATE TRIGGER update_writing_sessions_timestamp
    BEFORE UPDATE ON writing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_writing_goals_timestamp ON writing_goals;
CREATE TRIGGER update_writing_goals_timestamp
    BEFORE UPDATE ON writing_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_validation_rules_timestamp ON validation_rules;
CREATE TRIGGER update_validation_rules_timestamp
    BEFORE UPDATE ON validation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Writing sessions indices for AI team queries
CREATE INDEX IF NOT EXISTS idx_writing_sessions_book_date ON writing_sessions(book_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_writing_sessions_chapter ON writing_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_writing_sessions_productivity ON writing_sessions(book_id, words_written DESC, session_date DESC);

-- Writing goals indices
CREATE INDEX IF NOT EXISTS idx_writing_goals_book_active ON writing_goals(book_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_writing_goals_target_date ON writing_goals(target_date, completed);
CREATE INDEX IF NOT EXISTS idx_writing_goals_type ON writing_goals(goal_type, active);

-- Manuscript exports indices
CREATE INDEX IF NOT EXISTS idx_manuscript_exports_book ON manuscript_exports(book_id, export_date DESC);
CREATE INDEX IF NOT EXISTS idx_manuscript_exports_format ON manuscript_exports(export_format, intended_use);

-- Validation rules and results indices
CREATE INDEX IF NOT EXISTS idx_validation_rules_book_active ON validation_rules(book_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_validation_rules_series_active ON validation_rules(series_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_validation_rules_auto ON validation_rules(auto_check, active) WHERE auto_check = true AND active = true;

CREATE INDEX IF NOT EXISTS idx_validation_results_book ON validation_results(book_id, validation_date DESC);
CREATE INDEX IF NOT EXISTS idx_validation_results_unresolved ON validation_results(resolved, acknowledged) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_validation_results_chapter ON validation_results(chapter_id, result_status);

-- Word count tracking indices
CREATE INDEX IF NOT EXISTS idx_word_count_snapshots_book_date ON word_count_snapshots(book_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_word_count_snapshots_chapter ON word_count_snapshots(chapter_id, snapshot_date DESC);

-- Session chapters link indices
CREATE INDEX IF NOT EXISTS idx_session_chapters_session ON session_chapters(session_id);
CREATE INDEX IF NOT EXISTS idx_session_chapters_chapter ON session_chapters(chapter_id);

-- =============================================
-- DEFAULT VALIDATION RULES
-- =============================================

-- Insert some default validation rules that AI writing team can use
-- These are flexible guidelines, not rigid requirements

-- INSERT INTO validation_rules (rule_name, rule_type, rule_category, rule_description, rule_parameters, severity, auto_check, author_notes) VALUES
-- ('Character Continuity Check', 'character_continuity', 'consistency', 'Check for character presence gaps and consistency issues', 
--     '{"max_gap_chapters": 5, "check_traits": true, "check_knowledge": true}', 
--     'warning', true, 'AI team checks character consistency automatically'),

-- ('Chapter Length Variance', 'word_count', 'structure', 'Flag chapters that vary significantly from average length', 
--     '{"variance_threshold_percent": 50, "min_word_count": 1000}', 
--     'info', true, 'Flexible guideline - extreme length variations flagged for review'),

-- ('POV Consistency', 'consistency', 'structure', 'Check for POV consistency within chapters and across scenes', 
--     '{"allow_head_hopping": false, "check_scene_consistency": true}', 
--     'warning', true, 'Ensures POV remains consistent within narrative units'),

-- ('Timeline Logic', 'consistency', 'content', 'Verify timeline and chronological consistency', 
--     '{"check_travel_time": true, "flag_time_gaps": true}', 
--     'warning', true, 'AI team validates timeline logic automatically'),

-- ('Scene Structure', 'structure', 'structure', 'Check for basic scene structure elements', 
--     '{"require_purpose": false, "flag_empty_scenes": true, "min_scenes_per_chapter": 0}', 
--     'info', true, 'Flexible scene structure guidelines'),

-- ('Word Count Targets', 'word_count', 'structure', 'Track progress against author-defined word count targets', 
--     '{"check_chapter_targets": true, "check_book_targets": true, "variance_warning_percent": 25}', 
--     'info', true, 'Monitors progress against author goals, not rigid requirements');

-- Record this migration
INSERT INTO migrations (filename) VALUES ('009_writing_migration.sql')
    ON CONFLICT (filename) DO NOTHING;

END $$;  

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '010_update_table_schema.sql') THEN
        RAISE NOTICE 'Migration 010_update_table_schema.sql already applied, skipping.';
        RETURN;
    END IF;

ALTER TABLE books 
    --add subtitle, blurb, pitch and hook text columns
    ADD COLUMN IF NOT EXISTS subtitle TEXT,
    ADD COLUMN IF NOT EXISTS blurb TEXT,
    ADD COLUMN IF NOT EXISTS pitch TEXT,
    ADD COLUMN IF NOT EXISTS hook TEXT;

-- Record this migration
    INSERT INTO migrations (filename) VALUES ('010_update_table_schema.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- // PART 1: SCHEMA MIGRATIONS - REPLACING RIGID TABLES WITH UNIVERSAL STRUCTURES
-- // ============================================================================

/**
 * SQL migration to replace rigid romance/case/magic tables with universal alternatives
 */
-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '011_Universal_Schema_Migrations.sql') THEN
        RAISE NOTICE 'Migration 011_Universal_Schema_Migrations.sql already applied, skipping.';
        RETURN;
    END IF;

--011_Universal_Schema_Migrations
-- =============================================
-- 1. UNIVERSAL INFORMATION REVEALS (replacing detective_cases)
-- =============================================

-- Create new universal information reveals table
CREATE TABLE information_reveals (
    id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(id),
    reveal_type VARCHAR(100), -- evidence, secret, backstory, world_rule, relationship, skill
    information_content TEXT NOT NULL,
    reveal_method VARCHAR(255), -- discovered, confessed, witnessed, deduced
    significance_level VARCHAR(50), -- minor, major, climactic, world_changing
    affects_characters INTEGER[], -- Who learns this information
    revealed_in_chapter INTEGER,
    consequences TEXT,
    foreshadowing_chapters INTEGER[], -- Where this was hinted at
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new evidence table linked to information reveals
CREATE TABLE reveal_evidence (
    id SERIAL PRIMARY KEY,
    reveal_id INTEGER REFERENCES information_reveals(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50), -- physical, witness, circumstantial, digital, forensic
    evidence_description TEXT NOT NULL,
    discovered_by INTEGER, -- Character ID
    discovery_chapter INTEGER,
    significance VARCHAR(50), -- critical, important, supporting, red_herring
    linked_reveals INTEGER[], -- Other related reveals
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Information flow tracking (how knowledge spreads between characters)
CREATE TABLE information_flow (
    id SERIAL PRIMARY KEY,
    reveal_id INTEGER REFERENCES information_reveals(id) ON DELETE CASCADE,
    learned_by_character_id INTEGER NOT NULL, 
    learned_in_chapter INTEGER,
    learned_from_character_id INTEGER, -- Who told them
    knowledge_level VARCHAR(50) DEFAULT 'complete', -- complete, partial, misunderstood, suspected
    learning_context TEXT, -- Circumstances of learning
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. UNIVERSAL RELATIONSHIP DYNAMICS (replacing rigid romance_arcs)
-- =============================================

-- Create new universal relationship arcs table
CREATE TABLE relationship_arcs (
    id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(id),
    arc_name VARCHAR(255) NOT NULL,
    participants JSONB NOT NULL, -- Flexible array of character objects with roles
    relationship_type VARCHAR(100), -- romantic, family, friendship, professional, antagonistic
    current_dynamic TEXT,
    development_factors TEXT[],
    complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 10),
    milestone_events JSONB, -- Key relationship developments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new relationship dynamics table
CREATE TABLE relationship_dynamics (
    id SERIAL PRIMARY KEY,
    arc_id INTEGER REFERENCES relationship_arcs(id) ON DELETE CASCADE,
    chapter_id INTEGER,
    scene_id INTEGER,
    dynamic_change TEXT, -- Description of how dynamic changed
    tension_change INTEGER CHECK (tension_change BETWEEN -10 AND 10),
    change_type VARCHAR(100), -- emotional, power, trust, commitment, conflict
    trigger_event TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. UNIVERSAL WORLD SYSTEMS (replacing magic_system)
-- =============================================

-- Create new universal world systems table
CREATE TABLE world_systems (
    id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    system_name VARCHAR(255) NOT NULL,
    system_type VARCHAR(100), -- magic, psionics, technology, divine, supernatural, mutation, alchemy
    power_source TEXT,
    access_method TEXT, -- How beings access/use this system
    limitations TEXT[],
    system_rules TEXT[],
    power_scaling JSONB, -- Flexible scaling information
    system_users INTEGER[], -- Character IDs who can use this system
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new system element abilities table
CREATE TABLE system_abilities (
    id SERIAL PRIMARY KEY,
    system_id INTEGER REFERENCES world_systems(id) ON DELETE CASCADE,
    ability_name VARCHAR(255) NOT NULL,
    ability_description TEXT,
    power_level INTEGER CHECK (power_level BETWEEN 1 AND 10),
    requirements TEXT,
    limitations TEXT,
    characters_with_ability INTEGER[], -- Character IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new character system progression table
CREATE TABLE character_system_progression (
    id SERIAL PRIMARY KEY,
    character_id INTEGER,
    system_id INTEGER REFERENCES world_systems(id) ON DELETE CASCADE,
    book_id INTEGER,
    chapter_id INTEGER,
    current_power_level INTEGER,
    abilities_gained INTEGER[], -- References to system_abilities
    progression_method TEXT, -- How they gained this power
    cost_or_sacrifice TEXT, -- What they sacrificed to gain this power
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Add update triggers for timestamp management
-- =============================================

-- Create the update_timestamp function if it doesn't exist

-- Information reveal triggers
DROP TRIGGER IF EXISTS update_information_reveals_timestamp ON information_reveals;
CREATE TRIGGER update_information_reveals_timestamp
    BEFORE UPDATE ON information_reveals
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_reveal_evidence_timestamp ON reveal_evidence;
CREATE TRIGGER update_reveal_evidence_timestamp
    BEFORE UPDATE ON reveal_evidence
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_information_flow_timestamp ON information_flow;
CREATE TRIGGER update_information_flow_timestamp
    BEFORE UPDATE ON information_flow
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Relationship triggers
DROP TRIGGER IF EXISTS update_relationship_arcs_timestamp ON relationship_arcs;
CREATE TRIGGER update_relationship_arcs_timestamp
    BEFORE UPDATE ON relationship_arcs
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_relationship_dynamics_timestamp ON relationship_dynamics;
CREATE TRIGGER update_relationship_dynamics_timestamp
    BEFORE UPDATE ON relationship_dynamics
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- World system triggers
DROP TRIGGER IF EXISTS update_world_systems_timestamp ON world_systems;
CREATE TRIGGER update_world_systems_timestamp
    BEFORE UPDATE ON world_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_system_abilities_timestamp ON system_abilities;
CREATE TRIGGER update_system_abilities_timestamp
    BEFORE UPDATE ON system_abilities
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_character_system_progression_timestamp ON character_system_progression;
CREATE TRIGGER update_character_system_progression_timestamp
    BEFORE UPDATE ON character_system_progression
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- Create indexes for better performance
-- =============================================

-- Information reveals indexes
CREATE INDEX IF NOT EXISTS idx_information_reveals_plot_thread ON information_reveals(plot_thread_id);
CREATE INDEX IF NOT EXISTS idx_information_reveals_type ON information_reveals(reveal_type);
CREATE INDEX IF NOT EXISTS idx_information_reveals_significance ON information_reveals(significance_level);
CREATE INDEX IF NOT EXISTS idx_reveal_evidence_reveal_id ON reveal_evidence(reveal_id);

-- Relationship indexes
CREATE INDEX IF NOT EXISTS idx_relationship_arcs_plot_thread ON relationship_arcs(plot_thread_id);
CREATE INDEX IF NOT EXISTS idx_relationship_arcs_type ON relationship_arcs(relationship_type);
CREATE INDEX IF NOT EXISTS idx_relationship_dynamics_arc_id ON relationship_dynamics(arc_id);
CREATE INDEX IF NOT EXISTS idx_relationship_dynamics_chapter_id ON relationship_dynamics(chapter_id);

-- World system indexes
CREATE INDEX IF NOT EXISTS idx_world_systems_series_id ON world_systems(series_id);
CREATE INDEX IF NOT EXISTS idx_world_systems_type ON world_systems(system_type);
CREATE INDEX IF NOT EXISTS idx_system_abilities_system_id ON system_abilities(system_id);
CREATE INDEX IF NOT EXISTS idx_character_system_progression_character ON character_system_progression(character_id);
CREATE INDEX IF NOT EXISTS idx_character_system_progression_system ON character_system_progression(system_id);

-- Record this migration
INSERT INTO migrations (filename) VALUES ('011_Universal_Schema_Migrations.sql')
    ON CONFLICT (filename) DO NOTHING;
END
$$;

-- Add intensity_level to chapter_scenes table
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
ALTER TABLE trope_scenes ADD COLUMN IF NOT EXISTS scene_elements TEXT[]; -- "kinks featured" request fits here
ALTER TABLE trope_scenes ADD COLUMN IF NOT EXISTS implementation_notes TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_chapter_scenes_intensity ON chapter_scenes(intensity_level);
CREATE INDEX IF NOT EXISTS idx_trope_scenes_scene_id ON trope_scenes(id);
CREATE INDEX IF NOT EXISTS idx_trope_scenes_elements ON trope_scenes USING GIN(scene_elements);

-- Record this migration
    INSERT INTO migrations (filename) VALUES ('013_alter_scene_tracking_schema.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

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
    INSERT INTO migrations (filename) VALUES ('014_Scene_Schema_updates.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- Description: Normalizes genre storage using junction tables instead of text arrays
-- Date: 2025-10-04
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

CREATE INDEX IF NOT EXISTS idx_book_genres_book_id ON book_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_book_genres_genre_id ON book_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_series_genres_series_id ON series_genres(series_id);
CREATE INDEX IF NOT EXISTS idx_series_genres_genre_id ON series_genres(genre_id);

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
INSERT INTO migrations (filename) VALUES ('015_normalize_genre_relationships.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- Description: Adds missing columns to world_elements table to match world server expectations
-- Date: 2025-10-05
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
INSERT INTO migrations (filename) VALUES ('016_fix_world_elements_schema.sql')
    ON CONFLICT (filename) DO NOTHING;

END $$;

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
INSERT INTO migrations (filename) VALUES ('017_add_missing_feature_columns.sql')
    ON CONFLICT (filename) DO NOTHING;  

END $$;  

DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '018_update_cascade_constraints.sql') THEN
        RAISE NOTICE 'Migration 018_update_cascade_constraints.sql already applied, skipping.';
        RETURN;
    END IF;

    -- Update trope_instances table
    -- Drop the existing foreign key constraints
    ALTER TABLE trope_instances
        DROP CONSTRAINT IF EXISTS trope_instances_book_id_fkey,
        DROP CONSTRAINT IF EXISTS trope_instances_trope_id_fkey;

    -- Re-add the constraints with ON DELETE CASCADE
    ALTER TABLE trope_instances
        ADD CONSTRAINT trope_instances_book_id_fkey 
        FOREIGN KEY (book_id) 
        REFERENCES books(id) 
        ON DELETE CASCADE,
        
        ADD CONSTRAINT trope_instances_trope_id_fkey 
        FOREIGN KEY (trope_id) 
        REFERENCES tropes(id) 
        ON DELETE CASCADE;

    -- Update characters table
    -- Drop the existing foreign key constraints for book references
    ALTER TABLE characters
        DROP CONSTRAINT IF EXISTS characters_first_appearance_book_id_fkey,
        DROP CONSTRAINT IF EXISTS characters_last_appearance_book_id_fkey;

    -- Re-add the constraints with ON DELETE SET NULL
    -- We use SET NULL instead of CASCADE because deleting a book shouldn't delete the character,
    -- it should just remove the reference to that book
    ALTER TABLE characters
        ADD CONSTRAINT characters_first_appearance_book_id_fkey 
        FOREIGN KEY (first_appearance_book_id) 
        REFERENCES books(id) 
        ON DELETE SET NULL,
        
        ADD CONSTRAINT characters_last_appearance_book_id_fkey 
        FOREIGN KEY (last_appearance_book_id) 
        REFERENCES books(id) 
        ON DELETE SET NULL;

    -- Update character_details table
    -- Drop the existing foreign key constraint for source_book_id
    ALTER TABLE character_details
        DROP CONSTRAINT IF EXISTS character_details_source_book_id_fkey;

    -- Re-add the constraint with ON DELETE SET NULL
    -- We use SET NULL because deleting a book shouldn't delete the character detail,
    -- it should just remove the reference to where it was established
    ALTER TABLE character_details
        ADD CONSTRAINT character_details_source_book_id_fkey 
        FOREIGN KEY (source_book_id) 
        REFERENCES books(id) 
        ON DELETE SET NULL;

    -- Update character_knowledge table
    ALTER TABLE character_knowledge
        DROP CONSTRAINT IF EXISTS character_knowledge_learned_book_id_fkey;

    -- Re-add with SET NULL - preserve knowledge but remove book reference
    ALTER TABLE character_knowledge
        ADD CONSTRAINT character_knowledge_learned_book_id_fkey
        FOREIGN KEY (learned_book_id)
        REFERENCES books(id)
        ON DELETE SET NULL;

    -- Update relationship_arcs table
    ALTER TABLE relationship_arcs
        DROP CONSTRAINT IF EXISTS relationship_arcs_plot_thread_id_fkey;

    -- Re-add with CASCADE - relationship arcs should be deleted when their plot thread is deleted
    ALTER TABLE relationship_arcs
        ADD CONSTRAINT relationship_arcs_plot_thread_id_fkey 
        FOREIGN KEY (plot_thread_id) 
        REFERENCES plot_threads(id) 
        ON DELETE CASCADE;

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('018_update_cascade_constraints.sql')
    ON CONFLICT (filename) DO NOTHING;

END
$$;

-- This allows world_elements to optionally belong to a parent world_system
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
CREATE INDEX IF NOT EXISTS idx_world_elements_system_id ON world_elements(system_id);

-- Add comment explaining the relationship
COMMENT ON COLUMN world_elements.system_id IS 'Optional foreign key to world_systems table. Links a specific world element (e.g., "Fire Blast Spell") to its parent system (e.g., "Elemental Magic System")';

END $$;  

-- Migration 020: Flexible Timeline Dates
-- =============================================
-- Migration: 020_flexible_timeline_dates
-- Description: Change event_date from DATE to TEXT to support flexible date formats
--              Allows dates like "Night 1", "Day 3", "Year 2025", "Season 1, Episode 4", etc.

-- Drop the view that depends on event_date column
DROP VIEW IF EXISTS events_with_participants;

-- Change event_date column from DATE to TEXT to support flexible date formats
-- This allows authors to use narrative dates like "Night 1", "Day 3", "Before the War", etc.
DO $$ 
BEGIN
    -- Only alter if column exists and is not already TEXT
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'timeline_events' 
        AND column_name = 'event_date' 
        AND data_type != 'text'
    ) THEN
        ALTER TABLE timeline_events ALTER COLUMN event_date TYPE TEXT;
    END IF;
END $$;

-- Recreate the view with the updated column type
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
INSERT INTO migrations (filename) VALUES ('020_flexible_timeline_dates.sql') 
ON CONFLICT DO NOTHING;

-- =============================================
-- Migration 021: Scene Lookup Tables
-- =============================================
-- Migration: 021_add_scene_lookup_tables
-- Description: Add dynamic lookup tables for scene purposes and scene types

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

-- Record this migration
INSERT INTO migrations (filename) VALUES ('021_add_scene_lookup_tables.sql')
ON CONFLICT DO NOTHING;
