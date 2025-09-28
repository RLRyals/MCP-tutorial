// src/mcps/book-server/schemas/book-tools-schema.js
// Centralized tool schema definitions for the Book MCP Server
// Contains all tool definitions for books, chapters, and scenes

// =============================================
// BOOK MANAGEMENT TOOL SCHEMAS
// =============================================
export const bookToolsSchema = [
    {
        name: 'list_books',
        description: 'List all books, optionally filtered by series',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { 
                    type: 'integer', 
                    description: 'Filter by series ID (optional)' 
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    description: 'Filter by book status (optional)'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include chapter and word count statistics'
                }
            },
            required: []
        }
    },
    {
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
                    default: false,
                    description: 'Include chapter summary information'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'create_book',
        description: 'Create a new book in a series',
        inputSchema: {
            type: 'object',
            properties: {
                title: { 
                    type: 'string', 
                    description: 'Book title' 
                },
                series_id: { 
                    type: 'integer', 
                    description: 'ID of the series this book belongs to' 
                },
                book_number: { 
                    type: 'integer', 
                    description: 'Position in the series' 
                },
                status: { 
                    type: 'string', 
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    default: 'planned',
                    description: 'Book status' 
                },
                target_word_count: { 
                    type: 'integer', 
                    description: 'Target word count for the book' 
                },
                actual_word_count: { 
                    type: 'integer', 
                    default: 0,
                    description: 'Current word count of the book' 
                },
                publication_year: { 
                    type: 'integer', 
                    description: 'Year of publication' 
                },
                description: { 
                    type: 'string', 
                    description: 'Book description/summary' 
                },
                isbn: { 
                    type: 'string', 
                    description: 'ISBN number' 
                },
                page_count: { 
                    type: 'integer', 
                    description: 'Number of pages' 
                },
                cover_image_url: {
                    type: 'string',
                    description: 'URL to book cover image'
                },
                genre_tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre tags for this specific book'
                }
            },
            required: ['title', 'series_id', 'book_number']
        }
    },
    {
        name: 'update_book',
        description: 'Update an existing book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { 
                    type: 'integer', 
                    description: 'The ID of the book to update' 
                },
                title: { 
                    type: 'string', 
                    description: 'Book title' 
                },
                book_number: { 
                    type: 'integer', 
                    description: 'Position in the series' 
                },
                status: {
                    type: 'string',
                    enum: ['planned', 'in_progress', 'draft', 'editing', 'final', 'published'],
                    description: 'Book status'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count for the book'
                },
                actual_word_count: {
                    type: 'integer',
                    description: 'Current word count of the book'
                },
                publication_year: { 
                    type: 'integer', 
                    description: 'Year of publication' 
                },
                isbn: { 
                    type: 'string', 
                    description: 'ISBN number' 
                },
                page_count: { 
                    type: 'integer', 
                    description: 'Number of pages' 
                },
                description: { 
                    type: 'string', 
                    description: 'Book description/summary' 
                },
                cover_image_url: {
                    type: 'string',
                    description: 'URL to book cover image'
                },
                genre_tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre tags for this specific book'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'delete_book',
        description: 'Delete a book and all its chapters/scenes',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'The ID of the book to delete'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Must be true to confirm deletion'
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
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    default: 'planned',
                    description: 'Chapter writing status'
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
    {
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
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Chapter writing status'
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
    {
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
    {
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
                    default: false,
                    description: 'Include word count and scene statistics'
                }
            },
            required: ['book_id']
        }
    },
    {
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
        description: 'Create a new scene within a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: { 
                    type: 'integer', 
                    description: 'ID of the chapter this scene belongs to' 
                },
                scene_number: { 
                    type: 'integer', 
                    description: 'Scene number within the chapter' 
                },
                scene_title: { 
                    type: 'string', 
                    description: 'Optional scene title or name' 
                },
                scene_purpose: { 
                    type: 'string', 
                    enum: ['action', 'dialogue', 'description', 'transition', 'exposition', 'conflict', 'resolution'],
                    description: 'Primary purpose of this scene' 
                },
                scene_type: { 
                    type: 'string', 
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Emotional tone or genre type of scene' 
                },
                location: { 
                    type: 'string', 
                    description: 'Where this scene takes place' 
                },
                time_of_day: { 
                    type: 'string', 
                    description: 'Time when scene occurs (morning, afternoon, night, etc.)' 
                },
                duration: { 
                    type: 'string', 
                    description: 'How long this scene lasts (5 minutes, 2 hours, etc.)' 
                },
                summary: { 
                    type: 'string', 
                    description: 'Brief summary of what happens in this scene' 
                },
                pov_character_id: { 
                    type: 'integer', 
                    description: 'ID of the POV character for this scene' 
                },
                scene_participants: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Array of character IDs present in this scene'
                },
                intensity_level: { 
                type: 'integer', 
                minimum: 1, 
                maximum: 10, 
                description: 'Scene intensity for pacing (1=low, 10=maximum)' 
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    default: 'planned',
                    description: 'Writing progress status for this scene'
                },
                target_word_count: { 
                    type: 'integer', 
                    description: 'Target word count for this scene' 
                },
                notes: { 
                    type: 'string', 
                    description: 'Author notes and reminders for this scene' 
                }
            },
            required: ['chapter_id', 'scene_number']
        }
    },
    {
        name: 'update_scene',
        description: 'Update an existing scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: { 
                    type: 'integer', 
                    description: 'ID of the scene to update' 
                },
                scene_title: { 
                    type: 'string', 
                    description: 'Scene title' 
                },
                scene_purpose: { 
                    type: 'string', 
                    enum: ['action', 'dialogue', 'description', 'transition', 'exposition', 'conflict', 'resolution'],
                    description: 'Primary purpose of this scene' 
                },
                scene_type: { 
                    type: 'string', 
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Emotional tone or genre type of scene' 
                },
                location: { 
                    type: 'string', 
                    description: 'Scene location' 
                },
                time_of_day: { 
                    type: 'string', 
                    description: 'Time of day' 
                },
                duration: { 
                    type: 'string', 
                    description: 'Scene duration' 
                },
                summary: { 
                    type: 'string', 
                    description: 'Scene summary' 
                },
                word_count: { 
                    type: 'integer', 
                    description: 'Current word count for this scene' 
                },
                target_word_count: { 
                    type: 'integer', 
                    description: 'Target word count' 
                },
                pov_character_id: { 
                    type: 'integer', 
                    description: 'POV character ID' 
                },
                intensity_level: { type: 'integer', minimum: 1, maximum: 10 },
                scene_participants: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Character IDs present in scene'
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
    {
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
                    default: false,
                    description: 'Include character participant details'
                },
                include_tropes: { type: 'boolean', default: false, description: 'Include trope implementations' }
            },
            required: ['scene_id']
        }
    },
    {
        name: 'list_scenes',
        description: 'List all scenes in a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: { 
                    type: 'integer', 
                    description: 'ID of the chapter' 
                },
                include_participants: { 
                    type: 'boolean', default: false, description: 'Include character details' },
                scene_type: {
                    type: 'string',
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Filter by scene type (optional)'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Filter by writing status (optional)'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include word count statistics'
                }
            },
            required: ['chapter_id']
        }
    },
    {
        name: 'delete_scene',
        description: 'Delete a scene',
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
    {
        name: 'reorder_scenes',
        description: 'Reorder scenes within a chapter by updating scene numbers',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter'
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
                    description: 'Array of scene IDs and their new scene numbers'
                }
            },
            required: ['chapter_id', 'scene_order']
        }
    },
    {
        name: 'analyze_scene_flow',
        description: 'Analyze the flow and pacing between scenes in a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Analyze entire book' },
                chapter_id: { type: 'integer', description: 'Analyze specific chapter' },
                analysis_type: { 
                    type: 'string', 
                    enum: ['intensity_distribution', 'character_presence', 'scene_types'],
                    default: 'intensity_distribution',
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
];

// =============================================
// CROSS-COMPONENT ANALYSIS TOOL SCHEMAS
// =============================================
export const analysisToolsSchema = [
    {
        name: 'get_book_structure',
        description: 'Get comprehensive book structure with chapters and scenes',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'ID of the book to analyze'
                },
                include_scene_details: {
                    type: 'boolean',
                    default: false,
                    description: 'Include detailed scene information'
                },
                include_character_info: {
                    type: 'boolean',
                    default: false,
                    description: 'Include character presence information'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'analyze_book_progress',
        description: 'Analyze writing progress and completion status for a book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'ID of the book to analyze'
                },
                include_projections: {
                    type: 'boolean',
                    default: false,
                    description: 'Include completion time projections'
                },
                include_recommendations: {
                    type: 'boolean',
                    default: true,
                    description: 'Include writing recommendations'
                }
            },
            required: ['book_id']
        }
    },
    {
        name: 'validate_book_consistency',
        description: 'Check for structural and consistency issues in a book',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: {
                    type: 'integer',
                    description: 'ID of the book to validate'
                },
                check_chapter_numbering: {
                    type: 'boolean',
                    default: true,
                    description: 'Check for chapter numbering issues'
                },
                check_word_counts: {
                    type: 'boolean',
                    default: true,
                    description: 'Validate word count consistency'
                },
                check_character_continuity: {
                    type: 'boolean',
                    default: false,
                    description: 'Check character presence continuity (requires character server)'
                },
                severity_level: {
                    type: 'string',
                    enum: ['all', 'warnings_and_errors', 'errors_only'],
                    default: 'all',
                    description: 'Level of issues to report'
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