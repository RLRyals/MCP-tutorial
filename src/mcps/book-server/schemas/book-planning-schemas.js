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
                genre_names: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre names for this specific book'
                }
            },
            required: ['title', 'series_id', 'book_number']
        }
    },

    update_book: {
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
                genre_names: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Genre names for this specific book'
                }
            },
            required: ['book_id']
        }
    },

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
                    default: false,
                    description: 'Include chapter summary information'
                }
            },
            required: ['book_id']
        }
    },

    list_books: {
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
    }
};

// Export as array for easy spreading
export const bookPlanningSchemaArray = Object.values(bookPlanningSchemas);
