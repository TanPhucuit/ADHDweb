# 🚀 Dashboard Backend API - Endpoints Documentation

## 🌟 Server đang chạy tại: http://127.0.0.1:8000/

## 📚 API Endpoints Overview

### 🔐 Authentication (`/api/v1/auth/`)
- **POST** `/api/v1/auth/login/` - Đăng nhập
- **POST** `/api/v1/auth/logout/` - Đăng xuất
- **GET** `/api/v1/auth/user-info/` - Thông tin user hiện tại
- **POST** `/api/v1/auth/password-reset/` - Yêu cầu reset password
- **POST** `/api/v1/auth/verify-token/` - Xác thực token

### 👥 Users Management (`/api/v1/users/`)
- **POST** `/api/v1/users/register/` - Đăng ký tài khoản
- **GET/PUT** `/api/v1/users/profile/` - Xem/cập nhật profile
- **GET** `/api/v1/users/list/` - Danh sách users
- **GET** `/api/v1/users/dashboard-data/` - Dữ liệu dashboard
- **POST** `/api/v1/users/change-password/` - Đổi mật khẩu
- **GET/POST** `/api/v1/users/relationships/` - Quan hệ parent-child

### 🎯 Focus & Pomodoro (`/api/v1/focus/`)
- **GET/POST** `/api/v1/focus/sessions/` - Danh sách/tạo focus session
- **GET/PUT** `/api/v1/focus/sessions/{id}/` - Chi tiết focus session
- **POST** `/api/v1/focus/sessions/start/` - Bắt đầu focus session
- **POST** `/api/v1/focus/sessions/{id}/end/` - Kết thúc focus session
- **GET** `/api/v1/focus/sounds/` - Danh sách âm thanh focus
- **GET/PUT** `/api/v1/focus/settings/` - Cài đặt focus của user
- **GET** `/api/v1/focus/statistics/` - Thống kê focus

### 💊 Medication (Cần tạo endpoints)
- `/api/v1/medication/` - Quản lý thuốc
- `/api/v1/medication/schedules/` - Lịch uống thuốc
- `/api/v1/medication/logs/` - Nhật ký uống thuốc
- `/api/v1/medication/reminders/` - Nhắc nhở uống thuốc

### 🏆 Rewards (Cần tạo endpoints)
- `/api/v1/rewards/` - Danh sách phần thưởng
- `/api/v1/rewards/points/` - Điểm số của user
- `/api/v1/rewards/claim/` - Nhận thưởng
- `/api/v1/rewards/achievements/` - Thành tích

### 💬 Chat (Cần tạo endpoints)
- `/api/v1/chat/rooms/` - Phòng chat
- `/api/v1/chat/messages/` - Tin nhắn
- `/api/v1/chat/ai/` - Chat với AI

### 📊 Assessment (Cần tạo endpoints)
- `/api/v1/assessment/` - Bài đánh giá
- `/api/v1/assessment/responses/` - Câu trả lời
- `/api/v1/assessment/results/` - Kết quả đánh giá

### 📅 Schedule (Cần tạo endpoints)
- `/api/v1/schedule/` - Lịch trình
- `/api/v1/schedule/activities/` - Hoạt động
- `/api/v1/schedule/completions/` - Hoàn thành hoạt động

### 📈 Dashboard (Cần tạo endpoints)
- `/api/v1/dashboard/widgets/` - Widget dashboard
- `/api/v1/dashboard/metrics/` - Số liệu dashboard
- `/api/v1/dashboard/notifications/` - Thông báo

## 🛠️ Admin Panel
- **URL:** http://127.0.0.1:8000/admin/
- **Username:** 1
- **Password:** 1

## 📖 API Documentation
- **URL:** http://127.0.0.1:8000/docs/

## 🧪 Testing Endpoints

### Test User Registration
```bash
curl -X POST http://127.0.0.1:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "user_type": "parent",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Login
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

### Test Focus Session (với token)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/focus/sessions/start/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -d '{
    "session_type": "pomodoro",
    "title": "Work Session",
    "planned_duration": 25
  }'
```

## ✅ Completed Features
- ✅ User authentication & registration
- ✅ User profiles and relationships
- ✅ Focus sessions & Pomodoro timer
- ✅ Focus statistics
- ✅ Admin panel integration
- ✅ Database models for all features
- ✅ API documentation

## 🔄 Next Steps
1. Complete remaining endpoints (medication, rewards, chat, etc.)
2. Add real-time features with WebSockets
3. Implement file upload for avatars
4. Add email notifications
5. Connect with frontend Next.js app
6. Deploy to production

## 🔒 Authentication
Tất cả endpoints (trừ login/register) yêu cầu authentication.
Sử dụng Token-based authentication:
```
Authorization: Token your_token_here
```

## 🌐 CORS
CORS đã được cấu hình để cho phép:
- http://localhost:3000 (Next.js frontend)
- http://127.0.0.1:3000

---
**🎯 Backend API đã sẵn sàng để tích hợp với frontend Next.js!**