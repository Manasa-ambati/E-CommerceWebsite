# 🎨 Custom Toast Messages - Quick Start Guide

## ⚡ 3-Step Implementation

### Step 1️⃣: Import the Hook
```typescript
import { useToast } from '../context/ToastContext';
```

### Step 2️⃣: Get the Function
```typescript
const MyComponent = () => {
  const { addToast } = useToast(); // Add this line
  
  // Your component code...
};
```

### Step 3️⃣: Replace Alerts with Toasts
```typescript
// ❌ OLD WAY - Ugly browser alert
alert('Item added to cart!');

// ✅ NEW WAY - Beautiful custom toast
addToast('Item added to cart!', 'success');
```

---

## 🎯 Common Examples (Copy & Paste)

### Shopping Actions:
```typescript
addToast('Added to cart! 🛒', 'success');
addToast('Removed from cart', 'info');
addToast('Added to wishlist ❤️', 'success');
addToast('Moved to cart successfully!', 'success');
```

### Order Actions:
```typescript
addToast('Order placed successfully! 🎉', 'success');
addToast('Order cancelled', 'warning');
addToast('Payment processing...', 'info');
addToast('Payment failed. Try again.', 'error');
```

### User Actions:
```typescript
addToast('Login successful! Welcome back.', 'success');
addToast('Profile updated ✨', 'success');
addToast('Password changed successfully', 'success');
addToast('Invalid email or password', 'error');
```

### Product Actions:
```typescript
addToast('Product added to cart! 🛍️', 'success');
addToast('Out of stock!', 'warning');
addToast('Only 2 items left!', 'warning');
addToast('Filters applied', 'info');
```

---

## 🎨 Toast Types Explained

| Type | Use For | Color | Example |
|------|---------|-------|---------|
| `'success'` | Successful actions | Green | "Order completed!" |
| `'error'` | Errors/failures | Red | "Payment failed" |
| `'warning'` | Warnings/alerts | Yellow | "Low stock" |
| `'info'` | Informational | Blue | "Email sent" |

---

## 📱 Where to Add in Your Code

### Cart.tsx Example:
```typescript
import { useToast } from '../context/ToastContext';

const Cart = () => {
  const { addToast } = useToast(); // ← Add at top of component
  
  const removeFromCart = async (productId: number) => {
    try {
      await cartAPI.remove(productId);
      addToast('Item removed from cart', 'info'); // ← Show toast
    } catch (err: any) {
      addToast(err.message || 'Failed to remove', 'error');
    }
  };
  
  // Rest of component...
};
```

### Wishlist.tsx Example:
```typescript
import { useToast } from '../context/ToastContext';

const Wishlist = () => {
  const { addToast } = useToast();
  
  const addToCart = async (productId: number) => {
    try {
      await cartAPI.add(productId);
      addToast('Moved to cart! 🛒', 'success');
    } catch (err: any) {
      addToast('Failed to move to cart', 'error');
    }
  };
};
```

### Login.tsx Example:
```typescript
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { addToast } = useToast();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await authAPI.login({ email, password });
      addToast('Welcome back! Login successful 🎉', 'success');
      navigate('/');
    } catch (err: any) {
      addToast(err.message || 'Login failed', 'error');
    }
  };
};
```

---

## 🔧 Troubleshooting

### Toast not showing?
✅ Make sure `ToastProvider` wraps your app in App.tsx  
✅ Verify you're inside a React component  
✅ Check browser console for errors

### Want to change position?
Edit `Toast.css`:
```css
.global-toast-container {
  /* Move to bottom-right */
  top: auto;
  bottom: 20px;
  right: 20px;
}
```

### Want different colors?
Edit `Toast.css` and modify:
```css
.toast-success { background: #your-color; }
.toast-error { background: #your-color; }
```

---

## ✅ Complete Replacement List

Find these in your code and replace:

| Instead of | Use This |
|-----------|----------|
| `alert('Success!')` | `addToast('Success!', 'success')` |
| `alert('Error!')` | `addToast('Error!', 'error')` |
| `alert('Warning!')` | `addToast('Warning!', 'warning')` |
| `alert('Info')` | `addToast('Info', 'info')` |
| `window.alert()` | `addToast()` |

---

## 🚀 Quick Test

Try this in any component to test:

```typescript
<button onClick={() => addToast('Test message!', 'success')}>
  Test Toast
</button>
```

Click it and you should see a beautiful toast notification! 🎉

---

**That's it! Just 3 steps to beautiful custom toasts!** ✨

Need more examples? Check out **CUSTOM_TOAST_MESSAGES.md** for detailed page-by-page examples.
