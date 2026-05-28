// Test the investment flow
const token = 'test-token'; // Would be real JWT in production

// Test 1: Check what invest.html sends
console.log('=== invest.html completeInvestment() ===');
const packageId = 'starlink';
const amount = 100;
const txid = '0xABC123';
const walletType = 'usdt_eth';

console.log('Step 1: Calls POST /api/investments with:');
console.log({
  packageId,
  amount: parseFloat(amount)
});

console.log('\nStep 2: Expects response:');
console.log({
  success: true,
  investment: {
    id: 'mongodb-id',
    packageId,
    amount,
    status: 'pending_payment'
  }
});

console.log('\nStep 3: Then calls POST /api/payments/receipt with:');
console.log({
  investmentId: 'mongodb-id', // From step 2
  amount: parseFloat(amount),
  walletType,
  transactionId: txid
});

console.log('\n=== Backend check ===');
console.log('Issue 1: Backend /api/investments returns wrong multipliers');
console.log('  Expected: returnPercent based on MULTIPLIER (2x=200%, 3x=300%)');
console.log('  Actually returns: 105%, 140%, 200% (OLD VALUES)');

console.log('\nIssue 2: invest.html checks for data.investment.id');
console.log('  Backend returns: investment.id (should be OK)');

console.log('\nIssue 3: Admin endpoint /api/admin/pending-receipts');
console.log('  Needs to populate with correct userName');
console.log('  Current code uses .populate(\'userId\', \'name\')');
