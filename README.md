# 📚 BookStore Backend API

## ⚡ Setup في 3 خطوات

### 1. قاعدة البيانات
```sql
-- افتح phpMyAdmin أو MySQL Workbench وشغّل:
source database.sql
```

### 2. ضع الملفات
```
htdocs/bookstore/     ← XAMPP
www/bookstore/        ← WAMP
```

### 3. شغّل الـ API
```
http://localhost/bookstore/api/health
```
لازم ترجع:
```json
{"status":"success","message":"BookStore API is running 🚀"}
```

---

## 🔐 حسابات تجريبية

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@bookstore.com    | admin123  |
| User  | ahmed@example.com      | user123   |

---

## 📡 كل الـ Endpoints

### Auth
| Method | Endpoint                    | Auth     | Description          |
|--------|-----------------------------|----------|----------------------|
| POST   | /api/auth/register          | ❌       | تسجيل مستخدم جديد   |
| POST   | /api/auth/login             | ❌       | تسجيل دخول          |
| GET    | /api/auth/me                | ✅ User  | بيانات المستخدم الحالي |
| PUT    | /api/auth/me                | ✅ User  | تحديث البروفايل     |
| POST   | /api/auth/change-password   | ✅ User  | تغيير كلمة المرور   |

### Books
| Method | Endpoint                    | Auth     | Description          |
|--------|-----------------------------|----------|----------------------|
| GET    | /api/books                  | ❌       | كل الكتب + بحث + فلتر |
| GET    | /api/books/:id              | ❌       | تفاصيل كتاب         |
| POST   | /api/books                  | ✅ Admin | إضافة كتاب          |
| PUT    | /api/books/:id              | ✅ Admin | تعديل كتاب          |
| DELETE | /api/books/:id              | ✅ Admin | حذف كتاب            |

**Query Parameters for GET /api/books:**
- `?search=harry` — البحث بالعنوان أو الكاتب
- `?category_id=1` — فلتر بالتصنيف
- `?min_price=10&max_price=50` — فلتر بالسعر
- `?page=1&limit=10` — الـ Pagination

### Categories
| Method | Endpoint                    | Auth     |
|--------|-----------------------------|----------|
| GET    | /api/categories             | ❌       |
| POST   | /api/categories             | ✅ Admin |
| PUT    | /api/categories/:id         | ✅ Admin |
| DELETE | /api/categories/:id         | ✅ Admin |

### Cart
| Method | Endpoint   | Auth    | Description           |
|--------|------------|---------|-----------------------|
| GET    | /api/cart  | ✅ User | عرض السلة            |
| POST   | /api/cart  | ✅ User | إضافة كتاب للسلة    |
| PUT    | /api/cart  | ✅ User | تحديث الكمية         |
| DELETE | /api/cart  | ✅ User | حذف عنصر أو تفريغ السلة |

### Orders
| Method | Endpoint          | Auth    | Description           |
|--------|-------------------|---------|-----------------------|
| GET    | /api/orders       | ✅ User | سجل الطلبات          |
| GET    | /api/orders/:id   | ✅ User | تفاصيل طلب           |
| POST   | /api/orders       | ✅ User | إنشاء طلب من السلة   |

### Admin
| Method | Endpoint                    | Auth     | Description          |
|--------|-----------------------------|----------|----------------------|
| GET    | /api/admin/stats            | ✅ Admin | إحصائيات عامة       |
| GET    | /api/admin/users            | ✅ Admin | كل المستخدمين       |
| DELETE | /api/admin/users/:id        | ✅ Admin | حذف مستخدم          |
| GET    | /api/admin/orders           | ✅ Admin | كل الطلبات           |
| GET    | /api/admin/orders/:id       | ✅ Admin | تفاصيل طلب          |
| PUT    | /api/admin/orders/:id       | ✅ Admin | تحديث حالة الطلب    |

---

## 🔑 استخدام الـ JWT Token

بعد login أو register هيرجع `token`، ضيفه في كل request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📦 مثال Requests

### Register
```json
POST /api/auth/register
{
  "name": "Mohamed Ali",
  "email": "mo@example.com",
  "password": "123456"
}
```

### Add to Cart
```json
POST /api/cart
Authorization: Bearer {token}
{
  "book_id": 1,
  "quantity": 2
}
```

### Place Order
```json
POST /api/orders
Authorization: Bearer {token}
{}
```

### Admin Update Order Status
```json
PUT /api/admin/orders/1
Authorization: Bearer {admin_token}
{
  "status": "shipped"
}
```

---

## 📁 Folder Structure
```
bookstore/
├── index.php           ← Router
├── .htaccess           ← Clean URLs
├── database.sql        ← Database setup
├── config/
│   ├── database.php    ← DB connection
│   ├── jwt.php         ← Auth helpers
│   └── helpers.php     ← Response helpers
└── api/
    ├── auth/
    │   └── auth.php
    ├── books/
    │   ├── books.php
    │   └── categories.php
    ├── cart/
    │   └── cart.php
    ├── orders/
    │   └── orders.php
    └── admin/
        └── admin.php
```
