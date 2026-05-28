# 🔗 Frontend-to-Backend Integration Guide

## Overview

This guide shows how to update `app.js` to use the backend API instead of localStorage.

## Key Changes Needed

### 1. Update API Base URL

**In `app.js`, update the `StorageManager`:**

```javascript
const StorageManager = {
  // Point to your backend API
  apiUrl: 'http://localhost:5000/api',  // Development
  // apiUrl: 'https://api.yourdomain.com/api',  // Production
  
  // Store JWT token
  getToken() {
    return localStorage.getItem('jwt_token');
  },
  
  setToken(token) {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
  },
  
  // Helper for API calls with auth
  async apiCall(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.apiUrl}${endpoint}`, options);
    
    if (response.status === 401) {
      // Token expired or invalid - logout user
      AuthManager.logout();
      window.location.href = '/pages/login.html';
    }
    
    const result = await response.json();
    
    if (!result.success && result.error) {
      throw new Error(result.error);
    }
    
    return result;
  }
};
```

### 2. Update AuthManager

```javascript
const AuthManager = {
  // Register new user
  async register(email, password, name) {
    try {
      const result = await StorageManager.apiCall(
        '/auth/register',
        'POST',
        { name, email, password }
      );
      
      if (result.success) {
        StorageManager.setToken(result.token);
        StorageManager.setCurrentUser(email);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const result = await StorageManager.apiCall(
        '/auth/login',
        'POST',
        { email, password }
      );
      
      if (result.success) {
        StorageManager.setToken(result.token);
        StorageManager.setCurrentUser(email);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin login
  async adminLogin(email, password) {
    try {
      const result = await StorageManager.apiCall(
        '/auth/admin-login',
        'POST',
        { email, password }
      );
      
      if (result.success) {
        StorageManager.setToken(result.token);
        StorageManager.setCurrentAdmin(email);
        return { success: true, user: result.user };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout() {
    StorageManager.setToken(null);
    StorageManager.setCurrentUser(null);
    StorageManager.setCurrentAdmin(null);
  },

  // Check if logged in
  isLoggedIn() {
    return !!StorageManager.getToken() && !!StorageManager.getCurrentUser();
  },

  // Check if admin logged in
  isAdminLoggedIn() {
    return !!StorageManager.getToken() && !!StorageManager.getCurrentAdmin();
  }
};
```

### 3. Update InvestmentManager

```javascript
const InvestmentManager = {
  // Create investment
  async createInvestment(email, packageId, amount) {
    try {
      const result = await StorageManager.apiCall(
        '/investments',
        'POST',
        { packageId, amount }
      );
      
      if (result.success) {
        return { success: true, investment: result.investment };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get investments
  async getInvestments(email) {
    try {
      const result = await StorageManager.apiCall('/investments');
      
      if (result.success) {
        return result.investments || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      return [];
    }
  },

  // Get active investments only
  async getActiveInvestments(email) {
    try {
      const investments = await this.getInvestments(email);
      return investments.filter(i => i.status === 'active');
    } catch (error) {
      return [];
    }
  }
};
```

### 4. Update PaymentManager

```javascript
const PaymentManager = {
  // Create payment receipt
  async createReceipt(userEmail, investmentId, amount, transactionId, walletType) {
    try {
      const result = await StorageManager.apiCall(
        '/payments/receipt',
        'POST',
        { investmentId, amount, walletType, transactionId }
      );
      
      if (result.success) {
        return { success: true, receipt: result.receipt };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get receipts
  async getReceipts(email) {
    try {
      const result = await StorageManager.apiCall('/payments/receipts');
      
      if (result.success) {
        return result.receipts || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  // Get pending receipts (admin)
  async getAllPendingReceipts() {
    try {
      const result = await StorageManager.apiCall('/admin/pending-receipts');
      
      if (result.success) {
        return result.receipts || [];
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  // Approve receipt (admin)
  async approveReceipt(email, receiptId) {
    try {
      const result = await StorageManager.apiCall(
        `/admin/approve-receipt/${receiptId}`,
        'POST'
      );
      
      if (result.success) {
        return { success: true, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reject receipt (admin)
  async rejectReceipt(email, receiptId, notes = '') {
    try {
      const result = await StorageManager.apiCall(
        `/admin/reject-receipt/${receiptId}`,
        'POST',
        { notes }
      );
      
      if (result.success) {
        return { success: true, message: result.message };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

### 5. Update Page Rendering Functions

**For Dashboard:**

```javascript
// In pages/dashboard.html
async function renderStats() {
  try {
    const result = await StorageManager.apiCall('/user/stats');
    
    if (result.success) {
      const stats = result.stats;
      document.getElementById('activeBalance').textContent = 
        UIManager.formatCurrency(stats.activeBalance);
      document.getElementById('totalInvested').textContent = 
        UIManager.formatCurrency(stats.totalInvested);
      document.getElementById('pendingCount').textContent = stats.pendingCount;
      document.getElementById('activeCount').textContent = stats.activeCount;
    }
  } catch (error) {
    console.error('Failed to render stats:', error);
  }
}

async function renderInvestments() {
  try {
    const investments = await InvestmentManager.getActiveInvestments(
      StorageManager.getCurrentUser()
    );
    
    const tbody = document.getElementById('investmentsTbody');
    tbody.innerHTML = investments.map(inv => {
      const pkg = INVESTMENT_PACKAGES.find(p => p.id === inv.packageId);
      return `
        <tr>
          <td>${pkg?.name || 'Unknown'}</td>
          <td>${UIManager.formatCurrency(inv.amount)}</td>
          <td>${UIManager.formatDate(inv.startDate)}</td>
          <td>${UIManager.formatDate(inv.maturityDate)}</td>
          <td>${UIManager.formatCurrency(inv.expectedReturn)}</td>
          <td><span class="badge-active">ACTIVE</span></td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to render investments:', error);
  }
}

async function renderTransactions() {
  try {
    const receipts = await PaymentManager.getReceipts(
      StorageManager.getCurrentUser()
    );
    
    const tbody = document.getElementById('transactionsTbody');
    tbody.innerHTML = receipts.map(receipt => {
      const statusClass = `badge-${receipt.status.split('_')[0]}`;
      return `
        <tr>
          <td>${UIManager.formatDate(receipt.submittedAt)}</td>
          <td>Deposit</td>
          <td>${UIManager.formatCurrency(receipt.amount)}</td>
          <td>${receipt.transactionId.substring(0, 20)}...</td>
          <td><span class="${statusClass}">${receipt.status.toUpperCase()}</span></td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to render transactions:', error);
  }
}
```

**For Admin Panel:**

```javascript
// In pages/admin.html
async function renderReceipts() {
  try {
    const receipts = await PaymentManager.getAllPendingReceipts();
    
    const tbody = document.getElementById('receiptsTbody');
    tbody.innerHTML = receipts.map(r => `
      <tr>
        <td>${UIManager.formatDate(r.submittedAt)}</td>
        <td>${r.userEmail}</td>
        <td>${UIManager.formatCurrency(r.amount)}</td>
        <td>${r.transactionId}</td>
        <td>
          <button onclick="window.approveReceipt('${r._id}')" class="btn-small btn-green">
            APPROVE
          </button>
          <button onclick="window.rejectReceipt('${r._id}')" class="btn-small btn-red">
            REJECT
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to render receipts:', error);
  }
}

async function renderOverview() {
  try {
    const result = await StorageManager.apiCall('/admin/overview');
    
    if (result.success) {
      const stats = result.stats;
      document.getElementById('userCount').textContent = stats.userCount;
      document.getElementById('pendingCount').textContent = stats.pendingCount;
      document.getElementById('totalInvested').textContent = 
        UIManager.formatCurrency(stats.totalInvested);
    }
  } catch (error) {
    console.error('Failed to render overview:', error);
  }
}
```

## Testing Checklist

After updating the code:

- [ ] Backend is running on localhost:5000
- [ ] User can register and receive a token
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong credentials
- [ ] Investment creation sends to database
- [ ] Dashboard loads user's investments
- [ ] Admin can see pending receipts
- [ ] Admin can approve receipt (investment becomes active)
- [ ] Admin can reject receipt (investment deleted)
- [ ] Logout clears token
- [ ] Refreshing page doesn't lose data (it comes from database)

## Error Handling

Wrap API calls in try-catch:

```javascript
try {
  const result = await StorageManager.apiCall('/endpoint');
  if (result.success) {
    // Handle success
  } else {
    UIManager.showNotification(result.error, 'error');
  }
} catch (error) {
  UIManager.showNotification(error.message, 'error');
}
```

## Common Issues

### "401 Unauthorized"
- Token is missing or expired
- Solution: User needs to login again

### "404 Not Found"
- Endpoint doesn't exist
- Check API URL is correct
- Check endpoint path matches backend

### "CORS Error"
- Frontend and backend on different domains
- Check CORS is enabled in backend (it is)
- Check FRONTEND_URL in .env file

### "Cannot POST /api/..."
- Backend not running
- Solution: Run `npm start` in backend folder
- Check port 5000 is not blocked

---

## Deployment Notes

When deploying to production:

1. **Update API URL:**
   ```javascript
   apiUrl: 'https://api.yourdomain.com/api'
   ```

2. **Update FRONTEND_URL in backend .env:**
   ```
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Enable HTTPS** on both frontend and backend

4. **Update CORS** for production domain

---

That's it! Your frontend is now connected to the real backend. 🎉
