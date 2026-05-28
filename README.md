# TeslaInvest Platform - Complete Implementation

## Overview
A full-featured cryptocurrency investment platform with package system, user authentication, payment processing, and admin panel. All data stored in localStorage for demo purposes.

## Features Implemented

### 1. Package System
Three investment packages with tiered returns:
- **Starlink**: $100 min, 30 days, 105% return
- **Cybercab**: $500 min, 90 days, 140% return (+5% bonus)
- **Mars Colony**: $2,500 min, 180 days, 200% return

### 2. User Authentication
- Registration/Login system
- LocalStorage-based sessions
- Demo account: `user@demo.com` / `demo123`
- Admin account: `admin@tesla.com` / `admin123`

### 3. Investment Workflow
1. User selects package and enters amount
2. System validates minimum investment
3. Calculates returns and maturity date
4. Creates "pending_payment" investment record
5. Shows payment modal with crypto wallet details

### 4. Payment & Receipt System
- Crypto payment details (Bitcoin, Ethereum, USDT)
- Transaction ID submission
- Receipt stored with "pending_review" status
- Dashboard shows pending approval status

### 5. Admin Panel
- Login-gated admin interface
- View pending payment receipts
- Approve receipts → activates investment
- Reject receipts → deletes investment
- User management & statistics
- Investment plans manager

### 6. Dashboard
- Active balance display
- Total invested (approved only)
- Pending deposits count
- Active investments table
- Transaction history
- Status tracker for deposits

## Data Structure

### LocalStorage Schema

```javascript
// users: Array of user objects
{
  email: string,
  password: string, // hashed in production
  name: string,
  activeBalance: number,
  investments: [], // All user investments
  receipts: [],    // All user receipts
  createdAt: ISO string
}

// currentUser: Email of logged-in user

// currentAdmin: Email of logged-in admin
```

## JavaScript Architecture

### Core Modules

#### StorageManager
Handles all localStorage operations
- `getUsers()` / `saveUsers()`
- `createUser()` / `updateUser()`
- `addInvestment()` / `updateInvestment()`
- `addReceipt()` / `updateReceipt()`

#### AuthManager
Authentication logic
- `register()` / `login()` / `logout()`
- `adminLogin()` / `adminLogout()`
- `isLoggedIn()` / `isAdminLoggedIn()`

#### InvestmentManager
Investment operations
- `createInvestment()` - Creates pending investment
- `getActiveInvestments()` - Gets approved only
- `calculateTotalInvested()` - Sum of active
- `calculateMaturityDate()` - Adds duration to today
- `calculateReturns()` - Uses return percent

#### PaymentManager
Receipt & approval workflow
- `createReceipt()` - Stores screenshot + TxID
- `approveReceipt()` - Activates investment
- `rejectReceipt()` - Deletes investment
- `getAllPendingReceipts()` - For admin view

#### UIManager
UI utilities
- `formatCurrency()` - Format to USD
- `formatDate()` / `formatDateTime()`
- `showModal()` / `hideModal()`
- `getPackage()` - Lookup by ID

## Implementation Guide

### Installation
1. Place all files in `/pages/` folder
2. Ensure `app.js` is in root directory
3. All HTML files reference `../app.js`
4. No npm dependencies required - vanilla JS only

### Pages

**index.html** - Landing page
- Hero section
- Features & stats
- "How it works" section
- Links to packages/dashboard/admin

**packages.html** - Investment packages
- 3 interactive flip cards
- ROI calculator on reverse
- Investment & Payment modals
- Crypto acceptance info

**login.html** - Authentication
- Login tab (email/password)
- Register tab (name/email/password)
- Demo account quick-fill
- Auto-redirect if logged in

**dashboard.html** - User dashboard
- 4 stat cards (balance, invested, pending, profit)
- Quick action buttons
- Status tracker for deposits
- Active investments table
- Transaction history

**admin.html** - Admin panel
- Login gate (hardcoded credentials)
- Overview with pending receipts
- Receipt approval workflow
- User management view
- Plans manager
- Withdrawal requests (placeholder)

## Usage

### For Users

1. **Register/Login**
   - Go to login.html
   - Create account or use demo: `user@demo.com` / `demo123`

2. **Browse Packages**
   - Navigate to packages.html
   - Hover cards to see ROI calculator
   - Click "INVEST NOW"

3. **Make Investment**
   - Enter amount (must meet minimum)
   - System shows expected return & maturity date
   - Click "PROCEED TO PAYMENT"

4. **Submit Receipt**
   - Copy wallet address
   - Send crypto (USDT/BTC/ETH)
   - Enter Transaction ID
   - Click "CONFIRM & SUBMIT"

5. **Wait for Approval**
   - Dashboard shows "Pending Admin Review"
   - Once approved, investment becomes "ACTIVE"
   - Balance updates automatically

### For Admins

1. **Login**
   - Go to admin.html
   - Use: `admin@tesla.com` / `admin123`

2. **Review Receipts**
   - Click "RECEIPT APPROVALS" tab
   - See list of pending submissions
   - View user, TxID, amount

3. **Approve/Reject**
   - Click APPROVE → activates investment
   - Click REJECT → deletes record
   - Toast notification confirms action
   - Dashboard updates instantly

## Key Functions

### Global Window Functions
```javascript
// Auth
handleRegister(email, password, name)
handleLogin(email, password)
handleAdminLogin(email, password)
handleLogout()
handleAdminLogout()

// Investments
openInvestmentModal(packageId)
proceedToPayment()
completePayment()

// Admin
approveReceipt(userEmail, receiptId)
rejectReceipt(userEmail, receiptId)

// Utilities
calculateReturn(amount, packageId)
calculateMaturityDate(packageId)
```

## Technical Details

### Investment Status Flow
1. `pending_payment` - Initial state when created
2. `active` - After admin approves receipt
3. `completed` - After maturity date (automatic)

### Receipt Status Flow
1. `pending_review` - Initial state when submitted
2. `approved` - After admin clicks APPROVE
3. `rejected` - After admin clicks REJECT

### Calculations
```javascript
// Return calculation
expectedReturn = amount * (returnPercent / 100)

// Maturity date
maturityDate = today + durationDays

// Active balance
activeBalance = sum of all active investments
```

## Security Notes

⚠️ **This is a DEMO implementation. For production:**
- Use bcrypt for password hashing
- Move admin credentials to backend
- Implement JWT authentication
- Use actual payment gateway (Stripe, Coinbase, etc.)
- Store data in database (PostgreSQL/MongoDB)
- Add input validation & sanitization
- Implement rate limiting
- Add CSRF protection
- Use HTTPS only

## File Structure
```
/pages/
  ├── index.html
  ├── packages.html
  ├── login.html
  ├── dashboard.html
  ├── admin.html
  └── ../app.js (one level up)
```

## Customization

### Change Admin Credentials
Edit in `app.js`:
```javascript
const ADMIN_CREDENTIALS = {
  email: 'your@email.com',
  password: 'newpassword'
};
```

### Modify Packages
Edit `INVESTMENT_PACKAGES` array in `app.js`:
```javascript
{
  id: 'custom',
  name: 'Custom Plan',
  minInvestment: 1000,
  duration: 60,
  returnPercent: 150,
  // ... other properties
}
```

### Change Wallet Addresses
Edit `CRYPTO_WALLETS` in `app.js`:
```javascript
const CRYPTO_WALLETS = {
  bitcoin: 'your_btc_address',
  ethereum: 'your_eth_address',
  usdt: 'your_usdt_address'
};
```

## Testing Checklist

- [ ] User registration works
- [ ] Login persists session
- [ ] Package cards display correctly
- [ ] Investment modal validates minimum
- [ ] Payment modal shows crypto details
- [ ] Receipt submission saves data
- [ ] Dashboard shows pending status
- [ ] Admin login gate works
- [ ] Admin can approve receipts
- [ ] Investment activates after approval
- [ ] Dashboard updates after approval
- [ ] Logout clears session
- [ ] Direct dashboard access redirects if not logged in

## Support

For issues or questions:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check that app.js is loaded (check Network tab)
4. Clear browser cache and try again
5. Test in incognito/private mode

## Demo Flow

Quick 2-minute walkthrough:
1. Go to login.html
2. Fill demo: `user@demo.com` / `demo123`
3. Click "TRY DEMO ACCOUNT"
4. Redirects to dashboard
5. Go to packages.html
6. Click "INVEST NOW" on any package
7. Enter amount, proceed
8. Fill transaction ID: `0xdemo123...`
9. Go to admin.html
10. Login: `admin@tesla.com` / `admin123`
11. Click APPROVE on pending receipt
12. Go back to dashboard - investment is now ACTIVE

---

**Created**: May 27, 2026  
**Version**: 1.0  
**Framework**: Vanilla JavaScript + LocalStorage
