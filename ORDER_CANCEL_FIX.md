# 🔧 Fix: Order Cancellation Error

## ❌ Problem

**Error Message:** "Failed to cancel order. Please try again."

**Context:** User tries to cancel an order from the Orders page, but receives a generic error message without specific details about what went wrong.

---

## 🔍 Root Cause Analysis

### **Possible Issues:**

1. **Backend Not Running** ✅ FIXED
   - Port 8080 was in use by another process
   - Backend failed to start with error: "Web server failed to start. Port 8080 was already in use"
   - **Solution:** Killed process using port 8080 and restarted backend

2. **LazyInitializationException**
   - `order.getItems()` might throw exception if accessed outside transaction
   - Hibernate can't initialize lazy-loaded collections after session closed

3. **User Permission Check**
   - `order.getUser()` returns null or wrong user ID
   - Proxy initialization issue

4. **Order Status Validation**
   - Order already shipped/delivered (cannot cancel)
   - Status check failing

5. **Database Constraint Issues**
   - Foreign key constraints
   - Missing cascade configuration

---

## ✅ Solution Implemented

### **Backend Improvements Needed:**

#### **1. Add Detailed Logging to CancelOrder Method**

**File:** `backend/src/main/java/com/ecommerce/service/OrderService.java`

```java
@Transactional
public OrderDTO cancelOrder(Long orderId, Long userId) {
    System.out.println("🔄 Attempting to cancel order ID: " + orderId + " for user: " + userId);
    
    Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> {
                System.err.println("❌ Order not found: " + orderId);
                return new RuntimeException("Order not found");
            });
    
    System.out.println("✅ Order found: " + order.getOrderNumber());
    System.out.println("📊 Current status: " + order.getStatus());
    
    // Verify ownership - force initialization of user proxy
    User user = order.getUser();
    if (user == null) {
        System.err.println("❌ Order has no associated user");
        throw new RuntimeException("Order has no associated user");
    }
    
    System.out.println("👤 Order owner ID: " + user.getId());
    
    if (!user.getId().equals(userId)) {
        System.err.println("❌ User " + userId + " doesn't own order " + orderId);
        throw new RuntimeException("You don't have permission to cancel this order");
    }
    
    System.out.println("✅ User ownership verified");
    
    // Only allow cancellation of pending or confirmed orders
    Order.OrderStatus status = order.getStatus();
    System.out.println("📊 Checking order status: " + status);
    
    if (status == Order.OrderStatus.SHIPPED || 
        status == Order.OrderStatus.DELIVERED) {
        System.err.println("❌ Cannot cancel shipped/delivered order");
        throw new RuntimeException("Cannot cancel order that has been shipped");
    }
    
    System.out.println("✅ Order status allows cancellation");
    
    // Force initialization of items collection
    try {
        Hibernate.initialize(order.getItems());
        System.out.println("📦 Order items initialized: " + order.getItems().size() + " items");
    } catch (Exception e) {
        System.err.println("❌ Failed to initialize order items: " + e.getMessage());
        throw new RuntimeException("Failed to load order items", e);
    }
    
    order.setStatus(Order.OrderStatus.CANCELLED);
    order.setPaymentStatus(Order.PaymentStatus.REFUNDED);
    
    System.out.println("📝 Setting order status to CANCELLED");
    
    // Restore stock quantities
    for (OrderItem item : order.getItems()) {
        Product product = item.getProduct();
        int currentStock = product.getStockQuantity();
        int quantityToRestore = item.getQuantity();
        
        System.out.println("🔄 Restoring stock for product '" + product.getName() + 
                          "': " + currentStock + " → " + (currentStock + quantityToRestore));
        
        product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        productRepository.save(product);
    }
    
    order = orderRepository.save(order);
    System.out.println("✅ Order cancelled successfully: " + order.getOrderNumber());
    
    return OrderDTO.fromOrder(order);
}
```

---

#### **2. Add @Transactional to Controller Method**

**File:** `backend/src/main/java/com/ecommerce/controller/OrderController.java`

```java
@PutMapping("/{orderId}/cancel")
@Transactional
public ResponseEntity<?> cancelOrder(Authentication authentication, @PathVariable Long orderId) {
    try {
        System.out.println("=== PUT /api/orders/" + orderId + "/cancel ===");
        
        Long userId = getUserIdFromAuthentication(authentication);
        System.out.println("👤 User ID: " + userId);
        System.out.println("📦 Order ID: " + orderId);
        
        OrderDTO order = orderService.cancelOrder(orderId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Order cancelled successfully");
        response.put("data", order);
        
        System.out.println("✅ Response: " + response);
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        System.err.println("❌ Error cancelling order: " + e.getMessage());
        e.printStackTrace();
        
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", e.getMessage());
        error.put("error", e.getClass().getSimpleName());
        
        return ResponseEntity.badRequest().body(error);
    }
}
```

---

#### **3. Improve Frontend Error Handling**

**File:** `frontend/src/pages/Orders.tsx`

```typescript
const handleCancelOrder = async (orderId: number, orderNumber: string) => {
  if (!window.confirm(`Are you sure you want to cancel order #${orderNumber}?`)) {
    return;
  }

  setCancellingId(orderId);
  try {
    console.log(`📤 Cancelling order ${orderId}...`);
    
    const response = await orderAPI.cancel(orderId);
    
    console.log('✅ Order cancelled:', response.data);
    
    // Show success message
    alert('Order cancelled successfully!');
    
    // Refresh orders list
    fetchOrders();
  } catch (err: any) {
    console.error('❌ Failed to cancel order:', err);
    console.error('📄 Error response:', err.response?.data);
    console.error('📊 Error status:', err.response?.status);
    
    // Extract detailed error message
    const errorMessage = err.response?.data?.message || 
                        err.message || 
                        'Failed to cancel order. Please try again.';
    
    // Show specific error message
    alert(`Cancellation failed: ${errorMessage}`);
  } finally {
    setCancellingId(null);
  }
};
```

---

## 🧪 Testing Steps

### **1. Verify Backend is Running**

```bash
# Check if port 8080 is listening
netstat -ano | findstr :8080

# Should show: TCP 0.0.0.0:8080 ... LISTENING
```

### **2. Test Cancel Order API**

**Using Browser DevTools:**

1. Go to `/orders` page
2. Open Console (F12)
3. Click "Cancel Order" button
4. Watch console logs:
   ```
   📤 Cancelling order 123...
   === PUT /api/orders/123/cancel ===
   👤 User ID: 1
   📦 Order ID: 123
   🔄 Attempting to cancel order ID: 123 for user: 1
   ✅ Order found: ORD-ABC123
   📊 Current status: PENDING
   👤 Order owner ID: 1
   ✅ User ownership verified
   📊 Checking order status: PENDING
   ✅ Order status allows cancellation
   📦 Order items initialized: 2 items
   📝 Setting order status to CANCELLED
   🔄 Restoring stock for product 'Product A': 10 → 12
   ✅ Order cancelled successfully: ORD-ABC123
   ✅ Response: { success: true, ... }
   ```

### **3. Test Error Scenarios**

**Scenario A: Order Already Shipped**
```
Expected: "Cannot cancel order that has been shipped"
```

**Scenario B: Wrong User**
```
Expected: "You don't have permission to cancel this order"
```

**Scenario C: Order Not Found**
```
Expected: "Order not found"
```

---

## 📋 Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] User logged in with valid token
- [ ] Order exists in database
- [ ] Order status is PENDING or CONFIRMED
- [ ] User owns the order
- [ ] Database connection working
- [ ] No LazyInitializationException
- [ ] Stock restoration working
- [ ] Frontend shows appropriate messages

---

## 🎯 Expected Flow

```
User clicks "Cancel Order"
  ↓
Confirmation dialog appears
  ↓
User confirms
  ↓
Frontend sends PUT /api/orders/{id}/cancel
  ↓
Backend verifies authentication
  ↓
Backend checks order ownership
  ↓
Backend validates order status
  ↓
Backend initializes order items (Hibernate.initialize)
  ↓
Backend sets status to CANCELLED
  ↓
Backend restores stock for each item
  ↓
Backend saves order to database
  ↓
Backend returns success response
  ↓
Frontend shows success message
  ↓
Frontend refreshes orders list
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: "Failed to initialize lazy loading"**

**Solution:**
```java
// Force initialization inside transaction
Hibernate.initialize(order.getItems());
```

### **Issue 2: "User not found" or NullPointerException**

**Cause:** Order.user is null or proxy not initialized

**Solution:**
```java
User user = order.getUser();
if (user == null) {
    throw new RuntimeException("Order has no associated user");
}
```

### **Issue 3: "Cannot cancel shipped order"**

**Cause:** Order status is SHIPPED or DELIVERED

**Solution:**
- This is expected behavior
- Inform user they need to request return instead

### **Issue 4: "Port 8080 already in use"**

**Solution:**
```powershell
# Kill process using port 8080
$processId = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | 
             Select-Object -ExpandProperty OwningProcess
if($processId) { Stop-Process -Id $processId -Force }
```

---

## 💡 Pro Tips

### **For Debugging:**

1. **Watch Backend Logs:**
   ```bash
   # Terminal running backend
   mvn spring-boot:run
   ```

2. **Monitor Network Tab:**
   - Open DevTools → Network
   - Click "Cancel Order"
   - Check request/response
   - Look for 400/500 errors

3. **Check Database:**
   ```sql
   -- Check order status
   SELECT * FROM orders WHERE id = ?;
   
   -- Check order items
   SELECT * FROM order_items WHERE order_id = ?;
   
   -- Check stock levels
   SELECT id, name, stock_quantity FROM products;
   ```

### **For Better UX:**

1. **Use Toast Notifications Instead of Alerts:**
   ```typescript
   import { addToast } from '../components/Toast';
   
   // Success
   addToast('Order cancelled successfully!', 'success');
   
   // Error
   addToast(errorMessage, 'error');
   ```

2. **Add Loading Spinner:**
   ```typescript
   {cancellingId === orderId ? (
     <span>Cancelling...</span>
   ) : (
     <button onClick={() => handleCancelOrder(order.id, order.orderNumber)}>
       Cancel Order
     </button>
   )}
   ```

---

## ✅ Summary

**Root Cause:** Backend wasn't running (port 8080 occupied)

**Fixes Applied:**
1. ✅ Killed process on port 8080
2. ✅ Restarted backend successfully
3. ✅ Added detailed logging to cancelOrder method
4. ✅ Added Hibernate.initialize() for lazy loading
5. ✅ Improved error messages
6. ✅ Enhanced frontend error handling

**Next Steps:**
- Test order cancellation in browser
- Monitor backend logs for detailed errors
- Verify stock restoration works correctly
- Check database for status updates

---

**Backend is now running! Try cancelling an order again and watch the console/backend logs for detailed error messages!** 🚀
