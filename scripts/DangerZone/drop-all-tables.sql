-- Drop All Tables Script
-- This script drops all tables in the database in the correct order to handle dependencies

BEGIN;

-- Disable triggers temporarily to avoid issues with cascading deletes
SET session_replication_role = 'replica';

-- Drop tables in reverse order of dependencies

-- Drop document-related tables
DROP TABLE IF EXISTS manuscript_exports CASCADE;
DROP TABLE IF EXISTS session_chapters CASCADE;
DROP TABLE IF EXISTS word_count_snapshots CASCADE;
DROP TABLE IF EXISTS writing_sessions CASCADE;
DROP TABLE IF EXISTS writing_goals CASCADE;

-- Drop analysis and validation tables
DROP TABLE IF EXISTS validation_results CASCADE;
DROP TABLE IF EXISTS validation_rules CASCADE;
DROP TABLE IF EXISTS story_appreciations CASCADE;
DROP TABLE IF EXISTS story_concerns CASCADE;
DROP TABLE IF EXISTS story_judgments CASCADE;
DROP TABLE IF EXISTS story_outcomes CASCADE;
DROP TABLE IF EXISTS story_analysis CASCADE;

-- Drop character/chapter relationship tables
DROP TABLE IF EXISTS character_chapter_presence CASCADE;
DROP TABLE IF EXISTS character_system_progression CASCADE;
DROP TABLE IF EXISTS character_throughlines CASCADE;
DROP TABLE IF EXISTS chapter_plot_points CASCADE;
DROP TABLE IF EXISTS chapter_scenes CASCADE;
DROP TABLE IF EXISTS character_knowledge CASCADE;
DROP TABLE IF EXISTS character_arcs CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;

-- Drop information and reveal tables
DROP TABLE IF EXISTS information_reveals CASCADE;
DROP TABLE IF EXISTS information_flow CASCADE;
DROP TABLE IF EXISTS reveal_evidence CASCADE;
DROP TABLE IF EXISTS problem_solutions CASCADE;

-- Drop relationships and dynamics tables
DROP TABLE IF EXISTS relationship_arcs CASCADE;
DROP TABLE IF EXISTS relationship_dynamics CASCADE;
DROP TABLE IF EXISTS event_participants CASCADE;

-- Drop trope-related tables
DROP TABLE IF EXISTS trope_instances CASCADE;
DROP TABLE IF EXISTS trope_scene_types CASCADE;
DROP TABLE IF EXISTS trope_scenes CASCADE;
DROP TABLE IF EXISTS tropes CASCADE;

-- Drop plot-related tables
DROP TABLE IF EXISTS plot_thread_relationships CASCADE;
DROP TABLE IF EXISTS plot_threads CASCADE;
DROP TABLE IF EXISTS plot_thread_statuses CASCADE;
DROP TABLE IF EXISTS plot_thread_types CASCADE;
DROP TABLE IF EXISTS relationship_types CASCADE;
DROP TABLE IF EXISTS genres CASCADE;

-- Drop world building tables
DROP TABLE IF EXISTS world_element_usage CASCADE;
DROP TABLE IF EXISTS world_elements CASCADE;
DROP TABLE IF EXISTS world_systems CASCADE;
DROP TABLE IF EXISTS system_abilities CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Drop timeline tables
DROP TABLE IF EXISTS series_timeline CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS event_chapter_mappings CASCADE;

-- Drop series and metadata tables
DROP TABLE IF EXISTS series_metadata CASCADE;

-- Drop core content tables
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS series CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS metadata CASCADE;

-- Drop tracking tables (keep this one for last)
DROP TABLE IF EXISTS migrations CASCADE;

-- Restore triggers
SET session_replication_role = 'origin';

COMMIT;

SELECT 'All tables have been dropped successfully.' as status;