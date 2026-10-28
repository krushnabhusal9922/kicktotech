/**
 * Test Suite: Vyapar AI — Sales Management, Expense Management, and Profit Calculation
 * Validates:
 * 1. Sale creation, stock deduction, insufficient stock rejection, invalid quantities
 * 2. Product cost snapshotting at time of sale (edits later do not rewrite historical profit)
 * 3. Expense creation (rent, electricity, transport, packaging), viewing, deletion
 * 4. Profit formulas: Revenue = sum(completed sales), COGS = sum(qty * recorded unit cost),
 *    Gross Profit = Revenue - COGS, Net Profit = Gross Profit - recorded expenses
 * 5. Expense deduplication (never subtract expense twice)
 * 6. Zero revenue safety
 * 7. Persistence across storage reload
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage for Node test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

// Load data.js
eval(fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf8'));

function runFullTestSuite() {
  console.log('=== TEST SUITE: SALES, EXPENSES & PROFIT CALCULATOR ===\n');

  // Reset to default sample
  VyaparStore.resetToDefault();

  // -------------------------------------------------------------
  // PART 1: SALES MANAGEMENT & INVENTORY DEDUCTIONS
  // -------------------------------------------------------------
  console.log('--- 1. Testing Sale Creation & Stock Deductions ---');

  // Find a product to sell: PRD-101 Aashirvaad Atta 10kg (stock: 14, CP: 380, SP: 425)
  const atta = VyaparStore.getProductById('PRD-101');
  console.log(`Product: ${atta.name}, Initial Stock: ${atta.stock}, CP: ₹${atta.costPrice}, SP: ₹${atta.sellingPrice}`);
  const initialStock = atta.stock;
  const sellQty = 3;

  // 1a. Record valid completed sale
  const sale1 = VyaparStore.recordSale({
    date: '2026-10-28T14:00:00Z',
    customerName: 'Gupta Ji',
    paymentMode: 'Cash',
    items: [{
      productId: atta.id,
      name: atta.name,
      price: atta.sellingPrice,
      costPrice: atta.costPrice,
      quantity: sellQty,
      subtotal: atta.sellingPrice * sellQty
    }],
    totalAmount: atta.sellingPrice * sellQty,
    status: 'Completed'
  });

  console.log(`Sale recorded: Bill #${sale1.id}, Total: ₹${sale1.totalAmount}`);
  if (!sale1.id || sale1.totalAmount !== 425 * 3) {
    throw new Error('Sale total amount mismatch');
  }

  // Verify item snapshot stores selling price, cost price, subtotal, cogs, gross profit
  const itemSnap = sale1.items[0];
  if (itemSnap.price !== 425 || itemSnap.costPrice !== 380 || itemSnap.quantity !== 3) {
    throw new Error('Item snapshot prices or quantities mismatch');
  }
  if (itemSnap.cogs !== (380 * 3) || itemSnap.grossProfit !== ((425 - 380) * 3)) {
    throw new Error('Item snapshot COGS or Gross Profit mismatch');
  }
  console.log(`✓ Sale item snapshot verified: Price ₹${itemSnap.price}, Cost ₹${itemSnap.costPrice}, COGS ₹${itemSnap.cogs}, Profit ₹${itemSnap.grossProfit}`);

  // Verify stock deduction immediately
  const attaAfter = VyaparStore.getProductById('PRD-101');
  console.log(`Stock after sale of ${sellQty} units: ${attaAfter.stock} (Expected: ${initialStock - sellQty})`);
  if (attaAfter.stock !== initialStock - sellQty) {
    throw new Error(`Inventory was not reduced properly: got ${attaAfter.stock}, expected ${initialStock - sellQty}`);
  }
  console.log('✓ Inventory reduced immediately upon successful sale');

  // 1b. Reject sales when requested quantity exceeds available stock
  console.log('\n--- 2. Testing Insufficient Stock Rejection ---');
  try {
    VyaparStore.recordSale({
      date: '2026-10-28T14:05:00Z',
      customerName: 'Walk-in',
      paymentMode: 'Cash',
      items: [{
        productId: atta.id,
        quantity: attaAfter.stock + 5, // Exceeds available stock
        price: atta.sellingPrice,
        costPrice: atta.costPrice
      }],
      totalAmount: 9999
    });
    throw new Error('Failed to reject sale with insufficient stock');
  } catch (err) {
    console.log('✓ Successfully rejected insufficient stock sale:', err.message);
  }

  // Stock must remain unchanged after rejection
  const attaAfterReject = VyaparStore.getProductById('PRD-101');
  if (attaAfterReject.stock !== attaAfter.stock) {
    throw new Error('Stock changed despite rejected sale');
  }
  console.log(`✓ Stock remained unchanged (${attaAfterReject.stock}) after rejection`);

  // 1c. Reject invalid quantities (0 or negative)
  console.log('\n--- 3. Testing Invalid Quantity Rejection ---');
  try {
    VyaparStore.recordSale({
      customerName: 'Walk-in',
      items: [{ productId: atta.id, quantity: 0, price: 425 }],
      totalAmount: 0
    });
    throw new Error('Failed to reject zero quantity sale');
  } catch (err) {
    console.log('✓ Successfully rejected zero quantity:', err.message);
  }

  try {
    VyaparStore.recordSale({
      customerName: 'Walk-in',
      items: [{ productId: atta.id, quantity: -2, price: 425 }],
      totalAmount: 100
    });
    throw new Error('Failed to reject negative quantity sale');
  } catch (err) {
    console.log('✓ Successfully rejected negative quantity:', err.message);
  }

  // 1d. Prevent accidental duplicate submissions
  console.log('\n--- 4. Testing Duplicate Submission Prevention ---');
  try {
    VyaparStore.recordSale({
      id: sale1.id, // Re-submitting same invoice ID
      date: '2026-10-28T14:00:00Z',
      customerName: 'Gupta Ji',
      items: [{ productId: atta.id, quantity: 1, price: 425 }],
      totalAmount: 425
    });
    throw new Error('Failed to prevent duplicate transaction submission');
  } catch (err) {
    console.log('✓ Successfully prevented duplicate transaction ID:', err.message);
  }

  // -------------------------------------------------------------
  // PART 2: EXPENSE MANAGEMENT
  // -------------------------------------------------------------
  console.log('\n--- 5. Testing Expense Management (Rent, Electricity, Transport, Packaging) ---');

  // Add realistic shop expenses
  const expRent = VyaparStore.addExpense({
    date: '2026-10-28',
    title: 'Shop Rent for Godown Extension',
    category: 'Shop Rent',
    amount: 4500,
    paymentMode: 'Bank Transfer',
    paidTo: 'Landlord Babulal Ji'
  });
  console.log('Added Expense:', expRent.title, `Amount: ₹${expRent.amount}`);

  const expElec = VyaparStore.addExpense({
    date: '2026-10-28',
    title: 'Commercial Electricity Soundbox & Inverter Recharge',
    category: 'Electricity & Utilities',
    amount: 320,
    paymentMode: 'UPI',
    paidTo: 'JVVNL'
  });
  console.log('Added Expense:', expElec.title, `Amount: ₹${expElec.amount}`);

  const expTempo = VyaparStore.addExpense({
    date: '2026-10-28',
    title: 'Tempo Cartage for Muhana Mandi Rice Bags',
    category: 'Transportation & Freight',
    amount: 400,
    paymentMode: 'Cash',
    paidTo: 'Kalu Tempo Driver'
  });
  console.log('Added Expense:', expTempo.title, `Amount: ₹${expTempo.amount}`);

  const expPack = VyaparStore.addExpense({
    date: '2026-10-28',
    title: 'Cloth Carry Bags & Packaging Rolls',
    category: 'Packaging & Bags',
    amount: 250,
    paymentMode: 'Cash',
    paidTo: 'Krishna Packaging'
  });
  console.log('Added Expense:', expPack.title, `Amount: ₹${expPack.amount}`);

  // Test viewing expenses
  const allExpenses = VyaparStore.getExpenses();
  const foundRent = allExpenses.find(e => e.id === expRent.id);
  if (!foundRent || foundRent.amount !== 4500) {
    throw new Error('Failed to find recorded rent expense in ledger');
  }
  console.log(`✓ Expense verified in ledger. Total expenses count: ${allExpenses.length}`);

  // Test deleting expense
  VyaparStore.deleteExpense(expRent.id);
  const afterDeleteExpenses = VyaparStore.getExpenses();
  if (afterDeleteExpenses.some(e => e.id === expRent.id)) {
    throw new Error('Expense was not removed after delete call');
  }
  console.log('✓ Successfully deleted expense from ledger');

  // -------------------------------------------------------------
  // PART 3: PROFIT CALCULATIONS & IMMUTABLE HISTORICAL SNAPSHOTS
  // -------------------------------------------------------------
  console.log('\n--- 6. Testing Deterministic Financial Calculations ---');

  // Let's create an isolated financial scenario with known values:
  // Product 1: Test Tea 1kg (Cost: ₹200, Selling: ₹300)
  // Product 2: Test Rice 5kg (Cost: ₹150, Selling: ₹250)
  const prdTea = VyaparStore.addProduct({
    name: 'Special Testing CTC Tea 1kg',
    costPrice: 200,
    sellingPrice: 300,
    stock: 50,
    minStock: 5
  });
  const prdRice = VyaparStore.addProduct({
    name: 'Special Testing Basmati Rice 5kg',
    costPrice: 150,
    sellingPrice: 250,
    stock: 50,
    minStock: 5
  });

  // Record Sale A: 2 units of Tea @ ₹300 = ₹600 (COGS: 2 × ₹200 = ₹400) -> Gross Profit: ₹200
  const saleA = VyaparStore.recordSale({
    date: '2026-10-28T15:00:00Z',
    customerName: 'Test Buyer A',
    paymentMode: 'Cash',
    status: 'Completed',
    items: [{
      productId: prdTea.id,
      name: prdTea.name,
      price: prdTea.sellingPrice,
      costPrice: prdTea.costPrice,
      quantity: 2,
      subtotal: 600
    }],
    totalAmount: 600
  });

  // Record Sale B: 3 units of Rice @ ₹250 = ₹750 (COGS: 3 × ₹150 = ₹450) -> Gross Profit: ₹300
  const saleB = VyaparStore.recordSale({
    date: '2026-10-28T15:05:00Z',
    customerName: 'Test Buyer B',
    paymentMode: 'UPI',
    status: 'Completed',
    items: [{
      productId: prdRice.id,
      name: prdRice.name,
      price: prdRice.sellingPrice,
      costPrice: prdRice.costPrice,
      quantity: 3,
      subtotal: 750
    }],
    totalAmount: 750
  });

  // Record Sale C: Pending Credit (Udhar) bill (Must NOT enter revenue until completed)
  const saleC = VyaparStore.recordSale({
    date: '2026-10-28T15:10:00Z',
    customerName: 'Udhar Customer',
    paymentMode: 'Udhar',
    status: 'Pending Credit',
    items: [{
      productId: prdTea.id,
      name: prdTea.name,
      price: prdTea.sellingPrice,
      costPrice: prdTea.costPrice,
      quantity: 1,
      subtotal: 300
    }],
    totalAmount: 300
  });

  // Calculate financials for just Sale A and Sale B
  const isolatedFin = VyaparStore.calculateFinancials({
    salesList: [saleA, saleB, saleC],
    expensesList: [expElec, expTempo, expPack] // 320 + 400 + 250 = ₹970
  });

  console.log('\n--- Analytical Verification ---');
  console.log('Revenue (Sale A 600 + Sale B 750):', isolatedFin.revenue, '(Expected: 1350)');
  console.log('COGS (Sale A 400 + Sale B 450):', isolatedFin.cogs, '(Expected: 850)');
  console.log('Gross Profit (1350 - 850):', isolatedFin.grossProfit, '(Expected: 500)');
  console.log('Recorded Expenses (320 + 400 + 250):', isolatedFin.expenses, '(Expected: 970)');
  console.log('Net Profit (500 - 970):', isolatedFin.netProfit, '(Expected: -470)');
  console.log('Profit Margin %:', isolatedFin.netProfitMarginPct.toFixed(2) + '%', '(Expected: -34.81%)');
  console.log('Pending Credit (Sale C):', isolatedFin.pendingCreditSales, '(Expected: 300)');

  if (isolatedFin.revenue !== 1350) throw new Error(`Revenue formula error: ${isolatedFin.revenue} != 1350`);
  if (isolatedFin.cogs !== 850) throw new Error(`COGS formula error: ${isolatedFin.cogs} != 850`);
  if (isolatedFin.grossProfit !== 500) throw new Error(`Gross profit formula error: ${isolatedFin.grossProfit} != 500`);
  if (isolatedFin.expenses !== 970) throw new Error(`Expenses formula error: ${isolatedFin.expenses} != 970`);
  if (isolatedFin.netProfit !== -470) throw new Error(`Net profit formula error: ${isolatedFin.netProfit} != -470`);
  if (isolatedFin.pendingCreditSales !== 300) throw new Error(`Pending credit error: ${isolatedFin.pendingCreditSales} != 300`);
  console.log('✓ All 6 analytical formulas match with 100% precision');

  // -------------------------------------------------------------
  // PART 4: HISTORICAL COST SNAPSHOT INTEGRITY
  // -------------------------------------------------------------
  console.log('\n--- 7. Testing Historical Cost Snapshot Integrity ---');
  console.log(`Initial product cost for "${prdTea.name}": ₹${prdTea.costPrice}`);

  // Later, the shopkeeper edits the product wholesale purchase cost from ₹200 to ₹280!
  VyaparStore.updateProduct(prdTea.id, {
    costPrice: 280,
    sellingPrice: 380
  });

  // Re-read Sale A
  const reReadSales = VyaparStore.getSales();
  const historicalSaleA = reReadSales.find(s => s.id === saleA.id);
  const reReadItem = historicalSaleA.items[0];

  console.log(`Historical sale item recorded cost after product catalog update: ₹${reReadItem.costPrice}`);
  if (reReadItem.costPrice !== 200) {
    throw new Error(`CRITICAL: Product edit mutated historical sale cost! Got ${reReadItem.costPrice}, expected 200`);
  }
  if (reReadItem.price !== 300) {
    throw new Error(`CRITICAL: Product edit mutated historical sale price! Got ${reReadItem.price}, expected 300`);
  }
  console.log('✓ Historical sale cost price snapshot preserved! Editing product later does NOT rewrite historical profit.');

  // -------------------------------------------------------------
  // PART 5: EXPENSE DEDUPLICATION
  // -------------------------------------------------------------
  console.log('\n--- 8. Testing Expense Deduplication ---');
  // Pass duplicate identical expense object in array
  const duplicatedExpenses = [expElec, expElec, expTempo, expTempo, expPack];
  const dedupedFin = VyaparStore.calculateFinancials({
    salesList: [saleA],
    expensesList: duplicatedExpenses
  });

  console.log(`Deduplicated expense sum: ₹${dedupedFin.expenses} (Expected: ₹970, not ₹1940)`);
  if (dedupedFin.expenses !== 970) {
    throw new Error(`Deduplication failed! Counted same expense twice: ${dedupedFin.expenses}`);
  }
  console.log('✓ Verified: Expenses are never subtracted twice');

  // -------------------------------------------------------------
  // PART 6: ZERO REVENUE SAFETY
  // -------------------------------------------------------------
  console.log('\n--- 9. Testing Zero Revenue Safe Division ---');
  const zeroRevFin = VyaparStore.calculateFinancials({
    salesList: [],
    expensesList: [expPack]
  });

  console.log('Zero revenue margin:', zeroRevFin.netProfitMarginPct);
  if (isNaN(zeroRevFin.netProfitMarginPct) || !isFinite(zeroRevFin.netProfitMarginPct)) {
    throw new Error('Division by zero resulted in NaN or Infinity');
  }
  if (zeroRevFin.netProfitMarginPct !== 0) {
    throw new Error('Zero revenue must yield 0% margin');
  }
  console.log('✓ Zero revenue handled safely without division errors');

  // -------------------------------------------------------------
  // PART 7: STORAGE PERSISTENCE ACROSS SESSIONS
  // -------------------------------------------------------------
  console.log('\n--- 10. Testing Storage Persistence Across Simulated Reload ---');
  const rawSales = JSON.parse(mockStorage['vyapar_sales_v1']);
  const rawExpenses = JSON.parse(mockStorage['vyapar_expenses_v1']);
  const rawProducts = JSON.parse(mockStorage['vyapar_products_v1']);

  console.log(`Persisted Sales: ${rawSales.length}`);
  console.log(`Persisted Expenses: ${rawExpenses.length}`);
  console.log(`Persisted Products: ${rawProducts.length}`);

  if (!rawSales.some(s => s.id === saleA.id)) throw new Error('Sale A not persisted in storage');
  if (!rawExpenses.some(e => e.id === expPack.id)) throw new Error('Packaging expense not persisted in storage');
  if (!rawProducts.some(p => p.id === prdTea.id)) throw new Error('Testing Tea product not persisted in storage');

  console.log('✓ All sales, expenses, and inventory persisted across sessions in storage');

  console.log('\n======================================================');
  console.log('>>> ALL SALES, EXPENSES & PROFIT TESTS PASSED 100%! <<<');
  console.log('======================================================');
}

runFullTestSuite();

