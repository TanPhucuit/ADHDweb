-- Script để test bảng action trong Supabase
-- Chạy script này trong Supabase SQL Editor

-- 1. Kiểm tra cấu trúc bảng action
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'action' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Xem dữ liệu mẫu (5 records đầu tiên)
SELECT * FROM action LIMIT 5;

-- 3. Test insert một record (chỉ với các cột cần thiết)
INSERT INTO action (parentid, action_label, timestamp) 
VALUES (23, 'test-action', CURRENT_TIMESTAMP);

-- 4. Kiểm tra record vừa insert
SELECT * FROM action WHERE action_label = 'test-action';

-- 5. Xóa record test
DELETE FROM action WHERE action_label = 'test-action';