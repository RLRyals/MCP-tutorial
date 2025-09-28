// src/mcps/world-server/handlers/world-management-handlers.js
// World Management Handler - FULLY IMPLEMENTED
// Handles world consistency checking, analysis, and comprehensive world guides

export class WorldManagementHandlers {
    constructor(db) {
        this.db = db;
    }

    // =============================================
    // WORLD MANAGEMENT TOOL DEFINITIONS
    // =============================================
    getWorldManagementTools() {
        return [
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
            }
        ];
    }

    // =============================================
    // WORLD MANAGEMENT HANDLERS
    // =============================================

    async handleCheckWorldConsistency(args) {
        try {
            const { series_id, check_type = 'all', severity_threshold = 'warning' } = args;
            
            const issues = [];
            
            // Check for orphaned elements
            if (check_type === 'all' || check_type === 'locations') {
                const orphanedLocations = await this.db.query(`
                    SELECT id, name FROM locations 
                    WHERE series_id = $1 AND parent_location_id IS NOT NULL 
                    AND parent_location_id NOT IN (SELECT id FROM locations WHERE series_id = $1)
                `, [series_id]);
                
                orphanedLocations.rows.forEach(loc => {
                    issues.push({
                        type: 'location',
                        severity: 'error',
                        issue: `Location "${loc.name}" has invalid parent location reference`,
                        element_id: loc.id
                    });
                });
            }
            
            // Check for unused world elements
            if (check_type === 'all' || check_type === 'elements') {
                const unusedElements = await this.db.query(`
                    SELECT we.id, we.name, we.element_type 
                    FROM world_elements we 
                    WHERE we.series_id = $1 
                    AND NOT EXISTS (
                        SELECT 1 FROM world_element_usage weu 
                        WHERE weu.element_type = 'world_element' AND weu.element_id = we.id
                    )
                `, [series_id]);
                
                unusedElements.rows.forEach(elem => {
                    issues.push({
                        type: 'world_element',
                        severity: 'info',
                        issue: `World element "${elem.name}" (${elem.element_type}) has never been used in the story`,
                        element_id: elem.id
                    });
                });
            }
            
            // Check for organization inconsistencies
            if (check_type === 'all' || check_type === 'organizations') {
                const orgInconsistencies = await this.db.query(`
                    SELECT o.id, o.name, o.headquarters_location_id 
                    FROM organizations o 
                    WHERE o.series_id = $1 AND o.headquarters_location_id IS NOT NULL
                    AND o.headquarters_location_id NOT IN (SELECT id FROM locations WHERE series_id = $1)
                `, [series_id]);
                
                orgInconsistencies.rows.forEach(org => {
                    issues.push({
                        type: 'organization',
                        severity: 'error',
                        issue: `Organization "${org.name}" has invalid headquarters location reference`,
                        element_id: org.id
                    });
                });
            }
            
            // Check for power level imbalances
            if (check_type === 'all' || check_type === 'organizations') {
                const powerImbalance = await this.db.query(`
                    SELECT COUNT(*) as high_power_count 
                    FROM organizations 
                    WHERE series_id = $1 AND power_level >= 8
                `, [series_id]);
                
                if (powerImbalance.rows[0].high_power_count > 5) {
                    issues.push({
                        type: 'power_balance',
                        severity: 'warning',
                        issue: `Many high-power organizations (${powerImbalance.rows[0].high_power_count}) may create power imbalance`,
                        element_id: null
                    });
                }
            }
            
            // Filter by severity threshold
            const severityOrder = { 'info': 0, 'warning': 1, 'error': 2 };
            const thresholdLevel = severityOrder[severity_threshold] || 1;
            const filteredIssues = issues.filter(issue => severityOrder[issue.severity] >= thresholdLevel);
            
            if (filteredIssues.length === 0) {
                return {
                    content: [{
                        type: 'text',
                        text: `✅ World consistency check passed!\n\nNo ${severity_threshold} or higher severity issues found for series ${series_id}.`
                    }]
                };
            }
            
            let reportText = `World Consistency Report for Series ${series_id}\n`;
            reportText += `Found ${filteredIssues.length} issues (threshold: ${severity_threshold}+)\n\n`;
            
            const groupedIssues = filteredIssues.reduce((groups, issue) => {
                const key = issue.severity;
                if (!groups[key]) groups[key] = [];
                groups[key].push(issue);
                return groups;
            }, {});
            
            ['error', 'warning', 'info'].forEach(severity => {
                if (groupedIssues[severity]) {
                    reportText += `${severity.toUpperCase()} Issues (${groupedIssues[severity].length}):\n`;
                    groupedIssues[severity].forEach((issue, index) => {
                        reportText += `  ${index + 1}. ${issue.issue}\n`;
                        if (issue.element_id) {
                            reportText += `     Element ID: ${issue.element_id} (${issue.type})\n`;
                        }
                    });
                    reportText += '\n';
                }
            });
            
            return {
                content: [{
                    type: 'text',
                    text: reportText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to check world consistency: ${error.message}`);
        }
    }

    async handleGenerateWorldGuide(args) {
        try {
            const { 
                series_id, 
                guide_type = 'complete', 
                include_usage_stats = true, 
                format = 'text' 
            } = args;
            
            let guideText = `World Guide for Series ${series_id}\n`;
            guideText += `Generated: ${new Date().toISOString()}\n`;
            guideText += `Guide Type: ${guide_type}\n\n`;
            
            // Get series info
            const seriesQuery = 'SELECT title, description FROM series WHERE series_id = $1';
            const seriesResult = await this.db.query(seriesQuery, [series_id]);
            if (seriesResult.rows.length > 0) {
                const series = seriesResult.rows[0];
                guideText += `📚 Series: ${series.title}\n`;
                if (series.description) {
                    guideText += `Description: ${series.description}\n`;
                }
                guideText += '\n';
            }
            
            // Locations section
            if (guide_type === 'complete' || guide_type === 'locations_only') {
                const locationsQuery = `
                    SELECT l.*, 
                           ${include_usage_stats ? 
                             '(SELECT COUNT(*) FROM world_element_usage WHERE element_type = \'location\' AND element_id = l.id) as usage_count' :
                             '0 as usage_count'}
                    FROM locations l 
                    WHERE l.series_id = $1 
                    ORDER BY l.location_type, l.name
                `;
                
                const locations = await this.db.query(locationsQuery, [series_id]);
                
                if (locations.rows.length > 0) {
                    guideText += `🗺️ LOCATIONS (${locations.rows.length})\n`;
                    guideText += '=' + '='.repeat(50) + '\n\n';
                    
                    const locationsByType = locations.rows.reduce((groups, loc) => {
                        const type = loc.location_type || 'Other';
                        if (!groups[type]) groups[type] = [];
                        groups[type].push(loc);
                        return groups;
                    }, {});
                    
                    Object.keys(locationsByType).forEach(type => {
                        guideText += `${type.toUpperCase()}:\n`;
                        locationsByType[type].forEach(loc => {
                            guideText += `  • ${loc.name}`;
                            if (include_usage_stats && loc.usage_count > 0) {
                                guideText += ` (used ${loc.usage_count} times)`;
                            }
                            guideText += '\n';
                            if (loc.description) {
                                guideText += `    ${loc.description}\n`;
                            }
                            if (loc.notable_features && loc.notable_features.length > 0) {
                                guideText += `    Features: ${loc.notable_features.join(', ')}\n`;
                            }
                        });
                        guideText += '\n';
                    });
                }
            }
            
            // World Elements section
            if (guide_type === 'complete' || guide_type === 'elements_only') {
                const elementsQuery = `
                    SELECT we.*, 
                           ${include_usage_stats ? 
                             '(SELECT COUNT(*) FROM world_element_usage WHERE element_type = \'world_element\' AND element_id = we.id) as usage_count' :
                             '0 as usage_count'}
                    FROM world_elements we 
                    WHERE we.series_id = $1 
                    ORDER BY we.element_type, we.rarity, we.name
                `;
                
                const elements = await this.db.query(elementsQuery, [series_id]);
                
                if (elements.rows.length > 0) {
                    guideText += `🌟 WORLD ELEMENTS (${elements.rows.length})\n`;
                    guideText += '=' + '='.repeat(50) + '\n\n';
                    
                    const elementsByType = elements.rows.reduce((groups, elem) => {
                        const type = elem.element_type || 'Other';
                        if (!groups[type]) groups[type] = [];
                        groups[type].push(elem);
                        return groups;
                    }, {});
                    
                    Object.keys(elementsByType).forEach(type => {
                        guideText += `${type.toUpperCase()}:\n`;
                        elementsByType[type].forEach(elem => {
                            guideText += `  • ${elem.name} (${elem.rarity})`;
                            if (include_usage_stats && elem.usage_count > 0) {
                                guideText += ` - used ${elem.usage_count} times`;
                            }
                            guideText += '\n';
                            guideText += `    ${elem.description}\n`;
                            if (elem.power_source) {
                                guideText += `    Power Source: ${elem.power_source}\n`;
                            }
                            if (elem.limitations && elem.limitations.length > 0) {
                                guideText += `    Limitations: ${elem.limitations.join(', ')}\n`;
                            }
                        });
                        guideText += '\n';
                    });
                }
            }
            
            // Organizations section
            if (guide_type === 'complete' || guide_type === 'organizations_only') {
                const orgsQuery = `
                    SELECT o.*, l.name as headquarters_name,
                           ${include_usage_stats ? 
                             '(SELECT COUNT(*) FROM world_element_usage WHERE element_type = \'organization\' AND element_id = o.id) as activity_count' :
                             '0 as activity_count'}
                    FROM organizations o 
                    LEFT JOIN locations l ON o.headquarters_location_id = l.id
                    WHERE o.series_id = $1 
                    ORDER BY o.power_level DESC, o.organization_type, o.name
                `;
                
                const orgs = await this.db.query(orgsQuery, [series_id]);
                
                if (orgs.rows.length > 0) {
                    guideText += `🏛️ ORGANIZATIONS (${orgs.rows.length})\n`;
                    guideText += '=' + '='.repeat(50) + '\n\n';
                    
                    const orgsByType = orgs.rows.reduce((groups, org) => {
                        const type = org.organization_type || 'Other';
                        if (!groups[type]) groups[type] = [];
                        groups[type].push(org);
                        return groups;
                    }, {});
                    
                    Object.keys(orgsByType).forEach(type => {
                        guideText += `${type.toUpperCase()}:\n`;
                        orgsByType[type].forEach(org => {
                            guideText += `  • ${org.name} (Power: ${org.power_level}/10, ${org.status})`;
                            if (include_usage_stats && org.activity_count > 0) {
                                guideText += ` - ${org.activity_count} activities`;
                            }
                            guideText += '\n';
                            if (org.headquarters_name) {
                                guideText += `    HQ: ${org.headquarters_name}\n`;
                            }
                            if (org.purpose) {
                                guideText += `    Purpose: ${org.purpose}\n`;
                            }
                            guideText += `    ${org.description}\n`;
                        });
                        guideText += '\n';
                    });
                }
            }
            
            // Summary statistics
            if (guide_type === 'summary' || guide_type === 'complete') {
                const statsQuery = `
                    SELECT 
                        (SELECT COUNT(*) FROM locations WHERE series_id = $1) as location_count,
                        (SELECT COUNT(*) FROM world_elements WHERE series_id = $1) as element_count,
                        (SELECT COUNT(*) FROM organizations WHERE series_id = $1) as org_count,
                        (SELECT COUNT(*) FROM world_element_usage weu 
                         JOIN locations l ON weu.element_id = l.id 
                         WHERE weu.element_type = 'location' AND l.series_id = $1) as location_usage,
                        (SELECT COUNT(*) FROM world_element_usage weu 
                         JOIN world_elements we ON weu.element_id = we.id 
                         WHERE weu.element_type = 'world_element' AND we.series_id = $1) as element_usage,
                        (SELECT COUNT(*) FROM world_element_usage weu 
                         JOIN organizations o ON weu.element_id = o.id 
                         WHERE weu.element_type = 'organization' AND o.series_id = $1) as org_activity
                `;
                
                const stats = await this.db.query(statsQuery, [series_id]);
                const s = stats.rows[0];
                
                guideText += `📊 WORLD STATISTICS\n`;
                guideText += '=' + '='.repeat(50) + '\n';
                guideText += `Locations: ${s.location_count} (${s.location_usage} story appearances)\n`;
                guideText += `World Elements: ${s.element_count} (${s.element_usage} story uses)\n`;
                guideText += `Organizations: ${s.org_count} (${s.org_activity} story activities)\n`;
                guideText += `Total World Components: ${parseInt(s.location_count) + parseInt(s.element_count) + parseInt(s.org_count)}\n`;
                guideText += `Total Story Integration: ${parseInt(s.location_usage) + parseInt(s.element_usage) + parseInt(s.org_activity)} uses\n`;
            }
            
            return {
                content: [{
                    type: 'text',
                    text: guideText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to generate world guide: ${error.message}`);
        }
    }
    async handleAnalyzeWorldComplexity(args) {
        try {
            const { series_id, analysis_focus = 'overall' } = args;
            
            let analysisText = `World Complexity Analysis for Series ${series_id}\n`;
            analysisText += `Focus: ${analysis_focus}\n`;
            analysisText += `Generated: ${new Date().toISOString()}\n\n`;
            
            // Overall complexity metrics
            if (analysis_focus === 'overall' || analysis_focus === 'power_structures') {
                const complexityQuery = `
                    SELECT 
                        (SELECT COUNT(*) FROM locations WHERE series_id = $1) as location_count,
                        (SELECT COUNT(*) FROM world_elements WHERE series_id = $1) as element_count,
                        (SELECT COUNT(*) FROM organizations WHERE series_id = $1) as org_count,
                        (SELECT AVG(power_level) FROM organizations WHERE series_id = $1) as avg_org_power,
                        (SELECT COUNT(*) FROM locations WHERE series_id = $1 AND parent_location_id IS NOT NULL) as nested_locations,
                        (SELECT COUNT(DISTINCT element_type) FROM world_elements WHERE series_id = $1) as element_diversity,
                        (SELECT COUNT(DISTINCT organization_type) FROM organizations WHERE series_id = $1) as org_diversity
                `;
                
                const complexity = await this.db.query(complexityQuery, [series_id]);
                const c = complexity.rows[0];
                
                // Calculate complexity scores
                const locationComplexity = parseInt(c.location_count) + (parseInt(c.nested_locations) * 0.5);
                const elementComplexity = parseInt(c.element_count) * (parseInt(c.element_diversity) || 1);
                const orgComplexity = parseInt(c.org_count) * (parseFloat(c.avg_org_power) || 1) * (parseInt(c.org_diversity) || 1);
                const totalComplexity = locationComplexity + elementComplexity + orgComplexity;
                
                analysisText += `🔍 COMPLEXITY METRICS\n`;
                analysisText += `Total Components: ${parseInt(c.location_count) + parseInt(c.element_count) + parseInt(c.org_count)}\n`;
                analysisText += `Location Complexity: ${locationComplexity.toFixed(1)} (${c.location_count} total, ${c.nested_locations} nested)\n`;
                analysisText += `Element Complexity: ${elementComplexity.toFixed(1)} (${c.element_count} elements, ${c.element_diversity} types)\n`;
                analysisText += `Organization Complexity: ${orgComplexity.toFixed(1)} (${c.org_count} orgs, avg power ${parseFloat(c.avg_org_power || 0).toFixed(1)})\n`;
                analysisText += `Overall Complexity Score: ${totalComplexity.toFixed(1)}\n\n`;
                
                // Complexity rating
                let complexityRating;
                if (totalComplexity < 20) complexityRating = "Simple";
                else if (totalComplexity < 50) complexityRating = "Moderate";
                else if (totalComplexity < 100) complexityRating = "Complex";
                else complexityRating = "Highly Complex";
                
                analysisText += `📊 COMPLEXITY RATING: ${complexityRating}\n\n`;
            }
            
            // Magic/Technology Systems Analysis
            if (analysis_focus === 'overall' || analysis_focus === 'magic_systems') {
                const systemsQuery = `
                    SELECT element_type, COUNT(*) as count, 
                           AVG(CASE WHEN rarity = 'common' THEN 1 
                                   WHEN rarity = 'uncommon' THEN 2 
                                   WHEN rarity = 'rare' THEN 3 
                                   WHEN rarity = 'legendary' THEN 4 ELSE 2 END) as avg_rarity
                    FROM world_elements 
                    WHERE series_id = $1 
                    GROUP BY element_type
                    ORDER BY count DESC
                `;
                
                const systems = await this.db.query(systemsQuery, [series_id]);
                
                if (systems.rows.length > 0) {
                    analysisText += `⚡ SUPERNATURAL/TECH SYSTEMS\n`;
                    systems.rows.forEach(sys => {
                        analysisText += `  ${sys.element_type}: ${sys.count} elements (avg rarity: ${parseFloat(sys.avg_rarity).toFixed(1)})\n`;
                    });
                    analysisText += '\n';
                }
            }
            
            // Power Structure Analysis
            if (analysis_focus === 'overall' || analysis_focus === 'power_structures') {
                const powerQuery = `
                    SELECT 
                        organization_type,
                        COUNT(*) as count,
                        AVG(power_level) as avg_power,
                        MAX(power_level) as max_power,
                        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
                    FROM organizations 
                    WHERE series_id = $1 
                    GROUP BY organization_type
                    ORDER BY avg_power DESC
                `;
                
                const powers = await this.db.query(powerQuery, [series_id]);
                
                if (powers.rows.length > 0) {
                    analysisText += `👑 POWER STRUCTURES\n`;
                    powers.rows.forEach(pow => {
                        analysisText += `  ${pow.organization_type}: ${pow.count} orgs, `;
                        analysisText += `avg power ${parseFloat(pow.avg_power).toFixed(1)}/10 `;
                        analysisText += `(max: ${pow.max_power}, active: ${pow.active_count})\n`;
                    });
                    analysisText += '\n';
                }
            }
            
            // Geographic Analysis
            if (analysis_focus === 'overall' || analysis_focus === 'geography') {
                const geoQuery = `
                    SELECT 
                        location_type,
                        COUNT(*) as count,
                        COUNT(CASE WHEN parent_location_id IS NOT NULL THEN 1 END) as nested_count,
                        COUNT(CASE WHEN climate IS NOT NULL THEN 1 END) as detailed_count
                    FROM locations 
                    WHERE series_id = $1 
                    GROUP BY location_type
                    ORDER BY count DESC
                `;
                
                const geography = await this.db.query(geoQuery, [series_id]);
                
                if (geography.rows.length > 0) {
                    analysisText += `🗺️ GEOGRAPHIC DIVERSITY\n`;
                    geography.rows.forEach(geo => {
                        analysisText += `  ${geo.location_type}: ${geo.count} locations `;
                        analysisText += `(${geo.nested_count} nested, ${geo.detailed_count} detailed)\n`;
                    });
                    analysisText += '\n';
                }
            }
            
            return {
                content: [{
                    type: 'text',
                    text: analysisText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to analyze world complexity: ${error.message}`);
        }
    }

    async handleFindWorldGaps(args) {
        try {
            const { series_id, gap_type = 'unused_locations' } = args;
            
            let gapsText = `World Gap Analysis for Series ${series_id}\n`;
            gapsText += `Gap Type: ${gap_type}\n`;
            gapsText += `Generated: ${new Date().toISOString()}\n\n`;
            
            const gaps = [];
            
            // Find unused locations
            if (gap_type === 'all' || gap_type === 'unused_locations') {
                const unusedLocQuery = `
                    SELECT l.id, l.name, l.location_type, l.description
                    FROM locations l
                    WHERE l.series_id = $1 
                    AND NOT EXISTS (
                        SELECT 1 FROM world_element_usage weu 
                        WHERE weu.element_type = 'location' AND weu.element_id = l.id
                    )
                    ORDER BY l.name
                `;
                
                const unusedLocs = await this.db.query(unusedLocQuery, [series_id]);
                
                if (unusedLocs.rows.length > 0) {
                    gaps.push({
                        type: 'Unused Locations',
                        count: unusedLocs.rows.length,
                        items: unusedLocs.rows.map(loc => `${loc.name} (${loc.location_type})`),
                        suggestion: 'Consider incorporating these locations into future scenes or removing if not needed.'
                    });
                }
            }
            
            // Find weak organizations (low power, no activity)
            if (gap_type === 'all' || gap_type === 'weak_organizations') {
                const weakOrgsQuery = `
                    SELECT o.id, o.name, o.organization_type, o.power_level
                    FROM organizations o
                    WHERE o.series_id = $1 AND o.power_level <= 3
                    AND NOT EXISTS (
                        SELECT 1 FROM world_element_usage weu 
                        WHERE weu.element_type = 'organization' AND weu.element_id = o.id
                    )
                    ORDER BY o.power_level, o.name
                `;
                
                const weakOrgs = await this.db.query(weakOrgsQuery, [series_id]);
                
                if (weakOrgs.rows.length > 0) {
                    gaps.push({
                        type: 'Underutilized Organizations',
                        count: weakOrgs.rows.length,
                        items: weakOrgs.rows.map(org => `${org.name} (${org.organization_type}, power ${org.power_level})`),
                        suggestion: 'Consider strengthening these organizations or giving them story roles.'
                    });
                }
            }
            
            // Find underused world elements
            if (gap_type === 'all' || gap_type === 'underused_elements') {
                const underusedQuery = `
                    SELECT we.id, we.name, we.element_type, we.rarity,
                           COUNT(weu.usage_id) as usage_count
                    FROM world_elements we
                    LEFT JOIN world_element_usage weu ON weu.element_type = 'world_element' AND weu.element_id = we.id
                    WHERE we.series_id = $1
                    GROUP BY we.id, we.name, we.element_type, we.rarity
                    HAVING COUNT(weu.usage_id) < 2 AND we.rarity IN ('rare', 'legendary')
                    ORDER BY we.rarity DESC, usage_count
                `;
                
                const underused = await this.db.query(underusedQuery, [series_id]);
                
                if (underused.rows.length > 0) {
                    gaps.push({
                        type: 'Underused Rare Elements',
                        count: underused.rows.length,
                        items: underused.rows.map(elem => `${elem.name} (${elem.element_type}, ${elem.rarity}, used ${elem.usage_count} times)`),
                        suggestion: 'Rare/legendary elements should appear more frequently to justify their importance.'
                    });
                }
            }
            
            // Find missing connections
            if (gap_type === 'all' || gap_type === 'missing_connections') {
                const isolatedOrgsQuery = `
                    SELECT o.id, o.name, o.organization_type, o.power_level
                    FROM organizations o
                    WHERE o.series_id = $1 AND o.power_level >= 7
                    AND (o.allies IS NULL OR array_length(o.allies, 1) IS NULL)
                    AND (o.enemies IS NULL OR array_length(o.enemies, 1) IS NULL)
                    ORDER BY o.power_level DESC
                `;
                
                const isolated = await this.db.query(isolatedOrgsQuery, [series_id]);
                
                if (isolated.rows.length > 0) {
                    gaps.push({
                        type: 'Isolated High-Power Organizations',
                        count: isolated.rows.length,
                        items: isolated.rows.map(org => `${org.name} (${org.organization_type}, power ${org.power_level})`),
                        suggestion: 'High-power organizations should have relationships with others for realistic world dynamics.'
                    });
                }
            }
            
            // Generate report
            if (gaps.length === 0) {
                gapsText += `✅ No significant gaps found!\n\nYour world appears well-integrated and balanced.`;
            } else {
                gapsText += `Found ${gaps.length} areas for improvement:\n\n`;
                
                gaps.forEach((gap, index) => {
                    gapsText += `${index + 1}. ${gap.type} (${gap.count})\n`;
                    gapsText += `   ${gap.suggestion}\n`;
                    gapsText += `   Items:\n`;
                    gap.items.forEach(item => {
                        gapsText += `     • ${item}\n`;
                    });
                    gapsText += '\n';
                });
            }
            
            return {
                content: [{
                    type: 'text',
                    text: gapsText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to find world gaps: ${error.message}`);
        }
    }

    async handleValidateWorldRelationships(args) {
        try {
            const { series_id, relationship_type = 'all' } = args;
            
            let validationText = `World Relationship Validation for Series ${series_id}\n`;
            validationText += `Relationship Type: ${relationship_type}\n`;
            validationText += `Generated: ${new Date().toISOString()}\n\n`;
            
            const issues = [];
            
            // Validate location hierarchies
            if (relationship_type === 'all' || relationship_type === 'location_hierarchies') {
                const hierarchyIssues = await this.db.query(`
                    WITH RECURSIVE location_tree AS (
                        SELECT id, name, parent_location_id, 1 as depth, ARRAY[id] as path
                        FROM locations WHERE series_id = $1 AND parent_location_id IS NULL
                        
                        UNION ALL
                        
                        SELECT l.id, l.name, l.parent_location_id, lt.depth + 1, lt.path || l.id
                        FROM locations l
                        JOIN location_tree lt ON l.parent_location_id = lt.id
                        WHERE l.series_id = $1 AND NOT (l.id = ANY(lt.path))
                    )
                    SELECT * FROM location_tree WHERE depth > 5
                `, [series_id]);
                
                if (hierarchyIssues.rows.length > 0) {
                    issues.push(`⚠️ Deep Location Hierarchies: ${hierarchyIssues.rows.length} locations are nested too deeply (>5 levels)`);
                }
            }
            
            // Validate organization alliances
            if (relationship_type === 'all' || relationship_type === 'org_alliances') {
                const allianceIssues = await this.db.query(`
                    SELECT o1.name as org1_name, o2.name as org2_name
                    FROM organizations o1
                    JOIN organizations o2 ON o2.id = ANY(o1.allies) AND o1.id = ANY(o2.enemies)
                    WHERE o1.series_id = $1 AND o2.series_id = $1
                `, [series_id]);
                
                if (allianceIssues.rows.length > 0) {
                    issues.push(`❌ Conflicting Relationships: ${allianceIssues.rows.length} organization pairs are both allies and enemies`);
                    allianceIssues.rows.forEach(conflict => {
                        issues.push(`  - ${conflict.org1_name} ↔ ${conflict.org2_name}`);
                    });
                }
            }
            
            // Check for reciprocal relationships
            if (relationship_type === 'all' || relationship_type === 'org_alliances') {
                const nonReciprocalQuery = `
                    SELECT o1.name as org1_name, o2.name as org2_name
                    FROM organizations o1
                    JOIN organizations o2 ON o2.id = ANY(o1.allies)
                    WHERE o1.series_id = $1 AND o2.series_id = $1
                    AND NOT (o1.id = ANY(o2.allies))
                `;
                
                const nonReciprocal = await this.db.query(nonReciprocalQuery, [series_id]);
                
                if (nonReciprocal.rows.length > 0) {
                    issues.push(`⚠️ Non-Reciprocal Alliances: ${nonReciprocal.rows.length} one-sided alliance relationships`);
                }
            }
            
            // Check element interactions (headquarters locations exist)
            if (relationship_type === 'all' || relationship_type === 'element_interactions') {
                const missingHQQuery = `
                    SELECT o.name, o.organization_type 
                    FROM organizations o
                    WHERE o.series_id = $1 AND o.power_level >= 6 AND o.headquarters_location_id IS NULL
                `;
                
                const missingHQ = await this.db.query(missingHQQuery, [series_id]);
                
                if (missingHQ.rows.length > 0) {
                    issues.push(`📍 Missing Headquarters: ${missingHQ.rows.length} high-power organizations lack headquarters locations`);
                    missingHQ.rows.forEach(org => {
                        issues.push(`  - ${org.name} (${org.organization_type})`);
                    });
                }
            }
            
            // Generate validation report
            if (issues.length === 0) {
                validationText += `✅ All relationships validated successfully!\n\nNo inconsistencies found in world relationships.`;
            } else {
                validationText += `Found ${issues.length} relationship issues:\n\n`;
                issues.forEach((issue, index) => {
                    validationText += `${index + 1}. ${issue}\n`;
                });
                
                validationText += '\n🔧 RECOMMENDATIONS:\n';
                validationText += '• Review conflicting relationships and resolve contradictions\n';
                validationText += '• Consider making alliances reciprocal for realistic dynamics\n';
                validationText += '• Add headquarters locations for major organizations\n';
                validationText += '• Simplify overly deep location hierarchies if needed\n';
            }
            
            return {
                content: [{
                    type: 'text',
                    text: validationText
                }]
            };
        } catch (error) {
            throw new Error(`Failed to validate world relationships: ${error.message}`);
        }
    }

}