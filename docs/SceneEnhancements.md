MCP Tools Implementation: Scene Management
Tools to Add/Update for Scene System

BOOK SERVER - Add Scene Management Tools
New Tools to Add:
1. create_scene
javascript{
    name: 'create_scene',
    description: 'Create a scene within a chapter',
    inputSchema: {
        type: 'object',
        properties: {
            chapter_id: { type: 'integer', description: 'Chapter containing this scene' },
            scene_number: { type: 'integer', description: 'Scene order within chapter' },
            scene_title: { type: 'string', description: 'Scene title' },
            scene_purpose: { type: 'string', description: 'Why this scene exists' },
            scene_type: { type: 'string', description: 'Type of scene (dialogue, action, intimate, investigation, etc.)' },
            participants: { 
                type: 'array', 
                items: { type: 'integer' }, 
                description: 'Character IDs present in scene' 
            },
            location: { type: 'string', description: 'Where scene takes place' },
            duration: { type: 'string', description: 'How long scene lasts' },
            summary: { type: 'string', description: 'What happens in this scene' },
            intensity_level: { 
                type: 'integer', 
                minimum: 1, 
                maximum: 10, 
                description: 'Scene intensity for pacing (1=low, 10=maximum)' 
            },
            pov_character_id: { type: 'integer', description: 'POV character for scene' }
        },
        required: ['chapter_id', 'scene_number', 'summary', 'participants']
    }
}
2. get_chapter_scenes
javascript{
    name: 'get_chapter_scenes',
    description: 'Get all scenes in a chapter',
    inputSchema: {
        type: 'object',
        properties: {
            chapter_id: { type: 'integer', description: 'Chapter to get scenes from' },
            include_participants: { type: 'boolean', default: false, description: 'Include character details' }
        },
        required: ['chapter_id']
    }
}
3. update_scene
javascript{
    name: 'update_scene',
    description: 'Update scene details',
    inputSchema: {
        type: 'object',
        properties: {
            scene_id: { type: 'integer', description: 'Scene to update' },
            scene_title: { type: 'string' },
            scene_purpose: { type: 'string' },
            scene_type: { type: 'string' },
            participants: { type: 'array', items: { type: 'integer' } },
            location: { type: 'string' },
            duration: { type: 'string' },
            summary: { type: 'string' },
            intensity_level: { type: 'integer', minimum: 1, maximum: 10 },
            pov_character_id: { type: 'integer' },
            writing_status: { type: 'string' }
        },
        required: ['scene_id']
    }
}
4. get_scene
javascript{
    name: 'get_scene',
    description: 'Get detailed information about a specific scene',
    inputSchema: {
        type: 'object',
        properties: {
            scene_id: { type: 'integer', description: 'Scene ID' },
            include_characters: { type: 'boolean', default: false, description: 'Include character details' },
            include_tropes: { type: 'boolean', default: false, description: 'Include trope implementations' }
        },
        required: ['scene_id']
    }
}
5. analyze_scene_pacing
javascript{
    name: 'analyze_scene_pacing',
    description: 'Analyze intensity pacing across scenes in book or chapter',
    inputSchema: {
        type: 'object',
        properties: {
            book_id: { type: 'integer', description: 'Analyze entire book' },
            chapter_id: { type: 'integer', description: 'Analyze specific chapter' },
            analysis_type: { 
                type: 'string', 
                enum: ['intensity_distribution', 'character_presence', 'scene_types'],
                default: 'intensity_distribution',
                description: 'Type of analysis to perform'
            }
        }
    }
}

PLOT SERVER - Update Trope Scene Tools
Tools to Update:
Update implement_trope_scene (add kinks tracking)
javascript{
    name: 'implement_trope_scene',
    description: 'Implement a specific scene type for a trope instance with genre elements',
    inputSchema: {
        type: 'object',
        properties: {
            instance_id: { type: 'integer', description: 'Trope instance ID' },
            scene_type_id: { type: 'integer', description: 'Scene type ID from trope definition' },
            scene_id: { type: 'integer', description: 'Actual scene ID (optional)' },
            chapter_id: { type: 'integer', description: 'Chapter where scene occurs' },
            scene_number: { type: 'integer', description: 'Scene number within chapter' },
            scene_summary: { type: 'string', description: 'Summary of what happens in this scene' },
            effectiveness_rating: { 
                type: 'integer', 
                minimum: 1, 
                maximum: 10, 
                description: 'How effectively this scene implements the trope (1-10)' 
            },
            variation_notes: { type: 'string', description: 'How this scene varies from typical implementation' },
            kinks_featured: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Genre-specific elements featured (kinks, investigation techniques, magic types, etc.)'
            },
            implementation_notes: { type: 'string', description: 'Additional implementation details' }
        },
        required: ['instance_id', 'scene_type_id', 'scene_summary']
    }
}
New Tool to Add:
get_trope_scenes
javascript{
    name: 'get_trope_scenes',
    description: 'Get all trope scene implementations for an instance or series',
    inputSchema: {
        type: 'object',
        properties: {
            instance_id: { type: 'integer', description: 'Get scenes for specific trope instance' },
            series_id: { type: 'integer', description: 'Get all trope scenes in series' },
            trope_category: { type: 'string', description: 'Filter by trope category (romance_trope, etc.)' },
            kinks_filter: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Filter by specific genre elements/kinks featured'
            }
        }
    }
}

CHARACTER SERVER - Update for Scene Integration
Tools to Update:
Update track_character_presence (connect to scenes)
javascript// Add scene_id parameter to existing track_character_presence
{
    name: 'track_character_presence',
    // ... existing parameters ...
    scene_id: { type: 'integer', description: 'Specific scene within chapter (optional)' }
}
Update get_characters_in_chapter (scene filtering)
javascript{
    name: 'get_characters_in_chapter',
    // ... existing parameters ...
    scene_number: { type: 'integer', description: 'Filter to specific scene within chapter (optional)' }
}

IMPLEMENTATION PRIORITY
Phase 1: Core Scene Tools (Book Server)

create_scene - Essential for scene creation
get_chapter_scenes - Essential for viewing scenes
update_scene - Essential for scene editing

Phase 2: Scene Analysis (Book Server)

get_scene - Detailed scene information
analyze_scene_pacing - Pacing validation

Phase 3: Trope Integration (Plot Server)

Update implement_trope_scene with kinks tracking
Add get_trope_scenes for trope scene queries

Phase 4: Character Integration (Character Server)

Update existing character tools for scene-level tracking