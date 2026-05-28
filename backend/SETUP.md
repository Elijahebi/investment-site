# 🚀 TeslaInvest Backend Setup Guide

## Prerequisites

- Node.js (v14+) - Download from https://nodejs.org/
- MongoDB Atlas Account (FREE) - https://www.mongodb.com/cloud/atlas
- Git (optional, for version control)

## Step 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create MongoDB Atlas Cluster

1. Go to https://cloud.mongodb.com/
2. Sign up or Log in with Google/GitHub
3. Click "Create" → Select "Shared Cluster" (Free tier)
4. Choose region closest to you (e.g., US East for North America)
5. Click "Create Cluster" and wait ~2-3 minutes

### 1.2 Create Database User

1. In left sidebar, click "Security" → "Database Access"
2. Click "+ ADD NEW DATABASE USER"
3. Set username: `teslainvest`
4. Set password: (create a strong password, save it!)
5. Click "Add User"

### 1.3 Get Connection String

1. In left sidebar, click "Deployment" → "Database"
2. Click "Connect" button on your cluster
3. Choose "Drivers"
4. Copy the connection string (it looks like):
   ```
   mongodb+srv://teslainvest:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `PASSWORD` with your actual password from Step 1.2**

### 1.4 Add IP Whitelist (Important!)

1. Click "Network Access" in left sidebar
2. Click "+ ADD IP ADDRESS"
3. For development: Click "ADD CURRENT IP ADDRESS"
4. For production: Add your server IP
5. Click "Confirm"

## Step 2: Backend Setup (10 minutes)

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web framework
- `mongoose` - MongoDB ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables

### 2.2 Create .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```
   MONGODB_URI=mongodb+srv://teslainvest:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/teslainvest?retryWrites=true&w=majority
   JWT_SECRET=super-secret-random-key-at-least-32-chars
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

### 2.3 Start Backend Server

```bash
npm start
```

You should see:
```
✅ MongoDB Atlas Connected
🚀 TeslaInvest Backend Server running on port 5000
📍 API: http://localhost:5000/api
```

**Keep this terminal open!**

## Step 3: Update Frontend API URL

In `app.js`, update the API base URL:

```javascript
const StorageManager = {
  apiUrl: 'http://localhost:5000/api',  // ← Update this
```

## Step 4: Test API

Open browser and visit: http://localhost:5000/api/health

You should see:
```json
{ "status": "ok", "message": "TeslaInvest API is running" }
```

## Step 5: Create Admin User

Run this in MongoDB Atlas Console:

1. Go to MongoDB Atlas → Your Cluster
2. Click "Collections" tab
3. In the `users` collection, add a document:

```json
{
  "name": "Admin User",
  "email": "admin@tesla.com",
  "passwordHash": "$2a$10$...", // bcrypt hash of "admin123"
  "isAdmin": true,
  "activeBalance": 0,
  "totalInvested": 0,
  "createdAt": {"$date": "2026-05-27T00:00:00Z"},
  "updatedAt": {"$date": "2026-05-27T00:00:00Z"}
}
```

**OR** use this Node.js script:

```javascript
// save as: create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  isAdmin: Boolean,
  activeBalance: Number,
  totalInvested: Number,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  
  await User.create({
    name: 'Admin User',
    email: 'admin@tesla.com',
    passwordHash: hash,
    isAdmin: true,
    activeBalance: 0,
    totalInvested: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('✅ Admin user created!');
  mongoose.disconnect();
});
```

Run it:
```bash
node create-admin.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Investments
- `POST /api/investments` - Create investment
- `GET /api/investments` - Get user's investments

### Payments
- `POST /api/payments/receipt` - Submit payment receipt
- `GET /api/payments/receipts` - Get user's receipts
- `GET /api/admin/pending-receipts` - Admin: Get pending receipts
- `POST /api/admin/approve-receipt/:receiptId` - Admin: Approve receipt
- `POST /api/admin/reject-receipt/:receiptId` - Admin: Reject receipt

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/stats` - Get dashboard stats

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/overview` - Get overview stats

## Troubleshooting

### "Cannot connect to MongoDB"
- ✅ Check MongoDB URI in `.env`
- ✅ Check MongoDB password is correct
- ✅ Check IP address is whitelisted in Network Access
- ✅ Check internet connection

### "PORT 5000 already in use"
```bash
# Kill the process using port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "JWT_SECRET is required"
- Edit `.env` and add a long random string for `JWT_SECRET`

### Admin login not working
- Make sure admin user was created correctly
- Check password hash is valid bcrypt format
- Use the create-admin.js script to create it properly

## Deployment to Production

### Using Heroku

```bash
# Install Heroku CLI
# Then:

heroku login
heroku create teslainvest-api
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-secret-key"
git push heroku main
```

### Using AWS/DigitalOcean/Render

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables in dashboard
4. Deploy!

## Security Checklist

- ✅ Use strong `JWT_SECRET` (32+ characters)
- ✅ Use strong database password
- ✅ Enable HTTPS in production
- ✅ Add rate limiting
- ✅ Add input validation
- ✅ Add CORS restrictions for production
- ✅ Enable MongoDB authentication
- ✅ Use environment variables for secrets
- ✅ Add CSRF protection
- ✅ Add request logging

## Next Steps

1. Update `app.js` frontend code to use new API endpoints
2. Replace localStorage with API calls
3. Test full workflow: Register → Invest → Submit Receipt → Admin Approve
4. Deploy to production server
5. Set up email notifications (optional)
6. Add payment verification (blockchain API)

## Support

For MongoDB issues: https://docs.mongodb.com/  
For Express issues: https://expressjs.com/  
For JWT issues: https://jwt.io/

---

**Backend is now ready!** 🎉

Next: Update frontend `app.js` to use the API instead of localStorage.
