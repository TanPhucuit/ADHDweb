-- Create tables for ADHD Dashboard with real data for child-2 (Trần Bắc Nam)

-- Create schedule_activities table
CREATE TABLE IF NOT EXISTS schedule_activities (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    subject VARCHAR(200),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medication_logs table  
CREATE TABLE IF NOT EXISTS medication_logs (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    taken_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for child-2 (Trần Bắc Nam) with completed activities
INSERT INTO schedule_activities (child_id, subject, title, description, start_time, end_time, status, completed_at) VALUES
('child-2', 'Toán học', 'Bài tập phép cộng', 'Làm bài tập từ trang 15-20', '08:00', '09:00', 'completed', NOW() - INTERVAL '2 hours'),
('child-2', 'Tiếng Việt', 'Đọc truyện', 'Đọc truyện cổ tích', '09:15', '10:00', 'completed', NOW() - INTERVAL '1 hour'),
('child-2', 'Khoa học', 'Thí nghiệm đơn giản', 'Quan sát hiện tượng', '10:15', '11:00', 'pending', NULL),
('child-2', 'Tiếng Anh', 'Học từ vựng', 'Học 10 từ mới', '14:00', '14:30', 'pending', NULL);

-- Insert sample medication data for child-2 with taken status
INSERT INTO medication_logs (child_id, medication_name, dosage, scheduled_time, status, taken_time, notes) VALUES
('child-2', 'Thuốc tập trung #1', '10mg', NOW() - INTERVAL '3 hours', 'taken', NOW() - INTERVAL '2 hours 30 minutes', 'Uống sau ăn sáng'),
('child-2', 'Thuốc tập trung #2', '5mg', NOW() - INTERVAL '1 hour', 'taken', NOW() - INTERVAL '45 minutes', 'Uống sau ăn trưa'),
('child-2', 'Vitamin D', '400mg', NOW() + INTERVAL '2 hours', 'pending', NULL, 'Uống sau ăn tối'),
('child-2', 'Thuốc an thần', '2.5mg', NOW() + INTERVAL '6 hours', 'pending', NULL, 'Uống trước khi ngủ');

-- Add some data for child-1 (for comparison)
INSERT INTO schedule_activities (child_id, subject, title, description, start_time, end_time, status, completed_at) VALUES
('child-1', 'Toán học', 'Bài tập phép trừ', 'Làm bài tập cơ bản', '08:00', '09:00', 'pending', NULL),
('child-1', 'Tiếng Việt', 'Viết chữ', 'Luyện viết chữ đẹp', '09:15', '10:00', 'pending', NULL);

INSERT INTO medication_logs (child_id, medication_name, dosage, scheduled_time, status, taken_time, notes) VALUES
('child-1', 'Methylphenidate', '10mg', NOW() - INTERVAL '30 minutes', 'pending', NULL, 'Chưa đến giờ uống'),
('child-1', 'Vitamins', '1 viên', NOW() + INTERVAL '4 hours', 'pending', NULL, 'Uống cùng bữa tối');

-- Query to verify data
SELECT 'Schedule Activities for child-2' as info;
SELECT * FROM schedule_activities WHERE child_id = 'child-2';

SELECT 'Medication Logs for child-2' as info;  
SELECT * FROM medication_logs WHERE child_id = 'child-2';

-- Calculate expected stars for child-2
SELECT 
    'Expected Stars for child-2' as info,
    (SELECT COUNT(*) FROM schedule_activities WHERE child_id = 'child-2' AND status = 'completed') * 5 as schedule_stars,
    (SELECT COUNT(*) FROM medication_logs WHERE child_id = 'child-2' AND status = 'taken') * 10 as medication_stars,
    ((SELECT COUNT(*) FROM schedule_activities WHERE child_id = 'child-2' AND status = 'completed') * 5) + 
    ((SELECT COUNT(*) FROM medication_logs WHERE child_id = 'child-2' AND status = 'taken') * 10) as total_stars;