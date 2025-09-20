// src/mcps/plot-server/utils/plot-validators.js
// Validation helpers for plot management

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
    
    // Genre-specific validators
    static validateMysteryCase(args) {
        const errors = [];
        
        if (!args.plot_thread_id || typeof args.plot_thread_id !== 'number' || args.plot_thread_id < 1) {
            errors.push('plot_thread_id must be a positive number');
        }
        
        if (!args.case_name || typeof args.case_name !== 'string' || args.case_name.trim().length === 0) {
            errors.push('case_name must be a non-empty string');
        }
        
        if (args.case_status !== undefined) {
            const validStatuses = ['open', 'investigating', 'solved', 'cold'];
            if (!validStatuses.includes(args.case_status)) {
                errors.push(`case_status must be one of: ${validStatuses.join(', ')}`);
            }
        }
        
        if (args.initial_suspects !== undefined && !Array.isArray(args.initial_suspects)) {
            errors.push('initial_suspects must be an array');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    static validateRomanceArc(args) {
        const errors = [];
        
        if (!args.plot_thread_id || typeof args.plot_thread_id !== 'number' || args.plot_thread_id < 1) {
            errors.push('plot_thread_id must be a positive number');
        }
        
        if (!args.character_a_id || typeof args.character_a_id !== 'number' || args.character_a_id < 1) {
            errors.push('character_a_id must be a positive number');
        }
        
        if (!args.character_b_id || typeof args.character_b_id !== 'number' || args.character_b_id < 1) {
            errors.push('character_b_id must be a positive number');
        }
        
        if (args.character_a_id === args.character_b_id) {
            errors.push('character_a_id and character_b_id must be different');
        }
        
        if (args.relationship_stage !== undefined) {
            const validStages = ['strangers', 'acquaintances', 'friends', 'attracted', 'dating', 'committed', 'separated'];
            if (!validStages.includes(args.relationship_stage)) {
                errors.push(`relationship_stage must be one of: ${validStages.join(', ')}`);
            }
        }
        
        if (args.tension_level !== undefined) {
            if (typeof args.tension_level !== 'number' || args.tension_level < 1 || args.tension_level > 10) {
                errors.push('tension_level must be a number between 1 and 10');
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
}
