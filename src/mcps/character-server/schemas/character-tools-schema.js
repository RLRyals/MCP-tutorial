// src/mcps/character-server/schemas/character-tools-schema.js
// Centralized tool schema definitions for the Character MCP Server
// Contains all tool definitions for character management, details, knowledge, and timeline tracking

// =============================================
// CHARACTER MANAGEMENT TOOL SCHEMAS
// =============================================
export const characterToolsSchema = [
    {
        name: 'list_characters',
        description: 'List characters in series',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                character_type: {
                    type: 'string',
                    enum: ['main', 'supporting', 'minor', 'antagonist'],
                    description: 'Type filter'
                },
                status: {
                    type: 'string',
                    enum: ['alive', 'dead', 'missing', 'unknown'],
                    description: 'Status filter'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'get_character',
        description: 'Get character details',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' }
            },
            required: ['character_id']
        }
    },
    {
        name: 'create_character',
        description: 'Create character',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                name: { type: 'string', description: 'Primary name' },
                full_name: { type: 'string', description: 'Full name' },
                aliases: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Alt names/nicknames'
                },
                character_type: {
                    type: 'string',
                    enum: ['main', 'supporting', 'minor', 'antagonist'],
                    description: 'Importance level'
                },
                first_appearance_book_id: { type: 'integer', description: 'First appearance book ID' },
                status: {
                    type: 'string',
                    enum: ['alive', 'dead', 'missing', 'unknown'],
                    description: 'Status'
                }
            },
            required: ['series_id', 'name']
        }
    },
    {
        name: 'update_character',
        description: 'Update character',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                name: { type: 'string', description: 'Primary name' },
                full_name: { type: 'string', description: 'Full name' },
                character_type: {
                    type: 'string',
                    enum: ['main', 'supporting', 'minor', 'antagonist'],
                    description: 'Importance level'
                },
                status: {
                    type: 'string',
                    enum: ['alive', 'dead', 'missing', 'unknown'],
                    description: 'Status'
                }
            },
            required: ['character_id']
        }
    }
];

// =============================================
// CHARACTER DETAILS TOOL SCHEMAS
// =============================================
export const characterDetailToolsSchema = [
    {
        name: 'add_character_detail',
        description: 'Add/update character detail',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Category (physical/personality/background/skills)'
                },
                attribute: {
                    type: 'string',
                    description: 'Attribute (eye_color/height/temperament)'
                },
                value: { type: 'string', description: 'Value' },
                source_book_id: { type: 'integer', description: 'Source book ID' },
                confidence_level: {
                    type: 'string',
                    enum: ['established', 'mentioned', 'implied'],
                    description: 'Confidence level'
                }
            },
            required: ['character_id', 'category', 'attribute', 'value']
        }
    },
    {
        name: 'get_character_details',
        description: 'Get character details',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Category filter'
                }
            },
            required: ['character_id']
        }
    },
    {
        name: 'update_character_detail',
        description: 'Update character detail',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Category (physical/personality/background/skills)'
                },
                attribute: {
                    type: 'string',
                    description: 'Attribute to update'
                },
                value: { type: 'string', description: 'New value' },
                source_book_id: { type: 'integer', description: 'Source book ID' },
                confidence_level: {
                    type: 'string',
                    enum: ['established', 'mentioned', 'implied'],
                    description: 'Confidence level'
                }
            },
            required: ['character_id', 'category', 'attribute', 'value']
        }
    },
    {
        name: 'delete_character_detail',
        description: 'Delete character detail',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Category'
                },
                attribute: {
                    type: 'string',
                    description: 'Attribute to delete'
                }
            },
            required: ['character_id', 'category', 'attribute']
        }
    }
];

// =============================================
// CHARACTER KNOWLEDGE TOOL SCHEMAS
// =============================================
export const characterKnowledgeToolsSchema = [
    {
        name: 'add_character_knowledge',
        description: 'Track character knowledge',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                knowledge_category: {
                    type: 'string',
                    description: 'Type (secret/skill/person/location/event)'
                },
                knowledge_item: {
                    type: 'string',
                    description: 'What they know'
                },
                knowledge_level: {
                    type: 'string',
                    enum: ['knows', 'suspects', 'unaware', 'forgot'],
                    description: 'Knowledge level'
                },
                learned_book_id: { type: 'integer', description: 'Book learned in' },
                learned_context: {
                    type: 'string',
                    description: 'How/when learned'
                }
            },
            required: ['character_id', 'knowledge_category', 'knowledge_item']
        }
    },
    {
        name: 'add_character_knowledge_with_chapter',
        description: 'Add knowledge w/ chapter ref',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                knowledge_category: {
                    type: 'string',
                    description: 'Type (secret/skill/person/location/event)'
                },
                knowledge_item: {
                    type: 'string',
                    description: 'What they know'
                },
                knowledge_level: {
                    type: 'string',
                    enum: ['knows', 'suspects', 'unaware', 'forgot'],
                    description: 'Knowledge level',
                    default: 'knows'
                },
                learned_chapter_id: { type: 'integer', description: 'Chapter learned in' },
                learned_scene: { type: 'integer', description: 'Scene number' },
                learned_context: {
                    type: 'string',
                    description: 'How/when learned'
                }
            },
            required: ['character_id', 'knowledge_category', 'knowledge_item', 'learned_chapter_id']
        }
    },
    {
        name: 'check_character_knowledge',
        description: 'Check character knowledge',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                knowledge_item: {
                    type: 'string',
                    description: 'Item to check (partial match)'
                },
                knowledge_category: {
                    type: 'string',
                    description: 'Category filter'
                }
            },
            required: ['character_id']
        }
    },
    {
        name: 'get_characters_who_know',
        description: 'Find who knows about something',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                knowledge_item: {
                    type: 'string',
                    description: 'Search term (partial match)'
                },
                knowledge_level: {
                    type: 'string',
                    enum: ['knows', 'suspects', 'unaware', 'forgot'],
                    description: 'Level filter'
                }
            },
            required: ['series_id', 'knowledge_item']
        }
    }
];

// =============================================
// CHARACTER TIMELINE & PRESENCE TOOL SCHEMAS
// =============================================
export const characterTimelineToolsSchema = [
    {
        name: 'track_character_presence',
        description: 'Track character in chapter',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                scene_id: { type: 'integer', description: 'Scene ID' },
                presence_type: {
                    type: 'string',
                    enum: ['present', 'mentioned', 'flashback', 'dream', 'phone_call'],
                    description: 'Presence type'
                },
                importance_level: {
                    type: 'string',
                    enum: ['major', 'minor', 'cameo', 'background'],
                    description: 'Importance'
                },
                physical_state: { type: 'string', description: 'Physical state' },
                emotional_state: { type: 'string', description: 'Emotional state' },
                enters_at_scene: { type: 'integer', description: 'Entry scene #' },
                exits_at_scene: { type: 'integer', description: 'Exit scene #' },
                learns_this_chapter: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Info learned'
                },
                reveals_this_chapter: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Secrets revealed'
                },
                character_growth: { type: 'string', description: 'Character changes' }
            },
            required: ['character_id', 'chapter_id', 'presence_type']
        }
    },
    {
        name: 'get_character_timeline',
        description: 'Get character timeline',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                book_id: { type: 'integer', description: 'Book ID' },
                include_scenes: { type: 'boolean', description: 'Include scenes', default: false },
                include_knowledge: { type: 'boolean', description: 'Include knowledge', default: true },
                include_relationships: { type: 'boolean', description: 'Include relationships', default: false }
            },
            required: ['character_id']
        }
    },
    {
        name: 'check_character_continuity',
        description: 'Check character continuity',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                from_chapter_id: { type: 'integer', description: 'Start chapter' },
                to_chapter_id: { type: 'integer', description: 'End chapter' },
                check_type: {
                    type: 'string',
                    enum: ['physical_state', 'emotional_state', 'knowledge', 'location', 'all'],
                    description: 'Check type',
                    default: 'all'
                }
            },
            required: ['character_id', 'from_chapter_id', 'to_chapter_id']
        }
    },
    {
        name: 'get_characters_in_chapter',
        description: 'Get chapter characters',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                scene_number: { type: 'integer', description: 'Scene # filter' },
                presence_type: {
                    type: 'string',
                    enum: ['present', 'mentioned', 'flashback', 'dream', 'phone_call'],
                    description: 'Presence filter'
                },
                importance_level: {
                    type: 'string',
                    enum: ['major', 'minor', 'cameo', 'background'],
                    description: 'Importance filter'
                }
            },
            required: ['chapter_id']
        }
    }
];

// =============================================
// COMBINED SCHEMA EXPORT FOR EASY USAGE
// =============================================
export const allCharacterServerTools = [
    ...characterToolsSchema,
    ...characterDetailToolsSchema,
    ...characterKnowledgeToolsSchema,
    ...characterTimelineToolsSchema
];

// =============================================
// TOOL CATEGORIES FOR ORGANIZATIONAL USE
// =============================================
export const toolCategories = {
    character_management: characterToolsSchema,
    character_details: characterDetailToolsSchema,
    character_knowledge: characterKnowledgeToolsSchema,
    character_timeline: characterTimelineToolsSchema
};

// =============================================
// UTILITY FUNCTIONS FOR SCHEMA VALIDATION
// =============================================
export function getToolSchema(toolName) {
    return allCharacterServerTools.find(tool => tool.name === toolName);
}

export function getToolsByCategory(category) {
    return toolCategories[category] || [];
}

export function validateToolExists(toolName) {
    return allCharacterServerTools.some(tool => tool.name === toolName);
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
