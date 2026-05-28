# Vercel Deployment Guide for TeslaInvest

## Step 1: Prepare Your Project

Make sure you have:
- [ ] Git repository initialized (`git init` if needed)
- [ ] All files committed (`git add .` and `git commit`)
- [ ] `.env.example` file with all required variables
- [ ] Node.js and npm installed locally

## Step 2: Create Git Repository

If you haven't already:

```bash
cd "/Users/ppp/Documents/investment site"
git init
git add .
git commit -m "Initial commit - TeslaInvest deployment"
git branch -M main
```

## Step 3: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/investment-site.git
git push -u origin main
```

## Step 4: Deploy on Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd "/Users/ppp/Documents/investment site"
vercel
```

Follow the prompts:
- Link to existing project or create new one
- Set project name (e.g., "teslainvest")
- Choose "Other" as framework
- Root directory: `./` (default)

### Option B: Using Vercel Web Dashboard

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm install && cd backend && npm install`
   - **Output Directory**: `pages` (or leave empty)

## Step 5: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/teslainvest?retryWrites=true&w=majority
JWT_SECRET = your_generated_jwt_secret_here
FRONTEND_URL = https://your-project.vercel.app
NODE_ENV = production
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Update CORS in Backend

After deployment, update your frontend URL in the dashboard.

## Step 7: Test Deployment

1. Visit your Vercel URL
2. Test login functionality
3. Test investment creation
4. Verify API calls work correctly

## Project Structure for Vercel

```
investment-site/
├── pages/                 # Frontend static files
│   ├── index.html
│   ├── dashboard.html
│   ├── login.html
│   ├── packages.html
│   └── admin.html
├── backend/
│   ├── server.js         # Express app
│   ├── api/
│   │   └── index.js      # Vercel serverless function
│   └── package.json
├── app.js                # Frontend JavaScript
├── vercel.json          # Vercel configuration
├── .env.example         # Environment template
├── .gitignore           # Git ignore file
└── package.json         # Root package.json (optional)
```

## Important Notes

### API Endpoints After Deployment
Your API will be available at:
```
https://your-project.vercel.app/api/...
```

Update your frontend API calls if needed:
- Current: `http://localhost:8000/api/...`
- After deployment: `/api/...` (relative URL)

### MongoDB Atlas
- Ensure MongoDB Atlas connection string is correct
- Add Vercel IP to whitelist in MongoDB Atlas:
  1. Go to MongoDB Atlas → Cluster → Network Access
  2. Add IP address `0.0.0.0/0` (allows all, or use Vercel's IPs)

### Serverless Function Limitations
- Maximum execution time: 60 seconds (Pro: 900 seconds)
- Cold start delays may occur
- Some modules may not work in serverless environment

## Troubleshooting

### 502 Bad Gateway
- Check MongoDB connection string
- Check environment variables are set
- Check server.js exports the app correctly

### CORS Errors
- Verify FRONTEND_URL in environment variables
- Check CORS origin in server.js matches frontend URL

### Deployment Fails
- Check `vercel logs` output
- Ensure all dependencies in `package.json`
- Run `npm install` locally to verify

## View Logs

```bash
# Using Vercel CLI
vercel logs

# Or visit Vercel Dashboard → Deployments → Runtime Logs
```

## Rollback

If something breaks after deployment:
```bash
vercel rollback
```

## Custom Domain

To add custom domain:
1. Vercel Dashboard → Project Settings → Domains
2. Add your domain
3. Update DNS settings with Vercel nameservers

## Next Steps

After successful deployment:
- [ ] Test all user flows
- [ ] Monitor error logs
- [ ] Set up analytics
- [ ] Configure email notifications
- [ ] Add custom domain (optional)
- [ ] Enable preview deployments for branches

---

**Need help?**
- Vercel Docs: https://vercel.com/docs
- Express Deployment: https://expressjs.com/en/advanced/best-practice-performance.html
- MongoDB Atlas: https://docs.atlas.mongodb.com/
