# World Server Modular Implementation Guide

## Overview

This guide breaks down the World Server MCP into manageable components focused on world-building elements - locations, organizations, world rules, and consistency tracking. This server enables AI writing teams to maintain rich, consistent fictional worlds without burdening authors with manual tracking.

## Project Structure

```
src/mcps/world-server/
├── index.js                     ← Main MCP server (what Claude Desktop sees)
├── handlers/
│   ├── location-handlers.js     ← Places, geography, settings
│   ├── organization-handlers.js ← Groups, institutions, power structures
│   ├── world-element-handlers.js ← Magic systems, technology, rules
│   └── consistency-handlers.js  ← World logic validation and checking
├── schemas/
│   └── world-tools-schema.js    ← Tool definitions
└── utils/
    ├── world-validator.js       ← Consistency checking utilities
    ├── relationship-mapper.js   ← Connection tracking between elements
    └── world-analyzer.js        ← Pattern analysis and suggestions
```

## Architecture Pattern

### Main Server (`index.js`)
- Extends `BaseMCPServer`
- Imports and combines all handler modules
- Manages database connection
- Coordinates world element relationships

### Handler Modules
- Export classes with focused functionality
- Mixed into main server via `Object.assign()`
- Each handles specific world-building aspect
- Return tool definitions and implement handlers

## Implementation Components

### 1. Core Server Structure (`index.js`)

**Purpose:** Main MCP server entry point
**Size:** ~120 lines
**Key Features:**
- Constructor and database connection
- Handler module integration
- Cross-element relationship tracking
- Tool registration

**Template Structure:**
```javascript
class WorldMCPServer extends BaseMCPServer {
    constructor() {
        super('world-manager', '1.0.0');
        
        // Mix in handlers
        Object.assign(this, new LocationHandlers());
        Object.assign(this, new OrganizationHandlers());
        Object.assign(this, new WorldElementHandlers());
        Object.assign(this, new ConsistencyHandlers());
        
        this.tools = this.getTools();
    }
    
    getTools() {
        return [
            ...this.getLocationTools(),
            ...this.getOrganizationTools(),
            ...this.getWorldElementTools(),
            ...this.getConsistencyTools()
        ];
    }
}
```

### 2. Location Management (`handlers/location-handlers.js`)

**Purpose:** Physical places, geography, and settings
**Size:** ~180-220 lines
**Key Features:**
- Location creation and description tracking
- Geographic relationships and distances
- Setting usage across chapters/scenes
- Environmental consistency

**Tools to Implement:**
- `create_location`
- `update_location`
- `get_location`
- `get_locations` (with filtering)
- `track_location_usage`
- `map_location_connections`
- `validate_location_consistency`

**Location Data Structure:**
```javascript
// Flexible location structure
{
    name: "The Whispering Woods",
    location_type: "forest", // city, building, region, landmark
    description: "Ancient forest with silver-barked trees",
    parent_location_id: 15, // region this is within
    geographic_details: {
        climate: "temperate",
        terrain: "forested hills",
        notable_features: ["silver trees", "whispering sounds"]
    },
    access_restrictions: "Open to public during daylight",
    first_mentioned_chapter: 3,
    atmosphere: "mysterious, slightly unsettling"
}
```

**Export Pattern:**
```javascript
export class LocationHandlers {
    getLocationTools() {
        return [/* location tool definitions */];
    }
    
    async handleCreateLocation(args) {
        // Create location and establish geographic relationships
    }
    
    async handleTrackLocationUsage(args) {
        // Track which chapters/scenes use this location
    }
    // Other location handlers...
}
```

### 3. Organization Management (`handlers/organization-handlers.js`)

**Purpose:** Groups, institutions, power structures, and social dynamics
**Size:** ~200-250 lines
**Key Features:**
- Organization hierarchies and relationships
- Power structure tracking
- Membership and influence networks
- Political/social dynamics

**Tools to Implement:**
- `create_organization`
- `update_organization`
- `get_organization`
- `get_organizations` (with filtering)
- `track_organization_relationships`
- `manage_membership`
- `analyze_power_dynamics`
- `track_organizational_conflicts`

**Organization Types:**
- Government institutions
- Religious orders
- Criminal organizations
- Guilds and professional groups
- Military units
- Social clubs and societies
- Corporations and businesses

**Export Pattern:**
```javascript
export class OrganizationHandlers {
    getOrganizationTools() {
        return [/* organization tool definitions */];
    }
    
    async handleCreateOrganization(args) {
        const { name, org_type, description, influence_level, 
                headquarters_location_id, parent_org_id } = args;
        
        // Create organization with hierarchical relationships
    }
    
    async handleAnalyzePowerDynamics(args) {
        // Analyze influence networks and conflicts between orgs
    }
    // Other organization handlers...
}
```

### 4. World Element Management (`handlers/world-element-handlers.js`)

**Purpose:** Magic systems, technology, natural laws, and world rules
**Size:** ~220-280 lines
**Key Features:**
- Magic/technology system definitions
- World rule consistency tracking
- Power/ability limitations and costs
- Scientific/magical law enforcement

**Tools to Implement:**
- `create_world_element`
- `update_world_element`
- `get_world_element`
- `get_world_elements` (with filtering)
- `define_world_rules`
- `validate_rule_consistency`
- `track_element_usage`
- `analyze_system_balance`

**World Element Categories:**
```javascript
const elementTypes = {
    magic_system: "Spells, powers, magical rules",
    technology: "Scientific capabilities and limitations", 
    natural_laws: "How physics/nature works in this world",
    supernatural: "Creatures, phenomena, otherworldly elements",
    social_rules: "Cultural norms, taboos, social structures",
    economic_system: "Trade, currency, resource distribution"
};
```

**Consistency Tracking:**
- Power level limitations
- Resource costs and availability
- Interaction rules between different systems
- Logical consequences of world rules

### 5. Consistency Management (`handlers/consistency-handlers.js`)

**Purpose:** World logic validation and continuity checking
**Size:** ~180-220 lines
**Key Features:**
- Cross-element consistency validation
- Logical world rule enforcement
- Continuity error detection
- World coherence analysis

**Tools to Implement:**
- `check_world_consistency`
- `validate_cross_references`
- `analyze_world_coherence`
- `detect_continuity_errors`
- `generate_consistency_report`
- `suggest_world_improvements`

**Consistency Categories:**
- Geographic logical connections
- Organizational power balance
- Magic/technology interaction rules
- Cultural and social coherence
- Economic system viability

## Database Schema (`migrations/006_add_world_schema.sql`)

### Core Tables

```sql
-- Locations table
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(100), -- city, building, region, landmark, etc.
    description TEXT,
    
    -- Geographic relationships
    parent_location_id INTEGER REFERENCES locations(location_id),
    geographic_coordinates POINT, -- optional lat/lng equivalent
    climate VARCHAR(100),
    terrain VARCHAR(100),
    
    -- Details
    population INTEGER,
    notable_features TEXT[],
    access_restrictions TEXT,
    atmosphere TEXT,
    
    -- Usage tracking
    first_mentioned_book_id INTEGER REFERENCES books(id),
    first_mentioned_chapter INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100), -- government, guild, criminal, religious, etc.
    description TEXT,
    
    -- Structure
    parent_organization_id INTEGER REFERENCES organizations(organization_id),
    headquarters_location_id INTEGER REFERENCES locations(location_id),
    
    -- Power and influence
    influence_level INTEGER CHECK (influence_level BETWEEN 1 AND 10),
    member_count_estimate INTEGER,
    territory TEXT[], -- areas of influence
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, disbanded, dormant, secret
    founded_date VARCHAR(100), -- in-world date
    
    -- Relationships
    allied_organizations INTEGER[],
    rival_organizations INTEGER[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- World elements (magic, tech, natural laws)
CREATE TABLE world_elements (
    element_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    name VARCHAR(255) NOT NULL,
    element_type VARCHAR(100), -- magic_system, technology, natural_law, etc.
    description TEXT,
    
    -- System details
    rules_and_limitations TEXT,
    power_level INTEGER CHECK (power_level BETWEEN 1 AND 10),
    rarity_level VARCHAR(50), -- common, uncommon, rare, legendary
    cost_or_requirements TEXT, -- what's needed to use/access this
    
    -- Relationships
    interacts_with INTEGER[], -- other element IDs this affects
    conflicts_with INTEGER[], -- elements this contradicts
    requires_elements INTEGER[], -- prerequisite elements
    
    -- Usage tracking
    first_introduced_book_id INTEGER REFERENCES books(id),
    first_introduced_chapter INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- World relationships (how elements connect)
CREATE TABLE world_relationships (
    relationship_id SERIAL PRIMARY KEY,
    element_type_a VARCHAR(50), -- location, organization, world_element
    element_id_a INTEGER,
    element_type_b VARCHAR(50),
    element_id_b INTEGER,
    
    relationship_type VARCHAR(100), -- controls, located_in, uses, conflicts_with, etc.
    relationship_strength INTEGER CHECK (relationship_strength BETWEEN 1 AND 10),
    description TEXT,
    
    -- Status
    active BOOLEAN DEFAULT true,
    established_date VARCHAR(100), -- in-world date
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- World consistency rules (author-defined)
CREATE TABLE world_consistency_rules (
    rule_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    rule_name VARCHAR(255) NOT NULL,
    rule_category VARCHAR(100), -- geographic, social, magical, technological
    rule_description TEXT,
    
    -- Rule logic
    rule_conditions JSONB, -- when this rule applies
    rule_requirements JSONB, -- what must be true
    violation_severity VARCHAR(20) DEFAULT 'warning', -- error, warning, info
    
    -- Status
    active BOOLEAN DEFAULT true,
    author_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking (where world elements appear)
CREATE TABLE world_element_usage (
    usage_id SERIAL PRIMARY KEY,
    element_type VARCHAR(50), -- location, organization, world_element
    element_id INTEGER,
    
    -- Where used
    book_id INTEGER REFERENCES books(id),
    chapter_id INTEGER, -- references chapters table when available
    scene_id INTEGER, -- references scenes table when available
    
    -- Usage details
    usage_type VARCHAR(100), -- setting, mention, active_use, conflict
    importance_level VARCHAR(50), -- major, minor, background
    usage_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration Strategy

### Step 1: Core Server + Location Management
1. Build basic `index.js` with constructor
2. Implement `LocationHandlers` class
3. Test location CRUD operations
4. Verify geographic relationship tracking

### Step 2: Organization Management
1. Implement `OrganizationHandlers` class
2. Add hierarchy and relationship tracking
3. Test power dynamics analysis
4. Verify membership management

### Step 3: World Element Systems
1. Implement `WorldElementHandlers` class
2. Add magic/technology system tracking
3. Test rule consistency validation
4. Verify cross-element interactions

### Step 4: Consistency Management
1. Implement `ConsistencyHandlers` class
2. Add cross-element validation logic
3. Test continuity error detection
4. Verify comprehensive consistency reporting

## Claude Desktop Configuration

Single entry in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "world-server": {
      "command": "node",
      "args": ["src/mcps/world-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    }
  }
}
```

## Testing Strategy

### Component Testing Scenarios

**Location Management:**
- "Create the capital city with detailed geography"
- "Map the relationship between the kingdom and its provinces"
- "Track which chapters use the haunted forest location"

**Organization Management:**
- "Create a thieves' guild with hierarchy and territories"
- "Analyze power conflicts between the church and crown"
- "Track character memberships in various organizations"

**World Element Systems:**
- "Define the magic system with limitations and costs"
- "Create advanced technology with access restrictions"
- "Validate interactions between magic and technology"

**Consistency Checking:**
- "Check for geographic impossibilities in travel times"
- "Validate organizational power balance across the series"
- "Detect magic system rule violations in recent chapters"

## Cross-Server Integration

### With Character Server
- Character location tracking and movement validation
- Character organization memberships and loyalties
- Character access to world elements and abilities

### With Plot Server
- Plot threads tied to specific locations or organizations
- World element usage in story development
- Conflict generation from world inconsistencies

### With Writing Server
- Scene settings linked to location database
- Chapter validation against world rules
- World element usage tracking during writing

## Implementation Priorities

1. **Location Management** (foundation for physical world)
2. **Organization Management** (social/political structures)
3. **World Element Systems** (magic/technology rules)
4. **Consistency Management** (validation and error detection)

## Anti-Patterns to Avoid

### Over-Specification
❌ **Don't create:**
- Rigid world templates by genre
- Mandatory world-building categories
- Overly complex relationship requirements
- Prescriptive magic/technology systems

✅ **Do create:**
- Flexible world element categories
- Optional detailed tracking
- Organic relationship development
- Author-defined world rules

### Micromanagement
❌ **Don't implement:**
- Excessive detail requirements for every location
- Forced organizational hierarchies
- Rigid magic system templates
- Pedantic consistency enforcement

✅ **Do implement:**
- Scalable detail levels (simple to complex)
- Flexible organizational structures
- Customizable world rules
- Helpful consistency suggestions

## Success Metrics

### For Author-Students (Tutorial Learners)
- Can build and configure their own World MCP system
- Understand how to model complex fictional worlds in databases
- Can customize world rules and consistency checks for their universe
- Can test each component to ensure AI team can manage world complexity

### For AI Writing Teams (Primary Users)
- Can track and maintain complex world consistency automatically
- Can validate character movements and actions against world geography
- Can ensure organizational relationships remain logical
- Can enforce magic/technology system rules without author intervention
- Can detect and flag world inconsistencies before they become plot holes
- Can provide rich world context for story decisions
- Can generate world-building suggestions based on established patterns

### For Authors (Beneficiaries)
- Complete freedom from world consistency tracking and management
- AI team prevents world-building errors automatically
- Rich, detailed fictional worlds maintained without author oversight
- Focus entirely on storytelling while AI manages world logic
- Seamless world expansion as series grows

## Cross-Chat Reference

When working across multiple chat sessions, reference:
- This guide for architecture decisions
- Component list for implementation status
- Testing scenarios for validation
- Anti-pattern list for quality maintenance
- Integration points for cross-server coordination

Each component can be developed independently while maintaining integration points with existing Character, Plot, and Writing servers. The World Server provides the foundation for rich, consistent fictional universes that grow organically with the author's creative vision.