# Plot Server Modular Implementation Guide

## Overview

This guide breaks down the Plot Server MCP into manageable components that can be developed separately and combined in an editor. The approach maintains the single MCP server pattern while making development more manageable.

## Project Structure

```
src/mcps/plot-server/
├── index.js                    ← Main MCP server (what Claude Desktop sees)
├── handlers/
│   ├── plot-thread-handlers.js    ← Plot thread CRUD operations
│   ├── story-analysis-handlers.js ← Dramatica-inspired analysis
│   └── genre-extensions.js        ← Genre-specific tools
├── schemas/
│   └── plot-tools-schema.js       ← Tool definitions
└── utils/
    └── plot-validators.js         ← Validation helpers
```

## Architecture Pattern

### Main Server (`index.js`)
- Extends `BaseMCPServer`
- Imports and combines all handler modules
- Registers with Claude Desktop
- Manages database connection

### Handler Modules
- Export classes with methods
- Mixed into main server via `Object.assign()`
- Each focuses on specific functionality
- Return tool definitions and implement handlers

## Implementation Components

### 1. Core Server Structure (`index.js`)

**Purpose:** Main MCP server entry point
**Size:** ~100 lines
**Key Features:**
- Constructor and database connection
- Handler module integration
- Tool registration
- MCP protocol compliance

**Template Structure:**
```javascript
class PlotMCPServer extends BaseMCPServer {
    constructor() {
        super('plot-management', '1.0.0');
        
        // Mix in handlers
        Object.assign(this, new PlotThreadHandlers());
        Object.assign(this, new StoryAnalysisHandlers());
        Object.assign(this, new GenreExtensions());
        
        this.tools = this.getTools();
    }
    
    getTools() {
        return [
            ...this.getPlotThreadTools(),
            ...this.getStoryAnalysisTools(),
            ...this.getGenreSpecificTools(this.getCurrentSeriesGenre())
        ];
    }
}
```

### 2. Plot Thread Management (`handlers/plot-thread-handlers.js`)

**Purpose:** Core plot thread CRUD operations
**Size:** ~150-200 lines
**Key Features:**
- Create, read, update, delete plot threads
- Thread status tracking (active, resolved, on_hold, abandoned)
- Thread relationships (parent/child threads)
- Cross-book thread tracking

**Tools to Implement:**
- `create_plot_thread`
- `update_plot_thread` 
- `get_plot_threads`
- `link_plot_threads`
- `resolve_plot_thread`

**Export Pattern:**
```javascript
export class PlotThreadHandlers {
    getPlotThreadTools() {
        return [/* tool definitions */];
    }
    
    async handleCreatePlotThread(args) {
        // Implementation
    }
    // Other handlers...
}
```

### 3. Dramatica-Inspired Analysis (`handlers/story-analysis-handlers.js`)

**Purpose:** Flexible story analysis without rigid structure
**Size:** ~150-200 lines
**Key Features:**
- Story appreciations tracking
- Problem/solution dynamics
- Character throughline analysis
- Thematic element management

**Dramatica Elements to Track:**
- **Story Concern:** What the overall story is about (obtaining, understanding, becoming, conceiving)
- **Main Character Problem:** Personal issues driving the protagonist
- **Influence Character Impact:** How other characters challenge the MC
- **Story Outcome vs. Judgment:** Success/failure vs. good/bad
- **Thematic Elements:** Values in conflict

**Tools to Implement:**
- `analyze_story_dynamics`
- `track_character_throughlines`
- `identify_story_appreciations`
- `map_problem_solutions`

**Guardrails Against Rigid Structure:**
- No predetermined beats or percentages
- Focus on story function over form
- Track what emerges organically
- Support multiple story approaches

### 4. Genre Extension System (`handlers/genre-extensions.js`)

**Purpose:** Dynamic genre-specific tools
**Size:** ~200-250 lines
**Key Features:**
- Genre detection and tool loading
- Extensible genre modules
- Genre-agnostic base tools

**Genre Extensions to Include:**

**Mystery/Detective:**
- `create_case`, `update_case`, `get_cases`
- `add_evidence`, `remove_evidence`, `get_evidence`
- `track_clues`, `link_clues_to_evidence`
- `manage_red_herrings`

**Romance:**
- `create_relationship_arc`
- `track_romantic_tension`
- `manage_relationship_obstacles`
- `chart_emotional_beats`

**Fantasy:**
- `define_magic_system`
- `track_power_progression`
- `manage_magical_limitations`
- `world_rule_consistency`

**Export Pattern:**
```javascript
export class GenreExtensions {
    getGenreSpecificTools(genre) {
        const genreMap = {
            'mystery': this.getMysteryTools(),
            'romance': this.getRomanceTools(),
            'fantasy': this.getFantasyTools()
        };
        return genreMap[genre] || [];
    }
    
    getMysteryTools() {
        return [/* mystery-specific tools */];
    }
    // Other genre methods...
}
```

### 5. Tool Definitions (`schemas/plot-tools-schema.js`)

**Purpose:** Centralized tool schema definitions
**Size:** ~200-300 lines
**Key Features:**
- JSON schema definitions for all tools
- Input validation schemas
- Tool documentation

**Export Pattern:**
```javascript
export const plotThreadToolsSchema = [
    {
        name: 'create_plot_thread',
        description: 'Create a new plot thread',
        inputSchema: {/* schema */}
    }
    // More definitions...
];
```

## Database Schema (`migrations/004_add_plot_schema.sql`)

### Core Tables

```sql
-- Plot threads (series arcs, subplots, character arcs)
CREATE TABLE plot_threads (
    thread_id SERIAL PRIMARY KEY,
    series_id INTEGER REFERENCES series(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thread_type VARCHAR(50), -- series_arc, subplot, character_arc
    current_status VARCHAR(50) DEFAULT 'active',
    importance_level INTEGER CHECK (importance_level BETWEEN 1 AND 10),
    start_book INTEGER,
    end_book INTEGER,
    parent_thread_id INTEGER REFERENCES plot_threads(thread_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Story analysis (Dramatica-inspired)
CREATE TABLE story_analysis (
    analysis_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    story_concern VARCHAR(100),
    main_character_problem TEXT,
    story_outcome VARCHAR(50),
    story_judgment VARCHAR(50),
    thematic_elements JSONB,
    analysis_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Genre-specific tables (conditionally created)
CREATE TABLE detective_cases (
    case_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id),
    case_name VARCHAR(255),
    case_status VARCHAR(50),
    victim_info TEXT,
    suspects JSONB,
    timeline_events JSONB
);

CREATE TABLE romance_arcs (
    arc_id SERIAL PRIMARY KEY,
    plot_thread_id INTEGER REFERENCES plot_threads(thread_id),
    character_a_id INTEGER,
    character_b_id INTEGER,
    relationship_stage VARCHAR(100),
    tension_level INTEGER CHECK (tension_level BETWEEN 1 AND 10),
    obstacles TEXT[]
);
```

## Integration Strategy

### Step 1: Create Main Server
1. Build basic `index.js` with constructor
2. Set up handler module imports
3. Test MCP server registration

### Step 2: Add Core Plot Threads
1. Implement `PlotThreadHandlers` class
2. Add basic CRUD operations
3. Test with simple plot thread creation

### Step 3: Add Story Analysis
1. Implement Dramatica-inspired analysis tools
2. Focus on flexible story appreciations
3. Avoid rigid structural templates

### Step 4: Add Genre Extensions
1. Start with one genre (mystery recommended)
2. Test dynamic tool loading
3. Add additional genres incrementally

### Step 5: Integration Testing
1. Test all tools working together
2. Verify genre switching
3. Test cross-component interactions

## Claude Desktop Configuration

Only one entry needed in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "plot-server": {
      "command": "node",
      "args": ["src/mcps/plot-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    }
  }
}
```

## Testing Strategy

### Component Testing
Each handler module should be testable independently:

```bash
# Test individual components
node -e "import('./handlers/plot-thread-handlers.js').then(m => console.log('Plot threads loaded'))"
```

### Integration Testing
Test through Claude Desktop with these scenarios:

1. **Basic Plot Thread:** "Create a main story arc for my mystery series"
2. **Genre Tools:** "Start a murder case with initial evidence"
3. **Story Analysis:** "Analyze the story dynamics in Book 1"
4. **Cross-Component:** "Link this case to the main character's personal arc"

## Implementation Order Recommendation

1. **Start with:** Core server structure (`index.js`)
2. **Then:** Plot thread handlers (foundation)
3. **Next:** One genre extension (mystery)
4. **Then:** Story analysis tools
5. **Finally:** Additional genre extensions

## Anti-Patterns to Avoid

### Rigid Structure Templates
❌ **Don't implement:**
- "Act 1 ends at 25%"
- "Hero's Journey steps"
- Predetermined story beats
- Fixed plot point timing

✅ **Do implement:**
- Organic story development tracking
- Flexible story appreciations
- Problem/solution dynamics
- Character-driven progression

### Monolithic Design
❌ **Don't create:**
- Single massive handler file
- Tightly coupled components
- Hard-coded genre assumptions

✅ **Do create:**
- Modular, mixable components
- Loose coupling between handlers
- Dynamic genre tool loading

## Success Metrics

### For Author-Students (Tutorial Learners)
- Can build and configure their own Plot MCP system
- Understand how to implement genre-specific extensions
- Can customize Dramatica-inspired analysis for their writing style
- Can test each component to ensure AI team functionality
- Learn to avoid rigid structural templates in favor of flexible story tracking

### For AI Writing Teams (Primary Users)
- Can track organic story development automatically
- Can analyze story dynamics using Dramatica principles
- Can work with multiple genres dynamically
- Can identify plot inconsistencies and suggest solutions
- Can reference flexible story appreciations for writing decisions
- Can analyze story function over form
- Can provide genre-appropriate guidance (mystery clues, romance tension, fantasy magic systems)
- Can validate plot threads across multiple books without author intervention

### For Authors (Beneficiaries)
- Complete freedom from plot tracking and continuity management
- AI team handles all story structure analysis automatically
- No rigid templates imposed on creative process
- Genre-specific support provided seamlessly by AI team
- Focus entirely on creative storytelling while AI manages consistency

## Cross-Chat Reference

When working across multiple chat sessions, reference:
- This guide for architecture decisions
- Component list for current implementation status
- Testing scenarios for validation
- Anti-pattern list for quality checks

Each component can be developed independently and integrated following the patterns established in this guide.