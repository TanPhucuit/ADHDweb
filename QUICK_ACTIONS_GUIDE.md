# Hướng dẫn sử dụng tính năng Hành động nhanh và Theo dõi can thiệp

## Mô tả tính năng

Tính năng này cho phép phụ huynh thực hiện các hành động can thiệp nhanh chóng và theo dõi số lần can thiệp trong ngày.

## Các thành phần đã cập nhật

### 1. Layout cải thiện

#### Quick Actions Grid
- **Trước**: Grid 3 cột bất cân đối
- **Sau**: Grid responsive 2 cột trên mobile, 3 cột trên desktop
- **Cải thiện**: 
  - Tự động điều chỉnh kích thước
  - Ẩn text mô tả trên màn hình nhỏ
  - Padding responsive

#### Schedule Modal
- **Trước**: Layout grid 2 cột không cân đối
- **Sau**: Layout dọc với thời gian trong 1 hàng
- **Cải thiện**:
  - Môn học chiếm toàn bộ chiều rộng
  - Giờ bắt đầu/kết thúc trong 1 hàng
  - Ghi chú ở cuối

### 2. Tích hợp Database

#### Bảng sử dụng: `action`
```sql
-- Cấu trúc bảng (có sẵn trong Supabase)
action:
- id (primary key)
- parentid (integer)
- action_label (varchar)
- action_name (varchar) 
- timestamp (timestamp)
```

#### API Endpoints

**POST /api/parent/actions**
- Thêm action mới vào database
- Input: `{ parentId, actionLabel, actionName, timestamp }`
- Output: `{ success, action, message }`

**GET /api/parent/actions?parentId=X**
- Lấy số lượng actions
- Output: `{ success, totalActions, todayActions, parentId }`

### 3. Mapping các hành động

| Nút bấm | action_label | action_name |
|---------|-------------|-------------|
| Nhắc tập trung | `nhac-tap-trung` | `Nhắc tập trung` |
| Nghỉ giải lao | `nghi-ngoi` | `Nghỉ giải lao` |
| Khen ngợi | `khen-ngoi` | `Khen ngợi` |
| Động viên | `dong-vien` | `Động viên` |
| Kiểm tra thời gian | `kiem-tra-thoi-gian` | `Kiểm tra thời gian` |

### 4. Real-time Update

#### Hook: `useInterventionCount`
- Tự động load số lượng can thiệp
- Listen event `interventionAdded` để cập nhật real-time
- Return: `{ totalActions, todayActions, isLoading, error, refetch }`

#### Component: `MetricsGrid`
- Hiển thị số lần can thiệp hôm nay từ API thực
- Cập nhật tự động khi có action mới
- Loading state khi đang tải dữ liệu

## Cách sử dụng

### Cho Developer

1. **Thêm component InterventionCounter** (optional):
```tsx
import { InterventionCounter } from "@/components/parent/intervention-counter"

<InterventionCounter parentId={user.id.toString()} />
```

2. **Sử dụng hook trong component khác**:
```tsx
import { useInterventionCount } from "@/hooks/use-intervention-count"

const { totalActions, todayActions, isLoading } = useInterventionCount(parentId)
```

### Cho User (Phụ huynh)

1. **Thực hiện hành động**:
   - Nhấn vào các nút trong phần "Hành động nhanh"
   - Hệ thống tự động ghi nhận vào database
   - Số lần can thiệp cập nhật ngay lập tức

2. **Xem thống kê**:
   - Ô "Lần can thiệp hôm nay" hiển thị số lần trong ngày
   - Cập nhật real-time khi có action mới

## Kiểm tra và Debug

### 1. Kiểm tra database
```sql
-- Xem actions mới nhất
SELECT * FROM action 
WHERE parentid = YOUR_PARENT_ID 
ORDER BY timestamp DESC 
LIMIT 10;

-- Đếm actions hôm nay
SELECT COUNT(*) FROM action 
WHERE parentid = YOUR_PARENT_ID 
AND timestamp >= CURRENT_DATE;
```

### 2. Browser DevTools
- Console logs: Tìm `🎯 Recording parent action` và `✅ Action recorded`
- Network tab: Kiểm tra calls đến `/api/parent/actions`
- Xem event `interventionAdded` trong Event Listeners

### 3. Troubleshooting
- **Không cập nhật số lượng**: Kiểm tra parentId có đúng không
- **Lỗi database**: Xem console logs và cấu trúc bảng action
- **UI không responsive**: Kiểm tra Tailwind classes responsive

## Technical Notes

- **Event-driven**: Sử dụng CustomEvent để trigger update
- **Type-safe**: TypeScript interfaces cho tất cả data structures  
- **Error handling**: Comprehensive error handling trong API và UI
- **Performance**: SWR-like pattern với caching và auto-refresh
- **Responsive**: Mobile-first design với breakpoints chuẩn