// src/mcps/book-server/index.js

// Protect stdout from any pollution in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalWrite = process.stdout.write;
    process.stdout.write = function() { return true; };
    
    // Restore stdout after module loading is complete
    process.nextTick(() => {
        process.stdout.write = originalWrite;
    });
}

import { BaseMCPServer } from '../../shared/base-server.js';

class BookMCPServer extends BaseMCPServer {
    constructor() {
        super('book-manager', '1.0.0');
        // Initialize tools after base constructor
        this.tools = this.getTools();
    }

    getTools() {
        return [
            {
                name: 'list_books',
                description: 'List all books, optionally filtered by series',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Filter by series ID (optional)' }
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
                        book_id: { type: 'integer', description: 'The ID of the book' }
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
                        title: { type: 'string', description: 'Book title' },
                        series_id: { type: 'integer', description: 'ID of the series this book belongs to' },
                        book_number: { type: 'integer', description: 'Position in the series' },
                        status: { type: 'string', description: 'Book status (planned, in_progress, draft, editing, published)', default: 'planned' },
                        target_word_count: { type: 'integer', description: 'Target word count for the book' },
                        actual_word_count: { type: 'integer', description: 'Current word count of the book', default: 0 },
                        publication_year: { type: 'integer', description: 'Year of publication' },
                        description: { type: 'string', description: 'Book description/summary' },
                        isbn: { type: 'string', description: 'ISBN number' },
                        page_count: { type: 'integer', description: 'Number of pages' }
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
                        book_id: { type: 'integer', description: 'The ID of the book to update' },
                        title: { type: 'string', description: 'Book title' },
                        book_number: { type: 'integer', description: 'Position in the series' },
                        publication_year: { type: 'integer', description: 'Year of publication' },
                        isbn: { type: 'string', description: 'ISBN number' },
                        page_count: { type: 'integer', description: 'Number of pages' },
                        description: { type: 'string', description: 'Book description/summary' }
                    },
                    required: ['book_id']
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'list_books': this.handleListBooks,
            'get_book': this.handleGetBook,
            'create_book': this.handleCreateBook,
            'update_book': this.handleUpdateBook
        };
        return handlers[toolName];
    }

    async handleListBooks(args) {
        try {
            const { series_id } = args;
            
            let query = `
                SELECT b.*, s.title as series_title, a.name as author_name 
                FROM books b 
                JOIN series s ON b.series_id = s.id 
                JOIN authors a ON s.author_id = a.id
            `;
            
            const params = [];
            if (series_id) {
                query += ' WHERE b.series_id = $1';
                params.push(series_id);
            }
            
            query += ' ORDER BY s.title, b.book_number';
            
            const result = await this.db.query(query, params);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${result.rows.length} books:\n\n` +
                              result.rows.map(book => 
                                  `ID: ${book.id}\n` +
                                  `Title: ${book.title}\n` +
                                  `Series: ${book.series_title} (#${book.book_number})\n` +
                                  `Author: ${book.author_name}\n` +
                                  `Published: ${book.publication_year || 'Unknown'}\n` +
                                  `Pages: ${book.page_count || 'Unknown'}\n` +
                                  `ISBN: ${book.isbn || 'Not specified'}\n` +
                                  `Description: ${book.description || 'No description available'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to list books: ${error.message}`);
        }
    }

    async handleGetBook(args) {
        try {
            const { book_id } = args;
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
                    content: [
                        {
                            type: 'text',
                            text: `No book found with ID: ${book_id}`
                        }
                    ]
                };
            }
            
            const book = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Book Details:\n\n` +
                              `ID: ${book.id}\n` +
                              `Title: ${book.title}\n` +
                              `Series: ${book.series_title} (#${book.book_number})\n` +
                              `Author: ${book.author_name}\n` +
                              `Published: ${book.publication_year || 'Unknown'}\n` +
                              `Pages: ${book.page_count || 'Unknown'}\n` +
                              `ISBN: ${book.isbn || 'Not specified'}\n` +
                              `Description: ${book.description || 'No description available'}\n` +
                              `Created: ${book.created_at}\n` +
                              `Updated: ${book.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get book: ${error.message}`);
        }
    }

    async handleCreateBook(args) {
        try {
            const { title, series_id, book_number, publication_year, isbn, page_count, description } = args;
            
            // Check if book number already exists in series
            const checkQuery = 'SELECT id FROM books WHERE series_id = $1 AND book_number = $2';
            const checkResult = await this.db.query(checkQuery, [series_id, book_number]);
            
            if (checkResult.rows.length > 0) {
                throw new Error(`Book #${book_number} already exists in this series`);
            }
            
            const query = `
                INSERT INTO books (
                    title, 
                    series_id, 
                    book_number,
                    status,
                    target_word_count,
                    actual_word_count,
                    publication_year,
                    description,
                    isbn,
                    page_count
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING *
            `;
            const result = await this.db.query(query, [
                title, 
                series_id, 
                book_number,
                args.status || 'planned',
                args.target_word_count || null,
                args.actual_word_count || 0,
                args.publication_year || null,
                args.description || null,
                args.isbn || null,
                args.page_count || null
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
                content: [
                    {
                        type: 'text',
                        text: `Created book successfully!\n\n` +
                              `ID: ${book.id}\n` +
                              `Title: ${book.title}\n` +
                              `Series: ${info.series_title || 'Unknown'} (#${book.book_number})\n` +
                              `Author: ${info.author_name || 'Unknown'}\n` +
                              `Status: ${book.status}\n` +
                              `Target Word Count: ${book.target_word_count || 'Not specified'}\n` +
                              `Current Word Count: ${book.actual_word_count}\n` +
                              `Published: ${book.publication_year || 'Not specified'}\n` +
                              `Pages: ${book.page_count || 'Not specified'}\n` +
                              `ISBN: ${book.isbn || 'Not specified'}\n` +
                              `Description: ${book.description || 'No description provided'}`
                    }
                ]
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
            const { book_id, title, book_number, publication_year, isbn, page_count, description } = args;
            
            // If updating book_number, check for conflicts
            if (book_number !== undefined) {
                const checkQuery = `
                    SELECT series_id FROM books WHERE id = $1
                `;
                const seriesResult = await this.db.query(checkQuery, [book_id]);
                
                if (seriesResult.rows.length === 0) {
                    throw new Error('Book not found');
                }
                
                const series_id = seriesResult.rows[0].series_id;
                const conflictQuery = 'SELECT id FROM books WHERE series_id = $1 AND book_number = $2 AND id != $3';
                const conflictResult = await this.db.query(conflictQuery, [series_id, book_number, book_id]);
                
                if (conflictResult.rows.length > 0) {
                    throw new Error(`Book #${book_number} already exists in this series`);
                }
            }
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (title !== undefined) {
                updates.push(`title = $${paramCount++}`);
                values.push(title);
            }
            if (book_number !== undefined) {
                updates.push(`book_number = $${paramCount++}`);
                values.push(book_number);
            }
            if (publication_year !== undefined) {
                updates.push(`publication_year = $${paramCount++}`);
                values.push(publication_year);
            }
            if (isbn !== undefined) {
                updates.push(`isbn = $${paramCount++}`);
                values.push(isbn);
            }
            if (page_count !== undefined) {
                updates.push(`page_count = $${paramCount++}`);
                values.push(page_count);
            }
            if (description !== undefined) {
                updates.push(`description = $${paramCount++}`);
                values.push(description);
            }
            
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(book_id);
            
            const query = `
                UPDATE books 
                SET ${updates.join(', ')} 
                WHERE id = $${paramCount} 
                RETURNING *
            `;
            
            const result = await this.db.query(query, values);
            
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No book found with ID: ${book_id}`
                        }
                    ]
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
                content: [
                    {
                        type: 'text',
                        text: `Updated book successfully!\n\n` +
                              `ID: ${book.id}\n` +
                              `Title: ${book.title}\n` +
                              `Series: ${info.series_title || 'Unknown'} (#${book.book_number})\n` +
                              `Author: ${info.author_name || 'Unknown'}\n` +
                              `Published: ${book.publication_year || 'Not specified'}\n` +
                              `Pages: ${book.page_count || 'Not specified'}\n` +
                              `ISBN: ${book.isbn || 'Not specified'}\n` +
                              `Description: ${book.description || 'No description available'}\n` +
                              `Updated: ${book.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update book: ${error.message}`);
        }
    }
}

export { BookMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

// Convert paths to handle Windows path differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];
const normalizedScriptPath = `file:///${scriptPath.replace(/\\/g, '/')}`;
const isDirectExecution = currentModuleUrl === normalizedScriptPath;

if (!process.env.MCP_STDIO_MODE && isDirectExecution) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(BookMCPServer);
    await runner.run();
} else if (isDirectExecution) {
    // When running directly as MCP server (via Claude Desktop)
    console.error('[BOOK-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new BookMCPServer();
        await server.run();
    } catch (error) {
        console.error('[BOOK-SERVER] Failed to start MCP server:', error.message);
        console.error('[BOOK-SERVER] Stack:', error.stack);
        process.exit(1);
    }
}
