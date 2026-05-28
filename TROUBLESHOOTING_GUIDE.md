# TeslaInvest - Troubleshooting & Testing Guide

## Recent Fixes Applied

### Issue 1: Dashboard "Error loading investments" and "Error loading transactions"
**Fixed**: Added better error handling to detect when backend is offline
- Dashboard now shows "Backend may be offline" message for clarity
- Better HTTP status code checking with `r.ok`
- Improved error logging to console

### Issue 2: Invest.html packages disappearing when clicking "INVEST NOW"
**Fixed**: Replaced `:has()` CSS selector with proper DOM navigation
- Changed from `.card-outer:has(#panel-${packageId})` to `.closest('.card-outer')`
- `:has()` selector not widely supported in older browsers
- Now properly finds and toggles card visibility

---

## Quick Start Checklist

### 1. Start Backend Server
```bash
cd /Users/ppp/Documents/investment\ site/backend
npm start
```
- Should see: `🚀 TeslaInvest Backend Server running on port 8000`
- If port 8000 in use, kill it: `lsof -ti:8000 | xargs kill -9`

### 2. Start Frontend Server
```bash
cd /Users/ppp/Documents/investment\ site
python3 -m http.server 3000
```
- Should see: `Serving HTTP on 0.0.0.0 port 3000`
- Access at: `http://localhost:3000/pages/index.html`

### 3. Verify Both Running
- Backend: `curl http://localhost:8000/api/public/activity-feed` (should return JSON)
- Frontend: Open `http://localhost:3000/pages/index.html` in browser

---

## Common Issues & Solutions

### Backend Connection Errors

**Symptom**: "Backend may be offline" message on dashboard
**Solutions**:
1. Check backend is running: `npm start` in `/backend` folder
2. Verify port 8000 is not in use: `lsof -i :8000`
3. If in use, kill the process: `lsof -ti:8000 | xargs kill -9`
4. Restart backend with fresh connection

**MongoDB Connection Issues**:
- Check `.env` file has correct MongoDB URI
- Verify MongoDB Atlas cluster is active
- Check network access whitelist includes your IP

### Frontend Caching Issues

**Symptom**: Changes not appearing after code edits
**Solutions**:
1. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache: DevTools → Application → Cache Storage → Delete
3. Disable browser cache in DevTools (Network tab → settings → disable cache)

### Auth Token Issues

**Symptom**: Can't login or see "not authenticated" errors
**Solutions**:
1. Clear localStorage: `localStorage.clear()` in DevTools console
2. Sign out completely and sign back in
3. Check if token is saved: `localStorage.getItem('authToken')` in console
4. If empty/expired, re-login required

### Investment Submission Issues

**Symptom**: "Error creating investment" when clicking "CONFIRM & SUBMIT"
**Checks**:
1. User must be logged in (check localStorage authToken)
2. Amount must be ≥ minimum for package ($100, $250, or $500)
3. Transaction ID must not be empty
4. Wallet type must be selected (dropdown)
5. Check browser console for detailed error message

---

## Features to Test

### 1. Live Activity Feed (index.html)
- ✅ Activity feed auto-refreshes every 30 seconds
- ✅ Shows real investor activities from database
- ✅ Falls back to mock data if backend offline
- ✅ Displays investor name, location, amount, action

### 2. Responsive Design - All Pages
**Desktop (1024px+)**:
- All content visible, proper spacing
- 4-column stat cards on dashboard
- 3-column package cards on invest page

**Tablet (768px-1023px)**:
- 2-column layouts where applicable
- Sidebar collapses on dashboard
- Plan cards stack vertically

**Mobile (480px-767px)**:
- Single column layouts
- Touch-friendly buttons and inputs
- Optimized typography and spacing

**Small Mobile (<480px)**:
- Minimal padding/margins
- Compact stat cards
- Touch targets still 44px+ for accessibility

### 3. Investment Flow
1. Homepage (index.html) → "VIEW INVESTMENT PLANS"
2. Invest page (invest.html) → "INVEST NOW" on any package
3. Panel shows investment form
4. Select wallet, enter amount, copy address
5. Send crypto, enter TxID, upload proof (optional)
6. "CONFIRM & SUBMIT" → creates investment + receipt in database
7. Admin reviews in Admin Panel
8. Once approved, balance updates on dashboard

### 4. Admin Panel
1. Go to admin.html
2. Login with admin credentials
3. View pending receipts
4. Approve/Reject investments
5. Check activity logs
6. Manage investment plans

### 5. Dashboard
- ✅ Stats auto-refresh every 5 seconds
- ✅ Balance shows approved deposit amounts
- ✅ Active investments display with dates
- ✅ Transaction history shows payment receipts
- ✅ Upload receipt modal works with file input

---

## Performance Optimization

### Current Optimizations:
1. **Activity feed caching**: 30-second refresh interval (prevents constant API calls)
2. **Stats caching**: 5-second dashboard refresh (shows real-time updates)
3. **Image optimization**: Lazy loading on testimonials and screenshots
4. **CSS in-lining**: Critical styles loaded immediately (no external CSS files)
5. **API pagination**: Receipt list limited to 100 items per request

### For Production:
1. Set longer cache TTLs for activity feed (5+ minutes)
2. Implement redis caching for stats endpoints
3. Add database indexes on userId, status, createdAt
4. Compress images and use WebP format
5. Consider CDN for static assets

---

## Browser Compatibility

### Tested & Supported:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Issues:
- ⚠️ IE11 not supported (uses CSS Grid, Flexbox, modern JavaScript)
- ⚠️ Mobile Safari: May need manual cache clear
- ⚠️ Firefox: Scrollbar styling limited

---

## Database Seeding

### Sample User for Testing:
```
Email: test@tesla.com
Password: Test123!
```

### Sample Investment Package:
```
Name: Starlink 2x
Multiplier: 2
Duration: 30 days
Min Investment: $100
```

### Sample Payment Receipt:
```
Amount: $500
Wallet Type: USDT (Ethereum)
Status: pending_review
Transaction ID: 0x1234567890abcdef
```

---

## API Endpoints Reference

### Public Endpoints
- `GET /api/public/activity-feed?limit=10` - Live activity feed (NEW)
- `GET /pages/index.html` - Homepage with activity feed

### User Endpoints (requires auth)
- `GET /api/user/stats` - Balance, invested, pending, profit
- `POST /api/investments` - Create new investment
- `GET /api/investments` - Get user's investments
- `POST /api/payments/receipt` - Submit payment receipt
- `GET /api/payments/receipts` - Get user's receipts

### Admin Endpoints (requires admin auth)
- `GET /api/admin/pending-receipts` - Pending approval list
- `POST /api/admin/approve-receipt/:id` - Approve payment
- `POST /api/admin/reject-receipt/:id` - Reject payment
- `GET /api/admin/activity-logs` - All activity logs
- `GET /api/admin/all-investments` - All investments

---

## Debugging Tips

### Browser DevTools
1. **Console**: Check for JavaScript errors (red messages)
2. **Network**: See API calls, check for 404/500 responses
3. **Application**: View localStorage auth token
4. **Performance**: Check page load time

### Backend Debugging
1. Check logs in terminal for server startup issues
2. Look for MongoDB connection errors (ENOTFOUND, ECONNREFUSED)
3. Test API endpoints with curl:
```bash
curl 'http://localhost:8000/api/public/activity-feed' | jq
```

### Activity Feed Debugging
1. Check browser console for fetch errors
2. Verify backend returns valid JSON
3. Test fallback mock data works
4. Check that DOM has `#activityFeed` element

---

## Next Steps / Future Improvements

### Planned Features
- [ ] 2FA authentication
- [ ] Email notifications for approvals
- [ ] Profit calculations displayed daily
- [ ] Withdrawal requests workflow
- [ ] Email verification on signup
- [ ] Referral program tracking

### Performance TODOs
- [ ] Add rate limiting to API endpoints
- [ ] Implement request caching headers
- [ ] Add database query optimization
- [ ] Consider message queue for async tasks

### Security TODOs
- [ ] Implement CSRF tokens
- [ ] Add rate limiting
- [ ] Validate all user inputs server-side
- [ ] Add helmet.js security headers
- [ ] Implement request signing for admin actions

---

## Support

For issues not covered here:
1. Check browser console for errors
2. Check backend server logs
3. Verify all servers are running
4. Try hard refresh and cache clear
5. Restart both frontend and backend servers
