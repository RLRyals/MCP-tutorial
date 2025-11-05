// src/mcps/timeline-server/schemas/timeline-chapter-mapping-schema.js
// Schema definitions for Timeline Event-Chapter Mapping tools

export const eventChapterMappingSchemas = [
    {
        name: 'map_event_to_chapter',
        description: 'Connect timeline event to chapter presentation',
        inputSchema: {
            type: 'object',
            required: ['event_id', 'chapter_id'],
            properties: {
                event_id: { type: 'integer', description: 'Event ID' },
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                scene_number: { type: 'integer', description: 'Scene # in chapter' },
                presentation_type: {
                    type: 'string',
                    enum: ['direct_scene', 'flashback', 'memory', 'reference', 'foreshadowing', 'dream', 'retelling'],
                    description: 'How event is presented'
                },
                pov_character_id: { type: 'integer', description: 'POV character ID' },
                event_aspect: { type: 'string', description: 'Part/perspective shown' },
                completeness: {
                    type: 'string',
                    enum: ['full', 'partial', 'glimpse'],
                    description: 'Completeness level',
                    default: 'full'
                },
                narrative_function: { type: 'string', description: 'Purpose in narrative' }
            }
        }
    },
    {
        name: 'get_event_mappings',
        description: 'Get chapters where event appears',
        inputSchema: {
            type: 'object',
            required: ['event_id'],
            properties: {
                event_id: { type: 'integer', description: 'Event ID' }
            }
        }
    },
    {
        name: 'get_chapter_events',
        description: 'Get events in chapter',
        inputSchema: {
            type: 'object',
            required: ['chapter_id'],
            properties: {
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                presentation_type: {
                    type: 'string',
                    description: 'Presentation type filter'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character filter'
                }
            }
        }
    },
    {
        name: 'update_event_mapping',
        description: 'Update event-chapter mapping',
        inputSchema: {
            type: 'object',
            required: ['mapping_id'],
            properties: {
                mapping_id: { type: 'integer', description: 'Mapping ID' },
                scene_number: { type: 'integer', description: 'Scene # in chapter' },
                presentation_type: {
                    type: 'string',
                    enum: ['direct_scene', 'flashback', 'memory', 'reference', 'foreshadowing', 'dream', 'retelling'],
                    description: 'How event is presented'
                },
                pov_character_id: { type: 'integer', description: 'POV character ID' },
                event_aspect: { type: 'string', description: 'Part shown' },
                completeness: {
                    type: 'string',
                    enum: ['full', 'partial', 'glimpse'],
                    description: 'Completeness level'
                },
                narrative_function: { type: 'string', description: 'Purpose in narrative' }
            }
        }
    },
    {
        name: 'delete_event_mapping',
        description: 'Delete event-chapter mapping',
        inputSchema: {
            type: 'object',
            required: ['mapping_id'],
            properties: {
                mapping_id: { type: 'integer', description: 'Mapping ID' }
            }
        }
    },
    {
        name: 'analyze_narrative_structure',
        description: 'Analyze chronological events vs narrative presentation',
        inputSchema: {
            type: 'object',
            required: ['book_id'],
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                analysis_type: {
                    type: 'string',
                    enum: ['linearity', 'pov_distribution', 'event_coverage', 'all'],
                    description: 'Analysis type',
                    default: 'all'
                }
            }
        }
    }
];
