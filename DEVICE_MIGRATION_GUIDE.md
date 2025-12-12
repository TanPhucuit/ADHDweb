# Device Type Migration Guide

## Vấn đề
Bảng `devices` chỉ có `device_name` nhưng không có cột `device_type` để phân biệt smartwatch và smartcamera.

## Giải pháp
Thêm cột `device_type` với constraint validation và auto-detect từ device_name.

## Cách thực hiện

### 1. Vào Supabase Dashboard
- Truy cập: https://supabase.com/dashboard/project/pjvztaykgkxnefwsyqvd
- Đăng nhập bằng tài khoản GitHub

### 2. Mở SQL Editor
- Click vào menu bên trái: **SQL Editor**
- Click **New query**

### 3. Copy và paste script
```sql
-- Copy toàn bộ nội dung từ file: scripts/add_device_type_column.sql
```

### 4. Run migration
- Click nút **Run** (hoặc nhấn Ctrl+Enter)
- Đợi ~2 giây
- Thấy "Success. No rows returned" = THÀNH CÔNG ✅

### 5. Verify migration
Chạy query kiểm tra:
```sql
-- Check structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'devices' 
AND column_name = 'device_type';

-- Check data
SELECT id, device_name, device_type, child_id 
FROM devices 
ORDER BY created_at DESC 
LIMIT 10;
```

## Kết quả mong đợi
- Tất cả devices có device_type = 'smartwatch' hoặc 'smartcamera'
- Devices có tên chứa "camera" → device_type = 'smartcamera'
- Devices khác → device_type = 'smartwatch'

## Rollback (nếu cần)
```sql
-- Remove device_type column
ALTER TABLE public.devices DROP COLUMN IF EXISTS device_type;

-- Remove indexes
DROP INDEX IF EXISTS idx_devices_device_type;
DROP INDEX IF EXISTS idx_devices_child_type;
```

## Test sau migration
1. Vào trang `/parent/devices` hoặc `/child/devices`
2. Kiểm tra devices hiển thị đúng type
3. Thử thêm device mới với tên "Smart Camera" → phải có type = 'smartcamera'
4. Thử thêm device mới với tên "Smart Watch" → phải có type = 'smartwatch'
