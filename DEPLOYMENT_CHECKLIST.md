# Vercel Deployment Checklist

## Pre-Deployment ✅

- [ ] **Git Setup**
  - [ ] `git init` (if new)
  - [ ] `git add .`
  - [ ] `git commit -m "Initial commit"`
  - [ ] Push to GitHub

- [ ] **Environment Variables**
  - [ ] MongoDB Atlas connection string ready
  - [ ] JWT secret generated: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - [ ] Frontend URL determined

- [ ] **Code Review**
  - [ ] `vercel.json` exists
  - [ ] `.env.example` has all required variables
  - [ ] `backend/api/index.js` exists
  - [ ] `package.json` files are correct

## Deployment Steps 🚀

### Quick Deploy (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Navigate to project
cd "/Users/ppp/Documents/investment site"

# 3. Deploy
vercel --prod
```

### Or Deploy via GitHub

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select your repository
5. Click "Deploy"

## Post-Deployment Configuration

- [ ] **Set Environment Variables in Vercel Dashboard**
  ```
  MONGODB_URI = <your-mongodb-connection-string>
  JWT_SECRET = <your-generated-secret>
  FRONTEND_URL = https://<your-project>.vercel.app
  ```

- [ ] **Add MongoDB IP Whitelist**
  - Go to MongoDB Atlas
  - Add `0.0.0.0/0` to Network Access (or Vercel's IP range)

- [ ] **Update Frontend API URL** (if needed)
  - Search for `http://localhost:8000` in your code
  - Replace with `/api` (relative path)

## Testing 🧪

- [ ] Visit homepage: `https://<your-project>.vercel.app`
- [ ] Test login/signup
- [ ] Test investment creation
- [ ] Test payment form
- [ ] Check console for errors
- [ ] Verify all images load

## Monitoring 📊

- [ ] Check Vercel Dashboard → Deployments
- [ ] View logs: `vercel logs --follow`
- [ ] Monitor MongoDB Atlas activity
- [ ] Set up alerts (optional)

## Troubleshooting

**Issue: 502 Bad Gateway**
```bash
# Check logs
vercel logs

# Verify environment variables
# Check MongoDB connection
# Restart deployment
vercel --prod
```

**Issue: CORS Errors**
```bash
# Verify FRONTEND_URL matches your Vercel URL
# Update in Vercel Dashboard → Settings → Environment Variables
```

**Issue: Can't connect to MongoDB**
```bash
# Verify connection string
# Add Vercel IP to MongoDB Atlas whitelist
# Check MongoDB Atlas is accessible from internet
```

## Useful Commands

```bash
# View current deployments
vercel list

# View logs in real-time
vercel logs --follow

# Rollback to previous deployment
vercel rollback

# Remove a deployment
vercel remove <url>

# View deployment preview
vercel preview <url>
```

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | ✅ Yes |
| `JWT_SECRET` | `a1b2c3d4e5f6g7h8...` | ✅ Yes |
| `FRONTEND_URL` | `https://teslainvest.vercel.app` | ✅ Yes |
| `NODE_ENV` | `production` | No |
| `PORT` | `8000` | No |

## Success Criteria

✅ App loads without errors  
✅ Can navigate all pages  
✅ Login/Signup works  
✅ Can create investments  
✅ Dashboard shows investments  
✅ API endpoints respond  
✅ MongoDB saves data  
✅ No console errors  

## Important URLs

- **Live App**: `https://<your-project>.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **MongoDB Atlas**: `https://www.mongodb.com/cloud/atlas`
- **GitHub**: `https://github.com/YOUR_USERNAME/investment-site`

## Support

- Vercel Docs: https://vercel.com/docs
- Express Guide: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- Discord: https://vercel.com/chat

---

**Ready to deploy?** 🚀

Run: `vercel --prod`
