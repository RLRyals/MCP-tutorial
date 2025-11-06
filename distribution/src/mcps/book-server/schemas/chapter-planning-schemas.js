// src/mcps/book-server/schemas/chapter-planning-schemas.js
// Schemas for CHAPTER PLANNING PHASE - lightweight subset for chapter outlining
// Used by: config-mcps/chapter-planning-server

// =============================================
// CHAPTER PLANNING PHASE SCHEMAS
// =============================================

export const chapterPlanningSchemas = {
    create_chapter: {
        name: 'create_chapter',
        description: 'Create chapter',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                chapter_number: {
                    type: 'integer',
                    description: 'Chapter # in book'
                },
                title: {
                    type: 'string',
                    description: 'Title'
                },
                subtitle: {
                    type: 'string',
                    description: 'Subtitle'
                },
                summary: {
                    type: 'string',
                    description: 'Summary'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count'
                },
                status: {
                    type: 'string',
                    default: 'planned',
                    description: 'Writing status (use get_available_options w/ option_type="writing_statuses")'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character ID'
                },
                primary_location: {
                    type: 'string',
                    description: 'Main setting'
                },
                story_time_start: {
                    type: 'string',
                    description: 'Start time (e.g., "Day 1, 3pm")'
                },
                story_time_end: {
                    type: 'string',
                    description: 'End time'
                },
                story_duration: {
                    type: 'string',
                    description: 'Duration (e.g., "2 hours")'
                },
                author_notes: {
                    type: 'string',
                    description: 'Planning notes'
                }
            },
            required: ['book_id', 'chapter_number']
        }
    },

    update_chapter: {
        name: 'update_chapter',
        description: 'Update chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                title: {
                    type: 'string',
                    description: 'Title'
                },
                subtitle: {
                    type: 'string',
                    description: 'Subtitle'
                },
                summary: {
                    type: 'string',
                    description: 'Summary'
                },
                word_count: {
                    type: 'integer',
                    description: 'Current word count'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count'
                },
                status: {
                    type: 'string',
                    description: 'Writing status (use get_available_options w/ option_type="writing_statuses")'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character ID'
                },
                primary_location: {
                    type: 'string',
                    description: 'Main setting'
                },
                story_time_start: {
                    type: 'string',
                    description: 'Start time'
                },
                story_time_end: {
                    type: 'string',
                    description: 'End time'
                },
                story_duration: {
                    type: 'string',
                    description: 'Duration'
                },
                author_notes: {
                    type: 'string',
                    description: 'Author notes'
                },
                writing_notes: {
                    type: 'string',
                    description: 'Writing notes'
                }
            },
            required: ['chapter_id']
        }
    },

    get_chapter: {
        name: 'get_chapter',
        description: 'Get chapter details',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                include_scenes: {
                    type: 'boolean',
                    default: false,
                    description: 'Include scenes'
                },
                include_characters: {
                    type: 'boolean',
                    default: false,
                    description: 'Include character presence'
                }
            },
            required: ['chapter_id']
        }
    },

    list_chapters: {
        name: 'list_chapters',
        description: 'List chapters',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                status: {
                    type: 'string',
                    description: 'Status filter (use get_available_options w/ option_type="writing_statuses")'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include stats'
                }
            },
            required: ['book_id']
        }
    },

    delete_chapter: {
        name: 'delete_chapter',
        description: 'Delete chapter & scenes',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Confirm (must be true)'
                }
            },
            required: ['chapter_id', 'confirm_deletion']
        }
    }
};

// Export as array for easy spreading
export const chapterPlanningSchemaArray = Object.values(chapterPlanningSchemas);
