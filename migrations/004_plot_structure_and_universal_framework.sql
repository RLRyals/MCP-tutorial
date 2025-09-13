-- Migration: 004_plot_structure_and_universal_framework
-- Description: Fixed plot management with dynamic lookup tables (no hardcoded enums)
-- Date: 2025-09-13

BEGIN;

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
CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL UNIQUE,
    genre_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plot thread types (dynamic, not hardcoded)
CREATE TABLE plot_thread_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    type_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plot thread statuses (dynamic, not hardcoded)  
CREATE TABLE plot_thread_statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    status_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationship types (dynamic, not hardcoded)
CREATE TABLE relationship_types (
    relationship_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    type_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story concerns (Dramatica-inspired, expandable)
CREATE TABLE story_concerns (
    concern_id SERIAL PRIMARY KEY,
    concern_name VARCHAR(100) NOT NULL UNIQUE,
    concern_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story outcomes (expandable)
CREATE TABLE story_outcomes (
    outcome_id SERIAL PRIMARY KEY,
    outcome_name VARCHAR(50) NOT NULL UNIQUE,
    outcome_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story judgments (expandable)
CREATE TABLE story_judgments (
    judgment_id SERIAL PRIMARY KEY,
    judgment_name VARCHAR(50) NOT NULL UNIQUE,
    judgment_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CORE PLOT THREAD MANAGEMENT (LOOKUP-BASED)
-- =============================================

-- Plot threads - story arcs, subplots, character arcs
CREATE TABLE plot_threads (
    thread_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Thread categorization (using lookup tables)
    thread_type_id INTEGER REFERENCES plot_thread_types(type_id),
    importance_level INTEGER DEFAULT 5 CHECK (importance_level >= 1 AND importance_level <= 10),
    complexity_level INTEGER DEFAULT 5 CHECK (complexity_level >= 1 AND complexity_level <= 10),
    
    -- Thread span and status (using lookup table)
    start_book INTEGER,
    end_book INTEGER,
    current_status_id INTEGER DEFAULT 1 REFERENCES plot_thread_statuses(status_id),
    
    -- Thread relationships
    parent_thread_id INTEGER REFERENCES plot_threads(thread_id),
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
CREATE TABLE plot_thread_relationships (
    relationship_id SERIAL PRIMARY KEY,
    thread_a_id INTEGER NOT NULL REFERENCES plot_threads(thread_id) ON DELETE CASCADE,
    thread_b_id INTEGER NOT NULL REFERENCES plot_threads(thread_id) ON DELETE CASCADE,
    
    relationship_type_id INTEGER NOT NULL REFERENCES relationship_types(relationship_type_id),
    relationship_description TEXT,
    strength INTEGER DEFAULT 5 CHECK (strength >= 1 AND strength <= 10),
    
    established_book INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (thread_a_id != thread_b_id)
);

-- =============================================
-- STORY ANALYSIS (Dramatica-inspired, LOOKUP-BASED)
-- =============================================

-- Core story analysis table for Dramatica-inspired flexible analysis
CREATE TABLE story_analysis (
    analysis_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
    -- Dramatica elements (using lookup tables)
    story_concern_id INTEGER REFERENCES story_concerns(concern_id),
    main_character_problem TEXT,
    influence_character_impact TEXT,
    story_outcome_id INTEGER REFERENCES story_outcomes(outcome_id),
    story_judgment_id INTEGER REFERENCES story_judgments(judgment_id),
    thematic_elements JSONB,
    
    -- General analysis notes
    analysis_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- GENRE-SPECIFIC TABLES (CONDITIONALLY CREATED)
-- =============================================
-- These are created only when needed by genre extensions

-- Mystery genre support
CREATE TABLE IF NOT EXISTS detective_cases (
    case_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id) ON DELETE CASCADE,
    case_name VARCHAR(255),
    victim_info TEXT,
    suspects JSONB,
    timeline_events JSONB,
    case_status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Romance genre support  
CREATE TABLE IF NOT EXISTS romance_arcs (
    arc_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id) ON DELETE CASCADE,
    character_a_id INTEGER REFERENCES characters(character_id),
    character_b_id INTEGER REFERENCES characters(character_id),
    relationship_stage VARCHAR(100),
    tension_level INTEGER CHECK (tension_level BETWEEN 1 AND 10),
    obstacles TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fantasy genre support
CREATE TABLE IF NOT EXISTS magic_systems (
    magic_system_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id) ON DELETE CASCADE,
    magic_type VARCHAR(100),
    power_source TEXT,
    limitations TEXT[],
    rules TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

-- Plot thread triggers
CREATE TRIGGER update_plot_threads_timestamp
    BEFORE UPDATE ON plot_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_plot_thread_relationships_timestamp
    BEFORE UPDATE ON plot_thread_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Story analysis triggers
CREATE TRIGGER update_story_analysis_timestamp
    BEFORE UPDATE ON story_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Genre and lookup indices
CREATE INDEX idx_genres_name ON genres(genre_name);
CREATE INDEX idx_plot_thread_types_name ON plot_thread_types(type_name);
CREATE INDEX idx_plot_thread_statuses_name ON plot_thread_statuses(status_name);
CREATE INDEX idx_relationship_types_name ON relationship_types(type_name);

-- Plot thread indices
CREATE INDEX idx_plot_threads_series_id ON plot_threads(series_id);
CREATE INDEX idx_plot_threads_type_status ON plot_threads(thread_type_id, current_status_id);
CREATE INDEX idx_plot_threads_books ON plot_threads(start_book, end_book);
CREATE INDEX idx_plot_threads_parent ON plot_threads(parent_thread_id);

-- Relationship indices
CREATE INDEX idx_plot_thread_relationships_thread_a ON plot_thread_relationships(thread_a_id);
CREATE INDEX idx_plot_thread_relationships_thread_b ON plot_thread_relationships(thread_b_id);
CREATE INDEX idx_plot_thread_relationships_type ON plot_thread_relationships(relationship_type_id);

-- Analysis indices
CREATE INDEX idx_story_analysis_book_id ON story_analysis(book_id);
CREATE INDEX idx_story_analysis_concern ON story_analysis(story_concern_id);

-- Genre-specific indices
CREATE INDEX idx_detective_cases_plot_thread ON detective_cases(plot_thread_id);
CREATE INDEX idx_romance_arcs_plot_thread ON romance_arcs(plot_thread_id);
CREATE INDEX idx_romance_arcs_characters ON romance_arcs(character_a_id, character_b_id);
CREATE INDEX idx_magic_systems_series ON magic_systems(series_id);

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

-- Insert story concerns (Dramatica-inspired)
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
    INSERT INTO migrations (filename) VALUES ('004_plot_structure_and_universal_framework_fixed.sql');

END
$$;

COMMIT;
