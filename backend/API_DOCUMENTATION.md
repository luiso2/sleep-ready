# Sleep Ready API Documentation

## Base Information
- **Production URL**: http://168.231.92.67:3002
- **Local URL**: http://localhost:3001
- **API Version**: 2.0.0

## Authentication

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sleepready.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "emp-123",
      "email": "admin@sleepready.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "administrator"
    }
  }
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "emp-123",
    "email": "admin@sleepready.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "administrator"
  }
}
```

## Entities

### 1. Customers
**Fields**: id, phone, email, first_name, last_name, address, tier, source, tags, lifetime_value, membership_status, etc.

```bash
# List customers with pagination and filters
GET /api/customers?page=1&limit=10&search=john&tier=gold

# Get single customer
GET /api/customers/:id

# Create customer
POST /api/customers
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "tier": "bronze",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}

# Update customer
PUT /api/customers/:id
{
  "tier": "gold",
  "membership_status": "active"
}

# Delete customer
DELETE /api/customers/:id
```

### 2. Employees
**Fields**: id, employee_id, email, first_name, last_name, role, store_id, status, shift, performance, etc.

```bash
# List employees
GET /api/employees?role=sales&store_id=store-123&status=active

# Get employee performance
GET /api/employees/:id/performance?start_date=2025-01-01&end_date=2025-06-30

# Create employee
POST /api/employees
{
  "employee_id": "EMP001",
  "email": "john.smith@company.com",
  "first_name": "John",
  "last_name": "Smith",
  "role": "sales",
  "store_id": "store-123",
  "phone_extension": "101"
}
```

### 3. Sales
**Fields**: id, subscription_id, customer_id, user_id, store_id, type, channel, amount, commission, payment_status, etc.

```bash
# List sales with filters
GET /api/sales?type=new&channel=phone&start_date=2025-06-01

# Get sales statistics
GET /api/sales/stats?start_date=2025-01-01&group_by=month

# Create sale
POST /api/sales
{
  "customer_id": "cust-123",
  "user_id": "emp-456",
  "store_id": "store-789",
  "type": "new",
  "channel": "phone",
  "amount": {
    "subtotal": 199.99,
    "tax": 20.00,
    "total": 219.99
  },
  "payment_status": "paid"
}
```

### 4. Calls
**Fields**: id, customer_id, user_id, type, status, disposition, duration, notes, script, objections, etc.

```bash
# List calls
GET /api/calls?type=outbound&disposition=sale

# Get call statistics
GET /api/calls/stats?user_id=emp-123

# Log a call
POST /api/calls/log
{
  "customer_id": "cust-123",
  "user_id": "emp-456",
  "type": "outbound",
  "status": "completed",
  "disposition": "sale",
  "duration": 420,
  "notes": "Customer interested in premium plan",
  "objections": ["price", "contract_length"]
}
```

### 5. Stores
**Fields**: id, name, code, address, phone, manager_id, hours, service_area, status, etc.

```bash
# List stores
GET /api/stores?status=active

# Get store performance
GET /api/stores/:id/performance

# Get store employees
GET /api/stores/:id/employees

# Create store
POST /api/stores
{
  "name": "Sleep Ready Manhattan",
  "code": "SR-MAN-001",
  "address": {
    "street": "789 Broadway",
    "city": "New York",
    "state": "NY",
    "zip": "10003"
  },
  "phone": "+1234567890",
  "manager_id": "emp-123"
}
```

### 6. Campaigns
**Fields**: id, name, type, status, targeting, script, offer, metrics, assigned_to, start_date, end_date, etc.

```bash
# List campaigns
GET /api/campaigns?status=active

# Get campaign statistics
GET /api/campaigns/:id/stats

# Create campaign
POST /api/campaigns
{
  "name": "Summer Sleep Sale 2025",
  "type": "promotional",
  "targeting": {
    "tiers": ["gold", "platinum"],
    "min_lifetime_value": 1000
  },
  "offer": {
    "discount": 20,
    "products": ["premium_mattress", "adjustable_base"]
  },
  "assigned_to": ["emp-123", "emp-456"]
}

# Campaign actions
POST /api/campaigns/:id/start
POST /api/campaigns/:id/pause
POST /api/campaigns/:id/complete
```

### 7. Subscriptions
**Fields**: id, customer_id, plan, status, pricing, billing, services, credits, start_date, etc.

```bash
# List subscriptions
GET /api/subscriptions?status=active&plan=premium

# Get subscription statistics
GET /api/subscriptions/stats

# Create subscription
POST /api/subscriptions
{
  "customer_id": "cust-123",
  "plan": "premium",
  "status": "active",
  "pricing": {
    "monthly": 49.99,
    "annual": 499.99
  },
  "billing": {
    "cycle": "monthly",
    "next_date": "2025-07-01"
  },
  "start_date": "2025-06-01"
}

# Subscription actions
POST /api/subscriptions/:id/cancel
{
  "reason": "Customer requested cancellation"
}

POST /api/subscriptions/:id/pause
POST /api/subscriptions/:id/resume
```

### 8. Other Entities

#### Scripts
```bash
GET /api/scripts
POST /api/scripts
PUT /api/scripts/:id
DELETE /api/scripts/:id
```

#### Commissions
```bash
GET /api/commissions
POST /api/commissions
PUT /api/commissions/:id
DELETE /api/commissions/:id
```

#### Evaluations
```bash
GET /api/evaluations
POST /api/evaluations
PUT /api/evaluations/:id
DELETE /api/evaluations/:id
```

#### Achievements
```bash
GET /api/achievements
POST /api/achievements
PUT /api/achievements/:id
DELETE /api/achievements/:id
```

#### Shopify Integration
```bash
# Shopify Customers
GET /api/shopify-customers
POST /api/shopify-customers
PUT /api/shopify-customers/:id
DELETE /api/shopify-customers/:id

# Shopify Products
GET /api/shopify-products
POST /api/shopify-products
PUT /api/shopify-products/:id
DELETE /api/shopify-products/:id

# Shopify Settings
GET /api/shopify-settings
POST /api/shopify-settings
PUT /api/shopify-settings/:id
DELETE /api/shopify-settings/:id
```

## Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Sorting
- `sort` - Field to sort by (default: created_at)
- `order` - Sort order: ASC or DESC (default: DESC)

### Date Filtering
- `start_date` - Filter results from this date
- `end_date` - Filter results until this date

## Error Handling

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Customer not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Returns 429 status code when limit exceeded

## CORS
Allowed origins:
- http://168.231.92.67:8081
- http://localhost:3000
- http://localhost:5173
