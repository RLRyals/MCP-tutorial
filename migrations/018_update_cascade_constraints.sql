    -- Record this migrationles
BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '018_update_cascade_constraints.sql') THEN
        RAISE NOTICE 'Migration 018_update_cascade_constraints.sql already applied, skipping.';
        RETURN;
    END IF;

    -- Update trope_instances table
    -- Drop the existing foreign key constraints
    ALTER TABLE trope_instances
        DROP CONSTRAINT IF EXISTS trope_instances_book_id_fkey,
        DROP CONSTRAINT IF EXISTS trope_instances_trope_id_fkey;

    -- Re-add the constraints with ON DELETE CASCADE
    ALTER TABLE trope_instances
        ADD CONSTRAINT trope_instances_book_id_fkey 
        FOREIGN KEY (book_id) 
        REFERENCES books(id) 
        ON DELETE CASCADE,
        
        ADD CONSTRAINT trope_instances_trope_id_fkey 
        FOREIGN KEY (trope_id) 
        REFERENCES tropes(id) 
        ON DELETE CASCADE;

    -- Update characters table
    -- Drop the existing foreign key constraints for book references
    ALTER TABLE characters
        DROP CONSTRAINT IF EXISTS characters_first_appearance_book_id_fkey,
        DROP CONSTRAINT IF EXISTS characters_last_appearance_book_id_fkey;

    -- Re-add the constraints with ON DELETE SET NULL
    -- We use SET NULL instead of CASCADE because deleting a book shouldn't delete the character,
    -- it should just remove the reference to that book
    ALTER TABLE characters
        ADD CONSTRAINT characters_first_appearance_book_id_fkey 
        FOREIGN KEY (first_appearance_book_id) 
        REFERENCES books(id) 
        ON DELETE SET NULL,
        
        ADD CONSTRAINT characters_last_appearance_book_id_fkey 
        FOREIGN KEY (last_appearance_book_id) 
        REFERENCES books(id) 
        ON DELETE SET NULL;

    -- Update character_details table
    -- Drop the existing foreign key constraint for source_book_id
    ALTER TABLE character_details
        DROP CONSTRAINT IF EXISTS character_details_source_book_id_fkey;

    -- Re-add the constraint with ON DELETE SET NULL
    -- We use SET NULL because deleting a book shouldn't delete the character detail,
    -- it should just remove the reference to where it was established
    ALTER TABLE character_details
        ADD CONSTRAINT character_details_source_book_id_fkey 
        FOREIGN KEY (source_book_id) 
        REFERENCES books(id) 
        ON DELETE SET NULL;

    -- Update character_knowledge table
    ALTER TABLE character_knowledge
        DROP CONSTRAINT IF EXISTS character_knowledge_learned_book_id_fkey;

    -- Re-add with SET NULL - preserve knowledge but remove book reference
    ALTER TABLE character_knowledge
        ADD CONSTRAINT character_knowledge_learned_book_id_fkey 
        FOREIGN KEY (learned_book_id) 
        REFERENCES books(id) 
        ON DELETE SET NULL;

    -- Update character_throughlines table
    ALTER TABLE character_throughlines
        DROP CONSTRAINT IF EXISTS character_throughlines_book_id_fkey;

    -- Re-add with CASCADE - throughlines are specific to a book
    ALTER TABLE character_throughlines
        ADD CONSTRAINT character_throughlines_book_id_fkey 
        FOREIGN KEY (book_id) 
        REFERENCES books(id) 
        ON DELETE CASCADE;

    -- Update story_appreciations table
    ALTER TABLE story_appreciations
        DROP CONSTRAINT IF EXISTS story_appreciations_book_id_fkey;

    -- Re-add with CASCADE - appreciations are specific to a book
    ALTER TABLE story_appreciations
        ADD CONSTRAINT story_appreciations_book_id_fkey 
        FOREIGN KEY (book_id) 
        REFERENCES books(id) 
        ON DELETE CASCADE;

    -- Update problem_solutions table
    ALTER TABLE problem_solutions
        DROP CONSTRAINT IF EXISTS problem_solutions_book_id_fkey;

    -- Re-add with CASCADE - problem solutions are specific to a book
    ALTER TABLE problem_solutions
        ADD CONSTRAINT problem_solutions_book_id_fkey 
        FOREIGN KEY (book_id) 
        REFERENCES books(id) 
        ON DELETE CASCADE;

    -- Update relationship_arcs table
    ALTER TABLE relationship_arcs
        DROP CONSTRAINT IF EXISTS relationship_arcs_plot_thread_id_fkey;

    -- Re-add with CASCADE - relationship arcs should be deleted when their plot thread is deleted
    ALTER TABLE relationship_arcs
        ADD CONSTRAINT relationship_arcs_plot_thread_id_fkey 
        FOREIGN KEY (plot_thread_id) 
        REFERENCES plot_threads(id) 
        ON DELETE CASCADE;

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('018_update_cascade_constraints.sql');

END
$$;

COMMIT;