// src/mcps/book-server/index.js
import { BaseMCPServer } from '../../shared/base-server.js';

class BookMCPServer extends BaseMCPServer {
    constructor() {
        super('book-manager', '1.0.0');
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
                        publication_year: { type: 'integer', description: 'Year of publication' },
                        isbn: { type: 'string', description: 'ISBN number' },
                        page_count: { type: 'integer', description: 'Number of pages' },
                        description: { type: 'string', description: 'Book description/summary' }
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
                INSERT INTO books (title, series_id, book_number, publication_year, isbn, page_count, description) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *
            `;
            const result = await this.db.query(query, [title, series_id, book_number, publication_year, isbn, page_count, description]);
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

// CLI runner when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const { CLIRunner } = await import('../../shared/cli-runner.js');
    const runner = new CLIRunner(BookMCPServer);
    await runner.run();
}
