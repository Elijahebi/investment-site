/**
 * TeslaInvest Platform - Real Database Authentication
 * VERSION: 4.0 - MongoDB Backend Integration
 * No more popups - Real website behavior
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

// ============================================================================
// 2. API CONFIGURATION
// ============================================================================

const API_URL = 'http://localhost:8000/api';

// ============================================================================
// 3. AUTHENTICATION WITH REAL DATABASE
// ============================================================================

const AuthManager = {
  // Check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('authToken');
  },

  // Get current user info
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  },

  // Store user session
  setUserSession(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  // Clear session
  clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  // Register with backend
  async register(name, email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      // Store session
      this.setUserSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Login with backend
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      // Store session
      this.setUserSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Logout
  logout() {
    this.clearSession();
    window.location.href = '/pages/index.html';
  }
};

// ============================================================================
// 4. API HELPER WITH AUTH
// ============================================================================

const APIHelper = {
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthManager.getToken()}`
    };
  },

  async fetch(endpoint, options = {}) {
    const headers = this.getHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  }
};

// ============================================================================
// 5. INVESTMENT MANAGER
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

  getPackage(packageId) {
    return INVESTMENT_PACKAGES.find(p => p.id === packageId);
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// ============================================================================
// 6. PROTECTION & ROUTING
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
      window.location.href = '/pages/login.html';
      return false;
    }

    // Packages requires user login
    if (page.includes('packages') && !AuthManager.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return false;
    }

    // Admin requires admin login (check later)
    if (page.includes('admin')) {
      const user = AuthManager.getCurrentUser();
      if (!user || !user.isAdmin) {
        window.location.href = '/pages/login.html';
        return false;
      }
    }

    return true;
  },

  protectInvestButtons() {
    const investButtons = document.querySelectorAll('[onclick*="invest"], .invest-btn, [data-invest]');
    investButtons.forEach(btn => {
      const originalOnclick = btn.getAttribute('onclick');
      btn.setAttribute('onclick', `
        if (!AuthManager.isLoggedIn()) {
          window.location.href = '/pages/login.html';
          return false;
        }
        ${originalOnclick || ''}
      `);
    });
  }
};

// ============================================================================
// 7. PAGE INITIALIZATION
// ============================================================================

const PageManager = {
  init() {
    // Check protected access first
    if (!ProtectionManager.checkProtectedAccess()) {
      return;
    }

    const page = window.location.pathname.split('/').pop() || 'index.html';

    if (page.includes('index')) {
      this.initIndexPage();
    } else if (page.includes('login')) {
      this.initLoginPage();
    } else if (page.includes('dashboard')) {
      this.initDashboardPage();
    } else if (page.includes('packages')) {
      this.initPackagesPage();
    } else if (page.includes('admin')) {
      this.initAdminPage();
    }

    // Update navbar
    this.updateNavbar();
    
    // Protect invest buttons
    setTimeout(() => {
      ProtectionManager.protectInvestButtons();
    }, 500);
  },

  updateNavbar() {
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    const isLoggedIn = AuthManager.isLoggedIn();

    if (isLoggedIn) {
      const user = AuthManager.getCurrentUser();
      const userName = user?.name || 'User';
      const userInitial = userName.charAt(0).toUpperCase();

      navRight.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <a href="/pages/dashboard.html" style="color: #999; text-decoration: none; font-size: 0.9rem; letter-spacing: 1px; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#999'">
            DASHBOARD
          </a>
          <span style="color: #555;">|</span>
          <span style="color: #E8E8E8; font-size: 0.85rem;">${userName}</span>
          <button onclick="AuthManager.logout()" style="background: #E31937; color: #fff; border: none; padding: 8px 16px; font-family: 'Rajdhani'; font-weight: 700; font-size: 0.75rem; letter-spacing: 1px; cursor: pointer; border-radius: 4px;">
            LOGOUT
          </button>
        </div>
      `;
    } else {
      navRight.innerHTML = `
        <a href="/pages/login.html" class="nav-cta">SIGN IN</a>
      `;
    }
  },

  initIndexPage() {
    // Hide preview if not logged in
    if (!AuthManager.isLoggedIn()) {
      const previewSection = document.querySelector('.investment-preview');
      if (previewSection) {
        previewSection.style.display = 'none';
      }
    }

    // Fix invest buttons
    const investButtons = document.querySelectorAll('.cta-btn, [onclick*="invest"]');
    investButtons.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        if (!AuthManager.isLoggedIn()) {
          window.location.href = '/pages/login.html';
          return false;
        }
        window.location.href = '/pages/packages.html';
        return false;
      };
    });
  },

  initLoginPage() {
    // Already handled by login.html
  },

  initDashboardPage() {
    if (!AuthManager.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return;
    }
  },

  initPackagesPage() {
    if (!AuthManager.isLoggedIn()) {
      window.location.href = '/pages/login.html';
      return;
    }
  },

  initAdminPage() {
    const user = AuthManager.getCurrentUser();
    if (!user || !user.isAdmin) {
      window.location.href = '/pages/login.html';
      return;
    }
  }
};

// ============================================================================
// 8. INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  PageManager.init();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PageManager.init);
} else {
  PageManager.init();
}
