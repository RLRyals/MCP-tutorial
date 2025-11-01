// src/mcps/timeline-server/schemas/timeline-chapter-mapping-schema.js
// Schema definitions for Timeline Event-Chapter Mapping tools

export const eventChapterMappingSchemas = [
    {
        name: 'map_event_to_chapter',
        description: 'Connect a timeline event to its presentation in a chapter',
        inputSchema: {
            type: 'object',
            required: ['event_id', 'chapter_id'],
            properties: {
                event_id: { type: 'integer', description: 'Timeline event ID' },
                chapter_id: { type: 'integer', description: 'Chapter where event appears' },
                scene_number: { type: 'integer', description: 'Specific scene within chapter (optional)' },
                presentation_type: {
                    type: 'string',
                    enum: ['direct_scene', 'flashback', 'memory', 'reference', 'foreshadowing', 'dream', 'retelling'],
                    description: 'How the event is presented in the narrative'
                },
                pov_character_id: { type: 'integer', description: 'Character whose POV shows this event' },
                event_aspect: { type: 'string', description: 'Which part or perspective of the event is shown' },
                completeness: {
                    type: 'string',
                    enum: ['full', 'partial', 'glimpse'],
                    description: 'How completely the event is shown',
                    default: 'full'
                },
                narrative_function: { type: 'string', description: 'Purpose of showing this event here' }
            }
        }
    },
    {
        name: 'get_event_mappings',
        description: 'Get chapters where a timeline event appears',
        inputSchema: {
            type: 'object',
            required: ['event_id'],
            properties: {
                event_id: { type: 'integer', description: 'Timeline event ID' }
            }
        }
    },
    {
        name: 'get_chapter_events',
        description: 'Get timeline events that appear in a chapter',
        inputSchema: {
            type: 'object',
            required: ['chapter_id'],
            properties: {
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                presentation_type: {
                    type: 'string',
                    description: 'Filter by presentation type (optional)'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'Filter by POV character (optional)'
                }
            }
        }
    },
    {
        name: 'update_event_mapping',
        description: 'Update an existing event-chapter mapping',
        inputSchema: {
            type: 'object',
            required: ['mapping_id'],
            properties: {
                mapping_id: { type: 'integer', description: 'ID of the mapping to update' },
                scene_number: { type: 'integer', description: 'Specific scene within chapter' },
                presentation_type: {
                    type: 'string',
                    enum: ['direct_scene', 'flashback', 'memory', 'reference', 'foreshadowing', 'dream', 'retelling'],
                    description: 'How the event is presented'
                },
                pov_character_id: { type: 'integer', description: 'Character POV for this presentation' },
                event_aspect: { type: 'string', description: 'Which part of the event is shown' },
                completeness: {
                    type: 'string',
                    enum: ['full', 'partial', 'glimpse'],
                    description: 'How completely the event is shown'
                },
                narrative_function: { type: 'string', description: 'Purpose of showing this event here' }
            }
        }
    },
    {
        name: 'delete_event_mapping',
        description: 'Remove a mapping between an event and a chapter',
        inputSchema: {
            type: 'object',
            required: ['mapping_id'],
            properties: {
                mapping_id: { type: 'integer', description: 'ID of the mapping to delete' }
            }
        }
    },
    {
        name: 'analyze_narrative_structure',
        description: 'Analyze the relationship between chronological events and narrative presentation',
        inputSchema: {
            type: 'object',
            required: ['book_id'],
            properties: {
                book_id: { type: 'integer', description: 'Book to analyze' },
                analysis_type: {
                    type: 'string',
                    enum: ['linearity', 'pov_distribution', 'event_coverage', 'all'],
                    description: 'Type of analysis to perform',
                    default: 'all'
                }
            }
        }
    }
];
