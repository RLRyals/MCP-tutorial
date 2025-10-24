// src/mcps/character-server/schemas/character-tools-schema.js
// Centralized tool schema definitions for the Character MCP Server
// Contains all tool definitions for character management, details, knowledge, and timeline tracking

// =============================================
// CHARACTER MANAGEMENT TOOL SCHEMAS
// =============================================
export const characterToolsSchema = [
    {
        name: 'list_characters',
        description: 'List all characters in a series with optional filtering',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                character_type: {
                    type: 'string',
                    enum: ['main', 'supporting', 'minor', 'antagonist'],
                    description: 'Filter by character type (optional)'
                },
                status: {
                    type: 'string',
                    enum: ['alive', 'dead', 'missing', 'unknown'],
                    description: 'Filter by character status (optional)'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'get_character',
        description: 'Get detailed information about a character',
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
        description: 'Create a new character in a series',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'ID of the series' },
                name: { type: 'string', description: 'Character\'s primary name' },
                full_name: { type: 'string', description: 'Character\'s full name (optional)' },
                aliases: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Alternative names/nicknames (optional)'
                },
                character_type: {
                    type: 'string',
                    enum: ['main', 'supporting', 'minor', 'antagonist'],
                    description: 'Character importance level'
                },
                first_appearance_book_id: { type: 'integer', description: 'Book where character first appears (optional)' },
                status: {
                    type: 'string',
                    enum: ['alive', 'dead', 'missing', 'unknown'],
                    description: 'Character\'s current status'
                }
            },
            required: ['series_id', 'name']
        }
    },
    {
        name: 'update_character',
        description: 'Update character information',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                name: { type: 'string', description: 'Character\'s primary name' },
                full_name: { type: 'string', description: 'Character\'s full name' },
                character_type: {
                    type: 'string',
                    enum: ['main', 'supporting', 'minor', 'antagonist'],
                    description: 'Character importance level'
                },
                status: {
                    type: 'string',
                    enum: ['alive', 'dead', 'missing', 'unknown'],
                    description: 'Character\'s current status'
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
        description: 'Add or update a character detail (physical trait, personality, background, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Detail category (e.g., \'physical\', \'personality\', \'background\', \'skills\')'
                },
                attribute: {
                    type: 'string',
                    description: 'Specific attribute (e.g., \'eye_color\', \'height\', \'temperament\')'
                },
                value: { type: 'string', description: 'The detail value' },
                source_book_id: { type: 'integer', description: 'Book where this detail was established (optional)' },
                confidence_level: {
                    type: 'string',
                    enum: ['established', 'mentioned', 'implied'],
                    description: 'How definitively this detail was stated'
                }
            },
            required: ['character_id', 'category', 'attribute', 'value']
        }
    },
    {
        name: 'get_character_details',
        description: 'Get all details for a character, optionally filtered by category',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Filter by detail category (optional)'
                }
            },
            required: ['character_id']
        }
    },
    {
        name: 'update_character_detail',
        description: 'Update an existing character detail',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Detail category (e.g., \'physical\', \'personality\', \'background\', \'skills\')'
                },
                attribute: {
                    type: 'string',
                    description: 'Specific attribute to update (e.g., \'eye_color\', \'height\', \'temperament\')'
                },
                value: { type: 'string', description: 'The new detail value' },
                source_book_id: { type: 'integer', description: 'Book where this detail was updated (optional)' },
                confidence_level: {
                    type: 'string',
                    enum: ['established', 'mentioned', 'implied'],
                    description: 'How definitively this detail was stated'
                }
            },
            required: ['character_id', 'category', 'attribute', 'value']
        }
    },
    {
        name: 'delete_character_detail',
        description: 'Delete a specific character detail',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                category: {
                    type: 'string',
                    description: 'Detail category (e.g., \'physical\', \'personality\', \'background\', \'skills\')'
                },
                attribute: {
                    type: 'string',
                    description: 'Specific attribute to delete (e.g., \'eye_color\', \'height\', \'temperament\')'
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
        description: 'Track what a character knows (prevents plot holes)',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                knowledge_category: {
                    type: 'string',
                    description: 'Type of knowledge (e.g., \'secret\', \'skill\', \'person\', \'location\', \'event\')'
                },
                knowledge_item: {
                    type: 'string',
                    description: 'What they know (e.g., \'vampire council exists\', \'Sarah is a witch\')'
                },
                knowledge_level: {
                    type: 'string',
                    enum: ['knows', 'suspects', 'unaware', 'forgot'],
                    description: 'How well they know this information'
                },
                learned_book_id: { type: 'integer', description: 'Book where they learned this (optional)' },
                learned_context: {
                    type: 'string',
                    description: 'How/when they learned this information (optional)'
                }
            },
            required: ['character_id', 'knowledge_category', 'knowledge_item']
        }
    },
    {
        name: 'add_character_knowledge_with_chapter',
        description: 'Add character knowledge with specific chapter reference',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                knowledge_category: {
                    type: 'string',
                    description: 'Type of knowledge (e.g., \'secret\', \'skill\', \'person\', \'location\', \'event\')'
                },
                knowledge_item: {
                    type: 'string',
                    description: 'What they know (e.g., \'vampire council exists\', \'Sarah is a witch\')'
                },
                knowledge_level: {
                    type: 'string',
                    enum: ['knows', 'suspects', 'unaware', 'forgot'],
                    description: 'How well they know this information',
                    default: 'knows'
                },
                learned_chapter_id: { type: 'integer', description: 'Chapter where they learned this' },
                learned_scene: { type: 'integer', description: 'Scene number where learned (optional)' },
                learned_context: {
                    type: 'string',
                    description: 'How/when they learned this information'
                }
            },
            required: ['character_id', 'knowledge_category', 'knowledge_item', 'learned_chapter_id']
        }
    },
    {
        name: 'check_character_knowledge',
        description: 'Check what a character knows about a specific topic',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                knowledge_item: {
                    type: 'string',
                    description: 'What to check (can be partial match)'
                },
                knowledge_category: {
                    type: 'string',
                    description: 'Filter by knowledge category (optional)'
                }
            },
            required: ['character_id']
        }
    },
    {
        name: 'get_characters_who_know',
        description: 'Find all characters who know about a specific thing',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                knowledge_item: {
                    type: 'string',
                    description: 'What to search for (partial match supported)'
                },
                knowledge_level: {
                    type: 'string',
                    enum: ['knows', 'suspects', 'unaware', 'forgot'],
                    description: 'Filter by knowledge level (optional)'
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
        description: 'Track a character\'s presence and state in a specific chapter',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                scene_id: { type: 'integer', description: 'Specific scene within chapter (optional)' },
                presence_type: {
                    type: 'string',
                    enum: ['present', 'mentioned', 'flashback', 'dream', 'phone_call'],
                    description: 'How the character appears in this chapter'
                },
                importance_level: {
                    type: 'string',
                    enum: ['major', 'minor', 'cameo', 'background'],
                    description: 'Character\'s importance in this chapter'
                },
                physical_state: { type: 'string', description: 'Physical condition (injured, disguised, etc.)' },
                emotional_state: { type: 'string', description: 'Emotional state (angry, suspicious, etc.)' },
                enters_at_scene: { type: 'integer', description: 'Scene number when they arrive' },
                exits_at_scene: { type: 'integer', description: 'Scene number when they leave' },
                learns_this_chapter: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'New information learned in this chapter'
                },
                reveals_this_chapter: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Secrets revealed in this chapter'
                },
                character_growth: { type: 'string', description: 'How the character changes in this chapter' }
            },
            required: ['character_id', 'chapter_id', 'presence_type']
        }
    },
    {
        name: 'get_character_timeline',
        description: 'Get a character\'s complete timeline across chapters showing their progression',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                book_id: { type: 'integer', description: 'Specific book (optional - shows all books if not provided)' },
                include_scenes: { type: 'boolean', description: 'Include scene-level details', default: false },
                include_knowledge: { type: 'boolean', description: 'Include knowledge gained per chapter', default: true },
                include_relationships: { type: 'boolean', description: 'Include relationship changes', default: false }
            },
            required: ['character_id']
        }
    },
    {
        name: 'check_character_continuity',
        description: 'Verify character consistency across chapter boundaries',
        inputSchema: {
            type: 'object',
            properties: {
                character_id: { type: 'integer', description: 'Character ID' },
                from_chapter_id: { type: 'integer', description: 'Starting chapter' },
                to_chapter_id: { type: 'integer', description: 'Ending chapter' },
                check_type: {
                    type: 'string',
                    enum: ['physical_state', 'emotional_state', 'knowledge', 'location', 'all'],
                    description: 'What type of continuity to check',
                    default: 'all'
                }
            },
            required: ['character_id', 'from_chapter_id', 'to_chapter_id']
        }
    },
    {
        name: 'get_characters_in_chapter',
        description: 'Get all characters present in a specific chapter with their roles and states',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: { type: 'integer', description: 'Chapter ID' },
                scene_number: { type: 'integer', description: 'Filter to specific scene within chapter (optional)' },
                presence_type: {
                    type: 'string',
                    enum: ['present', 'mentioned', 'flashback', 'dream', 'phone_call'],
                    description: 'Filter by presence type (optional)'
                },
                importance_level: {
                    type: 'string',
                    enum: ['major', 'minor', 'cameo', 'background'],
                    description: 'Filter by importance level (optional)'
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
