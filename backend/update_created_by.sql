-- SQL script to update all character records to set created_by = 1
-- This should be run when the database exists and is accessible

-- First, let's check the current state
.headers on
.mode column

SELECT 'Before Update - Current created_by values:' as status;
SELECT id, name, created_by FROM character;

-- Update all character records to set created_by = 1
UPDATE character SET created_by = 1;

-- Check how many rows were affected
SELECT 'Rows updated: ' || changes() as update_result;

-- Verify the update
SELECT 'After Update - All created_by values should be 1:' as status;
SELECT id, name, created_by FROM character;

-- Final verification - count characters with created_by = 1
SELECT 'Total characters with created_by = 1: ' || COUNT(*) as final_count
FROM character 
WHERE created_by = 1;