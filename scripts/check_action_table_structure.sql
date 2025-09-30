-- Script để kiểm tra cấu trúc bảng action trong Supabase
-- Chạy script này trong Supabase SQL Editor để kiểm tra cấu trúc bảng

-- Kiểm tra cấu trúc bảng action
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'action' 
ORDER BY ordinal_position;

-- Kiểm tra các indexes trên bảng action
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'action';

-- Mẫu dữ liệu để test (chỉ để tham khảo cấu trúc)
-- INSERT INTO action (parentid, action_label, action_name, timestamp) 
-- VALUES (1, 'nhac-tap-trung', 'Nhắc tập trung', CURRENT_TIMESTAMP);

-- Query để đếm số action theo parentid (giống như API)
-- SELECT COUNT(*) as total_actions
-- FROM action 
-- WHERE parentid = 1;

-- Query để đếm số action hôm nay (giống như API)
-- SELECT COUNT(*) as today_actions
-- FROM action 
-- WHERE parentid = 1 
-- AND timestamp >= CURRENT_DATE 
-- AND timestamp < CURRENT_DATE + INTERVAL '1 day';