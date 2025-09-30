-- Create schedule_activities table
CREATE TABLE IF NOT EXISTS schedule_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id VARCHAR NOT NULL,
  medication_name VARCHAR NOT NULL,
  dosage VARCHAR NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  taken_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_activities_child_id ON schedule_activities(child_id);
CREATE INDEX IF NOT EXISTS idx_schedule_activities_status ON schedule_activities(status);
CREATE INDEX IF NOT EXISTS idx_medication_logs_child_id ON medication_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_status ON medication_logs(status);

-- Insert sample data for testing
INSERT INTO schedule_activities (child_id, subject, title, description, start_time, end_time, status) VALUES
('child-1', 'Toán học', 'Bài tập phép cộng', 'Làm bài tập từ trang 15-20', '08:00', '09:00', 'pending'),
('child-1', 'Tiếng Việt', 'Đọc truyện', 'Đọc truyện cổ tích', '09:15', '10:00', 'pending'),
('child-1', 'Khoa học', 'Thí nghiệm nước', 'Quan sát hiện tượng bay hơi', '10:15', '11:00', 'pending');

INSERT INTO medication_logs (child_id, medication_name, dosage, scheduled_time, status) VALUES
('child-1', 'Methylphenidate', '10mg', NOW() - INTERVAL '30 minutes', 'pending'),
('child-1', 'Methylphenidate', '10mg', NOW() + INTERVAL '4 hours', 'pending');