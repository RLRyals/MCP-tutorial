// src/mcps/book-server/handlers/book-handlers.js
// Core Book Management Handler - CRUD operations for books within series
// Designed for AI Writing Teams to manage book-level story structure

export class BookHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // BOOK TOOL DEFINITIONS
    // =============================================
    getBookTools() {
        return [
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
    }

    // =============================================
    // BOOK MANAGEMENT HANDLERS
    // =============================================

    async handleListBooks(args) {
        try {
            const { series_id, status, include_stats = false } = args;
            
            let query = `
                SELECT b.*, s.title as series_title, a.name as author_name 
                FROM books b 
                JOIN series s ON b.series_id = s.id 
                JOIN authors a ON s.author_id = a.id
            `;
            
            const params = [];
            const conditions = [];
            let paramCount = 0;

            if (series_id) {
                paramCount++;
                conditions.push(`b.series_id = $${paramCount}`);
                params.push(series_id);
            }

            if (status) {
                paramCount++;
                conditions.push(`b.status = $${paramCount}`);
                params.push(status);
            }

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            query += ' ORDER BY s.title, b.book_number';
            
            const result = await this.db.query(query, params);
            
            let booksText = `Found ${result.rows.length} books:\n\n`;
            
            for (const book of result.rows) {
                booksText += `ID: ${book.id}\n`;
                booksText += `Title: ${book.title}\n`;
                booksText += `Series: ${book.series_title} (#${book.book_number})\n`;
                booksText += `Author: ${book.author_name}\n`;
                booksText += `Status: ${book.status}\n`;
                booksText += `Published: ${book.publication_year || 'Unknown'}\n`;
                
                if (include_stats) {
                    // Get chapter count and total word count
                    const statsQuery = `
                        SELECT 
                            COUNT(*) as chapter_count,
                            COALESCE(SUM(word_count), 0) as total_words
                        FROM chapters 
                        WHERE book_id = $1
                    `;
                    const statsResult = await this.db.query(statsQuery, [book.id]);
                    const stats = statsResult.rows[0];
                    
                    booksText += `Chapters: ${stats.chapter_count}\n`;
                    booksText += `Current Words: ${stats.total_words}\n`;
                    booksText += `Target Words: ${book.target_word_count || 'Not specified'}\n`;
                    if (book.target_word_count && stats.total_words > 0) {
                        const progress = Math.round((stats.total_words / book.target_word_count) * 100);
                        booksText += `Progress: ${progress}%\n`;
                    }
                }
                
                booksText += `Pages: ${book.page_count || 'Unknown'}\n`;
                booksText += `ISBN: ${book.isbn || 'Not specified'}\n`;
                booksText += `Description: ${book.description || 'No description available'}\n`;
                
                if (book.genre_tags && book.genre_tags.length > 0) {
                    booksText += `Genre Tags: ${book.genre_tags.join(', ')}\n`;
                }
                
                booksText += '\n---\n\n';
            }
            
            return {
                content: [{
                    type: 'text',
                    text: booksText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to list books: ${error.message}`);
        }
    }

    async handleGetBook(args) {
        try {
            const { book_id, include_chapters = false } = args;
            
            const query = `
                SELECT b.*, s.title as series_title, a.name as author_name 
                FROM books b 
                JOIN series s ON b.series_id = s.id 
                JOIN authors a ON s.author_id = a.id 
                WHERE b.id = $1
            `;
            const result = await this.db.query(query, [book_id]);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No book found with ID: ${book_id}`
                    }]
                };
            }
            
            const book = result.rows[0];
            
            let bookText = `Book Details:\n\n`;
            bookText += `ID: ${book.id}\n`;
            bookText += `Title: ${book.title}\n`;
            bookText += `Series: ${book.series_title} (#${book.book_number})\n`;
            bookText += `Author: ${book.author_name}\n`;
            bookText += `Status: ${book.status}\n`;
            bookText += `Target Word Count: ${book.target_word_count || 'Not specified'}\n`;
            bookText += `Current Word Count: ${book.actual_word_count || 0}\n`;
            bookText += `Published: ${book.publication_year || 'Unknown'}\n`;
            bookText += `Pages: ${book.page_count || 'Unknown'}\n`;
            bookText += `ISBN: ${book.isbn || 'Not specified'}\n`;
            
            if (book.cover_image_url) {
                bookText += `Cover Image: ${book.cover_image_url}\n`;
            }
            
            if (book.genre_tags && book.genre_tags.length > 0) {
                bookText += `Genre Tags: ${book.genre_tags.join(', ')}\n`;
            }
            
            bookText += `Description: ${book.description || 'No description available'}\n`;
            bookText += `Created: ${book.created_at}\n`;
            bookText += `Updated: ${book.updated_at}\n`;

            if (include_chapters) {
                const chaptersQuery = `
                    SELECT chapter_id, chapter_number, title, word_count, status
                    FROM chapters 
                    WHERE book_id = $1 
                    ORDER BY chapter_number
                `;
                const chaptersResult = await this.db.query(chaptersQuery, [book_id]);
                
                if (chaptersResult.rows.length > 0) {
                    bookText += `\nChapters (${chaptersResult.rows.length}):\n`;
                    chaptersResult.rows.forEach(chapter => {
                        bookText += `  ${chapter.chapter_number}. ${chapter.title || 'Untitled'} `;
                        bookText += `(${chapter.word_count || 0} words, ${chapter.status})\n`;
                    });
                } else {
                    bookText += `\nNo chapters created yet.\n`;
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: bookText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get book: ${error.message}`);
        }
    }

    async handleCreateBook(args) {
        try {
            const { title, series_id, book_number, status = 'planned', target_word_count, 
                    actual_word_count = 0, publication_year, description, isbn, page_count, 
                    cover_image_url, genre_tags } = args;
            
            // Check if book number already exists in series
            const checkQuery = 'SELECT id FROM books WHERE series_id = $1 AND book_number = $2';
            const checkResult = await this.db.query(checkQuery, [series_id, book_number]);
            
            if (checkResult.rows.length > 0) {
                throw new Error(`Book #${book_number} already exists in this series`);
            }
            
            const query = `
                INSERT INTO books (
                    title, series_id, book_number, status, target_word_count, 
                    actual_word_count, publication_year, description, isbn, 
                    page_count, cover_image_url, genre_tags
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                title, series_id, book_number, status, target_word_count || null,
                actual_word_count, publication_year || null, description || null, 
                isbn || null, page_count || null, cover_image_url || null, 
                genre_tags || []
            ]);
            
            const book = result.rows[0];
            
            // Get series and author info for display
            const infoQuery = `
                SELECT s.title as series_title, a.name as author_name 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                WHERE s.id = $1
            `;
            const infoResult = await this.db.query(infoQuery, [series_id]);
            const info = infoResult.rows[0] || {};
            
            return {
                content: [{
                    type: 'text',
                    text: `Created book successfully!\n\n` +
                          `ID: ${book.id}\n` +
                          `Title: ${book.title}\n` +
                          `Series: ${info.series_title || 'Unknown'} (#${book.book_number})\n` +
                          `Author: ${info.author_name || 'Unknown'}\n` +
                          `Status: ${book.status}\n` +
                          `Target Word Count: ${book.target_word_count || 'Not specified'}\n` +
                          `Current Word Count: ${book.actual_word_count}\n` +
                          `Genre Tags: ${book.genre_tags && book.genre_tags.length > 0 ? book.genre_tags.join(', ') : 'None'}\n` +
                          `Description: ${book.description || 'No description provided'}`
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Invalid series_id: Series not found');
            }
            throw new Error(`Failed to create book: ${error.message}`);
        }
    }

    async handleUpdateBook(args) {
        try {
            const { book_id, ...updates } = args;
            
            // If updating book_number, check for conflicts
            if (updates.book_number !== undefined) {
                const checkQuery = 'SELECT series_id FROM books WHERE id = $1';
                const seriesResult = await this.db.query(checkQuery, [book_id]);
                
                if (seriesResult.rows.length === 0) {
                    throw new Error('Book not found');
                }
                
                const series_id = seriesResult.rows[0].series_id;
                const conflictQuery = 'SELECT id FROM books WHERE series_id = $1 AND book_number = $2 AND id != $3';
                const conflictResult = await this.db.query(conflictQuery, [series_id, updates.book_number, book_id]);
                
                if (conflictResult.rows.length > 0) {
                    throw new Error(`Book #${updates.book_number} already exists in this series`);
                }
            }
            
            // Build dynamic update query
            const updateFields = [];
            const params = [book_id];
            let paramCount = 1;
            
            for (const [key, value] of Object.entries(updates)) {
                if (value !== undefined) {
                    paramCount++;
                    updateFields.push(`${key} = $${paramCount}`);
                    params.push(value);
                }
            }
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            
            const query = `
                UPDATE books 
                SET ${updateFields.join(', ')}
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No book found with ID: ${book_id}`
                    }]
                };
            }
            
            const book = result.rows[0];
            
            // Get series and author info for display
            const infoQuery = `
                SELECT s.title as series_title, a.name as author_name 
                FROM series s 
                JOIN authors a ON s.author_id = a.id 
                WHERE s.id = $1
            `;
            const infoResult = await this.db.query(infoQuery, [book.series_id]);
            const info = infoResult.rows[0] || {};
            
            return {
                content: [{
                    type: 'text',
                    text: `Updated book successfully!\n\n` +
                          `ID: ${book.id}\n` +
                          `Title: ${book.title}\n` +
                          `Series: ${info.series_title || 'Unknown'} (#${book.book_number})\n` +
                          `Author: ${info.author_name || 'Unknown'}\n` +
                          `Status: ${book.status}\n` +
                          `Target Word Count: ${book.target_word_count || 'Not specified'}\n` +
                          `Current Word Count: ${book.actual_word_count || 0}\n` +
                          `Genre Tags: ${book.genre_tags && book.genre_tags.length > 0 ? book.genre_tags.join(', ') : 'None'}\n` +
                          `Updated: ${book.updated_at}`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to update book: ${error.message}`);
        }
    }

    async handleDeleteBook(args) {
        try {
            const { book_id, confirm_deletion } = args;
            
            if (!confirm_deletion) {
                throw new Error('Must confirm deletion by setting confirm_deletion to true');
            }
            
            // Get book info before deletion
            const bookQuery = `
                SELECT b.title, s.title as series_title, 
                       (SELECT COUNT(*) FROM chapters WHERE book_id = b.id) as chapter_count
                FROM books b 
                JOIN series s ON b.series_id = s.id 
                WHERE b.id = $1
            `;
            const bookResult = await this.db.query(bookQuery, [book_id]);
            
            if (bookResult.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No book found with ID: ${book_id}`
                    }]
                };
            }
            
            const bookInfo = bookResult.rows[0];
            
            // Delete the book (cascade will handle chapters and scenes)
            const deleteQuery = 'DELETE FROM books WHERE id = $1 RETURNING *';
            const deleteResult = await this.db.query(deleteQuery, [book_id]);
            
            return {
                content: [{
                    type: 'text',
                    text: `Successfully deleted book: "${bookInfo.title}"\n` +
                          `Series: ${bookInfo.series_title}\n` +
                          `${bookInfo.chapter_count} chapters and all associated scenes were also deleted.\n\n` +
                          `⚠️ This action cannot be undone.`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to delete book: ${error.message}`);
        }
    }

    // =============================================
    // UTILITY METHODS FOR CROSS-COMPONENT USE
    // =============================================

    async getBookById(book_id) {
        try {
            const query = `
                SELECT b.*, s.title as series_title, a.name as author_name 
                FROM books b 
                JOIN series s ON b.series_id = s.id 
                JOIN authors a ON s.author_id = a.id 
                WHERE b.id = $1
            `;
            const result = await this.db.query(query, [book_id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get book by ID: ${error.message}`);
        }
    }

    async updateBookWordCount(book_id, new_word_count) {
        try {
            const query = `
                UPDATE books 
                SET actual_word_count = $2, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 
                RETURNING actual_word_count
            `;
            const result = await this.db.query(query, [book_id, new_word_count]);
            return result.rows[0]?.actual_word_count || 0;
        } catch (error) {
            throw new Error(`Failed to update book word count: ${error.message}`);
        }
    }
}