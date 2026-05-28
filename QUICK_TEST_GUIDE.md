# 🚀 Quick Test Guide - Deposit & Receipt System

## Backend Status
```bash
✅ Running on http://localhost:8000
✅ MongoDB connected
✅ All endpoints functional
```

## Quick Test (5 minutes)

### 1️⃣ REGISTER USER
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test12345!"
  }'
```
✅ Copy the `token` from response

### 2️⃣ CREATE INVESTMENT
```bash
curl -X POST http://localhost:8000/api/investments \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "packageId": "starlink",
    "amount": 500
  }'
```
✅ Copy the `investment.id` from response

### 3️⃣ SUBMIT RECEIPT (with file)
```bash
curl -X POST http://localhost:8000/api/payments/receipt \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "investmentId": "{investment.id}",
    "amount": 500,
    "walletType": "usdt_eth",
    "transactionId": "0xABC123DEF456",
    "proofBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "proofFileName": "receipt.jpg"
  }'
```
✅ Receipt should be in MongoDB with proofUrl

### 4️⃣ ADMIN VIEWS PENDING RECEIPTS
```bash
# First login as admin
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teslainvest.com",
    "password": "Admin12345!"
  }'
# Copy admin token

# Then fetch pending
curl -X GET http://localhost:8000/api/admin/pending-receipts \
  -H "Authorization: Bearer {admin_token}"
```
✅ Should see the receipt with:
- userName: "Test User" ✅
- amount: 500 ✅
- status: "pending_review" ✅
- proofUrl: "/uploads/proof_..." ✅

### 5️⃣ ADMIN APPROVES
```bash
curl -X POST http://localhost:8000/api/admin/approve-receipt/{receipt_id} \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{}'
```
✅ Response should show:
- Receipt status: "approved" ✅
- Investment status: "active" ✅
- User balance updated ✅

## In Browser

### User Side
1. Go to http://localhost:3000/pages/invest.html
2. Click "INVEST NOW" on Starlink
3. Enter amount: 500
4. Select payment: USDT (Ethereum)
5. Copy wallet address
6. **Upload receipt image** ✅
7. Enter transaction ID: 0xABC123
8. Click "CONFIRM & SUBMIT"
9. See success message ✅

### Admin Side
1. Go to http://localhost:3000/pages/admin.html
2. Login: admin@teslainvest.com / Admin12345!
3. See "1 PENDING" badge ✅
4. See receipt with user name ✅
5. Click proof icon to view image ✅
6. Click APPROVE
7. See status change to APPROVED ✅

## What's Fixed

| Issue | Before | After |
|-------|--------|-------|
| File Upload | ❌ None | ✅ JPG/PNG/PDF |
| Admin Sees Deposits | ❌ Empty | ✅ Full list |
| User Names | ❌ Blank | ✅ "Test User" |
| Returns | 105%, 140%, 200% | **✅ 200%, 300%, 300%** |
| Proof Storage | ❌ None | ✅ /uploads/ |
| Balance Update | ❌ Manual | ✅ Auto on approval |

## File Upload Details

### Supported Types
- JPG ✅
- PNG ✅
- PDF ✅

### Where Files Stored
- `backend/uploads/` directory
- Filename: `proof_{userId}_{timestamp}.{ext}`
- URL: `http://localhost:8000/uploads/proof_...`

### Database Storage
```javascript
PaymentReceipt {
  proofUrl: "/uploads/proof_6a1757a4_1779914423.jpg",
  ...
}
```

## Troubleshooting

### Files not saving?
```bash
# Check if uploads directory exists
ls -la /Users/ppp/Documents/investment\ site/backend/uploads/

# Should see files like:
# proof_6a1757a4_1779914423.jpg
# proof_6a173370_1779914427.jpg
```

### Admin can't see deposits?
1. Check admin has isAdmin: true in MongoDB
2. Check token is valid (not expired)
3. Check /api/admin/pending-receipts returns data

### Proof not uploading?
1. Check proofBase64 is not empty
2. Check proofFileName is included
3. Check backend logs for file save errors

## Success Indicators

✅ **User submits investment:**
```
Alert: "✅ Investment of $500 submitted for approval!"
Then redirects to dashboard
```

✅ **Admin sees deposit:**
```
Table shows:
- User name: "Test User"
- Amount: $500
- Status: Pending
- Proof icon visible
```

✅ **Admin approves:**
```
Toast: "✅ Receipt approved. Investment activated!"
Status changes to "APPROVED"
```

## Current Test Results

```
✅ User registered
✅ Investment created ($500 → $1000 expected return - correct 2x)
✅ Receipt submitted with proof file
✅ Admin can fetch receipts
✅ Admin sees 1 PENDING
✅ Admin sees user name, amount, proof
✅ Admin approves successfully
✅ Status changes to APPROVED
```

## Ready For Production ✅

All tests passing. System is working correctly.
Users can deposit with proof verification.
Admin can approve and activate investments.
Balances update automatically.

🚀 Deploy with confidence!
