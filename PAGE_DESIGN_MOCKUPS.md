# 🎨 Page-by-Page UI/UX Design Mockups

Detailed visual layouts and specifications for every page in your e-commerce application.

---

## Table of Contents

1. Home Page
2. Products Page
3. Product Detail Page
4. Cart Page
5. Wishlist Page
6. Checkout Flow
7. User Profile
8. Orders & Tracking
9. Authentication Pages
10. Admin Dashboard

---

## 1. Home Page (`/`)

### Layout Structure

```
┌─────────────────────────────────────┐
│         NAVBAR (Sticky)             │
├─────────────────────────────────────┤
│                                     │
│        HERO BANNER                  │
│   "Welcome to ShopEase"             │
│   Gradient Background               │
│   [Shop Now Button]                 │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     FEATURED CATEGORIES             │
│  [Electronics] [Clothing] [Home]    │
│  [Sports] [Books] [Beauty]          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     FEATURED PRODUCTS               │
│  ← [Product] [Product] [Product] →  │
│           Carousel                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     NEW ARRIVALS                    │
│  [Grid of 8 products]               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     NEWSLETTER SIGNUP               │
│  "Get 10% off your first order"     │
│  [Email input] [Subscribe]          │
│                                     │
└─────────────────────────────────────┘
         FOOTER
```

### Hero Section Specifications

**Background**: 
```css
background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
height: 500px;
display: flex;
align-items: center;
justify-content: center;
text-align: center;
```

**Content**:
```html
<h1 style="font-size: 48px; color: white; margin-bottom: 16px;">
  Welcome to ShopEase
</h1>
<p style="font-size: 20px; color: rgba(255,255,255,0.9); margin-bottom: 32px;">
  Discover amazing products at unbeatable prices
</p>
<button class="btn-primary" style="padding: 16px 48px; font-size: 18px;">
  Shop Now
</button>
```

---

## 2. Products Page (`/products`)

### Layout Structure

```
┌──────────┬──────────────────────────┐
│ FILTERS  │      PRODUCTS GRID       │
│          │                          │
│ Search   │  [P] [P] [P] [P]        │
│          │                          │
│ Category │  [P] [P] [P] [P]        │
│ ☑ Electronics                     │
│ ☑ Clothing  │  [P] [P] [P] [P]        │
│ ☑ Home                            │
│          │                          │
│ Price    │  Pagination:            │
│ $0 - $500 │  ← 1 2 3 4 5 →          │
│ [Slider] │                          │
│          │                          │
│ Sort By  │                          │
│ ▼ Popular│                          │
│          │                          │
│ [Apply]  │                          │
└──────────┴──────────────────────────┘
```

### Filter Sidebar (Desktop)

**Width**: 280px  
**Background**: White  
**Padding**: 24px

```css
.filter-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
```

### Product Grid

**Desktop**: 4 columns  
**Tablet**: 2 columns  
**Mobile**: 1 column

```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 24px;
}
```

---

## 3. Product Detail Page (`/product/:id`)

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  ← Back to Products                        │
├─────────────────────────────────────────────┤
│                                             │
│  [Main Image]         Product Name (H1)     │
│  (Large, zoomable)    ★★★★☆ (120 reviews)  │
│                       Price: $99.99         │
│  [Thumb] [Thumb]      ⭐⭐⭐⭐⭐              │
│  [Thumb] [Thumb]      In Stock ✓           │
│                       Qty: [-] 1 [+]        │
│                       [Add to Cart] ♥       │
│                       Share: 📘 🐦 📧       │
│                                             │
├─────────────────────────────────────────────┤
│  [Description] [Reviews (45)] [Shipping]    │
│  ─────────────────────────────────────      │
│  Tab Content Here...                        │
│                                             │
├─────────────────────────────────────────────┤
│  Related Products                           │
│  [P] [P] [P] [P]                           │
└─────────────────────────────────────────────┘
```

### Image Gallery

**Main Image**: 600x600px  
**Thumbnails**: 100x100px each  
**Layout**: Flexbox, thumbnails in row or column

```css
.gallery-container {
  display: flex;
  gap: 16px;
}

.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.thumbnail {
  width: 100px;
  height: 100px;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumbnail.active {
  border-color: #f97316;
}
```

### Sticky Add to Cart Bar (Mobile)

```css
.sticky-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
  display: flex;
  gap: 16px;
  z-index: 100;
}
```

---

## 4. Cart Page (`/cart`)

### Layout Structure

```
┌──────────────────────────────────────────┐
│ Shopping Cart (3 items)                  │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────────────────────────────┐    │
│  │ [Img] Product A        $49.99   │    │
│  │       Qty: [-] 2 [+]   $99.98   │    │
│  │       [Remove]                  │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │ [Img] Product B        $29.99   │    │
│  │       Qty: [-] 1 [+]   $29.99   │    │
│  │       [Remove]                  │    │
│  └─────────────────────────────────┘    │
│                                          │
├──────────────────────┬───────────────────┤
│ Continue Shopping    │ Order Summary     │
│                      │                   │
│                      │ Subtotal: $129.97 │
│                      │ Shipping: $5.00   │
│                      │ Tax: $10.40       │
│                      │ ─────────────     │
│                      │ Total: $145.37    │
│                      │                   │
│                      │ [Checkout]        │
│                      │                   │
│                      │ 🔒 Secure         │
└──────────────────────┴───────────────────┘
```

### Cart Item Card

```css
.cart-item {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
}
```

### Order Summary Box

```css
.summary-box {
  background: white;
  padding: 24px;
  border-radius: 12px;
  position: sticky;
  top: 100px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.total-row {
  font-size: 24px;
  font-weight: 700;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e5e7eb;
}
```

---

## 5. Login/Signup Pages

### Split Layout Design

```
┌──────────────┬──────────────────────────┐
│              │                          │
│   Branding   │    Login Form            │
│   Side       │                          │
│   (50%)      │  Email: _______          │
│              │  Password: _______       │
│   Logo       │                          │
│   Tagline    │  [Login Button]          │
│   Image      │                          │
│              │  Or continue with        │
│              │  [Google] [Facebook]     │
│              │                          │
│              │  Don't have account?     │
│              │  Sign up                 │
│              │                          │
└──────────────┴──────────────────────────┘
```

### Left Side (Branding)

```css
.branding-side {
  background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.branding-logo {
  font-size: 64px;
  margin-bottom: 24px;
}

.branding-tagline {
  font-size: 24px;
  text-align: center;
}
```

### Form Styling

```css
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 48px;
}

.form-group {
  margin-bottom: 24px;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
}

.form-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}
```

---

## 6. Checkout Flow

### Multi-Step Progress

```
Step 1        Step 2        Step 3
●────────○────────○
Shipping    Payment   Review
```

### Progress Indicator

```css
.progress-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 48px 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.step.active .step-circle {
  background: #f97316;
  color: white;
}

.step.completed .step-circle {
  background: #10b981;
  color: white;
}

.step-line {
  width: 100px;
  height: 2px;
  background: #e5e7eb;
}
```

---

## 7. Profile Page

### Sidebar Navigation

```
┌──────────┬──────────────────────────┐
│ Profile  │  Personal Information    │
│ Menu     │                          │
│          │  [Avatar Upload]         │
│ • Info   │  John Doe                │
│ • Orders │  john@example.com        │
│ • Address│                          │
│ • Payment│  Email: ✓ Verified       │
│ • Settings│ Phone: +1 ___ ___ ____  │
│          │                          │
│          │  [Save Changes]          │
│          │                          │
└──────────┴──────────────────────────┘
```

### Sidebar Menu

```css
.profile-sidebar {
  width: 250px;
  background: white;
  padding: 24px;
  border-right: 1px solid #e5e7eb;
}

.menu-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item.active {
  background: #fff7ed;
  color: #f97316;
}
```

---

## 8. Orders Page

### Order Card

```
┌─────────────────────────────────────┐
│ Order #12345            ● Shipped   │
│ March 15, 2026                      │
│                                     │
│ [Product Image] Product Name x2     │
│ [Product Image] Product Name x1     │
│                                     │
│ Total: $149.99                      │
│                                     │
│ [Track Order] [Reorder]             │
└─────────────────────────────────────┘
```

### Status Badges

```css
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-shipped {
  background: #e0e7ff;
  color: #3730a3;
}

.status-delivered {
  background: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}
```

---

## 9. Admin Dashboard

### Dashboard Layout

```
┌──────────────────────────────────────────┐
│ Admin Dashboard                          │
├──────────────────────────────────────────┤
│                                          │
│ [Stats Cards Row]                        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │Sales│ │Orders│ │Users│ │Rev  │        │
│ │$12K │ │  45  │ │ 128 │ │$8K  │        │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
│                                          │
│ Recent Orders                            │
│ ┌──────────────────────────────────┐    │
│ │ Order | Customer | Status | $    │    │
│ │ 12345 | John D.  | ✓ Done | 150 │    │
│ │ 12346 | Jane S.  | ⏳ Pend |  89 │    │
│ └──────────────────────────────────┘    │
│                                          │
│ Low Stock Alerts                         │
│ • Product A (5 left)                     │
│ • Product B (3 left)                     │
│                                          │
└──────────────────────────────────────────┘
```

### Stats Cards

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #f97316;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}
```

---

## Responsive Breakpoints Summary

### Mobile First Approach

```css
/* Mobile (Default) */
.container { padding: 16px; }

/* Tablet (≥ 768px) */
@media (min-width: 768px) {
  .container { padding: 24px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .container { padding: 32px; max-width: 1280px; }
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

---

## Color Usage by Page

| Page | Primary Color | Purpose |
|------|---------------|---------|
| Home | Orange (#f97316) | CTAs, Highlights |
| Products | Blue (#3b82f6) | Filters, Links |
| Cart | Green (#10b981) | Checkout button |
| Wishlist | Pink (#ec4899) | Heart icons |
| Checkout | Orange → Green | Progress flow |
| Profile | Blue (#3b82f6) | Navigation |
| Admin | Purple (#8b5cf6) | Dashboard stats |

---

**This completes the page-by-page mockup guide!** 

Use these specifications along with the main design system document to implement consistent, beautiful UI/UX across your entire application.
