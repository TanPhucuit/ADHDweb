# Hướng dẫn cấu hình Camera Raspberry Pi cho ADHD Dashboard

## Tổng quan

Hệ thống hiện đã hỗ trợ live stream trực tiếp từ Raspberry Pi camera. Component sẽ tự động phát hiện loại stream (YouTube hoặc Raspberry Pi) dựa trên URL được lưu trong database.

## Các loại stream được hỗ trợ

1. **YouTube Live Stream** - URL dạng `youtube.com` hoặc `youtu.be`
2. **Raspberry Pi Stream** - URL HTTP/HTTPS với:
   - Port tùy chỉnh (ví dụ: `:8080`, `:8081`)
   - Path dạng `/stream`, `/video`, `.mjpg`, `.mjpeg`
   - Địa chỉ IP (ví dụ: `192.168.1.100:8080`)

## Cấu hình Raspberry Pi để stream camera

### Option 1: Sử dụng Motion (MJPEG Stream)

1. **Cài đặt Motion**:
```bash
sudo apt-get update
sudo apt-get install motion
```

2. **Cấu hình Motion** (`/etc/motion/motion.conf`):
```conf
# Daemon
daemon on

# Stream
stream_port 8081
stream_localhost off
stream_quality 75
stream_maxrate 30

# Video device
videodevice /dev/video0
width 1280
height 720
framerate 30

# Output
output_pictures off
ffmpeg_output_movies off
```

3. **Khởi động Motion**:
```bash
sudo systemctl enable motion
sudo systemctl start motion
```

4. **URL để lưu vào database**:
```
http://[RASPI_IP_ADDRESS]:8081
```

### Option 2: Sử dụng RPi-Cam-Web-Interface

1. **Cài đặt**:
```bash
git clone https://github.com/silvanmelchior/RPi_Cam_Web_Interface.git
cd RPi_Cam_Web_Interface
./install.sh
```

2. **Chọn các tùy chọn**:
   - Camera path: `/var/www/html`
   - Autostart: Yes
   - Server port: 80 (hoặc tùy chỉnh)

3. **URL để lưu vào database**:
```
http://[RASPI_IP_ADDRESS]/cam_pic.php
```

### Option 3: Sử dụng mjpg-streamer (Khuyến nghị)

1. **Cài đặt dependencies**:
```bash
sudo apt-get install cmake libjpeg62-turbo-dev gcc g++
```

2. **Build mjpg-streamer**:
```bash
git clone https://github.com/jacksonliam/mjpg-streamer.git
cd mjpg-streamer/mjpg-streamer-experimental
make
sudo make install
```

3. **Tạo script khởi động** (`~/start_camera.sh`):
```bash
#!/bin/bash
export LD_LIBRARY_PATH=/usr/local/lib/mjpg-streamer/

mjpg_streamer \
    -i "input_uvc.so -d /dev/video0 -r 1280x720 -f 30" \
    -o "output_http.so -p 8080 -w /usr/local/share/mjpg-streamer/www"
```

4. **Cấp quyền thực thi**:
```bash
chmod +x ~/start_camera.sh
```

5. **Chạy stream**:
```bash
~/start_camera.sh
```

6. **Tự động khởi động khi boot** (thêm vào `/etc/rc.local`):
```bash
/home/pi/start_camera.sh &
```

7. **URL để lưu vào database**:
```
http://[RASPI_IP_ADDRESS]:8080/?action=stream
```

### Option 4: Sử dụng FFmpeg HLS Stream

1. **Cài đặt FFmpeg và nginx**:
```bash
sudo apt-get install ffmpeg nginx
```

2. **Cấu hình nginx** (`/etc/nginx/sites-available/hls`):
```nginx
server {
    listen 8080;
    
    location /hls {
        types {
            application/vnd.apple.mpegurl m3u8;
            video/mp2t ts;
        }
        root /tmp;
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
    }
}
```

3. **Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/hls /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

4. **Tạo script stream** (`~/stream_hls.sh`):
```bash
#!/bin/bash
mkdir -p /tmp/hls

ffmpeg -f v4l2 -framerate 30 -video_size 1280x720 -i /dev/video0 \
    -c:v libx264 -preset ultrafast -tune zerolatency \
    -b:v 2M -maxrate 2M -bufsize 4M \
    -g 60 -sc_threshold 0 \
    -f hls -hls_time 2 -hls_list_size 5 -hls_flags delete_segments \
    /tmp/hls/stream.m3u8
```

5. **Chạy stream**:
```bash
chmod +x ~/stream_hls.sh
~/stream_hls.sh
```

6. **URL để lưu vào database**:
```
http://[RASPI_IP_ADDRESS]:8080/hls/stream.m3u8
```

## Cập nhật database

Để cập nhật URL stream trong database:

```sql
-- Cập nhật liveid trong bảng smartcamera
UPDATE smartcamera 
SET liveid = 'http://[RASPI_IP_ADDRESS]:8080/?action=stream'
WHERE childid = [CHILD_ID];
```

Hoặc sử dụng Supabase dashboard để cập nhật trực tiếp.

## Kiểm tra stream

1. **Kiểm tra stream hoạt động**:
   - Mở trình duyệt và truy cập URL stream
   - Đảm bảo có thể xem được video

2. **Kiểm tra trong ứng dụng**:
   - Đăng nhập với tài khoản parent
   - Chọn child tương ứng
   - Xem camera preview, sẽ hiển thị indicator "RASPI LIVE" màu xanh lá

## Xử lý sự cố

### Stream không hiển thị:
- Kiểm tra Raspberry Pi đang chạy và có kết nối mạng
- Kiểm tra port không bị firewall chặn
- Kiểm tra URL trong database chính xác
- Xem console log trong trình duyệt để biết lỗi chi tiết

### Stream bị giật lag:
- Giảm resolution xuống 640x480
- Giảm framerate xuống 15fps
- Kiểm tra băng thông mạng
- Sử dụng HLS stream thay vì MJPEG

### Camera không được phát hiện:
- Kiểm tra camera được kết nối đúng
- Chạy `vcgencmd get_camera` để kiểm tra camera
- Kiểm tra `/dev/video0` tồn tại

## Bảo mật

⚠️ **Quan trọng**: Các stream này không có mã hóa hoặc xác thực. Để bảo mật:

1. **Sử dụng HTTPS**: Cài đặt SSL certificate cho nginx
2. **Xác thực**: Thêm authentication vào stream server
3. **VPN**: Sử dụng VPN để truy cập camera từ xa
4. **Firewall**: Chỉ cho phép truy cập từ các IP đáng tin cậy

## Ghi chú

- Hệ thống tự động phát hiện loại stream dựa trên URL pattern
- MJPEG stream (mjpg-streamer) được khuyến nghị cho độ trễ thấp
- HLS stream có độ trễ cao hơn (~10s) nhưng chất lượng tốt hơn
- Component hỗ trợ cả fullscreen và auto-refresh
