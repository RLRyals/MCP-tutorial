-- List All Tables Script
-- This script lists all tables in the current database, sorted alphabetically

SELECT 
    table_schema,
    table_name
FROM 
    information_schema.tables
WHERE 
    table_schema NOT IN ('pg_catalog', 'information_schema')
    AND table_type = 'BASE TABLE'
ORDER BY
    table_schema,
    table_name;