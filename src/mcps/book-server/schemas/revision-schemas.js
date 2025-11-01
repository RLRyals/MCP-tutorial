// src/mcps/book-server/schemas/revision-schemas.js
// Schemas for REVISION PHASE - tools for editing and polishing
// Used by: config-mcps/revision-server

// =============================================
// REVISION PHASE SCHEMAS
// =============================================

export const revisionSchemas = {
    // Book-level tools for final checks
    get_book: {
        name: 'get_book',
        description: 'Get detailed information about a specific book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'The ID of the book'
                },
                include_chapters: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include chapter summary information'
                }
            },
            required: ['book_id']
        }
    },

    update_book: {
        name: 'update_book',
        description: 'Update book status and metadata after revision',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'The ID of the book to update'
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    description: 'Book status'
                },
                actual_word_count: {
                    type: 'integer',
                    description: 'Current word count of the book'
                },
                description: {
                    type: 'string',
                    description: 'Book description/summary'
                }
            },
            required: ['book_id']
        }
    },

    // Chapter tools for revision
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
                    default: true,  // Changed default to true for revision phase
                    description: 'Include scene information'
                },
                include_characters: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include character presence information'
                }
            },
            required: ['chapter_id']
        }
    },

    update_chapter: {
        name: 'update_chapter',
        description: 'Update chapter after revision',
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
                summary: {
                    type: 'string',
                    description: 'Chapter summary'
                },
                word_count: {
                    type: 'integer',
                    description: 'Current word count'
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Chapter writing status'
                },
                writing_notes: {
                    type: 'string',
                    description: 'Writing process notes'
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
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Filter by chapter status (optional)'
                },
                include_stats: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include word count and scene statistics'
                }
            },
            required: ['book_id']
        }
    },

    // Scene tools for revision
    get_scene: {
        name: 'get_scene',
        description: 'Get detailed information about a specific scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'ID of the scene'
                },
                include_characters: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include character participant details'
                }
            },
            required: ['scene_id']
        }
    },

    update_scene: {
        name: 'update_scene',
        description: 'Update scene after revision',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'ID of the scene to update'
                },
                summary: {
                    type: 'string',
                    description: 'Scene summary'
                },
                word_count: {
                    type: 'integer',
                    description: 'Current word count for this scene'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Writing status'
                },
                notes: {
                    type: 'string',
                    description: 'General scene notes'
                }
            },
            required: ['scene_id']
        }
    },

    list_scenes: {
        name: 'list_scenes',
        description: 'List all scenes in a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Filter by writing status (optional)'
                },
                include_stats: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include word count statistics'
                }
            },
            required: ['chapter_id']
        }
    },

    delete_scene: {
        name: 'delete_scene',
        description: 'Delete a scene during revision',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'ID of the scene to delete'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Must be true to confirm deletion'
                }
            },
            required: ['scene_id', 'confirm_deletion']
        }
    },

    analyze_scene_flow: {
        name: 'analyze_scene_flow',
        description: 'Analyze the flow and pacing between scenes in a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter to analyze'
                },
                analysis_type: {
                    type: 'string',
                    enum: ['intensity_flow', 'element_distribution', 'character_presence', 'scene_balance'],
                    default: 'intensity_flow',
                    description: 'Type of analysis to perform'
                },
                include_suggestions: {
                    type: 'boolean',
                    default: true,
                    description: 'Include improvement suggestions'
                }
            },
            required: ['chapter_id']
        }
    }
};

// Export as array for easy spreading
export const revisionSchemaArray = Object.values(revisionSchemas);
