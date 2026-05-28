/**
 * TeslaInvest Platform - Complete JavaScript Application
 * FIXED VERSION - Addresses all issues
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
    returnPercent: 200,
    bonus: 0,
    tag: 'STARTER',
    tagClass: 'tag-starter',
    buttonClass: 'btn-green',
    description: 'Satellite Internet Infrastructure',
    multiplier: 2
  },
  {
    id: 'cybercab',
    name: 'Cybercab',
    icon: '🚖',
    minInvestment: 500,
    duration: 90,
    returnPercent: 300,
    bonus: 5,
    tag: 'POPULAR',
    tagClass: 'tag-popular',
    buttonClass: 'btn-red',
    description: 'Autonomous Vehicle Technology',
    popular: true,
    multiplier: 3
  },
  {
    id: 'mars-colony',
    name: 'Mars Colony',
    icon: '🚀',
    minInvestment: 2500,
    duration: 180,
    returnPercent: 400,
    bonus: 0,
    tag: 'VIP',
    tagClass: 'tag-vip',
    buttonClass: 'btn-blue',
    description: 'Interplanetary Colonization',
    multiplier: 4
  }
];

// Wallet addresses for payment
const CRYPTO_WALLETS = {
  bitcoin: 'bc1q67lt894r3pcrkad9pylhq7skqxtgkx5lnusm5n',
  ethereum: '0x9647750C8690054e5e5b445B3c0D91CdD2B84C06',
  usdt: '0x9647750C8690054e5e5b445B3c0D91CdD2B84C06'
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
  // API Base URL - Updated to Railway backend
  apiUrl: 'https://investment-site-production.up.railway.app/api',
  
  init() {
    if (!this.getUsers()) {
      this.saveUsers([]);
    }
    // Clear currentUser on init if not present
    if (!this.getCurrentUser()) {
      localStorage.removeItem('currentUser');
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
    // Don't use this - it's deprecated. Use localStorage directly instead.
    // This function was overwriting the full user object with just an email string.
    // Keep for backward compatibility but it shouldn't be called.
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
  apiUrl: '/api',

  async register(email, password, name) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }
      
      // Save token and user to localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }
      
      // Save token and user to localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  adminLogin(email, password) {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      StorageManager.setCurrentAdmin(email);
      return { success: true };
    }
    return { success: false, message: 'Invalid admin credentials' };
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  adminLogout() {
    StorageManager.setCurrentAdmin(null);
  },

  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  },

  isAdminLoggedIn() {
    return !!StorageManager.getCurrentAdmin();
  },

  getCurrentUserEmail() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user).email : null;
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
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
  },

  calculateReturns(amount, returnPercent) {
    return (amount * returnPercent) / 100;
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
    this.updateNavbar();
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

  updateNavbar() {
    const navCta = document.querySelector('.nav-cta');
    const navLinks = document.querySelector('.nav-links');
    if (!navCta) return;

    // Helper: find dashboard link anchor robustly
    let dashboardLi = null;
    if (navLinks) {
      dashboardLi = Array.from(navLinks.querySelectorAll('li')).find(li => {
        const a = li.querySelector('a');
        return a && a.getAttribute('href') && a.getAttribute('href').includes('dashboard');
      });
    }

    // Replace the CTA element (avoids nested anchors and inconsistent behavior)
    const createSignIn = () => {
      const a = document.createElement('a');
      a.className = 'nav-cta';
      a.href = '/login.html';
      a.textContent = 'SIGN IN';
      // preserve some styling via inline styles so replacement looks identical
      a.style.background = 'var(--red)';
      a.style.color = '#fff';
      a.style.padding = '8px 24px';
      a.style.cursor = 'pointer';
      a.style.clipPath = 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)';
      return a;
    };

    // Global helper to navigate to login and clear any admin session
    window.gotoLogin = function() {
      // clear admin session if present
      try { StorageManager.setCurrentAdmin(null); } catch (e) {}
      // Redirect to login (pages dir is root on Vercel)
      window.location.href = '/login.html';
    };

    const createUserCta = (userName) => {
      const a = document.createElement('a');
      a.className = 'nav-cta';
      a.href = '#';
      a.style.background = 'transparent';
      a.style.color = '#fff';
      a.style.padding = '8px 16px';
      a.style.cursor = 'default';
      a.style.clipPath = 'none';
      a.style.display = 'flex';
      a.style.alignItems = 'center';
      a.style.gap = '10px';

      const nameSpan = document.createElement('span');
      nameSpan.textContent = userName;
      nameSpan.style.fontWeight = '700';

      const logoutLink = document.createElement('span');
      logoutLink.textContent = 'LOGOUT';
      logoutLink.style.color = '#fff';
      logoutLink.style.textDecoration = 'underline';
      logoutLink.style.fontSize = '0.8rem';
      logoutLink.style.marginLeft = '10px';
      logoutLink.style.cursor = 'pointer';
      logoutLink.addEventListener('click', (e) => { e.preventDefault(); window.handleLogout(); });

      a.appendChild(nameSpan);
      a.appendChild(logoutLink);
      return a;
    };

    const isLogged = AuthManager.isLoggedIn();

    // Remove any existing CTA elements to avoid duplicates
    const existingCtas = document.querySelectorAll('.nav-cta');
    existingCtas.forEach((el) => el.remove());

    if (isLogged) {
      const user = AuthManager.getCurrentUser();
      const userName = user ? user.name : 'User';
      const newCta = createUserCta(userName);
      // append new CTA to nav
      if (navLinks && navLinks.parentNode) {
        navLinks.parentNode.appendChild(newCta);
      } else if (document.querySelector('nav')) {
        document.querySelector('nav').appendChild(newCta);
      }

      if (dashboardLi) {
        // keep spacing by toggling visibility instead of removing the element
        dashboardLi.style.visibility = 'visible';
      }
    } else {
      const newCta = createSignIn();
      if (navLinks && navLinks.parentNode) {
        navLinks.parentNode.appendChild(newCta);
      } else if (document.querySelector('nav')) {
        document.querySelector('nav').appendChild(newCta);
      }

      if (dashboardLi) {
        // hide but keep layout space
        dashboardLi.style.visibility = 'hidden';
      }
    }
  },

  initIndexPage() {
    // Hide preview if not logged in (ISSUE #5 FIX)
    if (!AuthManager.isLoggedIn()) {
      const previewSection = document.querySelector('.investment-preview');
      if (previewSection) {
        previewSection.style.display = 'none';
      }
    }
  },

  initLoginPage() {
    // Handled by page-specific scripts
  },

  initPackagesPage() {
    // Setup investment modal listeners (ISSUE #2 FIX)
    setupInvestmentAmountListener();
  },

  initDashboardPage() {
    // ISSUE #1 FIX: Check login BEFORE rendering
    if (!AuthManager.isLoggedIn()) {
      window.location.href = '/login.html';
      return;
    }
    
    // Don't clear content - it has the dashboard layout!
    // Just let renderAll() update the specific elements
  },

  initAdminPage() {
    // Check if admin is logged in
    if (!AuthManager.isAdminLoggedIn()) {
      const adminLoginModal = document.getElementById('adminLoginModal');
      if (adminLoginModal) {
        UIManager.showModal('adminLoginModal');
      }
    }
  }
};

// ============================================================================
// 8. REAL-TIME INVESTMENT PREVIEW (ISSUE #2 FIX)
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
// 9. WINDOW FUNCTIONS
// ============================================================================

// Login/Register handlers
window.handleLogin = async function(emailArg, passwordArg) {
  // Accept optional parameters (called from login page) or read from DOM
  const email = emailArg || document.getElementById('loginEmail')?.value;
  // support both 'loginPassword' and 'loginPwd' ids
  const password = passwordArg || document.getElementById('loginPwd')?.value || document.getElementById('loginPassword')?.value;

  if (!email || !password) {
    UIManager.showNotification('Please enter email and password', 'error');
    return;
  }

  const result = await AuthManager.login(email, password);

  if (result.success) {
    UIManager.showNotification('Login successful!', 'success');
    setTimeout(() => {
      // Redirect to dashboard (pages dir is root on Vercel)
      window.location.href = '/dashboard.html';
    }, 700);
  } else {
    // show inline-friendly message when login page present
    UIManager.showNotification(result.message || 'Invalid credentials', 'error');
  }
};

window.handleRegister = async function(emailArg, passwordArg, nameArg) {
  // Accept optional params or pull from DOM (supports login-new.html and current login.html)
  const email = emailArg || document.getElementById('regEmail')?.value || document.getElementById('registerEmail')?.value;
  const password = passwordArg || document.getElementById('regPwd')?.value || document.getElementById('registerPassword')?.value;
  const name = nameArg || document.getElementById('regName')?.value || document.getElementById('registerName')?.value;

  if (!email || !password || !name) {
    UIManager.showNotification('Please fill all fields', 'error');
    return;
  }

  const result = await AuthManager.register(email, password, name);

  if (result.success) {
    UIManager.showNotification('Registration successful! Redirecting to dashboard...', 'success');
    setTimeout(() => {
      // Redirect to dashboard (pages dir is root on Vercel)
      window.location.href = '/dashboard.html';
    }, 700);
  } else {
    UIManager.showNotification(result.message || 'Registration failed', 'error');
  }
};

window.handleAdminLogin = function() {
  const email = document.getElementById('adminEmail')?.value;
  const password = document.getElementById('adminPassword')?.value;

  if (!email || !password) {
    UIManager.showNotification('Please enter admin credentials', 'error');
    return;
  }

  const result = AuthManager.adminLogin(email, password);

  if (result.success) {
    UIManager.hideModal('adminLoginModal');
    UIManager.showNotification('Admin login successful!', 'success');
    // Reload page to show admin panel
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    UIManager.showNotification('Invalid admin credentials', 'error');
  }
};

window.handleLogout = function() {
  AuthManager.logout();
  window.location.href = 'login.html';
};

window.handleAdminLogout = function() {
  AuthManager.adminLogout();
  window.location.href = 'index.html';
};

// Investment handlers
window.createInvestment = function() {
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

  // Create investment
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
  const walletType = document.getElementById('walletType')?.value || 'usdt';

  if (!txId) {
    UIManager.showNotification('Please enter transaction ID', 'error');
    return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    UIManager.showNotification('Please login first', 'error');
    window.location.href = 'login.html';
    return;
  }

  // Call backend API to submit payment receipt
  fetch('/api/payments/receipt', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      investmentId,
      amount: parseFloat(document.getElementById('investmentAmount')?.value || 0),
      walletType,
      transactionId: txId
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      // All data saved to MongoDB - no localStorage needed
      UIManager.hideModal('paymentModal');
      UIManager.showNotification(
        '✅ Payment receipt submitted! Admin will review within 24 hours.',
        'success'
      );
      
      // Clear input fields
      document.getElementById('transactionId').value = '';
      document.getElementById('investmentAmount').value = '';
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    } else {
      UIManager.showNotification('Error: ' + (data.error || 'Failed to submit receipt'), 'error');
    }
  })
  .catch(err => {
    console.error('Payment error:', err);
    UIManager.showNotification('Connection error. Please try again.', 'error');
  });
};

// Admin helpers (ISSUE #3 FIX: Ensure approval/rejection works)
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
// INVESTMENT MODAL & ROI CALCULATOR FUNCTIONS
// ============================================================================

window.openInvestmentModal = function(packageId) {
  // Check if user is logged in
  if (!AuthManager.isLoggedIn()) {
    // User is NOT logged in - redirect to login page
    window.location.href = '/login.html';
    return;
  }

  // User IS logged in - store selected package and open modal
  sessionStorage.setItem('selectedPackage', packageId);
  UIManager.showModal('investmentModal');
};

window.closeInvestmentModal = function() {
  UIManager.hideModal('investmentModal');
  sessionStorage.removeItem('selectedPackage');
  document.getElementById('investmentAmount').value = '';
  // Reset overview display
  const returnAmount = document.getElementById('returnAmount');
  const maturityDate = document.getElementById('maturityDate');
  if (returnAmount) returnAmount.textContent = '$0';
  if (maturityDate) maturityDate.textContent = '—';
};

window.closePaymentModal = function() {
  UIManager.hideModal('paymentModal');
  document.getElementById('transactionId').value = '';
  document.getElementById('investmentAmount').value = '';
};

window.calcROI = function(sliderId, multiplier, resultId) {
  const slider = document.getElementById(sliderId);
  const sliderValue = parseFloat(slider.value);
  
  // Update the display value
  const displayId = sliderId + '-val';
  const displayElement = document.getElementById(displayId);
  if (displayElement) {
    displayElement.textContent = '$' + sliderValue.toLocaleString();
  }
  
  // Calculate returns based on multiplier (x2, x3, etc)
  const returnAmount = sliderValue * multiplier;
  const profit = returnAmount - sliderValue;
  
  // Update ROI calculator display
  const investmentDisplay = document.getElementById(resultId + '-inv');
  const returnDisplay = document.getElementById(resultId + '-ret');
  const profitDisplay = document.getElementById(resultId + '-net');
  const resultDisplay = document.getElementById(resultId);
  
  if (investmentDisplay) investmentDisplay.textContent = '$' + sliderValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (returnDisplay) returnDisplay.textContent = '$' + returnAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (profitDisplay) profitDisplay.textContent = '$' + profit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (resultDisplay) resultDisplay.textContent = '$' + returnAmount.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
};

window.proceedToPayment = function() {
  const email = AuthManager.getCurrentUserEmail();
  
  if (!email) {
    UIManager.showNotification('Please login to invest', 'error');
    window.location.href = 'login.html';
    return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    UIManager.showNotification('Please login first', 'error');
    window.location.href = 'login.html';
    return;
  }

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

  // Call backend API to create investment - MONGODB ONLY
  fetch('/api/investments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      packageId: selectedPackage,
      amount: parseFloat(amount)
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      // Store investment ID for next step (sessionStorage only)
      sessionStorage.setItem('investmentId', data.investment.id);
      
      UIManager.hideModal('investmentModal');
      
      // Initialize wallet address display for payment modal
      // This function is defined on packages.html, but we provide a fallback
      if (typeof initializeWalletDisplay === 'function') {
        setTimeout(() => initializeWalletDisplay(), 100);
      } else {
        // Fallback for pages that don't have the function
        const walletAddressEl = document.getElementById('walletAddress');
        if (walletAddressEl) {
          const walletType = document.getElementById('walletType')?.value || 'usdt';
          let addr = CRYPTO_WALLETS.usdt;
          if (walletType === 'bitcoin') addr = CRYPTO_WALLETS.bitcoin;
          else if (walletType === 'ethereum') addr = CRYPTO_WALLETS.ethereum;
          walletAddressEl.textContent = addr;
        }
      }
      
      UIManager.showModal('paymentModal');
    } else {
      UIManager.showNotification('Error: ' + (data.error || 'Failed to create investment'), 'error');
    }
  })
  .catch(err => {
    console.error('Investment creation error:', err);
    UIManager.showNotification('Connection error. Please try again.', 'error');
  });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  PageManager.init();
  
  // Setup wallet type selector event listener for payment modal
  const walletTypeSelect = document.getElementById('walletType');
  if (walletTypeSelect) {
    walletTypeSelect.addEventListener('change', function() {
      const walletAddressEl = document.getElementById('walletAddress');
      if (walletAddressEl) {
        let addr = CRYPTO_WALLETS.usdt;
        if (this.value === 'bitcoin') addr = CRYPTO_WALLETS.bitcoin;
        else if (this.value === 'ethereum') addr = CRYPTO_WALLETS.ethereum;
        walletAddressEl.textContent = addr;
        
        // Update suggested amount too
        const amountInput = document.getElementById('investmentAmount');
        const suggestedAmountEl = document.getElementById('suggestedAmount');
        if (amountInput && suggestedAmountEl) {
          let currency = 'USDT';
          if (this.value === 'bitcoin') currency = 'BTC';
          else if (this.value === 'ethereum') currency = 'ETH';
          suggestedAmountEl.textContent = '$' + (amountInput.value || '0') + ' ' + currency;
        }
      }
    });
    
    // Initialize wallet address on load
    const walletAddressEl = document.getElementById('walletAddress');
    if (walletAddressEl) {
      walletAddressEl.textContent = CRYPTO_WALLETS.usdt;
    }
    const suggestedAmountEl = document.getElementById('suggestedAmount');
    if (suggestedAmountEl && suggestedAmountEl.textContent === '—') {
      suggestedAmountEl.textContent = '$0 USDT';
    }
  }
});

// Initialize on document ready (fallback)
if (document.readyState === 'loading') {
  // Bind via arrow so PageManager.init runs with correct `this` (avoids "this.updateNavbar is not a function")
  document.addEventListener('DOMContentLoaded', () => PageManager.init());
} else {
  PageManager.init();
}
