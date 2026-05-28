# Quick Test Guide - Redirect Loop Fix

## Before Testing
1. Start the backend server:
   ```bash
   cd /Users/ppp/Documents/investment\ site/backend
   npm start
   ```
   Expected: `✅ MongoDB Atlas Connected`

2. Clear browser storage (to simulate fresh login):
   - Open DevTools (F12)
   - Application → Local Storage → Clear All

## Test 1: Register & Auto-Login (Should NOT Loop)
**Steps:**
1. Go to: `http://localhost:3000/pages/login.html`
2. Click REGISTER tab
3. Fill form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Password123!`
   - Confirm: `Password123!`
4. Click CREATE ACCOUNT

**Expected Result:** ✅
- Form submits
- Redirected to dashboard.html (NO loop)
- Dashboard loads with user info
- No redirect loop in network tab
- No errors in console

---

## Test 2: Login & Redirect (Should NOT Loop)
**Steps:**
1. Go to: `http://localhost:3000/pages/login.html`
2. Fill login form:
   - Email: `test@example.com`
   - Password: `Password123!`
3. Click SIGN IN

**Expected Result:** ✅
- Logged in successfully
- Redirected to dashboard (single redirect, NO loop)
- Dashboard displays
- User name/email visible
- No errors

---

## Test 3: Already Logged In → Refresh Login Page (Should NOT Loop)
**Steps:**
1. You should still be logged in from Test 2
2. Manually navigate to: `http://localhost:3000/pages/login.html`
3. Watch browser address bar

**Expected Result:** ✅
- login.html loads momentarily
- Automatically redirects to /pages/dashboard.html
- Only ONE redirect happens (no loop)
- Dashboard displays
- No error messages

---

## Test 4: Logout & Login Again (Should NOT Loop)
**Steps:**
1. On dashboard, click logout button
2. Should go to login page
3. Login again with same credentials

**Expected Result:** ✅
- Logout works cleanly
- Login page loads
- Login succeeds
- Redirects to dashboard (single redirect)
- Dashboard displays

---

## Test 5: Invest Now Button (When Not Logged In)
**Steps:**
1. Logout if still logged in
2. Go to: `http://localhost:3000/pages/packages.html`
3. Click INVEST NOW on any package

**Expected Result:** ✅
- Redirects to /pages/login.html?from=packages
- Only ONE redirect (no loop)
- Login page loads
- Can login and continue

---

## Test 6: Invest Now Button (When Logged In)
**Steps:**
1. Login (use Test 2)
2. Go to: `http://localhost:3000/pages/packages.html`
3. Click INVEST NOW on any package

**Expected Result:** ✅
- Investment modal opens (no redirect)
- Can select investment amount
- No navigation happens

---

## Verification Using Browser DevTools

### Check Redirect Chain (Network Tab)
1. Open DevTools (F12)
2. Go to Network tab
3. Perform a login
4. Look for navigation requests (usually first few)

**What to see:**
```
✅ GOOD - Single chain:
  → login.html (200)
  → dashboard.html (301/302 redirect)
  → dashboard.html (200)
  
❌ BAD - Redirect loop would show:
  → login.html (200)
  → dashboard.html (301)
  → login.html (301)
  → dashboard.html (301)
  → ... (repeating)
```

### Check Console for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Perform tests above

**What to see:**
```
✅ GOOD - No errors or just normal warnings
❌ BAD - Redirect loop would show multiple errors
```

### Check Storage (Application Tab)
1. Open DevTools (F12)
2. Go to Application tab
3. Local Storage → http://localhost:3000

**What to see when logged in:**
```
authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (JWT token)
currentUser: {"_id":"...", "email":"test@example.com", ...}
```

**What to see when logged out:**
```
(both should be missing)
```

---

## Success Indicators

- ✅ No infinite redirect loops
- ✅ User stays on dashboard after login
- ✅ Single redirect per action (no multiple)
- ✅ No console errors
- ✅ Network tab shows clean redirect chain
- ✅ localStorage has authToken when logged in
- ✅ Logout clears session properly
- ✅ Can re-login after logout

---

## If Problems Occur

### Symptom: Still Seeing Redirect Loop
**Check:**
1. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear localStorage: DevTools → Application → Local Storage → Clear All
3. Close and reopen browser tab
4. Restart backend server

### Symptom: Login Page Shows But Nothing Happens
**Check:**
1. Backend running? (Should see MongoDB Connected in terminal)
2. Network tab - Any failed requests?
3. Console - Any errors?
4. Try registering a new user instead

### Symptom: Dashboard Doesn't Load After Login
**Check:**
1. Network tab - Did app.js load?
2. Console - Any errors about app.js?
3. Verify authToken is in localStorage
4. Check if AuthManager functions exist (try in console: `AuthManager.getCurrentUser()`)

---

## Quick Console Commands for Testing

```javascript
// Check if logged in
localStorage.getItem('authToken')

// Check current user
JSON.parse(localStorage.getItem('currentUser'))

// Manually check auth manager
AuthManager.isLoggedIn()
AuthManager.getCurrentUser()

// Simulate logout
localStorage.removeItem('authToken')
localStorage.removeItem('currentUser')
AuthManager.logout()

// Check URL params
new URLSearchParams(window.location.search).get('redirect')
```

---

## Testing Checklist

- [ ] Test 1: Register & Auto-Login ✅
- [ ] Test 2: Login ✅
- [ ] Test 3: Already Logged In → Refresh Login Page ✅
- [ ] Test 4: Logout & Re-login ✅
- [ ] Test 5: Invest Now (Not Logged In) ✅
- [ ] Test 6: Invest Now (Logged In) ✅
- [ ] Check Network Tab ✅
- [ ] Check Console ✅
- [ ] Check Storage ✅
- [ ] All Tests Pass ✅

**Status: READY FOR TESTING** 🚀
