# 🔧 Hướng dẫn lấy thông tin Database từ Supabase

## ⚠️ Vấn đề hiện tại
Không thể kết nối đến database Supabase với thông tin hiện tại. Có thể do:
- Mật khẩu database không đúng
- Cần sử dụng connection pooling URL thay vì direct connection
- Cài đặt bảo mật database

## 📋 Cách lấy thông tin Database chính xác

### Bước 1: Truy cập Supabase Dashboard
1. Mở trình duyệt và đi tới: https://supabase.com/dashboard
2. Đăng nhập vào tài khoản của bạn
3. Chọn project: **czhkhfacfxmsabusjvqs**

### Bước 2: Lấy thông tin Database
1. Trong dashboard, click vào **Settings** (⚙️) ở sidebar trái
2. Click vào **Database**
3. Scroll xuống phần **Connection info**

### Bước 3: Copy thông tin sau
Bạn sẽ thấy các thông tin sau:

#### Option 1: Connection Pooling (Recommended)
```
Host: aws-0-ap-southeast-1.pooler.supabase.com
Port: 6543
Database: postgres
Username: postgres.czhkhfacfxmsabusjvqs
Password: [YOUR_DATABASE_PASSWORD]
```

#### Option 2: Direct Connection
```
Host: db.czhkhfacfxmsabusjvqs.supabase.co
Port: 5432
Database: postgres
Username: postgres
Password: [YOUR_DATABASE_PASSWORD]
```

### Bước 4: Lấy Database Password
- Nếu bạn chưa set password: Click **Reset database password**
- Nếu đã có password: Dùng password bạn đã tạo khi setup project

### Bước 5: Copy Connection String
Trong dashboard, bạn sẽ thấy phần **Connection string**:

**URI (recommended):**
```
postgresql://postgres.[project-id]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**hoặc Direct URI:**
```
postgresql://postgres:[password]@db.czhkhfacfxmsabusjvqs.supabase.co:5432/postgres
```

## 🔄 Cập nhật file .env

Sau khi có thông tin chính xác, cập nhật file `.env`:

```env
# Thay thế DATABASE_URL với connection string từ Supabase dashboard
DATABASE_URL=postgresql://postgres.czhkhfacfxmsabusjvqs:[YOUR_ACTUAL_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Cập nhật thông tin database
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.czhkhfacfxmsabusjvqs
DB_PASSWORD=[YOUR_ACTUAL_PASSWORD]
```

## 🚨 Lưu ý quan trọng

1. **Connection Pooling** (port 6543) thường ổn định hơn **Direct Connection** (port 5432)
2. Username có thể là `postgres.czhkhfacfxmsabusjvqs` thay vì chỉ `postgres`
3. Password phải chính xác - nếu quên thì reset trong dashboard
4. Đảm bảo project Supabase đang active và không bị pause

## 📞 Sau khi cập nhật

Chạy lại test:
```bash
python manage.py check --database default
python manage.py migrate
```