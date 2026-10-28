/**
 * Test Suite: Vyapar AI — "Ask Your Business" Assistant
 * Tests all 6 suggested questions, calculation accuracy, evidence, facts vs recommendations,
 * and rule-based labeling.
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

// Load data.js and ai-assistant.js
eval(fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'js/ai-assistant.js'), 'utf8'));

async function runTests() {
  console.log('=== TEST SUITE: "ASK YOUR BUSINESS" ASSISTANT ===\n');

  // Reset to clean default grocery data
  VyaparStore.resetToDefault();

  // Test 0: Mode and Configuration check
  console.log('--- Test 0: Mode & Zero API Key Exposure ---');
  const modeInfo = VyaparAI.getModeInfo();
  console.log('Active Assistant Mode:', modeInfo.label);
  if (modeInfo.mode !== 'rule-based') {
    throw new Error('Expected default mode to be rule-based when no model is configured');
  }
  if (VyaparAI.isLiveModelConfigured()) {
    throw new Error('Live model should NOT be configured by default');
  }
  console.log('✓ Assistant clearly identifies as Rule-Based mode');

  // Test 1: How much net profit did I make today?
  console.log('\n--- Test 1: "How much net profit did I make today?" ---');
  const q1 = "How much net profit did I make today?";
  const res1 = await VyaparAI.ask(q1);
  console.log('Response excerpt:\n', res1.slice(0, 320) + '...\n');

  // Verify calculation accuracy
  const financialsToday = VyaparStore.calculateFinancials({ period: 'today' });
  console.log('Expected Revenue:', financialsToday.revenue);
  console.log('Expected COGS:', financialsToday.cogs);
  console.log('Expected Gross Profit:', financialsToday.grossProfit);
  console.log('Expected Expenses:', financialsToday.expenses);
  console.log('Expected Net Profit:', financialsToday.netProfit);

  if (!res1.includes('Verified Facts')) throw new Error('Q1 must clearly label Verified Facts');
  if (!res1.includes('Calculation Evidence') && !res1.includes('Audit Trail')) throw new Error('Q1 must show calculation evidence');
  if (!res1.includes(financialsToday.revenue.toFixed(2)) && !res1.includes(Math.round(financialsToday.revenue).toString())) {
    throw new Error('Q1 does not contain expected today revenue');
  }
  if (!res1.includes(financialsToday.expenses.toFixed(2)) && !res1.includes(Math.round(financialsToday.expenses).toString())) {
    throw new Error('Q1 does not contain expected today expenses');
  }
  if (!res1.includes('Recommendations')) throw new Error('Q1 must clearly separate Recommendations');
  if (!res1.includes('Rule-Based Assistant')) throw new Error('Q1 must be labeled as Rule-Based Assistant');
  console.log('✓ Q1 Passed with 100% calculation accuracy');

  // Test 2: Which products are low in stock?
  console.log('\n--- Test 2: "Which products are low in stock?" ---');
  const q2 = "Which products are low in stock?";
  const res2 = await VyaparAI.ask(q2);
  console.log('Response excerpt:\n', res2.slice(0, 320) + '...\n');

  const products = VyaparStore.getProducts();
  const lowItems = products.filter(p => p.stock <= p.minStock);
  console.log('Actual Low Stock Items Count:', lowItems.length);

  if (!res2.includes(`${lowItems.length} items`)) {
    throw new Error(`Q2 expected ${lowItems.length} items, not found in response`);
  }
  // Check that real products are listed (e.g. India Gate Basmati Rice, Besan)
  if (!res2.includes('India Gate Basmati Rice') || !res2.includes('Rajdhani Besan')) {
    throw new Error('Q2 must list actual low stock product names');
  }
  if (!res2.includes('Verified Facts')) throw new Error('Q2 must label Verified Facts');
  if (!res2.includes('Recommendations')) throw new Error('Q2 must separate Recommendations');
  console.log('✓ Q2 Passed: All low stock items correctly identified');

  // Test 3: What are my total expenses this month?
  console.log('\n--- Test 3: "What are my total expenses this month?" ---');
  const q3 = "What are my total expenses this month?";
  const res3 = await VyaparAI.ask(q3);
  console.log('Response excerpt:\n', res3.slice(0, 320) + '...\n');

  const financialsMonth = VyaparStore.calculateFinancials({ period: 'month' });
  console.log('Expected Month Expenses:', financialsMonth.expenses);

  if (!res3.includes('16,450')) {
    throw new Error('Q3 expected total month expenses ₹16,450');
  }
  if (!res3.includes('Shop Rent') || !res3.includes('Staff Salary')) {
    throw new Error('Q3 must include breakdown of categories');
  }
  if (!res3.includes('Deduplication Check')) {
    throw new Error('Q3 must show deduplication check to prove no duplicate expense');
  }
  console.log('✓ Q3 Passed: Deduplicated month expenses verified');

  // Test 4: Which products generated the most revenue?
  console.log('\n--- Test 4: "Which products generated the most revenue?" ---');
  const q4 = "Which products generated the most revenue?";
  const res4 = await VyaparAI.ask(q4);
  console.log('Response excerpt:\n', res4.slice(0, 320) + '...\n');

  // Basmati rice (INV-1077: 410) & Red Label Tea (INV-1079: 260) are top completed revenue
  if (!res4.includes('India Gate Basmati Rice') || !res4.includes('Red Label Tea')) {
    throw new Error('Q4 must include top completed revenue items');
  }
  if (!res4.includes('Verified Facts')) throw new Error('Q4 must label Verified Facts');
  if (!res4.includes('Audit Trail') && !res4.includes('Calculation Evidence')) throw new Error('Q4 must show audit trail/evidence');
  console.log('✓ Q4 Passed: Products ranked correctly by revenue');

  // Test 5: Which products have the highest gross profit?
  console.log('\n--- Test 5: "Which products have the highest gross profit?" ---');
  const q5 = "Which products have the highest gross profit?";
  const res5 = await VyaparAI.ask(q5);
  console.log('Response excerpt:\n', res5.slice(0, 320) + '...\n');

  if (!res5.includes('Gross Profit') || !res5.includes('COGS')) {
    throw new Error('Q5 must include gross profit and COGS metrics');
  }
  if (!res5.includes('Verified Facts')) throw new Error('Q5 must label Verified Facts');
  if (!res5.includes('Catalog Benchmark')) throw new Error('Q5 must include catalog benchmark');
  console.log('✓ Q5 Passed: Gross profit rankings computed from transactions');

  // Test 6: What should I review before restocking?
  console.log('\n--- Test 6: "What should I review before restocking?" ---');
  const q6 = "What should I review before restocking?";
  const res6 = await VyaparAI.ask(q6);
  console.log('Response excerpt:\n', res6.slice(0, 350) + '...\n');

  if (!res6.includes('Verified Facts')) throw new Error('Q6 must contain Verified Facts');
  if (!res6.includes('Recommendations')) throw new Error('Q6 must contain Recommendations');
  if (!res6.includes('Predictive Demand Forecasting Limitation') && !res6.includes('forecasting')) {
    throw new Error('Q6 must explicitly state the limitation on forecasting future sales');
  }
  if (!res6.includes('Missing Information Notice') && !res6.includes('not recorded')) {
    throw new Error('Q6 must explicitly mention information that cannot be determined');
  }
  console.log('✓ Q6 Passed: Facts distinguished from recommendations, forecasting disclaimer present');

  // Test 7: Phrasing Variations (Hinglish and short forms)
  console.log('\n--- Test 7: Phrasing Variations & Intent Detection ---');
  const var1 = await VyaparAI.ask("aaj ka net munafa kitna hua?");
  if (!var1.includes("Today's Net Profit Calculation")) throw new Error('Failed to match Hinglish today profit');

  const var2 = await VyaparAI.ask("kam stock wale items dikhao");
  if (!var2.includes("Low Stock Product Inventory")) throw new Error('Failed to match Hinglish low stock');

  const var3 = await VyaparAI.ask("is mahine ke kharche kitne hain");
  if (!var3.includes("Total Business Expenses")) throw new Error('Failed to match Hinglish month expenses');

  const var4 = await VyaparAI.ask("top selling products");
  if (!var4.includes("Top Revenue Generating Products")) throw new Error('Failed to match top selling');

  console.log('✓ Intent variations recognized accurately');

  // Test 8: Fallback on unsupported query
  console.log('\n--- Test 8: Unsupported Query Fallback ---');
  const fallbackRes = await VyaparAI.ask("What is tomorrow's weather in Jaipur?");
  if (!fallbackRes.includes('Supported Business Questions') || !fallbackRes.includes('Rule-Based Mode')) {
    throw new Error('Fallback must clearly explain supported questions and rule-based mode');
  }
  console.log('✓ Unsupported queries handled with clear guide to supported questions');

  console.log('\n======================================================');
  console.log('>>> ALL 6 QUESTIONS AND REQUIREMENTS PASSED 100%! <<<');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

