# 📊 Análisis Completo de Base de Datos - Sleep Ready

## 📋 Resumen Ejecutivo

La base de datos del sistema Sleep Ready está compuesta por **15 tablas principales** que gestionan todo el flujo de negocio de la tienda de colchones, desde la gestión de clientes y empleados hasta las ventas, suscripciones y gamificación.

## 🔗 Modelo de Relaciones

### Diagrama de Relaciones Principales:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   STORES    │◄────│  EMPLOYEES   │────►│    USERS    │
└─────────────┘     └──────────────┘     └─────────────┘
       ▲                    │                     
       │                    ▼                     
       │            ┌──────────────┐              
       │            │    CALLS     │              
       │            └──────────────┘              
       │                    │                     
       ▼                    ▼                     
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    SALES    │◄────│  CUSTOMERS   │────►│SUBSCRIPTIONS│
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     
       ▼                    ▼                     
┌─────────────┐     ┌──────────────┐              
│ COMMISSIONS │     │ EVALUATIONS  │              
└─────────────┘     └──────────────┘              
```

## 📁 Estructura Detallada de Tablas

### 1. **USERS** (Tabla de Autenticación)
```sql
- id: INTEGER (PK, auto-increment)
- email: VARCHAR(255) NOT NULL
- password: VARCHAR(255) NOT NULL
- name: VARCHAR(255)
- role: VARCHAR(50) DEFAULT 'user'
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```
**Propósito**: Gestión de autenticación básica del sistema.

### 2. **EMPLOYEES** (Empleados)
```sql
- id: VARCHAR(50) (PK)
- employee_id: VARCHAR(20) NOT NULL
- email: VARCHAR(255) NOT NULL
- password: VARCHAR(255)
- first_name: VARCHAR(100) NOT NULL
- last_name: VARCHAR(100) NOT NULL
- role: VARCHAR(50) NOT NULL
- store_id: VARCHAR(50) → FK stores(id)
- phone_extension: VARCHAR(10)
- avatar: VARCHAR(255)
- status: VARCHAR(20) DEFAULT 'active'
- shift: VARCHAR(20)
- hired_at: TIMESTAMP WITH TIME ZONE
- commissions: JSONB
- performance: JSONB
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**: 
- Pertenece a STORES
- Tiene muchos CALLS, SALES, EVALUATIONS

### 3. **STORES** (Tiendas)
```sql
- id: VARCHAR(50) (PK)
- name: VARCHAR(255) NOT NULL
- code: VARCHAR(20) NOT NULL
- address: JSONB NOT NULL
- phone: VARCHAR(20)
- manager_id: VARCHAR(50) → FK employees(id)
- hours: JSONB
- service_area: JSONB
- performance: JSONB
- status: VARCHAR(20) DEFAULT 'active'
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Tiene un EMPLOYEE como manager
- Tiene muchos EMPLOYEES, SALES

### 4. **CUSTOMERS** (Clientes)
```sql
- id: VARCHAR(50) (PK)
- phone: VARCHAR(20)
- email: VARCHAR(255)
- first_name: VARCHAR(100) NOT NULL
- last_name: VARCHAR(100) NOT NULL
- address: JSONB
- tier: VARCHAR(20)
- source: VARCHAR(50)
- tags: TEXT[]
- lifetime_value: NUMERIC
- first_purchase_date: TIMESTAMP WITH TIME ZONE
- last_purchase_date: TIMESTAMP WITH TIME ZONE
- last_contact_date: TIMESTAMP WITH TIME ZONE
- purchased_items: TEXT[]
- is_elite_member: BOOLEAN DEFAULT false
- membership_status: VARCHAR(20)
- total_trades: INTEGER DEFAULT 0
- total_credit_earned: NUMERIC DEFAULT 0
- current_credit: NUMERIC DEFAULT 0
- do_not_call: BOOLEAN DEFAULT false
- notes: TEXT
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Tiene muchos CALLS, SALES, SUBSCRIPTIONS, EVALUATIONS

### 5. **SALES** (Ventas)
```sql
- id: VARCHAR(50) (PK)
- subscription_id: VARCHAR(50) → FK subscriptions(id)
- customer_id: VARCHAR(50) → FK customers(id)
- user_id: VARCHAR(50) → FK employees(id)
- store_id: VARCHAR(50) → FK stores(id)
- type: VARCHAR(50) NOT NULL
- channel: VARCHAR(50) NOT NULL
- amount: JSONB NOT NULL
- commission: JSONB
- contract: JSONB
- payment_status: VARCHAR(20)
- call_id: VARCHAR(50) → FK calls(id)
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Pertenece a SUBSCRIPTION, CUSTOMER, EMPLOYEE, STORE, CALL

### 6. **SUBSCRIPTIONS** (Suscripciones)
```sql
- id: VARCHAR(50) (PK)
- customer_id: VARCHAR(50) → FK customers(id)
- plan: VARCHAR(50) NOT NULL
- status: VARCHAR(20) NOT NULL
- pricing: JSONB NOT NULL
- billing: JSONB NOT NULL
- services: JSONB
- credits: JSONB
- start_date: TIMESTAMP WITH TIME ZONE NOT NULL
- cancelled_at: TIMESTAMP WITH TIME ZONE
- paused_at: TIMESTAMP WITH TIME ZONE
- cancel_reason: TEXT
- sold_by: VARCHAR(50) → FK employees(id)
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Pertenece a CUSTOMER, EMPLOYEE (sold_by)
- Tiene muchos SALES

### 7. **CALLS** (Llamadas)
```sql
- id: VARCHAR(50) (PK)
- customer_id: VARCHAR(50) → FK customers(id)
- user_id: VARCHAR(50) → FK employees(id)
- type: VARCHAR(20) NOT NULL
- status: VARCHAR(20) NOT NULL
- disposition: VARCHAR(50)
- duration: INTEGER
- start_time: TIMESTAMP WITH TIME ZONE
- end_time: TIMESTAMP WITH TIME ZONE
- notes: TEXT
- script: JSONB
- objections: TEXT[]
- next_action: JSONB
- metadata: JSONB
- created_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Pertenece a CUSTOMER, EMPLOYEE

### 8. **EVALUATIONS** (Evaluaciones Trade & Sleep)
```sql
- id: VARCHAR(50) (PK)
- customer_id: VARCHAR(50) NOT NULL
- mattress: JSONB NOT NULL
- photos: JSONB
- ai_evaluation: JSONB
- credit_approved: NUMERIC
- status: VARCHAR(20) NOT NULL
- employee_id: VARCHAR(50) → FK employees(id)
- store_id: VARCHAR(50) → FK stores(id)
- coupon_code: VARCHAR(50)
- shopify_price_rule_id: VARCHAR(50)
- shopify_discount_code_id: VARCHAR(50)
- customer_info: JSONB
- created_at: TIMESTAMP WITH TIME ZONE
- expires_at: TIMESTAMP WITH TIME ZONE
- redeemed_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Pertenece a EMPLOYEE, STORE

### 9. **ACHIEVEMENTS** (Logros - Gamificación)
```sql
- id: VARCHAR(50) (PK)
- code: VARCHAR(50) NOT NULL
- name: VARCHAR(255) NOT NULL
- description: TEXT
- icon: VARCHAR(10)
- category: VARCHAR(50)
- criteria: JSONB
- rewards: JSONB
- tier: VARCHAR(20)
- unlocked_by: JSONB
- created_at: TIMESTAMP WITH TIME ZONE
```

### 10. **SCRIPTS** (Scripts de Venta)
```sql
- id: VARCHAR(50) (PK)
- name: VARCHAR(255) NOT NULL
- type: VARCHAR(50) NOT NULL
- version: VARCHAR(10) NOT NULL
- status: VARCHAR(20) DEFAULT 'active'
- segments: JSONB
- variables: TEXT[]
- success_rate: NUMERIC
- usage_count: INTEGER DEFAULT 0
- created_by: VARCHAR(50) → FK employees(id)
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Creado por EMPLOYEE

### 11. **CAMPAIGNS** (Campañas)
```sql
- id: VARCHAR(50) (PK)
- name: VARCHAR(255) NOT NULL
- type: VARCHAR(50) NOT NULL
- status: VARCHAR(20) DEFAULT 'draft'
- targeting: JSONB
- script: JSONB
- offer: JSONB
- metrics: JSONB
- assigned_to: TEXT[]
- start_date: TIMESTAMP WITH TIME ZONE
- end_date: TIMESTAMP WITH TIME ZONE
- created_by: VARCHAR(50) → FK employees(id)
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Creado por EMPLOYEE

### 12. **COMMISSIONS** (Comisiones)
```sql
- id: VARCHAR(50) (PK)
- user_id: VARCHAR(50) → FK employees(id)
- period: JSONB NOT NULL
- earnings: JSONB NOT NULL
- sales: JSONB
- status: VARCHAR(20) DEFAULT 'calculating'
- created_at/updated_at: TIMESTAMP WITH TIME ZONE
```
**Relaciones**:
- Pertenece a EMPLOYEE

### 13-15. **Tablas de Shopify** (Integración)
```sql
- shopify_customers
- shopify_products  
- shopify_settings
```
(Estructura no analizada - pendiente de integración)

## 🔍 Observaciones y Recomendaciones

### ✅ Puntos Fuertes:
1. **Uso de JSONB**: Flexibilidad para datos complejos
2. **IDs VARCHAR(50)**: Permite UUIDs o IDs personalizados
3. **Timestamps automáticos**: Buena trazabilidad
4. **Relaciones bien definidas**: Integridad referencial

### ⚠️ Consideraciones:
1. **Doble sistema de usuarios**: `users` vs `employees` - considerar unificar
2. **Sin índices definidos**: Agregar índices para optimización
3. **Campos JSONB**: Documentar estructura esperada

### 📈 Próximos Pasos:
1. Crear índices en campos de búsqueda frecuente
2. Definir vistas para reportes comunes
3. Implementar triggers para actualización automática de campos calculados
4. Documentar estructura JSONB esperada para cada campo

## 🚀 Plan de Implementación API

### Orden de Desarrollo de Endpoints:
1. **Base**: Customers, Employees, Stores
2. **Operaciones**: Sales, Subscriptions, Calls
3. **Características**: Evaluations, Achievements, Scripts
4. **Reportes**: Commissions, Campaigns
5. **Integraciones**: Shopify (cuando sea necesario)

