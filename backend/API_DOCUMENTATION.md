# Sleep Ready API Documentation

## Base URL
- Production: http://168.231.92.67:3002
- Local: http://localhost:3001

## Authentication
All endpoints (except health check and auth endpoints) require authentication using JWT tokens.

Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/logout` - Logout

### Customers
- `GET /api/customers` - Get all customers (with pagination)
  - Query params: `page`, `limit`, `search`, `tier`
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Employees
- `GET /api/employees` - Get all employees (with pagination)
  - Query params: `page`, `limit`, `sort`, `order`, `role`, `store_id`, `status`
- `GET /api/employees/:id` - Get employee by ID
- `GET /api/employees/:id/performance` - Get employee performance metrics
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Sales
- `GET /api/sales` - Get all sales (with pagination)
  - Query params: `page`, `limit`, `sort`, `order`, `type`, `channel`, `payment_status`, `user_id`, `customer_id`, `store_id`, `start_date`, `end_date`
- `GET /api/sales/stats` - Get sales statistics
  - Query params: `start_date`, `end_date`, `group_by` (hour|day|week|month)
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Calls
- `GET /api/calls` - Get all calls (with pagination)
  - Query params: `page`, `limit`, `sort`, `order`, `type`, `status`, `disposition`, `user_id`, `customer_id`, `start_date`, `end_date`
- `GET /api/calls/stats` - Get call statistics
  - Query params: `user_id`, `start_date`, `end_date`
- `GET /api/calls/:id` - Get call by ID
- `POST /api/calls` - Create new call
- `POST /api/calls/log` - Log a new call with duration
- `PUT /api/calls/:id` - Update call
- `DELETE /api/calls/:id` - Delete call

### Stores
- `GET /api/stores` - Get all stores (with pagination)
  - Query params: `page`, `limit`, `sort`, `order`, `status`
- `GET /api/stores/:id` - Get store by ID
- `GET /api/stores/:id/performance` - Get store performance metrics
- `GET /api/stores/:id/employees` - Get store employees
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Campaigns
- `GET /api/campaigns` - Get all campaigns (with pagination)
  - Query params: `page`, `limit`, `sort`, `order`, `type`, `status`, `created_by`
- `GET /api/campaigns/:id` - Get campaign by ID
- `GET /api/campaigns/:id/stats` - Get campaign statistics
- `POST /api/campaigns` - Create new campaign
- `POST /api/campaigns/:id/start` - Start a campaign
- `POST /api/campaigns/:id/pause` - Pause a campaign
- `POST /api/campaigns/:id/complete` - Complete a campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions (with pagination)
  - Query params: `page`, `limit`, `sort`, `order`, `plan`, `status`, `customer_id`
- `GET /api/subscriptions/stats` - Get subscription statistics
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `POST /api/subscriptions/:id/resume` - Resume subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Scripts
- `GET /api/scripts` - Get all scripts
- `GET /api/scripts/:id` - Get script by ID
- `POST /api/scripts` - Create new script
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script

### Commissions
- `GET /api/commissions` - Get all commissions
- `GET /api/commissions/:id` - Get commission by ID
- `POST /api/commissions` - Create new commission
- `PUT /api/commissions/:id` - Update commission
- `DELETE /api/commissions/:id` - Delete commission

### Evaluations
- `GET /api/evaluations` - Get all evaluations
- `GET /api/evaluations/:id` - Get evaluation by ID
- `POST /api/evaluations` - Create new evaluation
- `PUT /api/evaluations/:id` - Update evaluation
- `DELETE /api/evaluations/:id` - Delete evaluation

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/:id` - Get achievement by ID
- `POST /api/achievements` - Create new achievement
- `PUT /api/achievements/:id` - Update achievement
- `DELETE /api/achievements/:id` - Delete achievement

### Shopify Customers
- `GET /api/shopify-customers` - Get all Shopify customers
- `GET /api/shopify-customers/:id` - Get Shopify customer by ID
- `POST /api/shopify-customers` - Create new Shopify customer
- `PUT /api/shopify-customers/:id` - Update Shopify customer
- `DELETE /api/shopify-customers/:id` - Delete Shopify customer

### Shopify Products
- `GET /api/shopify-products` - Get all Shopify products
- `GET /api/shopify-products/:id` - Get Shopify product by ID
- `POST /api/shopify-products` - Create new Shopify product
- `PUT /api/shopify-products/:id` - Update Shopify product
- `DELETE /api/shopify-products/:id` - Delete Shopify product

### Shopify Settings
- `GET /api/shopify-settings` - Get all Shopify settings
- `GET /api/shopify-settings/:id` - Get Shopify setting by ID
- `POST /api/shopify-settings` - Create new Shopify setting
- `PUT /api/shopify-settings/:id` - Update Shopify setting
- `DELETE /api/shopify-settings/:id` - Delete Shopify setting

## Pagination
All list endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Field to sort by (default: created_at)
- `order` - Sort order: ASC or DESC (default: DESC)

## Response Format
All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]  // Optional validation errors
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
