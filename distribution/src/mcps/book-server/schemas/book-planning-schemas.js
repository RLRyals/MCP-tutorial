// src/mcps/book-server/schemas/book-planning-schemas.js
// Schemas for BOOK PLANNING PHASE - lightweight subset for planning workflow
// Used by: config-mcps/book-planning-server

// =============================================
// BOOK PLANNING PHASE SCHEMAS
// =============================================

export const bookPlanningSchemas = {
    // Book structure tools
    create_book: {
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

    update_book: {
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
                    default: false,
                    description: 'Include chapters'
                }
            },
            required: ['book_id']
        }
    },

    list_books: {
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
    }
};

// Export as array for easy spreading
export const bookPlanningSchemaArray = Object.values(bookPlanningSchemas);
