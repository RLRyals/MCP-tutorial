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
        description: 'Get book details',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                include_chapters: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include chapters'
                }
            },
            required: ['book_id']
        }
    },

    update_book: {
        name: 'update_book',
        description: 'Update book post-revision',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    description: 'Status'
                },
                actual_word_count: {
                    type: 'integer',
                    description: 'Current word count'
                },
                description: {
                    type: 'string',
                    description: 'Description'
                }
            },
            required: ['book_id']
        }
    },

    // Chapter tools for revision
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
                    default: true,  // Changed default to true for revision phase
                    description: 'Include scenes'
                },
                include_characters: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include character presence'
                }
            },
            required: ['chapter_id']
        }
    },

    update_chapter: {
        name: 'update_chapter',
        description: 'Update chapter post-revision',
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
                summary: {
                    type: 'string',
                    description: 'Summary'
                },
                word_count: {
                    type: 'integer',
                    description: 'Current word count'
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Writing status'
                },
                writing_notes: {
                    type: 'string',
                    description: 'Writing notes'
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
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Status filter'
                },
                include_stats: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include stats'
                }
            },
            required: ['book_id']
        }
    },

    // Scene tools for revision
    get_scene: {
        name: 'get_scene',
        description: 'Get scene details',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'Scene ID'
                },
                include_characters: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include character details'
                }
            },
            required: ['scene_id']
        }
    },

    update_scene: {
        name: 'update_scene',
        description: 'Update scene post-revision',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'Scene ID'
                },
                summary: {
                    type: 'string',
                    description: 'Summary'
                },
                word_count: {
                    type: 'integer',
                    description: 'Current word count'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Writing status'
                },
                notes: {
                    type: 'string',
                    description: 'Scene notes'
                }
            },
            required: ['scene_id']
        }
    },

    list_scenes: {
        name: 'list_scenes',
        description: 'List scenes',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Status filter'
                },
                include_stats: {
                    type: 'boolean',
                    default: true,  // Changed default to true for revision phase
                    description: 'Include stats'
                }
            },
            required: ['chapter_id']
        }
    },

    delete_scene: {
        name: 'delete_scene',
        description: 'Delete scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'Scene ID'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Confirm (must be true)'
                }
            },
            required: ['scene_id', 'confirm_deletion']
        }
    },

    analyze_scene_flow: {
        name: 'analyze_scene_flow',
        description: 'Analyze scene flow & pacing',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                analysis_type: {
                    type: 'string',
                    enum: ['intensity_flow', 'element_distribution', 'character_presence', 'scene_balance'],
                    default: 'intensity_flow',
                    description: 'Analysis type'
                },
                include_suggestions: {
                    type: 'boolean',
                    default: true,
                    description: 'Include suggestions'
                }
            },
            required: ['chapter_id']
        }
    }
};

// Export as array for easy spreading
export const revisionSchemaArray = Object.values(revisionSchemas);
