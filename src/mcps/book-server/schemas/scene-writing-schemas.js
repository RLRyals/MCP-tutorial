// src/mcps/book-server/schemas/scene-writing-schemas.js
// Schemas for SCENE WRITING PHASE - lightweight subset for active writing workflow
// Used by: config-mcps/scene-server

// =============================================
// SCENE WRITING PHASE SCHEMAS
// =============================================

export const sceneWritingSchemas = {
    create_scene: {
        name: 'create_scene',
        description: 'Create scene',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                scene_number: {
                    type: 'integer',
                    description: 'Scene # in chapter'
                },
                scene_title: {
                    type: 'string',
                    description: 'Title'
                },
                scene_purpose: {
                    type: 'string',
                    description: 'Purpose (use get_available_options w/ option_type="scene_purposes")'
                },
                scene_type: {
                    type: 'string',
                    description: 'Tone/genre (use get_available_options w/ option_type="scene_types")'
                },
                location: {
                    type: 'string',
                    description: 'Location'
                },
                time_of_day: {
                    type: 'string',
                    description: 'Time (morning, afternoon, night, etc.)'
                },
                duration: {
                    type: 'string',
                    description: 'Duration (5 minutes, 2 hours, etc.)'
                },
                summary: {
                    type: 'string',
                    description: 'Summary'
                },
                pov_character_id: {
                    type: 'integer',
                    description: 'POV character ID'
                },
                scene_participants: {
                    type: 'array',
                    items: { type: 'integer' },
                    description: 'Character IDs in scene'
                },
                writing_status: {
                    type: 'string',
                    default: 'planned',
                    description: 'Writing status (use get_available_options w/ option_type="writing_statuses")'
                },
                target_word_count: {
                    type: 'integer',
                    description: 'Target word count'
                },
                intensity_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Intensity (1=low, 10=max)'
                },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Element tags (tropes, themes, moods)'
                },
                notes: {
                    type: 'string',
                    description: 'Quick notes'
                },
                scene_outline: {
                    type: 'string',
                    description: 'Scene planning & structure'
                },
                scene_content: {
                    type: 'string',
                    description: 'Written content'
                },
                scene_revisions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Previous versions'
                }
            },
            required: ['chapter_id', 'scene_number']
        }
    },

    update_scene: {
        name: 'update_scene',
        description: 'Update scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'Scene ID'
                },
                scene_title: {
                    type: 'string',
                    description: 'Title'
                },
                scene_purpose: {
                    type: 'string',
                    description: 'Purpose (use get_available_options w/ option_type="scene_purposes")'
                },
                scene_type: {
                    type: 'string',
                    description: 'Tone/genre (use get_available_options w/ option_type="scene_types")'
                },
                location: {
                    type: 'string',
                    description: 'Location'
                },
                time_of_day: {
                    type: 'string',
                    description: 'Time of day'
                },
                duration: {
                    type: 'string',
                    description: 'Duration'
                },
                summary: {
                    type: 'string',
                    description: 'Summary'
                },
                word_count: {
                    type: 'integer',
                    description: 'Current word count'
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
                    description: 'Character IDs in scene'
                },
                writing_status: {
                    type: 'string',
                    description: 'Writing status (use get_available_options w/ option_type="writing_statuses")'
                },
                intensity_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Intensity (1=low, 10=max)'
                },
                scene_elements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Element tags (tropes, themes, moods)'
                },
                notes: {
                    type: 'string',
                    description: 'Quick notes'
                },
                scene_outline: {
                    type: 'string',
                    description: 'Scene planning & structure'
                },
                scene_content: {
                    type: 'string',
                    description: 'Written content'
                },
                scene_revisions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Previous versions'
                }
            },
            required: ['scene_id']
        }
    },

    get_scene: {
        name: 'get_scene',
        description: 'Get scene details',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'Scene ID'
                },
                include_characters: {
                    type: 'boolean',
                    default: false,
                    description: 'Include character details'
                }
            },
            required: ['scene_id']
        }
    },

    list_scenes: {
        name: 'list_scenes',
        description: 'List scenes',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                scene_type: {
                    type: 'string',
                    description: 'Scene type filter (use get_available_options w/ option_type="scene_types")'
                },
                writing_status: {
                    type: 'string',
                    description: 'Status filter (use get_available_options w/ option_type="writing_statuses")'
                },
                include_stats: {
                    type: 'boolean',
                    default: false,
                    description: 'Include stats'
                }
            },
            required: ['chapter_id']
        }
    },

    delete_scene: {
        name: 'delete_scene',
        description: 'Delete scene',
        inputSchema: {
            type: 'object',
            properties: {
                scene_id: {
                    type: 'integer',
                    description: 'Scene ID'
                },
                confirm_deletion: {
                    type: 'boolean',
                    description: 'Confirm (must be true)'
                }
            },
            required: ['scene_id', 'confirm_deletion']
        }
    },

    reorder_scenes: {
        name: 'reorder_scenes',
        description: 'Reorder scenes',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
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
                    description: 'Scene IDs w/ new numbers'
                }
            },
            required: ['chapter_id', 'scene_order']
        }
    },

    analyze_scene_flow: {
        name: 'analyze_scene_flow',
        description: 'Analyze scene flow & pacing',
        inputSchema: {
            type: 'object',
            properties: {
                chapter_id: {
                    type: 'integer',
                    description: 'Chapter ID'
                },
                include_suggestions: {
                    type: 'boolean',
                    default: true,
                    description: 'Include suggestions'
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
