# API Reference - TeslaInvest JavaScript

Complete API documentation for all objects and methods.

---

## 📦 INVESTMENT_PACKAGES

Investment plan definitions.

```javascript
INVESTMENT_PACKAGES: [
  {
    id: string,              // 'starlink', 'cybercab', 'mars-colony'
    name: string,            // Display name
    icon: string,            // Emoji icon
    minInvestment: number,   // Minimum USD amount
    duration: number,        // Term in days
    returnPercent: number,   // Total return percentage (e.g., 105 = 105%)
    bonus: number,           // Extra bonus percent (usually 0)
    tag: string,             // 'STARTER', 'POPULAR', 'VIP'
    tagClass: string,        // CSS class for styling
    buttonClass: string,     // CSS class: 'btn-green', 'btn-red', 'btn-blue'
    description: string,     // Plan description
    popular: boolean         // Optional: true for featured plan
  }
]
```

**Access:** `window.INVESTMENT_PACKAGES` or `INVESTMENT_PACKAGES`

---

## 🗝️ CRYPTO_WALLETS

Cryptocurrency wallet addresses for payments.

```javascript
CRYPTO_WALLETS: {
  bitcoin: string,     // BTC wallet address
  ethereum: string,    // ETH wallet address
  usdt: string        // USDT wallet address
}
```

**Access:** `window.CRYPTO_WALLETS` or `CRYPTO_WALLETS`

---

## 🔐 ADMIN_CREDENTIALS

Hardcoded admin login credentials.

```javascript
ADMIN_CREDENTIALS: {
  email: 'admin@tesla.com',
  password: 'admin123'
}
```

---

## 💾 StorageManager

Handles all data persistence in localStorage.

### Methods

#### `StorageManager.init()`
Initialize storage on app startup.

```javascript
StorageManager.init();
```

#### `StorageManager.getUsers()`
Get array of all registered users.

```javascript
const users = StorageManager.getUsers();
// Returns: [{email, password, name, ...}, ...]
```

#### `StorageManager.saveUsers(users)`
Save users array to localStorage.

```javascript
StorageManager.saveUsers(usersArray);
```

#### `StorageManager.getCurrentUser()`
Get email of logged-in user.

```javascript
const email = StorageManager.getCurrentUser();
// Returns: 'user@example.com' or null
```

#### `StorageManager.setCurrentUser(email)`
Set logged-in user session.

```javascript
StorageManager.setCurrentUser('user@example.com');
// Pass null to logout: StorageManager.setCurrentUser(null)
```

#### `StorageManager.getCurrentAdmin()`
Get email of logged-in admin.

```javascript
const adminEmail = StorageManager.getCurrentAdmin();
```

#### `StorageManager.setCurrentAdmin(email)`
Set logged-in admin session.

```javascript
StorageManager.setCurrentAdmin('admin@tesla.com');
```

#### `StorageManager.getUserByEmail(email)`
Find user by email address.

```javascript
const user = StorageManager.getUserByEmail('user@example.com');
// Returns: user object or undefined
```

#### `StorageManager.createUser(email, password, name)`
Create new user account.

```javascript
const result = StorageManager.createUser('new@user.com', 'pass123', 'John Doe');
// Returns: { success: true/false, message?: string, user?: object }
```

#### `StorageManager.updateUser(email, updates)`
Update user properties.

```javascript
StorageManager.updateUser('user@example.com', {
  activeBalance: 5000,
  investments: [...]
});
// Returns: true/false
```

#### `StorageManager.addInvestment(email, investment)`
Add investment to user.

```javascript
const investment = StorageManager.addInvestment('user@example.com', {
  packageId: 'cybercab',
  packageName: 'Cybercab',
  amount: 1000,
  returnPercent: 140,
  expectedReturn: 1400,
  status: 'pending_payment'
});
// Returns: investment object with generated id and timestamps
```

#### `StorageManager.updateInvestment(email, investmentId, updates)`
Update investment properties.

```javascript
StorageManager.updateInvestment('user@example.com', '1234567890', {
  status: 'active'
});
// Returns: true/false
```

#### `StorageManager.addReceipt(email, receipt)`
Add payment receipt to user.

```javascript
const receipt = StorageManager.addReceipt('user@example.com', {
  investmentId: '1234567890',
  transactionId: '0xabc123...',
  walletType: 'usdt',
  screenshot: 'data:image/...' // base64 or reference
});
// Returns: receipt object with generated id and timestamps
```

#### `StorageManager.updateReceipt(email, receiptId, updates)`
Update receipt properties.

```javascript
StorageManager.updateReceipt('user@example.com', '9876543210', {
  status: 'approved',
  approvedAt: new Date().toISOString()
});
// Returns: true/false
```

#### `StorageManager.deleteInvestment(email, investmentId)`
Delete investment record.

```javascript
StorageManager.deleteInvestment('user@example.com', '1234567890');
// Returns: true/false
```

---

## 👤 AuthManager

User and admin authentication.

### Methods

#### `AuthManager.register(email, password, name)`
Register new user account.

```javascript
const result = AuthManager.register('new@user.com', 'securepass', 'Jane Doe');
// Returns: { success: true/false, message?: string, user?: object }
```

#### `AuthManager.login(email, password)`
Log in user.

```javascript
const result = AuthManager.login('user@example.com', 'password123');
// Returns: { success: true/false, message?: string, user?: object }
// Sets currentUser session on success
```

#### `AuthManager.logout()`
Log out current user.

```javascript
AuthManager.logout();
// Clears currentUser session
```

#### `AuthManager.adminLogin(email, password)`
Log in admin (checks hardcoded credentials).

```javascript
const result = AuthManager.adminLogin('admin@tesla.com', 'admin123');
// Returns: { success: true/false, message?: string }
// Sets currentAdmin session on success
```

#### `AuthManager.adminLogout()`
Log out current admin.

```javascript
AuthManager.adminLogout();
// Clears currentAdmin session
```

#### `AuthManager.isLoggedIn()`
Check if user is logged in.

```javascript
if (AuthManager.isLoggedIn()) {
  // User has active session
}
// Returns: true/false
```

#### `AuthManager.isAdminLoggedIn()`
Check if admin is logged in.

```javascript
if (AuthManager.isAdminLoggedIn()) {
  // Admin has active session
}
// Returns: true/false
```

#### `AuthManager.getCurrentUserEmail()`
Get email of current logged-in user.

```javascript
const email = AuthManager.getCurrentUserEmail();
// Returns: 'user@example.com' or null
```

#### `AuthManager.getCurrentUser()`
Get full user object.

```javascript
const user = AuthManager.getCurrentUser();
// Returns: {email, password, name, activeBalance, investments[], ...} or null
```

---

## 💰 InvestmentManager

Investment operations and calculations.

### Methods

#### `InvestmentManager.calculateMaturityDate(durationDays)`
Calculate future maturity date.

```javascript
const maturityDate = InvestmentManager.calculateMaturityDate(30);
// Returns: Date object 30 days from now
```

#### `InvestmentManager.calculateReturns(amount, returnPercent)`
Calculate expected return.

```javascript
const returns = InvestmentManager.calculateReturns(1000, 140);
// 1000 * 1.40 = 1400
// Returns: 1400
```

#### `InvestmentManager.createInvestment(email, packageId, amount)`
Create new investment.

```javascript
const result = InvestmentManager.createInvestment(
  'user@example.com',
  'cybercab',
  1000
);
// Returns: { success: true/false, investment?: object, message?: string }
// Investment created with status: 'pending_payment'
```

#### `InvestmentManager.getUserInvestments(email)`
Get all investments for user.

```javascript
const investments = InvestmentManager.getUserInvestments('user@example.com');
// Returns: [{...}, {...}, ...] (all statuses)
```

#### `InvestmentManager.getActiveInvestments(email)`
Get only approved investments.

```javascript
const active = InvestmentManager.getActiveInvestments('user@example.com');
// Returns: [{status: 'active'}, ...] (approved only)
```

#### `InvestmentManager.getPendingInvestments(email)`
Get pending payment investments.

```javascript
const pending = InvestmentManager.getPendingInvestments('user@example.com');
// Returns: [{status: 'pending_payment'}, ...]
```

#### `InvestmentManager.calculateTotalInvested(email)`
Get sum of active investments.

```javascript
const total = InvestmentManager.calculateTotalInvested('user@example.com');
// Returns: 5000 (sum of all active investments)
```

#### `InvestmentManager.calculateActiveBalance(email)`
Get active balance (same as total invested).

```javascript
const balance = InvestmentManager.calculateActiveBalance('user@example.com');
// Returns: 5000
```

#### `InvestmentManager.getPendingDeposits(email)`
Get receipts awaiting approval.

```javascript
const pending = InvestmentManager.getPendingDeposits('user@example.com');
// Returns: [{status: 'pending_review'}, ...]
```

---

## 💳 PaymentManager

Payment receipts and approval workflow.

### Methods

#### `PaymentManager.createReceipt(email, investmentId, screenshot, txId, walletType)`
Create payment receipt.

```javascript
const result = PaymentManager.createReceipt(
  'user@example.com',
  '1234567890',
  'base64_screenshot_data',
  '0xabc123def456',
  'usdt'
);
// Returns: { success: true/false, receipt?: object, message?: string }
// Receipt created with status: 'pending_review'
```

**Parameters:**
- `email` (string): User's email
- `investmentId` (string): Investment ID to attach receipt to
- `screenshot` (string): Base64 image data or reference
- `txId` (string): Transaction ID/hash
- `walletType` (string): 'bitcoin', 'ethereum', or 'usdt'

#### `PaymentManager.approveReceipt(userEmail, receiptId)`
Admin approves receipt (activates investment).

```javascript
const success = PaymentManager.approveReceipt(
  'user@example.com',
  '9876543210'
);
// Returns: true/false
// Updates receipt status to 'approved'
// Updates linked investment status to 'active'
// Updates user's activeBalance
```

#### `PaymentManager.rejectReceipt(userEmail, receiptId, reason)`
Admin rejects receipt (deletes investment).

```javascript
const success = PaymentManager.rejectReceipt(
  'user@example.com',
  '9876543210',
  'Invalid transaction ID'
);
// Returns: true/false
// Updates receipt status to 'rejected'
// Deletes linked investment
```

#### `PaymentManager.getAllPendingReceipts()`
Get all receipts awaiting approval (admin view).

```javascript
const pending = PaymentManager.getAllPendingReceipts();
// Returns: [
//   {
//     id, investmentId, investment{packageName, amount},
//     transactionId, walletType, status, createdAt,
//     userEmail, userName
//   }, ...
// ]
```

#### `PaymentManager.getUserReceipts(email)`
Get all receipts for user.

```javascript
const receipts = PaymentManager.getUserReceipts('user@example.com');
// Returns: [{...}, {...}, ...] (all statuses)
```

---

## 🎨 UIManager

UI utilities and formatting.

### Methods

#### `UIManager.formatCurrency(amount)`
Format number as USD currency.

```javascript
UIManager.formatCurrency(1234.56);
// Returns: '$1,234.56'
```

#### `UIManager.formatDate(dateString)`
Format date (no time).

```javascript
UIManager.formatDate('2026-05-27T14:30:00Z');
// Returns: 'May 27, 2026'
```

#### `UIManager.formatDateTime(dateString)`
Format date with time.

```javascript
UIManager.formatDateTime('2026-05-27T14:30:00Z');
// Returns: 'May 27, 2026, 2:30 PM'
```

#### `UIManager.showModal(modalId)`
Show modal by ID.

```javascript
UIManager.showModal('investmentModal');
// Shows: #investmentModal element
```

#### `UIManager.hideModal(modalId)`
Hide modal by ID.

```javascript
UIManager.hideModal('paymentModal');
// Hides: #paymentModal element
```

#### `UIManager.showNotification(message, type)`
Show alert notification.

```javascript
UIManager.showNotification('Investment created!', 'success');
UIManager.showNotification('Invalid amount', 'error');
UIManager.showNotification('Processing...', 'info');
// Types: 'success', 'error', 'info' (default)
```

#### `UIManager.getPackage(packageId)`
Get package definition by ID.

```javascript
const pkg = UIManager.getPackage('cybercab');
// Returns: {...package object...}
```

---

## 📄 PageManager

Page initialization and routing.

### Methods

#### `PageManager.getCurrentPage()`
Get current HTML filename.

```javascript
const page = PageManager.getCurrentPage();
// Returns: 'packages.html', 'login.html', etc.
```

#### `PageManager.init()`
Initialize app on page load (called automatically).

```javascript
PageManager.init();
// Detects current page and runs appropriate init
```

---

## 🌐 Global Window Functions

Helper functions exposed globally for HTML onclick handlers.

### Authentication

```javascript
// User Registration
handleRegister(email, password, name)
// User Login
handleLogin(email, password)
// Admin Login
handleAdminLogin(email, password)
// User Logout
handleLogout()
// Admin Logout
handleAdminLogout()
```

### Investments

```javascript
// Open investment modal
openInvestmentModal(packageId)
// Close investment modal
closeInvestmentModal()
// Proceed to payment
proceedToPayment()
// Submit payment and receipt
completePayment()
```

### Admin Actions

```javascript
// Approve receipt
approveReceipt(userEmail, receiptId)
// Reject receipt
rejectReceipt(userEmail, receiptId)
```

### Utilities

```javascript
// Calculate expected return
calculateReturn(amount, packageId)
// Calculate maturity date
calculateMaturityDate(packageId)
// Create demo data
createDemoData()
```

---

## 🔄 Data Structures

### User Object
```javascript
{
  email: string,                    // Unique identifier
  password: string,                 // Plain text (use bcrypt in prod!)
  name: string,                     // Display name
  activeBalance: number,            // Sum of active investments
  investments: [                    // All investments
    {
      id: string,                   // Unique ID
      packageId: string,            // Reference to INVESTMENT_PACKAGES
      packageName: string,          // Display name
      amount: number,               // USD invested
      returnPercent: number,        // Expected return %
      expectedReturn: number,       // Calculated return in USD
      startDate: string,            // ISO date string
      maturityDate: string,         // ISO date string
      status: string,               // 'pending_payment' | 'active' | 'completed'
      durationDays: number,         // Term in days
      createdAt: string             // ISO date string
    }
  ],
  receipts: [                       // Payment receipts
    {
      id: string,
      investmentId: string,         // Links to investment
      investment: {
        packageName: string,
        amount: number
      },
      screenshot: string,           // Base64 or reference
      transactionId: string,        // TxID/hash
      walletType: string,           // 'bitcoin', 'ethereum', 'usdt'
      status: string,               // 'pending_review' | 'approved' | 'rejected'
      approvedAt: string | null,    // ISO date when approved
      rejectedAt: string | null,    // ISO date when rejected
      rejectionReason: string,      // Why it was rejected
      createdAt: string             // ISO date string
    }
  ],
  createdAt: string                 // Account creation date
}
```

### Investment Object
```javascript
{
  id: string,
  packageId: string,
  packageName: string,
  amount: number,
  returnPercent: number,
  expectedReturn: number,
  startDate: string,
  maturityDate: string,
  status: string,
  durationDays: number,
  createdAt: string
}
```

### Receipt Object
```javascript
{
  id: string,
  investmentId: string,
  investment: { packageName: string, amount: number },
  screenshot: string,
  transactionId: string,
  walletType: string,
  status: string,
  approvedAt: string | null,
  rejectedAt: string | null,
  rejectionReason: string,
  createdAt: string
}
```

---

## 🔴 Error Handling

All functions return structured responses:

```javascript
// Success
{ success: true, user: {...} }

// Error
{ success: false, message: 'Detailed error message' }
```

Always check `result.success` before accessing other properties:

```javascript
const result = AuthManager.login(email, pwd);
if (result.success) {
  console.log(result.user);
} else {
  alert(result.message);
}
```

---

## 🧪 Usage Examples

### Example 1: Complete Investment Flow
```javascript
// 1. Register user
const regResult = AuthManager.register(
  'investor@example.com',
  'SecurePass123',
  'John Investor'
);

// 2. Login
const loginResult = AuthManager.login(
  'investor@example.com',
  'SecurePass123'
);

// 3. Create investment
const invResult = InvestmentManager.createInvestment(
  'investor@example.com',
  'cybercab',
  1000
);
const investmentId = invResult.investment.id;

// 4. Create receipt
const recResult = PaymentManager.createReceipt(
  'investor@example.com',
  investmentId,
  'screenshot_data',
  '0x123abc456def',
  'usdt'
);
const receiptId = recResult.receipt.id;

// 5. Admin approves
AuthManager.adminLogin('admin@tesla.com', 'admin123');
PaymentManager.approveReceipt('investor@example.com', receiptId);

// 6. Check updated user
const user = AuthManager.getCurrentUser();
console.log(user.activeBalance); // Now shows $1,000
```

### Example 2: Admin Dashboard Data
```javascript
// Get all pending receipts
const pending = PaymentManager.getAllPendingReceipts();

pending.forEach(receipt => {
  console.log(`
    User: ${receipt.userName}
    Amount: ${UIManager.formatCurrency(receipt.investment.amount)}
    TxID: ${receipt.transactionId}
    Status: ${receipt.status}
  `);
});
```

### Example 3: User Dashboard
```javascript
const email = AuthManager.getCurrentUserEmail();
const user = AuthManager.getCurrentUser();

console.log('Active Balance:', UIManager.formatCurrency(
  InvestmentManager.calculateActiveBalance(email)
));

console.log('Active Investments:', 
  InvestmentManager.getActiveInvestments(email)
);

console.log('Pending Deposits:', 
  InvestmentManager.getPendingDeposits(email)
);
```

---

**API Version:** 1.0  
**Last Updated:** May 27, 2026
