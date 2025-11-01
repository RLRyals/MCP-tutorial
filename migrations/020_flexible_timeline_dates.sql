-- Migration: 017_flexible_timeline_dates
-- Description: Change event_date from DATE to TEXT to support flexible date formats
--              Allows dates like "Night 1", "Day 3", "Year 2025", "Season 1, Episode 4", etc.
-- Date: 2025-10-24

BEGIN;

-- Check if migration was already applied and execute migration if needed
DO $$
BEGIN
    -- Check if migration was already applied
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '020_flexible_timeline_dates.sql') THEN
        RAISE NOTICE 'Migration 020_flexible_timeline_dates.sql already applied, skipping.';
        RETURN;
    END IF;

    -- Drop the view that depends on event_date column
    DROP VIEW IF EXISTS events_with_participants;

    -- Change event_date column from DATE to TEXT to support flexible date formats
    -- This allows authors to use narrative dates like "Night 1", "Day 3", "Before the War", etc.
    ALTER TABLE timeline_events
    ALTER COLUMN event_date TYPE TEXT;

    -- Recreate the view with the updated column type
    CREATE OR REPLACE VIEW events_with_participants AS
    SELECT
        t.id as event_id,
        t.event_name,
        t.event_date,
        t.event_description,
        t.series_id,
        t.book_id,
        t.time_period,
        t.significance,
        t.is_public_knowledge,
        array_agg(c.id) FILTER (WHERE c.id IS NOT NULL) AS participant_ids,
        array_agg(c.name) FILTER (WHERE c.id IS NOT NULL) AS participant_names
    FROM
        timeline_events t
        LEFT JOIN event_participants ep ON t.id = ep.event_id
        LEFT JOIN characters c ON ep.character_id = c.id
    GROUP BY
        t.id;

    RAISE NOTICE 'Successfully changed timeline_events.event_date to TEXT type and recreated view';

    -- Record this migration
    INSERT INTO migrations (filename) VALUES ('020_flexible_timeline_dates.sql');

END
$$;

COMMIT;
