// src/mcps/trope-server/schemas/trope-tools-schema.js
// Centralized tool schema definitions for the Trope MCP Server

// =============================================
// TROPE SYSTEM TOOL SCHEMAS
// =============================================
export const tropeToolsSchema = [
    {
        name: 'create_trope',
        description: 'Create a new trope definition with its scene types',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                trope_name: { type: 'string', description: 'Name of the trope' },
                trope_category: {
                    type: 'string',
                    enum: ['romance_trope', 'character_trope', 'plot_trope'],
                    description: 'Category of trope'
                },
                description: { type: 'string', description: 'Description of the trope' },
                common_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Common elements that appear in this trope'
                },
                typical_trajectory: { type: 'string', description: 'Typical story trajectory for this trope' },
                scene_types: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            scene_function: { type: 'string', description: 'Function of this scene (opening, revelation, obstacle, climax)' },
                            scene_description: { type: 'string', description: 'Description of what happens in this scene' },
                            typical_placement: {
                                type: 'string',
                                enum: ['early', 'middle', 'climax', 'resolution'],
                                description: 'When this scene typically occurs'
                            },
                            required: { type: 'boolean', description: 'Whether this scene is required for the trope' },
                            narrative_purpose: { type: 'string', description: 'Purpose of this scene in the narrative' },
                            emotional_beats: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Emotional beats this scene should hit'
                            }
                        },
                        required: ['scene_function', 'scene_description']
                    },
                    description: 'Scene types that make up this trope'
                }
            },
            required: ['series_id', 'trope_name', 'trope_category', 'description']
        }
    },
    {
        name: 'create_trope_instance',
        description: 'Create an instance of a trope in a specific book',
        inputSchema: {
            type: 'object',
            properties: {
                trope_id: { type: 'integer', description: 'Trope ID' },
                book_id: { type: 'integer', description: 'Book ID where trope is implemented' },
                instance_notes: { type: 'string', description: 'Notes about this specific implementation' },
                subversion_notes: { type: 'string', description: 'How this instance subverts or varies the trope' },
                completion_status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'complete', 'subverted'],
                    description: 'Current status of trope implementation'
                }
            },
            required: ['trope_id', 'book_id']
        }
    },
    {
        name: 'get_trope',
        description: 'Get detailed information about a specific trope',
        inputSchema: {
            type: 'object',
            properties: {
                trope_id: { type: 'integer', description: 'ID of the trope to retrieve' },
                include_scene_types: { type: 'boolean', description: 'Whether to include scene type details', default: true }
            },
            required: ['trope_id']
        }
    },
    {
        name: 'list_tropes',
        description: 'List all tropes, optionally filtered by series or category',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Filter by series ID (optional)' },
                trope_category: { type: 'string', description: 'Filter by trope category (optional)' }
            }
        }
    },
    {
        name: 'get_trope_instance',
        description: 'Get details about a specific trope instance',
        inputSchema: {
            type: 'object',
            properties: {
                instance_id: { type: 'integer', description: 'ID of the trope instance' },
                include_scenes: { type: 'boolean', description: 'Whether to include implemented scenes', default: true }
            },
            required: ['instance_id']
        }
    },
    {
        name: 'list_trope_instances',
        description: 'List all trope instances in a book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID to list tropes for' },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'complete', 'subverted'],
                    description: 'Filter by completion status (optional)'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'implement_trope_scene',
        description: 'Implement a specific scene type for a trope instance',
        inputSchema: {
            type: 'object',
            properties: {
                trope_instance_id: { type: 'integer', description: 'Trope instance ID' },
                scene_type_id: { type: 'integer', description: 'Scene type ID from trope definition' },
                scene_id: { type: 'integer', description: 'Actual scene ID in chapter_scenes (optional)' },
                chapter_id: { type: 'integer', description: 'Chapter where scene occurs' },
                scene_number: { type: 'integer', description: 'Scene number within chapter' },
                scene_summary: { type: 'string', description: 'Summary of what happens in this scene' },
                effectiveness_rating: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'How effectively this scene implements the trope (1-10)',
                    default: 7
                },
                variation_notes: { type: 'string', description: 'How this scene varies from the typical implementation' },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre-specific elements featured (investigation techniques, magic types, intimate elements, etc.)'
                },
                implementation_notes: { type: 'string', description: 'Additional implementation details' }
            },
            required: ['trope_instance_id', 'scene_type_id', 'scene_summary']
        }
    },
    {
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
                },
                written_only: {
                    type: 'boolean',
                    description: 'If true, only return trope scenes linked to actual chapter_scenes (scene_id IS NOT NULL)',
                    default: false
                },
                unwritten_only: {
                    type: 'boolean',
                    description: 'If true, only return planned trope scenes not yet written (scene_id IS NULL)',
                    default: false
                }
            }
        }
    },
    {
        name: 'get_trope_progress',
        description: 'Get implementation progress for all tropes in a book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID to check' },
                trope_id: { type: 'integer', description: 'Filter by specific trope (optional)' }
            },
            required: ['book_id']
        }
    },
    {
        name: 'analyze_trope_patterns',
        description: 'Analyze trope usage patterns across a series',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                trope_category: {
                    type: 'string',
                    enum: ['romance_trope', 'character_trope', 'plot_trope'],
                    description: 'Filter by trope category (optional)'
                },
                analysis_type: {
                    type: 'string',
                    enum: ['frequency', 'subversion', 'effectiveness'],
                    description: 'Type of analysis to perform'
                }
            },
            required: ['series_id']
        }
    }
];
