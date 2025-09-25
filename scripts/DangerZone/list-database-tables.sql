-- List all tables in the database
SELECT 
    table_schema, 
    table_name
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public' AND 
    table_type = 'BASE TABLE'
ORDER BY 
    table_schema, 
    table_name;