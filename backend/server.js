/**
 * TeslaInvest Platform - Node.js/Express Backend
 * MongoDB Atlas Integration for users, investments, payments
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// MONGODB CONNECTION WITH RETRY LOGIC
// ============================================================================

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Atlas Connected');
    return true;
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️  MongoDB Connection failed. Retrying in 5 seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    } else {
      console.error('❌ MongoDB Connection Error (all retries exhausted):', err.message);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1); // Exit in production if DB is down
      }
      return false;
    }
  }
};

connectDB();

// ============================================================================
// MONGODB SCHEMAS
// ============================================================================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  activeBalance: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Investment Schema
const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  packageId: { type: String, required: true }, // 'starlink', 'cybercab', 'mars-colony'
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending_payment', 'pending_review', 'active', 'completed', 'rejected'], default: 'pending_payment' },
  expectedReturn: { type: Number, required: true },
  startDate: { type: Date },
  maturityDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Payment Receipt Schema
const paymentReceiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
  amount: { type: Number, required: true },
  walletType: { type: String, enum: ['bitcoin', 'ethereum', 'usdt_eth', 'usdt_tron'], required: true },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' },
  proofUrl: { type: String }, // URL to uploaded proof/screenshot
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
});

// Activity Log Schema - Tracks ALL user actions
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  userName: { type: String },
  actionType: { type: String, enum: ['deposit', 'investment', 'withdrawal', 'login', 'registration', 'profile_update'], required: true },
  description: { type: String, required: true },
  amount: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  metadata: { type: Object }, // Additional data like packageId, walletType, etc
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const PaymentReceipt = mongoose.model('PaymentReceipt', paymentReceiptSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Missing email or password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        activeBalance: user.activeBalance,
        totalInvested: user.totalInvested,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), isAdmin: true });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: true },
      token
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Admin login failed' });
  }
});

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// ============================================================================
// INVESTMENT ENDPOINTS
// ============================================================================

// Create Investment
app.post('/api/investments', verifyToken, async (req, res) => {
  try {
    const { packageId, amount } = req.body;

    if (!packageId || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get package details (from frontend config)
    // CORRECTED: Using actual multipliers (2x = 200%, 3x = 300%, 4x = 400%)
    const packages = {
      'starlink': { duration: 30, multiplier: 2, returnPercent: 200 },
      'cybercab': { duration: 90, multiplier: 3, returnPercent: 300 },
      'mars-colony': { duration: 180, multiplier: 4, returnPercent: 400 }
    };

    const pkg = packages[packageId];
    if (!pkg) {
      return res.status(400).json({ success: false, error: 'Invalid package' });
    }

    const expectedReturn = amount * (pkg.returnPercent / 100);
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + pkg.duration);

    const investment = new Investment({
      userId: user._id,
      userEmail: user.email,
      packageId,
      amount,
      expectedReturn,
      maturityDate,
      status: 'pending_payment'
    });

    await investment.save();

    res.status(201).json({
      success: true,
      investment: {
        id: investment._id,
        packageId: investment.packageId,
        amount: investment.amount,
        expectedReturn: investment.expectedReturn,
        status: investment.status,
        maturityDate: investment.maturityDate
      }
    });
  } catch (err) {
    console.error('Create investment error:', err);
    res.status(500).json({ success: false, error: 'Failed to create investment' });
  }
});

// Get User Investments
app.get('/api/investments', verifyToken, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.userId });
    res.json({ success: true, investments });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch investments' });
  }
});

// ============================================================================
// PAYMENT RECEIPT ENDPOINTS
// ============================================================================

// Create Payment Receipt
app.post('/api/payments/receipt', verifyToken, async (req, res) => {
  try {
    const { investmentId, amount, walletType, transactionId, proofBase64, proofFileName } = req.body;

    if (!investmentId || !amount || !walletType || !transactionId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const investment = await Investment.findById(investmentId);
    if (!investment || investment.userId.toString() !== req.user.userId) {
      return res.status(404).json({ success: false, error: 'Investment not found' });
    }

    // Check if receipt already exists for this transaction
    const existingReceipt = await PaymentReceipt.findOne({ transactionId });
    if (existingReceipt) {
      return res.status(409).json({ success: false, error: 'Transaction ID already submitted' });
    }

    const user = await User.findById(req.user.userId);
    
    // Handle file upload - save to temp directory or cloud storage
    let proofUrl = null;
    if (proofBase64 && proofFileName) {
      try {
        // For now, store the base64 data directly or use a simple file storage
        // In production, use cloud storage like AWS S3, Cloudinary, etc.
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir);
        }
        
        // Generate filename with timestamp
        const timestamp = Date.now();
        const fileExt = proofFileName.split('.').pop();
        const filename = `proof_${user._id}_${timestamp}.${fileExt}`;
        const filepath = path.join(uploadsDir, filename);
        
        // Convert base64 to buffer and save
        const base64Data = proofBase64.replace(/^data:image\/\w+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
        
        // Store relative URL for later retrieval
        proofUrl = `/uploads/${filename}`;
      } catch (fileErr) {
        console.error('File upload error:', fileErr);
        // Continue without proof - it's optional
      }
    }

    const receipt = new PaymentReceipt({
      userId: user._id,
      userEmail: user.email,
      investmentId,
      amount,
      walletType,
      transactionId,
      status: 'pending_review',
      proofUrl: proofUrl // Store proof URL if uploaded
    });

    await receipt.save();

    // Update investment status
    await Investment.findByIdAndUpdate(investmentId, {
      status: 'pending_review'
    });

    // Log activity - User submitted deposit
    await ActivityLog.create({
      userId: user._id,
      userEmail: user.email,
      userName: user.name,
      actionType: 'deposit',
      description: `Deposit of $${amount} submitted via ${walletType} (TX: ${transactionId})${proofUrl ? ' with proof' : ''}`,
      amount: amount,
      status: 'pending',
      metadata: { receiptId: receipt._id, transactionId, walletType, investmentId, proofUrl }
    });

    res.status(201).json({
      success: true,
      receipt: {
        id: receipt._id,
        transactionId: receipt.transactionId,
        status: receipt.status,
        submittedAt: receipt.submittedAt,
        proofUrl: receipt.proofUrl
      }
    });
  } catch (err) {
    console.error('Create receipt error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit receipt' });
  }
});

// Get User Payment Receipts
app.get('/api/payments/receipts', verifyToken, async (req, res) => {
  try {
    const receipts = await PaymentReceipt.find({ userId: req.user.userId });
    res.json({ success: true, receipts });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
});

// Admin: Get All Pending Receipts
app.get('/api/admin/pending-receipts', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // Get all receipts with pending_review status and populate user name
    const receipts = await PaymentReceipt.find({ status: 'pending_review' }).populate('userId', 'name');
    
    // Add userName to each receipt
    const receiptsWithNames = receipts.map(r => ({
      ...r.toObject(),
      userName: r.userId?.name || 'Unknown User'
    }));
    
    res.json({ success: true, receipts: receiptsWithNames });
  } catch (err) {
    console.error('Fetch receipts error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
});

// Admin: Approve Receipt
app.post('/api/admin/approve-receipt/:receiptId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const receipt = await PaymentReceipt.findByIdAndUpdate(
      req.params.receiptId,
      {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: req.user.userId
      },
      { new: true }
    );

    if (!receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    // Update investment status
    const investment = await Investment.findByIdAndUpdate(
      receipt.investmentId,
      { status: 'active', startDate: new Date() },
      { new: true }
    );

    // Update user active balance
    const investmentUser = await User.findByIdAndUpdate(
      receipt.userId,
      {
        $inc: {
          activeBalance: receipt.amount,
          totalInvested: receipt.amount
        }
      },
      { new: true }
    );

    // Log activity
    await ActivityLog.create({
      userId: receipt.userId,
      userEmail: receipt.userEmail,
      userName: investmentUser.name,
      actionType: 'deposit',
      description: `Deposit of $${receipt.amount} approved (TX: ${receipt.transactionId})`,
      amount: receipt.amount,
      status: 'approved',
      metadata: { receiptId: receipt._id, transactionId: receipt.transactionId, walletType: receipt.walletType }
    });

    res.json({
      success: true,
      message: 'Receipt approved and investment activated',
      receipt
    });
  } catch (err) {
    console.error('Approve receipt error:', err);
    res.status(500).json({ success: false, error: 'Failed to approve receipt' });
  }
});

// Admin: Reject Receipt
app.post('/api/admin/reject-receipt/:receiptId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const receipt = await PaymentReceipt.findByIdAndUpdate(
      req.params.receiptId,
      {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: req.user.userId,
        notes: req.body.notes || 'Rejected by admin'
      },
      { new: true }
    );

    if (!receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }

    // Delete corresponding investment
    await Investment.findByIdAndDelete(receipt.investmentId);

    // Get user for name
    const rejectedUser = await User.findById(receipt.userId);

    // Log activity
    await ActivityLog.create({
      userId: receipt.userId,
      userEmail: receipt.userEmail,
      userName: rejectedUser.name,
      actionType: 'deposit',
      description: `Deposit of $${receipt.amount} rejected (TX: ${receipt.transactionId})`,
      amount: receipt.amount,
      status: 'rejected',
      metadata: { receiptId: receipt._id, transactionId: receipt.transactionId, walletType: receipt.walletType, notes: req.body.notes }
    });

    res.json({
      success: true,
      message: 'Receipt rejected and investment deleted',
      receipt
    });
  } catch (err) {
    console.error('Reject receipt error:', err);
    res.status(500).json({ success: false, error: 'Failed to reject receipt' });
  }
});

// Admin: Get ALL Receipts (pending + approved + rejected)
app.get('/api/admin/all-receipts', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // Get all receipts and populate user name
    const receipts = await PaymentReceipt.find({}).populate('userId', 'name').sort({ submittedAt: -1 });
    
    // Add userName to each receipt
    const receiptsWithNames = receipts.map(r => ({
      ...r.toObject(),
      userName: r.userId?.name || 'Unknown User'
    }));
    
    res.json({ success: true, receipts: receiptsWithNames });
  } catch (err) {
    console.error('Fetch all receipts error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
});

// ============================================================================
// USER ENDPOINTS
// ============================================================================

// Get User Profile
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Get User Dashboard Stats
app.get('/api/user/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const investments = await Investment.find({ userId: req.user.userId });
    const receipts = await PaymentReceipt.find({ userId: req.user.userId });

    const activeInvestments = investments.filter(i => i.status === 'active');
    const pendingReceipts = receipts.filter(r => r.status === 'pending_review');
    const approvedReceipts = receipts.filter(r => r.status === 'approved');

    // Calculate active balance from approved receipts
    const activeBalance = approvedReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // Calculate total invested from all receipts
    const totalInvested = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // Calculate expected profit (2x return for most packages)
    const totalProfit = activeBalance; // If invested $X and get 2x, profit = $X

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        activeBalance: activeBalance,
        totalInvested: totalInvested,
        totalProfit: totalProfit,
        pendingCount: pendingReceipts.length,
        activeCount: activeInvestments.length
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// Admin: Get All Users
app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const users = await User.find({ isAdmin: false }).select('-passwordHash');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Admin: Get Overview Stats
app.get('/api/admin/overview', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const userCount = await User.countDocuments({ isAdmin: false });
    const pendingReceipts = await PaymentReceipt.countDocuments({ status: 'pending_review' });
    const totalInvested = await Investment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        userCount,
        pendingCount: pendingReceipts,
        totalInvested: totalInvested[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch overview' });
  }
});

// Admin: Get All Activity Logs (Deposits, Investments, Withdrawals)
app.get('/api/admin/activity-logs', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // Get limit and skip from query params for pagination
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const skip = parseInt(req.query.skip) || 0;
    const filter = req.query.type ? { actionType: req.query.type } : {};

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('userId', 'name email');

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      success: true,
      logs,
      total,
      limit,
      skip
    });
  } catch (err) {
    console.error('Fetch activity logs error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
  }
});

// Admin: Get Pending Deposits (Activity logs with status pending + actionType deposit)
app.get('/api/admin/pending-deposits', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // Get pending receipts with user details
    const receipts = await PaymentReceipt.find({ status: 'pending_review' })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      deposits: receipts.map(r => ({
        id: r._id,
        userId: r.userId._id,
        userName: r.userId.name,
        userEmail: r.userEmail,
        amount: r.amount,
        walletType: r.walletType,
        transactionId: r.transactionId,
        status: r.status,
        submittedAt: r.submittedAt,
        metadata: r.proofUrl
      }))
    });
  } catch (err) {
    console.error('Fetch pending deposits error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending deposits' });
  }
});

// Admin: Get All Investments (With user details)
app.get('/api/admin/all-investments', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const investments = await Investment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      investments: investments.map(i => ({
        id: i._id,
        userId: i.userId._id,
        userName: i.userId.name,
        userEmail: i.userEmail,
        packageId: i.packageId,
        amount: i.amount,
        expectedReturn: i.expectedReturn,
        status: i.status,
        startDate: i.startDate,
        maturityDate: i.maturityDate,
        createdAt: i.createdAt
      }))
    });
  } catch (err) {
    console.error('Fetch investments error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch investments' });
  }
});

// ============================================================================
// SEED ADMIN USER (Setup)
// ============================================================================

app.post('/api/seed-admin', async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@teslainvest.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin12345!';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      return res.json({ success: true, message: 'Admin user already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await User.create({
      name: 'Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash,
      isAdmin: true,
      activeBalance: 0,
      totalInvested: 0
    });

    res.json({
      success: true,
      message: 'Admin user created successfully',
      admin: { id: admin._id, email: admin.email, name: admin.name, isAdmin: admin.isAdmin }
    });
  } catch (err) {
    console.error('Seed admin error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TeslaInvest API is running' });
});

// ============================================================================
// SERVE UPLOADED FILES
// ============================================================================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================================
// SERVER START
// ============================================================================

const PORT = process.env.PORT || 8000;

// Start the server - always listen, regardless of environment
app.listen(PORT, () => {
  console.log(`\n🚀 TeslaInvest Backend Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`✅ CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
});

// Public: Get Recent Activity Feed (for homepage)
app.get('/api/public/activity-feed', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email country');

    const activities = logs.map(log => ({
      id: log._id,
      name: log.userId?.name || 'Anonymous Investor',
      location: log.userId?.country || 'Global',
      amount: log.amount ? `$${log.amount.toLocaleString()}` : '$0',
      action: log.actionType === 'deposit' ? 'invested' : 
              log.actionType === 'investment' ? 'started investment in ' + (log.investmentType || 'our plans') :
              log.actionType === 'withdrawal' ? 'withdrew profits' : 'took action',
      timestamp: log.createdAt
    }));

    res.json({
      success: true,
      activities
    });
  } catch (err) {
    console.error('Fetch activity feed error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch activity feed' });
  }
});

module.exports = app;
