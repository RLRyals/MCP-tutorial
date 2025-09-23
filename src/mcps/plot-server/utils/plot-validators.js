// src/mcps/plot-server/utils/plot-validators.js
// UPDATED VERSION - Validation helpers for universal plot management

export class PlotValidators {
    static validatePlotThread(args) {
        const errors = [];
        
        if (!args.series_id || typeof args.series_id !== 'number') {
            errors.push('series_id must be a valid number');
        }
        
        if (!args.title || typeof args.title !== 'string' || args.title.trim().length === 0) {
            errors.push('title must be a non-empty string');
        }
        
        if (!args.description || typeof args.description !== 'string' || args.description.trim().length === 0) {
            errors.push('description must be a non-empty string');
        }
        
        // Note: thread_type validation now handled by database lookup table
        // The actual validation happens at database level via foreign key constraints
        if (!args.thread_type || typeof args.thread_type !== 'string') {
            errors.push('thread_type must be a non-empty string (valid types come from plot_thread_types lookup table)');
        }
        
        if (args.importance_level !== undefined) {
            if (typeof args.importance_level !== 'number' || args.importance_level < 1 || args.importance_level > 10) {
                errors.push('importance_level must be a number between 1 and 10');
            }
        }
        
        if (args.complexity_level !== undefined) {
            if (typeof args.complexity_level !== 'number' || args.complexity_level < 1 || args.complexity_level > 10) {
                errors.push('complexity_level must be a number between 1 and 10');
            }
        }
        
        if (args.start_book !== undefined && (typeof args.start_book !== 'number' || args.start_book < 1)) {
            errors.push('start_book must be a positive number');
        }
        
        if (args.end_book !== undefined) {
            if (typeof args.end_book !== 'number' || args.end_book < 1) {
                errors.push('end_book must be a positive number');
            }
            if (args.start_book && args.end_book < args.start_book) {
                errors.push('end_book must be greater than or equal to start_book');
            }
        }
        
        if (args.related_characters !== undefined) {
            if (!Array.isArray(args.related_characters)) {
                errors.push('related_characters must be an array');
            } else if (!args.related_characters.every(id => typeof id === 'number' && id > 0)) {
                errors.push('all related_characters must be positive numbers');
            }
        }
        
        if (args.parent_thread_id !== undefined && (typeof args.parent_thread_id !== 'number' || args.parent_thread_id < 1)) {
            errors.push('parent_thread_id must be a positive number');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateThreadUpdate(args) {
        const errors = [];
        
        if (!args.thread_id || typeof args.thread_id !== 'number' || args.thread_id < 1) {
            errors.push('thread_id must be a positive number');
        }
        
        if (args.current_status !== undefined) {
            const validStatuses = ['active', 'resolved', 'on_hold', 'abandoned'];
            if (!validStatuses.includes(args.current_status)) {
                errors.push(`current_status must be one of: ${validStatuses.join(', ')}`);
            }
        }
        
        if (args.title !== undefined && (typeof args.title !== 'string' || args.title.trim().length === 0)) {
            errors.push('title must be a non-empty string');
        }
        
        if (args.description !== undefined && (typeof args.description !== 'string' || args.description.trim().length === 0)) {
            errors.push('description must be a non-empty string');
        }
        
        if (args.end_book !== undefined && (typeof args.end_book !== 'number' || args.end_book < 1)) {
            errors.push('end_book must be a positive number');
        }
        
        if (args.resolution_book !== undefined && (typeof args.resolution_book !== 'number' || args.resolution_book < 1)) {
            errors.push('resolution_book must be a positive number');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateThreadRelationship(args) {
        const errors = [];
        
        if (!args.thread_a_id || typeof args.thread_a_id !== 'number' || args.thread_a_id < 1) {
            errors.push('thread_a_id must be a positive number');
        }
        
        if (!args.thread_b_id || typeof args.thread_b_id !== 'number' || args.thread_b_id < 1) {
            errors.push('thread_b_id must be a positive number');
        }
        
        if (args.thread_a_id === args.thread_b_id) {
            errors.push('thread_a_id and thread_b_id must be different');
        }
        
        // Note: relationship_type validation now handled by database lookup table
        // The actual validation happens at database level via foreign key constraints  
        if (!args.relationship_type || typeof args.relationship_type !== 'string') {
            errors.push('relationship_type must be a non-empty string (valid types come from relationship_types lookup table)');
        }
        
        if (args.strength !== undefined) {
            if (typeof args.strength !== 'number' || args.strength < 1 || args.strength > 10) {
                errors.push('strength must be a number between 1 and 10');
            }
        }
        
        if (args.established_book !== undefined && (typeof args.established_book !== 'number' || args.established_book < 1)) {
            errors.push('established_book must be a positive number');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateStoryAnalysis(args) {
        const errors = [];
        
        if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
            errors.push('book_id must be a positive number');
        }
        
        if (args.story_concern !== undefined) {
            const validConcerns = ['obtaining', 'understanding', 'becoming', 'conceiving'];
            if (!validConcerns.includes(args.story_concern)) {
                errors.push(`story_concern must be one of: ${validConcerns.join(', ')}`);
            }
        }
        
        if (args.story_outcome !== undefined) {
            const validOutcomes = ['success', 'failure'];
            if (!validOutcomes.includes(args.story_outcome)) {
                errors.push(`story_outcome must be one of: ${validOutcomes.join(', ')}`);
            }
        }
        
        if (args.story_judgment !== undefined) {
            const validJudgments = ['good', 'bad'];
            if (!validJudgments.includes(args.story_judgment)) {
                errors.push(`story_judgment must be one of: ${validJudgments.join(', ')}`);
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateCharacterThroughline(args) {
        const errors = [];
        
        if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
            errors.push('book_id must be a positive number');
        }
        
        if (!args.character_id || typeof args.character_id !== 'number' || args.character_id < 1) {
            errors.push('character_id must be a positive number');
        }
        
        const validThroughlineTypes = ['main_character', 'influence_character', 'relationship', 'objective_story'];
        if (!args.throughline_type || !validThroughlineTypes.includes(args.throughline_type)) {
            errors.push(`throughline_type must be one of: ${validThroughlineTypes.join(', ')}`);
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    // =============================================
    // UNIVERSAL GENRE VALIDATORS (replaces rigid genre-specific ones)
    // =============================================
    
    static validateInformationReveal(args) {
        const errors = [];
        
        if (!args.plot_thread_id || typeof args.plot_thread_id !== 'number' || args.plot_thread_id < 1) {
            errors.push('plot_thread_id must be a positive number');
        }
        
        const validRevealTypes = ['evidence', 'secret', 'backstory', 'world_rule', 'relationship', 'skill'];
        if (!args.reveal_type || !validRevealTypes.includes(args.reveal_type)) {
            errors.push(`reveal_type must be one of: ${validRevealTypes.join(', ')}`);
        }
        
        if (!args.information_content || typeof args.information_content !== 'string' || args.information_content.trim().length === 0) {
            errors.push('information_content must be a non-empty string');
        }
        
        if (!args.reveal_method || typeof args.reveal_method !== 'string' || args.reveal_method.trim().length === 0) {
            errors.push('reveal_method must be a non-empty string');
        }
        
        const validSignificanceLevels = ['minor', 'major', 'climactic', 'world_changing'];
        if (!args.significance_level || !validSignificanceLevels.includes(args.significance_level)) {
            errors.push(`significance_level must be one of: ${validSignificanceLevels.join(', ')}`);
        }
        
        if (args.affects_characters !== undefined) {
            if (!Array.isArray(args.affects_characters)) {
                errors.push('affects_characters must be an array');
            } else if (!args.affects_characters.every(id => typeof id === 'number' && id > 0)) {
                errors.push('all character IDs in affects_characters must be positive numbers');
            }
        }
        
        if (args.revealed_in_chapter !== undefined && (typeof args.revealed_in_chapter !== 'number' || args.revealed_in_chapter < 1)) {
            errors.push('revealed_in_chapter must be a positive number');
        }
        
        if (args.foreshadowing_chapters !== undefined) {
            if (!Array.isArray(args.foreshadowing_chapters)) {
                errors.push('foreshadowing_chapters must be an array');
            } else if (!args.foreshadowing_chapters.every(id => typeof id === 'number' && id > 0)) {
                errors.push('all chapter IDs in foreshadowing_chapters must be positive numbers');
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateRelationshipArc(args) {
        const errors = [];
        
        if (!args.plot_thread_id || typeof args.plot_thread_id !== 'number' || args.plot_thread_id < 1) {
            errors.push('plot_thread_id must be a positive number');
        }
        
        if (!args.arc_name || typeof args.arc_name !== 'string' || args.arc_name.trim().length === 0) {
            errors.push('arc_name must be a non-empty string');
        }
        
        if (!args.participants || !Array.isArray(args.participants) || args.participants.length < 2) {
            errors.push('participants must be an array with at least 2 participants');
        } else {
            args.participants.forEach((participant, index) => {
                if (!participant.character_id || typeof participant.character_id !== 'number' || participant.character_id < 1) {
                    errors.push(`participants[${index}].character_id must be a positive number`);
                }
                if (!participant.role_in_relationship || typeof participant.role_in_relationship !== 'string') {
                    errors.push(`participants[${index}].role_in_relationship must be a non-empty string`);
                }
            });
        }
        
        const validRelationshipTypes = ['romantic', 'family', 'friendship', 'professional', 'antagonistic', 'mentor', 'alliance'];
        if (!args.relationship_type || !validRelationshipTypes.includes(args.relationship_type)) {
            errors.push(`relationship_type must be one of: ${validRelationshipTypes.join(', ')}`);
        }
        
        if (args.complexity_level !== undefined) {
            if (typeof args.complexity_level !== 'number' || args.complexity_level < 1 || args.complexity_level > 10) {
                errors.push('complexity_level must be a number between 1 and 10');
            }
        }
        
        if (args.development_factors !== undefined && !Array.isArray(args.development_factors)) {
            errors.push('development_factors must be an array');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateWorldSystem(args) {
        const errors = [];
        
        if (!args.series_id || typeof args.series_id !== 'number' || args.series_id < 1) {
            errors.push('series_id must be a positive number');
        }
        
        if (!args.system_name || typeof args.system_name !== 'string' || args.system_name.trim().length === 0) {
            errors.push('system_name must be a non-empty string');
        }
        
        const validSystemTypes = ['magic', 'psionics', 'technology', 'divine', 'supernatural', 'mutation', 'alchemy'];
        if (!args.system_type || !validSystemTypes.includes(args.system_type)) {
            errors.push(`system_type must be one of: ${validSystemTypes.join(', ')}`);
        }
        
        if (!args.power_source || typeof args.power_source !== 'string' || args.power_source.trim().length === 0) {
            errors.push('power_source must be a non-empty string');
        }
        
        if (!args.access_method || typeof args.access_method !== 'string' || args.access_method.trim().length === 0) {
            errors.push('access_method must be a non-empty string');
        }
        
        if (args.limitations !== undefined && !Array.isArray(args.limitations)) {
            errors.push('limitations must be an array');
        }
        
        if (args.system_rules !== undefined && !Array.isArray(args.system_rules)) {
            errors.push('system_rules must be an array');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateRevealEvidence(args) {
        const errors = [];
        
        if (!args.reveal_id || typeof args.reveal_id !== 'number' || args.reveal_id < 1) {
            errors.push('reveal_id must be a positive number');
        }
        
        const validEvidenceTypes = ['physical', 'witness', 'circumstantial', 'digital', 'forensic'];
        if (!args.evidence_type || !validEvidenceTypes.includes(args.evidence_type)) {
            errors.push(`evidence_type must be one of: ${validEvidenceTypes.join(', ')}`);
        }
        
        if (!args.evidence_description || typeof args.evidence_description !== 'string' || args.evidence_description.trim().length === 0) {
            errors.push('evidence_description must be a non-empty string');
        }
        
        if (args.discovered_by !== undefined && (typeof args.discovered_by !== 'number' || args.discovered_by < 1)) {
            errors.push('discovered_by must be a positive number');
        }
        
        if (args.discovery_chapter !== undefined && (typeof args.discovery_chapter !== 'number' || args.discovery_chapter < 1)) {
            errors.push('discovery_chapter must be a positive number');
        }
        
        if (args.significance !== undefined) {
            const validSignificance = ['critical', 'important', 'supporting', 'red_herring'];
            if (!validSignificance.includes(args.significance)) {
                errors.push(`significance must be one of: ${validSignificance.join(', ')}`);
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateRelationshipDynamics(args) {
        const errors = [];
        
        if (!args.arc_id || typeof args.arc_id !== 'number' || args.arc_id < 1) {
            errors.push('arc_id must be a positive number');
        }
        
        if (!args.dynamic_change || typeof args.dynamic_change !== 'string' || args.dynamic_change.trim().length === 0) {
            errors.push('dynamic_change must be a non-empty string');
        }
        
        const validChangeTypes = ['emotional', 'power', 'trust', 'commitment', 'conflict'];
        if (!args.change_type || !validChangeTypes.includes(args.change_type)) {
            errors.push(`change_type must be one of: ${validChangeTypes.join(', ')}`);
        }
        
        if (args.tension_change !== undefined) {
            if (typeof args.tension_change !== 'number' || args.tension_change < -10 || args.tension_change > 10) {
                errors.push('tension_change must be a number between -10 and 10');
            }
        }
        
        if (args.chapter_id !== undefined && (typeof args.chapter_id !== 'number' || args.chapter_id < 1)) {
            errors.push('chapter_id must be a positive number');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateSystemProgression(args) {
        const errors = [];
        
        if (!args.character_id || typeof args.character_id !== 'number' || args.character_id < 1) {
            errors.push('character_id must be a positive number');
        }
        
        if (!args.system_id || typeof args.system_id !== 'number' || args.system_id < 1) {
            errors.push('system_id must be a positive number');
        }
        
        if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
            errors.push('book_id must be a positive number');
        }
        
        if (!args.current_power_level || typeof args.current_power_level !== 'number' || args.current_power_level < 1 || args.current_power_level > 10) {
            errors.push('current_power_level must be a number between 1 and 10');
        }
        
        if (args.chapter_id !== undefined && (typeof args.chapter_id !== 'number' || args.chapter_id < 1)) {
            errors.push('chapter_id must be a positive number');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    // =============================================
    // TROPE VALIDATORS
    // =============================================
    
    static validateTrope(args) {
        const errors = [];
        
        if (!args.series_id || typeof args.series_id !== 'number' || args.series_id < 1) {
            errors.push('series_id must be a positive number');
        }
        
        if (!args.trope_name || typeof args.trope_name !== 'string' || args.trope_name.trim().length === 0) {
            errors.push('trope_name must be a non-empty string');
        }
        
        const validTropeCategories = ['romance_trope', 'character_trope', 'plot_trope'];
        if (!args.trope_category || !validTropeCategories.includes(args.trope_category)) {
            errors.push(`trope_category must be one of: ${validTropeCategories.join(', ')}`);
        }
        
        if (!args.description || typeof args.description !== 'string' || args.description.trim().length === 0) {
            errors.push('description must be a non-empty string');
        }
        
        if (args.common_elements !== undefined && !Array.isArray(args.common_elements)) {
            errors.push('common_elements must be an array');
        }
        
        if (args.scene_types !== undefined) {
            if (!Array.isArray(args.scene_types)) {
                errors.push('scene_types must be an array');
            } else {
                args.scene_types.forEach((scene, index) => {
                    if (!scene.scene_function || typeof scene.scene_function !== 'string') {
                        errors.push(`scene_types[${index}].scene_function must be a non-empty string`);
                    }
                    if (!scene.scene_description || typeof scene.scene_description !== 'string') {
                        errors.push(`scene_types[${index}].scene_description must be a non-empty string`);
                    }
                    if (scene.typical_placement !== undefined) {
                        const validPlacements = ['early', 'middle', 'climax', 'resolution'];
                        if (!validPlacements.includes(scene.typical_placement)) {
                            errors.push(`scene_types[${index}].typical_placement must be one of: ${validPlacements.join(', ')}`);
                        }
                    }
                    if (scene.emotional_beats !== undefined && !Array.isArray(scene.emotional_beats)) {
                        errors.push(`scene_types[${index}].emotional_beats must be an array`);
                    }
                });
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateTropeInstance(args) {
        const errors = [];
        
        if (!args.trope_id || typeof args.trope_id !== 'number' || args.trope_id < 1) {
            errors.push('trope_id must be a positive number');
        }
        
        if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
            errors.push('book_id must be a positive number');
        }
        
        if (args.completion_status !== undefined) {
            const validStatuses = ['planned', 'in_progress', 'complete', 'subverted'];
            if (!validStatuses.includes(args.completion_status)) {
                errors.push(`completion_status must be one of: ${validStatuses.join(', ')}`);
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateTropeScene(args) {
        const errors = [];
        
        if (!args.instance_id || typeof args.instance_id !== 'number' || args.instance_id < 1) {
            errors.push('instance_id must be a positive number');
        }
        
        if (!args.scene_type_id || typeof args.scene_type_id !== 'number' || args.scene_type_id < 1) {
            errors.push('scene_type_id must be a positive number');
        }
        
        if (!args.scene_summary || typeof args.scene_summary !== 'string' || args.scene_summary.trim().length === 0) {
            errors.push('scene_summary must be a non-empty string');
        }
        
        if (args.chapter_id !== undefined && (typeof args.chapter_id !== 'number' || args.chapter_id < 1)) {
            errors.push('chapter_id must be a positive number');
        }
        
        if (args.scene_number !== undefined && (typeof args.scene_number !== 'number' || args.scene_number < 1)) {
            errors.push('scene_number must be a positive number');
        }
        
        if (args.effectiveness_rating !== undefined) {
            if (typeof args.effectiveness_rating !== 'number' || args.effectiveness_rating < 1 || args.effectiveness_rating > 10) {
                errors.push('effectiveness_rating must be a number between 1 and 10');
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    // =============================================
    // DEPRECATED VALIDATORS (kept for backward compatibility)
    // =============================================
    
    // Old mystery-specific validator - DEPRECATED
    // static validateMysteryCase(args) {
    //     console.warn('PlotValidators.validateMysteryCase is deprecated. Use validateInformationReveal instead for cross-genre compatibility.');
    //     return this.validateInformationReveal({
    //         plot_thread_id: args.plot_thread_id,
    //         reveal_type: 'evidence',
    //         information_content: args.case_name,
    //         reveal_method: 'investigation',
    //         significance_level: 'major'
    //     });
    // }
    
    // Old romance-specific validator - DEPRECATED  
    // static validateRomanceArc(args) {
    //     console.warn('PlotValidators.validateRomanceArc is deprecated. Use validateRelationshipArc instead for cross-genre compatibility.');
        
    //     if (!args.character_a_id || !args.character_b_id) {
    //         return { valid: false, errors: ['Use the new validateRelationshipArc with participants array instead of character_a_id/character_b_id'] };
    //     }
        
    //     // Convert old format to new format for validation
    //     const convertedArgs = {
    //         plot_thread_id: args.plot_thread_id,
    //         arc_name: `Romance Arc`,
    //         participants: [
    //             { character_id: args.character_a_id, role_in_relationship: 'primary' },
    //             { character_id: args.character_b_id, role_in_relationship: 'primary' }
    //         ],
    //         relationship_type: 'romantic',
    //         complexity_level: args.tension_level || 5
    //     };
        
    //     return this.validateRelationshipArc(convertedArgs);
    // }
}