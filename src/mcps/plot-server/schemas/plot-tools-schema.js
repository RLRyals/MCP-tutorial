// src/mcps/plot-server/schemas/plot-tools-schema.js
// FIXED VERSION - Centralized tool schema definitions for the Plot MCP Server

// =============================================
// PLOT THREAD TOOL SCHEMAS
// =============================================
export const plotThreadToolsSchema = [
    {
        name: 'create_plot_thread',
        description: 'Create a new plot thread (story arc, subplot, character arc)',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                title: { type: 'string', description: 'Plot thread title' },
                description: { type: 'string', description: 'Plot thread description' },
                thread_type: {
                    type: 'string',
                    description: 'Type of plot thread (use metadata-server\'s get_available_options with option_type="plot_thread_types" to see valid values)'
                },
                importance_level: { 
                    type: 'integer', 
                    minimum: 1, 
                    maximum: 10, 
                    default: 5,
                    description: 'Importance level (1-10)'
                },
                complexity_level: { 
                    type: 'integer', 
                    minimum: 1, 
                    maximum: 10, 
                    default: 5,
                    description: 'Complexity level (1-10)'
                },
                start_book: { type: 'integer', description: 'Starting book number' },
                end_book: { type: 'integer', description: 'Ending book number (optional for ongoing threads)' },
                related_characters: { 
                    type: 'array', 
                    items: { type: 'integer' },
                    description: 'Array of related character IDs'
                },
                parent_thread_id: { type: 'integer', description: 'Parent thread ID for sub-threads' }
            },
            required: ['series_id', 'title', 'description', 'thread_type']
        }
    },
    {
        name: 'update_plot_thread',
        description: 'Update plot thread information and status',
        inputSchema: {
            type: 'object',
            properties: {
                thread_id: { type: 'integer', description: 'Plot thread ID' },
                title: { type: 'string', description: 'Plot thread title' },
                description: { type: 'string', description: 'Plot thread description' },
                current_status: { 
                    type: 'string', 
                    enum: ['active', 'resolved', 'on_hold', 'abandoned'],
                    description: 'Thread status'
                },
                end_book: { type: 'integer', description: 'Ending book number' },
                resolution_notes: { type: 'string', description: 'Resolution details' },
                resolution_book: { type: 'integer', description: 'Book where resolved' }
            },
            required: ['thread_id']
        }
    },
    {
        name: 'get_plot_threads',
        description: 'Get plot threads for a series with filtering options',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                thread_type: { type: 'string', description: 'Filter by thread type' },
                current_status: { type: 'string', description: 'Filter by status' },
                book_number: { type: 'integer', description: 'Filter threads active in specific book' },
                importance_min: { type: 'integer', description: 'Minimum importance level' }
            },
            required: ['series_id']
        }
    },
    // {
    //     name: 'link_plot_threads',
    //     description: 'Create relationships between plot threads',
    //     inputSchema: {
    //         type: 'object',
    //         properties: {
    //             thread_a_id: { type: 'integer', description: 'First thread ID' },
    //             thread_b_id: { type: 'integer', description: 'Second thread ID' },
    //             relationship_type: { 
    //                 type: 'string', 
    //                 description: 'Type of relationship (use get_available_options with option_type="relationship_types" to see valid values)'
    //             },
    //             relationship_description: { type: 'string', description: 'Description of the relationship' },
    //             strength: { 
    //                 type: 'integer', 
    //                 minimum: 1, 
    //                 maximum: 10, 
    //                 default: 5,
    //                 description: 'Relationship strength (1-10)'
    //             },
    //             established_book: { type: 'integer', description: 'Book where relationship is established' }
    //         },
    //         required: ['thread_a_id', 'thread_b_id', 'relationship_type']
    //     }
    // },
    {
        name: 'resolve_plot_thread',
        description: 'Mark a plot thread as resolved with details',
        inputSchema: {
            type: 'object',
            properties: {
                thread_id: { type: 'integer', description: 'Plot thread ID' },
                resolution_book: { type: 'integer', description: 'Book where resolved' },
                resolution_notes: { type: 'string', description: 'How the thread was resolved' }
            },
            required: ['thread_id', 'resolution_book', 'resolution_notes']
        }
    }
];

// =============================================
// STORY ANALYSIS TOOL SCHEMAS
// =============================================
// NOTE: Story analysis tools have been moved to a separate optional server.
// See src/mcps/story-analysis-server/ for the story analysis functionality.

// =============================================
// UNIVERSAL GENRE TOOLS (replaces genre-specific ones)
// =============================================
export const genreExtensionToolsSchema = [
    {
        name: 'create_information_reveal',
        description: 'Track any information reveal across all genres (evidence, secrets, backstory, world rules)',
        inputSchema: {
            type: 'object',
            properties: {
                plot_thread_id: {
                    type: 'integer',
                    description: 'Associated plot thread ID'
                },
                reveal_type: {
                    type: 'string',
                    enum: ['evidence', 'secret', 'backstory', 'world_rule', 'relationship', 'skill'],
                    description: 'Type of information being revealed'
                },
                information_content: {
                    type: 'string',
                    description: 'What information is revealed'
                },
                reveal_method: {
                    type: 'string',
                    description: 'How the information is revealed (discovered, confessed, witnessed, deduced)'
                },
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
                revealed_in_chapter: {
                    type: 'integer',
                    description: 'Chapter where revealed (optional)'
                },
                consequences: {
                    type: 'string',
                    description: 'What happens as a result of this reveal (optional)'
                },
                foreshadowing_chapters: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Chapters where this was hinted at (optional)'
                }
            },
            required: ['plot_thread_id', 'reveal_type', 'information_content', 'reveal_method', 'significance_level']
        }
    },
    {
        name: 'create_relationship_arc',
        description: 'Track any relationship development across all genres and relationship types',
        inputSchema: {
            type: 'object',
            properties: {
                plot_thread_id: {
                    type: 'integer',
                    description: 'Associated plot thread ID'
                },
                arc_name: {
                    type: 'string',
                    description: 'Name for this relationship arc'
                },
                participants: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            character_id: { type: 'integer' },
                            role_in_relationship: {
                                type: 'string',
                                description: 'primary, secondary, catalyst, observer'
                            },
                            character_name: { type: 'string' }
                        },
                        required: ['character_id', 'role_in_relationship']
                    },
                    description: 'Characters involved (2 or more, flexible roles)'
                },
                relationship_type: {
                    type: 'string',
                    enum: ['romantic', 'family', 'friendship', 'professional', 'antagonistic', 'mentor', 'alliance'],
                    description: 'Type of relationship'
                },
                current_dynamic: {
                    type: 'string',
                    description: 'Current relationship dynamic/stage'
                },
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
            },
            required: ['plot_thread_id', 'arc_name', 'participants', 'relationship_type']
        }
    },
    {
        name: 'define_world_system',
        description: 'Define any systematic supernatural/advanced element with rules and limitations',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                system_name: {
                    type: 'string',
                    description: 'Name of the system'
                },
                system_type: {
                    type: 'string',
                    enum: ['magic', 'psionics', 'technology', 'divine', 'supernatural', 'mutation', 'alchemy'],
                    description: 'Type of system'
                },
                power_source: {
                    type: 'string',
                    description: 'What powers this system'
                },
                access_method: {
                    type: 'string',
                    description: 'How beings access/use this system'
                },
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
                        lowest_level: { type: 'string' },
                        highest_level: { type: 'string' },
                        progression_method: { type: 'string' }
                    },
                    description: 'How power levels work'
                }
            },
            required: ['series_id', 'system_name', 'system_type', 'power_source', 'access_method']
        }
    },
    {
        name: 'add_reveal_evidence',
        description: 'Add specific evidence to an information reveal (universal evidence tracking)',
        inputSchema: {
            type: 'object',
            properties: {
                reveal_id: {
                    type: 'integer',
                    description: 'Information reveal ID'
                },
                evidence_type: {
                    type: 'string',
                    enum: ['physical', 'witness', 'circumstantial', 'digital', 'forensic'],
                    description: 'Type of evidence'
                },
                evidence_description: {
                    type: 'string',
                    description: 'Description of the evidence'
                },
                discovered_by: {
                    type: 'integer',
                    description: 'Character ID who discovered this (optional)'
                },
                discovery_chapter: {
                    type: 'integer',
                    description: 'Chapter where discovered (optional)'
                },
                significance: {
                    type: 'string',
                    enum: ['critical', 'important', 'supporting', 'red_herring'],
                    description: 'Significance of this evidence'
                }
            },
            required: ['reveal_id', 'evidence_type', 'evidence_description']
        }
    },
    {
        name: 'track_relationship_dynamics',
        description: 'Track how relationship dynamics change over time',
        inputSchema: {
            type: 'object',
            properties: {
                arc_id: {
                    type: 'integer',
                    description: 'Relationship arc ID'
                },
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter where change occurs (optional)'
                },
                dynamic_change: {
                    type: 'string',
                    description: 'Description of how dynamic changed'
                },
                tension_change: {
                    type: 'integer',
                    minimum: -10,
                    maximum: 10,
                    description: 'Change in tension level (-10 to +10)'
                },
                change_type: {
                    type: 'string',
                    enum: ['emotional', 'power', 'trust', 'commitment', 'conflict'],
                    description: 'Type of dynamic change'
                },
                trigger_event: {
                    type: 'string',
                    description: 'What triggered this change'
                }
            },
            required: ['arc_id', 'dynamic_change', 'change_type']
        }
    },
    {
        name: 'track_system_progression',
        description: 'Track character progression within a world system',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: {
                    type: 'integer',
                    description: 'Character ID'
                },
                system_id: {
                    type: 'integer',
                    description: 'World system ID'
                },
                book_id: {
                    type: 'integer',
                    description: 'Book where progression occurs'
                },
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter where progression occurs (optional)'
                },
                current_power_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Current power level'
                },
                progression_method: {
                    type: 'string',
                    description: 'How they gained this power'
                },
                cost_or_sacrifice: {
                    type: 'string',
                    description: 'What they sacrificed to gain this power (optional)'
                }
            },
            required: ['character_id', 'system_id', 'book_id', 'current_power_level']
        }
    }
];

// =============================================
// LOOKUP SYSTEM TOOL SCHEMAS
// =============================================
// NOTE: Lookup tools have been consolidated in metadata-server to avoid name conflicts.
// Use the metadata-server's 'get_available_options' tool to retrieve lookup values.
// This eliminates duplicate tool names across servers.
export const lookupSystemToolsSchema = [];
