-- Create break_requests table for production deployment
CREATE TABLE IF NOT EXISTS public.break_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id TEXT NOT NULL,
  child_name TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  request_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER DEFAULT 5, -- in minutes
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.break_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "break_requests_select_own" ON public.break_requests 
  FOR SELECT USING (parent_id = auth.uid()::text OR child_id = auth.uid()::text);

CREATE POLICY "break_requests_insert_own" ON public.break_requests 
  FOR INSERT WITH CHECK (child_id = auth.uid()::text);

CREATE POLICY "break_requests_update_own" ON public.break_requests 
  FOR UPDATE USING (parent_id = auth.uid()::text OR child_id = auth.uid()::text);

-- Create indexes
CREATE INDEX idx_break_requests_parent_id ON public.break_requests(parent_id);
CREATE INDEX idx_break_requests_child_id ON public.break_requests(child_id);
CREATE INDEX idx_break_requests_status ON public.break_requests(status);
CREATE INDEX idx_break_requests_created_at ON public.break_requests(created_at);