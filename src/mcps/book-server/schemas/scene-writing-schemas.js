// src/mcps/book-server/schemas/scene-writing-schemas.js
// Schemas for SCENE WRITING PHASE - lightweight subset for active writing workflow
// Used by: config-mcps/scene-server

// =============================================
// SCENE WRITING PHASE SCHEMAS
// =============================================

export const sceneWritingSchemas = {
    create_scene: {
        name: 'create_scene',
        description: 'Create a new scene within a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter this scene belongs to'
                },
                scene_number: {
                    type: 'integer',
                    description: 'Scene number within the chapter'
                },
                scene_title: {
                    type: 'string',
                    description: 'Optional scene title or name'
                },
                scene_purpose: {
                    type: 'string',
                    enum: ['action', 'dialogue', 'description', 'transition', 'exposition', 'conflict', 'resolution'],
                    description: 'Primary purpose of this scene'
                },
                scene_type: {
                    type: 'string',
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Emotional tone or genre type of scene'
                },
                location: {
                    type: 'string',
                    description: 'Where this scene takes place'
                },
                time_of_day: {
                    type: 'string',
                    description: 'Time when scene occurs (morning, afternoon, night, etc.)'
                },
                duration: {
                    type: 'string',
                    description: 'How long this scene lasts (5 minutes, 2 hours, etc.)'
                },
                summary: {
                    type: 'string',
                    description: 'Brief summary of what happens in this scene'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'ID of the POV character for this scene'
                },
                scene_participants: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Array of character IDs present in this scene'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    default: 'planned',
                    description: 'Writing progress status for this scene'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count for this scene'
                },
                intensity_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Scene intensity for pacing (1=low, 10=maximum)'
                },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Tags for scene elements (e.g., tropes, kinks, themes, moods)'
                },
                notes: {
                    type: 'string',
                    description: 'Quick notes and reminders for this scene'
                },
                scene_outline: {
                    type: 'string',
                    description: 'Detailed scene planning, beat sheet, and structural notes'
                },
                scene_content: {
                    type: 'string',
                    description: 'The actual written content of the scene'
                },
                scene_revisions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of previous versions for tracking major revisions'
                }
            },
            required: ['chapter_id', 'scene_number']
        }
    },

    update_scene: {
        name: 'update_scene',
        description: 'Update an existing scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'ID of the scene to update'
                },
                scene_title: {
                    type: 'string',
                    description: 'Scene title'
                },
                scene_purpose: {
                    type: 'string',
                    enum: ['action', 'dialogue', 'description', 'transition', 'exposition', 'conflict', 'resolution'],
                    description: 'Primary purpose of this scene'
                },
                scene_type: {
                    type: 'string',
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Emotional tone or genre type of scene'
                },
                location: {
                    type: 'string',
                    description: 'Scene location'
                },
                time_of_day: {
                    type: 'string',
                    description: 'Time of day'
                },
                duration: {
                    type: 'string',
                    description: 'Scene duration'
                },
                summary: {
                    type: 'string',
                    description: 'Scene summary'
                },
                word_count: {
                    type: 'integer',
                    description: 'Current word count for this scene'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character ID'
                },
                scene_participants: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Character IDs present in scene'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Writing status'
                },
                intensity_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Scene intensity for pacing (1=low, 10=maximum)'
                },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Tags for scene elements (e.g., tropes, kinks, themes, moods)'
                },
                notes: {
                    type: 'string',
                    description: 'Quick scene notes'
                },
                scene_outline: {
                    type: 'string',
                    description: 'Detailed scene planning and structure'
                },
                scene_content: {
                    type: 'string',
                    description: 'The actual written content of the scene'
                },
                scene_revisions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of previous versions for tracking revisions'
                }
            },
            required: ['scene_id']
        }
    },

    get_scene: {
        name: 'get_scene',
        description: 'Get detailed information about a specific scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'ID of the scene'
                },
                include_characters: {
                    type: 'boolean',
                    default: false,
                    description: 'Include character participant details'
                }
            },
            required: ['scene_id']
        }
    },

    list_scenes: {
        name: 'list_scenes',
        description: 'List all scenes in a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter'
                },
                scene_type: {
                    type: 'string',
                    enum: ['dramatic', 'comedic', 'action', 'romance', 'mystery', 'horror', 'slice_of_life'],
                    description: 'Filter by scene type (optional)'
                },
                writing_status: {
                    type: 'string',
                    enum: ['planned', 'outlined', 'drafted', 'revised', 'final'],
                    description: 'Filter by writing status (optional)'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include word count statistics'
                }
            },
            required: ['chapter_id']
        }
    },

    delete_scene: {
        name: 'delete_scene',
        description: 'Delete a scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'ID of the scene to delete'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Must be true to confirm deletion'
                }
            },
            required: ['scene_id', 'confirm_deletion']
        }
    },

    reorder_scenes: {
        name: 'reorder_scenes',
        description: 'Reorder scenes within a chapter by updating scene numbers',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter'
                },
                scene_order: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            scene_id: { type: 'integer' },
                            new_scene_number: { type: 'integer' }
                        },
                        required: ['scene_id', 'new_scene_number']
                    },
                    description: 'Array of scene IDs and their new scene numbers'
                }
            },
            required: ['chapter_id', 'scene_order']
        }
    },

    analyze_scene_flow: {
        name: 'analyze_scene_flow',
        description: 'Analyze the flow and pacing between scenes in a chapter',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'ID of the chapter to analyze'
                },
                include_suggestions: {
                    type: 'boolean',
                    default: true,
                    description: 'Include improvement suggestions'
                }
            },
            required: ['chapter_id']
        }
    }
};

// Export as array for easy spreading
export const sceneWritingSchemaArray = Object.values(sceneWritingSchemas);

// Minimal schema for scene-writing server (only tools actually needed during writing)
export const minimalSceneWritingSchemas = {
    get_scene: sceneWritingSchemas.get_scene,
    list_scenes: sceneWritingSchemas.list_scenes,
    create_scene: sceneWritingSchemas.create_scene,
    update_scene: sceneWritingSchemas.update_scene
};

export const minimalSceneWritingSchemaArray = Object.values(minimalSceneWritingSchemas);
