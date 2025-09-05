// src/mcps/book-server.js
import { BaseMCPServer } from '../shared/base-server.js';

export class BookMCPServer extends BaseMCPServer {
    constructor() {
        super('book-manager', '1.0.0');
        
        // Define tools
        this.tools = [
            {
                name: 'create_book',
                description: 'Create a new book in a series',
                parameters: {
                    type: 'object',
                    required: ['series_id', 'title', 'book_number'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' },
                        title: { type: 'string', description: 'Book title' },
                        book_number: { type: 'integer', description: 'Book number in series' },
                        target_word_count: { type: 'integer', description: 'Target word count' }
                    }
                }
            },
            {
                name: 'update_book_status',
                description: 'Update book status',
                parameters: {
                    type: 'object',
                    required: ['book_id', 'status'],
                    properties: {
                        book_id: { type: 'integer', description: 'Book ID' },
                        status: { type: 'string', description: 'New status (planned, in_progress, draft, editing, published)' }
                    }
                }
            },
            {
                name: 'update_word_count',
                description: 'Update book word count',
                parameters: {
                    type: 'object',
                    required: ['book_id', 'actual_word_count'],
                    properties: {
                        book_id: { type: 'integer', description: 'Book ID' },
                        actual_word_count: { type: 'integer', description: 'Current word count' }
                    }
                }
            },
            {
                name: 'get_books_in_series',
                description: 'Get all books in a series',
                parameters: {
                    type: 'object',
                    required: ['series_id'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID' }
                    }
                }
            },
            {
                name: 'get_book',
                description: 'Get book by ID',
                parameters: {
                    type: 'object',
                    required: ['book_id'],
                    properties: {
                        book_id: { type: 'integer', description: 'Book ID' }
                    }
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'create_book': this.createBook.bind(this),
            'update_book_status': this.updateBookStatus.bind(this),
            'update_word_count': this.updateWordCount.bind(this),
            'get_books_in_series': this.getBooksInSeries.bind(this),
            'get_book': this.getBook.bind(this)
        };
        return handlers[toolName];
    }

    async createBook(args) {
        this.validateRequired(args, ['series_id', 'title', 'book_number']);
        const { series_id, title, book_number, target_word_count } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        // Check for duplicate book number in series
        const existingBook = await this.db.query(
            'SELECT 1 FROM books WHERE series_id = $1 AND book_number = $2',
            [series_id, book_number]
        );
        if (existingBook.rowCount > 0) {
            throw new Error(`Book number ${book_number} already exists in this series`);
        }

        const result = await this.db.query(
            `INSERT INTO books (series_id, title, book_number, target_word_count, status)
             VALUES ($1, $2, $3, $4, 'planned') RETURNING *`,
            [series_id, title, book_number, target_word_count]
        );

        return this.formatSuccess(result.rows[0], `Created book "${title}" with ID ${result.rows[0].book_id}`);
    }

    async updateBookStatus(args) {
        this.validateRequired(args, ['book_id', 'status']);
        const { book_id, status } = args;

        const validStatuses = ['planned', 'in_progress', 'draft', 'editing', 'published'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        const result = await this.db.query(
            'UPDATE books SET status = $1 WHERE book_id = $2 RETURNING *',
            [status, book_id]
        );

        if (result.rowCount === 0) {
            throw new Error(`Book with ID ${book_id} not found`);
        }

        return this.formatSuccess(result.rows[0], `Updated status of book ${book_id} to "${status}"`);
    }

    async updateWordCount(args) {
        this.validateRequired(args, ['book_id', 'actual_word_count']);
        const { book_id, actual_word_count } = args;

        if (actual_word_count < 0) {
            throw new Error('Word count cannot be negative');
        }

        const result = await this.db.query(
            'UPDATE books SET actual_word_count = $1 WHERE book_id = $2 RETURNING *',
            [actual_word_count, book_id]
        );

        if (result.rowCount === 0) {
            throw new Error(`Book with ID ${book_id} not found`);
        }

        return this.formatSuccess(result.rows[0], `Updated word count of book ${book_id} to ${actual_word_count}`);
    }

    async getBooksInSeries(args) {
        this.validateRequired(args, ['series_id']);
        const { series_id } = args;

        // Verify series exists
        await this.validateSeriesExists(series_id);

        const result = await this.db.query(
            'SELECT * FROM books WHERE series_id = $1 ORDER BY book_number',
            [series_id]
        );

        return this.formatSuccess(result.rows);
    }

    async getBook(args) {
        this.validateRequired(args, ['book_id']);
        const { book_id } = args;

        const result = await this.db.query(
            'SELECT * FROM books WHERE book_id = $1',
            [book_id]
        );

        if (result.rowCount === 0) {
            throw new Error(`Book with ID ${book_id} not found`);
        }

        return this.formatSuccess(result.rows[0]);
    }
}

// CLI support for direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
    import('../shared/cli-runner.js').then(({ runMCPServer }) => {
        const server = new BookMCPServer();
        runMCPServer(server, process.argv);
    });
}
