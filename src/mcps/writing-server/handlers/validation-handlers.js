// Validation handlers for AI writing team to automatically check quality and consistency
export class ValidationHandlers {
    constructor(db) {
        this.db = db;
    }

    // Tool definitions for AI writing team validation
    getValidationTools() {
        return [
            {
                name: 'validate_chapter_structure',
                description: 'Validate chapter structure and consistency - AI team checks automatically',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book to validate' 
                        },
                        chapter_ids: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Specific chapters to validate (optional - validates all if not provided)'
                        },
                        validation_level: {
                            type: 'string',
                            enum: ['basic', 'detailed', 'comprehensive'],
                            default: 'detailed',
                            description: 'Depth of validation checks'
                        }
                    },
                    required: ['book_id']
                }
            },
            {
                name: 'validate_beat_placement',
                description: 'Validate story beats and pacing - AI team checks flow automatically',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book to analyze for beats' 
                        },
                        beat_analysis_type: {
                            type: 'string',
                            enum: ['pacing', 'character_arcs', 'plot_threads', 'emotional_beats'],
                            default: 'pacing',
                            description: 'Type of beat analysis to perform'
                        },
                        flexible_guidelines: {
                            type: 'boolean',
                            default: true,
                            description: 'Use flexible guidelines rather than rigid rules'
                        }
                    },
                    required: ['book_id']
                }
            },
            {
                name: 'check_structure_violations',
                description: 'Check for structural inconsistencies - AI team identifies issues',
                inputSchema: {
                    type: 'object',
                    properties: {
                        book_id: { 
                            type: 'integer',
                            description: 'Book to check' 
                        },
                        violation_types: {
                            type: 'array',
                            items: {
                                type: 'string',
                                enum: ['character_continuity', 'timeline_consistency', 'pov_consistency', 'location_consistency', 'plot_holes']
                            },
                            default: ['character_continuity', 'timeline_consistency', 'pov_consistency'],
                            description: 'Types of violations to check for'
                        },
                        severity_threshold: {
                            type: 'string',
                            enum: ['info', 'warning', 'error'],
                            default: 'warning',
                            description: 'Minimum severity level to report'
                        }
                    },
                    required: ['book_id']
                }
            }
        ];
    }

    // AI team validates chapter structure automatically
    async handleValidateChapterStructure(args) {
        const { book_id, chapter_ids, validation_level = 'detailed' } = args;

        try {
            // Get chapters to validate
            let chapter_filter = '';
            let query_params = [book_id];
            
            if (chapter_ids && chapter_ids.length > 0) {
                chapter_filter = `AND c.id = ANY($2)`;
                query_params.push(chapter_ids);
            }

            // Get chapter structure data
            const chapters_data = await this.db.query(`
                SELECT 
                    c.id as chapter_id, c.chapter_number, c.title, c.word_count, c.target_word_count,
                    c.status, c.pov_character_id, c.primary_location, c.story_time_start,
                    c.story_time_end, c.summary,
                    ch.name as pov_character_name,
                    COUNT(s.id) as scene_count
                FROM chapters c
                LEFT JOIN characters ch ON c.pov_character_id = ch.id
                LEFT JOIN chapter_scenes s ON c.id = s.chapter_id
                WHERE c.book_id = $1 ${chapter_filter}
                GROUP BY c.id, c.chapter_number, c.title, c.word_count, c.target_word_count,
                         c.status, c.pov_character_id, c.primary_location, c.story_time_start,
                         c.story_time_end, c.summary, ch.name
                ORDER BY c.chapter_number
            `, query_params);

            let validation_results = {
                book_id,
                validation_level,
                chapters_checked: chapters_data.rows.length,
                validation_timestamp: new Date().toISOString(),
                issues: [],
                recommendations: [],
                overall_health: 'good'
            };

            // Basic validation checks
            for (const chapter of chapters_data.rows) {
                let chapter_issues = [];

                // Check for missing essential elements (flexible, not rigid)
                if (!chapter.title || chapter.title.trim() === '') {
                    chapter_issues.push({
                        type: 'missing_title',
                        severity: 'warning',
                        message: `Chapter ${chapter.chapter_number} has no title`,
                        suggestion: 'Consider adding a descriptive title for better organization'
                    });
                }

                // Check word count inconsistencies (guidance, not requirements)
                if (chapter.target_word_count && chapter.word_count) {
                    const word_variance = Math.abs(chapter.word_count - chapter.target_word_count);
                    const variance_percentage = (word_variance / chapter.target_word_count) * 100;
                    
                    if (variance_percentage > 50) {
                        chapter_issues.push({
                            type: 'word_count_variance',
                            severity: 'info',
                            message: `Chapter ${chapter.chapter_number} word count differs significantly from target`,
                            details: `Current: ${chapter.word_count}, Target: ${chapter.target_word_count}`,
                            suggestion: 'Review if chapter length aligns with your vision'
                        });
                    }
                }

                // Check POV consistency within book
                if (validation_level === 'detailed' || validation_level === 'comprehensive') {
                    // This will be expanded to check POV consistency across chapters
                    if (!chapter.pov_character_id) {
                        chapter_issues.push({
                            type: 'missing_pov',
                            severity: 'info',
                            message: `Chapter ${chapter.chapter_number} has no POV character assigned`,
                            suggestion: 'Consider tracking POV for consistency analysis'
                        });
                    }
                }

                // Check scene structure (if applicable)
                if (chapter.scene_count === 0 && chapter.status === 'drafted') {
                    chapter_issues.push({
                        type: 'no_scenes',
                        severity: 'info',
                        message: `Chapter ${chapter.chapter_number} is drafted but has no scenes tracked`,
                        suggestion: 'Consider breaking chapter into scenes for better structure tracking'
                    });
                }

                // Add chapter issues to main results
                if (chapter_issues.length > 0) {
                    validation_results.issues.push({
                        chapter_id: chapter.id,
                        chapter_number: chapter.chapter_number,
                        issues: chapter_issues
                    });
                }
            }

            // Overall structural checks
            if (validation_level === 'comprehensive') {
                // Check chapter numbering sequence
                const chapter_numbers = chapters_data.rows.map(c => c.chapter_number).sort((a, b) => a - b);
                for (let i = 1; i < chapter_numbers.length; i++) {
                    if (chapter_numbers[i] !== chapter_numbers[i-1] + 1) {
                        validation_results.issues.push({
                            type: 'chapter_numbering_gap',
                            severity: 'warning',
                            message: `Gap in chapter numbering between ${chapter_numbers[i-1]} and ${chapter_numbers[i]}`,
                            suggestion: 'Verify chapter sequence is intentional'
                        });
                    }
                }

                // Check POV distribution (flexible guidelines)
                const pov_distribution = {};
                chapters_data.rows.forEach(chapter => {
                    if (chapter.pov_character_name) {
                        pov_distribution[chapter.pov_character_name] = (pov_distribution[chapter.pov_character_name] || 0) + 1;
                    }
                });

                if (Object.keys(pov_distribution).length > 0) {
                    validation_results.recommendations.push({
                        type: 'pov_analysis',
                        message: 'POV character distribution analysis',
                        details: pov_distribution,
                        suggestion: 'Review POV balance if needed for your story structure'
                    });
                }
            }

            // Determine overall health
            const error_count = validation_results.issues.reduce((count, issue) => 
                count + issue.issues.filter(i => i.severity === 'error').length, 0);
            const warning_count = validation_results.issues.reduce((count, issue) => 
                count + issue.issues.filter(i => i.severity === 'warning').length, 0);

            if (error_count > 0) {
                validation_results.overall_health = 'needs_attention';
            } else if (warning_count > 3) {
                validation_results.overall_health = 'could_improve';
            }

            validation_results.summary = {
                total_issues: validation_results.issues.length,
                errors: error_count,
                warnings: warning_count,
                info_items: validation_results.issues.reduce((count, issue) => 
                    count + issue.issues.filter(i => i.severity === 'info').length, 0)
            };

            return validation_results;

        } catch (error) {
            console.error('Error validating chapter structure:', error);
            throw new Error(`Failed to validate structure: ${error.message}`);
        }
    }

    // AI team validates story beats and pacing automatically
    async handleValidateBeatPlacement(args) {
        const { book_id, beat_analysis_type = 'pacing', flexible_guidelines = true } = args;

        try {
            // Get book and chapter data for beat analysis
            const book_data = await this.db.query(`
                SELECT b.title, b.target_word_count, b.actual_word_count,
                       COUNT(c.id) as chapter_count,
                       SUM(c.word_count) as total_chapter_words
                FROM books b
                LEFT JOIN chapters c ON b.id = c.book_id
                WHERE b.id = $1
                GROUP BY b.id, b.title, b.target_word_count, b.actual_word_count
            `, [book_id]);

            if (book_data.rows.length === 0) {
                throw new Error('Book not found');
            }

            const book = book_data.rows[0];
            
            let beat_analysis = {
                book_id,
                book_title: book.title,
                beat_analysis_type,
                flexible_guidelines,
                analysis_timestamp: new Date().toISOString(),
                findings: [],
                recommendations: []
            };

            // Get chapter progression data
            const chapter_progression = await this.db.query(`
                SELECT 
                    c.id as chapter_id, c.chapter_number, c.word_count, c.summary,
                    c.pov_character_id, ch.name as pov_character,
                    STRING_AGG(cpp.plot_point_type, ', ') as plot_points
                FROM chapters c
                LEFT JOIN characters ch ON c.pov_character_id = ch.id
                LEFT JOIN chapter_plot_points cpp ON c.id = cpp.chapter_id
                WHERE c.book_id = $1
                GROUP BY c.id, c.chapter_number, c.word_count, c.summary, 
                         c.pov_character_id, ch.name
                ORDER BY c.chapter_number
            `, [book_id]);

            switch (beat_analysis_type) {
                case 'pacing':
                    // Analyze pacing through word count distribution
                    const chapters = chapter_progression.rows;
                    if (chapters.length > 0) {
                        const avg_chapter_length = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0) / chapters.length;
                        
                        let pacing_issues = [];
                        chapters.forEach(chapter => {
                            if (chapter.word_count) {
                                const length_ratio = chapter.word_count / avg_chapter_length;
                                if (length_ratio > 2.0) {
                                    pacing_issues.push({
                                        chapter_number: chapter.chapter_number,
                                        issue: 'significantly_long',
                                        ratio: length_ratio.toFixed(2),
                                        suggestion: 'Consider if this chapter could be split or if the length serves the story'
                                    });
                                } else if (length_ratio < 0.5 && chapter.word_count > 500) {
                                    pacing_issues.push({
                                        chapter_number: chapter.chapter_number,
                                        issue: 'significantly_short',
                                        ratio: length_ratio.toFixed(2),
                                        suggestion: 'Consider if this chapter could be expanded or combined with another'
                                    });
                                }
                            }
                        });

                        beat_analysis.findings.push({
                            analysis: 'chapter_length_pacing',
                            avg_chapter_length: Math.round(avg_chapter_length),
                            pacing_variations: pacing_issues,
                            note: flexible_guidelines ? 'Flexible guidelines - extreme variations flagged for review' : 'Strict analysis'
                        });
                    }
                    break;

                case 'character_arcs':
                    // Analyze POV character distribution for arc balance
                    const pov_progression = {};
                    chapter_progression.rows.forEach(chapter => {
                        if (chapter.pov_character) {
                            if (!pov_progression[chapter.pov_character]) {
                                pov_progression[chapter.pov_character] = [];
                            }
                            pov_progression[chapter.pov_character].push(chapter.chapter_number);
                        }
                    });

                    beat_analysis.findings.push({
                        analysis: 'character_arc_distribution',
                        pov_progression,
                        recommendations: flexible_guidelines ? 
                            'Review character screen time for story balance' : 
                            'Ensure equal POV distribution'
                    });
                    break;

                case 'plot_threads':
                    // Analyze plot point distribution
                    const plot_distribution = {};
                    chapter_progression.rows.forEach(chapter => {
                        if (chapter.plot_points) {
                            const points = chapter.plot_points.split(', ');
                            points.forEach(point => {
                                plot_distribution[point] = (plot_distribution[point] || 0) + 1;
                            });
                        }
                    });

                    beat_analysis.findings.push({
                        analysis: 'plot_thread_distribution',
                        plot_point_frequency: plot_distribution,
                        note: 'Tracks major plot developments across chapters'
                    });
                    break;

                case 'emotional_beats':
                    // This would integrate with character emotional state tracking
                    beat_analysis.findings.push({
                        analysis: 'emotional_beats',
                        note: 'Emotional beat analysis requires character emotional state data',
                        suggestion: 'Track character emotional states in chapters for full analysis'
                    });
                    break;
            }

            // Overall beat placement assessment
            if (flexible_guidelines) {
                beat_analysis.recommendations.push({
                    type: 'flexible_structure',
                    message: 'Structure analysis focuses on organic story flow',
                    note: 'No rigid beat requirements imposed - analysis highlights patterns for author consideration'
                });
            }

            return beat_analysis;

        } catch (error) {
            console.error('Error validating beat placement:', error);
            throw new Error(`Failed to validate beats: ${error.message}`);
        }
    }

    // AI team checks for structural violations automatically
    async handleCheckStructureViolations(args) {
        const { book_id, violation_types = ['character_continuity', 'timeline_consistency', 'pov_consistency'], 
                severity_threshold = 'warning' } = args;

        try {
            let violation_report = {
                book_id,
                violation_types_checked: violation_types,
                severity_threshold,
                check_timestamp: new Date().toISOString(),
                violations: [],
                summary: { errors: 0, warnings: 0, info: 0 }
            };

            // Check each violation type requested
            for (const violation_type of violation_types) {
                switch (violation_type) {
                    case 'character_continuity':
                        const continuity_issues = await this.checkCharacterContinuity(book_id);
                        if (continuity_issues.length > 0) {
                            violation_report.violations.push({
                                type: 'character_continuity',
                                issues: continuity_issues
                            });
                        }
                        break;

                    case 'timeline_consistency':
                        const timeline_issues = await this.checkTimelineConsistency(book_id);
                        if (timeline_issues.length > 0) {
                            violation_report.violations.push({
                                type: 'timeline_consistency', 
                                issues: timeline_issues
                            });
                        }
                        break;

                    case 'pov_consistency':
                        const pov_issues = await this.checkPOVConsistency(book_id);
                        if (pov_issues.length > 0) {
                            violation_report.violations.push({
                                type: 'pov_consistency',
                                issues: pov_issues
                            });
                        }
                        break;

                    case 'location_consistency':
                        const location_issues = await this.checkLocationConsistency(book_id);
                        if (location_issues.length > 0) {
                            violation_report.violations.push({
                                type: 'location_consistency',
                                issues: location_issues
                            });
                        }
                        break;

                    case 'plot_holes':
                        const plot_issues = await this.checkPlotHoles(book_id);
                        if (plot_issues.length > 0) {
                            violation_report.violations.push({
                                type: 'plot_holes',
                                issues: plot_issues
                            });
                        }
                        break;
                }
            }

            // Calculate summary
            violation_report.violations.forEach(violation => {
                violation.issues.forEach(issue => {
                    violation_report.summary[issue.severity]++;
                });
            });

            // Filter by severity threshold
            const severity_order = { info: 1, warning: 2, error: 3 };
            const threshold_level = severity_order[severity_threshold];
            
            violation_report.violations = violation_report.violations.map(violation => ({
                ...violation,
                issues: violation.issues.filter(issue => severity_order[issue.severity] >= threshold_level)
            })).filter(violation => violation.issues.length > 0);

            return violation_report;

        } catch (error) {
            console.error('Error checking structure violations:', error);
            throw new Error(`Failed to check violations: ${error.message}`);
        }
    }

    // Helper methods for violation checking
    async checkCharacterContinuity(book_id) {
        // Check for character presence inconsistencies
        const issues = [];
        
        // Find characters who appear in non-sequential chapters
        const character_appearances = await this.db.query(`
            SELECT 
                ccp.character_id, 
                c.name,
                ARRAY_AGG(ch.chapter_number ORDER BY ch.chapter_number) as appearances
            FROM character_chapter_presence ccp
            JOIN characters c ON ccp.character_id = c.id
            JOIN chapters ch ON ccp.chapter_id = ch.id
            WHERE ch.book_id = $1
            GROUP BY ccp.character_id, c.name
        `, [book_id]);

        // This is a simplified check - would be expanded with more sophisticated logic
        character_appearances.rows.forEach(char => {
            if (char.appearances.length > 1) {
                const gaps = [];
                for (let i = 1; i < char.appearances.length; i++) {
                    const gap = char.appearances[i] - char.appearances[i-1];
                    if (gap > 5) { // Flag large gaps
                        gaps.push(`${gap} chapters between appearances`);
                    }
                }
                
                if (gaps.length > 0) {
                    issues.push({
                        severity: 'info',
                        character_name: char.name,
                        message: `Long gaps in character appearances: ${gaps.join(', ')}`,
                        suggestion: 'Verify character absence is intentional'
                    });
                }
            }
        });

        return issues;
    }

    async checkTimelineConsistency(book_id) {
        const issues = [];
        
        // Check for timeline logic issues in chapter progression
        const timeline_data = await this.db.query(`
            SELECT 
                chapter_number, story_time_start, story_time_end,
                story_duration, summary
            FROM chapters
            WHERE book_id = $1 
              AND (story_time_start IS NOT NULL OR story_time_end IS NOT NULL)
            ORDER BY chapter_number
        `, [book_id]);

        // Simple timeline consistency check (would be expanded)
        if (timeline_data.rows.length < 2) {
            issues.push({
                severity: 'info',
                message: 'Insufficient timeline data for consistency checking',
                suggestion: 'Add story timing information to chapters for timeline validation'
            });
        }

        return issues;
    }

    async checkPOVConsistency(book_id) {
        const issues = [];
        
        // Check for POV switches within chapters
        const pov_data = await this.db.query(`
            SELECT 
                c.chapter_number,
                c.pov_character_id,
                ch.name as pov_character,
                COUNT(s.id) as scene_count
            FROM chapters c
            LEFT JOIN characters ch ON c.pov_character_id = ch.id
            LEFT JOIN chapter_scenes s ON c.id = s.chapter_id AND s.pov_character_id != c.pov_character_id
            WHERE c.book_id = $1
            GROUP BY c.chapter_number, c.pov_character_id, ch.name
            HAVING COUNT(s.id) > 0
        `, [book_id]);

        pov_data.rows.forEach(chapter => {
            if (chapter.scene_count > 0) {
                issues.push({
                    severity: 'warning',
                    chapter_number: chapter.chapter_number,
                    message: `POV inconsistency detected between chapter and scene level`,
                    suggestion: 'Review POV assignments for consistency'
                });
            }
        });

        return issues;
    }

    async checkLocationConsistency(book_id) {
        const issues = [];
        
        // Check for location reference consistency
        // This would be expanded with actual location tracking
        issues.push({
            severity: 'info',
            message: 'Location consistency checking requires world-building data',
            suggestion: 'Implement location tracking for full consistency validation'
        });

        return issues;
    }

    async checkPlotHoles(book_id) {
        const issues = [];
        
        // Check for plot thread consistency
        // This would integrate with plot server data
        issues.push({
            severity: 'info', 
            message: 'Plot hole detection requires integration with plot thread tracking',
            suggestion: 'Use plot server for comprehensive plot hole detection'
        });

        return issues;
    }
}

                