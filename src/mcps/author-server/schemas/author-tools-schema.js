// src/mcps/author-server/schemas/author-tools-schema.js
// Centralized tool schema definitions for the Author MCP Server
// Contains all tool definitions for author management

// =============================================
// AUTHOR MANAGEMENT TOOL SCHEMAS
// =============================================
export const authorToolsSchema = [
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

// =============================================
// COMBINED SCHEMA EXPORT FOR EASY USAGE
// =============================================
export const allAuthorServerTools = authorToolsSchema;

// =============================================
// UTILITY FUNCTIONS FOR SCHEMA VALIDATION
// =============================================
export function getToolSchema(toolName) {
    return allAuthorServerTools.find(tool => tool.name === toolName);
}

export function validateToolExists(toolName) {
    return allAuthorServerTools.some(tool => tool.name === toolName);
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