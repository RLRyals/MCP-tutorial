#!/usr/bin/env node
// scripts/list-authors.js
// List all authors from the database

import { query } from './db-connection.js';

/**
 * List all authors
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of results
 * @param {string} options.format - Output format (json|table|simple)
 */
async function listAuthors({ limit = 100, format = 'json' } = {}) {
    try {
        const sql = `
            SELECT
                author_id,
                name,
                pseudonym,
                bio,
                website,
                created_at
            FROM authors
            ORDER BY created_at DESC
            LIMIT $1
        `;

        const authors = await query(sql, [limit]);

        // Format output based on requested format
        if (format === 'json') {
            return JSON.stringify(authors, null, 2);
        } else if (format === 'table') {
            if (authors.length === 0) {
                return 'No authors found.';
            }

            // Simple table format
            let output = '\nAuthors:\n';
            output += '─'.repeat(80) + '\n';

            for (const author of authors) {
                output += `ID: ${author.author_id}\n`;
                output += `Name: ${author.name}\n`;
                if (author.pseudonym) {
                    output += `Pseudonym: ${author.pseudonym}\n`;
                }
                if (author.bio) {
                    output += `Bio: ${author.bio.substring(0, 100)}${author.bio.length > 100 ? '...' : ''}\n`;
                }
                if (author.website) {
                    output += `Website: ${author.website}\n`;
                }
                output += `Created: ${author.created_at}\n`;
                output += '─'.repeat(80) + '\n';
            }

            return output;
        } else if (format === 'simple') {
            if (authors.length === 0) {
                return 'No authors found.';
            }

            let output = `Found ${authors.length} author(s):\n\n`;
            for (const author of authors) {
                output += `[${author.author_id}] ${author.name}`;
                if (author.pseudonym) {
                    output += ` (${author.pseudonym})`;
                }
                output += '\n';
            }
            return output;
        }

    } catch (error) {
        return JSON.stringify({
            error: error.message,
            code: error.code
        }, null, 2);
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {
        limit: 100,
        format: 'simple'
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--limit' && args[i + 1]) {
            options.limit = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--format' && args[i + 1]) {
            options.format = args[i + 1];
            i++;
        } else if (args[i] === '--json') {
            options.format = 'json';
        } else if (args[i] === '--table') {
            options.format = 'table';
        }
    }

    const result = await listAuthors(options);
    console.log(result);
}

export { listAuthors };
export default listAuthors;
