-- Create devices table for smartwatch connections
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'smartwatch',
  device_id TEXT UNIQUE NOT NULL,
  pairing_code TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "devices_select_own" ON public.devices 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "devices_insert_own" ON public.devices 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "devices_update_own" ON public.devices 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "devices_delete_own" ON public.devices 
  FOR DELETE USING (auth.uid() = user_id);

-- Create child profiles table
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  age INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for child profiles
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for child profiles
CREATE POLICY "child_profiles_select_own" ON public.child_profiles 
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "child_profiles_insert_own" ON public.child_profiles 
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "child_profiles_update_own" ON public.child_profiles 
  FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "child_profiles_delete_own" ON public.child_profiles 
  FOR DELETE USING (auth.uid() = parent_id);
