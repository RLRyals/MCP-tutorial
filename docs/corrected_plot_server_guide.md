## Anti-Patterns Corrected

### Rigid Genre Specialization (Successfully Avoided)
- ❌ Separate MCPs for each genre requiring maintenance of multiple systems
- ❌ Hard-coded detective_cases limited to murder mysteries
- ❌ character_a_id/character_b_id rigid pairing that breaks with complex relationships  
- ❌ magic_system tables that don't work for sci-fi or divine powers
- ✅ **Implemented:** Universal information reveals across all genres
- ✅ **Implemented:** Flexible relationship participants supporting any configuration
- ✅ **Implemented:** Universal world systems for any supernatural/advanced element
- ✅ **Implemented:** Single# Plot Server Modular Implementation Guide - CORRECTED

## Overview

Following the established architecture pattern from World Server, this guide describes how to build the Plot Server MCP with one fully functional component and stub handlers for future expansion.

## Project Structure

```
src/mcps/plot-server/
├── index.js                          ← Main MCP server entry point
└── handlers/
    ├── plot-thread-handlers.js       ← FULLY IMPLEMENTED plot thread CRUD
    ├── story-analysis-handlers.js    ← STUB for Dramatica-inspired analysis
    ├── romance-handlers.js           ← STUB for romance subplot tracking
    └── mystery-handlers.js           ← STUB for case/evidence management
```

## Architecture Pattern

### Main Server (`index.js`)
- Extends `BaseMCPServer`
- Creates handler instances with database injection
- Uses **explicit method binding** (not Object.assign)
- Handles cross-component plot analysis
- Supports both MCP stdio and CLI modes

**Template Structure:**
```javascript
class PlotMCPServer extends BaseMCPServer {
    constructor() {
        super('plot-manager', '1.0.0');
        
        // Initialize handlers with database injection
        this.plotThreadHandlers = new PlotThreadHandlers(this.db);
        this.storyAnalysisHandlers = new StoryAnalysisHandlers(this.db);
        this.romanceHandlers = new RomanceHandlers(this.db);
        this.mysteryHandlers = new MysteryHandlers(this.db);
        
        // Bind handler methods explicitly
        this.bindHandlerMethods();
        this.tools = this.getTools();
    }
    
    bindHandlerMethods() {
        // Bind plot thread methods
        this.handleCreatePlotThread = this.plotThreadHandlers.handleCreatePlotThread.bind(this.plotThreadHandlers);
        this.handleGetPlotThreads = this.plotThreadHandlers.handleGetPlotThreads.bind(this.plotThreadHandlers);
        // ... other bindings
    }
}
```

## Implementation Strategy

### Phase 1: Core Plot Thread Management (Current Branch)

**Plot Thread Handlers** - FULLY IMPLEMENTED
**Size:** ~250-300 lines
**Features:**
- Complete CRUD operations for plot threads
- Thread status tracking (active, resolved, on_hold, abandoned)
- Parent/child thread relationships
- Cross-book thread tracking
- Thread importance and complexity levels

**Key Tools Implemented:**

**Core Plot Thread Management:**
```javascript
{
    name: 'create_plot_thread',
    description: 'Create a new plot thread (story arc, subplot, character arc)',
    // Uses database lookup tables for thread_type validation
    // Supports parent/child relationships and character associations
}

{
    name: 'link_plot_threads',
    description: 'Create relationships between plot threads',
    // Uses relationship_types lookup table for validation
    // Supports strength ratings and establishment tracking
}

{
    name: 'resolve_plot_thread',
    description: 'Mark a plot thread as resolved with details',
    // Updates status via plot_thread_statuses lookup table
    // Tracks resolution book and detailed resolution notes
}
```

**Dramatica-Inspired Analysis:**
```javascript
{
    name: 'analyze_story_dynamics',
    description: 'Analyze story dynamics using Dramatica-inspired elements',
    // Uses story_concerns, story_outcomes, story_judgments lookup tables
    // Flexible analysis without rigid structure enforcement
}

{
    name: 'track_character_throughlines',
    description: 'Track character development throughlines',
    // Supports main_character, influence_character, relationship, objective_story types
    // Graceful fallback to story_analysis notes when tables missing
}

{
    name: 'map_problem_solutions',
    description: 'Map problem/solution dynamics in the story',
    // Tracks problems at overall_story, main_character, influence_character, relationship levels
    // Maps solution effectiveness: solves, complicates, redirects, unknown
}
```

**Universal Genre Tools (Replacing Rigid Genre-Specific):**
```javascript
{
    name: 'create_case', // UNIVERSAL MYSTERY TOOL
    description: 'Create a new mystery case',
    // Works for: murder mysteries, missing persons, thefts, conspiracies, secrets
    // Any genre with information reveals and investigation
}

{
    name: 'create_relationship_arc', // UNIVERSAL RELATIONSHIP TOOL  
    description: 'Create a romantic relationship arc',
    // Works for: romantic pairs, love triangles, family dynamics, friendships
    // Any relationship development across any genre
}

{
    name: 'define_magic_system', // UNIVERSAL SUPERNATURAL TOOL
    description: 'Define or update magic system rules', 
    // Works for: magic, superpowers, advanced technology, psychic abilities
    // Any supernatural or advanced system with rules and limitations
}
```

**Advanced Trope System:**
```javascript
{
    name: 'create_trope',
    description: 'Create a new trope definition with its scene types',
    // Complete trope definition with scene type breakdowns
    // Typical trajectory tracking and common elements
}

{
    name: 'implement_trope_scene',
    description: 'Implement a specific scene type for a trope instance',
    // Scene-by-scene implementation with effectiveness ratings
    // Variation tracking for subversion analysis
}

{
    name: 'analyze_trope_patterns',
    description: 'Analyze trope usage patterns across a series',
    // Frequency, subversion, and effectiveness analysis
    // Series-wide pattern recognition
}
```

## Database Schema Integration (Comprehensive)

**Required Tables (All Implemented):**
```sql
-- Plot threads with lookup table relationships (FULLY FUNCTIONAL)
CREATE TABLE plot_threads (
    thread_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thread_type_id INTEGER REFERENCES plot_thread_types(type_id), -- Uses lookup table
    current_status_id INTEGER REFERENCES plot_thread_statuses(status_id) DEFAULT 1, -- Uses lookup table
    importance_level INTEGER CHECK (importance_level BETWEEN 1 AND 10) DEFAULT 5,
    complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 10) DEFAULT 5,
    start_book INTEGER,
    end_book INTEGER,
    resolution_book INTEGER,
    resolution_notes TEXT,
    parent_thread_id INTEGER REFERENCES plot_threads(thread_id),
    related_characters INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lookup tables for validation (FULLY FUNCTIONAL)
CREATE TABLE plot_thread_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE NOT NULL, -- series_arc, character_arc, subplot, etc.
    type_description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE plot_thread_statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL, -- active, resolved, on_hold, abandoned
    status_description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Story analysis with Dramatica elements (FULLY FUNCTIONAL)
CREATE TABLE story_analysis (
    analysis_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    story_concern_id INTEGER REFERENCES story_concerns(concern_id),
    main_character_problem TEXT,
    influence_character_impact TEXT,
    story_outcome_id INTEGER REFERENCES story_outcomes(outcome_id),
    story_judgment_id INTEGER REFERENCES story_judgments(judgment_id),
    thematic_elements JSONB,
    analysis_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advanced trope system (FULLY FUNCTIONAL)
CREATE TABLE tropes (
    trope_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    trope_name VARCHAR(255) NOT NULL,
    trope_category VARCHAR(100), -- romance_trope, character_trope, plot_trope
    description TEXT,
    common_elements TEXT[],
    typical_trajectory TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trope_scene_types (
    scene_type_id SERIAL PRIMARY KEY,
    trope_id INTEGER REFERENCES tropes(trope_id) ON DELETE CASCADE,
    scene_function VARCHAR(255) NOT NULL, -- opening, revelation, obstacle, climax
    scene_description TEXT NOT NULL,
    typical_placement VARCHAR(50) DEFAULT 'middle', -- early, middle, climax, resolution
    required BOOLEAN DEFAULT false,
    narrative_purpose TEXT,
    emotional_beats TEXT[]
);

CREATE TABLE trope_instances (
    instance_id SERIAL PRIMARY KEY,
    trope_id INTEGER REFERENCES tropes(trope_id),
    book_id INTEGER REFERENCES books(id),
    instance_notes TEXT,
    subversion_notes TEXT,
    completion_status VARCHAR(50) DEFAULT 'in_progress', -- planned, in_progress, complete, subverted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trope_scenes (
    trope_scene_id SERIAL PRIMARY KEY,
    instance_id INTEGER REFERENCES trope_instances(instance_id),
    scene_type_id INTEGER REFERENCES trope_scene_types(scene_type_id),
    chapter_id INTEGER,
    scene_number INTEGER,
    scene_summary TEXT NOT NULL,
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 10) DEFAULT 7,
    variation_notes TEXT,
    UNIQUE(instance_id, scene_type_id)
);

-- Universal genre tables (IMPLEMENTED with fallbacks)
CREATE TABLE detective_cases (
    case_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id),
    case_name VARCHAR(255) NOT NULL,
    victim_info TEXT,
    case_status VARCHAR(50) DEFAULT 'open',
    suspects JSONB,
    timeline_events JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE romance_arcs (
    arc_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id),
    character_a_id INTEGER,
    character_b_id INTEGER,
    relationship_stage VARCHAR(100) DEFAULT 'strangers',
    tension_level INTEGER CHECK (tension_level BETWEEN 1 AND 10) DEFAULT 5,
    obstacles TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing Strategy

### Immediate Testing (All Tools Work Now):

**Core Plot Thread Management:**
```
"Create a main story arc called 'The Dragon War' for series 1, spanning books 1-3 with importance level 9"
"Link the Dragon War arc to the character development arc with relationship type 'drives' and strength 8"  
"Get all active plot threads for series 1 filtered by importance level 7 or higher"
"Resolve the Dragon War arc in book 3 with detailed resolution notes"
```

**Dramatica-Inspired Analysis:**
```
"Analyze story dynamics for book 1: story concern is 'obtaining', main character problem is trust issues"
"Track main character throughline for character 5 in book 1 with character arc details"
"Identify story appreciation: appreciation type 'theme', value 'power corrupts', confidence 8"
"Map problem-solution: problem 'betrayal by mentor' at main_character level, solution 'learning self-reliance'"
```

**Universal Genre Tools:**
```
"Create a case called 'The Missing Heirloom' linked to plot thread 15 with victim info and 3 initial suspects"
"Add physical evidence to case 1: 'bloodstained handkerchief found in library' discovered in chapter 8"
"Create relationship arc between characters 12 and 18 at 'attracted' stage with tension level 7"
"Define magic system for series 2: elemental magic with power source 'natural elements' and 3 limitations"
```

**Advanced Trope System:**
```
"Create trope 'Enemies to Lovers' with 5 scene types including 'initial conflict' and 'forced cooperation'"
"Create trope instance of 'Enemies to Lovers' in book 2 with subversion notes about power dynamics"
"Implement trope scene: scene type 4 in chapter 12 with effectiveness rating 9 and variation notes"
"Analyze trope patterns across series 1 for frequency and subversion analysis"
```

## Testing Strategy

### Immediate Testing (Current Branch):
```
"Create a main story arc called 'The Dragon War' spanning books 1-3"
"Create a character arc for Sarah's magical development"
"List all active plot threads in my series"
"Update the Dragon War arc status to resolved"
```

### Future Testing (Next Branches):
```
"Analyze the story dynamics using Dramatica principles"
"Track romantic tension between characters A and B"
"Create a murder case with evidence tracking"
```

## Dramatica-Inspired Analysis (Future Implementation)

**Flexible Story Appreciations** (Not Rigid Structure):
```javascript
// Track what emerges organically - don't force structure
const storyAppreciations = {
    story_concern: "What the overall story is about",
    main_character_problem: "Personal issues driving protagonist", 
    influence_character_impact: "How other characters challenge MC",
    story_outcome: "Success/failure of story goal",
    story_judgment: "Good/bad feeling about outcome",
    thematic_elements: "Values in conflict"
};
```

**Anti-Patterns to Avoid:**
- ❌ Rigid beat percentages ("inciting incident at 25%")
- ❌ Forced Hero's Journey steps
- ❌ Predetermined plot point timing
- ✅ Organic story development tracking
- ✅ Problem/solution dynamics
- ✅ Character-driven progression

## Universal Genre Tools (Corrected Architecture)

### Information Reveals (Replaces Genre-Specific Mystery Tools)
Instead of `detective_cases` limited to mysteries, implement **universal information reveals**:

```javascript
// Universal information reveal tracking
{
    name: 'create_information_reveal',
    description: 'Track any information reveal across all genres',
    inputSchema: {
        plot_thread_id: { type: 'integer', description: 'Associated plot thread' },
        reveal_type: { 
            type: 'string',
            description: 'Type of reveal: evidence, secret, backstory, world_rule, relationship, skill'
        },
        information_content: { type: 'string', description: 'What information is revealed' },
        reveal_method: { type: 'string', description: 'How the information is revealed' },
        significance_level: { 
            type: 'string', 
            enum: ['minor', 'major', 'climactic', 'world_changing'],
            description: 'Impact level of this reveal'
        },
        affects_characters: { 
            type: 'array',
            items: { type: 'integer' },
            description: 'Character IDs who learn this information'  
        },
        revealed_in_chapter: { type: 'integer', description: 'Chapter where revealed' }
    }
}
```

**Works across all genres:**
- **Mystery:** Evidence reveals, suspect discoveries, case breakthroughs, red herrings
- **Romance:** Emotional revelations, past relationships, feelings admissions, family secrets  
- **Fantasy:** Magic system rules, world history, character powers, prophecies
- **Literary Fiction:** Character motivations, backstory reveals, thematic insights
- **Thriller:** Conspiracy reveals, identity discoveries, plot twists
- **Sci-Fi:** Technology discoveries, alien revelations, timeline secrets

### Flexible Relationship Dynamics (Replaces Rigid Character A/B)
Replace `character_a_id` and `character_b_id` with **flexible relationship participants**:

```javascript
// Universal relationship arc system
{
    name: 'create_relationship_arc',
    description: 'Track any relationship development across all genres and relationship types',
    inputSchema: {
        plot_thread_id: { type: 'integer', description: 'Associated plot thread' },
        arc_name: { type: 'string', description: 'Name for this relationship arc' },
        participants: {
            type: 'array',
            items: { 
                type: 'object',
                properties: {
                    character_id: { type: 'integer' },
                    role_in_relationship: { type: 'string' }, // primary, secondary, catalyst, observer
                    character_name: { type: 'string' } // For reference
                }
            },
            description: 'Characters involved (2 or more, flexible roles)'
        },
        relationship_type: {
            type: 'string',
            description: 'Type: romantic, family, friendship, professional, antagonistic, mentor, alliance'
        },
        current_dynamic: { type: 'string', description: 'Current relationship dynamic/stage' },
        development_factors: {
            type: 'array', 
            items: { type: 'string' },
            description: 'What drives development in this relationship'
        },
        complexity_level: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
            description: 'Relationship complexity (1=simple, 10=very complex)'
        }
    }
}
```

**Supports all relationship configurations:**
- **Romantic Pairs:** Traditional couples, star-crossed lovers, workplace romance
- **Love Triangles:** Classic triangles, harems, polyamorous relationships
- **Family Dynamics:** Parent-child, siblings, extended family, found family, adoptive relationships
- **Friend Groups:** Core groups, shifting alliances, friend-to-enemy arcs, reunions  
- **Professional Networks:** Mentor-student, colleagues, workplace hierarchies, team dynamics
- **Complex Antagonistics:** Enemies, rivals, frenemies, ideological conflicts, competing goals

### Universal System Management (Replaces Magic-Specific)
Replace `magic_system` with **universal supernatural/advanced systems**:

```javascript
// Universal system definition
{
    name: 'define_world_system',
    description: 'Define any systematic supernatural/advanced element with rules and limitations',
    inputSchema: {
        series_id: { type: 'integer', description: 'Series ID' },
        system_name: { type: 'string', description: 'Name of the system' },
        system_type: { 
            type: 'string',
            description: 'Type: magic, psionics, technology, divine, supernatural, mutation, alchemy'
        },
        power_source: { type: 'string', description: 'What powers this system' },
        access_method: { type: 'string', description: 'How beings access/use this system' },
        limitations: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Constraints, costs, and limitations'
        },
        system_rules: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Governing rules and principles'
        },
        power_scaling: {
            type: 'object',
            properties: {
                lowest_level: { type: 'string', description: 'Weakest manifestation' },
                highest_level: { type: 'string', description: 'Strongest possible manifestation' },
                progression_method: { type: 'string', description: 'How power increases' }
            }
        }
    }
}
```

**Works for all supernatural/advanced systems:**
- **Magic Systems:** Elemental magic, divine magic, wizard schools, ritual magic, blood magic
- **Psychic Powers:** Telepathy, telekinesis, precognition, astral projection
- **Advanced Technology:** AI systems, nanotechnology, genetic enhancement, time travel
- **Divine Systems:** Miracles, divine favor, religious magic, pantheon powers
- **Supernatural Elements:** Vampire abilities, werewolf transformations, ghost powers
- **Mutation Systems:** X-Men style powers, radiation effects, evolutionary changes

### Universal Base Tables (Replaces Genre-Specific)
```sql
-- Universal information reveals (replaces detective_cases)
CREATE TABLE information_reveals (
    reveal_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id),
    reveal_type VARCHAR(100), -- evidence, secret, backstory, world_rule, relationship
    information_content TEXT NOT NULL,
    reveal_method VARCHAR(255), -- discovered, confessed, witnessed, deduced
    significance_level VARCHAR(50), -- minor, major, climactic, world_changing
    affects_characters INTEGER[], -- Who learns this information
    revealed_in_chapter INTEGER,
    consequences TEXT,
    foreshadowing_chapters INTEGER[], -- Where this was hinted at
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universal relationship arcs (replaces romance_arcs)
CREATE TABLE relationship_arcs (
    arc_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id),
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

-- Universal world systems (replaces magic_systems)
CREATE TABLE world_systems (
    system_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    system_name VARCHAR(255) NOT NULL,
    system_type VARCHAR(100), -- magic, psionics, technology, divine, supernatural
    power_source TEXT,
    access_method TEXT,
    limitations TEXT[],
    system_rules TEXT[],
    power_scaling JSONB, -- Flexible scaling information
    system_users INTEGER[], -- Character IDs who can use this system
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Success Metrics

### For Tutorial Students:
- Immediate plot thread management functionality
- Clear understanding of flexible story analysis
- Can expand with genre-specific tools
- Learn to avoid rigid story templates

### For AI Writing Teams:
- Complete plot thread tracking from day one
- Organic story development analysis
- Genre-agnostic plot consistency checking
- Future expansion for specialized plot types

### For Authors:
- Plot continuity managed automatically by AI team
- No imposed story structure templates
- Focus on creative storytelling
- AI handles complexity tracking across multiple books

## Key Implementation Points

1. **Start with universal plot thread management** (works for all genres)
2. **Use explicit method binding** for handler context
3. **Avoid rigid story structure templates** 
4. **Plan for genre-specific expansion** without breaking core functionality
5. **Focus on organic story development tracking**

This approach provides immediate value through plot thread management while establishing the foundation for sophisticated story analysis and genre-specific tools in future tutorial branches.