// src/mcps/relationship-server/handlers/relationship-handlers.js
// Handles relationship arcs and dynamics tracking

export class RelationshipHandlers {
    constructor(db) {
        this.db = db;
    }

    getRelationshipTools() {
        return [
            {
                name: 'create_relationship_arc',
                description: 'Track any relationship development across all genres and relationship types',
                inputSchema: {
                    type: 'object',
                    properties: {
                        plot_thread_id: {
                            type: 'integer',
                            description: 'Associated plot thread ID'
                        },
                        arc_name: {
                            type: 'string',
                            description: 'Name for this relationship arc'
                        },
                        participants: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    character_id: { type: 'integer' },
                                    role_in_relationship: {
                                        type: 'string',
                                        description: 'primary, secondary, catalyst, observer'
                                    },
                                    character_name: { type: 'string' }
                                },
                                required: ['character_id', 'role_in_relationship']
                            },
                            description: 'Characters involved (2 or more, flexible roles)'
                        },
                        relationship_type: {
                            type: 'string',
                            enum: ['romantic', 'family', 'friendship', 'professional', 'antagonistic', 'mentor', 'alliance'],
                            description: 'Type of relationship'
                        },
                        current_dynamic: {
                            type: 'string',
                            description: 'Current relationship dynamic/stage'
                        },
                        development_factors: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'What drives development in this relationship'
                        },
                        complexity_level: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10,
                            description: 'Relationship complexity (1=simple, 10=very complex)'
                        }
                    },
                    required: ['plot_thread_id', 'arc_name', 'participants', 'relationship_type']
                }
            },
            {
                name: 'track_relationship_dynamics',
                description: 'Track how relationship dynamics change over time',
                inputSchema: {
                    type: 'object',
                    properties: {
                        arc_id: {
                            type: 'integer',
                            description: 'Relationship arc ID'
                        },
                        chapter_id: {
                            type: 'integer',
                            description: 'Chapter where change occurs (optional)'
                        },
                        scene_id: {
                            type: 'integer',
                            description: 'Specific scene where change occurs (optional)'
                        },
                        dynamic_change: {
                            type: 'string',
                            description: 'Description of how dynamic changed'
                        },
                        tension_change: {
                            type: 'integer',
                            minimum: -10,
                            maximum: 10,
                            description: 'Change in tension level (-10 to +10)'
                        },
                        change_type: {
                            type: 'string',
                            enum: ['emotional', 'power', 'trust', 'commitment', 'conflict'],
                            description: 'Type of dynamic change'
                        },
                        trigger_event: {
                            type: 'string',
                            description: 'What triggered this change'
                        }
                    },
                    required: ['arc_id', 'dynamic_change', 'change_type']
                }
            },
            {
                name: 'get_relationship_arc',
                description: 'Get details about a specific relationship arc',
                inputSchema: {
                    type: 'object',
                    properties: {
                        arc_id: {
                            type: 'integer',
                            description: 'Relationship arc ID'
                        }
                    },
                    required: ['arc_id']
                }
            },
            {
                name: 'list_relationship_arcs',
                description: 'List all relationship arcs, optionally filtered by plot thread or relationship type',
                inputSchema: {
                    type: 'object',
                    properties: {
                        plot_thread_id: {
                            type: 'integer',
                            description: 'Filter by plot thread ID (optional)'
                        },
                        relationship_type: {
                            type: 'string',
                            enum: ['romantic', 'family', 'friendship', 'professional', 'antagonistic', 'mentor', 'alliance'],
                            description: 'Filter by relationship type (optional)'
                        }
                    }
                }
            },
            {
                name: 'get_relationship_timeline',
                description: 'Get the complete timeline of dynamics changes for a relationship arc',
                inputSchema: {
                    type: 'object',
                    properties: {
                        arc_id: {
                            type: 'integer',
                            description: 'Relationship arc ID'
                        }
                    },
                    required: ['arc_id']
                }
            }
        ];
    }

    async handleCreateRelationshipArc(args) {
        try {
            // Validate plot thread exists
            const threadCheck = await this.db.query(
                'SELECT id, title FROM plot_threads WHERE id = $1',
                [args.plot_thread_id]
            );

            if (threadCheck.rows.length === 0) {
                throw new Error(`Plot thread with ID ${args.plot_thread_id} not found. Please create a plot thread first using the plot-server's create_plot_thread tool.`);
            }

            // Validate all characters exist
            const characterIds = args.participants.map(p => p.character_id);
            const charactersCheck = await this.db.query(
                'SELECT id, name FROM characters WHERE id = ANY($1)',
                [characterIds]
            );

            if (charactersCheck.rows.length !== characterIds.length) {
                const foundIds = charactersCheck.rows.map(c => c.id);
                const missingIds = characterIds.filter(id => !foundIds.includes(id));
                throw new Error(`One or more characters not found. Missing character IDs: ${missingIds.join(', ')}. Please create these characters first using the character-server's create_character tool.`);
            }

            // Create the relationship arc
            const insertQuery = `
                INSERT INTO relationship_arcs (
                    plot_thread_id, arc_name, participants, relationship_type,
                    current_dynamic, development_factors, complexity_level
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, created_at
            `;

            const result = await this.db.query(insertQuery, [
                args.plot_thread_id,
                args.arc_name,
                JSON.stringify(args.participants),
                args.relationship_type,
                args.current_dynamic || null,
                args.development_factors || null,
                args.complexity_level || 5
            ]);

            const thread = threadCheck.rows[0];
            const characterNames = charactersCheck.rows.map(c => c.name);

            return {
                content: [
                    {
                        type: 'text',
                        text: `Relationship arc created!\n\n` +
                              `**Arc ID:** ${result.rows[0].id}\n` +
                              `**Arc Name:** ${args.arc_name}\n` +
                              `**Type:** ${args.relationship_type}\n` +
                              `**Characters:** ${characterNames.join(', ')}\n` +
                              `**Participants:** ${args.participants.length}\n` +
                              `**Complexity Level:** ${args.complexity_level || 5}/10\n` +
                              `**Associated Thread:** "${thread.title}"\n` +
                              `${args.current_dynamic ? `**Current Dynamic:** ${args.current_dynamic}\n` : ''}` +
                              `**Created:** ${new Date(result.rows[0].created_at).toLocaleString()}\n\n` +
                              `*This works for: romantic pairs, love triangles, family dynamics, friendships, professional relationships, antagonistic relationships*`
                    }
                ]
            };

        } catch (error) {
            throw new Error(`Failed to create relationship arc: ${error.message}`);
        }
    }

    async handleTrackRelationshipDynamics(args) {
        try {
            // Validate arc exists
            const arcCheck = await this.db.query(
                'SELECT id, arc_name FROM relationship_arcs WHERE id = $1',
                [args.arc_id]
            );

            if (arcCheck.rows.length === 0) {
                throw new Error(`Relationship arc with ID ${args.arc_id} not found`);
            }

            // Create the dynamic change
            const insertQuery = `
                INSERT INTO relationship_dynamics (
                    arc_id, chapter_id, scene_id, dynamic_change, tension_change,
                    change_type, trigger_event
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, created_at
            `;

            const result = await this.db.query(insertQuery, [
                args.arc_id,
                args.chapter_id || null,
                args.scene_id || null,
                args.dynamic_change,
                args.tension_change || null,
                args.change_type,
                args.trigger_event || null
            ]);

            const arc = arcCheck.rows[0];

            return {
                content: [
                    {
                        type: 'text',
                        text: `Relationship dynamics tracked!\n\n` +
                              `**Dynamic ID:** ${result.rows[0].id}\n` +
                              `**Arc:** "${arc.arc_name}"\n` +
                              `**Change Type:** ${args.change_type}\n` +
                              `**Dynamic Change:** ${args.dynamic_change}\n` +
                              `${args.tension_change ? `**Tension Change:** ${args.tension_change > 0 ? '+' : ''}${args.tension_change}\n` : ''}` +
                              `${args.trigger_event ? `**Trigger:** ${args.trigger_event}\n` : ''}` +
                              `${args.chapter_id ? `**Chapter:** ${args.chapter_id}\n` : ''}` +
                              `**Tracked:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                    }
                ]
            };

        } catch (error) {
            throw new Error(`Failed to track relationship dynamics: ${error.message}`);
        }
    }

    async handleGetRelationshipArc(args) {
        try {
            const query = `
                SELECT
                    ra.*,
                    pt.title as plot_thread_title
                FROM relationship_arcs ra
                JOIN plot_threads pt ON ra.plot_thread_id = pt.id
                WHERE ra.id = $1
            `;

            const result = await this.db.query(query, [args.arc_id]);

            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No relationship arc found with ID: ${args.arc_id}`
                    }]
                };
            }

            const arc = result.rows[0];
            const participants = JSON.parse(arc.participants);

            return {
                content: [{
                    type: 'text',
                    text: `Relationship Arc Details:\n\n` +
                          `**Arc ID:** ${arc.id}\n` +
                          `**Arc Name:** ${arc.arc_name}\n` +
                          `**Type:** ${arc.relationship_type}\n` +
                          `**Complexity:** ${arc.complexity_level}/10\n` +
                          `**Plot Thread:** ${arc.plot_thread_title}\n` +
                          `**Current Dynamic:** ${arc.current_dynamic || 'Not set'}\n` +
                          `**Participants:**\n${participants.map(p => `  - ${p.character_name} (${p.role_in_relationship})`).join('\n')}\n` +
                          `${arc.development_factors ? `**Development Factors:** ${arc.development_factors.join(', ')}\n` : ''}` +
                          `**Created:** ${new Date(arc.created_at).toLocaleString()}\n` +
                          `**Updated:** ${new Date(arc.updated_at).toLocaleString()}`
                }]
            };

        } catch (error) {
            throw new Error(`Failed to get relationship arc: ${error.message}`);
        }
    }

    async handleListRelationshipArcs(args) {
        try {
            let query = `
                SELECT
                    ra.*,
                    pt.title as plot_thread_title
                FROM relationship_arcs ra
                JOIN plot_threads pt ON ra.plot_thread_id = pt.id
                WHERE 1=1
            `;

            const params = [];
            let paramCount = 0;

            if (args.plot_thread_id) {
                paramCount++;
                query += ` AND ra.plot_thread_id = $${paramCount}`;
                params.push(args.plot_thread_id);
            }

            if (args.relationship_type) {
                paramCount++;
                query += ` AND ra.relationship_type = $${paramCount}`;
                params.push(args.relationship_type);
            }

            query += ` ORDER BY ra.created_at DESC`;

            const result = await this.db.query(query, params);

            if (result.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: 'No relationship arcs found.'
                    }]
                };
            }

            const arcsList = result.rows.map(arc => {
                const participants = JSON.parse(arc.participants);
                return `**${arc.arc_name}** (ID: ${arc.id})\n` +
                       `  Type: ${arc.relationship_type}\n` +
                       `  Participants: ${participants.length}\n` +
                       `  Complexity: ${arc.complexity_level}/10\n` +
                       `  Plot Thread: ${arc.plot_thread_title}`;
            }).join('\n\n');

            return {
                content: [{
                    type: 'text',
                    text: `Found ${result.rows.length} relationship arc(s):\n\n${arcsList}`
                }]
            };

        } catch (error) {
            throw new Error(`Failed to list relationship arcs: ${error.message}`);
        }
    }

    async handleGetRelationshipTimeline(args) {
        try {
            // Get arc info
            const arcQuery = `
                SELECT ra.*, pt.title as plot_thread_title
                FROM relationship_arcs ra
                JOIN plot_threads pt ON ra.plot_thread_id = pt.id
                WHERE ra.id = $1
            `;

            const arcResult = await this.db.query(arcQuery, [args.arc_id]);

            if (arcResult.rows.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `No relationship arc found with ID: ${args.arc_id}`
                    }]
                };
            }

            // Get dynamics timeline
            const dynamicsQuery = `
                SELECT
                    rd.*,
                    c.chapter_number,
                    c.title as chapter_title
                FROM relationship_dynamics rd
                LEFT JOIN chapters c ON rd.chapter_id = c.id
                WHERE rd.arc_id = $1
                ORDER BY rd.created_at ASC
            `;

            const dynamicsResult = await this.db.query(dynamicsQuery, [args.arc_id]);

            const arc = arcResult.rows[0];

            let timeline = `Relationship Timeline: ${arc.arc_name}\n\n`;
            timeline += `Type: ${arc.relationship_type}\n`;
            timeline += `Current Dynamic: ${arc.current_dynamic || 'Not set'}\n\n`;

            if (dynamicsResult.rows.length === 0) {
                timeline += 'No dynamics changes recorded yet.';
            } else {
                timeline += `Dynamics Changes (${dynamicsResult.rows.length}):\n\n`;
                dynamicsResult.rows.forEach((dyn, idx) => {
                    timeline += `${idx + 1}. ${dyn.change_type.toUpperCase()}: ${dyn.dynamic_change}\n`;
                    if (dyn.chapter_number) {
                        timeline += `   Chapter: ${dyn.chapter_number} - ${dyn.chapter_title}\n`;
                    }
                    if (dyn.tension_change) {
                        timeline += `   Tension: ${dyn.tension_change > 0 ? '+' : ''}${dyn.tension_change}\n`;
                    }
                    if (dyn.trigger_event) {
                        timeline += `   Trigger: ${dyn.trigger_event}\n`;
                    }
                    timeline += `   Recorded: ${new Date(dyn.created_at).toLocaleString()}\n\n`;
                });
            }

            return {
                content: [{
                    type: 'text',
                    text: timeline
                }]
            };

        } catch (error) {
            throw new Error(`Failed to get relationship timeline: ${error.message}`);
        }
    }
}
