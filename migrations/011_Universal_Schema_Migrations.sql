-- // ============================================================================
-- // PART 1: SCHEMA MIGRATIONS - REPLACING RIGID TABLES WITH UNIVERSAL STRUCTURES
-- // ============================================================================

/**
 * SQL migration to replace rigid romance/case/magic tables with universal alternatives
 */
BEGIN;

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
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Information reveal triggers
CREATE TRIGGER update_information_reveals_timestamp
    BEFORE UPDATE ON information_reveals
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_reveal_evidence_timestamp
    BEFORE UPDATE ON reveal_evidence
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_information_flow_timestamp
    BEFORE UPDATE ON information_flow
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Relationship triggers
CREATE TRIGGER update_relationship_arcs_timestamp
    BEFORE UPDATE ON relationship_arcs
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_relationship_dynamics_timestamp
    BEFORE UPDATE ON relationship_dynamics
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- World system triggers
CREATE TRIGGER update_world_systems_timestamp
    BEFORE UPDATE ON world_systems
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_system_abilities_timestamp
    BEFORE UPDATE ON system_abilities
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_character_system_progression_timestamp
    BEFORE UPDATE ON character_system_progression
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- =============================================
-- Create indexes for better performance
-- =============================================

-- Information reveals indexes
CREATE INDEX idx_information_reveals_plot_thread ON information_reveals(plot_thread_id);
CREATE INDEX idx_information_reveals_type ON information_reveals(reveal_type);
CREATE INDEX idx_information_reveals_significance ON information_reveals(significance_level);
CREATE INDEX idx_reveal_evidence_reveal_id ON reveal_evidence(reveal_id);

-- Relationship indexes
CREATE INDEX idx_relationship_arcs_plot_thread ON relationship_arcs(plot_thread_id);
CREATE INDEX idx_relationship_arcs_type ON relationship_arcs(relationship_type);
CREATE INDEX idx_relationship_dynamics_arc_id ON relationship_dynamics(arc_id);
CREATE INDEX idx_relationship_dynamics_chapter_id ON relationship_dynamics(chapter_id);

-- World system indexes
CREATE INDEX idx_world_systems_series_id ON world_systems(series_id);
CREATE INDEX idx_world_systems_type ON world_systems(system_type);
CREATE INDEX idx_system_abilities_system_id ON system_abilities(system_id);
CREATE INDEX idx_character_system_progression_character ON character_system_progression(character_id);
CREATE INDEX idx_character_system_progression_system ON character_system_progression(system_id);


-- Record this migration
INSERT INTO migrations (filename) VALUES ('011_Universal_Schema_Migrations.sql');
END
$$;
COMMIT;