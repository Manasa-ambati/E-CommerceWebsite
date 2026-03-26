# Cart NaN Price Issue Fixed 🔧

## Problem
When adding products to cart from the home page, the price was showing as `NaN` (Not a Number) in the cart page and summary calculations.

## Root Cause
In `CartContext.tsx`, when adding a product to the cart for guest users (localStorage), the code was creating items with hardcoded zero values:
```typescript
{
  productName: `Product ${productId}`,
  productImage: '',
  productPrice: 0,
  productDiscountPrice: 0,
  subtotal: 0,
  stockQuantity: 0
}
```

This caused:
- ❌ Price display showing `$0.00` or `NaN`
- ❌ Subtotal calculations returning `NaN`
- ❌ Total price calculations failing
- ❌ Empty product information

## Solution
Updated the `addToCart` function in `CartContext.tsx` to fetch product details from the backend before adding to cart.

### Changes Made

#### 1. **Import Product API**
```typescript
import { cartAPI, productAPI } from '../services/api';
```

#### 2. **Fetch Product Details Before Adding**
```typescript
// Fetch product details first
let productData = null;
try {
  const productRes = await productAPI.getById(productId);
  productData = productRes.data?.data || productRes.data;
  console.log('Product details fetched:', productData);
} catch (error) {
  console.error('Failed to fetch product details:', error);
}
```

#### 3. **Create Cart Item with Real Data**
```typescript
const price = productData?.discountPrice || productData?.price || 0;
cartData.items.push({
  id: Date.now(),
  productId,
  productName: productData?.name || `Product ${productId}`,
  productImage: productData?.images?.[0] || '',
  productPrice: productData?.price || 0,
  productDiscountPrice: productData?.discountPrice || 0,
  quantity,
  subtotal: price * quantity,
  stockQuantity: productData?.stockQuantity || 0
});
```

#### 4. **Fixed Total Price Calculation**
```typescript
// Old (broken)
cartData.totalPrice = cartData.items.reduce((sum, item) => sum + item.subtotal, 0);

// New (fixed)
cartData.totalPrice = cartData.items.reduce((sum, item) => 
  sum + (item.productDiscountPrice || item.productPrice) * item.quantity, 0);
```

#### 5. **Fixed Subtotal Update on Quantity Change**
```typescript
if (existingItemIndex > -1) {
  cartData.items[existingItemIndex].quantity += quantity;
  cartData.items[existingItemIndex].subtotal = 
    (cartData.items[existingItemIndex].productDiscountPrice || 
     cartData.items[existingItemIndex].productPrice) * 
    cartData.items[existingItemIndex].quantity;
}
```

## Files Modified

### `frontend/src/context/CartContext.tsx`
- Added `productAPI` import
- Updated `addToCart` function to:
  - Fetch product details before adding to cart
  - Use real product data (name, image, price, discount)
  - Calculate subtotals correctly
  - Handle both authenticated and guest users properly

## How It Works Now

### For Authenticated Users
1. Call backend cart API directly
2. Backend handles product lookup and pricing
3. Returns complete cart with all details

### For Guest Users (localStorage)
1. **NEW**: Fetch product details from `/products/{id}` endpoint
2. Extract price (discountPrice if available, otherwise price)
3. Create cart item with full product information
4. Calculate subtotal based on actual price
5. Update cart totals correctly

## Data Flow

```
User clicks "Add to Cart"
         ↓
CartContext.addToCart(productId, quantity)
         ↓
Is user authenticated?
    ├─ YES → Call cartAPI.add() → Backend handles everything
    └─ NO  → Fetch product details → Create localStorage item
              ↓
         productAPI.getById(productId)
              ↓
         Extract: name, price, discountPrice, images
              ↓
         Create cart item with real data
              ↓
         Calculate subtotal & totals
              ↓
         Save to localStorage
```

## Testing Checklist
- [ ] Add product from home page
- [ ] Check cart page shows correct price
- [ ] Verify subtotal calculation works
- [ ] Confirm total price is accurate
- [ ] Test with discounted products
- [ ] Test quantity update (+/- buttons)
- [ ] Test removing items from cart
- [ ] Test cart clear functionality
- [ ] Test as both authenticated and guest user

## Expected Behavior Now

### Cart Item Display
- ✅ Product name shows correctly
- ✅ Product image displays
- ✅ Price shows actual value (e.g., `$49.99`)
- ✅ Discount price shows if applicable
- ✅ Subtotal calculates correctly (price × quantity)

### Cart Summary
- ✅ Subtotal sums all items correctly
- ✅ Total matches subtotal (with free shipping)
- ✅ No `NaN` values anywhere
- ✅ Numbers format properly with 2 decimals

### User Experience
- ✅ Works for logged-in users (backend sync)
- ✅ Works for guest users (localStorage)
- ✅ Product data persists across page refreshes
- ✅ Cart count updates in navbar

## Browser Console Output
When adding a product, you should now see:
```
Product details fetched: {
  id: 123,
  name: "Cool T-Shirt",
  price: 49.99,
  discountPrice: 39.99,
  images: ["https://..."],
  stockQuantity: 50
}
```

## Notes
- Minimal performance impact (one extra API call per add-to-cart action)
- Backward compatible with existing cart data
- Handles missing product data gracefully (falls back to defaults)
- Error handling prevents app crashes if product fetch fails

## Related Files
- `frontend/src/context/CartContext.tsx` - Main fix location
- `frontend/src/pages/Home.tsx` - Uses addToCart
- `frontend/src/pages/Cart.tsx` - Displays cart with prices
- `frontend/src/services/api.ts` - Product API definition
