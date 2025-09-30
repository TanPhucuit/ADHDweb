-- Script để kiểm tra constraint của bảng action
SELECT 
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'action'::regclass 
AND conname LIKE '%action_label%';

-- Kiểm tra các giá trị action_label hiện có
SELECT DISTINCT action_label FROM action;