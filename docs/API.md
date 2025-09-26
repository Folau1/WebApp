# API Documentation

Base URL: `https://api.yourdomain.com/api`

## Authentication

### Telegram WebApp Authentication

All WebApp requests must include the Telegram init data:

```
X-Telegram-Init-Data: <initData string from Telegram.WebApp>
```

### Admin Authentication

Admin endpoints require Bearer token:

```
Authorization: Bearer <JWT token>
```

## Endpoints

### Auth

#### Admin Login
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJ...",
  "admin": {
    "id": "clxx...",
    "email": "admin@example.com",
    "name": "Admin"
  }
}
```

#### Validate Telegram User
```http
POST /auth/telegram/validate
Content-Type: application/json

{
  "initData": "query_id=..."
}

Response:
{
  "user": {
    "id": "clxx...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "role": "USER"
  }
}
```

### Catalog

#### Get Categories
```http
GET /catalog/categories

Response:
{
  "categories": [
    {
      "id": "clxx...",
      "name": "Сумки",
      "slug": "bags",
      "parentId": null,
      "_count": {
        "products": 5
      }
    }
  ]
}
```

#### Get Products
```http
GET /catalog/products?search=сумка&category=clxx...&page=1&limit=20&sort=price_asc

Query Parameters:
- search: string (optional) - поиск по названию/описанию
- category: string (optional) - ID категории
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- sort: string (default: created_desc)
  - price_asc - по возрастанию цены
  - price_desc - по убыванию цены
  - created_asc - старые первые
  - created_desc - новые первые

Response:
{
  "products": [
    {
      "id": "clxx...",
      "title": "Кожаная сумка",
      "slug": "leather-bag",
      "description": "...",
      "price": 890000,
      "compareAt": 1200000,
      "finalPrice": 890000,
      "discount": {
        "amount": 310000,
        "percentage": 26
      },
      "category": {...},
      "media": [...],
      "active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### Get Product by Slug
```http
GET /catalog/products/:slug

Response:
{
  "product": {
    "id": "clxx...",
    "title": "Кожаная сумка",
    "slug": "leather-bag",
    "description": "Подробное описание...",
    "price": 890000,
    "compareAt": 1200000,
    "finalPrice": 890000,
    "discount": null,
    "category": {
      "id": "clxx...",
      "name": "Сумки",
      "slug": "bags"
    },
    "media": [
      {
        "id": "clxx...",
        "kind": "IMAGE",
        "url": "https://...",
        "order": 0
      }
    ]
  }
}
```

### Orders

#### Create Order
```http
POST /orders
X-Telegram-Init-Data: <required>
Content-Type: application/json

{
  "items": [
    {
      "productId": "clxx...",
      "qty": 2
    }
  ],
  "discountCode": "WELCOME10" // optional
}

Response:
{
  "order": {
    "id": "clxx...",
    "number": 1001,
    "items": [...],
    "totalAmount": 178000,
    "discountTotal": 20000,
    "status": "PENDING"
  }
}
```

#### Get My Orders
```http
GET /orders/my
X-Telegram-Init-Data: <required>

Response:
{
  "orders": [
    {
      "id": "clxx...",
      "number": 1001,
      "items": [...],
      "totalAmount": 178000,
      "status": "PAID",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Order Details
```http
GET /orders/:id
X-Telegram-Init-Data: <required>

Response:
{
  "order": {
    "id": "clxx...",
    "number": 1001,
    "items": [
      {
        "id": "clxx...",
        "product": {...},
        "title": "Кожаная сумка",
        "unitPrice": 89000,
        "qty": 2,
        "subtotal": 178000
      }
    ],
    "totalAmount": 178000,
    "discountTotal": 0,
    "status": "PAID",
    "ykPaymentId": "2dxx...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Payments

#### Create Payment
```http
POST /payments/yookassa/create
X-Telegram-Init-Data: <required>
Content-Type: application/json

{
  "orderId": "clxx..."
}

Response:
{
  "paymentId": "2dxx...",
  "confirmationUrl": "https://yoomoney.ru/checkout/..."
}
```

#### Check Payment Status
```http
GET /payments/yookassa/status/:paymentId
X-Telegram-Init-Data: <required>

Response:
{
  "status": "succeeded",
  "paid": true,
  "orderId": "clxx...",
  "orderStatus": "PAID"
}
```

#### YooKassa Webhook
```http
POST /payments/yookassa/webhook
Content-Type: application/json

{
  "type": "notification",
  "event": "payment.succeeded",
  "object": {
    "id": "2dxx...",
    "status": "succeeded",
    "paid": true,
    "amount": {
      "value": "1780.00",
      "currency": "RUB"
    },
    "metadata": {
      "orderId": "clxx...",
      "userId": "clxx..."
    }
  }
}
```

### Discounts

#### Validate Discount Code
```http
POST /discounts/validate
Content-Type: application/json

{
  "code": "WELCOME10"
}

Response:
{
  "discount": {
    "id": "clxx...",
    "code": "WELCOME10",
    "type": "PERCENT",
    "value": 10
  }
}
```

### Media

#### Get Presigned Upload URL
```http
POST /media/presign
Authorization: Bearer <admin token>
Content-Type: application/json

{
  "filename": "product-image.jpg",
  "contentType": "image/jpeg",
  "kind": "IMAGE"
}

Response:
{
  "uploadUrl": "https://s3.../presigned-url",
  "publicUrl": "https://s3.../tgshop/images/uuid.jpg",
  "key": "images/uuid.jpg"
}
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` header.

#### Dashboard Stats
```http
GET /admin/stats

Response:
{
  "stats": {
    "totalProducts": 25,
    "totalOrders": 143,
    "totalRevenue": 2450000,
    "recentOrders": [...]
  }
}
```

#### Products CRUD
```http
GET /admin/products
POST /admin/products
PUT /admin/products/:id
DELETE /admin/products/:id
```

#### Categories CRUD
```http
GET /admin/categories
POST /admin/categories
PUT /admin/categories/:id
DELETE /admin/categories/:id
```

#### Orders Management
```http
GET /admin/orders?status=PAID&page=1&limit=20
PUT /admin/orders/:id/status
```

#### Discounts CRUD
```http
GET /admin/discounts
POST /admin/discounts
PUT /admin/discounts/:id
DELETE /admin/discounts/:id
```

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "String must contain at least 1 character(s)",
      "path": ["title"]
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "error": "Invalid token"
}
```

### Not Found (404)
```json
{
  "error": "Product not found"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API has rate limiting:
- 100 requests per 15 minutes per IP
- 429 status code when exceeded

## CORS

Allowed origins configured via `CORS_ORIGIN` environment variable.

## Webhooks

### YooKassa Webhook Security

Webhook requests are verified using HMAC signature in `X-Yookassa-Signature` header.








