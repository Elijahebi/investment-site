# Update Frontend API URLs for Vercel

## Current Code (Local Development)

All your API calls currently point to:
```javascript
http://localhost:8000/api/...
```

## After Vercel Deployment

You need to update to use relative URLs:
```javascript
/api/...
```

## Quick Search & Replace

In your frontend files, search for these and replace:

### In `app.js`
```bash
# Find all instances
grep -r "http://localhost:8000/api" pages/

# Replace
sed -i '' 's|http://localhost:8000/api|/api|g' app.js
```

### In `pages/dashboard.html`
```javascript
// BEFORE:
fetch('http://localhost:8000/api/investments', {

// AFTER:
fetch('/api/investments', {
```

### In `pages/packages.html`
```javascript
// BEFORE:
fetch('http://localhost:8000/api/investments', {

// AFTER:
fetch('/api/investments', {
```

### In `pages/invest.html`
```javascript
// BEFORE:
fetch('http://localhost:8000/api/investments', {

// AFTER:
fetch('/api/investments', {
```

### In `pages/admin.html`
```javascript
// BEFORE:
fetch('http://localhost:8000/api/admin/pending-receipts', {

// AFTER:
fetch('/api/admin/pending-receipts', {
```

## Environment-Based URLs (Advanced)

For better flexibility, use this pattern in your code:

```javascript
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:8000/api';

// Then use:
fetch(`${API_BASE}/investments`, {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## Vercel Rewrite Configuration

The `vercel.json` already includes:
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api/index.js"
  }
]
```

This means:
- `/api/investments` → routes to serverless function
- `/api/admin/...` → routes to serverless function
- etc.

## Files to Update

1. ✅ `app.js` - Check for `localhost:8000` references
2. ✅ `pages/dashboard.html` - Check `fetch()` calls
3. ✅ `pages/packages.html` - Check `fetch()` calls
4. ✅ `pages/invest.html` - Check `fetch()` calls
5. ✅ `pages/admin.html` - Check `fetch()` calls
6. ✅ `pages/login.html` - Check `fetch()` calls

## Verify Changes

After updating, search your entire project:

```bash
# Should return NO results
grep -r "localhost:8000" pages/ app.js

# Should return results (good!)
grep -r '"/api' pages/ app.js
```

## Test Locally First

Before deploying to Vercel:

1. Update API URLs in your code
2. Test locally with backend running:
   ```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2
   python3 -m http.server 3000
   ```
3. Ensure everything works
4. Then deploy to Vercel

## Common API Endpoints to Update

```javascript
// Authentication
fetch('/api/auth/register', {})
fetch('/api/auth/login', {})
fetch('/api/auth/logout', {})

// Investments
fetch('/api/investments', {})
fetch('/api/investments/create', {})

// Payments
fetch('/api/payments/receipt', {})
fetch('/api/payments/receipts', {})

// Admin
fetch('/api/admin/users', {})
fetch('/api/admin/pending-receipts', {})
fetch('/api/admin/approve-receipt', {})

// Public
fetch('/api/public/activity-feed', {})
```

---

**After making these updates, you're ready to deploy to Vercel! 🚀**
