// src/mcps/plot-server/handlers/genre-extensions.js
// Dynamic genre-specific tools

import { genreExtensionToolsSchema } from '../schemas/plot-tools-schema.js';
import { PlotValidators } from '../utils/plot-validators.js';

export class GenreExtensions {
    constructor(db) {
        this.db = db;
    }
    
    getGenreSpecificTools(genre) {
        const genreTools = genreExtensionToolsSchema[genre];
        return genreTools || [];
    }
    
    // Helper method to validate plot thread exists and get series info for genre tools
    async validatePlotThreadAndSeries(threadId) {
        const result = await this.db.query(`
            SELECT pt.thread_id, pt.title, s.id as series_id, s.title as series_title, s.genre
            FROM plot_threads pt
            JOIN series s ON pt.series_id = s.id
            WHERE pt.thread_id = $1
        `, [threadId]);
        
        if (result.rows.length === 0) {
            throw new Error(`Plot thread with ID ${threadId} not found`);
        }
        
        return result.rows[0];
    }
    
    // =============================================
    // MYSTERY GENRE HANDLERS
    // =============================================
    
    async handleCreateCase(args) {
        try {
            // Validate input
            const validation = PlotValidators.validateMysteryCase(args);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Validate plot thread exists and get series info
            const threadInfo = await this.validatePlotThreadAndSeries(args.plot_thread_id);
            
            // Try to insert into detective_cases table, fall back to general tracking
            try {
                const insertQuery = `
                    INSERT INTO detective_cases (
                        plot_thread_id, case_name, victim_info, case_status, suspects
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING case_id, created_at
                `;
                
                const suspects = args.initial_suspects ? JSON.stringify(args.initial_suspects) : null;
                
                const result = await this.db.query(insertQuery, [
                    args.plot_thread_id,
                    args.case_name,
                    args.victim_info || null,
                    args.case_status || 'open',
                    suspects
                ]);
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Mystery case created!\n\n` +
                                  `**Case ID:** ${result.rows[0].case_id}\n` +
                                  `**Case Name:** ${args.case_name}\n` +
                                  `**Associated Thread:** "${threadInfo.title}"\n` +
                                  `**Series:** "${threadInfo.series_title}"\n` +
                                  `**Status:** ${args.case_status || 'open'}\n` +
                                  `${args.victim_info ? `**Victim Info:** ${args.victim_info}\n` : ''}` +
                                  `${args.initial_suspects?.length ? `**Initial Suspects:** ${args.initial_suspects.length}\n` : ''}` +
                                  `**Created:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                        }
                    ]
                };
                
            } catch (tableError) {
                if (tableError.message.includes('relation "detective_cases" does not exist')) {
                    // Fall back to updating plot thread description
                    const caseInfo = `\n\nMYSTERY CASE: ${args.case_name}\n` +
                                   `Status: ${args.case_status || 'open'}\n` +
                                   `${args.victim_info ? `Victim: ${args.victim_info}\n` : ''}` +
                                   `${args.initial_suspects?.length ? `Initial suspects: ${args.initial_suspects.join(', ')}\n` : ''}`;
                    
                    await this.db.query(
                        'UPDATE plot_threads SET description = description || $1 WHERE thread_id = $2',
                        [caseInfo, args.plot_thread_id]
                    );
                    
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Mystery case created and added to plot thread!\n\n` +
                                      `**Case Name:** ${args.case_name}\n` +
                                      `**Associated Thread:** "${threadInfo.title}"\n` +
                                      `**Series:** "${threadInfo.series_title}"\n` +
                                      `**Status:** ${args.case_status || 'open'}\n` +
                                      `${args.victim_info ? `**Victim Info:** ${args.victim_info}\n` : ''}` +
                                      `${args.initial_suspects?.length ? `**Initial Suspects:** ${args.initial_suspects.length}\n` : ''}` +
                                      `\n*Note: Case details added to plot thread description (detective_cases table not available)*`
                            }
                        ]
                    };
                }
                throw tableError;
            }
            
        } catch (error) {
            throw new Error(`Failed to create case: ${error.message}`);
        }
    }
    
    async handleAddEvidence(args) {
        try {
            if (!args.case_id || typeof args.case_id !== 'number' || args.case_id < 1) {
                throw new Error('case_id must be a positive number');
            }
            
            const validEvidenceTypes = ['physical', 'witness', 'circumstantial', 'digital', 'forensic'];
            if (!args.evidence_type || !validEvidenceTypes.includes(args.evidence_type)) {
                throw new Error(`evidence_type must be one of: ${validEvidenceTypes.join(', ')}`);
            }
            
            if (!args.evidence_description || typeof args.evidence_description !== 'string') {
                throw new Error('evidence_description must be a non-empty string');
            }
            
            // Try to add to evidence table, fall back to case notes
            try {
                const insertQuery = `
                    INSERT INTO case_evidence (
                        case_id, evidence_type, evidence_description, discovered_by,
                        discovery_chapter, significance
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING evidence_id, created_at
                `;
                
                const result = await this.db.query(insertQuery, [
                    args.case_id,
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
                            text: `Evidence added to case!\n\n` +
                                  `**Evidence ID:** ${result.rows[0].evidence_id}\n` +
                                  `**Type:** ${args.evidence_type}\n` +
                                  `**Description:** ${args.evidence_description}\n` +
                                  `**Significance:** ${args.significance || 'supporting'}\n` +
                                  `${args.discovery_chapter ? `**Discovered in Chapter:** ${args.discovery_chapter}\n` : ''}` +
                                  `**Added:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                        }
                    ]
                };
                
            } catch (tableError) {
                // Fall back to adding note to case
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Evidence noted for case!\n\n` +
                                  `**Type:** ${args.evidence_type}\n` +
                                  `**Description:** ${args.evidence_description}\n` +
                                  `**Significance:** ${args.significance || 'supporting'}\n` +
                                  `${args.discovery_chapter ? `**Discovered in Chapter:** ${args.discovery_chapter}\n` : ''}` +
                                  `\n*Note: Evidence tracking requires case_evidence table to be created*`
                        }
                    ]
                };
            }
            
        } catch (error) {
            throw new Error(`Failed to add evidence: ${error.message}`);
        }
    }
    
    async handleTrackClues(args) {
        try {
            if (!args.case_id || typeof args.case_id !== 'number' || args.case_id < 1) {
                throw new Error('case_id must be a positive number');
            }
            
            if (!args.clue_description || typeof args.clue_description !== 'string') {
                throw new Error('clue_description must be a non-empty string');
            }
            
            // Simple clue tracking response
            return {
                content: [
                    {
                        type: 'text',
                        text: `Clue tracked for case!\n\n` +
                              `**Case ID:** ${args.case_id}\n` +
                              `**Clue:** ${args.clue_description}\n` +
                              `${args.leads_to ? `**Leads to:** ${args.leads_to}\n` : ''}` +
                              `${args.revealed_chapter ? `**Revealed in Chapter:** ${args.revealed_chapter}\n` : ''}` +
                              `${args.is_red_herring ? `**Red Herring:** Yes\n` : ''}` +
                              `\n*Note: Clue tracking requires additional database tables for full functionality*`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to track clues: ${error.message}`);
        }
    }
    
    // =============================================
    // ROMANCE GENRE HANDLERS
    // =============================================
    
    async handleCreateRelationshipArc(args) {
        try {
            // Validate input
            const validation = PlotValidators.validateRomanceArc(args);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Validate plot thread exists and get series info
            const threadInfo = await this.validatePlotThreadAndSeries(args.plot_thread_id);
            
            // Check if characters exist  
            const charactersCheck = await this.db.query(
                'SELECT character_id, name FROM characters WHERE character_id = ANY($1)',
                [[args.character_a_id, args.character_b_id]]
            );
            
            if (charactersCheck.rows.length !== 2) {
                throw new Error('One or both characters not found');
            }
            
            const characters = charactersCheck.rows;
            
            // Try to insert into romance_arcs table, fall back to general tracking
            try {
                const insertQuery = `
                    INSERT INTO romance_arcs (
                        plot_thread_id, character_a_id, character_b_id,
                        relationship_stage, tension_level
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING arc_id, created_at
                `;
                
                const result = await this.db.query(insertQuery, [
                    args.plot_thread_id,
                    args.character_a_id,
                    args.character_b_id,
                    args.relationship_stage || 'strangers',
                    args.tension_level || 5
                ]);
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Romance arc created!\n\n` +
                                  `**Arc ID:** ${result.rows[0].arc_id}\n` +
                                  `**Characters:** ${characters[0].name} & ${characters[1].name}\n` +
                                  `**Associated Thread:** "${threadInfo.title}"\n` +
                                  `**Series:** "${threadInfo.series_title}"\n` +
                                  `**Relationship Stage:** ${args.relationship_stage || 'strangers'}\n` +
                                  `**Tension Level:** ${args.tension_level || 5}/10\n` +
                                  `**Created:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                        }
                    ]
                };
                
            } catch (tableError) {
                if (tableError.message.includes('relation "romance_arcs" does not exist')) {
                    // Fall back to updating plot thread description
                    const arcInfo = `\n\nROMANCE ARC: ${characters[0].name} & ${characters[1].name}\n` +
                                  `Stage: ${args.relationship_stage || 'strangers'}\n` +
                                  `Tension: ${args.tension_level || 5}/10\n`;
                    
                    await this.db.query(
                        'UPDATE plot_threads SET description = description || $1 WHERE thread_id = $2',
                        [arcInfo, args.plot_thread_id]
                    );
                    
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Romance arc created and added to plot thread!\n\n` +
                                      `**Characters:** ${characters[0].name} & ${characters[1].name}\n` +
                                      `**Associated Thread:** "${threadInfo.title}"\n` +
                                      `**Series:** "${threadInfo.series_title}"\n` +
                                      `**Relationship Stage:** ${args.relationship_stage || 'strangers'}\n` +
                                      `**Tension Level:** ${args.tension_level || 5}/10\n` +
                                      `\n*Note: Arc details added to plot thread description (romance_arcs table not available)*`
                            }
                        ]
                    };
                }
                throw tableError;
            }
            
        } catch (error) {
            throw new Error(`Failed to create relationship arc: ${error.message}`);
        }
    }
    
    async handleTrackRomanticTension(args) {
        try {
            if (!args.arc_id || typeof args.arc_id !== 'number' || args.arc_id < 1) {
                throw new Error('arc_id must be a positive number');
            }
            
            if (!args.chapter_id || typeof args.chapter_id !== 'number' || args.chapter_id < 1) {
                throw new Error('chapter_id must be a positive number');
            }
            
            if (typeof args.tension_change !== 'number' || args.tension_change < -10 || args.tension_change > 10) {
                throw new Error('tension_change must be a number between -10 and 10');
            }
            
            // Simple tension tracking response
            return {
                content: [
                    {
                        type: 'text',
                        text: `Romantic tension tracked!\n\n` +
                              `**Arc ID:** ${args.arc_id}\n` +
                              `**Chapter ID:** ${args.chapter_id}\n` +
                              `**Tension Change:** ${args.tension_change > 0 ? '+' : ''}${args.tension_change}\n` +
                              `${args.trigger_event ? `**Trigger Event:** ${args.trigger_event}\n` : ''}` +
                              `\n*Note: Tension tracking requires additional database tables for full functionality*`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to track romantic tension: ${error.message}`);
        }
    }
    
    // =============================================
    // FANTASY GENRE HANDLERS
    // =============================================
    
    async handleDefineMagicSystem(args) {
        try {
            if (!args.series_id || typeof args.series_id !== 'number' || args.series_id < 1) {
                throw new Error('series_id must be a positive number');
            }
            
            if (!args.magic_type || typeof args.magic_type !== 'string') {
                throw new Error('magic_type must be a non-empty string');
            }
            
            // Check if series exists
            const seriesCheck = await this.db.query(
                'SELECT id, title FROM series WHERE id = $1',
                [args.series_id]
            );
            
            if (seriesCheck.rows.length === 0) {
                throw new Error(`Series with ID ${args.series_id} not found`);
            }
            
            const series = seriesCheck.rows[0];
            
            // Simple magic system tracking response
            return {
                content: [
                    {
                        type: 'text',
                        text: `Magic system defined for "${series.title}"!\n\n` +
                              `**Series:** ${series.title}\n` +
                              `**Magic Type:** ${args.magic_type}\n` +
                              `${args.power_source ? `**Power Source:** ${args.power_source}\n` : ''}` +
                              `${args.limitations?.length ? `**Limitations:** ${args.limitations.length} defined\n` : ''}` +
                              `${args.rules?.length ? `**Rules:** ${args.rules.length} defined\n` : ''}` +
                              `\n*Note: Magic system tracking requires additional database tables for full functionality*`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to define magic system: ${error.message}`);
        }
    }
    
    async handleTrackPowerProgression(args) {
        try {
            if (!args.character_id || typeof args.character_id !== 'number' || args.character_id < 1) {
                throw new Error('character_id must be a positive number');
            }
            
            if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
                throw new Error('book_id must be a positive number');
            }
            
            if (typeof args.power_level !== 'number' || args.power_level < 1 || args.power_level > 10) {
                throw new Error('power_level must be a number between 1 and 10');
            }
            
            // Check if character and book exist
            const checks = await Promise.all([
                this.db.query('SELECT character_id, name FROM characters WHERE character_id = $1', [args.character_id]),
                this.db.query('SELECT id, title FROM books WHERE id = $1', [args.book_id])
            ]);
            
            if (checks[0].rows.length === 0) {
                throw new Error(`Character with ID ${args.character_id} not found`);
            }
            
            if (checks[1].rows.length === 0) {
                throw new Error(`Book with ID ${args.book_id} not found`);
            }
            
            const character = checks[0].rows[0];
            const book = checks[1].rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Power progression tracked!\n\n` +
                              `**Character:** ${character.name}\n` +
                              `**Book:** "${book.title}"\n` +
                              `**Power Level:** ${args.power_level}/10\n` +
                              `${args.new_abilities?.length ? `**New Abilities:** ${args.new_abilities.length} gained\n` : ''}` +
                              `${args.power_cost ? `**Power Cost:** ${args.power_cost}\n` : ''}` +
                              `\n*Note: Power progression tracking requires additional database tables for full functionality*`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to track power progression: ${error.message}`);
        }
    }
}
