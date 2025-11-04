// src/mcps/book-server/schemas/book-tools-schema.js
// Centralized tool schema definitions for the Book MCP Server
// Contains all tool definitions for books, chapters, and scenes

// =============================================
// BOOK MANAGEMENT TOOL SCHEMAS
// =============================================
export const bookToolsSchema = [
    {
        name: 'list_books',
        description: 'List books',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID filter'
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    description: 'Status filter'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include stats'
                }
            },
            required: []
        }
    },
    {
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
                    default: false,
                    description: 'Include chapters'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'create_book',
        description: 'Create book',
        inputSchema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'Title'
                },
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                book_number: {
                    type: 'integer',
                    description: 'Series position'
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    default: 'planned',
                    description: 'Status'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count'
                },
                actual_word_count: {
                    type: 'integer',
                    default: 0,
                    description: 'Current word count'
                },
                publication_year: {
                    type: 'integer',
                    description: 'Pub year'
                },
                description: {
                    type: 'string',
                    description: 'Description'
                },
                isbn: {
                    type: 'string',
                    description: 'ISBN'
                },
                page_count: {
                    type: 'integer',
                    description: 'Pages'
                },
                cover_image_url: {
                    type: 'string',
                    description: 'Cover URL'
                },
                genre_names: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre names'
                }
            },
            required: ['title', 'series_id', 'book_number']
        }
    },
    {
        name: 'update_book',
        description: 'Update book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                title: {
                    type: 'string',
                    description: 'Title'
                },
                book_number: {
                    type: 'integer',
                    description: 'Series position'
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    description: 'Status'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count'
                },
                actual_word_count: {
                    type: 'integer',
                    description: 'Current word count'
                },
                publication_year: {
                    type: 'integer',
                    description: 'Pub year'
                },
                isbn: {
                    type: 'string',
                    description: 'ISBN'
                },
                page_count: {
                    type: 'integer',
                    description: 'Pages'
                },
                description: {
                    type: 'string',
                    description: 'Description'
                },
                cover_image_url: {
                    type: 'string',
                    description: 'Cover URL'
                },
                genre_names: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre names'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'delete_book',
        description: 'Delete book & chapters/scenes',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Confirm (must be true)'
                }
            },
            required: ['book_id', 'confirm_deletion']
        }
    }
];

// =============================================
// CHAPTER MANAGEMENT TOOL SCHEMAS
// =============================================
export const chapterToolsSchema = [
    {
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
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    default: 'planned',
                    description: 'Writing status'
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
    {
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
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Writing status'
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
    {
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
    {
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
                    default: false,
                    description: 'Include stats'
                }
            },
            required: ['book_id']
        }
    },
    {
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
    //,
    // {
    //     name: 'reorder_chapters',
    //     description: 'Reorder chapters within a book by updating chapter numbers',
    //     inputSchema: {
    //         type: 'object',
    //         properties: {
    //             book_id: {
    //                 type: 'integer',
    //                 description: 'ID of the book'
    //             },
    //             chapter_order: {
    //                 type: 'array',
    //                 items: {
    //                     type: 'object',
    //                     properties: {
    //                         chapter_id: { type: 'integer' },
    //                         new_chapter_number: { type: 'integer' }
    //                     },
    //                     required: ['chapter_id', 'new_chapter_number']
    //                 },
    //                 description: 'Array of chapter IDs and their new chapter numbers'
    //             }
    //         },
    //         required: ['book_id', 'chapter_order']
    //     }
    // }
];

// =============================================
// SCENE MANAGEMENT TOOL SCHEMAS
// =============================================
export const sceneToolsSchema = [
    {
        name: 'create_scene',
        description: 'Create scene',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                scene_number: {
                    type: 'integer',
                    description: 'Scene # in chapter'
                },
                scene_title: {
                    type: 'string',
                    description: 'Title'
                },
                scene_purpose: {
                    type: 'string',
                    enum: ['action', 'dialogue', 'description', 'transition', 'exposition', 'conflict', 'resolution'],
                    description: 'Purpose'
                },
                scene_type: {
                    type: 'string',
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Tone/genre'
                },
                location: {
                    type: 'string',
                    description: 'Location'
                },
                time_of_day: {
                    type: 'string',
                    description: 'Time (morning, afternoon, night, etc.)'
                },
                duration: {
                    type: 'string',
                    description: 'Duration (5 minutes, 2 hours, etc.)'
                },
                summary: {
                    type: 'string',
                    description: 'Summary'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character ID'
                },
                scene_participants: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Character IDs in scene'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    default: 'planned',
                    description: 'Writing status'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count'
                },
                intensity_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Intensity (1=low, 10=max)'
                },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Element tags (tropes, themes, moods)'
                },
                implementation_notes: {
                    type: 'string',
                    description: 'Implementation notes'
                },
                notes: {
                    type: 'string',
                    description: 'Author notes'
                }
            },
            required: ['chapter_id', 'scene_number']
        }
    },
    {
        name: 'update_scene',
        description: 'Update scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'Scene ID'
                },
                scene_title: {
                    type: 'string',
                    description: 'Title'
                },
                scene_purpose: {
                    type: 'string',
                    enum: ['action', 'dialogue', 'description', 'transition', 'exposition', 'conflict', 'resolution'],
                    description: 'Purpose'
                },
                scene_type: {
                    type: 'string',
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Tone/genre'
                },
                location: {
                    type: 'string',
                    description: 'Location'
                },
                time_of_day: {
                    type: 'string',
                    description: 'Time of day'
                },
                duration: {
                    type: 'string',
                    description: 'Duration'
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
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character ID'
                },
                scene_participants: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Character IDs in scene'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Writing status'
                },
                intensity_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Intensity (1=low, 10=max)'
                },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Element tags (tropes, themes, moods)'
                },
                implementation_notes: {
                    type: 'string',
                    description: 'Implementation notes'
                },
                notes: {
                    type: 'string',
                    description: 'Scene notes'
                }
            },
            required: ['scene_id']
        }
    },
    {
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
                    default: false,
                    description: 'Include character details'
                }
            },
            required: ['scene_id']
        }
    },
    {
        name: 'list_scenes',
        description: 'List scenes',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                scene_type: {
                    type: 'string',
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Scene type filter'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Status filter'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include stats'
                },
                intensity_filter: {
                    type: 'object',
                    properties: {
                        min_intensity: { type: 'integer', minimum: 1, maximum: 10 },
                        max_intensity: { type: 'integer', minimum: 1, maximum: 10 }
                    },
                    description: 'Intensity range filter'
                },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Element filter'
                }
            },
            required: ['chapter_id']
        }
    },
    {
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
    {
        name: 'reorder_scenes',
        description: 'Reorder scenes',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                scene_order: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            scene_id: { type: 'integer' },
                            new_scene_number: { type: 'integer' }
                        },
                        required: ['scene_id', 'new_scene_number']
                    },
                    description: 'Scene IDs w/ new numbers'
                }
            },
            required: ['chapter_id', 'scene_order']
        }
    },
    {
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

];

// =============================================
// CROSS-COMPONENT ANALYSIS TOOL SCHEMAS
// =============================================
export const analysisToolsSchema = [
    {
        name: 'get_book_structure',
        description: 'Get book structure',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                include_scene_details: {
                    type: 'boolean',
                    default: false,
                    description: 'Include scene details'
                },
                include_character_info: {
                    type: 'boolean',
                    default: false,
                    description: 'Include character presence'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'analyze_book_progress',
        description: 'Analyze writing progress',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                include_projections: {
                    type: 'boolean',
                    default: false,
                    description: 'Include completion projections'
                },
                include_recommendations: {
                    type: 'boolean',
                    default: true,
                    description: 'Include recommendations'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'validate_book_consistency',
        description: 'Check consistency issues',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'Book ID'
                },
                check_chapter_numbering: {
                    type: 'boolean',
                    default: true,
                    description: 'Check chapter numbering'
                },
                check_word_counts: {
                    type: 'boolean',
                    default: true,
                    description: 'Check word counts'
                },
                check_character_continuity: {
                    type: 'boolean',
                    default: false,
                    description: 'Check character continuity (needs character server)'
                },
                severity_level: {
                    type: 'string',
                    enum: ['all', 'warnings_and_errors', 'errors_only'],
                    default: 'all',
                    description: 'Issue severity filter'
                }
            },
            required: ['book_id']
        }
    }
];

// =============================================
// COMBINED SCHEMA EXPORT FOR EASY USAGE
// =============================================
export const allBookServerTools = [
    ...bookToolsSchema,
    ...chapterToolsSchema,
    ...sceneToolsSchema,
    ...analysisToolsSchema
];

// =============================================
// TOOL CATEGORIES FOR ORGANIZATIONAL USE
// =============================================
export const toolCategories = {
    book_management: bookToolsSchema,
    chapter_management: chapterToolsSchema,
    scene_management: sceneToolsSchema,
    analysis_tools: analysisToolsSchema
};

// =============================================
// UTILITY FUNCTIONS FOR SCHEMA VALIDATION
// =============================================
export function getToolSchema(toolName) {
    return allBookServerTools.find(tool => tool.name === toolName);
}

export function getToolsByCategory(category) {
    return toolCategories[category] || [];
}

export function validateToolExists(toolName) {
    return allBookServerTools.some(tool => tool.name === toolName);
}

export function getRequiredFields(toolName) {
    const tool = getToolSchema(toolName);
    return tool?.inputSchema?.required || [];
}

export function getOptionalFields(toolName) {
    const tool = getToolSchema(toolName);
    if (!tool?.inputSchema?.properties) return [];
    
    const required = tool.inputSchema.required || [];
    const allFields = Object.keys(tool.inputSchema.properties);
    return allFields.filter(field => !required.includes(field));
}