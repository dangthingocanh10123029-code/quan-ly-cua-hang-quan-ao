# CLOTH Store API

E-commerce API cho website bán quần áo, được xây dựng bằng **Python / FastAPI**.

---

## Yêu cầu hệ thống

- **Python** 3.10+
- **MySQL** 8.0+
- **pip**

---

## Cài đặt

### 1. Clone & tạo virtual environment

```bash
cd backend-fastapi
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
.\venv\Scripts\activate
```

### 2. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình database

Tạo file `.env` (copy từ `.env.example` nếu có):

```env
PORT=8000
DEBUG=true
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clothing_store
JWT_SECRET=your_secret_key_change_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=30
MAX_FILE_SIZE=5242880
```

### 4. Tạo database & import schema

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database và import schema + seed
mysql -u root -p < ../database/schema.sql
mysql -u root -p < ../database/seed.sql

# Hoặc chạy trong MySQL
SOURCE ../database/schema.sql;
SOURCE ../database/seed.sql;
```

### 5. Chạy server

```bash
# Cách 1: Dùng uvicorn trực tiếp
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Cách 2: Chạy từ Python
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Cách 3: Chạy từ main.py
python app/main.py
```

Server sẽ khởi động tại **http://localhost:8000**

---

## Tài liệu API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Import Postman Collection

Đã có sẵn file `CLOTH_Store_API.postman_collection.json` trong thư mục này.

1. Mở Postman -> **Import** -> Chọn file JSON
2. Set biến `{{baseUrl}}` = `http://localhost:8000`
3. Sau khi login, copy `token` từ response vào biến `{{token}}`

---

## Cấu trúc dự án

```
backend-fastapi/
├── app/
│   ├── main.py          # FastAPI app entry point, CORS, middleware
│   ├── config.py         # Pydantic Settings (.env)
│   ├── database.py       # MySQL connection pool
│   ├── middleware/
│   │   └── auth.py      # JWT authentication
│   ├── routers/
│   │   ├── api.py       # Public APIs (home, products, news)
│   │   ├── customer.py  # Customer APIs (auth, orders, wishlist, addresses)
│   │   └── admin.py     # Admin APIs (CRUD, dashboard, reports)
│   ├── schemas/
│   │   └── __init__.py  # Pydantic request/response models
│   ├── services/
│   │   └── __init__.py  # Business logic layer
│   └── utils/
│       └── __init__.py   # Helpers: slugify, enrich_product, defaults
├── uploads/              # Uploaded images (auto-created)
├── venv/                 # Virtual environment
├── requirements.txt
├── .env.example
├── CLOTH_Store_API.postman_collection.json
└── README.md
```

---

## Database Schema

Database gồm **28 bảng** trong MySQL:

| Bảng | Mô tả |
|------|-------|
| `users` | Tài khoản người dùng (user, admin, manager, staff) |
| `addresses` | Địa chỉ giao hàng |
| `categories` | Danh mục sản phẩm |
| `brands` | Thương hiệu |
| `products` | Sản phẩm |
| `product_images` | Hình ảnh sản phẩm |
| `product_variants` | Biến thể (size, color, giá, tồn kho) |
| `sizes` | Bảng kích thước |
| `colors` | Bảng màu sắc |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết đơn hàng |
| `cart_items` | Giỏ hàng |
| `wishlists` | Danh sách yêu thích |
| `product_reviews` | Đánh giá sản phẩm |
| `coupons` | Mã giảm giá |
| `coupon_usage` | Lịch sử sử dụng coupon |
| `promotions` | Khuyến mãi (flash sale, bundle...) |
| `reward_points` | Điểm tích lũy |
| `employees` | Nhân viên |
| `warehouses` | Kho hàng |
| `suppliers` | Nhà cung cấp |
| `supplier_orders` | Đơn nhập hàng |
| `supplier_order_items` | Chi tiết đơn nhập hàng |
| `stock_movements` | Lịch sử nhập/xuất kho |
| `return_requests` | Yêu cầu đổi/trả |
| `news` | Tin tức/bài viết |
| `contacts` | Liên hệ |
| `settings` | Cấu hình hệ thống |
| `shipping_providers` | Đơn vị vận chuyển |
| `shipping_zones` | Khu vực giao hàng |
| `shipping_fees` | Phí vận chuyển |
| `payment_methods` | Phương thức thanh toán |
| `expense_categories` | Loại chi phí |
| `expenses` | Chi phí |
| `notifications` | Thông báo |
| `activity_logs` | Nhật ký hoạt động |

---

## API Endpoints

### Public APIs (không cần auth)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/` | Root - thông tin API |
| GET | `/health` | Health check |
| GET | `/api/` | API root |
| GET | `/api/home` | Dữ liệu trang chủ (banners, sản phẩm nổi bật, flash sale...) |
| GET | `/api/products` | Danh sách sản phẩm (filter: category, brand, gender, age_group, price, sort, page) |
| GET | `/api/products/search` | Tìm kiếm sản phẩm |
| GET | `/api/products/kids-categories` | Danh mục sản phẩm trẻ em |
| GET | `/api/products/{slug}` | Chi tiết sản phẩm |
| GET | `/api/news` | Danh sách tin tức |
| GET | `/api/news/{slug}` | Chi tiết tin tức |

### Auth APIs

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |

### Customer APIs (cần Bearer Token)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/profile` | Lấy thông tin tài khoản |
| PUT | `/api/profile` | Cập nhật thông tin tài khoản |
| GET | `/api/orders` | Danh sách đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders/{id}` | Chi tiết đơn hàng |
| POST | `/api/orders/{id}/cancel` | Hủy đơn hàng |
| GET | `/api/wishlist` | Danh sách yêu thích |
| POST | `/api/wishlist` | Thêm vào yêu thích |
| DELETE | `/api/wishlist/{productId}` | Xóa khỏi yêu thích |
| GET | `/api/addresses` | Danh sách địa chỉ |
| POST | `/api/addresses` | Thêm địa chỉ |
| PUT | `/api/addresses/{id}` | Cập nhật địa chỉ |
| DELETE | `/api/addresses/{id}` | Xóa địa chỉ |
| POST | `/api/reviews` | Đánh giá sản phẩm (cần đã mua) |

### Admin APIs (cần Bearer Token - role: admin/manager/staff)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/admin/login` | Đăng nhập admin (Form data) |
| POST | `/api/admin/logout` | Đăng xuất |
| GET | `/api/admin/profile` | Thông tin admin |
| PUT | `/api/admin/profile` | Cập nhật admin |
| POST | `/api/admin/upload` | Upload ảnh |
| GET | `/api/admin/dashboard` | Thống kê dashboard |
| GET | `/api/admin/notifications` | Thông báo admin |

#### Quản lý sản phẩm

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/products` | Danh sách sản phẩm |
| GET | `/api/admin/products?all=1` | Tất cả sản phẩm (không phân trang) |
| GET | `/api/admin/products/{id}` | Chi tiết sản phẩm |
| POST | `/api/admin/products` | Tạo sản phẩm |
| PUT | `/api/admin/products/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/admin/products/{id}` | Xóa sản phẩm |
| PUT | `/api/admin/products/{id}/toggle` | Bật/tắt sản phẩm |
| PUT | `/api/admin/products/{id}/toggle-featured` | Bật/tắt nổi bật |
| GET | `/api/admin/sizes` | Danh sách kích thước |
| GET | `/api/admin/colors` | Danh sách màu sắc |

#### Quản lý danh mục & thương hiệu

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/categories` | Danh sách danh mục |
| POST | `/api/admin/categories` | Tạo danh mục |
| PUT | `/api/admin/categories/{id}` | Cập nhật danh mục |
| DELETE | `/api/admin/categories/{id}` | Xóa danh mục |
| GET | `/api/admin/brands` | Danh sách thương hiệu |
| POST | `/api/admin/brands` | Tạo thương hiệu |
| PUT | `/api/admin/brands/{id}` | Cập nhật thương hiệu |
| DELETE | `/api/admin/brands/{id}` | Xóa thương hiệu |

#### Quản lý đơn hàng

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/orders/stats` | Thống kê đơn hàng |
| GET | `/api/admin/orders` | Danh sách đơn hàng (filter: status, search, date) |
| GET | `/api/admin/orders/{id}` | Chi tiết đơn hàng |
| PUT | `/api/admin/orders/{id}/status` | Cập nhật trạng thái |
| PUT | `/api/admin/orders/{id}/payment` | Cập nhật thanh toán |
| POST | `/api/admin/orders/{id}/cancel` | Hủy đơn hàng |

#### Quản lý khách hàng & nhân viên

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/customers` | Danh sách khách hàng |
| GET | `/api/admin/customers/{id}` | Chi tiết khách hàng |
| PUT | `/api/admin/customers/{id}` | Cập nhật khách hàng |
| GET | `/api/admin/employees` | Danh sách nhân viên |
| POST | `/api/admin/employees` | Tạo nhân viên |
| PUT | `/api/admin/employees/{id}` | Cập nhật nhân viên |
| DELETE | `/api/admin/employees/{id}` | Xóa nhân viên |
| PUT | `/api/admin/employees/{id}/toggle` | Bật/tắt nhân viên |

#### Quản lý kho & nhà cung cấp

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/warehouse` | Dữ liệu kho (?filter=low/out) |
| GET | `/api/admin/suppliers` | Danh sách nhà cung cấp |
| POST | `/api/admin/suppliers` | Tạo nhà cung cấp |
| PUT | `/api/admin/suppliers/{id}` | Cập nhật nhà cung cấp |
| DELETE | `/api/admin/suppliers/{id}` | Xóa nhà cung cấp |
| GET | `/api/admin/warehouses` | Danh sách kho |
| POST | `/api/admin/warehouses` | Tạo kho |
| PUT | `/api/admin/warehouses/{id}` | Cập nhật kho |
| DELETE | `/api/admin/warehouses/{id}` | Xóa kho |
| GET | `/api/admin/supplier-orders` | Danh sách đơn nhập hàng |

#### Khuyến mãi & mã giảm giá

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/promotions` | Danh sách khuyến mãi |
| POST | `/api/admin/promotions` | Tạo khuyến mãi |
| PUT | `/api/admin/promotions/{id}` | Cập nhật khuyến mãi |
| DELETE | `/api/admin/promotions/{id}` | Xóa khuyến mãi |
| GET | `/api/admin/coupons` | Danh sách mã giảm giá |
| POST | `/api/admin/coupons` | Tạo mã giảm giá |
| PUT | `/api/admin/coupons/{id}` | Cập nhật mã giảm giá |
| DELETE | `/api/admin/coupons/{id}` | Xóa mã giảm giá |

#### Đánh giá & tin tức

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/reviews` | Danh sách đánh giá (?filter=pending/approved) |
| PUT | `/api/admin/reviews/{id}/approve` | Duyệt đánh giá |
| PUT | `/api/admin/reviews/{id}/reply` | Phản hồi đánh giá |
| PUT | `/api/admin/reviews/{id}/toggle` | Bật/tắt đánh giá |
| DELETE | `/api/admin/reviews/{id}` | Xóa đánh giá |
| GET | `/api/admin/news` | Danh sách tin tức |
| POST | `/api/admin/news` | Tạo tin tức |
| PUT | `/api/admin/news/{id}` | Cập nhật tin tức |
| DELETE | `/api/admin/news/{id}` | Xóa tin tức |

#### Báo cáo & cấu hình

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/admin/reports` | Báo cáo (?period=7days/30days/90days/365days/all) |
| GET | `/api/admin/contacts` | Danh sách liên hệ (?filter=new/read/replied) |
| GET | `/api/admin/settings` | Lấy cấu hình |
| PUT | `/api/admin/settings` | Cập nhật cấu hình |

---

## Authentication

API sử dụng **JWT Bearer Token**.

- Token được trả về sau khi đăng nhập/register
- Các endpoint customer cần header: `Authorization: Bearer <token>`
- Các endpoint admin cần token của user có role: `admin`, `manager`, hoặc `staff`

**Mật khẩu test đơn giản** (cho phép bypass bcrypt để dev):

- `admin123` -> role: admin
- `manager123` -> role: manager
- `staff123` -> role: staff

---

## Trạng thái đơn hàng

```
pending -> confirmed -> processing -> shipped -> delivered
                                    \-> cancelled (từ pending/confirmed/processing)
                                    \-> returned (từ shipped/delivered)
```

## Trạng thái thanh toán

`unpaid` | `paid` | `partially_paid` | `refunded` | `failed`

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | FastAPI 0.115+ |
| ASGI Server | Uvicorn |
| Database | MySQL 8.0 + mysql-connector-python |
| ORM | Raw SQL (execute_query) |
| Validation | Pydantic v2 |
| Auth | JWT (python-jose) |
| Password | Bcrypt (passlib) |
| Config | pydantic-settings |
| Docs | Swagger UI + ReDoc |
