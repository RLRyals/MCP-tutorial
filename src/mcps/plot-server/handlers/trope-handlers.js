/**
 * Trope Handlers for Plot Server MCP
 * 
 * Provides tools for tracking and managing narrative tropes across books and series.
 * Handles creation, tracking, and analysis of trope patterns and their implementation.
 */

export class TropeHandlers {
    /**
     * @param {Object} db - Database connection instance
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * Get all trope-related tools for the Plot MCP
     * @returns {Array} Array of tool definitions
     */
    getTropeTools() {
        return [
            {
                name: 'create_trope',
                description: 'Create a new trope definition with its scene types',
                inputSchema: {
                    type: 'object',
                    required: ['series_id', 'trope_name', 'trope_category', 'description'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID this trope belongs to' },
                        trope_name: { type: 'string', description: 'Name of the trope' },
                        trope_category: { type: 'string', description: 'Category of trope (romance_trope, character_trope, plot_trope, etc.)' },
                        description: { type: 'string', description: 'Detailed description of the trope' },
                        common_elements: { type: 'array', items: { type: 'string' }, description: 'Common elements that appear in this trope' },
                        typical_trajectory: { type: 'string', description: 'How this trope typically unfolds in a narrative' },
                        scene_types: { 
                            type: 'array', 
                            items: { 
                                type: 'object',
                                properties: {
                                    scene_function: { type: 'string', description: 'Function of this scene in the trope (opening, revelation, obstacle, etc.)' },
                                    scene_description: { type: 'string', description: 'Description of what happens in this scene type' },
                                    typical_placement: { type: 'string', description: 'Where this typically appears (early, middle, climax, resolution)' },
                                    required: { type: 'boolean', description: 'Whether this scene is essential to the trope' },
                                    narrative_purpose: { type: 'string', description: 'What this scene accomplishes in the narrative' },
                                    emotional_beats: { type: 'array', items: { type: 'string' }, description: 'Emotional responses this scene typically evokes' }
                                },
                                required: ['scene_function', 'scene_description']
                            },
                            description: 'Scene types that make up this trope'
                        }
                    }
                }
            },
            {
                name: 'get_trope',
                description: 'Get detailed information about a specific trope',
                inputSchema: {
                    type: 'object',
                    required: ['trope_id'],
                    properties: {
                        trope_id: { type: 'integer', description: 'ID of the trope to retrieve' },
                        include_scene_types: { type: 'boolean', description: 'Whether to include scene type details', default: true }
                    }
                }
            },
            {
                name: 'list_tropes',
                description: 'List all tropes, optionally filtered by series or category',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: { type: 'integer', description: 'Filter by series ID (optional)' },
                        trope_category: { type: 'string', description: 'Filter by trope category (optional)' }
                    }
                }
            },
            {
                name: 'create_trope_instance',
                description: 'Track a trope instance in a specific book',
                inputSchema: {
                    type: 'object',
                    required: ['trope_id', 'book_id'],
                    properties: {
                        trope_id: { type: 'integer', description: 'ID of the trope being used' },
                        book_id: { type: 'integer', description: 'ID of the book where the trope appears' },
                        instance_notes: { type: 'string', description: 'Notes on how this trope is used in this book' },
                        subversion_notes: { type: 'string', description: 'How this instance might subvert the typical trope pattern' },
                        completion_status: { 
                            type: 'string', 
                            enum: ['planned', 'in_progress', 'complete', 'subverted'],
                            description: 'Current status of this trope implementation',
                            default: 'in_progress'
                        }
                    }
                }
            },
            {
                name: 'get_trope_instance',
                description: 'Get details about a specific trope instance',
                inputSchema: {
                    type: 'object',
                    required: ['instance_id'],
                    properties: {
                        instance_id: { type: 'integer', description: 'ID of the trope instance' },
                        include_scenes: { type: 'boolean', description: 'Whether to include implemented scenes', default: true }
                    }
                }
            },
            {
                name: 'list_trope_instances',
                description: 'List all trope instances in a book',
                inputSchema: {
                    type: 'object',
                    required: ['book_id'],
                    properties: {
                        book_id: { type: 'integer', description: 'Book ID to list tropes for' },
                        status: { 
                            type: 'string', 
                            enum: ['planned', 'in_progress', 'complete', 'subverted'],
                            description: 'Filter by completion status (optional)'
                        }
                    }
                }
            },
            {
                name: 'implement_trope_scene',
                description: 'Implement a specific scene type for a trope instance',
                inputSchema: {
                    type: 'object',
                    required: ['instance_id', 'scene_type_id', 'chapter_id', 'scene_summary'],
                    properties: {
                        instance_id: { type: 'integer', description: 'ID of the trope instance' },
                        scene_type_id: { type: 'integer', description: 'ID of the scene type being implemented' },
                        chapter_id: { type: 'integer', description: 'Chapter where this scene appears' },
                        scene_number: { type: 'integer', description: 'Scene number within the chapter' },
                        scene_summary: { type: 'string', description: 'Summary of how this scene implements the trope' },
                        effectiveness_rating: { 
                            type: 'integer', 
                            minimum: 1,
                            maximum: 10,
                            description: 'Rating of how effectively this scene implements the trope (1-10)',
                            default: 7
                        },
                        variation_notes: { type: 'string', description: 'How this implementation varies from the typical pattern' }
                    }
                }
            },
            {
                name: 'get_trope_progress',
                description: 'Get implementation progress for all tropes in a book',
                inputSchema: {
                    type: 'object',
                    required: ['book_id'],
                    properties: {
                        book_id: { type: 'integer', description: 'Book ID to check' },
                        trope_id: { type: 'integer', description: 'Filter by specific trope (optional)' }
                    }
                }
            },
            {
                name: 'analyze_trope_patterns',
                description: 'Analyze trope usage patterns across a series',
                inputSchema: {
                    type: 'object',
                    required: ['series_id'],
                    properties: {
                        series_id: { type: 'integer', description: 'Series ID to analyze' },
                        analysis_type: { 
                            type: 'string', 
                            enum: ['frequency', 'subversion', 'effectiveness', 'all'],
                            description: 'Type of analysis to perform',
                            default: 'all'
                        }
                    }
                }
            }
        ];
    }

    /**
     * Create a new trope definition with its scene types
     * @param {Object} args - Function arguments
     * @returns {Object} Created trope information
     */
    async handleCreateTrope(args) {
        const { 
            series_id, 
            trope_name, 
            trope_category, 
            description, 
            common_elements, 
            typical_trajectory,
            scene_types 
        } = args;
        
        try {
            // Start a transaction
            await this.db.query('BEGIN');
            
            // First, create the trope
            const tropeResult = await this.db.query(
                `INSERT INTO tropes 
                 (series_id, trope_name, trope_category, description, common_elements, typical_trajectory) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING trope_id`,
                [
                    series_id, 
                    trope_name, 
                    trope_category, 
                    description, 
                    common_elements || [], 
                    typical_trajectory
                ]
            );
            
            const tropeId = tropeResult.rows[0].trope_id;
            
            // Then, create all the scene types for this trope
            if (scene_types && scene_types.length > 0) {
                for (const sceneType of scene_types) {
                    await this.db.query(
                        `INSERT INTO trope_scene_types
                         (trope_id, scene_function, scene_description, typical_placement, 
                          required, narrative_purpose, emotional_beats)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            tropeId, 
                            sceneType.scene_function, 
                            sceneType.scene_description,
                            sceneType.typical_placement || 'middle',
                            sceneType.required || false,
                            sceneType.narrative_purpose || null,
                            sceneType.emotional_beats || []
                        ]
                    );
                }
            }
            
            // Commit transaction
            await this.db.query('COMMIT');
            
            // Return formatted trope with its scene types
            return {
                trope_id: tropeId,
                trope_name,
                trope_category,
                description,
                scene_types: scene_types ? scene_types.length : 0,
                message: `Successfully created "${trope_name}" trope with ${scene_types ? scene_types.length : 0} scene types`
            };
        } 
        catch (error) {
            // Rollback transaction on error
            await this.db.query('ROLLBACK');
            throw new Error(`Failed to create trope: ${error.message}`);
        }
    }

    /**
     * Get detailed information about a specific trope
     * @param {Object} args - Function arguments
     * @returns {Object} Detailed trope information
     */
    async handleGetTrope(args) {
        const { trope_id, include_scene_types = true } = args;
        
        try {
            // Get the trope details
            const tropeResult = await this.db.query(
                `SELECT t.*, s.title as series_title
                 FROM tropes t
                 JOIN series s ON t.series_id = s.series_id
                 WHERE t.trope_id = $1`,
                [trope_id]
            );
            
            if (tropeResult.rows.length === 0) {
                throw new Error(`Trope with ID ${trope_id} not found`);
            }
            
            const trope = tropeResult.rows[0];
            
            // Get scene types if requested
            let sceneTypes = [];
            if (include_scene_types) {
                const sceneTypesResult = await this.db.query(
                    `SELECT * 
                     FROM trope_scene_types
                     WHERE trope_id = $1
                     ORDER BY 
                        CASE 
                            WHEN typical_placement = 'early' THEN 1
                            WHEN typical_placement = 'middle' THEN 2
                            WHEN typical_placement = 'climax' THEN 3
                            WHEN typical_placement = 'resolution' THEN 4
                            ELSE 5
                        END`,
                    [trope_id]
                );
                
                sceneTypes = sceneTypesResult.rows;
            }
            
            // Format the response
            return {
                trope_id: trope.trope_id,
                trope_name: trope.trope_name,
                trope_category: trope.trope_category,
                description: trope.description,
                series: {
                    series_id: trope.series_id,
                    title: trope.series_title
                },
                common_elements: trope.common_elements,
                typical_trajectory: trope.typical_trajectory,
                scene_types: sceneTypes.map(st => ({
                    scene_type_id: st.scene_type_id,
                    function: st.scene_function,
                    description: st.scene_description,
                    placement: st.typical_placement,
                    required: st.required,
                    narrative_purpose: st.narrative_purpose,
                    emotional_beats: st.emotional_beats
                })),
                created_at: trope.created_at,
                updated_at: trope.updated_at
            };
        } 
        catch (error) {
            throw new Error(`Failed to get trope: ${error.message}`);
        }
    }

    /**
     * List all tropes, optionally filtered by series or category
     * @param {Object} args - Function arguments
     * @returns {Array} List of tropes
     */
    async handleListTropes(args) {
        const { series_id, trope_category } = args;
        
        try {
            // Build query conditions based on parameters
            let conditions = [];
            let params = [];
            let paramCounter = 1;
            
            if (series_id) {
                conditions.push(`t.series_id = $${paramCounter}`);
                params.push(series_id);
                paramCounter++;
            }
            
            if (trope_category) {
                conditions.push(`t.trope_category = $${paramCounter}`);
                params.push(trope_category);
                paramCounter++;
            }
            
            const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
            
            // Execute the query
            const result = await this.db.query(
                `SELECT t.*, s.title as series_title,
                 (SELECT COUNT(*) FROM trope_scene_types WHERE trope_id = t.trope_id) as scene_type_count,
                 (SELECT COUNT(*) FROM trope_instances WHERE trope_id = t.trope_id) as usage_count
                 FROM tropes t
                 JOIN series s ON t.series_id = s.series_id
                 ${whereClause}
                 ORDER BY t.trope_name`,
                params
            );
            
            // Format the response
            return result.rows.map(trope => ({
                trope_id: trope.trope_id,
                trope_name: trope.trope_name,
                trope_category: trope.trope_category,
                description: trope.description,
                series: {
                    series_id: trope.series_id,
                    title: trope.series_title
                },
                scene_type_count: parseInt(trope.scene_type_count),
                usage_count: parseInt(trope.usage_count),
                created_at: trope.created_at
            }));
        } 
        catch (error) {
            throw new Error(`Failed to list tropes: ${error.message}`);
        }
    }

    /**
     * Create a trope instance in a specific book
     * @param {Object} args - Function arguments
     * @returns {Object} Created trope instance information
     */
    async handleCreateTropeInstance(args) {
        const { 
            trope_id, 
            book_id, 
            instance_notes, 
            subversion_notes, 
            completion_status = 'in_progress' 
        } = args;
        
        try {
            // Validate that trope and book exist
            const validation = await this.db.query(
                `SELECT t.trope_name, b.title as book_title
                 FROM tropes t, books b
                 WHERE t.trope_id = $1 AND b.book_id = $2`,
                [trope_id, book_id]
            );
            
            if (validation.rows.length === 0) {
                throw new Error('Invalid trope_id or book_id');
            }
            
            // Create the trope instance
            const instanceResult = await this.db.query(
                `INSERT INTO trope_instances
                 (trope_id, book_id, instance_notes, subversion_notes, completion_status)
                 VALUES ($1, $2, $3, $4, $5) RETURNING instance_id`,
                [trope_id, book_id, instance_notes, subversion_notes, completion_status]
            );
            
            const instanceId = instanceResult.rows[0].instance_id;
            
            // Get the trope details for the response
            const tropeInfo = validation.rows[0];
            
            // Get scene types that need to be implemented
            const sceneTypesResult = await this.db.query(
                `SELECT scene_type_id, scene_function, scene_description, required
                 FROM trope_scene_types
                 WHERE trope_id = $1
                 ORDER BY 
                    CASE 
                        WHEN typical_placement = 'early' THEN 1
                        WHEN typical_placement = 'middle' THEN 2
                        WHEN typical_placement = 'climax' THEN 3
                        WHEN typical_placement = 'resolution' THEN 4
                        ELSE 5
                    END`,
                [trope_id]
            );
            
            // Format and return the response
            return {
                instance_id: instanceId,
                trope_name: tropeInfo.trope_name,
                book_title: tropeInfo.book_title,
                status: completion_status,
                message: `Created instance of "${tropeInfo.trope_name}" in "${tropeInfo.book_title}"`,
                required_scenes: sceneTypesResult.rows
                    .filter(st => st.required)
                    .map(st => ({
                        scene_function: st.scene_function,
                        scene_description: st.scene_description,
                        scene_type_id: st.scene_type_id,
                        implemented: false
                    })),
                optional_scenes: sceneTypesResult.rows
                    .filter(st => !st.required)
                    .map(st => ({
                        scene_function: st.scene_function,
                        scene_description: st.scene_description,
                        scene_type_id: st.scene_type_id,
                        implemented: false
                    }))
            };
        } 
        catch (error) {
            throw new Error(`Failed to create trope instance: ${error.message}`);
        }
    }

    /**
     * Get details about a specific trope instance
     * @param {Object} args - Function arguments
     * @returns {Object} Detailed trope instance information
     */
    async handleGetTropeInstance(args) {
        const { instance_id, include_scenes = true } = args;
        
        try {
            // Get the instance details
            const instanceResult = await this.db.query(
                `SELECT i.*, t.trope_name, t.trope_category, b.title as book_title
                 FROM trope_instances i
                 JOIN tropes t ON i.trope_id = t.trope_id
                 JOIN books b ON i.book_id = b.book_id
                 WHERE i.instance_id = $1`,
                [instance_id]
            );
            
            if (instanceResult.rows.length === 0) {
                throw new Error(`Trope instance with ID ${instance_id} not found`);
            }
            
            const instance = instanceResult.rows[0];
            
            // Get all scene types for this trope
            const sceneTypesResult = await this.db.query(
                `SELECT st.*
                 FROM trope_scene_types st
                 WHERE st.trope_id = $1
                 ORDER BY 
                    CASE 
                        WHEN typical_placement = 'early' THEN 1
                        WHEN typical_placement = 'middle' THEN 2
                        WHEN typical_placement = 'climax' THEN 3
                        WHEN typical_placement = 'resolution' THEN 4
                        ELSE 5
                    END`,
                [instance.trope_id]
            );
            
            // Get implemented scenes if requested
            let implementedScenes = [];
            if (include_scenes) {
                const scenesResult = await this.db.query(
                    `SELECT ts.*, st.scene_function, st.scene_description, st.required, st.typical_placement
                     FROM trope_scenes ts
                     JOIN trope_scene_types st ON ts.scene_type_id = st.scene_type_id
                     WHERE ts.instance_id = $1`,
                    [instance_id]
                );
                
                implementedScenes = scenesResult.rows;
            }
            
            // Map scene types to their implementation status
            const implementedSceneIds = new Set(implementedScenes.map(s => s.scene_type_id));
            
            const sceneTypes = sceneTypesResult.rows.map(st => {
                const isImplemented = implementedSceneIds.has(st.scene_type_id);
                const implementedScene = isImplemented 
                    ? implementedScenes.find(s => s.scene_type_id === st.scene_type_id)
                    : null;
                
                return {
                    scene_type_id: st.scene_type_id,
                    function: st.scene_function,
                    description: st.scene_description,
                    placement: st.typical_placement,
                    required: st.required,
                    implemented: isImplemented,
                    implementation: implementedScene ? {
                        chapter_id: implementedScene.chapter_id,
                        scene_number: implementedScene.scene_number,
                        summary: implementedScene.scene_summary,
                        effectiveness: implementedScene.effectiveness_rating,
                        variation_notes: implementedScene.variation_notes
                    } : null
                };
            });
            
            // Calculate progress statistics
            const requiredScenes = sceneTypes.filter(st => st.required);
            const implementedRequiredScenes = requiredScenes.filter(st => st.implemented);
            const optionalScenes = sceneTypes.filter(st => !st.required);
            const implementedOptionalScenes = optionalScenes.filter(st => st.implemented);
            
            const progress = {
                required: `${implementedRequiredScenes.length}/${requiredScenes.length}`,
                optional: `${implementedOptionalScenes.length}/${optionalScenes.length}`,
                percentage: requiredScenes.length > 0 
                    ? Math.round((implementedRequiredScenes.length / requiredScenes.length) * 100)
                    : 100
            };
            
            // Format the response
            return {
                instance_id: instance.instance_id,
                trope: {
                    trope_id: instance.trope_id,
                    name: instance.trope_name,
                    category: instance.trope_category
                },
                book: {
                    book_id: instance.book_id,
                    title: instance.book_title
                },
                status: instance.completion_status,
                progress,
                notes: instance.instance_notes,
                subversion_notes: instance.subversion_notes,
                scenes: sceneTypes,
                created_at: instance.created_at,
                updated_at: instance.updated_at
            };
        } 
        catch (error) {
            throw new Error(`Failed to get trope instance: ${error.message}`);
        }
    }

    /**
     * List all trope instances in a book
     * @param {Object} args - Function arguments
     * @returns {Array} List of trope instances
     */
    async handleListTropeInstances(args) {
        const { book_id, status } = args;
        
        try {
            // Build query conditions based on parameters
            let conditions = ['i.book_id = $1'];
            let params = [book_id];
            let paramCounter = 2;
            
            if (status) {
                conditions.push(`i.completion_status = $${paramCounter}`);
                params.push(status);
                paramCounter++;
            }
            
            const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
            
            // Get trope instances with basic implementation stats
            const query = `
                WITH scene_counts AS (
                    SELECT 
                        i.instance_id,
                        COUNT(DISTINCT st.scene_type_id) FILTER (WHERE st.required = true) AS required_total,
                        COUNT(DISTINCT ts.scene_type_id) FILTER (WHERE st.required = true) AS required_implemented,
                        COUNT(DISTINCT st.scene_type_id) FILTER (WHERE st.required = false) AS optional_total,
                        COUNT(DISTINCT ts.scene_type_id) FILTER (WHERE st.required = false) AS optional_implemented
                    FROM 
                        trope_instances i
                        JOIN tropes t ON i.trope_id = t.trope_id
                        JOIN trope_scene_types st ON t.trope_id = st.trope_id
                        LEFT JOIN trope_scenes ts ON ts.instance_id = i.instance_id AND ts.scene_type_id = st.scene_type_id
                    WHERE i.book_id = $1
                    GROUP BY i.instance_id
                )
                SELECT 
                    i.instance_id,
                    i.trope_id,
                    t.trope_name,
                    t.trope_category,
                    i.instance_notes,
                    i.subversion_notes,
                    i.completion_status,
                    sc.required_total,
                    sc.required_implemented,
                    sc.optional_total,
                    sc.optional_implemented,
                    i.created_at,
                    i.updated_at
                FROM 
                    trope_instances i
                    JOIN tropes t ON i.trope_id = t.trope_id
                    JOIN scene_counts sc ON i.instance_id = sc.instance_id
                ${whereClause}
                ORDER BY t.trope_name`;
            
            const result = await this.db.query(query, params);
            
            // Get book title for the response
            const bookResult = await this.db.query(
                'SELECT title FROM books WHERE book_id = $1',
                [book_id]
            );
            
            if (bookResult.rows.length === 0) {
                throw new Error(`Book with ID ${book_id} not found`);
            }
            
            // Format the response
            return {
                book_id,
                book_title: bookResult.rows[0].title,
                trope_count: result.rows.length,
                tropes: result.rows.map(row => ({
                    instance_id: row.instance_id,
                    trope_id: row.trope_id,
                    trope_name: row.trope_name,
                    trope_category: row.trope_category,
                    status: row.completion_status,
                    progress: {
                        required: `${row.required_implemented}/${row.required_total}`,
                        optional: `${row.optional_implemented}/${row.optional_total}`,
                        percentage: row.required_total > 0
                            ? Math.round((row.required_implemented / row.required_total) * 100)
                            : 100
                    },
                    notes: row.instance_notes,
                    subversion_notes: row.subversion_notes,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }))
            };
        } 
        catch (error) {
            throw new Error(`Failed to list trope instances: ${error.message}`);
        }
    }

    /**
     * Implement a specific scene type for a trope instance
     * @param {Object} args - Function arguments
     * @returns {Object} Result of the implementation
     */
    async handleImplementTropeScene(args) {
        const { 
            instance_id, 
            scene_type_id, 
            chapter_id, 
            scene_number, 
            scene_summary, 
            effectiveness_rating = 7,
            variation_notes 
        } = args;
        
        try {
            // Validate that the instance and scene type exist and match
            const validationResult = await this.db.query(
                `SELECT i.instance_id, i.trope_id, st.scene_type_id, st.scene_function, 
                        t.trope_name, b.title as book_title
                 FROM trope_instances i
                 JOIN tropes t ON i.trope_id = t.trope_id
                 JOIN books b ON i.book_id = b.book_id
                 JOIN trope_scene_types st ON t.trope_id = st.trope_id
                 WHERE i.instance_id = $1 AND st.scene_type_id = $2`,
                [instance_id, scene_type_id]
            );
            
            if (validationResult.rows.length === 0) {
                throw new Error('Invalid instance_id or scene_type_id, or they do not match');
            }
            
            const sceneInfo = validationResult.rows[0];
            
            // Insert or update the trope scene implementation
            await this.db.query(
                `INSERT INTO trope_scenes
                 (instance_id, scene_type_id, chapter_id, scene_number, 
                  scene_summary, effectiveness_rating, variation_notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (instance_id, scene_type_id) 
                 DO UPDATE SET 
                    chapter_id = $3,
                    scene_number = $4,
                    scene_summary = $5,
                    effectiveness_rating = $6,
                    variation_notes = $7`,
                [
                    instance_id, 
                    scene_type_id, 
                    chapter_id, 
                    scene_number,
                    scene_summary, 
                    effectiveness_rating, 
                    variation_notes
                ]
            );
            
            // Check if all required scenes are implemented
            const implementationStatusResult = await this.db.query(
                `WITH required_scenes AS (
                    SELECT st.scene_type_id
                    FROM trope_scene_types st
                    JOIN tropes t ON st.trope_id = t.trope_id
                    WHERE t.trope_id = (SELECT trope_id FROM trope_instances WHERE instance_id = $1)
                ), implemented_scenes AS (
                    SELECT scene_type_id
                    FROM trope_scenes
                    WHERE instance_id = $1
                )
                SELECT 
                    (SELECT COUNT(*) FROM required_scenes) AS total_required,
                    (SELECT COUNT(*) FROM implemented_scenes) AS implemented,
                    (SELECT COUNT(*) FROM required_scenes r WHERE EXISTS 
                        (SELECT 1 FROM implemented_scenes i WHERE i.scene_type_id = r.scene_type_id)
                    ) AS matched`,
                [instance_id]
            );
            
            const status = implementationStatusResult.rows[0];
            const completionPercentage = Math.round((status.matched / status.total_required) * 100);
            
            // Get the latest implemented scene details
            const sceneDetailsResult = await this.db.query(
                `SELECT ts.*, tst.scene_function, tst.scene_description
                 FROM trope_scenes ts
                 JOIN trope_scene_types tst ON ts.scene_type_id = tst.scene_type_id
                 WHERE ts.instance_id = $1 AND ts.scene_type_id = $2`,
                [instance_id, scene_type_id]
            );
            
            const sceneDetails = sceneDetailsResult.rows[0];
            
            // Format and return the response
            return {
                content: [
                    {
                        type: 'text',
                        text: `# Trope Scene Implemented\n\n` +
                              `**Trope:** ${sceneInfo.trope_name}\n` +
                              `**Book:** ${sceneInfo.book_title}\n` +
                              `**Scene Function:** ${sceneInfo.scene_function}\n\n` +
                              `### Implementation Details\n` +
                              `- **Chapter:** ${chapter_id ? chapter_id : 'Not specified'}\n` +
                              `- **Scene Number:** ${scene_number ? scene_number : 'Not specified'}\n` +
                              `- **Effectiveness Rating:** ${effectiveness_rating}/10\n` +
                              `${variation_notes ? `- **Variation Notes:** ${variation_notes}\n` : ''}` +
                              `\n### Scene Summary\n${scene_summary}\n\n` +
                              `### Implementation Status\n` +
                              `- **Completion:** ${completionPercentage}% (${status.matched}/${status.total_required} scenes implemented)\n` +
                              `- **Status:** ${completionPercentage === 100 ? '✅ Complete' : '⏳ In Progress'}`
                    }
                ],
                status: 'success',
                implementationStatus: {
                    totalScenes: status.total_required,
                    implementedScenes: status.matched,
                    completionPercentage: completionPercentage
                }
            };
            
        } catch (error) {
            throw new Error(`Failed to implement trope scene: ${error.message}`);
        }
    }

    /**
     * Get implementation progress for all tropes in a book
     * @param {Object} args - Function arguments
     * @returns {Object} Progress information for tropes in the book
     */
    async handleGetTropeProgress(args) {
        const { book_id, trope_id } = args;
        
        try {
            // Validate book exists
            const bookResult = await this.db.query(
                'SELECT title FROM books WHERE book_id = $1',
                [book_id]
            );
            
            if (bookResult.rows.length === 0) {
                throw new Error(`Book with ID ${book_id} not found`);
            }
            
            const bookTitle = bookResult.rows[0].title;
            
            // Build query conditions
            const conditions = ['i.book_id = $1'];
            const params = [book_id];
            
            if (trope_id) {
                conditions.push('i.trope_id = $2');
                params.push(trope_id);
            }
            
            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            
            // Get progress for all trope instances in the book
            const query = `
                WITH scene_requirements AS (
                    SELECT 
                        i.instance_id,
                        COUNT(CASE WHEN st.required = TRUE THEN 1 END) AS required_scenes,
                        COUNT(CASE WHEN st.required = FALSE THEN 1 END) AS optional_scenes
                    FROM 
                        trope_instances i
                        JOIN tropes t ON i.trope_id = t.trope_id
                        JOIN trope_scene_types st ON t.trope_id = st.trope_id
                    ${whereClause}
                    GROUP BY i.instance_id
                ),
                scene_implementations AS (
                    SELECT 
                        ts.instance_id,
                        COUNT(DISTINCT CASE WHEN st.required = TRUE THEN ts.scene_type_id END) AS required_implemented,
                        COUNT(DISTINCT CASE WHEN st.required = FALSE THEN ts.scene_type_id END) AS optional_implemented,
                        AVG(ts.effectiveness_rating) AS avg_effectiveness
                    FROM 
                        trope_scenes ts
                        JOIN trope_scene_types st ON ts.scene_type_id = st.scene_type_id
                    WHERE 
                        ts.instance_id IN (SELECT instance_id FROM scene_requirements)
                    GROUP BY ts.instance_id
                )
                SELECT 
                    i.instance_id,
                    i.trope_id,
                    t.trope_name,
                    t.trope_category,
                    i.completion_status,
                    i.instance_notes,
                    i.subversion_notes,
                    COALESCE(sr.required_scenes, 0) AS required_total,
                    COALESCE(sr.optional_scenes, 0) AS optional_total,
                    COALESCE(si.required_implemented, 0) AS required_implemented,
                    COALESCE(si.optional_implemented, 0) AS optional_implemented,
                    COALESCE(si.avg_effectiveness, 0) AS avg_effectiveness,
                    i.created_at,
                    i.updated_at
                FROM 
                    trope_instances i
                    JOIN tropes t ON i.trope_id = t.trope_id
                    LEFT JOIN scene_requirements sr ON i.instance_id = sr.instance_id
                    LEFT JOIN scene_implementations si ON i.instance_id = si.instance_id
                ${whereClause}
                ORDER BY t.trope_name`;
            
            const result = await this.db.query(query, params);
            
            // Calculate overall book progress
            const totalRequiredScenes = result.rows.reduce((sum, row) => sum + parseInt(row.required_total), 0);
            const implementedRequiredScenes = result.rows.reduce((sum, row) => sum + parseInt(row.required_implemented), 0);
            const overallPercentage = totalRequiredScenes > 0
                ? Math.round((implementedRequiredScenes / totalRequiredScenes) * 100)
                : 100;
            
            // Format the response
            return {
                book_id,
                book_title: bookTitle,
                trope_count: result.rows.length,
                overall_progress: {
                    required_scenes: `${implementedRequiredScenes}/${totalRequiredScenes}`,
                    percentage: overallPercentage,
                    status: overallPercentage === 100 ? 'complete' : 'in_progress'
                },
                tropes: result.rows.map(row => ({
                    instance_id: row.instance_id,
                    trope_id: row.trope_id,
                    trope_name: row.trope_name,
                    trope_category: row.trope_category,
                    status: row.completion_status,
                    progress: {
                        required: `${row.required_implemented}/${row.required_total}`,
                        optional: `${row.optional_implemented}/${row.optional_total}`,
                        percentage: row.required_total > 0
                            ? Math.round((row.required_implemented / row.required_total) * 100)
                            : 100
                    },
                    effectiveness: parseFloat(row.avg_effectiveness).toFixed(1),
                    notes: row.instance_notes,
                    subversion_notes: row.subversion_notes,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }))
            };
        } 
        catch (error) {
            throw new Error(`Failed to get trope progress: ${error.message}`);
        }
    }

    /**
     * Analyze trope usage patterns across a series
     * @param {Object} args - Function arguments
     * @returns {Object} Analysis of trope patterns in the series
     */
    async handleAnalyzeTropePatterns(args) {
        const { series_id, analysis_type = 'all' } = args;
        
        try {
            // Validate series exists
            const seriesResult = await this.db.query(
                'SELECT series_name FROM series WHERE series_id = $1',
                [series_id]
            );
            
            if (seriesResult.rows.length === 0) {
                throw new Error(`Series with ID ${series_id} not found`);
            }
            
            const seriesName = seriesResult.rows[0].series_name;
            const analyses = {};
            
            // Frequency analysis
            if (analysis_type === 'frequency' || analysis_type === 'all') {
                const frequencyQuery = `
                    SELECT 
                        t.trope_id,
                        t.trope_name,
                        t.trope_category,
                        COUNT(DISTINCT i.book_id) AS book_count,
                        COUNT(i.instance_id) AS instance_count,
                        ARRAY_AGG(DISTINCT b.title) AS book_titles
                    FROM 
                        tropes t
                        JOIN trope_instances i ON t.trope_id = i.trope_id
                        JOIN books b ON i.book_id = b.book_id
                    WHERE 
                        t.series_id = $1
                    GROUP BY 
                        t.trope_id, t.trope_name, t.trope_category
                    ORDER BY 
                        book_count DESC, instance_count DESC`;
                
                const frequencyResult = await this.db.query(frequencyQuery, [series_id]);
                
                analyses.frequency = {
                    total_tropes: frequencyResult.rows.length,
                    tropes: frequencyResult.rows.map(row => ({
                        trope_id: row.trope_id,
                        trope_name: row.trope_name,
                        trope_category: row.trope_category,
                        book_count: parseInt(row.book_count),
                        instance_count: parseInt(row.instance_count),
                        books: row.book_titles
                    }))
                };
            }
            
            // Subversion analysis
            if (analysis_type === 'subversion' || analysis_type === 'all') {
                const subversionQuery = `
                    SELECT 
                        t.trope_id,
                        t.trope_name,
                        t.trope_category,
                        COUNT(CASE WHEN i.completion_status = 'subverted' THEN 1 END) AS subversion_count,
                        COUNT(i.instance_id) AS total_instances,
                        ARRAY_AGG(DISTINCT CASE WHEN i.completion_status = 'subverted' THEN b.title END) 
                            FILTER (WHERE i.completion_status = 'subverted') AS subverted_in_books
                    FROM 
                        tropes t
                        JOIN trope_instances i ON t.trope_id = i.trope_id
                        JOIN books b ON i.book_id = b.book_id
                    WHERE 
                        t.series_id = $1
                    GROUP BY 
                        t.trope_id, t.trope_name, t.trope_category
                    HAVING 
                        COUNT(CASE WHEN i.completion_status = 'subverted' THEN 1 END) > 0
                    ORDER BY 
                        subversion_count DESC`;
                
                const subversionResult = await this.db.query(subversionQuery, [series_id]);
                
                analyses.subversion = {
                    total_subverted_tropes: subversionResult.rows.length,
                    tropes: subversionResult.rows.map(row => ({
                        trope_id: row.trope_id,
                        trope_name: row.trope_name,
                        trope_category: row.trope_category,
                        subversion_count: parseInt(row.subversion_count),
                        total_instances: parseInt(row.total_instances),
                        subversion_rate: `${Math.round((row.subversion_count / row.total_instances) * 100)}%`,
                        subverted_in_books: row.subverted_in_books
                    }))
                };
            }
            
            // Effectiveness analysis
            if (analysis_type === 'effectiveness' || analysis_type === 'all') {
                const effectivenessQuery = `
                    SELECT 
                        t.trope_id,
                        t.trope_name,
                        t.trope_category,
                        AVG(ts.effectiveness_rating) AS avg_effectiveness,
                        COUNT(ts.trope_scene_id) AS scene_count
                    FROM 
                        tropes t
                        JOIN trope_instances i ON t.trope_id = i.trope_id
                        JOIN trope_scenes ts ON i.instance_id = ts.instance_id
                        JOIN books b ON i.book_id = b.book_id
                    WHERE 
                        t.series_id = $1
                    GROUP BY 
                        t.trope_id, t.trope_name, t.trope_category
                    HAVING 
                        COUNT(ts.trope_scene_id) > 0
                    ORDER BY 
                        avg_effectiveness DESC`;
                
                const effectivenessResult = await this.db.query(effectivenessQuery, [series_id]);
                
                analyses.effectiveness = {
                    trope_count: effectivenessResult.rows.length,
                    tropes: effectivenessResult.rows.map(row => ({
                        trope_id: row.trope_id,
                        trope_name: row.trope_name,
                        trope_category: row.trope_category,
                        avg_effectiveness: parseFloat(row.avg_effectiveness).toFixed(1),
                        scene_count: parseInt(row.scene_count),
                        rating_category: getRatingCategory(parseFloat(row.avg_effectiveness))
                    }))
                };
            }
            
            // Format the response
            return {
                series_id,
                series_name: seriesName,
                analysis_type,
                analysis_date: new Date().toISOString(),
                analyses
            };
        } 
        catch (error) {
            throw new Error(`Failed to analyze trope patterns: ${error.message}`);
        }
        
        // Helper function to categorize effectiveness ratings
        function getRatingCategory(rating) {
            if (rating >= 9) return 'exceptional';
            if (rating >= 7.5) return 'excellent';
            if (rating >= 6) return 'good';
            if (rating >= 4) return 'average';
            return 'needs improvement';
        }
    }
}