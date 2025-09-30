-- Script để sửa data mapping giữa child ID và schedule/medication data
-- Child có ID 30 (Trần Bảo Nam) với parent ID 23

-- Update schedule_activities data từ 'child-2' thành '30'
UPDATE schedule_activities 
SET child_id = '30' 
WHERE child_id = 'child-2';

-- Update medication_logs data từ 'child-2' thành '30'  
UPDATE medication_logs
SET child_id = '30'
WHERE child_id = 'child-2';

-- Thêm một số schedule activities mới với status completed để test reward calculation
INSERT INTO schedule_activities (child_id, subject, title, description, start_time, end_time, status, completed_at) VALUES
('30', 'Toán học', 'Bài tập cộng trừ', 'Hoàn thành bài tập', '08:00', '09:00', 'completed', NOW() - INTERVAL '1 hour'),
('30', 'Tiếng Việt', 'Đọc sách', 'Đọc truyện', '09:15', '10:00', 'completed', NOW() - INTERVAL '30 minutes');

-- Thêm medication logs với status taken để test reward calculation  
INSERT INTO medication_logs (child_id, medication_name, dosage, scheduled_time, status, taken_time, notes) VALUES
('30', 'Thuốc tập trung', '10mg', NOW() - INTERVAL '2 hours', 'taken', NOW() - INTERVAL '1 hour 45 minutes', 'Uống sau ăn sáng');

-- Verify data
SELECT 'schedule_activities' as table_name, child_id, COUNT(*) as count FROM schedule_activities WHERE child_id = '30' GROUP BY child_id
UNION ALL
SELECT 'medication_logs' as table_name, child_id, COUNT(*) as count FROM medication_logs WHERE child_id = '30' GROUP BY child_id;