// src/mcps/book-server/schemas/chapter-planning-schemas.js
// Schemas for CHAPTER PLANNING PHASE - lightweight subset for chapter outlining
// Used by: config-mcps/chapter-planning-server

// =============================================
// CHAPTER PLANNING PHASE SCHEMAS
// =============================================

export const chapterPlanningSchemas = {
    create_chapter: {
        name: 'create_chapter',
        description: 'Create a new chapter within a book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'ID of the book this chapter belongs to'
                },
                chapter_number: {
                    type: 'integer',
                    description: 'Chapter number within the book'
                },
                title: {
                    type: 'string',
                    description: 'Chapter title'
                },
                subtitle: {
                    type: 'string',
                    description: 'Optional chapter subtitle'
                },
                summary: {
                    type: 'string',
                    description: 'Brief chapter summary'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count for this chapter'
                },
                status: {
                    type: 'string',
                    default: 'planned',
                    description: 'Chapter writing status (use get_available_options with option_type="writing_statuses")'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'ID of the POV character for this chapter'
                },
                primary_location: {
                    type: 'string',
                    description: 'Main setting for this chapter'
                },
                story_time_start: {
                    type: 'string',
                    description: 'When chapter events begin (e.g., "Day 1, 3pm")'
                },
                story_time_end: {
                    type: 'string',
                    description: 'When chapter events end'
                },
                story_duration: {
                    type: 'string',
                    description: 'How long chapter events take (e.g., "2 hours")'
                },
                author_notes: {
                    type: 'string',
                    description: 'Planning notes and reminders'
                }
            },
            required: ['book_id', 'chapter_number']
        }
    },

    update_chapter: {
        name: 'update_chapter',
        description: 'Update an existing chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter to update'
                },
                title: {
                    type: 'string',
                    description: 'Chapter title'
                },
                subtitle: {
                    type: 'string',
                    description: 'Chapter subtitle'
                },
                summary: {
                    type: 'string',
                    description: 'Chapter summary'
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
                    description: 'Chapter writing status (use get_available_options with option_type="writing_statuses")'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character ID'
                },
                primary_location: {
                    type: 'string',
                    description: 'Main setting for this chapter'
                },
                story_time_start: {
                    type: 'string',
                    description: 'Chapter start time'
                },
                story_time_end: {
                    type: 'string',
                    description: 'Chapter end time'
                },
                story_duration: {
                    type: 'string',
                    description: 'Chapter duration'
                },
                author_notes: {
                    type: 'string',
                    description: 'Author notes'
                },
                writing_notes: {
                    type: 'string',
                    description: 'Writing process notes'
                }
            },
            required: ['chapter_id']
        }
    },

    get_chapter: {
        name: 'get_chapter',
        description: 'Get detailed information about a specific chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter'
                },
                include_scenes: {
                    type: 'boolean',
                    default: false,
                    description: 'Include scene information'
                },
                include_characters: {
                    type: 'boolean',
                    default: false,
                    description: 'Include character presence information'
                }
            },
            required: ['chapter_id']
        }
    },

    list_chapters: {
        name: 'list_chapters',
        description: 'List all chapters in a book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'ID of the book'
                },
                status: {
                    type: 'string',
                    description: 'Filter by chapter status (optional, use get_available_options with option_type="writing_statuses")'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include word count and scene statistics'
                }
            },
            required: ['book_id']
        }
    },

    delete_chapter: {
        name: 'delete_chapter',
        description: 'Delete a chapter and all its scenes',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter to delete'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Must be true to confirm deletion'
                }
            },
            required: ['chapter_id', 'confirm_deletion']
        }
    }
};

// Export as array for easy spreading
export const chapterPlanningSchemaArray = Object.values(chapterPlanningSchemas);
