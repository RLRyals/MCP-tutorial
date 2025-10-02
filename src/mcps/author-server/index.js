// src/mcps/author-server/index.js

// Protect stdout from debug logging in MCP stdio mode
if (process.env.MCP_STDIO_MODE === 'true') {
    const originalConsoleError = console.error;
    console.error = function() {
        // Keep the original console.error functionality but write to stderr instead
        process.stderr.write(Array.from(arguments).join(' ') + '\n');
    };
}

import { BaseMCPServer } from '../../shared/base-server.js';

class AuthorMCPServer extends BaseMCPServer {
    constructor() {
        console.error('[AUTHOR-SERVER] Constructor starting...');
        try {
            super('author-manager', '1.0.0');
            console.error('[AUTHOR-SERVER] Constructor completed successfully');
        } catch (error) {
            console.error('[AUTHOR-SERVER] Constructor failed:', error.message);
            console.error('[AUTHOR-SERVER] Stack:', error.stack);
            throw error;
        }
         // Initialize tools after base constructor
        this.tools = this.getTools();
    }

    getTools() {
        return [
            {
                name: 'list_authors',
                description: 'List all authors in the database',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            },
            {
                name: 'get_author',
                description: 'Get detailed information about a specific author',
                inputSchema: {
                    type: 'object',
                    properties: {
                        author_id: { type: 'integer', description: 'The ID of the author' }
                    },
                    required: ['author_id']
                }
            },
            {
                name: 'create_author',
                description: 'Create a new author',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Full name of the author' },
                        email: { type: 'string', description: 'Author\'s email address' },
                        bio: { type: 'string', description: 'Author biography' },
                        birth_year: { type: 'integer', description: 'Year of birth' }
                    },
                    required: ['name']
                }
            },
            {
                name: 'update_author',
                description: 'Update an existing author',
                inputSchema: {
                    type: 'object',
                    properties: {
                        author_id: { type: 'integer', description: 'The ID of the author to update' },
                        name: { type: 'string', description: 'Full name of the author' },
                        bio: { type: 'string', description: 'Author biography' },
                        birth_year: { type: 'integer', description: 'Year of birth' }
                    },
                    required: ['author_id']
                }
            }
        ];
    }

    getToolHandler(toolName) {
        const handlers = {
            'list_authors': this.handleListAuthors,
            'get_author': this.handleGetAuthor,
            'create_author': this.handleCreateAuthor,
            'update_author': this.handleUpdateAuthor
        };
        return handlers[toolName];
    }

    async handleListAuthors(args) {
        try {
            const query = 'SELECT * FROM authors ORDER BY name';
            const result = await this.db.query(query);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${result.rows.length} authors:\n\n` +
                              result.rows.map(author => 
                                  `ID: ${author.id}\n` +
                                  `Name: ${author.name}\n` +
                                  `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                                  `Bio: ${author.bio || 'No biography available'}\n`
                              ).join('\n---\n\n')
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to list authors: ${error.message}`);
        }
    }

    async handleGetAuthor(args) {
        try {
            const { author_id } = args;
            const query = 'SELECT * FROM authors WHERE id = $1';
            const result = await this.db.query(query, [author_id]);
            
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `No author found with ID: ${author_id}`
                        }
                    ]
                };
            }
            
            const author = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Author Details:\n\n` +
                              `ID: ${author.id}\n` +
                              `Name: ${author.name}\n` +
                              `Email: ${author.email}\n` +
                              `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                              `Bio: ${author.bio || 'No biography available'}\n` +
                              `Created: ${author.created_at}\n` +
                              `Updated: ${author.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to get author: ${error.message}`);
        }
    }

    async handleCreateAuthor(args) {
        try {
            const { name, email, bio, birth_year } = args;
            const query = `
                INSERT INTO authors (name, email, bio, birth_year) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *
            `;
            const result = await this.db.query(query, [
                name,
                email || null,
                bio || null,
                birth_year || null
            ]);
            const author = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Created author successfully!\n\n` +
                              `ID: ${author.id}\n` +
                              `Name: ${author.name}\n` +
                              `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                              `Bio: ${author.bio || 'No biography provided'}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to create author: ${error.message}`);
        }
    }

    async handleUpdateAuthor(args) {
        try {
            const { author_id, name, bio, birth_year } = args;
            
            // Build dynamic update query
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            if (name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(name);
            }
            if (bio !== undefined) {
                updates.push(`bio = $${paramCount++}`);
                values.push(bio);
            }
            if (birth_year !== undefined) {
                updates.push(`birth_year = $${paramCount++}`);
                values.push(birth_year);
            }
            
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(author_id);
            
            const query = `
                UPDATE authors 
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
                            text: `No author found with ID: ${author_id}`
                        }
                    ]
                };
            }
            
            const author = result.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Updated author successfully!\n\n` +
                              `ID: ${author.id}\n` +
                              `Name: ${author.name}\n` +
                              `Birth Year: ${author.birth_year || 'Unknown'}\n` +
                              `Bio: ${author.bio || 'No biography available'}\n` +
                              `Updated: ${author.updated_at}`
                    }
                ]
            };
        } catch (error) {
            throw new Error(`Failed to update author: ${error.message}`);
        }
    }
}

export { AuthorMCPServer };

// CLI runner when called directly (not when imported or run by MCP clients)
import { fileURLToPath } from 'url';

console.error('[AUTHOR-SERVER] Module loaded');
console.error('[AUTHOR-SERVER] MCP_STDIO_MODE:', process.env.MCP_STDIO_MODE);
console.error('[AUTHOR-SERVER] import.meta.url:', import.meta.url);
console.error('[AUTHOR-SERVER] process.argv[1]:', process.argv[1]);

// Convert paths to handle cross-platform differences
const currentModuleUrl = import.meta.url;
const scriptPath = process.argv[1];

// Function to normalize paths across platforms for more reliable comparison
const normalizePath = (path) => {
    if (!path) return '';
    
    // Replace backslashes with forward slashes for Windows
    let normalizedPath = path.replace(/\\/g, '/');
    
    // Add correct file:// protocol prefix based on platform
    if (!normalizedPath.startsWith('file:')) {
        if (process.platform === 'win32') {
            // Windows paths need triple slash: file:///C:/path
            normalizedPath = `file:///${normalizedPath}`;
        } else {
            // Mac/Linux paths need double slash: file:///Users/path
            normalizedPath = `file://${normalizedPath}`;
        }
    }
    
    // Fix any malformed protocol slashes (file:/ or file:// to file:///)
    normalizedPath = normalizedPath.replace(/^file:\/+/, 'file:///');
    
    return normalizedPath;
};

const normalizedScriptPath = normalizePath(scriptPath);
const normalizedCurrentModuleUrl = currentModuleUrl.replace(/\/{3,}/g, '///')
    .replace(/^file:\/([^\/])/, 'file:///$1'); // Ensure proper file:/// format

const isDirectExecution = normalizedCurrentModuleUrl === normalizedScriptPath || 
    decodeURIComponent(normalizedCurrentModuleUrl) === normalizedScriptPath;

console.error('[AUTHOR-SERVER] normalized current module url:', normalizedCurrentModuleUrl);
console.error('[AUTHOR-SERVER] normalized script path:', normalizedScriptPath);
console.error('[AUTHOR-SERVER] is direct execution:', isDirectExecution);

if (process.env.MCP_STDIO_MODE) {
    // When running in MCP stdio mode, always start the server
    console.error('[AUTHOR-SERVER] Running in MCP stdio mode - starting server...');
    try {
        const server = new AuthorMCPServer();
        await server.run();
    } catch (error) {
        console.error('[AUTHOR-SERVER] Failed to start MCP server:', error.message);
        console.error('[AUTHOR-SERVER] Stack:', error.stack);
        process.exit(1);
    }
} else if (isDirectExecution) {
    // When running directly as a CLI tool
    console.error('[AUTHOR-SERVER] Starting CLI runner...');
    try {
        const { CLIRunner } = await import('../../shared/cli-runner.js');
        const runner = new CLIRunner(AuthorMCPServer);
        await runner.run();
    } catch (error) {
        console.error('[AUTHOR-SERVER] CLI runner failed:', error.message);
        console.error('[AUTHOR-SERVER] CLI runner stack:', error.stack);
        throw error;
    }
} else {
    console.error('[AUTHOR-SERVER] Module imported - not starting server');
    console.error('[AUTHOR-SERVER] Module export completed');
}
