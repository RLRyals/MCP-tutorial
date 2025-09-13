// src/mcps/plot-server/schemas/plot-tools-schema.js
// Centralized tool schema definitions for the Plot MCP Server

// =============================================
// PLOT THREAD TOOL SCHEMAS
// =============================================
export const plotThreadToolsSchema = [
    {
        name: 'create_plot_thread',
        description: 'Create a new plot thread (story arc, subplot, character arc)',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                title: { type: 'string', description: 'Plot thread title' },
                description: { type: 'string', description: 'Plot thread description' },
                thread_type: { 
                    type: 'string', 
                    description: 'Type of plot thread (values from plot_thread_types lookup table)'
                },
                importance_level: { 
                    type: 'integer', 
                    minimum: 1, 
                    maximum: 10, 
                    default: 5,
                    description: 'Importance level (1-10)'
                },
                complexity_level: { 
                    type: 'integer', 
                    minimum: 1, 
                    maximum: 10, 
                    default: 5,
                    description: 'Complexity level (1-10)'
                },
                start_book: { type: 'integer', description: 'Starting book number' },
                end_book: { type: 'integer', description: 'Ending book number (optional for ongoing threads)' },
                related_characters: { 
                    type: 'array', 
                    items: { type: 'integer' },
                    description: 'Array of related character IDs'
                },
                parent_thread_id: { type: 'integer', description: 'Parent thread ID for sub-threads' }
            },
            required: ['series_id', 'title', 'description', 'thread_type']
        }
    },
    {
        name: 'update_plot_thread',
        description: 'Update plot thread information and status',
        inputSchema: {
            type: 'object',
            properties: {
                thread_id: { type: 'integer', description: 'Plot thread ID' },
                title: { type: 'string', description: 'Plot thread title' },
                description: { type: 'string', description: 'Plot thread description' },
                current_status: { 
                    type: 'string', 
                    enum: ['active', 'resolved', 'on_hold', 'abandoned'],
                    description: 'Thread status'
                },
                end_book: { type: 'integer', description: 'Ending book number' },
                resolution_notes: { type: 'string', description: 'Resolution details' },
                resolution_book: { type: 'integer', description: 'Book where resolved' }
            },
            required: ['thread_id']
        }
    },
    {
        name: 'get_plot_threads',
        description: 'Get plot threads for a series with filtering options',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: { type: 'integer', description: 'Series ID' },
                thread_type: { type: 'string', description: 'Filter by thread type' },
                current_status: { type: 'string', description: 'Filter by status' },
                book_number: { type: 'integer', description: 'Filter threads active in specific book' },
                importance_min: { type: 'integer', description: 'Minimum importance level' }
            },
            required: ['series_id']
        }
    },
    {
        name: 'link_plot_threads',
        description: 'Create relationships between plot threads',
        inputSchema: {
            type: 'object',
            properties: {
                thread_a_id: { type: 'integer', description: 'First thread ID' },
                thread_b_id: { type: 'integer', description: 'Second thread ID' },
                relationship_type: { 
                    type: 'string', 
                    description: 'Type of relationship (values from relationship_types lookup table)'
                },
                relationship_description: { type: 'string', description: 'Description of the relationship' },
                strength: { 
                    type: 'integer', 
                    minimum: 1, 
                    maximum: 10, 
                    default: 5,
                    description: 'Relationship strength (1-10)'
                },
                established_book: { type: 'integer', description: 'Book where relationship is established' }
            },
            required: ['thread_a_id', 'thread_b_id', 'relationship_type']
        }
    },
    {
        name: 'resolve_plot_thread',
        description: 'Mark a plot thread as resolved with details',
        inputSchema: {
            type: 'object',
            properties: {
                thread_id: { type: 'integer', description: 'Plot thread ID' },
                resolution_book: { type: 'integer', description: 'Book where resolved' },
                resolution_notes: { type: 'string', description: 'How the thread was resolved' }
            },
            required: ['thread_id', 'resolution_book', 'resolution_notes']
        }
    }
];

// =============================================
// STORY ANALYSIS TOOL SCHEMAS
// =============================================
export const storyAnalysisToolsSchema = [
    {
        name: 'analyze_story_dynamics',
        description: 'Analyze story dynamics using Dramatica-inspired elements',
        inputSchema: {
            type: 'object',
            properties: {
                book_id: { type: 'integer', description: 'Book ID' },
                story_concern: { 
                    type: 'string', 
                    description: 'What the overall story is about (values from story_concerns lookup table)'
                },
                main_character_problem: { type: 'string', description: 'Personal issues driving the protagonist' },
                influence_character_impact: { type: 'string', description: 'How other characters challenge the MC' },
                story_outcome: { 
                    type: 'string', 
                    description: 'Whether the story goal is achieved (values from story_outcomes lookup table)'
                },
                story_judgment: { 
                    type: 'string', 
                    description: 'Whether the outcome feels satisfying (values from story_judgments lookup table)'
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
// GENRE EXTENSION TOOL SCHEMAS
// =============================================
export const genreExtensionToolsSchema = {
    mystery: [
        {
            name: 'create_case',
            description: 'Create a new mystery case',
            inputSchema: {
                type: 'object',
                properties: {
                    plot_thread_id: { type: 'integer', description: 'Associated plot thread ID' },
                    case_name: { type: 'string', description: 'Name of the case' },
                    victim_info: { type: 'string', description: 'Information about the victim' },
                    case_status: { 
                        type: 'string', 
                        enum: ['open', 'investigating', 'solved', 'cold'],
                        description: 'Current status of the case'
                    },
                    initial_suspects: { 
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Initial list of suspects'
                    }
                },
                required: ['plot_thread_id', 'case_name']
            }
        },
        {
            name: 'add_evidence',
            description: 'Add evidence to a case',
            inputSchema: {
                type: 'object',
                properties: {
                    case_id: { type: 'integer', description: 'Case ID' },
                    evidence_type: { 
                        type: 'string', 
                        enum: ['physical', 'witness', 'circumstantial', 'digital', 'forensic'],
                        description: 'Type of evidence'
                    },
                    evidence_description: { type: 'string', description: 'Description of the evidence' },
                    discovered_by: { type: 'integer', description: 'Character ID who discovered it' },
                    discovery_chapter: { type: 'integer', description: 'Chapter where discovered' },
                    significance: { 
                        type: 'string', 
                        enum: ['critical', 'important', 'supporting', 'red_herring'],
                        description: 'Significance of the evidence'
                    }
                },
                required: ['case_id', 'evidence_type', 'evidence_description']
            }
        },
        {
            name: 'track_clues',
            description: 'Track clues and their relationships',
            inputSchema: {
                type: 'object',
                properties: {
                    case_id: { type: 'integer', description: 'Case ID' },
                    clue_description: { type: 'string', description: 'Description of the clue' },
                    leads_to: { type: 'string', description: 'What this clue leads to' },
                    revealed_chapter: { type: 'integer', description: 'Chapter where clue is revealed' },
                    is_red_herring: { type: 'boolean', description: 'Whether this is a red herring' }
                },
                required: ['case_id', 'clue_description']
            }
        }
    ],
    romance: [
        {
            name: 'create_relationship_arc',
            description: 'Create a romantic relationship arc',
            inputSchema: {
                type: 'object',
                properties: {
                    plot_thread_id: { type: 'integer', description: 'Associated plot thread ID' },
                    character_a_id: { type: 'integer', description: 'First character ID' },
                    character_b_id: { type: 'integer', description: 'Second character ID' },
                    relationship_stage: { 
                        type: 'string', 
                        enum: ['strangers', 'acquaintances', 'friends', 'attracted', 'dating', 'committed', 'separated'],
                        description: 'Current relationship stage'
                    },
                    tension_level: { 
                        type: 'integer', 
                        minimum: 1, 
                        maximum: 10,
                        description: 'Current romantic tension level (1-10)'
                    }
                },
                required: ['plot_thread_id', 'character_a_id', 'character_b_id']
            }
        },
        {
            name: 'track_romantic_tension',
            description: 'Track romantic tension between characters',
            inputSchema: {
                type: 'object',
                properties: {
                    arc_id: { type: 'integer', description: 'Romance arc ID' },
                    chapter_id: { type: 'integer', description: 'Chapter ID' },
                    tension_change: { 
                        type: 'integer', 
                        minimum: -10, 
                        maximum: 10,
                        description: 'Change in tension level (-10 to +10)'
                    },
                    trigger_event: { type: 'string', description: 'What caused the tension change' }
                },
                required: ['arc_id', 'chapter_id', 'tension_change']
            }
        }
    ],
    fantasy: [
        {
            name: 'define_magic_system',
            description: 'Define or update magic system rules',
            inputSchema: {
                type: 'object',
                properties: {
                    series_id: { type: 'integer', description: 'Series ID' },
                    magic_type: { type: 'string', description: 'Type of magic system' },
                    power_source: { type: 'string', description: 'Source of magical power' },
                    limitations: { 
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Limitations and costs of magic use'
                    },
                    rules: { 
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Rules governing magic use'
                    }
                },
                required: ['series_id', 'magic_type']
            }
        },
        {
            name: 'track_power_progression',
            description: 'Track character magical power progression',
            inputSchema: {
                type: 'object',
                properties: {
                    character_id: { type: 'integer', description: 'Character ID' },
                    book_id: { type: 'integer', description: 'Book ID' },
                    power_level: { 
                        type: 'integer', 
                        minimum: 1, 
                        maximum: 10,
                        description: 'Current power level (1-10)'
                    },
                    new_abilities: { 
                        type: 'array',
                        items: { type: 'string' },
                        description: 'New abilities gained'
                    },
                    power_cost: { type: 'string', description: 'What character sacrificed for this power' }
                },
                required: ['character_id', 'book_id', 'power_level']
            }
        }
    ]
};

// =============================================
// LOOKUP SYSTEM TOOL SCHEMAS
// =============================================
export const lookupSystemToolsSchema = [
    {
        name: 'get_available_options',
        description: 'Get available options from lookup tables (genres, tropes, categories, etc.)',
        inputSchema: {
            type: 'object',
            properties: {
                option_type: {
                    type: 'string',
                    enum: ['genres', 'trope_categories', 'story_tropes', 'genre_templates'],
                    description: 'Type of options to retrieve'
                },
                genre_filter: { 
                    type: 'string', 
                    description: 'Filter by specific genre name (optional)' 
                },
                active_only: { 
                    type: 'boolean', 
                    default: true, 
                    description: 'Only return active/available options'
                }
            },
            required: ['option_type']
        }
    }
];
