// src/mcps/story-analysis-server/utils/story-validators.js
// Validators for story analysis tools

export class PlotValidators {
    static validateStoryAnalysis(args) {
        const errors = [];

        if (!args.book_id || typeof args.book_id !== 'number' || args.book_id < 1) {
            errors.push('book_id must be a positive number');
        }

        return {
            valid: errors.length === 0,
            errors
        };
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

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
