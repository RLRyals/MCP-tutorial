// src/mcps/metadata-server/schemas/lookup-tools-schema.js
// Tool schemas for cross-server lookup table management

export const lookupSystemToolsSchema = [
    {
        name: 'get_available_options',
        description: 'Get lookup table options',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments', 'scene_purposes', 'scene_types', 'writing_statuses'],
                    description: 'Option type'
                },
                genre_filter: {
                    type: 'string',
                    description: 'Genre name filter'
                },
                active_only: {
                    type: 'boolean',
                    default: true,
                    description: 'Active options only'
                }
            },
            required: ['option_type']
        }
    },
    {
        name: 'create_lookup_option',
        description: 'Create lookup option - Admin',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments', 'scene_purposes', 'scene_types', 'writing_statuses'],
                    description: 'Option type'
                },
                name: {
                    type: 'string',
                    description: 'Option name (unique)'
                },
                description: {
                    type: 'string',
                    description: 'Option description'
                },
                is_active: {
                    type: 'boolean',
                    default: true,
                    description: 'Active immediately'
                }
            },
            required: ['option_type', 'name', 'description']
        }
    },
    {
        name: 'update_lookup_option',
        description: 'Update lookup option - Admin',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments', 'scene_purposes', 'scene_types', 'writing_statuses'],
                    description: 'Option type'
                },
                option_id: {
                    type: 'integer',
                    description: 'Option ID'
                },
                name: {
                    type: 'string',
                    description: 'Updated name'
                },
                description: {
                    type: 'string',
                    description: 'Updated description'
                },
                is_active: {
                    type: 'boolean',
                    description: 'Active status'
                }
            },
            required: ['option_type', 'option_id']
        }
    },
    {
        name: 'delete_lookup_option',
        description: 'Delete lookup option - Admin',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments', 'scene_purposes', 'scene_types', 'writing_statuses'],
                    description: 'Option type'
                },
                option_id: {
                    type: 'integer',
                    description: 'Option ID'
                },
                permanent: {
                    type: 'boolean',
                    default: false,
                    description: 'True=permanent delete (caution), false=soft delete'
                }
            },
            required: ['option_type', 'option_id']
        }
    },
    {
        name: 'assign_book_genres',
        description: 'Assign genres to book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                genre_ids: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Genre IDs (replaces existing)'
                }
            },
            required: ['book_id', 'genre_ids']
        }
    },
    {
        name: 'assign_series_genres',
        description: 'Assign genres to series',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                genre_ids: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Genre IDs (replaces existing)'
                }
            },
            required: ['series_id', 'genre_ids']
        }
    }
];
