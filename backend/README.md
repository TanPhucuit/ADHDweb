# Dashboard Backend

Django REST API backend cho ứng dụng Dashboard.

## Cài đặt

1. Kích hoạt môi trường ảo:
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# hoặc
venv\Scripts\activate.bat    # Windows CMD
# hoặc  
source venv/bin/activate     # Linux/Mac
```

2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

3. Cấu hình biến môi trường:
- Copy file `.env.example` thành `.env`
- Cập nhật các thông tin cần thiết trong file `.env`

4. Chạy migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Tạo superuser:
```bash
python manage.py createsuperuser
```

6. Chạy server:
```bash
python manage.py runserver
```

## Cấu trúc thư mục

```
backend/
├── dashboard_backend/          # Django project settings
├── authentication/            # Xử lý đăng nhập/đăng ký
├── users/                     # Quản lý người dùng
├── dashboard/                 # Dashboard chính
├── chat/                      # Tính năng chat
├── assessment/                # Đánh giá
├── focus/                     # Tính năng focus/pomodoro
├── medication/                # Quản lý thuốc
├── rewards/                   # Hệ thống phần thưởng
├── schedule/                  # Lịch trình
├── utils/                     # Các tiện ích chung
├── media/                     # File upload
├── static/                    # Static files
└── venv/                      # Môi trường ảo
```

## API Endpoints

API sẽ có các endpoint chính:

- `/api/v1/auth/` - Authentication
- `/api/v1/users/` - User management  
- `/api/v1/dashboard/` - Dashboard data
- `/api/v1/chat/` - Chat functionality
- `/api/v1/assessment/` - Assessments
- `/api/v1/focus/` - Focus/Pomodoro
- `/api/v1/medication/` - Medication tracking
- `/api/v1/rewards/` - Rewards system
- `/api/v1/schedule/` - Scheduling

## Database

Sử dụng Supabase PostgreSQL làm database chính.

## Môi trường phát triển

- Python 3.11+
- Django 5.2.6
- Django REST Framework 3.16.1
- Supabase