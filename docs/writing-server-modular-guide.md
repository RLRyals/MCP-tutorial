# Writing Server Modular Implementation Guide

## Overview

This guide breaks down the Writing Server MCP into manageable components focused on the production aspects of writing - chapter management, writing sessions, manuscript compilation, and flexible validation tools. This server is critical for actual writing workflow and productivity tracking.

## Project Structure

```
src/mcps/writing-server/
├── index.js                     ← Main MCP server (what Claude Desktop sees)
├── handlers/
│   ├── chapter-handlers.js      ← Chapter CRUD and bulk operations
│   ├── session-handlers.js      ← Writing sessions and productivity
│   ├── manuscript-handlers.js   ← Export and compilation
│   └── validation-handlers.js   ← Flexible structure checking
├── schemas/
│   └── writing-tools-schema.js  ← Tool definitions
└── utils/
    ├── word-counter.js          ← Text analysis utilities
    ├── export-formatter.js     ← Manuscript formatting
    └── validation-rules.js     ← Flexible validation logic
```

## Architecture Pattern

### Main Server (`index.js`)
- Extends `BaseMCPServer`
- Imports and combines all handler modules
- Manages database connection
- Coordinates between chapter data and character presence

### Handler Modules
- Export classes with focused functionality
- Mixed into main server via `Object.assign()`
- Each handles specific writing workflow aspect
- Return tool definitions and implement handlers

## Implementation Components

### 1. Core Server Structure (`index.js`)

**Purpose:** Main MCP server entry point
**Size:** ~120 lines
**Key Features:**
- Constructor and database connection
- Handler module integration
- Cross-server coordination (with Character server)
- Tool registration

**Template Structure:**
```javascript
class WritingMCPServer extends BaseMCPServer {
    constructor() {
        super('writing-manager', '1.0.0');
        
        // Mix in handlers
        Object.assign(this, new ChapterHandlers());
        Object.assign(this, new SessionHandlers());
        Object.assign(this, new ManuscriptHandlers());
        Object.assign(this, new ValidationHandlers());
        
        this.tools = this.getTools();
    }
    
    getTools() {
        return [
            ...this.getChapterTools(),
            ...this.getSessionTools(),
            ...this.getManuscriptTools(),
            ...this.getValidationTools()
        ];
    }
}
```

### 2. Chapter Management (`handlers/chapter-handlers.js`)

**Purpose:** Chapter CRUD operations and bulk management
**Size:** ~200-250 lines
**Key Features:**
- Chapter creation with flexible structure
- Bulk operations for efficiency
- Scene-level management within chapters
- Integration with character presence tracking

**Tools to Implement:**
- `create_chapter`
- `update_chapter` 
- `get_chapter`
- `get_chapters` (with filtering)
- `bulk_chapter_operations`
- `create_scene`
- `update_scene`
- `reorder_chapters`

**Chapter Data Structure:**
```javascript
// Flexible chapter structure - no rigid requirements
{
    chapter_number: 1,
    title: "The Discovery",
    summary: "Brief chapter summary",
    word_count: 3500,
    target_word_count: 4000,
    status: "draft", // planned, outlined, drafted, revised, final
    pov_character_id: 15,
    primary_location: "Downtown office building",
    story_time_start: "Monday, 9 AM",
    story_duration: "2 hours",
    author_notes: "Remember to foreshadow the evidence",
    scenes: [/* scene objects */]
}
```

**Export Pattern:**
```javascript
export class ChapterHandlers {
    getChapterTools() {
        return [/* tool definitions */];
    }
    
    async handleCreateChapter(args) {
        // Create chapter and notify character server if needed
    }
    
    async handleBulkChapterOperations(args) {
        // Batch operations for efficiency
    }
    // Other handlers...
}
```

### 3. Writing Session Management (`handlers/session-handlers.js`)

**Purpose:** Writing productivity tracking and goal management
**Size:** ~180-220 lines
**Key Features:**
- Writing session logging
- Goal setting and tracking
- Productivity analytics
- Progress visualization data

**Tools to Implement:**
- `log_writing_session`
- `get_writing_progress`
- `set_writing_goals`
- `get_productivity_analytics`
- `track_daily_words`
- `analyze_writing_patterns`

**Session Tracking Features:**
- Words written per session
- Time spent writing
- Chapter/scene focus
- Mood and energy tracking
- Distractions and interruptions
- Writing environment notes

**Analytics to Provide:**
- Words per hour trends
- Most productive times of day
- Chapter completion patterns
- Goal achievement rates
- Writing streak tracking

**Export Pattern:**
```javascript
export class SessionHandlers {
    getSessionTools() {
        return [/* session tool definitions */];
    }
    
    async handleLogWritingSession(args) {
        // Record session with flexible metrics
        const session = {
            start_time: args.start_time,
            end_time: args.end_time,
            words_written: args.words_written,
            chapters_worked: args.chapters_worked,
            session_mood: args.mood, // optional
            notes: args.notes,
            distractions: args.distractions // optional tracking
        };
    }
    // Other session handlers...
}
```

### 4. Manuscript Export (`handlers/manuscript-handlers.js`)

**Purpose:** Manuscript compilation and export functionality
**Size:** ~200-250 lines
**Key Features:**
- Full manuscript compilation
- Multiple export formats
- Formatting and styling options
- Word count tracking across entire work

**Tools to Implement:**
- `export_manuscript`
- `compile_book_manuscript`
- `word_count_tracking`
- `generate_chapter_summaries`
- `export_series_outline`
- `create_submission_package`

**Export Formats to Support:**
- Plain text (.txt)
- Markdown (.md)
- Rich Text Format (.rtf)
- Standard Manuscript Format
- Custom formatting templates

**Compilation Features:**
- Chapter ordering and numbering
- Scene break formatting
- Metadata inclusion (word counts, chapter summaries)
- Character name consistency checking
- Timeline validation during export

**Export Pattern:**
```javascript
export class ManuscriptHandlers {
    getManuscriptTools() {
        return [/* manuscript tool definitions */];
    }
    
    async handleExportManuscript(args) {
        const { book_id, format, include_metadata } = args;
        
        // Gather all chapters in order
        // Apply formatting based on format type
        // Include metadata if requested
        // Return compiled manuscript
    }
    // Other manuscript handlers...
}
```

### 5. Structure Validation (`handlers/validation-handlers.js`)

**Purpose:** Flexible validation without rigid templates
**Size:** ~150-200 lines
**Key Features:**
- Customizable validation rules
- Consistency checking
- Continuity validation
- Author-defined quality checks

**Tools to Implement:**
- `validate_chapter_structure`
- `check_consistency_violations`
- `validate_scene_flow`
- `check_character_continuity`
- `analyze_pacing_issues`
- `custom_validation_rules`

**Flexible Validation Approach:**
- Author-defined validation rules
- Consistency checking (not structure enforcement)
- Warning system rather than rigid requirements
- Configurable quality thresholds

**Validation Categories:**
```javascript
// Consistency checks (not structural requirements)
const validationTypes = {
    character_continuity: "Characters maintain consistent traits",
    timeline_logic: "Events occur in logical sequence", 
    location_consistency: "Locations maintain consistent descriptions",
    pov_consistency: "Point of view remains consistent within chapters",
    word_count_targets: "Chapters meet author-set targets",
    custom_rules: "Author-defined validation criteria"
};
```

**Anti-Pattern Guards:**
- No rigid word count requirements
- No forced structural beats
- No predetermined chapter lengths
- No genre-specific templates

### 6. Database Schema (`migrations/005_add_writing_schema.sql`)

### Core Tables

```sql
-- Chapters table (comprehensive structure)
CREATE TABLE chapters (
    chapter_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    
    -- Content metadata
    summary TEXT,
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER,
    actual_pages INTEGER,
    
    -- Writing process tracking
    status VARCHAR(50) DEFAULT 'planned', -- planned, outlined, drafted, revised, final
    draft_number INTEGER DEFAULT 1,
    revision_notes TEXT,
    
    -- Story structure
    pov_character_id INTEGER, -- references characters table
    narrative_style VARCHAR(50), -- first_person, third_limited, etc.
    primary_location VARCHAR(255),
    story_time_start VARCHAR(100),
    story_time_end VARCHAR(100),
    story_duration VARCHAR(50),
    
    -- Author workflow
    author_notes TEXT,
    writing_notes TEXT,
    completion_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(book_id, chapter_number)
);

-- Scenes within chapters
CREATE TABLE scenes (
    scene_id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapters(chapter_id),
    scene_number INTEGER NOT NULL,
    scene_title VARCHAR(255),
    
    -- Scene details
    location VARCHAR(255),
    time_of_day VARCHAR(50),
    duration VARCHAR(50),
    scene_purpose TEXT, -- what this scene accomplishes
    
    -- Content
    summary TEXT,
    word_count INTEGER DEFAULT 0,
    pov_character_id INTEGER,
    
    -- Writing process
    status VARCHAR(50) DEFAULT 'planned',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(chapter_id, scene_number)
);

-- Writing sessions tracking
CREATE TABLE writing_sessions (
    session_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    chapter_id INTEGER REFERENCES chapters(chapter_id),
    
    -- Session timing
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    
    -- Productivity metrics
    words_written INTEGER DEFAULT 0,
    words_deleted INTEGER DEFAULT 0,
    net_words INTEGER DEFAULT 0,
    
    -- Session context
    session_type VARCHAR(50), -- writing, editing, planning, research
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    focus_quality VARCHAR(50), -- excellent, good, fair, poor
    
    -- Environment and notes
    writing_location VARCHAR(100),
    distractions TEXT,
    session_notes TEXT,
    goals_for_session TEXT,
    goals_achieved BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Writing goals and targets
CREATE TABLE writing_goals (
    goal_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    
    -- Goal definition
    goal_type VARCHAR(50), -- daily_words, weekly_words, chapter_completion, book_completion
    target_value INTEGER,
    target_date DATE,
    
    -- Progress tracking
    current_progress INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    completed BOOLEAN DEFAULT false,
    completion_date DATE,
    
    -- Goal context
    description TEXT,
    motivation TEXT,
    reward TEXT, -- what happens when goal is achieved
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manuscript exports tracking
CREATE TABLE manuscript_exports (
    export_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    
    -- Export details
    export_format VARCHAR(50), -- txt, rtf, md, pdf, docx
    export_type VARCHAR(50), -- full_manuscript, partial, outline, summary
    chapters_included INTEGER[],
    
    -- Export metadata
    total_word_count INTEGER,
    total_pages INTEGER,
    export_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- File information
    filename VARCHAR(255),
    file_size INTEGER, -- in bytes
    file_path TEXT,
    
    -- Export settings
    include_chapter_summaries BOOLEAN DEFAULT false,
    include_character_notes BOOLEAN DEFAULT false,
    include_metadata BOOLEAN DEFAULT true,
    formatting_template VARCHAR(100),
    
    -- Export notes
    export_notes TEXT,
    intended_use VARCHAR(100) -- submission, review, backup, etc.
);

-- Validation rules (author-customizable)
CREATE TABLE validation_rules (
    rule_id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id),
    
    -- Rule definition
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50), -- word_count, consistency, structure, custom
    rule_description TEXT,
    
    -- Rule parameters (JSON for flexibility)
    rule_parameters JSONB,
    
    -- Rule settings
    severity VARCHAR(20) DEFAULT 'warning', -- error, warning, info
    active BOOLEAN DEFAULT true,
    
    -- Author customization
    author_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration Strategy

### Step 1: Core Server + Chapter Management
1. Build basic `index.js` with constructor
2. Implement `ChapterHandlers` class
3. Test chapter CRUD operations
4. Verify integration with existing Character presence tracking

### Step 2: Writing Session Tracking
1. Implement `SessionHandlers` class
2. Add productivity tracking tools
3. Test session logging and analytics
4. Verify goal setting functionality

### Step 3: Manuscript Export
1. Implement `ManuscriptHandlers` class
2. Add basic text export functionality
3. Test manuscript compilation
4. Add multiple format support

### Step 4: Flexible Validation
1. Implement `ValidationHandlers` class
2. Focus on consistency checking (not rigid structure)
3. Add customizable validation rules
4. Test author-defined quality checks

## Claude Desktop Configuration

Single entry in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "writing-server": {
      "command": "node",
      "args": ["src/mcps/writing-server/index.js"],
      "env": {
        "MCP_STDIO_MODE": "true"
      }
    }
  }
}
```

## Testing Strategy

### Component Testing Scenarios

**Chapter Management:**
- "Create Chapter 1 with POV character and location"
- "Bulk create 10 planned chapters for Book 2"
- "Update chapter status from draft to revised"

**Writing Sessions:**
- "Log a 2-hour writing session with 800 words written"
- "Set a goal to write 50,000 words in 30 days"
- "Show my writing productivity for the last month"

**Manuscript Export:**
- "Export the complete manuscript for Book 1 in RTF format"
- "Generate a chapter summary report"
- "Create a submission package with metadata"

**Validation:**
- "Check for character continuity issues in Book 1"
- "Validate chapter word count targets"
- "Create a custom validation rule for POV consistency"

## Cross-Server Integration

### With Character Server
- Chapter creation triggers character presence opportunities
- Character continuity validation across chapters
- POV character consistency checking

### With Plot Server
- Chapter events can be linked to plot threads
- Plot progression validation across chapters
- Story structure analysis integration

## Implementation Priorities

1. **Chapter Management** (foundation for everything else)
2. **Writing Sessions** (immediate productivity value)
3. **Basic Manuscript Export** (text format first)
4. **Flexible Validation** (quality without rigidity)
5. **Advanced Export Features** (multiple formats)

## Anti-Patterns to Avoid

### Rigid Structure Enforcement
❌ **Don't implement:**
- Required chapter word counts
- Forced scene structures
- Predetermined chapter sequences
- Genre-specific chapter templates

✅ **Do implement:**
- Flexible chapter organization
- Author-defined targets
- Customizable validation rules
- Organic structure support

### Productivity Pressure
❌ **Don't create:**
- Judgmental productivity tracking
- Unrealistic goal suggestions
- Guilt-inducing analytics
- Competitive metrics

✅ **Do create:**
- Supportive progress tracking
- Flexible goal adjustment
- Positive reinforcement
- Personal improvement focus

## Success Metrics

### For Author-Students (Tutorial Learners)
- Can build and configure their own Writing MCP system
- Understand modular architecture principles
- Can customize tools for their specific writing needs
- Can test and validate each component incrementally

### For AI Writing Teams (Primary Users)
- Access to comprehensive chapter structure and content data
- Can track character presence and continuity automatically
- Can validate story consistency without author intervention
- Can analyze manuscript structure and suggest improvements
- Can compile and export manuscripts in various formats
- Can identify potential issues before the author sees them

### For Authors (Beneficiaries)
- Freed from manual tracking and continuity checking
- Can focus entirely on creative writing
- AI team handles all administrative and validation tasks
- Automatic manuscript preparation and formatting

## Cross-Chat Reference

When working across multiple chat sessions, reference:
- This guide for architecture decisions
- Component list for implementation status
- Testing scenarios for validation
- Anti-pattern list for quality maintenance
- Integration points for cross-server coordination

Each component can be developed independently while maintaining integration points with existing Character and Plot servers.