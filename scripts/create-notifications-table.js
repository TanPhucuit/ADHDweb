import { createClient } from '@/lib/supabase/client'

// Test script to create notifications table if it doesn't exist
async function createNotificationsTable() {
  const supabase = createClient()
  
  const query = `
    CREATE TABLE IF NOT EXISTS public.notifications (
      id SERIAL PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata JSONB,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  const { data, error } = await supabase.rpc('exec_sql', { sql: query })
  
  if (error) {
    console.error('Error creating table:', error)
  } else {
    console.log('Table created successfully:', data)
  }
}

// Call the function
createNotificationsTable()