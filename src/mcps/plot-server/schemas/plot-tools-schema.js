// src/mcps/plot-server/schemas/plot-tools-schema.js
// FIXED VERSION - Centralized tool schema definitions for the Plot MCP Server

// =============================================
// PLOT THREAD TOOL SCHEMAS
// =============================================
export const plotThreadToolsSchema = [
    {
        name: 'create_plot_thread',
        description: 'Create plot thread',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                title: { type: 'string', description: 'Title' },
                description: { type: 'string', description: 'Description' },
                thread_type: {
                    type: 'string',
                    description: 'Type (use get_available_options w/ option_type="plot_thread_types")'
                },
                importance_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    default: 5,
                    description: 'Importance (1-10)'
                },
                complexity_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    default: 5,
                    description: 'Complexity (1-10)'
                },
                start_book: { type: 'integer', description: 'Start book #' },
                end_book: { type: 'integer', description: 'End book #' },
                related_characters: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Related character IDs'
                },
                parent_thread_id: { type: 'integer', description: 'Parent thread ID' }
            },
            required: ['series_id', 'title', 'description', 'thread_type']
        }
    },
    {
        name: 'update_plot_thread',
        description: 'Update plot thread',
        inputSchema: {
            type: 'object',
            properties: {
                thread_id: { type: 'integer', description: 'Thread ID' },
                title: { type: 'string', description: 'Title' },
                description: { type: 'string', description: 'Description' },
                current_status: {
                    type: 'string',
                    enum: ['active', 'resolved', 'on_hold', 'abandoned'],
                    description: 'Status'
                },
                end_book: { type: 'integer', description: 'End book #' },
                resolution_notes: { type: 'string', description: 'Resolution details' },
                resolution_book: { type: 'integer', description: 'Resolution book #' }
            },
            required: ['thread_id']
        }
    },
    {
        name: 'get_plot_threads',
        description: 'Get plot threads',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                thread_type: { type: 'string', description: 'Type filter' },
                current_status: { type: 'string', description: 'Status filter' },
                book_number: { type: 'integer', description: 'Book # filter' },
                importance_min: { type: 'integer', description: 'Min importance' }
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
        description: 'Resolve plot thread',
        inputSchema: {
            type: 'object',
            properties: {
                thread_id: { type: 'integer', description: 'Thread ID' },
                resolution_book: { type: 'integer', description: 'Resolution book #' },
                resolution_notes: { type: 'string', description: 'Resolution details' }
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
        description: 'Track info reveal',
        inputSchema: {
            type: 'object',
            properties: {
                plot_thread_id: {
                    type: 'integer',
                    description: 'Plot thread ID'
                },
                reveal_type: {
                    type: 'string',
                    enum: ['evidence', 'secret', 'backstory', 'world_rule', 'relationship', 'skill'],
                    description: 'Reveal type'
                },
                information_content: {
                    type: 'string',
                    description: 'Info content'
                },
                reveal_method: {
                    type: 'string',
                    description: 'Reveal method (discovered/confessed/witnessed/deduced)'
                },
                significance_level: {
                    type: 'string',
                    enum: ['minor', 'major', 'climactic', 'world_changing'],
                    description: 'Impact level'
                },
                affects_characters: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Character IDs who learn this'
                },
                revealed_in_chapter: {
                    type: 'integer',
                    description: 'Reveal chapter ID'
                },
                consequences: {
                    type: 'string',
                    description: 'Consequences'
                },
                foreshadowing_chapters: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Foreshadowing chapter IDs'
                }
            },
            required: ['plot_thread_id', 'reveal_type', 'information_content', 'reveal_method', 'significance_level']
        }
    },
    {
        name: 'define_world_system',
        description: 'Define world system w/ rules',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                system_name: {
                    type: 'string',
                    description: 'System name'
                },
                system_type: {
                    type: 'string',
                    enum: ['magic', 'psionics', 'technology', 'divine', 'supernatural', 'mutation', 'alchemy'],
                    description: 'System type'
                },
                power_source: {
                    type: 'string',
                    description: 'Power source'
                },
                access_method: {
                    type: 'string',
                    description: 'Access method'
                },
                limitations: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Constraints & limitations'
                },
                system_rules: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Rules & principles'
                },
                power_scaling: {
                    type: 'object',
                    properties: {
                        lowest_level: { type: 'string' },
                        highest_level: { type: 'string' },
                        progression_method: { type: 'string' }
                    },
                    description: 'Power levels'
                }
            },
            required: ['series_id', 'system_name', 'system_type', 'power_source', 'access_method']
        }
    },
    {
        name: 'add_reveal_evidence',
        description: 'Add evidence to reveal',
        inputSchema: {
            type: 'object',
            properties: {
                reveal_id: {
                    type: 'integer',
                    description: 'Reveal ID'
                },
                evidence_type: {
                    type: 'string',
                    enum: ['physical', 'witness', 'circumstantial', 'digital', 'forensic'],
                    description: 'Evidence type'
                },
                evidence_description: {
                    type: 'string',
                    description: 'Description'
                },
                discovered_by: {
                    type: 'integer',
                    description: 'Discoverer character ID'
                },
                discovery_chapter: {
                    type: 'integer',
                    description: 'Discovery chapter ID'
                },
                significance: {
                    type: 'string',
                    enum: ['critical', 'important', 'supporting', 'red_herring'],
                    description: 'Significance'
                }
            },
            required: ['reveal_id', 'evidence_type', 'evidence_description']
        }
    },
    {
        name: 'track_system_progression',
        description: 'Track character system progression',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: {
                    type: 'integer',
                    description: 'Character ID'
                },
                system_id: {
                    type: 'integer',
                    description: 'System ID'
                },
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                current_power_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Power level'
                },
                progression_method: {
                    type: 'string',
                    description: 'Progression method'
                },
                cost_or_sacrifice: {
                    type: 'string',
                    description: 'Cost/sacrifice'
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
