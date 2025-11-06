DO $$ 
BEGIN     
    -- Check if migration was already applied     
    IF EXISTS (SELECT 1 FROM migrations WHERE filename = '008_add_world_schema.sql') THEN         
        RAISE NOTICE 'Migration 012_empty.sql already applied, skipping.';         
        RETURN;     
    END IF;  

    -- deliberatley empty and just a placeholder to complete the sequence of migrations

    -- Record this migration     
INSERT INTO migrations (filename) VALUES ('012_empty.sql');  

END $$;  

COMMIT;