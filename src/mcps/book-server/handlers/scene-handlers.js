// src/mcps/book-server/handlers/scene-handlers.js
// Scene Management Handler - Scene CRUD operations within chapters
// Designed for AI Writing Teams to manage scene-level story beats and character interactions

export class SceneHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // SCENE TOOL DEFINITIONS
    // =============================================
    getSceneTools() {
        return [
            {
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
                        notes: { 
                            type: 'string', 
                            description: 'Author notes and reminders for this scene' 
                        }
                    },
                    required: ['chapter_id', 'scene_number']
                }
            },
            {
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
                        notes: { 
                            type: 'string', 
                            description: 'Scene notes' 
                        }
                    },
                    required: ['scene_id']
                }
            },
            {
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
            {
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
            {
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
            {
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
            {
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
        ];
    }

    // =============================================
    // SCENE MANAGEMENT HANDLERS
    // =============================================

    async handleCreateScene(args) {
        try {
            const { chapter_id, scene_number, scene_title, scene_purpose, scene_type, 
                    location, time_of_day, duration, summary, pov_character_id, 
                    scene_participants, writing_status = 'planned', target_word_count, 
                    intensity_level, scene_elements, implementation_notes, notes } = args;
            
            // Check if scene number already exists in this chapter
            const checkQuery = 'SELECT id FROM chapter_scenes WHERE chapter_id = $1 AND scene_number = $2';
            const checkResult = await this.db.query(checkQuery, [chapter_id, scene_number]);
            
            if (checkResult.rows.length > 0) {
                throw new Error(`Scene ${scene_number} already exists in this chapter`);
            }
            
            // Verify the chapter exists and get chapter info
            const chapterQuery = `
                SELECT c.id, c.title, c.chapter_number, b.title as book_title 
                FROM chapters c 
                JOIN books b ON c.book_id = b.id 
                WHERE c.id = $1
            `;
            const chapterResult = await this.db.query(chapterQuery, [chapter_id]);
            
            if (chapterResult.rows.length === 0) {
                throw new Error(`Chapter with ID ${chapter_id} not found`);
            }
            
            const query = `
                INSERT INTO chapter_scenes (
                    chapter_id, scene_number, scene_title, scene_purpose, scene_type,
                    location, time_of_day, duration, summary, pov_character_id,
                    scene_participants, writing_status, target_word_count, intensity_level,
                    scene_elements, implementation_notes, notes
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                chapter_id, scene_number, scene_title || null, scene_purpose || null,
                scene_type || null, location || null, time_of_day || null, 
                duration || null, summary || null, pov_character_id || null,
                scene_participants || [], writing_status, target_word_count || null,
                intensity_level || null, scene_elements || [], implementation_notes || null, notes || null
            ]);
            
            const scene = result.rows[0];
            const chapterInfo = chapterResult.rows[0];
            
            let responseText = `Created scene successfully!\n\n`;
            responseText += `Scene ID: ${scene.id}\n`;
            responseText += `Book: ${chapterInfo.book_title}\n`;
            responseText += `Chapter ${chapterInfo.chapter_number}${chapterInfo.title ? `: ${chapterInfo.title}` : ''}\n`;
            responseText += `Scene ${scene.scene_number}${scene.scene_title ? `: ${scene.scene_title}` : ''}\n`;
            responseText += `Status: ${scene.writing_status}\n`;
            
            if (scene.scene_purpose) {
                responseText += `Purpose: ${scene.scene_purpose}\n`;
            }
            if (scene.scene_type) {
                responseText += `Type: ${scene.scene_type}\n`;
            }
            if (scene.location) {
                responseText += `Location: ${scene.location}\n`;
            }
            if (scene.time_of_day) {
                responseText += `Time: ${scene.time_of_day}\n`;
            }
            if (scene.duration) {
                responseText += `Duration: ${scene.duration}\n`;
            }
            if (scene.target_word_count) {
                responseText += `Target Words: ${scene.target_word_count}\n`;
            }
            if (scene.intensity_level) {
                responseText += `Intensity Level: ${scene.intensity_level}/10\n`;
            }
            if (scene.scene_elements && scene.scene_elements.length > 0) {
                responseText += `Scene Elements: ${scene.scene_elements.join(', ')}\n`;
            }
            if (scene.implementation_notes) {
                responseText += `Implementation Notes: ${scene.implementation_notes}\n`;
            }
            if (scene.summary) {
                responseText += `Summary: ${scene.summary}\n`;
            }
            
            return {
                content: [{
                    type: 'text',
                    text: responseText
                }]
            };
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                if (error.detail?.includes('pov_character_id')) {
                    throw new Error('Invalid pov_character_id: Character not found');
                } else {
                    throw new Error('Invalid chapter_id: Chapter not found');
                }
            }
            throw new Error(`Failed to create scene: ${error.message}`);
        }
    }   

    async handleUpdateScene(args) {
        try {
            const { scene_id, ...updates } = args;
            
            // Build dynamic update query
            const updateFields = [];
            const params = [scene_id];
            let paramCount = 1;
            
            for (const [key, value] of Object.entries(updates)) {
                if (value !== undefined) {
                    paramCount++;
                    updateFields.push(`${key} = $${paramCount}`);
                    params.push(value);
                }
            }
            
            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }
            
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            
            const query = `
                UPDATE chapter_scenes 
                SET ${updateFields.join(', ')}
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No scene found with ID: ${scene_id}`
                    }]
                };
            }
            
            const scene = result.rows[0];
            
            // Get chapter and book info
            const contextQuery = `
                SELECT c.chapter_number, c.title as chapter_title, b.title as book_title
                FROM chapter_scenes s
                JOIN chapters c ON s.chapter_id = c.id
                JOIN books b ON c.book_id = b.id
                WHERE s.id = $1
            `;
            const contextResult = await this.db.query(contextQuery, [scene_id]);
            const context = contextResult.rows[0] || {};
            
            let responseText = `Updated scene successfully!\n\n`;
            responseText += `Scene ID: ${scene.id}\n`;
            if (context.book_title) {
                responseText += `Book: ${context.book_title}\n`;
                responseText += `Chapter ${context.chapter_number}${context.chapter_title ? `: ${context.chapter_title}` : ''}\n`;
            }
            responseText += `Scene ${scene.scene_number}${scene.scene_title ? `: ${scene.scene_title}` : ''}\n`;
            responseText += `Status: ${scene.writing_status}\n`;
            responseText += `Words: ${scene.word_count || 0}\n`;
            if (scene.target_word_count) {
                responseText += `Target: ${scene.target_word_count}\n`;
            }
            if (scene.intensity_level) {
                responseText += `Intensity Level: ${scene.intensity_level}/10\n`;
            }
            if (scene.scene_elements && scene.scene_elements.length > 0) {
                responseText += `Scene Elements: ${scene.scene_elements.join(', ')}\n`;
            }
            if (scene.implementation_notes) {
                responseText += `Implementation Notes: ${scene.implementation_notes}\n`;
            }
            responseText += `Updated: ${scene.updated_at}\n`;
            
            return {
                content: [{
                    type: 'text',
                    text: responseText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to update scene: ${error.message}`);
        }
    }
    
    async handleGetScene(args) {
        try {
            const { scene_id, include_characters = false } = args;
            
            const query = `
                SELECT s.*, c.chapter_number, c.title as chapter_title, 
                    b.title as book_title, ch.name as pov_character_name
                FROM chapter_scenes s
                JOIN chapters c ON s.chapter_id = c.id
                JOIN books b ON c.book_id = b.id
                LEFT JOIN characters ch ON s.pov_character_id = ch.id
                WHERE s.id = $1
            `;
            
            const result = await this.db.query(query, [scene_id]);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No scene found with ID: ${scene_id}`
                    }]
                };
            }
            
            const scene = result.rows[0];
            
            let sceneText = `Scene Details:\n\n`;
            sceneText += `Scene ID: ${scene.id}\n`;
            sceneText += `Book: ${scene.book_title}\n`;
            sceneText += `Chapter ${scene.chapter_number}${scene.chapter_title ? `: ${scene.chapter_title}` : ''}\n`;
            sceneText += `Scene ${scene.scene_number}${scene.scene_title ? `: ${scene.scene_title}` : ' (Untitled)'}\n`;
            
            if (scene.scene_purpose) {
                sceneText += `Purpose: ${scene.scene_purpose}\n`;
            }
            if (scene.scene_type) {
                sceneText += `Type: ${scene.scene_type}\n`;
            }
            
            sceneText += `Status: ${scene.writing_status}\n`;
            sceneText += `Word Count: ${scene.word_count || 0}\n`;
            
            if (scene.target_word_count) {
                const progress = scene.word_count ? Math.round((scene.word_count / scene.target_word_count) * 100) : 0;
                sceneText += `Target Words: ${scene.target_word_count} (${progress}% complete)\n`;
            }
            
            if (scene.location) {
                sceneText += `Location: ${scene.location}\n`;
            }
            if (scene.time_of_day) {
                sceneText += `Time: ${scene.time_of_day}\n`;
            }
            if (scene.duration) {
                sceneText += `Duration: ${scene.duration}\n`;
            }
            
            if (scene.intensity_level) {
                sceneText += `Intensity Level: ${scene.intensity_level}/10\n`;
            }
            
            if (scene.pov_character_name) {
                sceneText += `POV Character: ${scene.pov_character_name}\n`;
            }
            
            if (scene.scene_elements && scene.scene_elements.length > 0) {
                sceneText += `Scene Elements: ${scene.scene_elements.join(', ')}\n`;
            }
            
            if (scene.implementation_notes) {
                sceneText += `Implementation Notes: ${scene.implementation_notes}\n`;
            }
            
            if (scene.summary) {
                sceneText += `Summary: ${scene.summary}\n`;
            }
            
            if (scene.notes) {
                sceneText += `Notes: ${scene.notes}\n`;
            }
            
            sceneText += `Created: ${scene.created_at}\n`;
            sceneText += `Updated: ${scene.updated_at}\n`;

            if (include_characters && scene.scene_participants && scene.scene_participants.length > 0) {
                // Get character names for participants
                const participantQuery = `
                    SELECT id, name 
                    FROM characters 
                    WHERE id = ANY($1)
                    ORDER BY name
                `;
                const participantResult = await this.db.query(participantQuery, [scene.scene_participants]);
                
                if (participantResult.rows.length > 0) {
                    sceneText += `\nScene Participants (${participantResult.rows.length}):\n`;
                    participantResult.rows.forEach(char => {
                        sceneText += `  - ${char.name}\n`;
                    });
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: sceneText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get scene: ${error.message}`);
        }
    }
    
    async handleListScenes(args) {
        try {
            const { chapter_id, scene_type, writing_status, include_stats = false, 
                    intensity_filter, scene_elements } = args;
            
            let query = `
                SELECT s.*, ch.name as pov_character_name
                FROM chapter_scenes s
                LEFT JOIN characters ch ON s.pov_character_id = ch.id
                WHERE s.chapter_id = $1
            `;
            
            const params = [chapter_id];
            let paramCount = 1;
            
            if (scene_type) {
                paramCount++;
                query += ` AND s.scene_type = $${paramCount}`;
                params.push(scene_type);
            }
            
            if (writing_status) {
                paramCount++;
                query += ` AND s.writing_status = $${paramCount}`;
                params.push(writing_status);
            }
            
            if (intensity_filter) {
                if (intensity_filter.min_intensity) {
                    paramCount++;
                    query += ` AND s.intensity_level >= $${paramCount}`;
                    params.push(intensity_filter.min_intensity);
                }
                if (intensity_filter.max_intensity) {
                    paramCount++;
                    query += ` AND s.intensity_level <= $${paramCount}`;
                    params.push(intensity_filter.max_intensity);
                }
            }
            
            if (scene_elements && scene_elements.length > 0) {
                paramCount++;
                query += ` AND s.scene_elements && $${paramCount}`;
                params.push(scene_elements);
            }
            
            query += ' ORDER BY s.scene_number';
            
            const result = await this.db.query(query, params);
            
            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No scenes found for chapter ID: ${chapter_id}`
                    }]
                };
            }
            
            // Get chapter and book info
            const contextQuery = `
                SELECT c.chapter_number, c.title as chapter_title, b.title as book_title
                FROM chapters c 
                JOIN books b ON c.book_id = b.id 
                WHERE c.id = $1
            `;
            const contextResult = await this.db.query(contextQuery, [chapter_id]);
            const context = contextResult.rows[0] || {};
            
            let scenesText = `Scenes in ${context.book_title ? `"${context.book_title}" ` : ''}`;
            scenesText += `Chapter ${context.chapter_number}${context.chapter_title ? `: ${context.chapter_title}` : ''} `;
            scenesText += `(${result.rows.length} scenes):\n\n`;
            
            let totalWords = 0;
            let totalTargetWords = 0;
            let intensityStats = { min: 10, max: 0, total: 0, count: 0 };
            let allElements = new Set();
            
            result.rows.forEach(scene => {
                scenesText += `Scene ${scene.scene_number}${scene.scene_title ? `: ${scene.scene_title}` : ''}\n`;
                scenesText += `  Status: ${scene.writing_status}\n`;
                
                const words = scene.word_count || 0;
                totalWords += words;
                scenesText += `  Words: ${words}`;
                
                if (scene.target_word_count) {
                    totalTargetWords += scene.target_word_count;
                    const progress = words > 0 ? Math.round((words / scene.target_word_count) * 100) : 0;
                    scenesText += ` / ${scene.target_word_count} (${progress}%)`;
                }
                scenesText += `\n`;
                
                if (scene.scene_purpose) {
                    scenesText += `  Purpose: ${scene.scene_purpose}\n`;
                }
                if (scene.scene_type) {
                    scenesText += `  Type: ${scene.scene_type}\n`;
                }
                if (scene.location) {
                    scenesText += `  Location: ${scene.location}\n`;
                }
                
                if (scene.intensity_level) {
                    scenesText += `  Intensity: ${scene.intensity_level}/10\n`;
                    intensityStats.min = Math.min(intensityStats.min, scene.intensity_level);
                    intensityStats.max = Math.max(intensityStats.max, scene.intensity_level);
                    intensityStats.total += scene.intensity_level;
                    intensityStats.count++;
                }
                
                if (scene.pov_character_name) {
                    scenesText += `  POV: ${scene.pov_character_name}\n`;
                }
                
                if (scene.scene_elements && scene.scene_elements.length > 0) {
                    scenesText += `  Elements: ${scene.scene_elements.join(', ')}\n`;
                    scene.scene_elements.forEach(element => allElements.add(element));
                }
                
                if (scene.implementation_notes) {
                    const shortNotes = scene.implementation_notes.length > 60 
                        ? scene.implementation_notes.substring(0, 60) + '...' 
                        : scene.implementation_notes;
                    scenesText += `  Implementation: ${shortNotes}\n`;
                }
                
                if (scene.summary) {
                    const shortSummary = scene.summary.length > 80 
                        ? scene.summary.substring(0, 80) + '...' 
                        : scene.summary;
                    scenesText += `  Summary: ${shortSummary}\n`;
                }
                
                scenesText += `\n`;
            });
            
            if (include_stats) {
                scenesText += `Chapter Statistics:\n`;
                scenesText += `  Total Words: ${totalWords}\n`;
                if (totalTargetWords > 0) {
                    const overallProgress = Math.round((totalWords / totalTargetWords) * 100);
                    scenesText += `  Target Words: ${totalTargetWords}\n`;
                    scenesText += `  Progress: ${overallProgress}%\n`;
                }
                
                // Status breakdown
                const statusCounts = result.rows.reduce((counts, scene) => {
                    counts[scene.writing_status] = (counts[scene.writing_status] || 0) + 1;
                    return counts;
                }, {});
                
                scenesText += `  Status Breakdown: ${Object.entries(statusCounts).map(([status, count]) => `${status}: ${count}`).join(', ')}\n`;
                
                // Intensity statistics
                if (intensityStats.count > 0) {
                    const avgIntensity = Math.round(intensityStats.total / intensityStats.count * 10) / 10;
                    scenesText += `  Intensity Range: ${intensityStats.min} - ${intensityStats.max} (avg: ${avgIntensity})\n`;
                }
                
                // Element summary
                if (allElements.size > 0) {
                    scenesText += `  Scene Elements Used: ${Array.from(allElements).sort().join(', ')}\n`;
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: scenesText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to list scenes: ${error.message}`);
        }
    }

    async handleDeleteScene(args) {
        try {
            const { scene_id, confirm_deletion } = args;
            
            if (!confirm_deletion) {
                throw new Error('Must confirm deletion by setting confirm_deletion to true');
            }
            
            // Get scene info before deletion
            const sceneQuery = `
                SELECT s.scene_number, s.scene_title, c.chapter_number, 
                       c.title as chapter_title, b.title as book_title
                FROM chapter_scenes s
                JOIN chapters c ON s.chapter_id = c.id
                JOIN books b ON c.book_id = b.id
                WHERE s.scene_id = $1
            `;
            const sceneResult = await this.db.query(sceneQuery, [scene_id]);
            
            if (sceneResult.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No scene found with ID: ${scene_id}`
                    }]
                };
            }
            
            const sceneInfo = sceneResult.rows[0];
            
            // Delete the scene
            const deleteQuery = 'DELETE FROM chapter_scenes WHERE id = $1 RETURNING *';
            await this.db.query(deleteQuery, [scene_id]);
            
            return {
                content: [{
                    type: 'text',
                    text: `Successfully deleted Scene ${sceneInfo.scene_number}${sceneInfo.scene_title ? `: ${sceneInfo.scene_title}` : ''}\n` +
                          `Chapter ${sceneInfo.chapter_number}${sceneInfo.chapter_title ? `: ${sceneInfo.chapter_title}` : ''}\n` +
                          `Book: ${sceneInfo.book_title}\n\n` +
                          `⚠️ This action cannot be undone.`
                }]
            };
        } catch (error) {
            throw new Error(`Failed to delete scene: ${error.message}`);
        }
    }

    async handleReorderScenes(args) {
        try {
            const { chapter_id, scene_order } = args;
            
            // Start a transaction for atomic reordering
            return await this.db.transaction(async (client) => {
                // Verify all scenes belong to the specified chapter
                const sceneIds = scene_order.map(item => item.scene_id);
                const verifyQuery = `
                    SELECT scene_id FROM chapter_scenes 
                    WHERE chapter_id = $1 AND scene_id = ANY($2)
                `;
                const verifyResult = await client.query(verifyQuery, [chapter_id, sceneIds]);
                
                if (verifyResult.rows.length !== scene_order.length) {
                    throw new Error('One or more scenes do not belong to the specified chapter');
                }
                
                // Check for duplicate scene numbers
                const newNumbers = scene_order.map(item => item.new_scene_number);
                const uniqueNumbers = new Set(newNumbers);
                if (uniqueNumbers.size !== newNumbers.length) {
                    throw new Error('Duplicate scene numbers detected in reorder request');
                }
                
                // Update each scene's number
                const updates = [];
                for (const item of scene_order) {
                    const updateQuery = `
                        UPDATE chapter_scenes 
                        SET scene_number = $1, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = $2
                        RETURNING id, scene_number, scene_title
                    `;
                    const updateResult = await client.query(updateQuery, [item.new_scene_number, item.scene_id]);
                    updates.push(updateResult.rows[0]);
                }
                
                // Get chapter context for response
                const contextQuery = `
                    SELECT c.chapter_number, c.title as chapter_title, b.title as book_title
                    FROM chapters c 
                    JOIN books b ON c.book_id = b.id 
                    WHERE c.id = $1
                `;
                const contextResult = await client.query(contextQuery, [chapter_id]);
                const context = contextResult.rows[0] || {};
                
                let responseText = `Successfully reordered scenes in `;
                responseText += `Chapter ${context.chapter_number}${context.chapter_title ? `: ${context.chapter_title}` : ''}:\n\n`;
                
                updates.sort((a, b) => a.scene_number - b.scene_number);
                updates.forEach(scene => {
                    responseText += `Scene ${scene.scene_number}${scene.scene_title ? `: ${scene.scene_title}` : ''}\n`;
                });
                
                return {
                    content: [{
                        type: 'text',
                        text: responseText
                    }]
                };
            });
        } catch (error) {
            throw new Error(`Failed to reorder scenes: ${error.message}`);
        }
    }

    async handleAnalyzeSceneFlow(args) {
        try {
            const { chapter_id, analysis_type = 'intensity_flow', include_suggestions = true } = args;
            
            // Get all scenes in order
            const scenesQuery = `
                SELECT id, scene_number, scene_title, scene_purpose, scene_type,
                    location, time_of_day, duration, word_count, pov_character_id,
                    intensity_level, scene_elements, implementation_notes
                FROM chapter_scenes 
                WHERE chapter_id = $1 
                ORDER BY scene_number
            `;
            const scenesResult = await this.db.query(scenesQuery, [chapter_id]);
            
            if (scenesResult.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No scenes found for chapter ID: ${chapter_id}`
                    }]
                };
            }
            
            const scenes = scenesResult.rows;
            
            // Get chapter context
            const contextQuery = `
                SELECT c.chapter_number, c.title as chapter_title, b.title as book_title
                FROM chapters c 
                JOIN books b ON c.book_id = b.id 
                WHERE c.id = $1
            `;
            const contextResult = await this.db.query(contextQuery, [chapter_id]);
            const context = contextResult.rows[0] || {};
            
            let analysisText = `Scene Flow Analysis (${analysis_type}):\n`;
            analysisText += `${context.book_title ? `"${context.book_title}" ` : ''}`;
            analysisText += `Chapter ${context.chapter_number}${context.chapter_title ? `: ${context.chapter_title}` : ''}\n\n`;
            
            const issues = [];
            const observations = [];
            let totalWords = 0;
            
            // Check for scene number gaps
            for (let i = 0; i < scenes.length; i++) {
                const expectedNumber = i + 1;
                if (scenes[i].scene_number !== expectedNumber) {
                    issues.push(`Scene numbering gap: Expected scene ${expectedNumber}, found scene ${scenes[i].scene_number}`);
                }
                totalWords += scenes[i].word_count || 0;
            }
            
            // Analysis based on type
            if (analysis_type === 'intensity_flow') {
                const intensityLevels = scenes.map(s => s.intensity_level).filter(Boolean);
                if (intensityLevels.length > 0) {
                    analysisText += `Intensity Flow Analysis:\n`;
                    scenes.forEach((scene, index) => {
                        const intensity = scene.intensity_level || 'unset';
                        analysisText += `  Scene ${scene.scene_number}: ${intensity}${intensity !== 'unset' ? '/10' : ''}\n`;
                    });
                    analysisText += `\n`;
                    
                    // Analyze intensity patterns
                    if (intensityLevels.length >= 3) {
                        let rises = 0, falls = 0, plateaus = 0;
                        for (let i = 1; i < intensityLevels.length; i++) {
                            const diff = intensityLevels[i] - intensityLevels[i-1];
                            if (diff > 0) rises++;
                            else if (diff < 0) falls++;
                            else plateaus++;
                        }
                        
                        observations.push(`Intensity pattern: ${rises} rises, ${falls} falls, ${plateaus} plateaus`);
                        
                        // Check for dramatic intensity changes
                        for (let i = 1; i < intensityLevels.length; i++) {
                            const diff = Math.abs(intensityLevels[i] - intensityLevels[i-1]);
                            if (diff >= 5) {
                                observations.push(`Large intensity jump between scenes ${i} and ${i+1}: ${diff} points`);
                            }
                        }
                        
                        // Check for sustained high intensity
                        let highIntensityStreak = 0;
                        let maxStreak = 0;
                        intensityLevels.forEach(level => {
                            if (level >= 8) {
                                highIntensityStreak++;
                                maxStreak = Math.max(maxStreak, highIntensityStreak);
                            } else {
                                highIntensityStreak = 0;
                            }
                        });
                        if (maxStreak >= 3) {
                            observations.push(`Sustained high intensity: ${maxStreak} consecutive scenes at 8+ intensity`);
                        }
                    }
                } else {
                    analysisText += `Intensity Flow: No intensity levels set for scenes\n\n`;
                }
            }
            
            if (analysis_type === 'element_distribution') {
                const allElements = new Map();
                scenes.forEach(scene => {
                    if (scene.scene_elements && scene.scene_elements.length > 0) {
                        scene.scene_elements.forEach(element => {
                            allElements.set(element, (allElements.get(element) || 0) + 1);
                        });
                    }
                });
                
                analysisText += `Scene Elements Distribution:\n`;
                if (allElements.size > 0) {
                    Array.from(allElements.entries())
                        .sort((a, b) => b[1] - a[1])
                        .forEach(([element, count]) => {
                            analysisText += `  "${element}": ${count} scene(s)\n`;
                        });
                    analysisText += `\n`;
                    
                    // Check for element clustering
                    scenes.forEach((scene, index) => {
                        if (scene.scene_elements && scene.scene_elements.length > 3) {
                            observations.push(`Scene ${scene.scene_number} has many elements (${scene.scene_elements.length}): ${scene.scene_elements.join(', ')}`);
                        }
                    });
                } else {
                    analysisText += `  No scene elements defined\n\n`;
                }
            }
            
            if (analysis_type === 'character_presence') {
                const povCharacters = scenes.map(s => s.pov_character_id).filter(Boolean);
                const uniquePOVs = new Set(povCharacters);
                
                analysisText += `Character Presence Analysis:\n`;
                analysisText += `  POV characters used: ${uniquePOVs.size}\n`;
                
                if (uniquePOVs.size > 1) {
                    observations.push(`Multiple POV characters in chapter (${uniquePOVs.size} different)`);
                    
                    // Check for rapid POV switches
                    let switches = 0;
                    for (let i = 1; i < povCharacters.length; i++) {
                        if (povCharacters[i] !== povCharacters[i-1]) {
                            switches++;
                        }
                    }
                    if (switches > uniquePOVs.size) {
                        observations.push(`Frequent POV switches: ${switches} changes across ${scenes.length} scenes`);
                    }
                }
                analysisText += `\n`;
            }
            
            if (analysis_type === 'scene_balance') {
                // Analyze scene purposes for flow
                const purposes = scenes.map(s => s.scene_purpose).filter(Boolean);
                const purposeCounts = purposes.reduce((counts, purpose) => {
                    counts[purpose] = (counts[purpose] || 0) + 1;
                    return counts;
                }, {});
                
                analysisText += `Scene Balance Analysis:\n`;
                if (Object.keys(purposeCounts).length > 0) {
                    Object.entries(purposeCounts).forEach(([purpose, count]) => {
                        const percentage = Math.round((count / scenes.length) * 100);
                        analysisText += `  ${purpose}: ${count} scenes (${percentage}%)\n`;
                    });
                    analysisText += `\n`;
                    
                    // Check for balance issues
                    if (purposeCounts.exposition && purposeCounts.exposition > scenes.length * 0.4) {
                        observations.push(`Heavy exposition: ${purposeCounts.exposition} of ${scenes.length} scenes`);
                    }
                    if (purposeCounts.action && purposeCounts.action > scenes.length * 0.6) {
                        observations.push(`Action-heavy chapter: ${purposeCounts.action} of ${scenes.length} scenes`);
                    }
                    if (!purposeCounts.conflict && purposes.length > 2) {
                        observations.push(`No conflict scenes identified`);
                    }
                }
            }
            
            // Common analysis for all types
            
            // Check for location changes
            const locations = scenes.map(s => s.location).filter(Boolean);
            const uniqueLocations = new Set(locations);
            if (uniqueLocations.size > 1) {
                observations.push(`Multiple locations: ${Array.from(uniqueLocations).join(', ')}`);
            }
            
            // Analyze word count distribution
            const wordsPerScene = scenes.map(s => s.word_count || 0);
            const avgWords = totalWords / scenes.length;
            const minWords = Math.min(...wordsPerScene);
            const maxWords = Math.max(...wordsPerScene);
            
            analysisText += `Overview:\n`;
            analysisText += `- Total Scenes: ${scenes.length}\n`;
            analysisText += `- Total Words: ${totalWords}\n`;
            analysisText += `- Average Words per Scene: ${Math.round(avgWords)}\n`;
            analysisText += `- Word Range: ${minWords} - ${maxWords}\n`;
            analysisText += `- Locations Used: ${uniqueLocations.size}\n`;
            analysisText += `- POV Characters: ${new Set(scenes.map(s => s.pov_character_id).filter(Boolean)).size}\n\n`;
            
            if (issues.length > 0) {
                analysisText += `🚨 ISSUES FOUND:\n`;
                issues.forEach(issue => {
                    analysisText += `- ${issue}\n`;
                });
                analysisText += `\n`;
            }
            
            if (observations.length > 0) {
                analysisText += `📋 OBSERVATIONS:\n`;
                observations.forEach(obs => {
                    analysisText += `- ${obs}\n`;
                });
                analysisText += `\n`;
            }
            
            if (include_suggestions && scenes.length > 1) {
                analysisText += `💡 SUGGESTIONS:\n`;
                
                if (analysis_type === 'intensity_flow') {
                    const intensityLevels = scenes.map(s => s.intensity_level).filter(Boolean);
                    if (intensityLevels.length < scenes.length) {
                        analysisText += `- Set intensity levels for all scenes to better track pacing\n`;
                    }
                    if (intensityLevels.length > 0) {
                        const avgIntensity = intensityLevels.reduce((a, b) => a + b) / intensityLevels.length;
                        if (avgIntensity > 7) {
                            analysisText += `- Consider adding lower-intensity scenes for reader breathing room\n`;
                        }
                        if (avgIntensity < 4) {
                            analysisText += `- Consider increasing tension in some scenes to maintain engagement\n`;
                        }
                    }
                }
                
                // Scene pacing suggestions
                const wordVariance = wordsPerScene.reduce((sum, words) => sum + Math.pow(words - avgWords, 2), 0) / scenes.length;
                if (wordVariance > avgWords * 0.5) {
                    analysisText += `- Consider balancing scene lengths for better pacing\n`;
                }
                
                // Location suggestions
                if (uniqueLocations.size === scenes.length && scenes.length > 3) {
                    analysisText += `- Many location changes might fragment the chapter - consider consolidating\n`;
                }
                
                // POV suggestions
                const uniquePOVs = new Set(scenes.map(s => s.pov_character_id).filter(Boolean));
                if (uniquePOVs.size > 2) {
                    analysisText += `- Multiple POV switches within a chapter can confuse readers\n`;
                }
                
                if (analysisText.endsWith('💡 SUGGESTIONS:\n')) {
                    analysisText += `- Scene flow appears well-structured\n`;
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: analysisText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to analyze scene flow: ${error.message}`);
        }
    }

    // =============================================
// UTILITY METHODS FOR CROSS-COMPONENT USE
// =============================================

    async getScenesByChapterId(chapter_id) {
        try {
            const query = `
                SELECT * FROM chapter_scenes 
                WHERE chapter_id = $1 
                ORDER BY scene_number
            `;
            const result = await this.db.query(query, [chapter_id]);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get scenes by chapter ID: ${error.message}`);
        }
    }

    async getSceneById(scene_id) {
        try {
            const query = `
                SELECT s.*, c.chapter_number, c.title as chapter_title, b.title as book_title
                FROM chapter_scenes s
                JOIN chapters c ON s.chapter_id = c.id
                JOIN books b ON c.book_id = b.id
                WHERE s.id = $1
            `;
            const result = await this.db.query(query, [scene_id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to get scene by ID: ${error.message}`);
        }
    }

    async updateSceneWordCount(scene_id, new_word_count) {
        try {
            const query = `
                UPDATE chapter_scenes 
                SET word_count = $2, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 
                RETURNING word_count, chapter_id
            `;
            const result = await this.db.query(query, [scene_id, new_word_count]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Failed to update scene word count: ${error.message}`);
        }
    }

    async getTotalChapterWordCount(chapter_id) {
        try {
            const query = `
                SELECT COALESCE(SUM(word_count), 0) as total_words
                FROM chapter_scenes 
                WHERE chapter_id = $1
            `;
            const result = await this.db.query(query, [chapter_id]);
            return parseInt(result.rows[0]?.total_words) || 0;
        } catch (error) {
            throw new Error(`Failed to get total chapter word count: ${error.message}`);
        }
    }

    async getSceneParticipants(scene_id) {
        try {
            const query = `
                SELECT scene_participants 
                FROM chapter_scenes 
                WHERE id = $1
            `;
            const result = await this.db.query(query, [scene_id]);
            return result.rows[0]?.scene_participants || [];
        } catch (error) {
            throw new Error(`Failed to get scene participants: ${error.message}`);
        }
    }

    async getScenesByIntensityRange(chapter_id, min_intensity, max_intensity) {
        try {
            const query = `
                SELECT id, scene_number, scene_title, intensity_level, scene_elements
                FROM chapter_scenes 
                WHERE chapter_id = $1 
                AND intensity_level BETWEEN $2 AND $3
                ORDER BY scene_number
            `;
            const result = await this.db.query(query, [chapter_id, min_intensity, max_intensity]);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get scenes by intensity range: ${error.message}`);
        }
    }

    async getScenesByElements(chapter_id, elements) {
        try {
            const query = `
                SELECT id, scene_number, scene_title, scene_elements, implementation_notes
                FROM chapter_scenes 
                WHERE chapter_id = $1 
                AND scene_elements && $2
                ORDER BY scene_number
            `;
            const result = await this.db.query(query, [chapter_id, elements]);
            return result.rows;
        } catch (error) {
            throw new Error(`Failed to get scenes by elements: ${error.message}`);
        }
    }

    async updateSceneElements(scene_id, elements) {
        try {
            const query = `
                UPDATE chapter_scenes 
                SET scene_elements = $2, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 
                RETURNING scene_elements
            `;
            const result = await this.db.query(query, [scene_id, elements]);
            return result.rows[0]?.scene_elements || [];
        } catch (error) {
            throw new Error(`Failed to update scene elements: ${error.message}`);
        }
    }

    async getChapterIntensityProfile(chapter_id) {
        try {
            const query = `
                SELECT scene_number, scene_title, intensity_level
                FROM chapter_scenes 
                WHERE chapter_id = $1 
                AND intensity_level IS NOT NULL
                ORDER BY scene_number
            `;
            const result = await this.db.query(query, [chapter_id]);
            
            if (result.rows.length === 0) {
                return { scenes: [], stats: null };
            }
            
            const scenes = result.rows;
            const intensities = scenes.map(s => s.intensity_level);
            const stats = {
                min: Math.min(...intensities),
                max: Math.max(...intensities),
                average: Math.round((intensities.reduce((a, b) => a + b) / intensities.length) * 10) / 10,
                total_scenes: scenes.length
            };
            
            return { scenes, stats };
        } catch (error) {
            throw new Error(`Failed to get chapter intensity profile: ${error.message}`);
        }
    }

    async getElementUsageStats(chapter_id) {
        try {
            const query = `
                SELECT scene_elements
                FROM chapter_scenes 
                WHERE chapter_id = $1 
                AND scene_elements IS NOT NULL 
                AND array_length(scene_elements, 1) > 0
            `;
            const result = await this.db.query(query, [chapter_id]);
            
            const elementCounts = new Map();
            result.rows.forEach(row => {
                row.scene_elements.forEach(element => {
                    elementCounts.set(element, (elementCounts.get(element) || 0) + 1);
                });
            });
            
            return Array.from(elementCounts.entries())
                .map(([element, count]) => ({ element, count }))
                .sort((a, b) => b.count - a.count);
        } catch (error) {
            throw new Error(`Failed to get element usage stats: ${error.message}`);
        }
    }
}