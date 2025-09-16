-- Migration: 003_add_character_and_chapter_schema
-- Description: Adds comprehensive character and chapter tracking tables for the MCP system
-- Date: 2025-09-09


BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '003_add_character_and_chapter_schema.sql') THEN
        RAISE NOTICE 'Migration 003_add_character_and_chapter_schema.sql already applied, skipping.';
        RETURN;
    END IF;

-- =============================================
-- CHARACTER MANAGEMENT TABLES
-- =============================================

-- Characters table - core character information
CREATE TABLE characters (
    character_id SERIAL PRIMARY KEY,
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
CREATE TABLE character_details (
    detail_id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(character_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- physical, personality, background, skills, etc.
    attribute VARCHAR(100) NOT NULL, -- eye_color, height, temperament, etc.
    value TEXT NOT NULL,
    source_book_id INTEGER REFERENCES books(id), -- where this was established
    confidence_level VARCHAR(20) DEFAULT 'established', -- established, mentioned, implied
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, category, attribute)
);

-- Character relationships - tracks how characters relate to each other
CREATE TABLE character_relationships (
    relationship_id SERIAL PRIMARY KEY,
    character_a_id INTEGER NOT NULL REFERENCES characters(character_id) ON DELETE CASCADE,
    character_b_id INTEGER NOT NULL REFERENCES characters(character_id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- family, romantic, friend, enemy, colleague, etc.
    relationship_status VARCHAR(50) DEFAULT 'current', -- current, past, complicated
    description TEXT,
    established_book_id INTEGER REFERENCES books(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (character_a_id != character_b_id)
);

-- Character arcs - development tracking across books
CREATE TABLE character_arcs (
    arc_id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(character_id) ON DELETE CASCADE,
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
CREATE TABLE character_knowledge (
    knowledge_id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(character_id) ON DELETE CASCADE,
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
CREATE TABLE chapters (
    chapter_id SERIAL PRIMARY KEY,
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
    pov_character_id INTEGER REFERENCES characters(character_id), -- whose POV
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
CREATE TABLE chapter_scenes (
    scene_id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
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
    pov_character_id INTEGER REFERENCES characters(character_id),
    scene_participants INTEGER[], -- array of character_ids present
    
    -- Scene notes
    notes TEXT,
    writing_status VARCHAR(50) DEFAULT 'planned',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(chapter_id, scene_number)
);

-- Character presence in chapters - who appears where
CREATE TABLE character_chapter_presence (
    presence_id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(character_id) ON DELETE CASCADE,
    chapter_id INTEGER NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    
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
CREATE TABLE chapter_plot_points (
    plot_point_id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    scene_id INTEGER REFERENCES chapter_scenes(scene_id), -- optional: specific scene
    
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
CREATE TRIGGER update_characters_timestamp
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_character_details_timestamp
    BEFORE UPDATE ON character_details
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- CREATE TRIGGER update_character_relationships_timestamp
--     BEFORE UPDATE ON character_relationships
--     FOR EACH ROW
--     EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_character_arcs_timestamp
    BEFORE UPDATE ON character_arcs
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_character_knowledge_timestamp
    BEFORE UPDATE ON character_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Chapter table triggers
CREATE TRIGGER update_chapters_timestamp
    BEFORE UPDATE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_chapter_scenes_timestamp
    BEFORE UPDATE ON chapter_scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_character_chapter_presence_timestamp
    BEFORE UPDATE ON character_chapter_presence
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_chapter_plot_points_timestamp
    BEFORE UPDATE ON chapter_plot_points
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Character indices
CREATE INDEX idx_characters_series_id ON characters(series_id);
CREATE INDEX idx_characters_name ON characters(name);
CREATE INDEX idx_characters_type ON characters(character_type);
CREATE INDEX idx_characters_status ON characters(status);

CREATE INDEX idx_character_details_character_id ON character_details(character_id);
CREATE INDEX idx_character_details_category ON character_details(category);
CREATE INDEX idx_character_details_category_attribute ON character_details(character_id, category, attribute);

-- CREATE INDEX idx_character_relationships_character_a ON character_relationships(character_a_id);
-- CREATE INDEX idx_character_relationships_character_b ON character_relationships(character_b_id);
-- CREATE INDEX idx_character_relationships_type ON character_relationships(relationship_type);

CREATE INDEX idx_character_arcs_character_id ON character_arcs(character_id);
CREATE INDEX idx_character_arcs_book_id ON character_arcs(book_id);

CREATE INDEX idx_character_knowledge_character_id ON character_knowledge(character_id);
CREATE INDEX idx_character_knowledge_category ON character_knowledge(knowledge_category);

-- Chapter indices
CREATE INDEX idx_chapters_book_id ON chapters(book_id);
CREATE INDEX idx_chapters_book_chapter ON chapters(book_id, chapter_number);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_pov_character ON chapters(pov_character_id);

CREATE INDEX idx_chapter_scenes_chapter_id ON chapter_scenes(chapter_id);
CREATE INDEX idx_chapter_scenes_chapter_scene ON chapter_scenes(chapter_id, scene_number);

CREATE INDEX idx_character_chapter_presence_character ON character_chapter_presence(character_id);
CREATE INDEX idx_character_chapter_presence_chapter ON character_chapter_presence(chapter_id);
CREATE INDEX idx_character_chapter_presence_type ON character_chapter_presence(presence_type);

-- CREATE INDEX idx_chapter_relationships_chapter_a ON chapter_relationships(chapter_a_id);
-- CREATE INDEX idx_chapter_relationships_chapter_b ON chapter_relationships(chapter_b_id);

CREATE INDEX idx_chapter_plot_points_chapter ON chapter_plot_points(chapter_id);
CREATE INDEX idx_chapter_plot_points_type ON chapter_plot_points(plot_point_type);
CREATE INDEX idx_chapter_plot_points_scene ON chapter_plot_points(scene_id);

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('003_add_character_and_chapter_schema.sql');

END
$$;

COMMIT;