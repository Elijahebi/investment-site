# 🔧 HOW TO INTEGRATE AUTH MODAL INTO YOUR PAGES

## Quick Integration Steps

### Step 1: Backup Current Files
```bash
cp app.js app-backup.js
cp index.html index-backup.html
cp dashboard.html dashboard-backup.html
cp admin.html admin-backup.html
```

### Step 2: Replace app.js
```bash
mv app-auth-complete.js app.js
```

### Step 3: Add Auth Modal & Theme Toggle to Each Page

---

## 📄 FOR index.html (Home Page)

### 3A. Update Navbar

Find this section:
```html
<nav>
  <a href="index.html" class="logo">TESLA<span>INVEST</span></a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#stats">Stats</a></li>
  </ul>
  <a href="login.html" class="nav-cta">SIGN IN</a>
</nav>
```

Replace with:
```html
<nav>
  <a href="index.html" class="logo">TESLA<span>INVEST</span></a>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#stats">Stats</a></li>
  </ul>
  <div class="nav-right">
    <!-- Theme toggle and user section will be injected here -->
  </div>
</nav>
```

### 3B. Add Auth Modal Before Closing </body>

At the end of index.html, before `</body>`, add:
```html
<!-- Include Auth Modal -->
<script>
  // [COPY ALL CONTENT FROM auth-modal.html <script> section]
</script>
```

### 3C. Update "Invest Now" Buttons

From:
```html
<a href="packages.html" class="cta-btn">INVEST NOW</a>
```

To:
```html
<a href="#" class="cta-btn invest-btn" onclick="
  if (!AuthManager.isLoggedIn()) {
    showAuthModal('login');
    return false;
  }
  window.location.href = 'packages.html';
">INVEST NOW</a>
```

---

## 📄 FOR dashboard.html (Protected Page)

### 3A. Update Navbar

Find topbar and add:
```html
<div class="topbar">
  <h1>DASHBOARD</h1>
  <div class="topbar-right">
    <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
      <span id="themeIcon">🌙</span>
    </button>
    <button class="logout-btn" onclick="window.handleLogout?.()">Logout</button>
  </div>
</div>
```

### 3B. Add Auth Modal CSS & JS

Include auth-modal.html styles and scripts.

---

## 📄 FOR admin.html (Admin Panel)

Same as dashboard.html but with:
```html
<button class="logout-btn" onclick="window.handleAdminLogout?.()">Logout</button>
```

---

## ✅ FILES TO USE

1. **app.js** ← Replace with `app-auth-complete.js`
2. **auth-modal.html** ← Include CSS + JS from this file
3. **All HTML pages** ← Update navbar sections

**Status: Ready for integration!** 🚀
