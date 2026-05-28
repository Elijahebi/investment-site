# 🚀 Quick Start - Deploy to Vercel in 5 Minutes

## Step 1: Update API URLs (1 minute)

```bash
# Replace all localhost:8000 references
sed -i '' 's|http://localhost:8000/api|/api|g' app.js
sed -i '' 's|http://localhost:8000/api|/api|g' pages/*.html
```

**Or manually find & replace in your code:**
- Find: `http://localhost:8000/api`
- Replace: `/api`

## Step 2: Git Setup (1 minute)

```bash
# Navigate to project
cd "/Users/ppp/Documents/investment site"

# Initialize Git if needed
git init

# Commit changes
git add .
git commit -m "Prepare for Vercel deployment"

# Create main branch
git branch -M main
```

## Step 3: Create GitHub Repository (1 minute)

1. Go to https://github.com/new
2. Create repository named `investment-site`
3. Copy the commands and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/investment-site.git
git push -u origin main
```

## Step 4: Deploy to Vercel (1 minute)

```bash
# Install Vercel CLI globally (one-time)
npm install -g vercel

# Deploy
vercel --prod
```

Choose these options when prompted:
- **Use Vercel for Git?** → `Y`
- **Which Git scope?** → Your GitHub account
- **Link to existing project?** → `N` (create new)
- **Project name?** → `teslainvest`
- **Directory?** → `./` (default)

## Step 5: Set Environment Variables (1 minute)

After deployment, go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these three variables:

### Variable 1: MONGODB_URI
```
mongodb+srv://username:password@cluster.mongodb.net/teslainvest?retryWrites=true&w=majority
```

### Variable 2: JWT_SECRET
Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste in Vercel.

### Variable 3: FRONTEND_URL
```
https://teslainvest.vercel.app
```
(Replace `teslainvest` with your actual project name)

After adding all three, **redeploy** your project.

---

## ✅ You're Live!

Visit: `https://your-project-name.vercel.app`

## 🧪 Test Your App

- [ ] Homepage loads
- [ ] Can navigate pages
- [ ] Login works
- [ ] Can create investment
- [ ] Dashboard shows data

## 📋 What Gets Deployed

✅ `pages/` - Your frontend HTML  
✅ `app.js` - Your JavaScript  
✅ `backend/server.js` - Your API  
✅ Environment variables - From Vercel Dashboard  
✅ MongoDB connection - Automatic  

## 🔄 Automatic Deployments

Now every time you push to GitHub:
```bash
git add .
git commit -m "Update message"
git push
```

Your app automatically redeploys! 🎉

## 🚨 If Something Goes Wrong

### Check the logs:
```bash
vercel logs --follow
```

### Common issues:

**502 Bad Gateway**
- Check MongoDB URI is correct
- Check JWT_SECRET is set
- Wait 30 seconds, try again

**CORS Errors**
- Verify FRONTEND_URL in environment variables
- Should match your Vercel URL exactly

**Can't find `/api`**
- Verify API URLs updated to `/api`
- Check `vercel.json` file exists

## 📞 Need More Help?

Read the detailed guides:
- **`VERCEL_DEPLOYMENT.md`** - Full guide
- **`DEPLOYMENT_CHECKLIST.md`** - Reference
- **`API_URL_UPDATE.md`** - API details

---

## 💡 Pro Tips

1. **Use relative URLs** - `/api/...` works everywhere
2. **Test locally first** - Before deploying
3. **Monitor logs** - `vercel logs` shows real-time errors
4. **Redeploy if needed** - `vercel --prod` again
5. **Add custom domain** - Later in Vercel settings

---

**That's it! Your app is now on the internet! 🌍**

Questions? Check the documentation files in your project.
