// src/mcps/world-server/schemas/world-management-schema.js
// Schema definitions for World Management tools

export const worldManagementSchemas = [
    {
        name: 'check_world_consistency',
        description: 'Validate world logic and consistency across all world elements',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID to check for consistency'
                },
                check_type: {
                    type: 'string',
                    description: 'Type of consistency check: all, locations, elements, organizations, relationships'
                },
                severity_threshold: {
                    type: 'string',
                    description: 'Minimum severity to report: info, warning, error'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'generate_world_guide',
        description: 'Create comprehensive world reference guide',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID to generate guide for'
                },
                guide_type: {
                    type: 'string',
                    description: 'Type of guide: complete, locations_only, elements_only, organizations_only, summary'
                },
                include_usage_stats: {
                    type: 'boolean',
                    description: 'Include story usage statistics'
                },
                format: {
                    type: 'string',
                    description: 'Output format: text, structured, reference_sheet'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'analyze_world_complexity',
        description: 'Analyze the complexity and depth of world-building',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID to analyze'
                },
                analysis_focus: {
                    type: 'string',
                    description: 'Focus area: overall, power_structures, magic_systems, geography, relationships'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'find_world_gaps',
        description: 'Identify gaps or underutilized areas in world-building',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID to analyze for gaps'
                },
                gap_type: {
                    type: 'string',
                    description: 'Type of gaps to find: unused_locations, weak_organizations, underused_elements, missing_connections'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'validate_world_relationships',
        description: 'Check relationships and connections between world elements',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID to validate'
                },
                relationship_type: {
                    type: 'string',
                    description: 'Type to validate: all, location_hierarchies, org_alliances, element_interactions'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'get_world_overview',
        description: 'Get comprehensive overview of world elements',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID to get overview for'
                },
                include_stats: {
                    type: 'boolean',
                    description: 'Include usage statistics',
                    default: true
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'analyze_world_usage',
        description: 'Analyze how world elements are used in the story',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID to analyze'
                },
                element_type: {
                    type: 'string',
                    description: 'Filter by element type: location, world_element, organization, all',
                    default: 'all'
                }
            },
            required: ['series_id']
        }
    }
];
