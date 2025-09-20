# MCP Writing System Tutorial Repository Structure

## Main Branch
The main branch will contain the essential core functionality needed for any MCP writing system:

1. Base MCP Server Setup
   - Basic server structure
   - Database connection handling
   - Error handling
   - Configuration management

2. Core Database Schema
   - Base tables structure with series as foundation
   - Essential migrations
   - Docker setup for PostgreSQL

3. Minimal Documentation
   - Setup instructions
   - Basic usage guide
   - Database setup guide

## Tutorial Branches

### Step_1_MCP_series
Establishes the foundational series management:
- Series creation and metadata
- Book organization within series
- Writing team management
- Basic timeline framework
- Core taxonomy system
Database focus:
- series table (primary - top level container)
- books table (references series)
- writing_teams table (references series)
- series_metadata table
- series_taxonomy table

### Step_2_MCP_character
Builds on world foundation:
- Character profiles
- Character relationships
- Character arc tracking
- Character affiliations with locations
Database focus:
- characters table (primary)
- character_relationships table
- character_locations table (references locations)
- character_arcs table

### Step_3_MCP_plot
Integrates characters and world:
- Timeline tracking
- Story structure validation
- Plot threads management
- Scene planning
Database focus:
- plot_events table (references characters and locations)
- story_structure table
- plot_threads table
- scenes table (references characters and locations)

### Step_4_MCP_research
Adds knowledge tracking using established entities:
- Character knowledge states
- Fact database
- Reference management
- Continuity checking
Database focus:
- character_knowledge_states table (references characters)
- facts table (references all previous entities)
- references table
- continuity_checks table

### Step_5_MCP_writing
Implements writing management using established structure:
- Chapter structure (using validated story structure)
- Scene management (using established scenes)
- Word count tracking
- Writing goals
- Progress analytics
Database focus:
- chapters table (references story_structure)
- chapter_scenes table (references scenes)
- writing_progress table
- writing_goals table

### Step_6_MCP_persona_voice
Adds AI personas and voice integration:
- AI writing team configuration
- Persona system instructions
- ElevenLabs voice mappings
- Audio generation for persona responses
- Dialog reading capabilities
- Scene atmosphere audio

## Branch Dependencies
Each branch builds upon the previous ones, following database relationship requirements:
```
main
└── Step_1_MCP_series
    └── Step_2_MCP_world
        └── Step_3_MCP_character
            └── Step_4_MCP_plot
                └── Step_5_MCP_research
                    └── Step_6_MCP_writing
                        └── Step_7_MCP_persona_voice
```

## Recommended Implementation Order
1. Start with main branch setup
2. Series server (establishes top-level container and organization)
3. World server (builds world elements within series context)
4. Character server (creates characters that exist across series)
5. Plot server (manages plots spanning books in the series)
6. Research server (tracks knowledge across entire series)
7. Writing production server (manages writing across all books)
8. Persona Voice integration (adds AI writing team with voice capabilities)

Each MCP server will be built with series_id as a fundamental foreign key, ensuring all elements can be properly organized and tracked within their series context.

Each step will include:
- Complete documentation
- Migration scripts
- Tests
- Example usage
- Integration guide
