// src/mcps/plot-server/handlers/story-analysis-handlers.js
//  story analysis without rigid structure

import { storyAnalysisToolsSchema } from '../schemas/plot-tools-schema.js';
import { PlotValidators } from '../utils/plot-validators.js';

export class StoryAnalysisHandlers {
    constructor(db) {
        this.db = db;
    }
    
    getStoryAnalysisTools() {
        return storyAnalysisToolsSchema;
    }
    
    async handleAnalyzeStoryDynamics(args) {
        try {
            // Validate input
            const validation = PlotValidators.validateStoryAnalysis(args);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Check if book exists
            const bookCheck = await this.db.query(
                'SELECT b.id, b.title, s.title as series_title FROM books b JOIN series s ON b.series_id = s.id WHERE b.id = $1',
                [args.book_id]
            );
            
            if (bookCheck.rows.length === 0) {
                throw new Error(`Book with ID ${args.book_id} not found`);
            }
            
            const book = bookCheck.rows[0];
            
            // Check if story analysis already exists
            const existingAnalysis = await this.db.query(
                'SELECT id FROM story_analysis WHERE book_id = $1',
                [args.book_id]
            );
            
            let analysisResult;
            
            if (existingAnalysis.rows.length > 0) {
                // Update existing analysis
                const updateQuery = `
                    UPDATE story_analysis 
                    SET story_concern_id = COALESCE($1, story_concern_id),
                        main_character_problem = COALESCE($2, main_character_problem),
                        influence_character_impact = COALESCE($3, influence_character_impact),
                        story_outcome_id = COALESCE($4, story_outcome_id),
                        story_judgment_id = COALESCE($5, story_judgment_id),
                        thematic_elements = COALESCE($6, thematic_elements),
                        analysis_notes = COALESCE($7, analysis_notes),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE book_id = $8
                    RETURNING id, story_concern_id, main_character_problem, influence_character_impact,
                             story_outcome_id, story_judgment_id, thematic_elements, analysis_notes, updated_at
                `;
                
                analysisResult = await this.db.query(updateQuery, [
                    args.story_concern_id || null,
                    args.main_character_problem || null,
                    args.influence_character_impact || null,
                    args.story_outcome_id || null,
                    args.story_judgment_id || null,
                    args.thematic_elements ? JSON.stringify(args.thematic_elements) : null,
                    args.analysis_notes || null,
                    args.book_id
                ]);
                
            } else {
                // Create new analysis
                const insertQuery = `
                    INSERT INTO story_analysis (
                        book_id, story_concern_id, main_character_problem, influence_character_impact,
                        story_outcome_id, story_judgment_id, thematic_elements, analysis_notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id, story_concern_id, main_character_problem, influence_character_impact,
                             story_outcome_id, story_judgment_id, thematic_elements, analysis_notes, created_at
                `;
                
                analysisResult = await this.db.query(insertQuery, [
                    args.book_id,
                    args.story_concern_id || null,
                    args.main_character_problem || null,
                    args.influence_character_impact || null,
                    args.story_outcome_id || null,
                    args.story_judgment_id || null,
                    args.thematic_elements ? JSON.stringify(args.thematic_elements) : null,
                    args.analysis_notes || null
                ]);
            }
            
            const analysis = analysisResult.rows[0];
            
            // Get story concern name, outcome name, and judgment name if IDs are present
            let storyConcernName, storyOutcomeName, storyJudgmentName;
            
            if (analysis.story_concern_id) {
                const concernResult = await this.db.query(
                    'SELECT concern_name FROM story_concerns WHERE id = $1',
                    [analysis.story_concern_id]
                );
                storyConcernName = concernResult.rows.length > 0 ? concernResult.rows[0].concern_name : null;
            }
            
            if (analysis.story_outcome_id) {
                const outcomeResult = await this.db.query(
                    'SELECT outcome_name FROM story_outcomes WHERE id = $1',
                    [analysis.story_outcome_id]
                );
                storyOutcomeName = outcomeResult.rows.length > 0 ? outcomeResult.rows[0].outcome_name : null;
            }
            
            if (analysis.story_judgment_id) {
                const judgmentResult = await this.db.query(
                    'SELECT judgment_name FROM story_judgments WHERE id = $1',
                    [analysis.story_judgment_id]
                );
                storyJudgmentName = judgmentResult.rows.length > 0 ? judgmentResult.rows[0].judgment_name : null;
            }
            
            let output = `# Story Dynamics Analysis\n\n`;
            output += `**Book:** "${book.title}" (${book.series_title})\n\n`;
            
            if (storyConcernName) {
                output += `## Story Concern: ${storyConcernName}\n`;
                output += `This story is fundamentally about ${storyConcernName}.\n\n`;
            }
            
            if (analysis.main_character_problem) {
                output += `## Main Character Problem\n`;
                output += `${analysis.main_character_problem}\n\n`;
            }
            
            if (analysis.influence_character_impact) {
                output += `## Influence Character Impact\n`;
                output += `${analysis.influence_character_impact}\n\n`;
            }
            
            if (storyOutcomeName && storyJudgmentName) {
                output += `## Story Resolution\n`;
                output += `- **Outcome:** ${storyOutcomeName} (goal achievement)\n`;
                output += `- **Judgment:** ${storyJudgmentName} (satisfaction with outcome)\n\n`;
            }
            
            if (analysis.thematic_elements) {
                const themes = typeof analysis.thematic_elements === 'string' 
                    ? JSON.parse(analysis.thematic_elements) 
                    : analysis.thematic_elements;
                    
                output += `## Thematic Elements\n`;
                Object.entries(themes).forEach(([key, value]) => {
                    output += `- **${key}:** ${value}\n`;
                });
                output += '\n';
            }
            
            if (analysis.analysis_notes) {
                output += `## Analysis Notes\n`;
                output += `${analysis.analysis_notes}\n\n`;
            }
            
            output += `**Analysis ID:** ${analysis.analysis_id}\n`;
            output += `**Last Updated:** ${new Date(analysis.updated_at || analysis.created_at).toLocaleString()}`;
            
            return {
                content: [
                    {
                        type: 'text',
                        text: output
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to analyze story dynamics: ${error.message}`);
        }
    }
    
    async handleTrackCharacterThroughlines(args) {
        try {
            // Validate input
            const validation = PlotValidators.validateCharacterThroughline(args);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Check if book and character exist
            const bookCharacterCheck = await this.db.query(`
                SELECT b.id as book_id, b.title as book_title, 
                       c.id as character_id, c.name as character_name,
                       s.title as series_title
                FROM books b 
                JOIN series s ON b.series_id = s.id
                JOIN characters c ON c.series_id = s.id
                WHERE b.id = $1 AND c.id = $2
            `, [args.book_id, args.character_id]);
            
            if (bookCharacterCheck.rows.length === 0) {
                throw new Error('Book or character not found, or character not in book\'s series');
            }
            
            const info = bookCharacterCheck.rows[0];
            
            // Check if throughline already exists
            const existingThroughline = await this.db.query(
                'SELECT id FROM character_throughlines WHERE book_id = $1 AND character_id = $2 AND throughline_type = $3',
                [args.book_id, args.character_id, args.throughline_type]
            );
            
            let throughlineResult;
            
            if (existingThroughline.rows.length > 0) {
                // Update existing throughline
                const updateQuery = `
                    UPDATE character_throughlines 
                    SET character_problem = COALESCE($1, character_problem),
                        character_solution = COALESCE($2, character_solution),
                        character_arc = COALESCE($3, character_arc),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $4
                    RETURNING id, character_problem, character_solution, character_arc, updated_at
                `;
                
                throughlineResult = await this.db.query(updateQuery, [
                    args.character_problem || null,
                    args.character_solution || null,
                    args.character_arc || null,
                    existingThroughline.rows[0].id
                ]);
                
            } else {
                // Create new throughline - first check if table exists
                try {
                    const insertQuery = `
                        INSERT INTO character_throughlines (
                            book_id, character_id, throughline_type, character_problem,
                            character_solution, character_arc
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING id, character_problem, character_solution, character_arc, created_at
                    `;
                    
                    throughlineResult = await this.db.query(insertQuery, [
                        args.book_id,
                        args.character_id,
                        args.throughline_type,
                        args.character_problem || null,
                        args.character_solution || null,
                        args.character_arc || null
                    ]);
                } catch (tableError) {
                    if (tableError.message.includes('relation "character_throughlines" does not exist')) {
                        // Table doesn't exist, create a simple tracking record in story_analysis
                        const throughlineData = {
                            character_id: args.character_id,
                            character_name: info.character_name,
                            throughline_type: args.throughline_type,
                            character_problem: args.character_problem,
                            character_solution: args.character_solution,
                            character_arc: args.character_arc
                        };
                        
                        const insertIntoAnalysisQuery = `
                            INSERT INTO story_analysis (
                                book_id, analysis_notes
                            ) VALUES ($1, $2)
                            ON CONFLICT (book_id) DO UPDATE SET
                                analysis_notes = COALESCE(story_analysis.analysis_notes, '') || '\n\n' || $2,
                                updated_at = CURRENT_TIMESTAMP
                            RETURNING id
                        `;
                        
                        const noteText = `Character Throughline - ${args.throughline_type}:\n` +
                                       `Character: ${info.character_name} (ID: ${args.character_id})\n` +
                                       `${args.character_problem ? `Problem: ${args.character_problem}\n` : ''}` +
                                       `${args.character_solution ? `Solution: ${args.character_solution}\n` : ''}` +
                                       `${args.character_arc ? `Arc: ${args.character_arc}\n` : ''}`;
                        
                        await this.db.query(insertIntoAnalysisQuery, [args.book_id, noteText]);
                        
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `Character throughline tracked for ${info.character_name}!\n\n` +
                                          `**Book:** "${info.book_title}" (${info.series_title})\n` +
                                          `**Character:** ${info.character_name}\n` +
                                          `**Throughline Type:** ${args.throughline_type}\n` +
                                          `${args.character_problem ? `**Problem:** ${args.character_problem}\n` : ''}` +
                                          `${args.character_solution ? `**Solution:** ${args.character_solution}\n` : ''}` +
                                          `${args.character_arc ? `**Arc:** ${args.character_arc}\n` : ''}` +
                                          `\n*Note: Stored in story analysis notes (character_throughlines table not available)*`
                                }
                            ]
                        };
                    }
                    throw tableError;
                }
            }
            
            const throughline = throughlineResult.rows[0];
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Character throughline ${existingThroughline.rows.length > 0 ? 'updated' : 'created'} for ${info.character_name}!\n\n` +
                              `**Book:** "${info.book_title}" (${info.series_title})\n` +
                              `**Character:** ${info.character_name}\n` +
                              `**Throughline Type:** ${args.throughline_type}\n` +
                              `${throughline.character_problem ? `**Problem:** ${throughline.character_problem}\n` : ''}` +
                              `${throughline.character_solution ? `**Solution:** ${throughline.character_solution}\n` : ''}` +
                              `${throughline.character_arc ? `**Arc:** ${throughline.character_arc}\n` : ''}` +
                              `**Throughline ID:** ${throughline.id}\n` +
                              `**Last Updated:** ${new Date(throughline.updated_at || throughline.created_at).toLocaleString()}`
                    }
                ]
            };
            
        } catch (error) {
            throw new Error(`Failed to track character throughlines: ${error.message}`);
        }
    }
    
    async handleIdentifyStoryAppreciations(args) {
        try {
            if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
                throw new Error('book_id must be a positive number');
            }
            
            if (!args.appreciation_type || typeof args.appreciation_type !== 'string') {
                throw new Error('appreciation_type must be a non-empty string');
            }
            
            if (!args.appreciation_value || typeof args.appreciation_value !== 'string') {
                throw new Error('appreciation_value must be a non-empty string');
            }
            
            // Check if book exists
            const bookCheck = await this.db.query(
                'SELECT b.id, b.title, s.title as series_title FROM books b JOIN series s ON b.series_id = s.id WHERE b.id = $1',
                [args.book_id]
            );
            
            if (bookCheck.rows.length === 0) {
                throw new Error(`Book with ID ${args.book_id} not found`);
            }
            
            const book = bookCheck.rows[0];
            
            // Try to store in story appreciations table, or fall back to story_analysis
            try {
                const insertQuery = `
                    INSERT INTO story_appreciations (
                        book_id, appreciation_type, appreciation_value, supporting_evidence, confidence_level
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, created_at
                `;
                
                const result = await this.db.query(insertQuery, [
                    args.book_id,
                    args.appreciation_type,
                    args.appreciation_value,
                    args.supporting_evidence || null,
                    args.confidence_level || 5
                ]);
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Story appreciation identified!\n\n` +
                                  `**Book:** "${book.title}" (${book.series_title})\n` +
                                  `**Appreciation Type:** ${args.appreciation_type}\n` +
                                  `**Value:** ${args.appreciation_value}\n` +
                                  `**Confidence Level:** ${args.confidence_level || 5}/10\n` +
                                  `${args.supporting_evidence ? `**Evidence:** ${args.supporting_evidence}\n` : ''}` +
                                  `**Appreciation ID:** ${result.rows[0].id}\n` +
                                  `**Recorded:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                        }
                    ]
                };
                
            } catch (tableError) {
                if (tableError.message.includes('relation "story_appreciations" does not exist')) {
                    // Fall back to storing in story_analysis notes
                    const appreciationText = `Story Appreciation - ${args.appreciation_type}:\n` +
                                           `Value: ${args.appreciation_value}\n` +
                                           `Confidence: ${args.confidence_level || 5}/10\n` +
                                           `${args.supporting_evidence ? `Evidence: ${args.supporting_evidence}\n` : ''}`;
                    
                    const insertIntoAnalysisQuery = `
                        INSERT INTO story_analysis (book_id, analysis_notes) 
                        VALUES ($1, $2)
                        ON CONFLICT (book_id) DO UPDATE SET
                            analysis_notes = COALESCE(story_analysis.analysis_notes, '') || '\n\n' || $2,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING id
                    `;
                    
                    await this.db.query(insertIntoAnalysisQuery, [args.book_id, appreciationText]);
                    
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Story appreciation identified and stored!\n\n` +
                                      `**Book:** "${book.title}" (${book.series_title})\n` +
                                      `**Appreciation Type:** ${args.appreciation_type}\n` +
                                      `**Value:** ${args.appreciation_value}\n` +
                                      `**Confidence Level:** ${args.confidence_level || 5}/10\n` +
                                      `${args.supporting_evidence ? `**Evidence:** ${args.supporting_evidence}\n` : ''}` +
                                      `\n*Note: Stored in story analysis notes (story_appreciations table not available)*`
                            }
                        ]
                    };
                }
                throw tableError;
            }
            
        } catch (error) {
            throw new Error(`Failed to identify story appreciations: ${error.message}`);
        }
    }
    
    async handleMapProblemSolutions(args) {
        try {
            if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
                throw new Error('book_id must be a positive number');
            }
            
            if (!args.problem || typeof args.problem !== 'string' || args.problem.trim().length === 0) {
                throw new Error('problem must be a non-empty string');
            }
            
            if (!args.solution || typeof args.solution !== 'string' || args.solution.trim().length === 0) {
                throw new Error('solution must be a non-empty string');
            }
            
            const validProblemLevels = ['overall_story', 'main_character', 'influence_character', 'relationship'];
            if (!validProblemLevels.includes(args.problem_level)) {
                throw new Error(`problem_level must be one of: ${validProblemLevels.join(', ')}`);
            }
            
            // Check if book exists
            const bookCheck = await this.db.query(
                'SELECT b.id, b.title, s.title as series_title FROM books b JOIN series s ON b.series_id = s.id WHERE b.id = $1',
                [args.book_id]
            );
            
            if (bookCheck.rows.length === 0) {
                throw new Error(`Book with ID ${args.book_id} not found`);
            }
            
            const book = bookCheck.rows[0];
            
            // Try to store in problem_solutions table, or fall back to story_analysis
            try {
                const insertQuery = `
                    INSERT INTO problem_solutions (
                        book_id, problem, solution, problem_level, effectiveness
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, created_at
                `;
                
                const result = await this.db.query(insertQuery, [
                    args.book_id,
                    args.problem,
                    args.solution,
                    args.problem_level,
                    args.effectiveness || 'unknown'
                ]);
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Problem-solution mapping created!\n\n` +
                                  `**Book:** "${book.title}" (${book.series_title})\n` +
                                  `**Problem Level:** ${args.problem_level}\n` +
                                  `**Problem:** ${args.problem}\n` +
                                  `**Solution:** ${args.solution}\n` +
                                  `**Effectiveness:** ${args.effectiveness || 'unknown'}\n` +
                                  `**Mapping ID:** ${result.rows[0].id}\n` +
                                  `**Recorded:** ${new Date(result.rows[0].created_at).toLocaleString()}`
                        }
                    ]
                };
                
            } catch (tableError) {
                if (tableError.message.includes('relation "problem_solutions" does not exist')) {
                    // Fall back to storing in story_analysis notes
                    const problemSolutionText = `Problem-Solution Mapping (${args.problem_level}):\n` +
                                              `Problem: ${args.problem}\n` +
                                              `Solution: ${args.solution}\n` +
                                              `Effectiveness: ${args.effectiveness || 'unknown'}`;
                    
                    const insertIntoAnalysisQuery = `
                        INSERT INTO story_analysis (book_id, analysis_notes) 
                        VALUES ($1, $2)
                        ON CONFLICT (book_id) DO UPDATE SET
                            analysis_notes = COALESCE(story_analysis.analysis_notes, '') || '\n\n' || $2,
                            updated_at = CURRENT_TIMESTAMP
                        RETURNING id
                    `;
                    
                    await this.db.query(insertIntoAnalysisQuery, [args.book_id, problemSolutionText]);
                    
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Problem-solution mapping stored!\n\n` +
                                      `**Book:** "${book.title}" (${book.series_title})\n` +
                                      `**Problem Level:** ${args.problem_level}\n` +
                                      `**Problem:** ${args.problem}\n` +
                                      `**Solution:** ${args.solution}\n` +
                                      `**Effectiveness:** ${args.effectiveness || 'unknown'}\n` +
                                      `\n*Note: Stored in story analysis notes (problem_solutions table not available)*`
                            }
                        ]
                    };
                }
                throw tableError;
            }
            
        } catch (error) {
            throw new Error(`Failed to map problem-solutions: ${error.message}`);
        }
    }
}
