// src/mcps/story-analysis-server/schemas/story-analysis-tools-schema.js
// Tool schemas for story analysis features
// NOTE: These tools are inspired by narrative theory principles

// =============================================
// STORY ANALYSIS TOOL SCHEMAS
// =============================================
export const storyAnalysisToolsSchema = [
    {
        name: 'analyze_story_dynamics',
        description: 'Analyze story dynamics',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                story_concern: {
                    type: 'string',
                    description: 'Overall story focus (use metadata-server get_available_options w/ option_type="story_concerns")'
                },
                main_character_problem: { type: 'string', description: 'Protagonist issues' },
                influence_character_impact: { type: 'string', description: 'How others challenge MC' },
                story_outcome: {
                    type: 'string',
                    description: 'Goal achieved? (use metadata-server get_available_options w/ option_type="story_outcomes")'
                },
                story_judgment: {
                    type: 'string',
                    description: 'Outcome satisfaction (use metadata-server get_available_options w/ option_type="story_judgments")'
                },
                thematic_elements: {
                    type: 'object',
                    description: 'Conflicting themes/values'
                },
                analysis_notes: { type: 'string', description: 'Additional notes' }
            },
            required: ['book_id']
        }
    },
    {
        name: 'track_character_throughlines',
        description: 'Track character throughlines',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                character_id: { type: 'integer', description: 'Character ID' },
                throughline_type: {
                    type: 'string',
                    enum: ['main_character', 'influence_character', 'relationship', 'objective_story'],
                    description: 'Throughline type'
                },
                character_problem: { type: 'string', description: 'Core problem' },
                character_solution: { type: 'string', description: 'Problem approach' },
                character_arc: { type: 'string', description: 'Development arc' }
            },
            required: ['book_id', 'character_id', 'throughline_type']
        }
    },
    {
        name: 'identify_story_appreciations',
        description: 'Track story appreciations',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                appreciation_type: { type: 'string', description: 'Appreciation type' },
                appreciation_value: { type: 'string', description: 'Appreciation value' },
                supporting_evidence: { type: 'string', description: 'Story evidence' },
                confidence_level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 10,
                    description: 'Confidence (1-10)'
                }
            },
            required: ['book_id', 'appreciation_type', 'appreciation_value']
        }
    },
    {
        name: 'map_problem_solutions',
        description: 'Map problem/solution dynamics',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                problem: { type: 'string', description: 'Problem addressed' },
                solution: { type: 'string', description: 'Solution attempted' },
                problem_level: {
                    type: 'string',
                    enum: ['overall_story', 'main_character', 'influence_character', 'relationship'],
                    description: 'Problem level'
                },
                effectiveness: {
                    type: 'string',
                    enum: ['solves', 'complicates', 'redirects', 'unknown'],
                    description: 'Solution effectiveness'
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
