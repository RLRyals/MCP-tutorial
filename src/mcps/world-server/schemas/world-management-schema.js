// src/mcps/world-server/schemas/world-management-schema.js
// Schema definitions for World Management tools

export const worldManagementSchemas = [
    {
        name: 'check_world_consistency',
        description: 'Validate world logic and consistency',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                check_type: {
                    type: 'string',
                    description: 'Check type: all, locations, elements, organizations, relationships'
                },
                severity_threshold: {
                    type: 'string',
                    description: 'Min severity: info, warning, error'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'generate_world_guide',
        description: 'Generate world reference guide',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                guide_type: {
                    type: 'string',
                    description: 'Guide type: complete, locations_only, elements_only, organizations_only, summary'
                },
                include_usage_stats: {
                    type: 'boolean',
                    description: 'Include usage stats'
                },
                format: {
                    type: 'string',
                    description: 'Format: text, structured, reference_sheet'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'analyze_world_complexity',
        description: 'Analyze world-building complexity',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                analysis_focus: {
                    type: 'string',
                    description: 'Focus: overall, power_structures, magic_systems, geography, relationships'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'find_world_gaps',
        description: 'Find gaps in world-building',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                gap_type: {
                    type: 'string',
                    description: 'Gap type: unused_locations, weak_organizations, underused_elements, missing_connections'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'validate_world_relationships',
        description: 'Validate world element relationships',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                relationship_type: {
                    type: 'string',
                    description: 'Type: all, location_hierarchies, org_alliances, element_interactions'
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'get_world_overview',
        description: 'Get world elements overview',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                include_stats: {
                    type: 'boolean',
                    description: 'Include stats',
                    default: true
                }
            },
            required: ['series_id']
        }
    },
    {
        name: 'analyze_world_usage',
        description: 'Analyze world element usage in story',
        inputSchema: {
            type: 'object',
            properties: {
                series_id: {
                    type: 'integer',
                    description: 'Series ID'
                },
                element_type: {
                    type: 'string',
                    description: 'Element type: location, world_element, organization, all',
                    default: 'all'
                }
            },
            required: ['series_id']
        }
    }
];
