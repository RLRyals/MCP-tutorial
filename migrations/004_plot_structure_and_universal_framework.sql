-- Migration: 004_plot_structure_and_universal_framework
-- Description: Adds core plot management and universal genre framework (foundation for genre-specific extensions)
-- Date: 2025-09-12

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
-- UNIVERSAL LOOKUP TABLES FOR GENRE FLEXIBILITY
-- =============================================

-- Base genres (foundation for all genre-specific work)
CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    genre_name VARCHAR(50) NOT NULL UNIQUE,
    genre_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trope categories (cross-genre)
CREATE TABLE trope_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_description TEXT,
    genre_id INTEGER REFERENCES genres(genre_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universal trope system (replaces hard-coded enums)
CREATE TABLE story_tropes (
    trope_id SERIAL PRIMARY KEY,
    trope_name VARCHAR(255) NOT NULL,
    trope_description TEXT,
    genre_id INTEGER REFERENCES genres(genre_id),
    category_id INTEGER REFERENCES trope_categories(category_id),
    
    -- Trope execution requirements
    required_opening_scenes TEXT[],
    required_middle_scenes TEXT[],
    required_ending_scenes TEXT[],
    
    -- Trope guidelines
    typical_chapter_span INTEGER,
    pacing_notes TEXT,
    common_variations TEXT[],
    reader_expectations TEXT,
    
    -- Metadata for sorting and selection
    is_active BOOLEAN DEFAULT TRUE,
    popularity_rating INTEGER CHECK (popularity_rating >= 1 AND popularity_rating <= 10),
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Genre templates for flexible story structures
CREATE TABLE genre_templates (
    template_id SERIAL PRIMARY KEY,
    genre_id INTEGER NOT NULL REFERENCES genres(genre_id),
    template_name VARCHAR(100) NOT NULL,
    
    -- Flexible structure definition
    required_beats JSONB,
    optional_beats JSONB,
    typical_chapter_counts JSONB,
    
    -- Guidelines
    pacing_guidelines TEXT,
    genre_specific_notes TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between templates and tropes
CREATE TABLE template_tropes (
    template_trope_id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES genre_templates(template_id) ON DELETE CASCADE,
    trope_id INTEGER NOT NULL REFERENCES story_tropes(trope_id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,
    usage_frequency VARCHAR(20) DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, trope_id)
);

-- Book-template associations
CREATE TABLE book_genre_templates (
    book_template_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES genre_templates(template_id),
    
    -- Customizations for this specific book
    template_modifications JSONB,
    completed_beats JSONB,
    beat_completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CORE PLOT THREAD MANAGEMENT
-- =============================================

-- Plot threads - story arcs, subplots, character arcs
CREATE TABLE plot_threads (
    thread_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Thread categorization
    thread_type VARCHAR(50) NOT NULL, -- series_arc, mini_arc, main_case, subplot, character_arc, mystery_element
    importance_level INTEGER DEFAULT 5 CHECK (importance_level >= 1 AND importance_level <= 10),
    complexity_level INTEGER DEFAULT 5 CHECK (complexity_level >= 1 AND complexity_level <= 10),
    
    -- Thread span and status
    start_book INTEGER,
    end_book INTEGER,
    current_status VARCHAR(50) DEFAULT 'active', -- active, resolved, on_hold, abandoned
    
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

-- Plot thread relationships
CREATE TABLE plot_thread_relationships (
    relationship_id SERIAL PRIMARY KEY,
    thread_a_id INTEGER NOT NULL REFERENCES plot_threads(thread_id) ON DELETE CASCADE,
    thread_b_id INTEGER NOT NULL REFERENCES plot_threads(thread_id) ON DELETE CASCADE,
    
    relationship_type VARCHAR(50) NOT NULL, -- enables, conflicts_with, supports, reveals, resolves
    relationship_description TEXT,
    strength INTEGER DEFAULT 5 CHECK (strength >= 1 AND strength <= 10),
    
    established_book INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (thread_a_id != thread_b_id)
);

-- =============================================
-- BOOK TROPE TRACKING (using lookups)
-- =============================================

-- Book-specific trope usage
CREATE TABLE book_tropes (
    book_trope_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    trope_id INTEGER NOT NULL REFERENCES story_tropes(trope_id) ON DELETE CASCADE,
    
    -- Trope implementation in this book
    trope_variation VARCHAR(255),
    start_chapter INTEGER REFERENCES chapters(chapter_id),
    climax_chapter INTEGER REFERENCES chapters(chapter_id),
    resolution_chapter INTEGER REFERENCES chapters(chapter_id),
    
    -- Execution tracking
    execution_notes TEXT,
    reader_expectation_subversion BOOLEAN DEFAULT FALSE,
    subversion_notes TEXT,
    
    -- Quality ratings
    trope_satisfaction_level INTEGER CHECK (trope_satisfaction_level >= 1 AND trope_satisfaction_level <= 10),
    setup_quality INTEGER CHECK (setup_quality >= 1 AND setup_quality <= 10),
    payoff_quality INTEGER CHECK (payoff_quality >= 1 AND payoff_quality <= 10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(book_id, trope_id)
);

-- =============================================
-- TIMELINE AND EVENT MANAGEMENT
-- =============================================

-- Timeline events - chronological events in story world
CREATE TABLE timeline_events (
    event_id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(chapter_id),
    
    -- Event timing
    event_datetime TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    
    -- Event details
    event_description TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- crime, investigation, revelation, character_development, plot_advancement, clue_discovery
    
    -- Location and participants
    location_description TEXT,
    characters_involved INTEGER[],
    primary_character_id INTEGER REFERENCES characters(character_id),
    
    -- Plot relevance
    plot_thread_ids INTEGER[],
    significance VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    
    -- Knowledge tracking
    public_knowledge BOOLEAN DEFAULT FALSE,
    police_knowledge BOOLEAN DEFAULT FALSE,
    character_witnesses INTEGER[],
    
    -- Story impact
    immediate_consequences TEXT[],
    long_term_setup TEXT[],
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plot events - specific plot-advancing events
CREATE TABLE plot_events (
    plot_event_id SERIAL PRIMARY KEY,
    timeline_event_id INTEGER NOT NULL REFERENCES timeline_events(event_id) ON DELETE CASCADE,
    plot_thread_id INTEGER NOT NULL REFERENCES plot_threads(thread_id) ON DELETE CASCADE,
    
    -- Plot progression
    plot_function VARCHAR(50), -- setup, inciting_incident, plot_point_1, midpoint, plot_point_2, climax, resolution
    act_number INTEGER CHECK (act_number >= 1 AND act_number <= 3),
    
    -- Character impact
    character_revelations TEXT[],
    character_decisions TEXT[],
    relationship_changes TEXT[],
    
    -- Story mechanics
    raises_stakes BOOLEAN DEFAULT FALSE,
    creates_urgency BOOLEAN DEFAULT FALSE,
    reveals_information BOOLEAN DEFAULT FALSE,
    advances_mystery BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event relationships - how events connect
CREATE TABLE event_relationships (
    relationship_id SERIAL PRIMARY KEY,
    cause_event_id INTEGER NOT NULL REFERENCES timeline_events(event_id) ON DELETE CASCADE,
    effect_event_id INTEGER NOT NULL REFERENCES timeline_events(event_id) ON DELETE CASCADE,
    
    relationship_type VARCHAR(50) NOT NULL, -- causes, enables, prevents, reveals, complicates
    relationship_description TEXT,
    time_delay_hours INTEGER,
    
    causality_strength INTEGER DEFAULT 5 CHECK (causality_strength >= 1 AND causality_strength <= 10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (cause_event_id != effect_event_id)
);

-- =============================================
-- STORY STRUCTURE ANALYSIS
-- =============================================

-- Story structure - three-act structure and pacing
CREATE TABLE story_structure (
    structure_id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    
    -- Three-act structure points
    act_1_end_chapter INTEGER REFERENCES chapters(chapter_id),
    midpoint_chapter INTEGER REFERENCES chapters(chapter_id),
    act_2_end_chapter INTEGER REFERENCES chapters(chapter_id),
    
    -- Key story beats
    inciting_incident_chapter INTEGER REFERENCES chapters(chapter_id),
    plot_point_1_chapter INTEGER REFERENCES chapters(chapter_id),
    plot_point_2_chapter INTEGER REFERENCES chapters(chapter_id),
    climax_chapter INTEGER REFERENCES chapters(chapter_id),
    resolution_chapter INTEGER REFERENCES chapters(chapter_id),
    
    -- Structure analysis
    act_1_page_percentage DECIMAL(5,2),
    act_2_page_percentage DECIMAL(5,2),
    act_3_page_percentage DECIMAL(5,2),
    
    -- Notes and validation
    pacing_notes TEXT,
    structure_notes TEXT,
    recommended_adjustments TEXT,
    
    structure_validated BOOLEAN DEFAULT FALSE,
    validation_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scene structure - individual scene analysis
CREATE TABLE scene_structure (
    scene_structure_id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL REFERENCES chapters(chapter_id) ON DELETE CASCADE,
    scene_id INTEGER REFERENCES chapter_scenes(scene_id),
    
    -- Scene identification
    scene_number INTEGER NOT NULL,
    scene_title VARCHAR(255),
    
    -- Scene purpose and function
    scene_purpose VARCHAR(100), -- setup, confrontation, resolution, transition, revelation
    dramatic_function VARCHAR(50), -- exposition, rising_action, climax, falling_action
    
    -- Scene mechanics
    goal_character_id INTEGER REFERENCES characters(character_id),
    scene_goal TEXT,
    obstacle TEXT,
    outcome TEXT,
    
    -- Conflict and tension
    conflict_type VARCHAR(50), -- internal, interpersonal, societal, environmental, supernatural
    tension_level INTEGER DEFAULT 5 CHECK (tension_level >= 1 AND tension_level <= 10),
    emotional_impact INTEGER DEFAULT 5 CHECK (emotional_impact >= 1 AND emotional_impact <= 10),
    
    -- Story progression
    advances_plot BOOLEAN DEFAULT TRUE,
    reveals_character BOOLEAN DEFAULT FALSE,
    reveals_information BOOLEAN DEFAULT FALSE,
    sets_up_future_events BOOLEAN DEFAULT FALSE,
    
    -- Technical details
    estimated_word_count INTEGER,
    estimated_page_count INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(chapter_id, scene_number)
);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

-- Plot thread triggers
CREATE TRIGGER update_plot_threads_timestamp
    BEFORE UPDATE ON plot_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_story_tropes_timestamp
    BEFORE UPDATE ON story_tropes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_genre_templates_timestamp
    BEFORE UPDATE ON genre_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_book_genre_templates_timestamp
    BEFORE UPDATE ON book_genre_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_book_tropes_timestamp
    BEFORE UPDATE ON book_tropes
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Timeline triggers
CREATE TRIGGER update_timeline_events_timestamp
    BEFORE UPDATE ON timeline_events
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Structure triggers
CREATE TRIGGER update_story_structure_timestamp
    BEFORE UPDATE ON story_structure
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_scene_structure_timestamp
    BEFORE UPDATE ON scene_structure
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Genre and trope indices
CREATE INDEX idx_genres_name ON genres(genre_name);
CREATE INDEX idx_story_tropes_genre ON story_tropes(genre_id);
CREATE INDEX idx_story_tropes_category ON story_tropes(trope_category);
CREATE INDEX idx_story_tropes_active ON story_tropes(is_active);

-- Template indices
CREATE INDEX idx_genre_templates_genre ON genre_templates(genre_id);
CREATE INDEX idx_book_genre_templates_book ON book_genre_templates(book_id);
CREATE INDEX idx_book_genre_templates_template ON book_genre_templates(template_id);

-- Plot thread indices
CREATE INDEX idx_plot_threads_series_id ON plot_threads(series_id);
CREATE INDEX idx_plot_threads_type_status ON plot_threads(thread_type, current_status);
CREATE INDEX idx_plot_threads_books ON plot_threads(start_book, end_book);
CREATE INDEX idx_plot_threads_characters ON plot_threads USING GIN (related_characters);

CREATE INDEX idx_plot_thread_relationships_thread_a ON plot_thread_relationships(thread_a_id);
CREATE INDEX idx_plot_thread_relationships_thread_b ON plot_thread_relationships(thread_b_id);

-- Trope usage indices
CREATE INDEX idx_book_tropes_book ON book_tropes(book_id);
CREATE INDEX idx_book_tropes_trope ON book_tropes(trope_id);

-- Timeline indices
CREATE INDEX idx_timeline_events_series_book ON timeline_events(series_id, book_id);
CREATE INDEX idx_timeline_events_datetime ON timeline_events(event_datetime);
CREATE INDEX idx_timeline_events_characters ON timeline_events USING GIN (characters_involved);
CREATE INDEX idx_timeline_events_threads ON timeline_events USING GIN (plot_thread_ids);
CREATE INDEX idx_timeline_events_type ON timeline_events(event_type);

CREATE INDEX idx_plot_events_timeline_event ON plot_events(timeline_event_id);
CREATE INDEX idx_plot_events_thread ON plot_events(plot_thread_id);
CREATE INDEX idx_plot_events_function ON plot_events(plot_function);

CREATE INDEX idx_event_relationships_cause ON event_relationships(cause_event_id);
CREATE INDEX idx_event_relationships_effect ON event_relationships(effect_event_id);

-- Structure indices
CREATE INDEX idx_story_structure_book_id ON story_structure(book_id);
CREATE INDEX idx_scene_structure_chapter_id ON scene_structure(chapter_id);
CREATE INDEX idx_scene_structure_goal_character ON scene_structure(goal_character_id);

-- =============================================
-- INITIAL DATA FOR UNIVERSAL FRAMEWORK
-- =============================================

-- Insert base genres
INSERT INTO genres (genre_name, genre_description) VALUES
('romance', 'Stories focused on romantic relationships and emotional connection'),
('fantasy', 'Stories set in imaginary worlds with magical or supernatural elements'),
('mystery', 'Stories involving puzzles, crimes, or unexplained events to be solved'),
('thriller', 'Stories designed to create suspense, excitement, and tension'),
('science_fiction', 'Stories set in the future or alternative worlds with advanced technology'),
('historical', 'Stories set in the past, often with period-accurate details'),
('contemporary', 'Stories set in the present day with realistic settings'),
('paranormal', 'Stories with supernatural elements in modern or historical settings'),
('urban_fantasy', 'Fantasy stories set in urban, modern environments'),
('horror', 'Stories intended to frighten, create suspense, or invoke supernatural dread');

-- Insert basic trope categories
INSERT INTO trope_categories (category_name, category_description, genre_id) VALUES
('plot_device', 'Story mechanisms that drive the plot forward', NULL),
('character_archetype', 'Common character types across genres', NULL),
('setting_based', 'Tropes based on story settings or circumstances', NULL),
('conflict_source', 'Common sources of story conflict', NULL),
('resolution_method', 'Common ways conflicts are resolved', NULL);

-- Insert a few universal tropes to get started
INSERT INTO story_tropes (trope_name, trope_description, genre_id, category_id, required_opening_scenes, required_middle_scenes, required_ending_scenes, typical_chapter_span, pacing_notes, common_variations, reader_expectations, popularity_rating, difficulty_level) VALUES
('chosen_one', 'Ordinary person discovers they are destined for greatness', 
 (SELECT genre_id FROM genres WHERE genre_name = 'fantasy'), 
 (SELECT category_id FROM trope_categories WHERE category_name = 'character_archetype'),
 ARRAY['Ordinary life establishment', 'Call to adventure', 'Reluctance to accept destiny'], 
 ARRAY['Mentor guidance', 'Training montage', 'First test of abilities', 'Doubt and struggle'], 
 ARRAY['Final confrontation', 'Acceptance of role', 'Victory through unique abilities'], 
 20, 
 'Need strong character development to avoid "special for no reason" feeling.',
 ARRAY['Hidden heritage', 'Prophecy fulfillment', 'Last of their kind', 'Reincarnation'], 
 'Readers expect growth from ordinary to extraordinary with earned victories.',
 7, 6),

('mentor_dies', 'Wise guide character dies leaving protagonist to face challenges alone', 
 NULL, 
 (SELECT category_id FROM trope_categories WHERE category_name = 'plot_device'),
 ARRAY['Introduce wise mentor', 'Establish mentor-student bond', 'Show mentor\'s wisdom'], 
 ARRAY['Mentor provides crucial guidance', 'Growing independence', 'Moment of greatest need'], 
 ARRAY['Mentor\'s sacrifice or death', 'Protagonist must act alone', 'Honor mentor\'s memory'], 
 15, 
 'Timing is crucial - too early and bond isn\'t established, too late and feels forced.',
 ARRAY['Noble sacrifice', 'Unexpected death', 'Corruption/fall', 'Faked death reveal'], 
 'Readers expect meaningful death that serves character development.',
 8, 7);

-- Record this migration
INSERT INTO migrations (filename) VALUES ('004_plot_structure_and_universal_framework.sql');

END
$$;

COMMIT;