# Camera Preview - Raspberry Pi Integration Update

## Tổng quan thay đổi

Component `CameraPreview` đã được cập nhật để hỗ trợ live stream trực tiếp từ Raspberry Pi camera, ngoài việc hỗ trợ YouTube stream hiện có.

## Tính năng mới

### 1. Tự động phát hiện loại stream
- **YouTube**: Tự động nhận diện URL YouTube và chuyển đổi sang embed format
- **Raspberry Pi**: Phát hiện HTTP stream từ Raspi (MJPEG, HLS, v.v.)
- **Local**: Camera trên thiết bị (giữ nguyên tính năng cũ)

### 2. Hỗ trợ nhiều định dạng Raspberry Pi stream
- MJPEG stream (mjpg-streamer): `http://IP:PORT/?action=stream`
- HLS stream: `http://IP:PORT/path/stream.m3u8`
- Motion stream: `http://IP:PORT`
- Bất kỳ HTTP stream nào với port tùy chỉnh

### 3. Hiển thị trạng thái rõ ràng
- **YOUTUBE LIVE**: Badge đỏ cho YouTube stream
- **RASPI LIVE**: Badge xanh lá cho Raspberry Pi stream
- Info panel hiển thị nguồn stream và URL

### 4. Xử lý lỗi tốt hơn
- Hiển thị thông báo lỗi rõ ràng khi stream không thể kết nối
- Auto-retry với fallback giữa `<img>` và `<video>` tag
- Console logging chi tiết để debug

## Cách sử dụng

### 1. Cấu hình trong database

Cập nhật `liveid` trong bảng `smartcamera`:

```sql
-- Ví dụ với mjpg-streamer
UPDATE smartcamera 
SET liveid = 'http://192.168.1.100:8080/?action=stream'
WHERE childid = 1;

-- Ví dụ với YouTube (vẫn hoạt động)
UPDATE smartcamera 
SET liveid = 'https://youtu.be/VIDEO_ID'
WHERE childid = 2;
```

### 2. Component tự động xử lý

Component sẽ:
1. Fetch `liveid` từ API `/api/camera/live?childId=X`
2. Phát hiện loại stream tự động
3. Hiển thị stream phù hợp

## Files đã thay đổi

### `components/parent/camera-preview.tsx`

**Thêm mới**:
- Type definition `StreamType` để phân loại stream
- State `streamType`, `raspiStreamUrl`, `streamError`
- Function `detectStreamType()` để phát hiện tự động
- Logic render cho Raspberry Pi stream với `<img>` tag
- Badge màu xanh lá cho RASPI LIVE
- Info panel động hiển thị loại stream

**Cập nhật**:
- `fetchLiveId()` để detect và set stream type
- Conditional rendering based on `streamType`
- Error handling với state `streamError`

## Hướng dẫn setup Raspberry Pi

Xem chi tiết trong file: [`RASPI_CAMERA_SETUP.md`](./RASPI_CAMERA_SETUP.md)

Các option được khuyến nghị:
1. **mjpg-streamer** - Độ trễ thấp, dễ setup
2. **Motion** - Tích hợp motion detection
3. **HLS với FFmpeg** - Chất lượng cao, scalable

## Testing

### Test với Raspberry Pi stream:
1. Setup stream trên Raspi (xem RASPI_CAMERA_SETUP.md)
2. Test stream bằng cách mở URL trong browser
3. Cập nhật database với URL
4. Refresh parent dashboard
5. Kiểm tra badge hiển thị "RASPI LIVE" màu xanh lá

### Test với YouTube:
1. Cập nhật database với YouTube URL
2. Refresh parent dashboard
3. Kiểm tra badge hiển thị "YOUTUBE LIVE" màu đỏ

## Troubleshooting

### Stream không hiển thị
- Mở Developer Console (F12) và xem logs
- Kiểm tra URL trong database đúng format
- Test URL trực tiếp trong browser
- Kiểm tra Raspberry Pi đang chạy và accessible

### CORS errors
- Nếu stream từ Raspi bị CORS, cần config header:
```nginx
add_header Access-Control-Allow-Origin *;
```

### Stream bị lag
- Giảm resolution/framerate trên Raspi
- Kiểm tra băng thông mạng
- Cân nhắc dùng HLS thay vì MJPEG

## Future Enhancements

Có thể cải tiến thêm:
- [ ] WebRTC để giảm độ trễ
- [ ] PTZ control (Pan-Tilt-Zoom)
- [ ] Recording/snapshot feature
- [ ] Multiple camera support
- [ ] Stream quality selector
- [ ] Two-way audio

## Bảo mật

⚠️ **Lưu ý bảo mật quan trọng**:
- Stream hiện chưa có authentication
- Nên sử dụng VPN hoặc reverse proxy với SSL
- Không expose stream port ra internet trực tiếp
- Cân nhắc thêm token-based authentication

---

**Ngày cập nhật**: 22/10/2025
**Version**: 2.0
