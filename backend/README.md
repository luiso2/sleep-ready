# Sleep Ready Backend API

## Overview
This is the complete backend API for the Sleep Ready application with full CRUD operations for all database entities.

## Base URL
- Production: http://168.231.92.67:3002
- Local: http://localhost:3001

## Authentication
All endpoints (except login and health check) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info

### Users Management
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Customers
- `GET /api/customers` - List all customers with pagination
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `GET /api/employees/:id/performance` - Get employee performance metrics
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Sales
- `GET /api/sales` - List all sales
- `GET /api/sales/stats` - Get sales statistics
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Calls
- `GET /api/calls` - List all calls
- `GET /api/calls/stats` - Get call statistics
- `GET /api/calls/:id` - Get call details
- `POST /api/calls` - Create new call
- `POST /api/calls/log` - Log a call with duration
- `PUT /api/calls/:id` - Update call
- `DELETE /api/calls/:id` - Delete call

### Stores
- `GET /api/stores` - List all stores
- `GET /api/stores/:id` - Get store details
- `GET /api/stores/:id/performance` - Get store performance
- `GET /api/stores/:id/employees` - Get store employees
- `POST /api/stores` - Create new store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `GET /api/campaigns/:id/stats` - Get campaign statistics
- `POST /api/campaigns` - Create new campaign
- `POST /api/campaigns/:id/start` - Start a campaign
- `POST /api/campaigns/:id/pause` - Pause a campaign
- `POST /api/campaigns/:id/complete` - Complete a campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `GET /api/subscriptions/stats` - Get subscription statistics
- `GET /api/subscriptions/:id` - Get subscription details
- `POST /api/subscriptions` - Create new subscription
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/pause` - Pause subscription
- `POST /api/subscriptions/:id/resume` - Resume subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Other Entities
- Scripts: `/api/scripts`
- Commissions: `/api/commissions`
- Evaluations: `/api/evaluations`
- Achievements: `/api/achievements`
- Shopify Customers: `/api/shopify-customers`
- Shopify Products: `/api/shopify-products`
- Shopify Settings: `/api/shopify-settings`

Each entity supports standard CRUD operations:
- `GET /api/{entity}` - List all
- `GET /api/{entity}/:id` - Get by ID
- `POST /api/{entity}` - Create new
- `PUT /api/{entity}/:id` - Update
- `DELETE /api/{entity}/:id` - Delete

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filtering
- Various filters available per entity (e.g., `status`, `type`, `role`)

### Sorting
- `sort` - Field to sort by (default: created_at)
- `order` - Sort order: ASC or DESC (default: DESC)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Development

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with required variables
4. Run migrations (if needed)
5. Start server: `npm start` or `npm run dev`

### Environment Variables
```
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
DB_HOST=168.231.92.67
DB_PORT=5434
DB_NAME=sleepplus
DB_USER=sleepuser
DB_PASS=SleepPlus2024SecurePass
ALLOWED_ORIGINS=http://168.231.92.67:8081,http://localhost:3000
```

## Testing

Use tools like Postman or curl to test the API:

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sleepready.com","password":"admin123"}'

# Get customers (with auth)
curl http://localhost:3001/api/customers \
  -H "Authorization: Bearer <your-token>"
```
