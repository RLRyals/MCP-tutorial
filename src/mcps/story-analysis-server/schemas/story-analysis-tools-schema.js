// src/mcps/story-analysis-server/schemas/story-analysis-tools-schema.js
// Tool schemas for story analysis features
// NOTE: These tools are inspired by narrative theory principles

// =============================================
// STORY ANALYSIS TOOL SCHEMAS
// =============================================
export const storyAnalysisToolsSchema = [
    {
        name: 'analyze_story_dynamics',
        description: 'Analyze story dynamics using narrative elements',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                story_concern: {
                    type: 'string',
                    description: 'What the overall story is about (use metadata-server\'s get_available_options with option_type="story_concerns" to see valid values)'
                },
                main_character_problem: { type: 'string', description: 'Personal issues driving the protagonist' },
                influence_character_impact: { type: 'string', description: 'How other characters challenge the MC' },
                story_outcome: {
                    type: 'string',
                    description: 'Whether the story goal is achieved (use metadata-server\'s get_available_options with option_type="story_outcomes" to see valid values)'
                },
                story_judgment: {
                    type: 'string',
                    description: 'Whether the outcome feels satisfying (use metadata-server\'s get_available_options with option_type="story_judgments" to see valid values)'
                },
                thematic_elements: {
                    type: 'object',
                    description: 'Values and themes in conflict'
                },
                analysis_notes: { type: 'string', description: 'Additional analysis notes' }
            },
            required: ['book_id']
        }
    },
    {
        name: 'track_character_throughlines',
        description: 'Track character development throughlines',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                character_id: { type: 'integer', description: 'Character ID' },
                throughline_type: {
                    type: 'string',
                    enum: ['main_character', 'influence_character', 'relationship', 'objective_story'],
                    description: 'Type of character throughline'
                },
                character_problem: { type: 'string', description: 'Character\'s core problem' },
                character_solution: { type: 'string', description: 'How character addresses the problem' },
                character_arc: { type: 'string', description: 'Character development arc' }
            },
            required: ['book_id', 'character_id', 'throughline_type']
        }
    },
    {
        name: 'identify_story_appreciations',
        description: 'Identify and track story appreciations that emerge organically',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                appreciation_type: { type: 'string', description: 'Type of story appreciation' },
                appreciation_value: { type: 'string', description: 'The appreciation value' },
                supporting_evidence: { type: 'string', description: 'Evidence from the story' },
                confidence_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Confidence in this appreciation (1-10)'
                }
            },
            required: ['book_id', 'appreciation_type', 'appreciation_value']
        }
    },
    {
        name: 'map_problem_solutions',
        description: 'Map problem/solution dynamics in the story',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                problem: { type: 'string', description: 'The problem being addressed' },
                solution: { type: 'string', description: 'The solution being attempted' },
                problem_level: {
                    type: 'string',
                    enum: ['overall_story', 'main_character', 'influence_character', 'relationship'],
                    description: 'Level where the problem exists'
                },
                effectiveness: {
                    type: 'string',
                    enum: ['solves', 'complicates', 'redirects', 'unknown'],
                    description: 'How effective the solution is'
                }
            },
            required: ['book_id', 'problem', 'solution', 'problem_level']
        }
    }
];

// =============================================
// LOOKUP SYSTEM TOOL SCHEMAS
// =============================================
// NOTE: Lookup tools have been consolidated in metadata-server to avoid name conflicts.
// Use the metadata-server's 'get_available_options' tool to retrieve lookup values.
// This eliminates duplicate tool names across servers.
export const lookupSystemToolsSchema = [];
