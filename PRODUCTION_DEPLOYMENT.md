# Production Deployment Guide

## Pre-Deployment Checklist

### MongoDB Atlas Setup
- [ ] Create production MongoDB cluster
- [ ] Set strong password (30+ characters, mixed case, numbers, symbols)
- [ ] Enable authentication
- [ ] Add production server IP to Network Access whitelist
- [ ] Enable automatic backups
- [ ] Set backup retention to 30+ days
- [ ] Enable IP Allowlist only mode (no 0.0.0.0/0)

### Environment Variables
- [ ] Create `.env` file with production credentials
- [ ] Generate strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS frontend URL
- [ ] Never commit `.env` to git

### Security
- [ ] Update `.gitignore` to exclude `.env`
- [ ] Enable HTTPS on frontend
- [ ] Use strong admin password (20+ characters)
- [ ] Enable rate limiting on API endpoints
- [ ] Add request size limits
- [ ] Add CORS restrictions to specific domain

### Backend Configuration
```bash
# Example production .env
NODE_ENV=production
MONGODB_URI=mongodb+srv://produser:Password123@cluster.mongodb.net/production
JWT_SECRET=your_generated_random_string_here
PORT=8000
FRONTEND_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### Deployment Steps

**1. On Your Server (Linux/macOS)**
```bash
cd /home/app/investment-site/backend
npm install --production
```

**2. Use Process Manager (PM2)**
```bash
npm install -g pm2
pm2 start server.js --name "investment-api" --env production
pm2 save
pm2 startup
```

**3. Enable Auto-Restart**
```bash
pm2 restart all --env production
```

**4. Monitor Logs**
```bash
pm2 logs investment-api
```

### Nginx Reverse Proxy (Recommended)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Certificate (Let's Encrypt)
```bash
sudo certbot certonly --nginx -d api.yourdomain.com
```

### Database Monitoring
- [ ] Set up MongoDB alerts for connection failures
- [ ] Monitor storage usage
- [ ] Monitor query performance
- [ ] Set up automated backups
- [ ] Test backup restoration process

### Logging & Monitoring
- [ ] Install PM2 Plus for monitoring
- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Monitor API response times
- [ ] Alert on high error rates

### Regular Maintenance
- [ ] Review error logs weekly
- [ ] Update npm packages monthly
- [ ] Test disaster recovery quarterly
- [ ] Review security logs monthly
- [ ] Rotate JWT_SECRET periodically (with grace period)

## Troubleshooting Production Issues

### MongoDB Connection Fails
1. Verify server IP is whitelisted in Atlas
2. Check network connectivity: `telnet cluster.mongodb.net 27017`
3. Verify credentials in .env file
4. Check MongoDB Atlas status page

### High Memory Usage
1. Restart PM2: `pm2 restart all`
2. Check for memory leaks in code
3. Monitor with: `pm2 monit`

### Slow API Responses
1. Add database indexes
2. Review slow query logs
3. Implement caching (Redis)
4. Optimize MongoDB queries

## Rollback Procedure
```bash
# If deployment fails:
pm2 restart investment-api
pm2 revert  # Reverts to previous ecosystem
```
