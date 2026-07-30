# Test Data Cleanup Guide

## Overview
This guide documents the test data cleanup process for the POS System project.

## Test Data Location
- **Store ID**: 52
- **Test Scripts**: 
  - `query/check_and_fix_sales_data.py` - Creates test orders
  - `generate_dataset.py` - Generates test products (300 products for store ID 52)

## Pages Affected by Test Data

### 1. Store Admin - Sales Page
**Path**: `pos-frontend/src/pages/store/store-admin/Sales.jsx`
**Impact**: Shows sales data for store ID 52
**Data**: Orders, order items, customer info
**Cleanup**: Delete orders and order_items for branches in store ID 52

### 2. Dashboard Pages
**Paths**:
- `pos-frontend/src/pages/store/Dashboard/DashboardStats.jsx`
- `pos-frontend/src/pages/store/Dashboard/SalesTrend.jsx`
- `pos-frontend/src/pages/store/Dashboard/RecentSales.jsx`

**Impact**: Display sales statistics and trends
**Data**: Orders, daily sales aggregates
**Cleanup**: Delete orders (aggregates will auto-update)

### 3. Store Admin - Reports Page
**Path**: `pos-frontend/src/pages/store/store-admin/Reports.jsx`
**Impact**: Shows sales reports and analytics
**Data**: Orders, refunds, payment breakdowns
**Cleanup**: Delete orders, refunds, and related data

### 4. Alerts Pages
**Paths**:
- `pos-frontend/src/pages/store/Alerts/LowStockProductTable.jsx`
- `pos-frontend/src/pages/store/Alerts/RefundSpikeTable.jsx`

**Impact**: Alert dashboards for low stock and refund spikes
**Data**: Branch inventory, refunds
**Cleanup**: Delete branch_inventory and refunds

### 5. Product Management Pages
**Paths**:
- `pos-frontend/src/pages/store/Product/Products.jsx`
- `pos-frontend/src/pages/store/Product/ProductTable.jsx`
- `pos-frontend/src/pages/store/Product/ProductDetails.jsx`

**Impact**: Product listings and inventory
**Data**: Products, branch_inventory
**Cleanup**: Delete products and branch_inventory records

## Database Tables Affected

### Order-Related Tables
1. **orders** - All orders for branches in store ID 52
2. **order_items** - Items from those orders
3. **refunds** - Refunds linked to those orders
4. **notifications** - User notifications for store users

### Product-Related Tables
1. **products** - Products with store_id = 52
2. **branch_inventory** - Inventory records for store ID 52

### Store Configuration Tables
1. **stores** - Store record with id = 52
2. **branches** - Branches belonging to store ID 52
3. **store_settings** - Settings for store ID 52
4. **store_subscriptions** - Subscription records for store ID 52
5. **approval_requests** - Approval requests for store ID 52
6. **users** - Users belonging to store ID 52 (NOT deleted by cleanup)

## Cleanup Process

### Step 1: Run Cleanup Script
```bash
python query/cleanup_test_data.py
```
The script will prompt for confirmation. Type "DELETE" to proceed.

### Step 2: Restart Backend
```bash
cd pos-backend
./mvnw spring-boot:run
```

### Step 3: Verify Cleanup
1. Navigate to Sales page - should show no data
2. Navigate to Dashboard - should show empty stats
3. Navigate to Products page - should show no products
4. Navigate to Reports - should show no reports

## What Gets Preserved

The cleanup script **DOES NOT** delete:
- User accounts (users table) - even if store_id = 52
- System-wide settings (system_settings table)
- Subscription plans (subscription_plans table)
- Categories table

## What Gets Deleted

Everything associated with store ID 52:
- Store record itself
- All branches
- All orders and order items
- All products
- All branch inventory
- All refunds
- All notifications for store users
- Store settings
- Store subscriptions
- Approval requests

## Recreating Test Data (If Needed)

### Option 1: Using check_and_fix_sales_data.py
```bash
python query/check_and_fix_sales_data.py
```
This creates 5 test orders for today.

### Option 2: Using generate_dataset.py
```bash
python generate_dataset.py
```
This generates 300 products in an Excel file for store ID 52.
Then import via the Products page.

## Important Notes

1. **Backup First**: Always backup the database before running cleanup:
   ```bash
   pg_dump -U postgres pos > backup_before_cleanup.sql
   ```

2. **Production Warning**: Never run this script against production data!

3. **User Accounts**: User accounts are preserved but may show as "orphaned" after store deletion. You may want to:
   - Delete those users manually
   - Or reassign them to another store

4. **Frontend Caching**: After cleanup, clear browser cache and refresh pages to see empty states.

## Files Modified/Created

- `query/cleanup_test_data.py` - NEW: Cleanup script
- `query/TEST_DATA_CLEANUP_GUIDE.md` - NEW: This documentation
- `generate_dataset.py` - EXISTING: Test data generator
- `check_and_fix_sales_data.py` - EXISTING: Sales data fixer

## Verification Queries

Run these to verify cleanup:

```sql
-- Verify no orders exist for store 52
SELECT COUNT(*) FROM orders WHERE branch_id IN 
  (SELECT id FROM branches WHERE store_id = 52);

-- Verify no products exist for store 52
SELECT COUNT(*) FROM products WHERE store_id = 52;

-- Verify no branches exist for store 52
SELECT COUNT(*) FROM branches WHERE store_id = 52;

-- Verify store is deleted
SELECT COUNT(*) FROM stores WHERE id = 52;
```

All queries should return 0 after successful cleanup.