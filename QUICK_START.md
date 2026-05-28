# Quick Start Guide - TeslaInvest Investment Platform

## 🚀 Getting Started (1 minute)

### Step 1: Verify Files
Ensure you have:
- `/pages/index.html`
- `/pages/packages.html`
- `/pages/login.html`
- `/pages/dashboard.html`
- `/pages/admin.html`
- `/app.js` (in root, not in /pages)

### Step 2: Open in Browser
Simply open `pages/index.html` in your browser. No server or build tools needed!

### Step 3: Test Drive

**As Regular User:**
```
1. Go to pages/login.html
2. Click "TRY DEMO ACCOUNT" button
3. Credentials auto-filled: user@demo.com / demo123
4. Click "SIGN IN"
5. Redirected to dashboard
6. Click "NEW INVESTMENT" button
7. Choose any package and enter amount
8. Click "PROCEED TO PAYMENT"
9. Enter any transaction ID (e.g., "0xdemo123")
10. Click "CONFIRM & SUBMIT"
11. Dashboard shows "Pending Admin Review"
```

**As Admin:**
```
1. Go to pages/admin.html
2. Login: admin@tesla.com / admin123
3. See "RECEIPT APPROVALS" tab
4. Find pending receipt from user
5. Click "APPROVE" button
6. Toast shows "Receipt approved!"
7. Go back to pages/dashboard.html (login as user first)
8. Investment now shows as "ACTIVE" in the table
9. Balance updates automatically
```

---

## 📊 Complete Feature Breakdown

### Investment Packages (3 Plans)

| Plan | Minimum | Duration | Return | Status |
|------|---------|----------|--------|--------|
| 🛰️ Starlink | $100 | 30 days | 105% | ✅ |
| 🚖 Cybercab | $500 | 90 days | 140% | ✅ |
| 🚀 Mars Colony | $2,500 | 180 days | 200% | ✅ |

### User Workflow

```
┌─────────────────────────────────────────────────────┐
│ 1. REGISTER / LOGIN                                 │
│    ├─ New user: Create account on login.html        │
│    └─ Existing: Login with email/password           │
├─────────────────────────────────────────────────────┤
│ 2. BROWSE PACKAGES                                  │
│    ├─ packages.html shows 3 flip cards              │
│    ├─ Hover to see ROI calculator                   │
│    └─ Shows: min, term, profit, features            │
├─────────────────────────────────────────────────────┤
│ 3. SELECT PACKAGE & AMOUNT                          │
│    ├─ Click "INVEST NOW"                            │
│    ├─ Enter USD amount (validates minimum)          │
│    ├─ System calculates: return + maturity date     │
│    └─ Shows: "You will receive $X on [DATE]"        │
├─────────────────────────────────────────────────────┤
│ 4. PAYMENT DETAILS                                  │
│    ├─ Shows wallet address (USDT/BTC/ETH)          │
│    ├─ Copy button for address                       │
│    └─ Suggested amount to send                      │
├─────────────────────────────────────────────────────┤
│ 5. SEND CRYPTO & SUBMIT RECEIPT                     │
│    ├─ User sends funds externally                   │
│    ├─ Enters transaction ID/hash                    │
│    ├─ Investment created with status: pending_pay   │
│    └─ Receipt created with status: pending_review   │
├─────────────────────────────────────────────────────┤
│ 6. ADMIN REVIEW                                     │
│    ├─ Admin sees pending receipt in panel           │
│    ├─ Can view: user, amount, TxID, time            │
│    ├─ APPROVE → investment → active + balance ↑    │
│    └─ REJECT → deletes investment                   │
├─────────────────────────────────────────────────────┤
│ 7. USER SEES ACTIVE INVESTMENT                      │
│    ├─ Dashboard shows active investments table      │
│    ├─ Fields: Package, Amount, Start, Maturity      │
│    ├─ Status badge: "ACTIVE"                        │
│    └─ Balance updated with investment amount        │
└─────────────────────────────────────────────────────┘
```

---

## 💾 Data Storage

All data stored in **localStorage** (browser's built-in storage):

### Keys Created:
- `users` - Array of all user accounts
- `currentUser` - Email of logged-in user (for session)
- `currentAdmin` - Email of logged-in admin

### User Object:
```javascript
{
  email: "user@example.com",
  password: "hashedPassword",      // In production, use bcrypt!
  name: "User Name",
  activeBalance: 5000,              // Sum of active investments
  investments: [                     // All investments
    {
      id: "1234567890",
      packageId: "cybercab",
      packageName: "Cybercab",
      amount: 1000,
      returnPercent: 140,
      expectedReturn: 1400,
      startDate: "2026-05-27T...",
      maturityDate: "2026-08-25T...",
      status: "active",              // pending_payment | active | completed
      durationDays: 90
    }
  ],
  receipts: [                        // Payment receipts
    {
      id: "9876543210",
      investmentId: "1234567890",
      transactionId: "0xabc123...",
      walletType: "usdt",
      status: "approved",            // pending_review | approved | rejected
      createdAt: "2026-05-27T...",
      approvedAt: "2026-05-27T..."
    }
  ],
  createdAt: "2026-05-20T..."
}
```

---

## 🔐 Authentication

### User Registration
```javascript
handleRegister(email, password, name)
```
- Email must be unique
- Password stored as-is (use bcrypt in production!)
- Account created instantly
- Auto-logs in user

### User Login
```javascript
handleLogin(email, password)
```
- Checks email exists
- Verifies password match
- Sets `currentUser` session
- Redirects to dashboard

### Admin Login
```javascript
handleAdminLogin(email, password)
```
- Hardcoded credentials: `admin@tesla.com` / `admin123`
- Sets `currentAdmin` session
- Unlocks admin interface

### Demo Credentials
```
Email: user@demo.com
Password: demo123
Role: Regular User
```

---

## 📱 Dashboard Functionality

### Stat Cards (4 Cards)
1. **Active Balance** - Sum of approved investments
2. **Total Invested** - All active investment amounts
3. **Pending Approval** - Awaiting admin review
4. **Total Profit** - Earnings (placeholder: $0)

### Quick Actions (4 Buttons)
- Deposit Funds (shows modal)
- Withdraw (shows modal)
- Upload Receipt (shows modal)
- New Investment (links to packages page)

### Investment Table
Shows all ACTIVE investments:
- Package name
- Amount invested
- Start date
- Maturity date
- Projected return (colorized green)
- Status badge

### Transaction History
Shows all receipts (pending/approved/rejected):
- Date submitted
- Deposit type
- Amount
- Transaction ID (truncated)
- Status badge with color

### Deposit Status Tracker
Shows visual progress:
1. ✅ UPLOADED (completed)
2. ⏳ UNDER REVIEW (current)
3. ⏳ APPROVAL (pending)

---

## 🛡️ Admin Panel

### Login Gate
- Hardcoded credentials required
- Hides content until authenticated
- Clear admin badge when logged in

### Overview Tab
- 4 stat cards:
  - Active users
  - Pending receipts
  - Total invested
  - Pending withdrawals
- Recent receipts table
- Quick approve/reject buttons

### Receipt Approvals Tab
- Full list of pending receipts
- Columns: Date, User, Package, Amount, TxID, Actions
- Approve button → activates investment
- Reject button → deletes record
- Toast notifications confirm actions

### All Users Tab
- List of all registered users
- Columns: Name, Email, Total Invested, Active Count, Joined Date
- Read-only view

### Plans Manager Tab
- Shows 3 investment packages
- Display: Name, Min, Return %, Duration
- Add new plan section (hardcoded in future)
- Edit/disable options (future)

---

## 🔄 Transaction Status Flows

### Investment Lifecycle
```
pending_payment ──[admin approve]──→ active ──[time]──→ completed
                 ──[admin reject]──→ DELETED
```

### Receipt Lifecycle
```
pending_review ──[admin approve]──→ approved
               ──[admin reject]──→ rejected
```

---

## 💻 JavaScript Architecture

### Core Objects (All Global via `window`)

#### 1. StorageManager
```javascript
StorageManager.init()                          // Initialize storage
StorageManager.getUsers()                      // Get all users
StorageManager.getUserByEmail(email)           // Find user
StorageManager.createUser(email, pwd, name)    // New user
StorageManager.updateUser(email, updates)      // Update user
StorageManager.addInvestment(email, inv)       // Create investment
StorageManager.updateInvestment(email, id, up) // Update investment
StorageManager.addReceipt(email, receipt)      // Create receipt
StorageManager.updateReceipt(email, id, up)    // Update receipt
```

#### 2. AuthManager
```javascript
AuthManager.register(email, password, name)    // New account
AuthManager.login(email, password)             // User login
AuthManager.logout()                           // User logout
AuthManager.adminLogin(email, password)        // Admin login
AuthManager.adminLogout()                      // Admin logout
AuthManager.isLoggedIn()                       // Check session
AuthManager.isAdminLoggedIn()                  // Check admin
AuthManager.getCurrentUser()                   // Get user object
```

#### 3. InvestmentManager
```javascript
InvestmentManager.createInvestment(email, pkgId, amount)
InvestmentManager.getActiveInvestments(email)
InvestmentManager.getUserInvestments(email)
InvestmentManager.calculateTotalInvested(email)
InvestmentManager.calculateActiveBalance(email)
InvestmentManager.calculateMaturityDate(durationDays)
InvestmentManager.calculateReturns(amount, returnPercent)
```

#### 4. PaymentManager
```javascript
PaymentManager.createReceipt(email, invId, screenshot, txId, wallet)
PaymentManager.approveReceipt(userEmail, receiptId)
PaymentManager.rejectReceipt(userEmail, receiptId, reason)
PaymentManager.getAllPendingReceipts()
PaymentManager.getUserReceipts(email)
```

#### 5. UIManager
```javascript
UIManager.formatCurrency(amount)               // $1,234.56
UIManager.formatDate(dateString)               // May 27, 2026
UIManager.formatDateTime(dateString)           // May 27, 2026, 3:45 PM
UIManager.showModal(modalId)                   // Show modal
UIManager.hideModal(modalId)                   // Hide modal
UIManager.getPackage(packageId)                // Get package data
UIManager.showNotification(msg, type)          // Alert/notification
```

---

## 🎨 Modal Windows

### Investment Modal
- Triggered by: "INVEST NOW" button on packages
- Collects: Amount in USD
- Validates: Minimum investment required
- Shows: Calculated return & maturity date
- Button: "PROCEED TO PAYMENT"

### Payment Modal
- Triggered after investment confirmation
- Collects: Wallet type, Transaction ID
- Shows: Crypto wallet address (copyable)
- Shows: Suggested amount to send
- Button: "CONFIRM & SUBMIT"

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Investment Flow
```
1. User registers: test@test.com / test123 / Test User
2. Go to packages → Click "INVEST NOW" on Cybercab
3. Enter $1000 → Shows "You will receive $1,400 on [date]"
4. Click "PROCEED TO PAYMENT"
5. Copy wallet address → Shows "0x9876543..."
6. Enter TxID: "0x123abc456def"
7. Click "CONFIRM & SUBMIT"
8. Dashboard shows investment with "PENDING" badge
9. Admin approves → Investment shows "ACTIVE"
10. Balance increases to $1,000
```

### Scenario 2: Admin Rejection
```
1. User submits investment receipt
2. Admin logs in → Goes to Receipt Approvals
3. Clicks "REJECT" on the receipt
4. Toast shows "Receipt rejected"
5. User's investment is deleted
6. Dashboard no longer shows it
```

### Scenario 3: Multiple Investments
```
1. User creates investment 1: $100 in Starlink
2. Admin approves → Active balance = $100
3. User creates investment 2: $500 in Cybercab
4. Admin approves → Active balance = $600
5. Dashboard shows: Total Invested = $600
6. Table shows 2 rows (both ACTIVE)
```

---

## ⚙️ Configuration

### Change Admin Credentials
Edit `app.js` line ~50:
```javascript
const ADMIN_CREDENTIALS = {
  email: 'your-admin@email.com',
  password: 'your-secure-password'
};
```

### Change Wallet Addresses
Edit `app.js` line ~40:
```javascript
const CRYPTO_WALLETS = {
  bitcoin: 'your_bitcoin_address',
  ethereum: 'your_ethereum_address',
  usdt: 'your_usdt_address'
};
```

### Modify Packages
Edit `app.js` INVESTMENT_PACKAGES array to add/remove plans

---

## 🐛 Troubleshooting

### Problem: App not loading
**Solution:** Check browser console (F12) for errors. Ensure `app.js` is in root folder, not `/pages/`.

### Problem: Can't login
**Solution:** Check localStorage is enabled. Try incognito mode. Clear cache.

### Problem: Modals not showing
**Solution:** Check if JavaScript is enabled. Verify modal IDs match in HTML.

### Problem: Data not persisting
**Solution:** localStorage requires HTTPS in some browsers. Use localhost or enable in private mode.

### Problem: Dashboard empty
**Solution:** Must login first. Use demo account if unsure.

---

## 📈 Future Enhancements

- [ ] Real Stripe/Coinbase payment integration
- [ ] Email notifications on approval/rejection
- [ ] Compound investment reinvestment
- [ ] Referral bonus system
- [ ] Withdrawal requests
- [ ] Investment history with profit tracking
- [ ] User KYC verification
- [ ] 2FA authentication
- [ ] Real crypto wallet validation
- [ ] Database backend (PostgreSQL)
- [ ] REST API
- [ ] Mobile app
- [ ] WebSocket for real-time updates

---

## 📞 Support

### Quick Help
- **Q: Can I test without real money?**
  - A: Yes! Use any TxID (e.g., "0xdemo123"). Data is all mock.

- **Q: Where is my data stored?**
  - A: Browser's localStorage. Clears if cache is cleared.

- **Q: Can I export my data?**
  - A: Open DevTools → Application → localStorage → Copy values

- **Q: Is this secure?**
  - A: No! This is a demo. Production needs encryption, HTTPS, backend.

---

**Happy investing! 🚀**

*TeslaInvest Platform v1.0 - May 2026*
