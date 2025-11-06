// src/mcps/author-server/schemas/author-tools-schema.js
// Centralized tool schema definitions for the Author MCP Server
// Contains all tool definitions for author management

// =============================================
// AUTHOR MANAGEMENT TOOL SCHEMAS
// =============================================
export const authorToolsSchema = [
    {
        name: 'list_authors',
        description: 'List all authors',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'get_author',
        description: 'Get author details',
        inputSchema: {
            type: 'object',
            properties: {
                author_id: { type: 'integer', description: 'Author ID' }
            },
            required: ['author_id']
        }
    },
    {
        name: 'create_author',
        description: 'Create author',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Author name' },
                email: { type: 'string', description: 'Email' },
                bio: { type: 'string', description: 'Bio' },
                birth_year: { type: 'integer', description: 'Birth year' }
            },
            required: ['name']
        }
    },
    {
        name: 'update_author',
        description: 'Update author',
        inputSchema: {
            type: 'object',
            properties: {
                author_id: { type: 'integer', description: 'Author ID' },
                name: { type: 'string', description: 'Author name' },
                bio: { type: 'string', description: 'Bio' },
                birth_year: { type: 'integer', description: 'Birth year' }
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