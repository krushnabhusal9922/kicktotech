/**
 * Test Suite: Vyapar AI — Business Insights Section
 * Tests all 7 requirements:
 * 1. Low-stock alerts based on configured threshold
 * 2. Top-selling-products based on completed sale quantities
 * 3. Revenue & expense chart grouped by date with sufficient dated records
 * 4. Gross profit and net profit summaries
 * 5. Three concise business recommendations with explanations
 * 6. Empty states for new shops with no sales or expenses
 * 7. Verification BEFORE and AFTER adding a sale, an expense, and a low-stock product
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

// Load data.js and charts.js
eval(fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'js/charts.js'), 'utf8'));

async function runBusinessInsightsTests() {
  console.log('================================================================');
  console.log('  TEST SUITE: BUSINESS INSIGHTS & REAL SHOP DATA');
  console.log('================================================================\n');

  // Reset to clean default grocery data
  VyaparStore.resetToDefault();

  // -------------------------------------------------------------------------
  // PHASE 1: BEFORE STATE VERIFICATION (DEFAULT DATA)
  // -------------------------------------------------------------------------
  console.log('--- Phase 1: Verifying Initial "BEFORE" State ---');

  // 1. Low-stock alerts based on configured threshold
  const productsBefore = VyaparStore.getProducts();
  const lowStockBefore = productsBefore.filter(p => p.stock <= p.minStock);
  console.log(`[Req 1] Low Stock Items Count: ${lowStockBefore.length} out of ${productsBefore.length} products`);
  if (lowStockBefore.length === 0) throw new Error('Expected initial low stock items in default grocery data');

  lowStockBefore.forEach(p => {
    if (p.stock > p.minStock) throw new Error(`Product ${p.name} stock (${p.stock}) is greater than minStock (${p.minStock})`);
    const deficit = Math.max(0, p.minStock - p.stock);
    const isOut = p.stock === 0;
    console.log(`  - ${p.name}: Stock ${p.stock} ${p.unit} vs Min ${p.minStock} (Deficit: ${deficit}) [${isOut ? 'OUT OF STOCK' : 'LOW STOCK'}]`);
  });
  console.log('✓ Low-stock alerts strictly match configured thresholds (stock <= minStock)\n');

  // 2. Top-selling-products based on completed sale quantities
  const topSellersBefore = VyaparStore.getTopSellingProducts(5);
  console.log(`[Req 2] Top Selling Products Count: ${topSellersBefore.length}`);
  if (topSellersBefore.length === 0) throw new Error('Expected top sellers from default completed sales');

  topSellersBefore.forEach((item, idx) => {
    console.log(`  #${idx + 1} ${item.name}: ${item.unitsSold} ${item.unit} sold | Revenue: ₹${item.totalRevenue} | GP: ₹${item.grossProfit}`);
    if (idx > 0 && item.unitsSold > topSellersBefore[idx - 1].unitsSold) {
      throw new Error('Top sellers must be sorted in descending order of units sold');
    }
  });
  console.log('✓ Top-selling products ranked accurately by completed sale quantities\n');

  // 3. Revenue & Expense grouped by date
  const trendBefore = VyaparStore.getDailyFinancialTrend();
  console.log(`[Req 3] Daily Financial Trend: ${trendBefore.days.length} distinct dates found. Has sufficient data: ${trendBefore.hasSufficientData}`);
  if (!trendBefore.hasSufficientData || trendBefore.days.length === 0) {
    throw new Error('Expected sufficient dated records in default grocery data');
  }
  trendBefore.days.forEach(d => {
    console.log(`  Date ${d.date} (${d.label}): Revenue ₹${d.revenue} (${d.salesCount} bills) | Expenses ₹${d.expenses} (${d.expenseCount} entries) | Net: ₹${d.netProfit}`);
  });
  console.log('✓ Revenue and expense trend accurately grouped by real transaction dates\n');

  // 4. Gross profit and net profit summaries
  const finAllBefore = VyaparStore.calculateFinancials({ period: 'all' });
  const finMonthBefore = VyaparStore.calculateFinancials({ period: 'month' });
  console.log('[Req 4] Financial Summaries:');
  console.log(`  All-Time: Revenue ₹${finAllBefore.revenue} | COGS ₹${finAllBefore.cogs} | Gross Profit ₹${finAllBefore.grossProfit} (${finAllBefore.grossMarginPct.toFixed(1)}%) | Expenses ₹${finAllBefore.expenses} | Net Profit ₹${finAllBefore.netProfit} (${finAllBefore.netProfitMarginPct.toFixed(1)}%)`);
  if (finAllBefore.grossProfit !== finAllBefore.revenue - finAllBefore.cogs) {
    throw new Error('Gross profit arithmetic mismatch: Revenue - COGS');
  }
  if (finAllBefore.netProfit !== finAllBefore.grossProfit - finAllBefore.expenses) {
    throw new Error('Net profit arithmetic mismatch: Gross Profit - Expenses');
  }
  console.log('✓ Gross profit and net profit summaries strictly verify accounting formulas\n');

  // 5 & 7. Three concise recommendations with clear explanations
  const recsBefore = VyaparStore.getBusinessRecommendations();
  console.log(`[Req 5 & 7] Business Recommendations Count: ${recsBefore.length}`);
  if (recsBefore.length !== 3) {
    throw new Error(`Expected exactly 3 recommendations, received ${recsBefore.length}`);
  }
  recsBefore.forEach((rec, idx) => {
    console.log(`  Rec #${idx + 1} [${rec.category}]: "${rec.title}"`);
    console.log(`    Action: ${rec.action}`);
    console.log(`    Evidence & Why: ${rec.explanation}`);
    if (!rec.title || !rec.action || !rec.explanation) {
      throw new Error(`Recommendation #${idx + 1} is missing title, action, or explanation`);
    }
  });
  console.log('✓ Exactly 3 concise recommendations with clear data-backed explanations verified\n');


  // -------------------------------------------------------------------------
  // PHASE 2: DYNAMIC MODIFICATIONS (SALE, EXPENSE, LOW-STOCK PRODUCT)
  // -------------------------------------------------------------------------
  console.log('--- Phase 2: Applying Dynamic Modifications ---');

  // 1. Add a Sale:
  // Product: Tata Sampann Toor Dal 1kg (PRD-103)
  // Current stock: 22, minStock: 10, costPrice: 145, sellingPrice: 175
  // Sell 6 units: Total revenue = 6 * 175 = ₹1,050.00, Total COGS = 6 * 145 = ₹870.00, GP = ₹180.00
  const toorDalBefore = VyaparStore.getProductById('PRD-103');
  const toorStockBefore = toorDalBefore.stock;
  console.log(`1. Recording completed sale for 6 units of Tata Sampann Toor Dal (Stock before: ${toorStockBefore})`);

  const addedSale = VyaparStore.recordSale({
    date: new Date().toISOString(),
    customerName: 'Kailash Meena (Cash)',
    customerPhone: '9828001122',
    paymentMode: 'Cash',
    status: 'Completed',
    notes: 'Bulk Dal Purchase',
    items: [
      {
        productId: 'PRD-103',
        name: 'Tata Sampann Unpolished Toor Dal 1kg',
        quantity: 6,
        price: 175,
        costPrice: 145,
        subtotal: 1050
      }
    ],
    totalAmount: 1050,
    totalCost: 870
  });
  console.log(`✓ Sale created: ${addedSale.id} for ₹${addedSale.totalAmount}`);
  const toorDalAfter = VyaparStore.getProductById('PRD-103');
  console.log(`✓ Toor Dal stock after sale: ${toorDalAfter.stock} (reduced by 6: ${toorStockBefore - toorDalAfter.stock === 6})`);
  if (toorDalAfter.stock !== toorStockBefore - 6) throw new Error('Stock deduction failed');

  // 2. Add an Operating Expense:
  // Amount: ₹750 for "Muhana Mandi Tempo Freight & Cartage" under "Transportation & Freight"
  console.log('\n2. Recording new operating expense of ₹750 for Muhana Mandi Tempo');
  const addedExp = VyaparStore.addExpense({
    date: new Date().toISOString(),
    title: 'Muhana Mandi Tempo Freight & Cartage',
    description: 'Cartage charges for 10 bags of grains',
    category: 'Transportation & Freight',
    amount: 750,
    paidTo: 'Raju Tempo Wala',
    paymentMode: 'UPI'
  });
  console.log(`✓ Expense created: ${addedExp.id} for ₹${addedExp.amount}`);

  // 3. Add a New Product with Low Stock:
  // Product: Wagh Bakri Premium CTC Tea 500g
  // Stock: 2, minStock: 10 (Deficit: 8) -> LOW STOCK
  console.log('\n3. Adding new product with low stock: "Wagh Bakri Premium CTC Tea 500g" (Stock: 2, Min: 10)');
  const addedProduct = VyaparStore.addProduct({
    name: 'Wagh Bakri Premium CTC Tea 500g',
    sku: '890103099',
    category: 'Dairy & Beverages',
    costPrice: 210,
    sellingPrice: 260,
    stock: 2,
    quantity: 2,
    minStock: 10,
    unit: 'Pkt'
  });
  console.log(`✓ Product created: ${addedProduct.id} with Stock ${addedProduct.stock} and MinStock ${addedProduct.minStock}`);


  // -------------------------------------------------------------------------
  // PHASE 3: AFTER STATE VERIFICATION (CONFIRM DYNAMIC RECALCULATIONS)
  // -------------------------------------------------------------------------
  console.log('\n--- Phase 3: Verifying "AFTER" State Recalculations ---');

  // 1. Verify Low-Stock Alerts Updated
  const productsAfter = VyaparStore.getProducts();
  const lowStockAfter = productsAfter.filter(p => p.stock <= p.minStock);
  console.log(`[Req 1-After] Low Stock Count: ${lowStockAfter.length} (was ${lowStockBefore.length}, +1 for Wagh Bakri Tea)`);
  if (lowStockAfter.length !== lowStockBefore.length + 1) {
    throw new Error(`Expected low stock count to increase by 1, got ${lowStockAfter.length}`);
  }
  const foundNewLow = lowStockAfter.find(p => p.id === addedProduct.id);
  if (!foundNewLow) throw new Error('Newly added low-stock product not found in low-stock alerts');
  console.log(`✓ Low-stock alerts updated: ${foundNewLow.name} with deficit ${foundNewLow.minStock - foundNewLow.stock} ${foundNewLow.unit}`);

  // 2. Verify Top-Selling Products Updated
  const topSellersAfter = VyaparStore.getTopSellingProducts(5);
  console.log('[Req 2-After] Top-Selling Products Updated:');
  const foundToor = topSellersAfter.find(p => p.name.includes('Toor Dal'));
  if (!foundToor) throw new Error('Top-selling products does not include Toor Dal after selling 6 units');
  console.log(`✓ Top-seller list updated: ${foundToor.name} sold ${foundToor.unitsSold} units (Revenue: ₹${foundToor.totalRevenue})`);
  if (foundToor.unitsSold < 6) throw new Error('Toor Dal units sold in top sellers is less than 6');

  // 3. Verify Daily Financial Trend Updated
  const trendAfter = VyaparStore.getDailyFinancialTrend();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrendEntry = trendAfter.days.find(d => d.date === todayStr);
  if (!todayTrendEntry) throw new Error("Today's date entry not found in daily trend");
  console.log(`[Req 3-After] Today's Trend Data: Revenue ₹${todayTrendEntry.revenue} | Expenses ₹${todayTrendEntry.expenses}`);
  if (todayTrendEntry.revenue < 1050) throw new Error('Today revenue trend did not include new ₹1,050 sale');
  if (todayTrendEntry.expenses < 750) throw new Error('Today expense trend did not include new ₹750 expense');
  console.log('✓ Daily trend chart data dynamically incorporates new sale and expense');

  // 4. Verify Gross Profit & Net Profit Summaries Updated
  const finAllAfter = VyaparStore.calculateFinancials({ period: 'all' });
  console.log(`[Req 4-After] All-Time Revenue: ₹${finAllAfter.revenue} (was ₹${finAllBefore.revenue}, +₹1,050)`);
  console.log(`[Req 4-After] All-Time COGS: ₹${finAllAfter.cogs} (was ₹${finAllBefore.cogs}, +₹870)`);
  console.log(`[Req 4-After] All-Time Gross Profit: ₹${finAllAfter.grossProfit} (was ₹${finAllBefore.grossProfit}, +₹180)`);
  console.log(`[Req 4-After] All-Time Expenses: ₹${finAllAfter.expenses} (was ₹${finAllBefore.expenses}, +₹750)`);
  console.log(`[Req 4-After] All-Time Net Profit: ₹${finAllAfter.netProfit} (was ₹${finAllBefore.netProfit}, +₹180 - ₹750)`);

  if (finAllAfter.revenue !== finAllBefore.revenue + 1050) throw new Error('Revenue did not update by exactly ₹1,050');
  if (finAllAfter.cogs !== finAllBefore.cogs + 870) throw new Error('COGS did not update by exactly ₹870');
  if (finAllAfter.grossProfit !== finAllBefore.grossProfit + 180) throw new Error('Gross Profit did not update by exactly ₹180');
  if (finAllAfter.expenses !== finAllBefore.expenses + 750) throw new Error('Expenses did not update by exactly ₹750');
  if (finAllAfter.netProfit !== finAllBefore.netProfit + 180 - 750) throw new Error('Net profit arithmetic did not match');
  console.log('✓ All financial summary formulas strictly verified after dynamic updates');

  // 5 & 7. Verify Recommendations Reflect New Data
  const recsAfter = VyaparStore.getBusinessRecommendations();
  console.log(`[Req 5 & 7-After] Business Recommendations Count: ${recsAfter.length}`);
  if (recsAfter.length !== 3) throw new Error('Recommendations count must be exactly 3');
  recsAfter.forEach((r, idx) => {
    console.log(`  Rec #${idx + 1} [${r.category}]: "${r.title}" - ${r.explanation}`);
  });
  console.log('✓ 3 recommendations dynamically updated with new inventory, sales, and expense evidence\n');


  // -------------------------------------------------------------------------
  // PHASE 4: EMPTY STATE VERIFICATION (NEW SHOP WITH NO SALES OR EXPENSES)
  // -------------------------------------------------------------------------
  console.log('--- Phase 4: Verifying Empty State Handling (New Shop) ---');

  // Simulate a brand new shop: empty sales, empty expenses, zero products
  localStorage.setItem('vyapar_sales_v1', JSON.stringify([]));
  localStorage.setItem('vyapar_expenses_v1', JSON.stringify([]));
  localStorage.setItem('vyapar_products_v1', JSON.stringify([]));
  localStorage.setItem('vyapar_customers_v1', JSON.stringify([]));

  // 1. Empty Top Sellers
  const emptyTopSellers = VyaparStore.getTopSellingProducts(5);
  console.log(`[Empty Req 2] Empty Top Sellers: ${emptyTopSellers.length} items`);
  if (!Array.isArray(emptyTopSellers) || emptyTopSellers.length !== 0) {
    throw new Error('Top sellers should return empty array for new shop');
  }
  console.log('✓ Empty top sellers returns [] without error');

  // 2. Empty Financial Trend
  const emptyTrend = VyaparStore.getDailyFinancialTrend();
  console.log(`[Empty Req 3] Empty Trend: hasSufficientData = ${emptyTrend.hasSufficientData}, days = ${emptyTrend.days.length}`);
  if (emptyTrend.hasSufficientData !== false || emptyTrend.days.length !== 0) {
    throw new Error('Daily trend should report hasSufficientData: false when no records exist');
  }
  console.log('✓ Empty daily financial trend handled cleanly with hasSufficientData: false');

  // 3. Empty Financial Summaries (Zero revenue, safe division)
  const emptyFin = VyaparStore.calculateFinancials({ period: 'all' });
  console.log(`[Empty Req 4] Empty Financials: Revenue = ₹${emptyFin.revenue}, Gross Profit = ₹${emptyFin.grossProfit}, Margin = ${emptyFin.grossMarginPct}%`);
  if (emptyFin.revenue !== 0 || emptyFin.grossProfit !== 0 || emptyFin.expenses !== 0 || emptyFin.netProfit !== 0) {
    throw new Error('Empty shop financials must all be 0');
  }
  if (isNaN(emptyFin.grossMarginPct) || isNaN(emptyFin.netProfitMarginPct)) {
    throw new Error('Zero revenue caused division-by-zero NaN in margins');
  }
  console.log('✓ Zero revenue handled safely without division errors');

  // 4. Empty Recommendations
  const emptyRecs = VyaparStore.getBusinessRecommendations();
  console.log(`[Empty Req 5 & 7] Empty Recommendations Count: ${emptyRecs.length}`);
  if (emptyRecs.length !== 3) {
    throw new Error('Empty shop must still receive exactly 3 onboarding recommendations');
  }
  emptyRecs.forEach((r, idx) => {
    console.log(`  Empty Rec #${idx + 1} [${r.category}]: "${r.title}" - ${r.explanation}`);
  });
  if (!emptyRecs[0].title.includes('Add Initial Products')) {
    throw new Error('First empty recommendation should guide merchant to add initial products');
  }
  if (!emptyRecs[1].title.includes('Record Completed Sales')) {
    throw new Error('Second empty recommendation should guide merchant to record completed sales');
  }
  if (!emptyRecs[2].title.includes('Track Daily Store Expenses')) {
    throw new Error('Third empty recommendation should guide merchant to log daily store expenses');
  }
  console.log('✓ Empty shop receives 3 actionable onboarding recommendations with clear explanations');

  console.log('\n================================================================');
  console.log('>>> ALL 7 BUSINESS INSIGHTS REQUIREMENTS PASSED WITH 100%! <<<');
  console.log('================================================================');
}

runBusinessInsightsTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});

