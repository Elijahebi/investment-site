/**
 * TeslaInvest Platform - Complete Authentication System
 * VERSION: 3.0 - Full Auth Protection + Light/Dark Mode
 * Features:
 * - Modal-based login/signup
 * - Protected routes
 * - Auto-login after signup
 * - Light/Dark mode with persistence
 * - User session management
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
    duration: 30,
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

// SINGLE ADMIN CREDENTIALS - Only one admin account
const ADMIN_CREDENTIALS = {
  email: 'admin@teslainvest.com',
  password: 'Admin12345!'
};

// ============================================================================
// 2. STORAGE & API MANAGEMENT
// ============================================================================

const StorageManager = {
  // API Base URL
  apiUrl: 'http://localhost:8000/api',
  
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
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const user = {
      id: Date.now().toString(),
      email,
      password,
      name,
      investments: [],
      receipts: [],
      createdAt: new Date().toISOString()
    };

    users.push(user);
    this.saveUsers(users);
    return { success: true, user };
  },

  updateUser(email, updates) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) return false;
    
    Object.assign(user, updates);
    this.saveUsers(users);
    return true;
  },

  addInvestment(email, investment) {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    investment.id = Date.now().toString();
    investment.createdAt = new Date().toISOString();
    
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

  addReceipt(email, receipt) {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    receipt.id = Date.now().toString();
    receipt.createdAt = new Date().toISOString();
    
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
  calculateMaturityDate(durationDays) {
    const date = new Date();
    date.setDate(date.getDate() + durationDays);
    return date;
  },

  calculateReturns(amount, returnPercent) {
    return (amount * returnPercent) / 100;
  },

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

  getUserInvestments(email) {
    const user = StorageManager.getUserByEmail(email);
    return user ? user.investments : [];
  },

  getActiveInvestments(email) {
    return this.getUserInvestments(email).filter(i => i.status === 'active');
  },

  getPendingInvestments(email) {
    return this.getUserInvestments(email).filter(i => i.status === 'pending_payment');
  },

  calculateTotalInvested(email) {
    return this.getActiveInvestments(email).reduce((sum, i) => sum + i.amount, 0);
  },

  calculateTotalReturns(email) {
    return this.getActiveInvestments(email).reduce((sum, i) => sum + i.expectedReturn, 0);
  }
};

// ============================================================================
// 5. PAYMENT SYSTEM
// ============================================================================

const PaymentManager = {
  createReceipt(email, investmentId, screenshot, txId, walletType) {
    const user = StorageManager.getUserByEmail(email);
    if (!user) return { success: false, message: 'User not found' };

    const investment = user.investments.find(i => i.id === investmentId);
    if (!investment) return { success: false, message: 'Investment not found' };

    const receipt = {
      investmentId,
      amount: investment.amount,
      walletType,
      transactionId: txId,
      screenshot,
      status: 'pending_review',
      submittedAt: new Date().toISOString()
    };

    const result = StorageManager.addReceipt(email, receipt);

    if (result) {
      // Update investment status
      StorageManager.updateInvestment(email, investmentId, {
        status: 'pending_review'
      });
      return { success: true, receipt: result };
    }

    return { success: false, message: 'Failed to create receipt' };
  },

  approveReceipt(userEmail, receiptId) {
    const user = StorageManager.getUserByEmail(userEmail);
    if (!user) return false;

    const receipt = user.receipts.find(r => r.id === receiptId);
    if (!receipt) return false;

    // Update receipt status
    StorageManager.updateReceipt(userEmail, receiptId, {
      status: 'approved',
      approvedAt: new Date().toISOString()
    });

    // Update investment status to active
    StorageManager.updateInvestment(userEmail, receipt.investmentId, {
      status: 'active',
      activatedAt: new Date().toISOString()
    });

    return true;
  },

  rejectReceipt(userEmail, receiptId, reason = '') {
    const user = StorageManager.getUserByEmail(userEmail);
    if (!user) return false;

    const receipt = user.receipts.find(r => r.id === receiptId);
    if (!receipt) return false;

    StorageManager.updateReceipt(userEmail, receiptId, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    });

    StorageManager.deleteInvestment(userEmail, receipt.investmentId);
    return true;
  },

  getUserReceipts(email) {
    const user = StorageManager.getUserByEmail(email);
    return user ? user.receipts : [];
  }
};

// ============================================================================
// 6. UI UTILITIES
// ============================================================================

const UIManager = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

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

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  },

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
  },

  getPackage(packageId) {
    return INVESTMENT_PACKAGES.find(p => p.id === packageId);
  }
};

// ============================================================================
// 7. PROTECTION SYSTEM - Block Access Without Login
// ============================================================================

const ProtectionManager = {
  isProtectedPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const protectedPages = ['dashboard.html', 'packages.html', 'admin.html'];
    return protectedPages.some(p => page.includes(p));
  },

  checkProtectedAccess() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    // Dashboard requires user login
    if (page.includes('dashboard') && !AuthManager.isLoggedIn()) {
      this.showAccessDeniedModal();
      return false;
    }

    // Packages requires user login
    if (page.includes('packages') && !AuthManager.isLoggedIn()) {
      this.showAccessDeniedModal();
      return false;
    }

    // Admin requires admin login
    if (page.includes('admin') && !AuthManager.isAdminLoggedIn()) {
      this.showAccessDeniedModal('admin');
      return false;
    }

    return true;
  },

  showAccessDeniedModal(type = 'user') {
    if (type === 'admin') {
      showAuthModal('admin-login');
    } else {
      showAuthModal('login');
    }
  },

  protectInvestButton() {
    const investButtons = document.querySelectorAll('[onclick*="invest"], .invest-btn, [data-invest]');
    investButtons.forEach(btn => {
      const originalOnclick = btn.onclick;
      btn.onclick = (e) => {
        if (!AuthManager.isLoggedIn()) {
          e.preventDefault();
          showAuthModal('login');
          return false;
        }
        return originalOnclick ? originalOnclick.call(btn, e) : true;
      };
    });
  }
};

// ============================================================================
// 8. PAGE NAVIGATION & INITIALIZATION
// ============================================================================

const PageManager = {
  getCurrentPage() {
    const filename = window.location.pathname.split('/').pop() || 'index.html';
    return filename;
  },

  init() {
    StorageManager.init();
    
    // Check protected access FIRST
    if (!ProtectionManager.checkProtectedAccess()) {
      return;
    }

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

    // Initialize user navbar
    initUserNavbar();
    
    // Protect invest buttons
    setTimeout(() => {
      ProtectionManager.protectInvestButton();
    }, 500);
  },

  initIndexPage() {
    // Hide preview if not logged in
    if (!AuthManager.isLoggedIn()) {
      const previewSection = document.querySelector('.investment-preview');
      if (previewSection) {
        previewSection.style.display = 'none';
      }
    }
  },

  initLoginPage() {
    // Login page specific code
  },

  initPackagesPage() {
    setupInvestmentAmountListener();
  },

  initDashboardPage() {
    if (!AuthManager.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
    
    const mainContent = document.querySelector('.content');
    if (mainContent) {
      mainContent.innerHTML = '';
    }
  },

  initAdminPage() {
    if (!AuthManager.isAdminLoggedIn()) {
      const adminLoginModal = document.getElementById('adminLoginModal');
      if (adminLoginModal) {
        UIManager.showModal('adminLoginModal');
      }
    }
  }
};

// ============================================================================
// 9. REAL-TIME INVESTMENT PREVIEW
// ============================================================================

function setupInvestmentAmountListener() {
  const amountInput = document.getElementById('investmentAmount');
  const packageSelect = document.getElementById('selectedPackage');
  const previewContainer = document.getElementById('investmentPreview');

  if (!amountInput || !packageSelect || !previewContainer) return;

  const updatePreview = () => {
    const amount = parseFloat(amountInput.value) || 0;
    const packageId = packageSelect.value;
    const pkg = UIManager.getPackage(packageId);

    if (!pkg || amount < pkg.minInvestment) {
      previewContainer.innerHTML = '';
      if (amount > 0 && amount < pkg.minInvestment) {
        previewContainer.innerHTML = `
          <div style="color: #ef4444; font-size: 0.8rem; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 4px;">
            ⚠️ Minimum investment: $${pkg.minInvestment}
          </div>
        `;
      }
      return;
    }

    const expectedReturn = InvestmentManager.calculateReturns(amount, pkg.returnPercent);
    const maturityDate = InvestmentManager.calculateMaturityDate(pkg.duration);

    previewContainer.innerHTML = `
      <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); padding: 15px; border-radius: 4px; margin-top: 10px;">
        <div style="font-size: 0.75rem; color: #888; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">INVESTMENT PREVIEW</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.85rem;">
          <div>
            <div style="color: #888; font-size: 0.7rem; margin-bottom: 4px;">Total Return</div>
            <div style="color: #22c55e; font-weight: 700; font-size: 1.1rem;">${UIManager.formatCurrency(expectedReturn)}</div>
          </div>
          <div>
            <div style="color: #888; font-size: 0.7rem; margin-bottom: 4px;">Maturity Date</div>
            <div style="color: #fff; font-weight: 600;">${UIManager.formatDate(maturityDate)}</div>
          </div>
          <div>
            <div style="color: #888; font-size: 0.7rem; margin-bottom: 4px;">Duration</div>
            <div style="color: #fff; font-weight: 600;">${pkg.duration} days</div>
          </div>
          <div>
            <div style="color: #888; font-size: 0.7rem; margin-bottom: 4px;">Total Value</div>
            <div style="color: #fff; font-weight: 600;">${UIManager.formatCurrency(amount + expectedReturn)}</div>
          </div>
        </div>
      </div>
    `;
  };

  amountInput.addEventListener('input', updatePreview);
  packageSelect.addEventListener('change', updatePreview);
}

// ============================================================================
// 10. WINDOW FUNCTIONS (for HTML onclick handlers)
// ============================================================================

window.createInvestment = function() {
  if (!AuthManager.isLoggedIn()) {
    showAuthModal('login');
    return;
  }

  const selectedPackage = document.getElementById('selectedPackage')?.value;
  const amount = document.getElementById('investmentAmount')?.value;

  if (!selectedPackage || !amount) {
    UIManager.showNotification('Please select package and enter amount', 'error');
    return;
  }

  const pkg = UIManager.getPackage(selectedPackage);
  if (parseFloat(amount) < pkg.minInvestment) {
    UIManager.showNotification(`Minimum investment is $${pkg.minInvestment}`, 'error');
    return;
  }

  const email = AuthManager.getCurrentUserEmail();
  const result = InvestmentManager.createInvestment(email, selectedPackage, parseFloat(amount));

  if (result.success) {
    UIManager.hideModal('investmentModal');
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
  const walletType = document.getElementById('walletType')?.value || 'bitcoin';

  if (!txId) {
    UIManager.showNotification('Please enter transaction ID', 'error');
    return;
  }

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
    
    document.getElementById('transactionId').value = '';
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } else {
    UIManager.showNotification(result.message, 'error');
  }
};

window.approveReceipt = function(userEmail, receiptId) {
  if (PaymentManager.approveReceipt(userEmail, receiptId)) {
    UIManager.showNotification('Receipt approved', 'success');
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
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    UIManager.showNotification('Failed to reject receipt', 'error');
  }
};

// ============================================================================
// 11. INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  PageManager.init();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PageManager.init);
} else {
  PageManager.init();
}
