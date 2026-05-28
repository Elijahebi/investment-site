# Investment Site - Context Summary

## Project Structure
- **Location**: `/Users/ppp/Documents/investment site`
- **Pages**: `pages/admin.html`, `dashboard.html`, `index.html`, `login.html`, `packages.html`, `invest.html`

## Key Files
1. **app.js** - Main application file containing:
   - `INVESTMENT_PACKAGES` array (lines 10-55)
   - `CRYPTO_WALLETS` object (lines 57-64)
   - `ADMIN_CREDENTIALS` (lines 66-68)
   - Storage management functions
   - Various API handlers

2. **pages/invest.html** - Investment packages display page
   - Loads `app.js` at line 173: `<script src="../app.js"></script>`
   - Has inline script starting at line 174
   - Contains `renderPackages()` function that uses `INVESTMENT_PACKAGES` global
   - Contains payment functions: `openInvestmentPanel()`, `closeInvestmentPanel()`, `updateInvestPanel()`, `completeInvestment()`, `submitPaymentReceipt()`
   - Uses `CRYPTO_WALLETS` global for wallet addresses
   - Packages container ID: `packagesContainer` (line 151)

## INVESTMENT_PACKAGES Structure
```javascript
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
    returnPercent: 300,
    bonus: 0,
    tag: 'VIP',
    tagClass: 'tag-vip',
    buttonClass: 'btn-blue',
    description: 'Interplanetary Colonization',
    multiplier: 3
  }
];
```

## CRYPTO_WALLETS Structure
```javascript
const CRYPTO_WALLETS = {
  bitcoin: 'bc1q67lt894r3pcrkad9pylhq7skqxtgkx5lnusm5n',
  ethereum: '0x9647750C8690054e5e5b445B3c0D91CdD2B84C06',
  usdt_eth: '0x9647750C8690054e5e5b445B3c0D91CdD2B84C06',
  usdt_tron: 'THKPySqKVP38eyupZ9WQGRKHcjMbaLwpMQ'
};
```

## Key Functions in invest.html
1. **renderPackages()** - Renders investment package cards
   - Creates cards from INVESTMENT_PACKAGES
   - Uses color/styling config for each package type
   - Generates "popular" badge for cybercab
   - Creates flip cards with front (display) and back (investment form)

2. **openInvestmentPanel(packageId, event)** - Flips card to show investment form
   - Shows the back panel with investment amount input
   - Checks if user is logged in
   - Initializes wallet address

3. **closeInvestmentPanel(packageId, event)** - Flips card back to front
   - Hides investment form
   - Clears input fields

4. **updateInvestPanel(packageId, multiplier)** - Updates calculated returns
   - Takes investment amount input
   - Calculates returns based on multiplier
   - Calculates maturity date based on duration

5. **completeInvestment(packageId)** - Submits investment to backend
   - Validates amount and transaction ID
   - Calls POST /api/investments endpoint
   - Then calls submitPaymentReceipt()

6. **submitPaymentReceipt()** - Submits payment details to backend
   - Calls POST /api/payments/receipt endpoint
   - Shows success alert
   - Redirects to dashboard

## Backend Endpoints Used
- `POST http://localhost:8000/api/investments` - Create investment record
- `POST http://localhost:8000/api/payments/receipt` - Submit payment receipt

## Related Files
- Dashboard: `pages/dashboard.html` (also uses INVESTMENT_PACKAGES and CRYPTO_WALLETS)
- Packages: `pages/packages.html` (also uses CRYPTO_WALLETS)
- API Reference: `API_REFERENCE.md`
- Crypto Setup: `CRYPTO_PAYMENT_SETUP.md`
- Fixes: `FIXES_COMPLETED.md`

## Last Known Token Status
- Used ~14,543 tokens for initial exploration
- Need to preserve remaining tokens for implementation work
