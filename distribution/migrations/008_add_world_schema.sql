-- Migration to add worldbuilding tables for locations, world elements, organizations, and usage tracking
BEGIN;

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
CREATE INDEX idx_locations_series_id ON locations(series_id);
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_parent ON locations(parent_location_id);

-- World element indices
CREATE INDEX idx_world_elements_series_id ON world_elements(series_id);
CREATE INDEX idx_world_elements_name ON world_elements(name);
CREATE INDEX idx_world_elements_type ON world_elements(element_type);

-- Organization indices
CREATE INDEX idx_organizations_series_id ON organizations(series_id);
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_organizations_headquarters ON organizations(headquarters_location_id);

-- Usage tracking indices
CREATE INDEX idx_world_usage_element ON world_element_usage(element_type, element_id);
CREATE INDEX idx_world_usage_book ON world_element_usage(book_id);
CREATE INDEX idx_world_usage_chapter ON world_element_usage(chapter_id);

-- ========================================
-- UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ========================================

CREATE TRIGGER update_locations_timestamp
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_world_elements_timestamp
    BEFORE UPDATE ON world_elements
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_organizations_timestamp
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Record this migration     
INSERT INTO migrations (filename) VALUES ('008_add_world_schema.sql');  

END $$;  

COMMIT;