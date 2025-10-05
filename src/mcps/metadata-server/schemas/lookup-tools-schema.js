// src/mcps/metadata-server/schemas/lookup-tools-schema.js
// Tool schemas for cross-server lookup table management

export const lookupSystemToolsSchema = [
    {
        name: 'get_available_options',
        description: 'Get available options from lookup tables (genres, plot thread types, story elements, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments'],
                    description: 'Type of options to retrieve'
                },
                genre_filter: {
                    type: 'string',
                    description: 'Filter by specific genre name (optional)'
                },
                active_only: {
                    type: 'boolean',
                    default: true,
                    description: 'Only return active/available options'
                }
            },
            required: ['option_type']
        }
    },
    {
        name: 'create_lookup_option',
        description: 'Create a new lookup option (genre, plot thread type, status, etc.) - Admin function',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments'],
                    description: 'Type of option to create'
                },
                name: {
                    type: 'string',
                    description: 'Name of the new option (must be unique)'
                },
                description: {
                    type: 'string',
                    description: 'Description of the option'
                },
                is_active: {
                    type: 'boolean',
                    default: true,
                    description: 'Whether the option is immediately active'
                }
            },
            required: ['option_type', 'name', 'description']
        }
    },
    {
        name: 'update_lookup_option',
        description: 'Update an existing lookup option - Admin function',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments'],
                    description: 'Type of option to update'
                },
                option_id: {
                    type: 'integer',
                    description: 'ID of the option to update'
                },
                name: {
                    type: 'string',
                    description: 'Updated name (optional)'
                },
                description: {
                    type: 'string',
                    description: 'Updated description (optional)'
                },
                is_active: {
                    type: 'boolean',
                    description: 'Update active status (optional)'
                }
            },
            required: ['option_type', 'option_id']
        }
    },
    {
        name: 'delete_lookup_option',
        description: 'Soft delete a lookup option (sets is_active to false) - Admin function',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'plot_thread_types', 'plot_thread_statuses', 'relationship_types', 'story_concerns', 'story_outcomes', 'story_judgments'],
                    description: 'Type of option to delete'
                },
                option_id: {
                    type: 'integer',
                    description: 'ID of the option to delete'
                },
                permanent: {
                    type: 'boolean',
                    default: false,
                    description: 'If true, permanently delete (use with caution). If false, soft delete by setting is_active=false'
                }
            },
            required: ['option_type', 'option_id']
        }
    },
    {
        name: 'assign_book_genres',
        description: 'Assign genres to a book using the normalized genre system',
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
                    description: 'Array of genre IDs to assign (replaces existing genres)'
                }
            },
            required: ['book_id', 'genre_ids']
        }
    },
    {
        name: 'assign_series_genres',
        description: 'Assign genres to a series using the normalized genre system',
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
                    description: 'Array of genre IDs to assign (replaces existing genres)'
                }
            },
            required: ['series_id', 'genre_ids']
        }
    }
];
