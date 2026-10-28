const fs = require('fs');

// Mock localStorage with in-memory persistence
let mockStorage = {};
global.localStorage = {
  getItem(k) { return mockStorage[k] !== undefined ? mockStorage[k] : null; },
  setItem(k, v) { mockStorage[k] = String(v); },
  removeItem(k) { delete mockStorage[k]; },
  clear() { mockStorage = {}; }
};

// Load data layer
eval(fs.readFileSync('js/data.js', 'utf8'));

console.log('=== TEST SUITE: VYAPAR AI STORE & WORKFLOWS ===');

// 1. Initial State & Demo Records distinction
console.log('\n--- 1. Testing Demo vs User Records & Safe Init ---');
const initialProducts = VyaparStore.getProducts();
console.log('Default Products Loaded:', initialProducts.length);
const allDemo = initialProducts.every(p => p.isDemo === true);
console.log('All initial products have isDemo: true?', allDemo);
if (!allDemo) throw new Error('Initial products must have isDemo: true');

// 2. Product Management (Add, Edit, Delete)
console.log('\n--- 2. Testing Product Workflows (Add, Edit, Delete) ---');
const newPrd = VyaparStore.addProduct({
  name: 'Test Kissan Mixed Fruit Jam 500g',
  category: 'Snacks & Packaged Food',
  costPrice: 120,
  sellingPrice: 155,
  quantity: 25,
  minStock: 5,
  unit: 'Jar'
});
console.log('Product Added:', newPrd.id, newPrd.name, 'Stock:', newPrd.stock, 'isDemo:', newPrd.isDemo);
if (newPrd.isDemo !== false) throw new Error('User product must have isDemo: false');
if (newPrd.stock !== 25 || newPrd.quantity !== 25) throw new Error('Stock/quantity mismatch');

// Edit Product
const updatedPrd = VyaparStore.updateProduct(newPrd.id, {
  sellingPrice: 160,
  quantity: 30
});
console.log('Product Updated:', updatedPrd.id, 'New SP:', updatedPrd.sellingPrice, 'New Stock:', updatedPrd.stock);
if (updatedPrd.sellingPrice !== 160 || updatedPrd.stock !== 30) throw new Error('Product update failed');

// Search and filter test
const searchMatch = VyaparStore.getProducts().filter(p => p.name.toLowerCase().includes('kissan'));
console.log('Search matches for "kissan":', searchMatch.length);
if (searchMatch.length !== 1) throw new Error('Search failed');

// 3. Sales Workflows (Stock deduction, Insufficient stock rejection, Duplicate prevention)
console.log('\n--- 3. Testing Sales Workflows & Inventory Deductions ---');
const atta = VyaparStore.getProductById('PRD-101');
const attaStockBefore = atta.stock;
console.log('Aashirvaad Atta stock before sale:', attaStockBefore);

// Valid Sale
const customDate = '2026-10-28T14:30:00.000Z';
const sale1 = VyaparStore.recordSale({
  date: customDate,
  customerName: 'Gupta Ji Test',
  paymentMode: 'Cash',
  items: [{ productId: 'PRD-101', name: atta.name, price: atta.sellingPrice, costPrice: atta.costPrice, quantity: 2, subtotal: atta.sellingPrice * 2 }],
  totalAmount: atta.sellingPrice * 2,
  totalCost: atta.costPrice * 2
});
console.log('Sale 1 Recorded:', sale1.id, 'Date:', sale1.date, 'Total:', sale1.totalAmount, 'isDemo:', sale1.isDemo);
const attaStockAfter = VyaparStore.getProductById('PRD-101').stock;
console.log('Aashirvaad Atta stock after sale:', attaStockAfter);
if (attaStockAfter !== attaStockBefore - 2) throw new Error('Inventory was not reduced immediately after sale');
if (sale1.isDemo !== false) throw new Error('User sale must have isDemo: false');

// Reject Sale if stock is insufficient
console.log('\nTesting Insufficient Stock Rejection:');
let rejected = false;
try {
  VyaparStore.recordSale({
    items: [{ productId: 'PRD-101', name: atta.name, price: 425, costPrice: 380, quantity: 999, subtotal: 999 * 425 }],
    totalAmount: 999 * 425
  });
} catch (e) {
  rejected = true;
  console.log('Successfully rejected sale with message:', e.message);
}
if (!rejected) throw new Error('Sale with insufficient stock was NOT rejected!');
const attaStockAfterRejection = VyaparStore.getProductById('PRD-101').stock;
console.log('Atta stock untouched after rejection:', attaStockAfterRejection);
if (attaStockAfterRejection !== attaStockAfter) throw new Error('Stock was incorrectly changed on failed sale!');

// Prevent Duplicate stock deduction
console.log('\nTesting Duplicate Stock Deduction Prevention:');
let duplicateRejected = false;
try {
  VyaparStore.recordSale({
    id: sale1.id, // Reuse exact sale ID
    items: [{ productId: 'PRD-101', name: atta.name, price: 425, costPrice: 380, quantity: 2, subtotal: 850 }],
    totalAmount: 850
  });
} catch (e) {
  duplicateRejected = true;
  console.log('Successfully caught duplicate sale:', e.message);
}
if (!duplicateRejected) throw new Error('Duplicate sale was not prevented!');
const attaStockAfterDup = VyaparStore.getProductById('PRD-101').stock;
console.log('Atta stock after duplicate attempt (no extra deduction):', attaStockAfterDup);
if (attaStockAfterDup !== attaStockAfter) throw new Error('Stock was deducted twice!');

// 4. Expenses Workflows (Record, View, Delete)
console.log('\n--- 4. Testing Expenses (Record, View, Delete) ---');
const expDate = '2026-10-28';
const newExp = VyaparStore.addExpense({
  title: 'Delivery Tempo Cartage Muhana',
  description: 'Delivery Tempo Cartage Muhana',
  amount: 450,
  category: 'Transportation & Freight',
  paymentMode: 'UPI',
  paidTo: 'Raju Tempo',
  date: expDate
});
console.log('Expense Added:', newExp.id, 'Desc:', newExp.description, 'Amount:', newExp.amount, 'Date:', newExp.date, 'isDemo:', newExp.isDemo);
if (newExp.isDemo !== false) throw new Error('User expense must have isDemo: false');

const expensesList = VyaparStore.getExpenses();
const foundExp = expensesList.find(e => e.id === newExp.id);
if (!foundExp) throw new Error('Added expense not found in list');

// Delete expense
VyaparStore.deleteExpense(newExp.id);
const foundAfterDel = VyaparStore.getExpenses().find(e => e.id === newExp.id);
console.log('Expense Deleted successfully?', foundAfterDel === undefined);
if (foundAfterDel !== undefined) throw new Error('Expense deletion failed');

// 5. Persistence across reloads & handling corrupt data
console.log('\n--- 5. Testing Persistence & Corrupt Data Recovery ---');
// Verify user product is still in storage
const reloadedProducts = VyaparStore.getProducts();
const hasUserProduct = reloadedProducts.some(p => p.id === newPrd.id);
console.log('User created product retained across calls?', hasUserProduct);
if (!hasUserProduct) throw new Error('User created product was lost!');

// Inject corrupt data into localStorage
mockStorage['vyapar_products_v1'] = 'CORRUPTED_{INVALID_JSON}';
const recoveredProducts = VyaparStore.getProducts();
console.log('Safely recovered from corrupted products JSON? Count:', recoveredProducts.length);
if (recoveredProducts.length === 0) throw new Error('Corrupt data recovery failed');

// Inject non-array data
mockStorage['vyapar_expenses_v1'] = '{"not":"an array"}';
const recoveredExpenses = VyaparStore.getExpenses();
console.log('Safely recovered from non-array expenses? Count:', recoveredExpenses.length);
if (recoveredExpenses.length === 0) throw new Error('Non-array recovery failed');

// 6. Dashboard Metrics derivation from actual data
console.log('\n--- 6. Testing Dashboard Metrics Consistency ---');
// Re-save clean state
VyaparStore.resetToDefault();
const testUserPrd = VyaparStore.addProduct({
  name: 'User Biscuits Pack',
  costPrice: 20,
  sellingPrice: 25,
  quantity: 50,
  minStock: 10
});
const metrics = VyaparStore.getMetrics();
console.log('Metrics Total Products:', metrics.totalProductsCount);
console.log('User Products Count:', metrics.userProductsCount);
console.log('Demo Products Count:', metrics.demoProductsCount);
console.log('Low Stock Count:', metrics.lowStockCount);
console.log('Today Sales:', metrics.todaySales);
console.log('Month Expenses:', metrics.monthExpenses);

if (metrics.userProductsCount !== 1) throw new Error('User product count in metrics is incorrect');
if (metrics.demoProductsCount !== 20) throw new Error('Demo product count in metrics is incorrect');
if (metrics.totalProductsCount !== 21) throw new Error('Total product count in metrics is incorrect');

console.log('\n>>> ALL UNIT AND INTEGRATION TESTS PASSED WITH 100% SUCCESS! <<<');

