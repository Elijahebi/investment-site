#!/bin/bash
# TeslaInvest Platform - Quick Start Script

echo "🚀 TeslaInvest Platform - Quick Setup"
echo "======================================"

# Kill any existing backend process
echo "🔄 Cleaning up old processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# Start backend in background
echo "⏳ Starting backend server..."
cd /Users/ppp/Documents/investment\ site/backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 3

# Check health
echo "🏥 Checking backend health..."
HEALTH=$(curl -s http://localhost:8000/api/health)
if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend health check failed"
  exit 1
fi

# Seed admin user
echo "👤 Creating admin user in MongoDB..."
SEED=$(curl -X POST http://localhost:8000/api/seed-admin \
  -H "Content-Type: application/json" 2>/dev/null)

if echo "$SEED" | grep -q "success"; then
  echo "✅ Admin user created/verified"
else
  echo "⚠️  Could not verify admin user"
fi

# Show success message
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP COMPLETE                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 ACCESS POINTS:"
echo "  • Frontend: http://localhost:3000/pages/index.html"
echo "  • Admin:    http://localhost:3000/pages/admin.html"
echo "  • Backend:  http://localhost:8000"
echo ""
echo "👤 ADMIN CREDENTIALS:"
echo "  • Email:    admin@teslainvest.com"
echo "  • Password: Admin12345!"
echo ""
echo "✨ The backend is running in the background"
echo "   To check logs: cat /tmp/backend.log"
echo "   To stop: lsof -ti:8000 | xargs kill -9"
echo ""
