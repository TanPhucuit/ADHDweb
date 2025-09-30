-- Create notifications table for parent-child communication
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id TEXT NOT NULL, -- Child ID who triggers the notification
  to_user_id TEXT NOT NULL,   -- Parent ID who receives the notification
  type TEXT NOT NULL,         -- notification type: child_login, child_logout, activity_completed, etc.
  title TEXT NOT NULL,        -- notification title
  message TEXT NOT NULL,      -- notification message
  metadata JSONB,             -- additional data like activity details
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "notifications_select_own" ON public.notifications 
  FOR SELECT USING (to_user_id = auth.uid()::text);

CREATE POLICY "notifications_insert_own" ON public.notifications 
  FOR INSERT WITH CHECK (from_user_id = auth.uid()::text);

CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE USING (to_user_id = auth.uid()::text);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_to_user_id ON public.notifications(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);