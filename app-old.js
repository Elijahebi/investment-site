/**
 * TeslaInvest Platform - Complete JavaScript Application
 * Investment packages, user authentication, payment processing, admin panel
 */

// ============================================================================
// 1. INVESTMENT PACKAGES DEFINITION
// ============================================================================

const INVESTMENT_PACKAGES = [
  {
    id: 'starlink',
    name: 'Starlink',
    icon: '🛰️',
    minInvestment: 100,
    duration: 30, // days
    returnPercent: 105,
    bonus: 0,
    tag: 'STARTER',
    tagClass: 'tag-starter',
    buttonClass: 'btn-green',
    description: 'Satellite Internet Infrastructure'
  },
  {
    id: 'cybercab',
    name: 'Cybercab',
    icon: '🚖',
    minInvestment: 500,
    duration: 90,
    returnPercent: 140,
    bonus: 5,
    tag: 'POPULAR',
    tagClass: 'tag-popular',
    buttonClass: 'btn-red',
    description: 'Autonomous Vehicle Technology',
    popular: true
  },
  {
    id: 'mars-colony',
    name: 'Mars Colony',
    icon: '🚀',
    minInvestment: 2500,
    duration: 180,
    returnPercent: 200,
    bonus: 0,
    tag: 'VIP',
    tagClass: 'tag-vip',
    buttonClass: 'btn-blue',
    description: 'Interplanetary Colonization'
  }
];

// Wallet addresses for payment
const CRYPTO_WALLETS = {
  bitcoin: 'bc1q67lt894r3pcrkad9pylhq7skqxtgkx5lnusm5n',
  ethereum: '0x9647750C8690054e5e5b445B3c0D91CdD2B84C06',
  usdt_eth: '0x9647750C8690054e5e5b445B3c0D91CdD2B84C06',
  usdt_tron: 'THKPySqKVP38eyupZ9WQGRKHcjMbaLwpMQ'
};

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@tesla.com',
  password: 'admin123'
};

// ============================================================================
// 2. STORAGE & API MANAGEMENT
// ============================================================================

const StorageManager = {
  // API Base URL - Change this to your backend server
  apiUrl: 'http://localhost:8000/api',
  
  // Initialize default data
  init() {
    if (!this.getUsers()) {
      this.saveUsers([]);
    }
    if (!this.getCurrentUser()) {
      this.setCurrentUser(null);
    }
  },

  // Users management
  getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
  },
  
  saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  },

  // Current user session
  getCurrentUser() {
    return localStorage.getItem('currentUser');
  },

  setCurrentUser(email) {
    if (email) {
      localStorage.setItem('currentUser', email);
    } else {
      localStorage.removeItem('currentUser');
    }
  },

  // Admin session
  getCurrentAdmin() {
    return localStorage.getItem('currentAdmin');
  },

  setCurrentAdmin(email) {
    if (email) {
      localStorage.setItem('currentAdmin', email);
    } else {
      localStorage.removeItem('currentAdmin');
    }
  },

  // User operations
  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email === email);
  },

  createUser(email, password, name) {
    const users = this.getUsers();
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'User already exists' };
    }

    const newUser = {
      email,
      password, // In production, use bcrypt
      name,
      activeBalance: 0,
      investments: [],
      receipts: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, user: newUser };
  },

  updateUser(email, updates) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) return false;
    
    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveUsers(users);
    return true;
  },

  // Investment operations
  addInvestment(email, investment) {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    investment.id = Date.now().toString();
    investment.createdAt = new Date().toISOString();
    investment.status = 'pending_payment'; // pending_payment -> active -> completed

    user.investments.push(investment);
    this.updateUser(email, { investments: user.investments });
    return investment;
  },

  updateInvestment(email, investmentId, updates) {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    const investment = user.investments.find(i => i.id === investmentId);
    if (!investment) return false;

    Object.assign(investment, updates);
    this.updateUser(email, { investments: user.investments });
    return true;
  },

  // Receipt operations
  addReceipt(email, receipt) {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    receipt.id = Date.now().toString();
    receipt.createdAt = new Date().toISOString();
    receipt.status = 'pending_review'; // pending_review -> approved -> rejected

    user.receipts.push(receipt);
    this.updateUser(email, { receipts: user.receipts });
    return receipt;
  },

  updateReceipt(email, receiptId, updates) {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    const receipt = user.receipts.find(r => r.id === receiptId);
    if (!receipt) return false;

    Object.assign(receipt, updates);
    this.updateUser(email, { receipts: user.receipts });
    return true;
  },

  deleteInvestment(email, investmentId) {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    user.investments = user.investments.filter(i => i.id !== investmentId);
    this.updateUser(email, { investments: user.investments });
    return true;
  }
};

// ============================================================================
// 3. AUTHENTICATION SYSTEM
// ============================================================================

const AuthManager = {
  register(email, password, name) {
    return StorageManager.createUser(email, password, name);
  },

  login(email, password) {
    const user = StorageManager.getUserByEmail(email);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password' };
    }

    StorageManager.setCurrentUser(email);
    return { success: true, user };
  },

  adminLogin(email, password) {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      StorageManager.setCurrentAdmin(email);
      return { success: true };
    }
    return { success: false, message: 'Invalid admin credentials' };
  },

  logout() {
    StorageManager.setCurrentUser(null);
  },

  adminLogout() {
    StorageManager.setCurrentAdmin(null);
  },

  isLoggedIn() {
    return !!StorageManager.getCurrentUser();
  },

  isAdminLoggedIn() {
    return !!StorageManager.getCurrentAdmin();
  },

  getCurrentUserEmail() {
    return StorageManager.getCurrentUser();
  },

  getCurrentUser() {
    const email = this.getCurrentUserEmail();
    if (!email) return null;
    return StorageManager.getUserByEmail(email);
  }
};

// ============================================================================
// 4. INVESTMENT SYSTEM
// ============================================================================

const InvestmentManager = {
  // Calculate maturity date
  calculateMaturityDate(durationDays) {
    const date = new Date();
    date.setDate(date.getDate() + durationDays);
    return date;
  },

  // Calculate returns
  calculateReturns(amount, returnPercent) {
    return (amount * returnPercent) / 100;
  },

  // Create investment
  createInvestment(email, packageId, amount) {
    const pkg = INVESTMENT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return { success: false, message: 'Package not found' };

    if (amount < pkg.minInvestment) {
      return { success: false, message: `Minimum investment is $${pkg.minInvestment}` };
    }

    const maturityDate = this.calculateMaturityDate(pkg.duration);
    const expectedReturn = this.calculateReturns(amount, pkg.returnPercent);

    const investment = {
      packageId,
      packageName: pkg.name,
      amount,
      returnPercent: pkg.returnPercent,
      expectedReturn,
      startDate: new Date().toISOString(),
      maturityDate: maturityDate.toISOString(),
      status: 'pending_payment',
      durationDays: pkg.duration
    };

    const result = StorageManager.addInvestment(email, investment);
    
    if (result) {
      return { success: true, investment: result };
    }
    
    return { success: false, message: 'Failed to create investment' };
  },

  // Get user investments
  getUserInvestments(email) {
    const user = StorageManager.getUserByEmail(email);
    return user ? user.investments : [];
  },

  // Get active investments (approved)
  getActiveInvestments(email) {
    return this.getUserInvestments(email).filter(i => i.status === 'active');
  },

  // Get pending investments
  getPendingInvestments(email) {
    return this.getUserInvestments(email).filter(i => i.status === 'pending_payment');
  },

  // Calculate totals
  calculateTotalInvested(email) {
    return this.getActiveInvestments(email).reduce((sum, i) => sum + i.amount, 0);
  },

  calculateActiveBalance(email) {
    return this.calculateTotalInvested(email);
  },

  getPendingDeposits(email) {
    const user = StorageManager.getUserByEmail(email);
    if (!user) return [];
    return user.receipts.filter(r => r.status === 'pending_review');
  }
};

// ============================================================================
// 5. RECEIPT & PAYMENT SYSTEM
// ============================================================================

const PaymentManager = {
  // Create receipt for investment
  createReceipt(email, investmentId, screenshotData, txId, walletType) {
    const investment = InvestmentManager.getUserInvestments(email)
      .find(i => i.id === investmentId);
    
    if (!investment) {
      return { success: false, message: 'Investment not found' };
    }

    const receipt = {
      investmentId,
      investment: {
        packageName: investment.packageName,
        amount: investment.amount
      },
      screenshot: screenshotData,
      transactionId: txId,
      walletType,
      status: 'pending_review',
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null
    };

    const result = StorageManager.addReceipt(email, receipt);
    
    if (result) {
      return { success: true, receipt: result };
    }
    
    return { success: false, message: 'Failed to create receipt' };
  },

  // Get all pending receipts (for admin)
  getAllPendingReceipts() {
    const users = StorageManager.getUsers();
    const pendingReceipts = [];

    users.forEach(user => {
      user.receipts
        .filter(r => r.status === 'pending_review')
        .forEach(r => {
          pendingReceipts.push({
            ...r,
            userEmail: user.email,
            userName: user.name
          });
        });
    });

    return pendingReceipts.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  // Approve receipt (admin)
  approveReceipt(userEmail, receiptId) {
    const receipt = StorageManager.getUserByEmail(userEmail)
      ?.receipts.find(r => r.id === receiptId);
    
    if (!receipt) return false;

    // Update receipt status
    StorageManager.updateReceipt(userEmail, receiptId, {
      status: 'approved',
      approvedAt: new Date().toISOString()
    });

    // Update investment status to active
    const investment = InvestmentManager.getUserInvestments(userEmail)
      .find(i => i.id === receipt.investmentId);
    
    if (investment) {
      StorageManager.updateInvestment(userEmail, investment.id, {
        status: 'active'
      });
    }

    // Update user's active balance
    const user = StorageManager.getUserByEmail(userEmail);
    const totalActive = InvestmentManager.calculateTotalInvested(userEmail);
    StorageManager.updateUser(userEmail, { activeBalance: totalActive });

    return true;
  },

  // Reject receipt (admin)
  rejectReceipt(userEmail, receiptId, reason = '') {
    const user = StorageManager.getUserByEmail(userEmail);
    if (!user) return false;

    const receipt = user.receipts.find(r => r.id === receiptId);
    if (!receipt) return false;

    // Update receipt status
    StorageManager.updateReceipt(userEmail, receiptId, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    });

    // Delete the associated investment
    StorageManager.deleteInvestment(userEmail, receipt.investmentId);

    return true;
  },

  // Get user receipts
  getUserReceipts(email) {
    const user = StorageManager.getUserByEmail(email);
    return user ? user.receipts : [];
  }
};

// ============================================================================
// 6. UI UTILITIES
// ============================================================================

const UIManager = {
  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format date and time
  formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Show modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  },

  // Hide modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  // Show alert/notification
  showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Create notification element if needed
    alert(message);
  },

  // Get package
  getPackage(packageId) {
    return INVESTMENT_PACKAGES.find(p => p.id === packageId);
  }
};

// ============================================================================
// 7. PAGE NAVIGATION & INITIALIZATION
// ============================================================================

const PageManager = {
  getCurrentPage() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    return filename;
  },

  init() {
    StorageManager.init();
    const page = this.getCurrentPage();

    if (page.includes('login')) {
      this.initLoginPage();
    } else if (page.includes('dashboard')) {
      this.initDashboardPage();
    } else if (page.includes('packages')) {
      this.initPackagesPage();
    } else if (page.includes('admin')) {
      this.initAdminPage();
    } else if (page.includes('index')) {
      this.initIndexPage();
    }
  },

  initIndexPage() {
    // Index page already has its counter logic
  },

  initLoginPage() {
    // Will be handled by page-specific scripts
  },

  initPackagesPage() {
    // Will be handled by page-specific scripts
  },

  initDashboardPage() {
    // Check if user is logged in
    if (!AuthManager.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
  },

  initAdminPage() {
    // Check if admin is logged in
    if (!AuthManager.isAdminLoggedIn()) {
      // Admin login modal will show
    }
  }
};

// ============================================================================
// 8. EXPORT FOR GLOBAL USE
// ============================================================================

// Make everything available globally
window.StorageManager = StorageManager;
window.AuthManager = AuthManager;
window.InvestmentManager = InvestmentManager;
window.PaymentManager = PaymentManager;
window.UIManager = UIManager;
window.PageManager = PageManager;
window.INVESTMENT_PACKAGES = INVESTMENT_PACKAGES;
window.CRYPTO_WALLETS = CRYPTO_WALLETS;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  PageManager.init();
});

// ============================================================================
// 9. HELPER FUNCTIONS FOR HTML
// ============================================================================

// Authentication helpers
window.handleRegister = function(email, password, name) {
  const result = AuthManager.register(email, password, name);
  if (result.success) {
    AuthManager.login(email, password);
    window.location.href = 'packages.html';
  } else {
    UIManager.showNotification(result.message, 'error');
  }
};

window.handleLogin = function(email, password) {
  const result = AuthManager.login(email, password);
  if (result.success) {
    window.location.href = 'dashboard.html';
  } else {
    UIManager.showNotification(result.message, 'error');
  }
};

window.handleAdminLogin = function(email, password) {
  const result = AuthManager.adminLogin(email, password);
  if (result.success) {
    UIManager.hideModal('adminLoginModal');
    // Reload to show admin content
    window.location.reload();
  } else {
    UIManager.showNotification(result.message, 'error');
  }
};

window.handleLogout = function() {
  AuthManager.logout();
  window.location.href = 'index.html';
};

window.handleAdminLogout = function() {
  AuthManager.adminLogout();
  window.location.href = 'admin.html';
};

// Investment helpers
window.openInvestmentModal = function(packageId) {
  // Store selected package in session
  sessionStorage.setItem('selectedPackage', packageId);
  UIManager.showModal('investmentModal');
};

window.closeInvestmentModal = function() {
  UIManager.hideModal('investmentModal');
  sessionStorage.removeItem('selectedPackage');
};

window.calculateReturn = function(amount, packageId) {
  const pkg = UIManager.getPackage(packageId);
  if (!pkg) return 0;
  return UIManager.formatCurrency((amount * pkg.returnPercent) / 100);
};

window.calculateMaturityDate = function(packageId) {
  const pkg = UIManager.getPackage(packageId);
  if (!pkg) return '';
  const date = new Date();
  date.setDate(date.getDate() + pkg.duration);
  return UIManager.formatDate(date);
};

window.proceedToPayment = function() {
  const selectedPackage = sessionStorage.getItem('selectedPackage');
  const amount = document.getElementById('investmentAmount')?.value;

  if (!selectedPackage || !amount) {
    UIManager.showNotification('Please enter investment amount', 'error');
    return;
  }

  const pkg = UIManager.getPackage(selectedPackage);
  if (parseFloat(amount) < pkg.minInvestment) {
    UIManager.showNotification(`Minimum investment is $${pkg.minInvestment}`, 'error');
    return;
  }

  // Create investment
  const email = AuthManager.getCurrentUserEmail();
  const result = InvestmentManager.createInvestment(email, selectedPackage, parseFloat(amount));

  if (result.success) {
    UIManager.hideModal('investmentModal');
    // Show payment modal with investment ID
    sessionStorage.setItem('investmentId', result.investment.id);
    UIManager.showModal('paymentModal');
  } else {
    UIManager.showNotification(result.message, 'error');
  }
};

window.completePayment = function() {
  const email = AuthManager.getCurrentUserEmail();
  const investmentId = sessionStorage.getItem('investmentId');
  const txId = document.getElementById('transactionId')?.value;
  const walletType = document.getElementById('walletType')?.value || 'usdt';

  if (!txId) {
    UIManager.showNotification('Please enter transaction ID', 'error');
    return;
  }

  // Create receipt (without screenshot for this simplified version)
  const result = PaymentManager.createReceipt(
    email,
    investmentId,
    'screenshot_placeholder',
    txId,
    walletType
  );

  if (result.success) {
    UIManager.hideModal('paymentModal');
    UIManager.showNotification(
      'Payment receipt submitted! Admin will review shortly.',
      'success'
    );
    
    // Reload dashboard after delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } else {
    UIManager.showNotification(result.message, 'error');
  }
};

// Admin helpers
window.approveReceipt = function(userEmail, receiptId) {
  if (PaymentManager.approveReceipt(userEmail, receiptId)) {
    UIManager.showNotification('Receipt approved', 'success');
    // Reload admin panel
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    UIManager.showNotification('Failed to approve receipt', 'error');
  }
};

window.rejectReceipt = function(userEmail, receiptId) {
  const reason = prompt('Enter rejection reason (optional):');
  if (PaymentManager.rejectReceipt(userEmail, receiptId, reason || '')) {
    UIManager.showNotification('Receipt rejected', 'success');
    // Reload admin panel
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    UIManager.showNotification('Failed to reject receipt', 'error');
  }
};
