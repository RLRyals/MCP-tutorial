// src/mcps/trope-server/schemas/trope-tools-schema.js
// Centralized tool schema definitions for the Trope MCP Server

// =============================================
// TROPE SYSTEM TOOL SCHEMAS
// =============================================
export const tropeToolsSchema = [
    {
        name: 'create_trope',
        description: 'Create trope w/ scene types',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                trope_name: { type: 'string', description: 'Trope name' },
                trope_category: {
                    type: 'string',
                    enum: ['romance_trope', 'character_trope', 'plot_trope'],
                    description: 'Trope category'
                },
                description: { type: 'string', description: 'Trope description' },
                common_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Common elements'
                },
                typical_trajectory: { type: 'string', description: 'Typical story trajectory' },
                scene_types: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            scene_function: { type: 'string', description: 'Scene function (opening, revelation, obstacle, climax)' },
                            scene_description: { type: 'string', description: 'What happens in scene' },
                            typical_placement: {
                                type: 'string',
                                enum: ['early', 'middle', 'climax', 'resolution'],
                                description: 'When scene occurs'
                            },
                            required: { type: 'boolean', description: 'Required for trope' },
                            narrative_purpose: { type: 'string', description: 'Purpose in narrative' },
                            emotional_beats: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Emotional beats'
                            }
                        },
                        required: ['scene_function', 'scene_description']
                    },
                    description: 'Scene types in trope'
                }
            },
            required: ['series_id', 'trope_name', 'trope_category', 'description']
        }
    },
    {
        name: 'create_trope_instance',
        description: 'Create trope instance in book',
        inputSchema: {
            type: 'object',
            properties: {
                trope_id: { type: 'integer', description: 'Trope ID' },
                book_id: { type: 'integer', description: 'Book ID' },
                instance_notes: { type: 'string', description: 'Implementation notes' },
                subversion_notes: { type: 'string', description: 'How this varies/subverts trope' },
                completion_status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'complete', 'subverted'],
                    description: 'Implementation status'
                }
            },
            required: ['trope_id', 'book_id']
        }
    },
    {
        name: 'get_trope',
        description: 'Get trope details',
        inputSchema: {
            type: 'object',
            properties: {
                trope_id: { type: 'integer', description: 'Trope ID' },
                include_scene_types: { type: 'boolean', description: 'Include scene types', default: true }
            },
            required: ['trope_id']
        }
    },
    {
        name: 'list_tropes',
        description: 'List tropes',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series filter' },
                trope_category: { type: 'string', description: 'Category filter' }
            }
        }
    },
    {
        name: 'get_trope_instance',
        description: 'Get trope instance details',
        inputSchema: {
            type: 'object',
            properties: {
                instance_id: { type: 'integer', description: 'Instance ID' },
                include_scenes: { type: 'boolean', description: 'Include scenes', default: true }
            },
            required: ['instance_id']
        }
    },
    {
        name: 'list_trope_instances',
        description: 'List trope instances in book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'complete', 'subverted'],
                    description: 'Status filter'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'implement_trope_scene',
        description: 'Implement trope scene',
        inputSchema: {
            type: 'object',
            properties: {
                trope_instance_id: { type: 'integer', description: 'Instance ID' },
                scene_type_id: { type: 'integer', description: 'Scene type ID' },
                scene_id: { type: 'integer', description: 'Actual scene ID in chapter_scenes' },
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                scene_number: { type: 'integer', description: 'Scene # in chapter' },
                scene_summary: { type: 'string', description: 'What happens in scene' },
                effectiveness_rating: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Effectiveness (1-10)',
                    default: 7
                },
                variation_notes: { type: 'string', description: 'Variations from typical' },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre elements featured'
                },
                implementation_notes: { type: 'string', description: 'Implementation details' }
            },
            required: ['trope_instance_id', 'scene_type_id', 'scene_summary']
        }
    },
    {
        name: 'get_trope_scenes',
        description: 'Get trope scene implementations',
        inputSchema: {
            type: 'object',
            properties: {
                instance_id: { type: 'integer', description: 'Instance filter' },
                series_id: { type: 'integer', description: 'Series filter' },
                trope_category: { type: 'string', description: 'Category filter' },
                kinks_filter: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre elements filter'
                },
                written_only: {
                    type: 'boolean',
                    description: 'Only scenes w/ scene_id',
                    default: false
                },
                unwritten_only: {
                    type: 'boolean',
                    description: 'Only planned scenes w/o scene_id',
                    default: false
                }
            }
        }
    },
    {
        name: 'get_trope_progress',
        description: 'Get trope implementation progress',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                trope_id: { type: 'integer', description: 'Trope filter' }
            },
            required: ['book_id']
        }
    },
    {
        name: 'analyze_trope_patterns',
        description: 'Analyze trope usage patterns',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                trope_category: {
                    type: 'string',
                    enum: ['romance_trope', 'character_trope', 'plot_trope'],
                    description: 'Category filter'
                },
                analysis_type: {
                    type: 'string',
                    enum: ['frequency', 'subversion', 'effectiveness'],
                    description: 'Analysis type'
                }
            },
            required: ['series_id']
        }
    }
];
