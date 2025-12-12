-- Add device_type column to devices table
-- This allows distinguishing between smartwatch and smartcamera

-- Add the column with default value 'smartwatch' for existing records
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'smartwatch';

-- Add check constraint to ensure only valid device types
ALTER TABLE public.devices 
ADD CONSTRAINT device_type_check 
CHECK (device_type IN ('smartwatch', 'smartcamera'));

-- Update existing records based on device_name
UPDATE public.devices 
SET device_type = 'smartcamera' 
WHERE LOWER(device_name) LIKE '%camera%';

-- Create index for faster queries by device_type
CREATE INDEX IF NOT EXISTS idx_devices_device_type 
ON public.devices(device_type);

-- Create index for compound queries
CREATE INDEX IF NOT EXISTS idx_devices_child_type 
ON public.devices(child_id, device_type);

COMMENT ON COLUMN public.devices.device_type IS 'Type of device: smartwatch or smartcamera';
