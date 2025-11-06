-- Migration: 009_writing_migration.sql
-- Description: Adds writing sessions, goals, validation, and export tracking for AI writing team
-- Date: 2025-09-16
-- Check if migration was already applied and execute migration if needed 
BEGIN;

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

CREATE TRIGGER update_writing_sessions_timestamp
    BEFORE UPDATE ON writing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_writing_goals_timestamp
    BEFORE UPDATE ON writing_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_validation_rules_timestamp
    BEFORE UPDATE ON validation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();


-- =============================================
-- INDICES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Writing sessions indices for AI team queries
CREATE INDEX idx_writing_sessions_book_date ON writing_sessions(book_id, session_date DESC);
CREATE INDEX idx_writing_sessions_chapter ON writing_sessions(chapter_id);
CREATE INDEX idx_writing_sessions_productivity ON writing_sessions(book_id, words_written DESC, session_date DESC);

-- Writing goals indices
CREATE INDEX idx_writing_goals_book_active ON writing_goals(book_id, active) WHERE active = true;
CREATE INDEX idx_writing_goals_target_date ON writing_goals(target_date, completed);
CREATE INDEX idx_writing_goals_type ON writing_goals(goal_type, active);

-- Manuscript exports indices
CREATE INDEX idx_manuscript_exports_book ON manuscript_exports(book_id, export_date DESC);
CREATE INDEX idx_manuscript_exports_format ON manuscript_exports(export_format, intended_use);

-- Validation rules and results indices
CREATE INDEX idx_validation_rules_book_active ON validation_rules(book_id, active) WHERE active = true;
CREATE INDEX idx_validation_rules_series_active ON validation_rules(series_id, active) WHERE active = true;
CREATE INDEX idx_validation_rules_auto ON validation_rules(auto_check, active) WHERE auto_check = true AND active = true;

CREATE INDEX idx_validation_results_book ON validation_results(book_id, validation_date DESC);
CREATE INDEX idx_validation_results_unresolved ON validation_results(resolved, acknowledged) WHERE resolved = false;
CREATE INDEX idx_validation_results_chapter ON validation_results(chapter_id, result_status);



-- Word count tracking indices
CREATE INDEX idx_word_count_snapshots_book_date ON word_count_snapshots(book_id, snapshot_date DESC);
CREATE INDEX idx_word_count_snapshots_chapter ON word_count_snapshots(chapter_id, snapshot_date DESC);

-- Session chapters link indices
CREATE INDEX idx_session_chapters_session ON session_chapters(session_id);
CREATE INDEX idx_session_chapters_chapter ON session_chapters(chapter_id);

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
INSERT INTO migrations (filename) VALUES ('009_writing_migration.sql');


END $$;  

COMMIT;