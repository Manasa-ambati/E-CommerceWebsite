# Product Not Loading - Debugging Guide

## Issue Description
Product detail page is not loading - shows infinite loading spinner or error.

## Root Causes & Solutions

### 1. **Backend Server Not Running**
**Symptom:** Network error, CORS error, or connection refused

**Solution:**
```bash
# Navigate to backend directory
cd backend

# Run the Spring Boot application
mvn spring-boot:run
```

Wait for the message: `Started EcommerceApplication in X seconds`

The backend runs on: `http://localhost:8080`

---

### 2. **No Products in Database**
**Symptom:** "Product not found" error or empty response

**Solution:** Add test products using one of these methods:

#### Method A: Using Flyway Migration (Recommended)
Check if you have sample data in:
```
backend/src/main/resources/db/migration/V2__insert_sample_data.sql
```

If not, create or update this file with product insert statements.

#### Method B: Using Admin Dashboard
1. Start both backend and frontend servers
2. Login as admin (check if admin account exists)
3. Navigate to `/admin` route
4. Use "Add Product" feature to create products

#### Method C: Direct SQL Insert
Run this SQL in your H2 console (`http://localhost:8080/h2-console`):

```sql
-- Check if products exist
SELECT * FROM products;

-- Insert a sample product if none exist
INSERT INTO products (name, description, price, discount_price, stock_quantity, 
                     category_id, sku, images, tags, rating, review_count, 
                     featured, active, created_at, updated_at)
VALUES ('Test Product', 'A test product description', 99.99, 79.99, 100, 
        1, 'TEST-001', '["https://via.placeholder.com/500"]', '["test"]', 
        4.5, 10, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

---

### 3. **Invalid Product ID**
**Symptom:** "Invalid product ID" error in console

**Cause:** ProductDetail component receives undefined or non-numeric ID

**Solution:** Enhanced error handling has been added to ProductDetail.tsx

Check browser console for:
```javascript
console.log('Fetching product with ID:', id);
```

If ID is undefined, check:
- Route parameter is correctly set: `/product/:id`
- Link includes valid product ID: `<Link to={`/product/${product.id}`}>`

---

### 4. **CORS Issues**
**Symptom:** CORS policy error in browser console

**Solution:** Verify backend CORS configuration in `ProductController.java`:

```java
@CrossOrigin(
    origins = {
        "http://localhost:3000",
        "https://e-commercewebsite-production-40de.up.railway.app",
        "https://web-production-bef07.up.railway.app"
    },
    allowCredentials = "true"
)
```

Make sure frontend URL matches exactly (including port).

---

### 5. **API Response Structure Mismatch**
**Symptom:** "No product data received" error

**Expected Response Format:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "price": 99.99,
    ...
  }
}
```

**Enhanced Error Handling Added:**
```typescript
let productData = response.data?.data || response.data;

if (!productData) {
  throw new Error('No product data received');
}
```

---

## Testing Steps

### Step 1: Verify Backend is Running
Open browser and navigate to:
- `http://localhost:8080/api/products` - Should return all products
- `http://localhost:8080/api/products/1` - Should return product with ID 1

If these don't work, backend is not running.

### Step 2: Check Browser Console
Open DevTools (F12) → Console tab

Look for these logs from ProductDetail:
```
Fetching product with ID: <number>
Product API response: <response object>
Response data: <data object>
Extracted product data: <product data>
```

### Step 3: Use the API Test Tool
Open `product-api-test.html` in your browser (in the project root).

This will automatically test:
- CORS connectivity
- Get All Products endpoint
- Get Product By ID endpoint

### Step 4: Check Network Tab
In DevTools → Network tab:
1. Filter by "products"
2. Click on a product link
3. Check the request to `/api/products/{id}`
4. Verify:
   - Status code (should be 200 OK)
   - Request URL is correct
   - Response contains product data

---

## Quick Fix Checklist

- [ ] Backend server running on `http://localhost:8080`
- [ ] Frontend server running on `http://localhost:3000`
- [ ] Products exist in database
- [ ] Browser console shows no CORS errors
- [ ] Network requests show 200 status codes
- [ ] Product ID in URL is a valid number
- [ ] `.env` file has correct `REACT_APP_API_URL=http://localhost:8080`

---

## Environment Configuration

### Frontend .env file:
```
REACT_APP_API_URL=http://localhost:8080
```

### Backend application.properties:
```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:testdb
spring.h2.console.enabled=true
```

---

## Common Error Messages & Solutions

### Error: "Failed to fetch product: TypeError: Failed to fetch"
**Cause:** Backend not running or wrong API URL
**Fix:** Start backend server and verify `.env` configuration

### Error: "Product not found"
**Cause:** Product ID doesn't exist in database
**Fix:** Add products to database or use a valid product ID

### Error: "Network Error"
**Cause:** Backend unreachable
**Fix:** 
1. Check backend is running
2. Verify firewall isn't blocking port 8080
3. Check CORS configuration

### Error: "No product data received"
**Cause:** Empty or malformed API response
**Fix:** Check backend logs for errors, verify database connection

---

## Database Access

### H2 Database Console
URL: `http://localhost:8080/h2-console`
JDBC URL: `jdbc:h2:mem:testdb`
Username: `sa`
Password: (leave blank or check `application.properties`)

### Useful Queries:
```sql
-- Count products
SELECT COUNT(*) FROM products;

-- View all products
SELECT id, name, price, active FROM products;

-- Check if product with specific ID exists
SELECT * FROM products WHERE id = 1;
```

---

## Next Steps

After fixing the issue:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Try accessing a product detail page again
4. If still not working, check the enhanced console logs for detailed error information

---

## Contact/Support

If issues persist:
1. Check all console logs in browser DevTools
2. Review backend logs in terminal
3. Verify both servers are running without errors
4. Test API endpoints directly using Postman or the provided test HTML file
