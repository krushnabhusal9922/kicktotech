/**
 * Test Suite: Vyapar AI — Prompt 7 Verification
 * "Ask Your Business" Assistant Dynamic Data Updates & Accounting Rules
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

// Load application modules
eval(fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'js/ai-assistant.js'), 'utf8'));

async function runPrompt7Tests() {
  console.log('================================================================');
  console.log('  TEST SUITE: PROMPT 7 "ASK YOUR BUSINESS" ASSISTANT');
  console.log('================================================================\n');

  // Reset to clean default data
  VyaparStore.resetToDefault();

  // 1. Verify Suggested Question Buttons
  console.log('--- Step 1: Suggested Question Buttons Verification ---');
  const expectedPrompts = [
    "What is my net profit?",
    "Which products are low in stock?",
    "What are my biggest expenses?",
    "Which products have sold the most?",
    "Which products should I restock?",
    "Summarize my business performance."
  ];

  console.log('Configured Suggested Prompts:');
  VyaparAI.suggestedPrompts.forEach((p, idx) => {
    console.log(`  ${idx + 1}. [${p.icon}] "${p.text}" (tag: ${p.tag})`);
  });

  expectedPrompts.forEach(exp => {
    const found = VyaparAI.suggestedPrompts.find(p => p.text === exp);
    if (!found) throw new Error(`Missing expected suggested prompt button: "${exp}"`);
  });
  console.log('✓ All 6 exact suggested question buttons exist\n');

  // 2. Initial Run of All 6 Questions
  console.log('--- Step 2: Initial Run of All 6 Questions ---');

  // Q1: What is my net profit?
  console.log('\n[Q1] Asking: "What is my net profit?"');
  const res1_initial = await VyaparAI.ask("What is my net profit?");
  const fin1 = VyaparStore.calculateFinancials({ period: 'today' });
  console.log(`Initial Today Revenue: ₹${fin1.revenue}, Expenses: ₹${fin1.expenses}, Net Profit: ₹${fin1.netProfit}`);
  if (!res1_initial.includes("Revenue (Completed Sales)")) throw new Error('Q1 must define Revenue');
  if (!res1_initial.includes("Cost of Goods Sold (COGS)")) throw new Error('Q1 must define COGS');
  if (!res1_initial.includes("Gross Profit")) throw new Error('Q1 must define Gross Profit');
  if (!res1_initial.includes("Operating Expenses")) throw new Error('Q1 must define Operating Expenses');
  if (!res1_initial.includes("Net Profit")) throw new Error('Q1 must define Net Profit');
  if (!res1_initial.includes(fin1.revenue.toFixed(2))) throw new Error('Q1 initial does not match today revenue');
  console.log('✓ Q1 Initial verified with full accounting distinction');

  // Q2: Which products are low in stock?
  console.log('\n[Q2] Asking: "Which products are low in stock?"');
  const res2_initial = await VyaparAI.ask("Which products are low in stock?");
  const initialLow = VyaparStore.getProducts().filter(p => p.stock <= p.minStock);
  console.log(`Initial Low Stock Count: ${initialLow.length}`);
  if (!res2_initial.includes(`${initialLow.length} items`)) throw new Error('Q2 initial count mismatch');
  console.log('✓ Q2 Initial verified');

  // Q3: What are my biggest expenses?
  console.log('\n[Q3] Asking: "What are my biggest expenses?"');
  const res3_initial = await VyaparAI.ask("What are my biggest expenses?");
  const initialExpenses = VyaparStore.getExpenses();
  const initialTotalExp = initialExpenses.reduce((s, e) => s + e.amount, 0);
  console.log(`Initial Expenses Total: ₹${initialTotalExp} across ${initialExpenses.length} entries`);
  if (!res3_initial.includes("Deduplication Check")) throw new Error('Q3 must show deduplication check');
  if (!res3_initial.includes("Shop Rent") || !res3_initial.includes("Staff Salary")) throw new Error('Q3 missing top expenses');
  console.log('✓ Q3 Initial verified');

  // Q4: Which products have sold the most?
  console.log('\n[Q4] Asking: "Which products have sold the most?"');
  const res4_initial = await VyaparAI.ask("Which products have sold the most?");
  if (!res4_initial.includes("India Gate Basmati Rice 5kg")) throw new Error('Q4 missing top seller Basmati Rice');
  console.log('✓ Q4 Initial verified');

  // Q5: Which products should I restock?
  console.log('\n[Q5] Asking: "Which products should I restock?"');
  const res5_initial = await VyaparAI.ask("Which products should I restock?");
  if (!res5_initial.includes("Stock Level Evidence") || !res5_initial.includes("Sales History Evidence")) {
    throw new Error('Q5 must explain both stock level and sales history (Rule 7)');
  }
  if (!res5_initial.includes("Predictive Demand Forecasting Limitation")) {
    throw new Error('Q5 must state forecasting limitations');
  }
  if (!res5_initial.includes("Missing Information Notice")) {
    throw new Error('Q5 must note missing unrecorded information (MOQs, distributor credit)');
  }
  console.log('✓ Q5 Initial verified (Rule 7 stock level & sales history included)');

  // Q6: Summarize my business performance.
  console.log('\n[Q6] Asking: "Summarize my business performance."');
  const res6_initial = await VyaparAI.ask("Summarize my business performance.");
  if (!res6_initial.includes("Executive Business Performance Summary")) throw new Error('Q6 title missing');
  if (!res6_initial.includes("Working Capital Health") && !res6_initial.includes("Inventory & Working Capital Health")) throw new Error('Q6 inventory health missing');
  if (!res6_initial.includes("Customer Credit Ledger (Udhar)")) throw new Error('Q6 udhar section missing');
  console.log('✓ Q6 Initial verified');


  // 3. DYNAMIC DATA MODIFICATIONS
  console.log('\n--- Step 3: Performing Dynamic Data Modifications ---');

  // 3a. Record a new completed sale: 4 units of Aashirvaad Shudh Chakki Atta 10kg
  // Selling Price = 425, Purchase Cost = 380
  // Revenue increase: 4 * 425 = ₹1,700.00
  // COGS increase: 4 * 380 = ₹1,520.00
  // Gross Profit increase: ₹180.00
  const attaBefore = VyaparStore.getProductById('PRD-101');
  const attaStockBefore = attaBefore.stock; // 14
  console.log(`Aashirvaad Atta stock before sale: ${attaStockBefore}`);

  const newSale = VyaparStore.recordSale({
    date: new Date().toISOString(),
    customerName: 'Sanjay Rawat (Cash Customer)',
    customerPhone: '9829099999',
    paymentMode: 'Cash',
    status: 'Completed',
    notes: 'Walk-in bulk atta sale',
    items: [
      {
        productId: 'PRD-101',
        name: 'Aashirvaad Shudh Chakki Atta 10kg',
        quantity: 4,
        price: 425,
        costPrice: 380,
        subtotal: 1700
      }
    ],
    totalAmount: 1700,
    totalCost: 1520
  });
  console.log(`✓ Sale created: ${newSale.id} for ₹${newSale.totalAmount}`);

  const attaAfter = VyaparStore.getProductById('PRD-101');
  console.log(`Aashirvaad Atta stock after sale: ${attaAfter.stock} (reduced by 4: ${attaStockBefore - attaAfter.stock === 4})`);
  if (attaAfter.stock !== attaStockBefore - 4) throw new Error('Stock deduction failed on sale');

  // 3b. Add a new operating expense: ₹550 for Biodegradable Bags
  const newExp = VyaparStore.addExpense({
    date: new Date().toISOString(),
    title: 'Biodegradable Grocery Carry Bags',
    description: 'Biodegradable Grocery Carry Bags (500 pcs)',
    category: 'Packaging & Bags',
    amount: 550,
    paidTo: 'City Poly Plast Jaipur',
    paymentMethod: 'UPI'
  });
  console.log(`✓ Expense created: ${newExp.id} for ₹${newExp.amount}`);

  // 3c. Adjust stock of another item to trigger low stock:
  // Tata Salt (PRD-108) current stock is 45, minStock is 20. Let's update stock to 5
  const salt = VyaparStore.getProductById('PRD-108');
  VyaparStore.updateProduct('PRD-108', { ...salt, stock: 5, quantity: 5 });
  const updatedSalt = VyaparStore.getProductById('PRD-108');
  console.log(`✓ Updated Tata Salt stock to ${updatedSalt.stock} (minStock is ${updatedSalt.minStock}) -> NOW LOW STOCK`);


  // 4. RE-QUERY ALL 6 QUESTIONS AND VERIFY DYNAMIC UPDATES
  console.log('\n--- Step 4: Re-query All 6 Questions to Confirm Dynamic Updates ---');

  // Dynamic Check Q1: What is my net profit?
  console.log('\n[Q1-Dynamic] Asking: "What is my net profit?"');
  const res1_updated = await VyaparAI.ask("What is my net profit?");
  const fin1_updated = VyaparStore.calculateFinancials({ period: 'today' });
  console.log(`Updated Today Revenue: ₹${fin1_updated.revenue} (was ₹${fin1.revenue}, +₹1700)`);
  console.log(`Updated Today Expenses: ₹${fin1_updated.expenses} (was ₹${fin1.expenses}, +₹550)`);
  console.log(`Updated Today Net Profit: ₹${fin1_updated.netProfit} (was ₹${fin1.netProfit})`);

  if (fin1_updated.revenue !== fin1.revenue + 1700) throw new Error('Financials today revenue was not updated');
  if (fin1_updated.expenses !== fin1.expenses + 550) throw new Error('Financials today expenses were not updated');
  if (fin1_updated.netProfit !== fin1.netProfit + 180 - 550) throw new Error('Financials today net profit arithmetic discrepancy');

  if (!res1_updated.includes(fin1_updated.revenue.toFixed(2))) {
    throw new Error(`Q1 did not reflect updated today revenue of ₹${fin1_updated.revenue.toFixed(2)}`);
  }
  if (!res1_updated.includes(fin1_updated.expenses.toFixed(2))) {
    throw new Error(`Q1 did not reflect updated today expenses of ₹${fin1_updated.expenses.toFixed(2)}`);
  }
  console.log('✓ Q1 dynamically updated with new sale, expense, and recalculated net profit!');

  // Dynamic Check Q2: Which products are low in stock?
  console.log('\n[Q2-Dynamic] Asking: "Which products are low in stock?"');
  const res2_updated = await VyaparAI.ask("Which products are low in stock?");
  const updatedLow = VyaparStore.getProducts().filter(p => p.stock <= p.minStock);
  console.log(`Updated Low Stock Count: ${updatedLow.length} (was ${initialLow.length}, +1 for Tata Salt)`);
  if (!res2_updated.includes(`${updatedLow.length} items`)) {
    throw new Error(`Q2 expected ${updatedLow.length} items after Tata Salt dropped below alert`);
  }
  if (!res2_updated.includes("Tata Salt")) {
    throw new Error('Q2 must now include Tata Salt');
  }
  console.log('✓ Q2 dynamically updated to include newly low-stock Tata Salt!');

  // Dynamic Check Q3: What are my biggest expenses?
  console.log('\n[Q3-Dynamic] Asking: "What are my biggest expenses?"');
  const res3_updated = await VyaparAI.ask("What are my biggest expenses?");
  const updatedTotalExp = VyaparStore.getExpenses().reduce((s, e) => s + e.amount, 0);
  console.log(`Updated Expenses Total: ₹${updatedTotalExp} (was ₹${initialTotalExp}, +₹550)`);
  console.log('Q3 Updated response:\n', res3_updated);
  if (!res3_updated.includes(VyaparAI.inr(updatedTotalExp))) {
    throw new Error(`Q3 did not reflect updated total expenses of ${VyaparAI.inr(updatedTotalExp)}`);
  }
  if (!res3_updated.includes("Biodegradable Grocery Carry Bags")) {
    throw new Error('Q3 did not list newly added Packaging & Bags expense');
  }
  console.log('✓ Q3 dynamically updated with new expense entry and re-aggregated categories!');

  // Dynamic Check Q4: Which products have sold the most?
  console.log('\n[Q4-Dynamic] Asking: "Which products have sold the most?"');
  const res4_updated = await VyaparAI.ask("Which products have sold the most?");
  if (!res4_updated.includes("Aashirvaad Shudh Chakki Atta 10kg")) {
    throw new Error('Q4 did not include Aashirvaad Shudh Chakki Atta in sales breakdown');
  }
  if (!res4_updated.includes("4 units")) {
    throw new Error('Q4 did not reflect 4 units sold of Aashirvaad Atta');
  }
  if (!res4_updated.includes(newSale.id)) {
    throw new Error(`Q4 did not reference new invoice ${newSale.id}`);
  }
  console.log('✓ Q4 dynamically updated with 4 units of Aashirvaad Atta and new invoice number!');

  // Dynamic Check Q5: Which products should I restock?
  console.log('\n[Q5-Dynamic] Asking: "Which products should I restock?"');
  const res5_updated = await VyaparAI.ask("Which products should I restock?");
  if (!res5_updated.includes("Tata Salt")) {
    throw new Error('Q5 restocking list must now include newly low Tata Salt');
  }
  if (!res5_updated.includes("5 Pkt")) {
    throw new Error('Q5 did not state Tata Salt current stock level of 5');
  }
  console.log('✓ Q5 dynamically updated to include Tata Salt with stock level and alert deficit!');

  // Dynamic Check Q6: Summarize my business performance.
  console.log('\n[Q6-Dynamic] Asking: "Summarize my business performance."');
  const res6_updated = await VyaparAI.ask("Summarize my business performance.");
  if (!res6_updated.includes(VyaparAI.inr(fin1_updated.revenue))) {
    throw new Error('Q6 summary did not show updated today revenue');
  }
  if (!res6_updated.includes(VyaparAI.inr(fin1_updated.expenses))) {
    throw new Error('Q6 summary did not show updated today expenses');
  }
  console.log('✓ Q6 dynamically updated summary metrics!');

  console.log('\n================================================================');
  console.log('>>> ALL PROMPT 7 REQUIREMENTS AND DYNAMIC TESTS PASSED 100%! <<<');
  console.log('================================================================');
}

runPrompt7Tests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
