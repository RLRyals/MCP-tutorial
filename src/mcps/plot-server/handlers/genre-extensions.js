// src/mcps/plot-server/handlers/universal-genre-extensions.js
// Universal genre tools using the new schema

import { PlotValidators } from '../utils/plot-validators.js';

export class GenreExtensions {
    constructor(db) {
        this.db = db;
    }
    
    getUniversalGenreTools() {
        return [
            {
                name: 'create_information_reveal',
                description: 'Track any information reveal across all genres (evidence, secrets, backstory, world rules)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        plot_thread_id: {
                            type: 'integer',
                            description: 'Associated plot thread ID'
                        },
                        reveal_type: {
                            type: 'string',
                            enum: ['evidence', 'secret', 'backstory', 'world_rule', 'relationship', 'skill'],
                            description: 'Type of information being revealed'
                        },
                        information_content: {
                            type: 'string',
                            description: 'What information is revealed'
                        },
                        reveal_method: {
                            type: 'string',
                            description: 'How the information is revealed (discovered, confessed, witnessed, deduced)'
                        },
                        significance_level: {
                            type: 'string',
                            enum: ['minor', 'major', 'climactic', 'world_changing'],
                            description: 'Impact level of this reveal'
                        },
                        affects_characters: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Character IDs who learn this information'
                        },
                        revealed_in_chapter: {
                            type: 'integer',
                            description: 'Chapter where revealed (optional)'
                        },
                        consequences: {
                            type: 'string',
                            description: 'What happens as a result of this reveal (optional)'
                        },
                        foreshadowing_chapters: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Chapters where this was hinted at (optional)'
                        }
                    },
                    required: ['plot_thread_id', 'reveal_type', 'information_content', 'reveal_method', 'significance_level']
                }
            },
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
                name: 'define_world_system',
                description: 'Define any systematic supernatural/advanced element with rules and limitations',
                inputSchema: {
                    type: 'object',
                    properties: {
                        series_id: {
                            type: 'integer',
                            description: 'Series ID'
                        },
                        system_name: {
                            type: 'string',
                            description: 'Name of the system'
                        },
                        system_type: {
                            type: 'string',
                            enum: ['magic', 'psionics', 'technology', 'divine', 'supernatural', 'mutation', 'alchemy'],
                            description: 'Type of system'
                        },
                        power_source: {
                            type: 'string',
                            description: 'What powers this system'
                        },
                        access_method: {
                            type: 'string',
                            description: 'How beings access/use this system'
                        },
                        limitations: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Constraints, costs, and limitations'
                        },
                        system_rules: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Governing rules and principles'
                        },
                        power_scaling: {
                            type: 'object',
                            properties: {
                                lowest_level: { type: 'string' },
                                highest_level: { type: 'string' },
                                progression_method: { type: 'string' }
                            },
                            description: 'How power levels work'
                        }
                    },
                    required: ['series_id', 'system_name', 'system_type', 'power_source', 'access_method']
                }
            },
            {
                name: 'add_reveal_evidence',
                description: 'Add specific evidence to an information reveal (universal evidence tracking)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        reveal_id: {
                            type: 'integer',
                            description: 'Information reveal ID'
                        },
                        evidence_type: {
                            type: 'string',
                            enum: ['physical', 'witness', 'circumstantial', 'digital', 'forensic'],
                            description: 'Type of evidence'
                        },
                        evidence_description: {
                            type: 'string',
                            description: 'Description of the evidence'
                        },
                        discovered_by: {
                            type: 'integer',
                            description: 'Character ID who discovered this (optional)'
                        },
                        discovery_chapter: {
                            type: 'integer',
                            description: 'Chapter where discovered (optional)'
                        },
                        significance: {
                            type: 'string',
                            enum: ['critical', 'important', 'supporting', 'red_herring'],
                            description: 'Significance of this evidence'
                        }
                    },
                    required: ['reveal_id', 'evidence_type', 'evidence_description']
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
                name: 'track_system_progression',
                description: 'Track character progression within a world system',
                inputSchema: {
                    type: 'object',
                    properties: {
                        character_id: {
                            type: 'integer',
                            description: 'Character ID'
                        },
                        system_id: {
                            type: 'integer',
                            description: 'World system ID'
                        },
                        book_id: {
                            type: 'integer',
                            description: 'Book where progression occurs'
                        },
                        chapter_id: {
                            type: 'integer',
                            description: 'Chapter where progression occurs (optional)'
                        },
                        current_power_level: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10,
                            description: 'Current power level'
                        },
                        progression_method: {
                            type: 'string',
                            description: 'How they gained this power'
                        },
                        cost_or_sacrifice: {
                            type: 'string',
                            description: 'What they sacrificed to gain this power (optional)'
                        }
                    },
                    required: ['character_id', 'system_id', 'book_id', 'current_power_level']
                }
            }
        ];
    }
    
    // =============================================
    // UNIVERSAL INFORMATION REVEALS (replaces mystery-specific tools)
    // =============================================
    
    async handleCreateInformationReveal(args) {
        try {
            // Validate plot thread exists
            const threadCheck = await this.db.query(
                'SELECT thread_id, title FROM plot_threads WHERE thread_id = $1',
                [args.plot_thread_id]
            );
            
            if (threadCheck.rows.length === 0) {
                throw new Error(`Plot thread with ID ${args.plot_thread_id} not found`);
            }
            
            // Validate characters exist if provided
            if (args.affects_characters && args.affects_characters.length > 0) {
                const charactersCheck = await this.db.query(
                    'SELECT character_id, name FROM characters WHERE character_id = ANY($1)',
                    [args.affects_characters]
                );
                
                if (charactersCheck.rows.length !== args.affects_characters.length) {
                    throw new Error('One or more characters not found');
                }
            }
            
            // Create the information reveal
            const insertQuery = `
                INSERT INTO information_reveals (
                    plot_thread_id, reveal_type, information_content, reveal_method,
                    significance_level, affects_characters, revealed_in_chapter,
                    consequences, foreshadowing_chapters
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING reveal_id, created_at
            `;
            
            const result = await this.db.query(insertQuery, [
                args.plot_thread_id,
                args.reveal_type,
                args.information_content,
                args.reveal_method,
                args.significance_level,
                args.affects_characters || null,
                args.revealed_in_chapter || null,
                args.consequences || null,
                args.foreshadowing_chapters || null
            ]);
            
            const thread = threadCheck.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Information reveal created!\n\n` +
                              `**Reveal ID:** ${result.rows[0].reveal_id}\n` +
                              `**Type:** ${args.reveal_type}\n` +
                              `**Information:** ${args.information_content}\n` +
                              `**Method:** ${args.reveal_method}\n` +
                              `**Significance:** ${args.significance_level}\n` +
                              `**Associated Thread:** "${thread.title}"\n` +
                              `${args.affects_characters?.length ? `**Affects ${args.affects_characters.length} character(s)**\n` : ''}` +
                              `${args.revealed_in_chapter ? `**Revealed in Chapter:** ${args.revealed_in_chapter}\n` : ''}` +
                              `**Created:** ${new Date(result.rows[0].created_at).toLocaleString()}\n\n` +
                              `*This works for any genre: evidence (mystery), secrets (romance), world rules (fantasy), backstory (literary)*`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to create information reveal: ${error.message}`);
        }
    }
    
    // =============================================
    // UNIVERSAL RELATIONSHIP ARCS (replaces romance-specific tools)
    // =============================================
    
    async handleCreateRelationshipArc(args) {
        try {
            // Validate plot thread exists
            const threadCheck = await this.db.query(
                'SELECT thread_id, title FROM plot_threads WHERE thread_id = $1',
                [args.plot_thread_id]
            );
            
            if (threadCheck.rows.length === 0) {
                throw new Error(`Plot thread with ID ${args.plot_thread_id} not found`);
            }
            
            // Validate all characters exist
            const characterIds = args.participants.map(p => p.character_id);
            const charactersCheck = await this.db.query(
                'SELECT character_id, name FROM characters WHERE character_id = ANY($1)',
                [characterIds]
            );
            
            if (charactersCheck.rows.length !== characterIds.length) {
                throw new Error('One or more characters not found');
            }
            
            // Create the relationship arc
            const insertQuery = `
                INSERT INTO relationship_arcs (
                    plot_thread_id, arc_name, participants, relationship_type,
                    current_dynamic, development_factors, complexity_level
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING arc_id, created_at
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
                              `**Arc ID:** ${result.rows[0].arc_id}\n` +
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
    
    // =============================================
    // UNIVERSAL WORLD SYSTEMS (replaces magic-specific tools)
    // =============================================
    
    async handleDefineWorldSystem(args) {
        try {
            // Validate series exists
            const seriesCheck = await this.db.query(
                'SELECT id, title FROM series WHERE id = $1',
                [args.series_id]
            );
            
            if (seriesCheck.rows.length === 0) {
                throw new Error(`Series with ID ${args.series_id} not found`);
            }
            
            // Create the world system
            const insertQuery = `
                INSERT INTO world_systems (
                    series_id, system_name, system_type, power_source,
                    access_method, limitations, system_rules, power_scaling
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING system_id, created_at
            `;
            
            const result = await this.db.query(insertQuery, [
                args.series_id,
                args.system_name,
                args.system_type,
                args.power_source,
                args.access_method,
                args.limitations || null,
                args.system_rules || null,
                JSON.stringify(args.power_scaling) || null
            ]);
            
            const series = seriesCheck.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `World system defined!\n\n` +
                              `**System ID:** ${result.rows[0].system_id}\n` +
                              `**System Name:** ${args.system_name}\n` +
                              `**Type:** ${args.system_type}\n` +
                              `**Power Source:** ${args.power_source}\n` +
                              `**Access Method:** ${args.access_method}\n` +
                              `**Series:** "${series.title}"\n` +
                              `${args.limitations?.length ? `**Limitations:** ${args.limitations.length} defined\n` : ''}` +
                              `${args.system_rules?.length ? `**Rules:** ${args.system_rules.length} defined\n` : ''}` +
                              `**Created:** ${new Date(result.rows[0].created_at).toLocaleString()}\n\n` +
                              `*This works for: magic systems, psychic powers, advanced technology, divine systems, supernatural abilities, mutations*`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to define world system: ${error.message}`);
        }
    }
    
    // =============================================
    // EVIDENCE AND RELATIONSHIP TRACKING
    // =============================================
    
    async handleAddRevealEvidence(args) {
        try {
            // Validate reveal exists
            const revealCheck = await this.db.query(
                'SELECT reveal_id, information_content FROM information_reveals WHERE reveal_id = $1',
                [args.reveal_id]
            );
            
            if (revealCheck.rows.length === 0) {
                throw new Error(`Information reveal with ID ${args.reveal_id} not found`);
            }
            
            // Create the evidence
            const insertQuery = `
                INSERT INTO reveal_evidence (
                    reveal_id, evidence_type, evidence_description,
                    discovered_by, discovery_chapter, significance
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING evidence_id, created_at
            `;
            
            const result = await this.db.query(insertQuery, [
                args.reveal_id,
                args.evidence_type,
                args.evidence_description,
                args.discovered_by || null,
                args.discovery_chapter || null,
                args.significance || 'supporting'
            ]);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Evidence added to information reveal!\n\n` +
                              `**Evidence ID:** ${result.rows[0].evidence_id}\n` +
                              `**Type:** ${args.evidence_type}\n` +
                              `**Description:** ${args.evidence_description}\n` +
                              `**Significance:** ${args.significance || 'supporting'}\n` +
                              `${args.discovery_chapter ? `**Discovered in Chapter:** ${args.discovery_chapter}\n` : ''}` +
                              `**Added:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to add evidence: ${error.message}`);
        }
    }
    
    async handleTrackRelationshipDynamics(args) {
        try {
            // Validate arc exists
            const arcCheck = await this.db.query(
                'SELECT arc_id, arc_name FROM relationship_arcs WHERE arc_id = $1',
                [args.arc_id]
            );
            
            if (arcCheck.rows.length === 0) {
                throw new Error(`Relationship arc with ID ${args.arc_id} not found`);
            }
            
            // Create the dynamic change
            const insertQuery = `
                INSERT INTO relationship_dynamics (
                    arc_id, chapter_id, dynamic_change, tension_change,
                    change_type, trigger_event
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING dynamic_id, created_at
            `;
            
            const result = await this.db.query(insertQuery, [
                args.arc_id,
                args.chapter_id || null,
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
                              `**Dynamic ID:** ${result.rows[0].dynamic_id}\n` +
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
    
    async handleTrackSystemProgression(args) {
        try {
            // Validate character and system exist
            const checks = await Promise.all([
                this.db.query('SELECT character_id, name FROM characters WHERE character_id = $1', [args.character_id]),
                this.db.query('SELECT system_id, system_name FROM world_systems WHERE system_id = $1', [args.system_id]),
                this.db.query('SELECT id, title FROM books WHERE id = $1', [args.book_id])
            ]);
            
            if (checks[0].rows.length === 0) {
                throw new Error(`Character with ID ${args.character_id} not found`);
            }
            if (checks[1].rows.length === 0) {
                throw new Error(`World system with ID ${args.system_id} not found`);
            }
            if (checks[2].rows.length === 0) {
                throw new Error(`Book with ID ${args.book_id} not found`);
            }
            
            const character = checks[0].rows[0];
            const system = checks[1].rows[0];
            const book = checks[2].rows[0];
            
            // Create the progression entry
            const insertQuery = `
                INSERT INTO character_system_progression (
                    character_id, system_id, book_id, chapter_id,
                    current_power_level, progression_method, cost_or_sacrifice
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING progression_id, created_at
            `;
            
            const result = await this.db.query(insertQuery, [
                args.character_id,
                args.system_id,
                args.book_id,
                args.chapter_id || null,
                args.current_power_level,
                args.progression_method,
                args.cost_or_sacrifice || null
            ]);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `System progression tracked!\n\n` +
                              `**Progression ID:** ${result.rows[0].progression_id}\n` +
                              `**Character:** ${character.name}\n` +
                              `**System:** ${system.system_name}\n` +
                              `**Book:** "${book.title}"\n` +
                              `**Power Level:** ${args.current_power_level}/10\n` +
                              `**Method:** ${args.progression_method}\n` +
                              `${args.cost_or_sacrifice ? `**Cost/Sacrifice:** ${args.cost_or_sacrifice}\n` : ''}` +
                              `${args.chapter_id ? `**Chapter:** ${args.chapter_id}\n` : ''}` +
                              `**Tracked:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to track system progression: ${error.message}`);
        }
    }
}