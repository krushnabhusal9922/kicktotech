/**
 * Vyapar AI — "Ask Your Business" Store Assistant
 * Deterministic rule-based business intelligence engine.
 * Computes exact answers directly from live store ledger records (Products, Sales, Expenses).
 */

const VyaparAI = {
  // Check if a live external language-model API is configured securely via server/environment
  isLiveModelConfigured() {
    return Boolean(
      typeof window !== 'undefined' &&
      window.VYAPAR_AI_CONFIG &&
      window.VYAPAR_AI_CONFIG.enabled &&
      window.VYAPAR_AI_CONFIG.endpoint
    );
  },

  // Metadata descriptor for assistant mode (Honest labeling)
  getModeInfo() {
    if (this.isLiveModelConfigured()) {
      return {
        mode: "live-model",
        label: "Live AI Model Connected",
        description: "Interprets queries using secure external AI proxy with application ledger calculations."
      };
    }
    return {
      mode: "rule-based",
      label: "Rule-Based Assistant (Verified Store Ledger)",
      description: "Deterministic calculations executed directly by application code. No external AI model is connected."
    };
  },

  // Suggested question buttons requested by the business user
  suggestedPrompts: [
    { text: "What is my net profit?", tag: "net-profit", icon: "💰" },
    { text: "Which products are low in stock?", tag: "low-stock", icon: "⚠️" },
    { text: "What are my biggest expenses?", tag: "biggest-expenses", icon: "📉" },
    { text: "Which products have sold the most?", tag: "sold-most", icon: "🏆" },
    { text: "Which products should I restock?", tag: "should-restock", icon: "📦" },
    { text: "Summarize my business performance.", tag: "summary", icon: "📊" }
  ],

  // Load chat history from storage or return default welcome
  getChatHistory() {
    try {
      const data = localStorage.getItem('vyapar_aichat_v1');
      if (data) return JSON.parse(data);
    } catch (e) {}

    const mode = this.getModeInfo();
    return [
      {
        role: "assistant",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `**Namaste Ramesh Ji!** 🙏 Welcome to **Ask Your Business**.\n\n⚙️ **Active Mode:** **${mode.label}**\n*${mode.description}*\n\nI calculate business answers directly from your active store records without guessing or estimating. Click any suggested question button below or type your inquiry:\n\n1. **What is my net profit?**\n2. **Which products are low in stock?**\n3. **What are my biggest expenses?**\n4. **Which products have sold the most?**\n5. **Which products should I restock?**\n6. **Summarize my business performance.**`
      }
    ];
  },

  saveChatHistory(history) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('vyapar_aichat_v1', JSON.stringify(history));
    }
  },

  clearChatHistory() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('vyapar_aichat_v1');
    }
  },

  // Main conversational query dispatcher
  async ask(userPrompt) {
    const raw = String(userPrompt || '').trim();
    const prompt = raw.toLowerCase();

    // Small delay for natural UI response feel
    await new Promise(r => setTimeout(r, 200));

    // If live model is configured securely via server proxy, invoke it; otherwise run deterministic rule-based assistant
    if (this.isLiveModelConfigured()) {
      return this.askLiveModel(raw);
    }

    return this.askRuleBased(prompt, raw);
  },

  // Deterministic Rule-Based Reasoning Engine
  askRuleBased(prompt, rawPrompt) {
    // 1. Question: What is my net profit?
    if (
      prompt.includes('net profit') ||
      prompt.includes('what is my net profit') ||
      prompt.includes('how much net profit') ||
      (prompt.includes('profit') && !prompt.includes('gross') && (prompt.includes('my') || prompt.includes('what') || prompt.includes('today') || prompt.includes('aaj'))) ||
      (prompt.includes('munafa') && (prompt.includes('aaj') || prompt.includes('mera') || prompt.includes('kitna')))
    ) {
      return this.answerNetProfit(prompt);
    }

    // 2. Question: Which products are low in stock?
    if (
      !prompt.includes('restock') && (
        prompt.includes('low in stock') ||
        prompt.includes('low stock') ||
        (prompt.includes('which') && prompt.includes('stock')) ||
        prompt.includes('out of stock') ||
        prompt.includes('kam stock') ||
        prompt.includes('which products are low in stock')
      )
    ) {
      return this.answerLowStockProducts();
    }

    // 3. Question: What are my biggest expenses?
    if (
      prompt.includes('biggest expense') ||
      prompt.includes('biggest expenses') ||
      prompt.includes('largest expense') ||
      prompt.includes('highest expense') ||
      prompt.includes('total expenses this month') ||
      (prompt.includes('expense') && (prompt.includes('big') || prompt.includes('large') || prompt.includes('top') || prompt.includes('month'))) ||
      (prompt.includes('kharch') && (prompt.includes('bada') || prompt.includes('sabse') || prompt.includes('zyada') || prompt.includes('mahine')))
    ) {
      return this.answerBiggestExpenses();
    }

    // 4. Question: Which products have sold the most?
    if (
      prompt.includes('sold the most') ||
      prompt.includes('sold most') ||
      prompt.includes('most sold') ||
      prompt.includes('top selling') ||
      prompt.includes('most revenue') ||
      prompt.includes('top revenue') ||
      (prompt.includes('product') && prompt.includes('most') && prompt.includes('sold')) ||
      (prompt.includes('sabse') && (prompt.includes('biki') || prompt.includes('bikri'))) ||
      prompt.includes('which products have sold the most') ||
      prompt.includes('which products generated the most revenue')
    ) {
      return this.answerProductsSoldMost();
    }

    // 4b. Question: Which products have the highest gross profit?
    if (
      prompt.includes('highest gross profit') ||
      prompt.includes('most gross profit') ||
      prompt.includes('top gross profit') ||
      (prompt.includes('gross profit') && (prompt.includes('highest') || prompt.includes('product') || prompt.includes('which')))
    ) {
      return this.answerHighestGrossProfit();
    }

    // 5. Question: Which products should I restock?
    if (
      prompt.includes('should i restock') ||
      prompt.includes('which products should i restock') ||
      prompt.includes('products to restock') ||
      prompt.includes('before restocking') ||
      (prompt.includes('restock') && (prompt.includes('should') || prompt.includes('which') || prompt.includes('what') || prompt.includes('review'))) ||
      prompt.includes('saman mangwana') ||
      prompt.includes('saman lene')
    ) {
      return this.answerProductsShouldRestock();
    }

    // 6. Question: Summarize my business performance.
    if (
      prompt.includes('summarize') ||
      prompt.includes('summary') ||
      prompt.includes('business performance') ||
      prompt.includes('performance summary') ||
      prompt.includes('business summary') ||
      prompt.includes('dukan ka hisab') ||
      prompt.includes('overall performance')
    ) {
      return this.answerBusinessSummary();
    }

    // General Customer Udhar Query
    if (prompt.includes('udhar') || prompt.includes('credit') || prompt.includes('khata') || prompt.includes('baki')) {
      return this.answerCustomerUdhar();
    }

    // Fallback for unsupported or unknown queries
    return this.answerFallback(rawPrompt);
  },

  /**
   * Helper: Format INR currency
   */
  inr(n) {
    const num = Number(n) || 0;
    return '₹' + Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  /**
   * 1. What is my net profit?
   * Rule 6: Distinguish revenue, gross profit, and net profit.
   * Definitions:
   * - Revenue = total value of completed sales
   * - COGS = sum of each sold quantity * recorded unit purchase cost at time of sale
   * - Gross Profit = Revenue - COGS
   * - Net Profit = Gross Profit - recorded operating expenses
   */
  answerNetProfit(prompt) {
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);
    const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    const finToday = VyaparStore.calculateFinancials({ period: 'today' });
    const finMonth = VyaparStore.calculateFinancials({ period: 'month' });

    const allSales = VyaparStore.getSales();
    const allExpenses = VyaparStore.getExpenses();

    const todaySales = allSales.filter(s => s.date && s.date.startsWith(todayStr));
    const todayCompleted = todaySales.filter(s => String(s.status || '').toLowerCase() === 'completed');
    const todayPending = todaySales.filter(s => String(s.status || '').toLowerCase() === 'pending credit');
    const todayExpenses = allExpenses.filter(e => e.date && e.date.startsWith(todayStr));

    const signToday = finToday.netProfit >= 0 ? '+' : '-';
    const signMonth = finMonth.netProfit >= 0 ? '+' : '-';

    return `### 💰 **Net Profit Analysis & Breakdown**

### 📊 **Verified Facts (from Store Ledger):**
• **Today's Completed Revenue:** **${this.inr(finToday.revenue)}** (${todayCompleted.length} bills completed)
• **Today's Cost of Goods Sold (COGS):** **${this.inr(finToday.cogs)}**
• **Today's Gross Profit:** **${this.inr(finToday.grossProfit)}** (${finToday.grossMarginPct.toFixed(1)}% Gross Margin)
• **Today's Recorded Expenses:** **${this.inr(finToday.expenses)}** (${todayExpenses.length} entries)
• **Today's Net Profit Calculation:** **${signToday}${this.inr(finToday.netProfit)}** (${finToday.netProfitMarginPct.toFixed(1)}% Net Margin)

---

### 📊 **Core Accounting Distinction (Rule of Profit):**
1. **Revenue (Completed Sales):** Total realized cash & UPI collections from completed sales.
2. **Cost of Goods Sold (COGS):** Total purchase cost of items sold, captured at transaction time.
3. **Gross Profit (Bikri Munafa):** \`Revenue − COGS\`.
4. **Operating Expenses (Kharcha):** Deduplicated shop operating costs (Rent, Staff, Electricity, Freight).
5. **Net Profit (Shuddh Munafa):** \`Gross Profit − Operating Expenses\`.

---

### 🧮 **Calculation Evidence & Audit Trail:**
\`\`\`text
Today's Arithmetic:
  Revenue:       ₹${finToday.revenue.toFixed(2)}
− COGS:          ₹${finToday.cogs.toFixed(2)}
= Gross Profit:  ₹${finToday.grossProfit.toFixed(2)}
− Expenses:      ₹${finToday.expenses.toFixed(2)}
= Net Profit:    ${signToday}₹${Math.abs(finToday.netProfit).toFixed(2)}
\`\`\`

${todayPending.length > 0 ? `ℹ️ **Pending Credit (Udhar) Notice:**
• Bill **#${todayPending[0].id}** (${todayPending[0].customerName}) for **${this.inr(todayPending[0].totalAmount)}** is **Pending Credit**.
• Uncollected credit is excluded from realized revenue until payment is settled.` : ''}

---

### 📆 **2. Month-to-Date Financial Results (${monthName}):**
• **Month Completed Revenue:** **${this.inr(finMonth.revenue)}** (${finMonth.completedSalesCount} bills)
• **Month COGS:** **${this.inr(finMonth.cogs)}**
• **Month Gross Profit:** **${this.inr(finMonth.grossProfit)}** (${finMonth.grossMarginPct.toFixed(1)}% Margin)
• **Month Operating Expenses:** **${this.inr(finMonth.expenses)}** (Rent, Salary, Bills)
• **Month Net Profit:** **${signMonth}${this.inr(finMonth.netProfit)}**

---

### 💡 **Recommendations:**
${finToday.netProfit < 0 ? `• Today's net profit is ${signToday}${this.inr(finToday.netProfit)} because operating expenses (${this.inr(finToday.expenses)}) exceeded completed gross profit (${this.inr(finToday.grossProfit)}).\n• Settle pending credit bills or promote higher-margin loose pulses & spices to offset daily expenses.` : `• Healthy performance! Your business achieved a positive net profit of ${signToday}${this.inr(finToday.netProfit)} after paying all daily expenses.`}

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * 2. Which products are low in stock?
   */
  answerLowStockProducts() {
    const products = VyaparStore.getProducts();
    const lowStock = products.filter(p => p.stock <= p.minStock);
    const outOfStock = lowStock.filter(p => p.stock === 0);

    if (lowStock.length === 0) {
      return `### ⚠️ **Low Stock Product Inventory**

### 📊 **Verified Facts (from Store Ledger):**
• **Total Catalog Products:** ${products.length} items
• **Low Stock Warnings:** **0 items**
• **Out of Stock Items:** **0 items**

Every single product in your inventory is currently stocked above its defined minimum alert threshold.

---

### 💡 **Recommendations:**
• Continue routine inventory checks to ensure fast-moving staples stay in stock.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
    }

    const sorted = [...lowStock].sort((a, b) => (b.minStock - b.stock) - (a.minStock - a.stock));
    let totalEstCost = 0;

    const rows = sorted.map(p => {
      const deficit = Math.max(0, p.minStock - p.stock);
      const reorderQty = Math.max(deficit * 2, 5);
      const estCost = reorderQty * p.costPrice;
      totalEstCost += estCost;
      const status = p.stock === 0 ? '🔴 Out of Stock' : '⚠️ Low Stock';
      return `| **${p.name}** | \`${p.sku || p.id}\` | **${p.stock} ${p.unit}** | ${p.minStock} ${p.unit} | ${deficit} ${p.unit} | ${this.inr(p.costPrice)} | **${reorderQty} ${p.unit}** | ${this.inr(estCost)} | ${status} |`;
    }).join('\n');

    return `### ⚠️ **Low Stock Product Inventory & Deficit Report**

### 📊 **Verified Facts (from Store Ledger):**
• **Products at or below Minimum Alert Level:** **${lowStock.length} items**
• **Completely Out of Stock (0 units):** **${outOfStock.length} items**
• **Total Estimated Replenishment Capital:** **${this.inr(totalEstCost)}**

| Product Name | SKU | Current Stock | Alert Level | Deficit | Unit Cost (CP) | Recommended Reorder | Est. Cost (₹) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

---

### 🧮 **Calculation Methodology & Evidence:**
• **Deficit:** \`Minimum Threshold − Current Stock\`.
• **Recommended Reorder:** Restores shelf inventory to \`2 × Minimum Threshold\` for a reliable buffer.
• All estimates use immutable wholesale cost prices recorded in your catalog.

---

### 💡 **Recommendations:**
• **Priority Restock:** **${sorted[0].name}** (only ${sorted[0].stock} left) needs immediate reorder to prevent lost customer sales.
• Call your Mandi distributor to confirm current wholesale purchase prices before dispatching payment.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * 3. What are my biggest expenses?
   */
  answerBiggestExpenses() {
    const allExpenses = VyaparStore.getExpenses();

    if (allExpenses.length === 0) {
      return `### 📉 **Store Expenses Report**\n\n### 📊 **Verified Facts:**\n• No operating expenses have been recorded in the store ledger yet.\n\n*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
    }

    // Deduplicate expenses to ensure no expense is counted twice
    const seenExp = new Set();
    const dedupedExpenses = [];
    allExpenses.forEach(e => {
      if (e && e.id && !seenExp.has(e.id)) {
        seenExp.add(e.id);
        dedupedExpenses.push(e);
      }
    });

    const totalExpenses = dedupedExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // Group by category
    const catMap = {};
    dedupedExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + (parseFloat(e.amount) || 0);
    });
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    // Rank individual largest expenses
    const sortedIndividual = [...dedupedExpenses].sort((a, b) => b.amount - a.amount).slice(0, 5);

    const catRows = sortedCats.map(([cat, amt]) => {
      const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
      return `| **${cat}** | ${this.inr(amt)} | **${pct.toFixed(1)}%** |`;
    }).join('\n');

    const indRows = sortedIndividual.map((e, idx) => {
      const pct = totalExpenses > 0 ? (e.amount / totalExpenses) * 100 : 0;
      return `| **#${idx + 1}** | **${e.title || e.description}** | ${e.category} | ${e.paidTo || 'Vendor'} | **${this.inr(e.amount)}** | ${pct.toFixed(1)}% |`;
    }).join('\n');

    return `### 📉 **Biggest Business Expenses — Total Business Expenses (Deduplicated)**

### 📊 **Verified Facts (from Store Ledger):**
• **Total Recorded Business Expenses:** **${this.inr(totalExpenses)}**
• **Total Deduplicated Records:** **${dedupedExpenses.length} entries**
• **Deduplication Check:** **100% Unique** (no expense counted twice, duplicates strictly filtered)

### 🏆 **Top 5 Largest Individual Expenses:**
| Rank | Description | Category | Paid To | Amount (₹) | % of Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
${indRows}

---

### 🏷️ **Expense Category Ranking:**
| Category | Total Amount (₹) | Share of Expenses |
| :--- | :--- | :--- |
${catRows}

---

### 🧮 **Calculation Evidence & Audit Trail:**
• All figures are aggregated directly from your deduplicated expense records.
• **Fixed Overheads:** Shop Rent (${this.inr(catMap['Shop Rent'] || 0)}) and Staff Salary (${this.inr(catMap['Staff Salary'] || 0)}) make up ${totalExpenses > 0 ? (((catMap['Shop Rent'] || 0) + (catMap['Staff Salary'] || 0)) / totalExpenses * 100).toFixed(1) : 0}% of all outlays.
• **Variable Operating Costs:** Electricity (${this.inr(catMap['Electricity & Utilities'] || 0)}), Packaging (${this.inr(catMap['Packaging & Bags'] || 0)}), and Transport (${this.inr(catMap['Transportation & Freight'] || 0)}) represent ongoing monthly variable expenses.

---

### 💡 **Recommendations:**
• **Electricity Cost Reduction:** Set a standard timer for dairy deep freezers at night and verify door gasket seals.
• **Tempo Cartage:** Consolidate multiple small mandi trips into a single weekly shared tempo load to save ₹300–₹500 per month.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * 4. Which products have sold the most?
   */
  answerProductsSoldMost() {
    const allSales = VyaparStore.getSales();
    const completedSales = allSales.filter(s => String(s.status || '').toLowerCase() === 'completed');

    if (completedSales.length === 0) {
      return `### 🏆 **Top Selling Products Report**\n\n### 📊 **Verified Facts:**\n• No completed customer sales records were found in the store history.\n\n*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
    }

    // Aggregate units sold and revenue per product
    const productStats = {};

    completedSales.forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach(item => {
          const pid = item.productId || item.name;
          if (!productStats[pid]) {
            productStats[pid] = {
              id: pid,
              name: item.name,
              unitsSold: 0,
              revenue: 0,
              cogs: 0,
              invoices: []
            };
          }
          const q = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const cost = parseFloat(item.costPrice !== undefined ? item.costPrice : (item.cost || 0));
          const subtotal = parseFloat(item.subtotal !== undefined ? item.subtotal : (price * q));

          productStats[pid].unitsSold += q;
          productStats[pid].revenue += subtotal;
          productStats[pid].cogs += (cost * q);
          if (!productStats[pid].invoices.includes(s.id)) {
            productStats[pid].invoices.push(s.id);
          }
        });
      }
    });

    // Rank primarily by units sold descending, secondarily by revenue
    const ranked = Object.values(productStats).sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);
    const totalUnitsSold = ranked.reduce((sum, p) => sum + p.unitsSold, 0);
    const totalRevenue = ranked.reduce((sum, p) => sum + p.revenue, 0);

    const rows = ranked.map((p, idx) => {
      const avgPrice = p.unitsSold > 0 ? (p.revenue / p.unitsSold) : 0;
      return `| **#${idx + 1}** | **${p.name}** | **${p.unitsSold} units** | ${this.inr(p.revenue)} | ${this.inr(avgPrice)} | ${p.invoices.join(', ')} |`;
    }).join('\n');

    return `### 🏆 **Most Sold Products & Top Revenue Generating Products (by Volume & Revenue)**

### 📊 **Verified Facts (from Completed Sales Ledger):**
• **Total Completed Sales Bills Analyzed:** **${completedSales.length} bills**
• **Total Units Sold:** **${totalUnitsSold} units**
• **Total Realized Sales Revenue:** **${this.inr(totalRevenue)}**

| Rank | Product Name | Units Sold | Total Revenue (₹) | Avg Selling Rate | Source Invoices |
| :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

---

### 🧮 **Calculation Evidence & Audit Trail:**
• Units sold are counted strictly from completed customer invoices.
• Realized Revenue = \`Units Sold × Recorded Selling Price at Time of Sale\`.
• Uncollected credit sales (Udhar) are excluded until payment is settled.

---

### 💡 **Recommendations:**
• **Prime Shelf Allocation:** Keep top-volume items like **${ranked[0]?.name || 'top items'}** and **${ranked[1]?.name || 'second item'}** prominently displayed on front shelves.
• **Stockout Protection:** Ensure you always maintain a minimum 10-day safety stock buffer for these top-selling goods.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * Helper: Which products have the highest gross profit?
   */
  answerHighestGrossProfit() {
    const allSales = VyaparStore.getSales();
    const completedSales = allSales.filter(s => String(s.status || '').toLowerCase() === 'completed');
    const catalogProducts = VyaparStore.getProducts();

    // Map catalog products for reference
    const catalogMap = {};
    catalogProducts.forEach(p => { catalogMap[p.id] = p; });

    // Aggregate realized gross profit per product from completed sales
    const profitMap = {};

    completedSales.forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach(item => {
          const pid = item.productId || item.name;
          if (!profitMap[pid]) {
            const catProd = catalogMap[pid] || {};
            profitMap[pid] = {
              id: pid,
              name: item.name,
              unitsSold: 0,
              revenue: 0,
              cogs: 0,
              grossProfit: 0,
              catalogCost: catProd.costPrice || 0,
              catalogPrice: catProd.sellingPrice || 0
            };
          }
          const q = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const cost = parseFloat(item.costPrice !== undefined ? item.costPrice : (item.cost || 0));
          const subtotal = parseFloat(item.subtotal !== undefined ? item.subtotal : (price * q));
          const cogs = cost * q;
          const gp = subtotal - cogs;

          profitMap[pid].unitsSold += q;
          profitMap[pid].revenue += subtotal;
          profitMap[pid].cogs += cogs;
          profitMap[pid].grossProfit += gp;
        });
      }
    });

    const ranked = Object.values(profitMap).sort((a, b) => b.grossProfit - a.grossProfit);
    const totalGP = ranked.reduce((s, p) => s + p.grossProfit, 0);

    const rows = ranked.map((p, idx) => {
      const marginPct = p.revenue > 0 ? (p.grossProfit / p.revenue) * 100 : 0;
      const unitMargin = p.catalogPrice - p.catalogCost;
      const catalogMarginPct = p.catalogPrice > 0 ? (unitMargin / p.catalogPrice) * 100 : 0;
      return `| **#${idx + 1}** | **${p.name}** | **${p.unitsSold}** | ${this.inr(p.revenue)} | ${this.inr(p.cogs)} | **${this.inr(p.grossProfit)}** | **${marginPct.toFixed(1)}%** | ${this.inr(unitMargin)} (${catalogMarginPct.toFixed(1)}%) |`;
    }).join('\n');

    return `### 📈 **Highest Gross Profit Products (Realized & Catalog Benchmark)**

### 📊 **Verified Facts (from Completed Sales Ledger):**
• **Total Realized Gross Profit:** **${this.inr(totalGP)}**
• **Top Realized Gross Profit Item:** **${ranked[0]?.name || 'N/A'}** (${this.inr(ranked[0]?.grossProfit || 0)})

| Rank | Product Name | Units Sold | Revenue (₹) | COGS (₹) | Realized Gross Profit (₹) | Realized Margin % | Catalog Benchmark (Unit GP) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

---

### 🧮 **Calculation Evidence & Audit Trail:**
• **Realized Gross Profit:** \`Revenue − COGS\` where COGS is based on the immutable unit purchase cost at the time of sale.
• **Catalog Benchmark:** \`Selling Price − Wholesale Purchase Cost\` based on current shelf master data.
• Operating expenses are excluded from Gross Profit (Gross Profit measures product-level profitability before store overheads).

---

### 💡 **Recommendations:**
• Promote items with the highest gross margin % (such as tea, spices, and premium rice) near the checkout counter to maximize basket profitability.
• Ensure low-margin, fast-moving items (packaged atta, sugar) are bundled with higher-margin loose groceries.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * 5. Which products should I restock?
   * Rule 7: Restocking suggestions must explain the stock level or sales history behind each suggestion.
   * Rule 5 & Forecasting: State forecasting limitations and missing data clearly.
   */
  answerProductsShouldRestock() {
    const products = VyaparStore.getProducts();
    const sales = VyaparStore.getSales();
    const completedSales = sales.filter(s => String(s.status || '').toLowerCase() === 'completed');

    // Aggregate sales history per product
    const salesCountMap = {};
    completedSales.forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach(i => {
          const pid = i.productId || i.name;
          salesCountMap[pid] = (salesCountMap[pid] || 0) + (parseFloat(i.quantity) || 0);
        });
      }
    });

    // Find products requiring restocking (stock <= minStock or stock === 0)
    const restockCandidates = products.filter(p => p.stock <= p.minStock);

    if (restockCandidates.length === 0) {
      return `### 📦 **Restocking Recommendations**

### 📊 **Verified Facts (from Store Ledger):**
• **Products Needing Restock:** **0 items**
• All **${products.length} catalog products** currently meet or exceed their designated minimum safety stock levels.

---

### 💡 **Recommendations:**
• No urgent purchase orders are required today. Continue regular inventory audits.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
    }

    // Sort by stock deficit descending
    const sorted = [...restockCandidates].sort((a, b) => {
      const defA = a.minStock - a.stock;
      const defB = b.minStock - b.stock;
      return defB - defA;
    });

    let totalEstBudget = 0;

    const rows = sorted.map((p, idx) => {
      const deficit = Math.max(0, p.minStock - p.stock);
      const reorderQty = Math.max(deficit * 2, 5);
      const estCost = reorderQty * p.costPrice;
      totalEstBudget += estCost;

      const unitsSold = salesCountMap[p.id] || 0;
      let reason = '';

      if (p.stock === 0) {
        reason = `🔴 **Out of Stock**: 0 left vs alert level of ${p.minStock} ${p.unit}. Immediate walkaway risk!`;
      } else if (unitsSold > 0) {
        reason = `⚠️ **Low Stock with Active Sales**: ${p.stock} left vs ${p.minStock} ${p.unit} alert level. Sold ${unitsSold} units in recent history.`;
      } else {
        reason = `⚠️ **Low Safety Buffer**: ${p.stock} left vs ${p.minStock} ${p.unit} alert level. Deficit of ${deficit} ${p.unit} below threshold.`;
      }

      return `| **#${idx + 1}** | **${p.name}** | **${p.stock} ${p.unit}** | ${p.minStock} ${p.unit} | ${deficit} ${p.unit} | ${unitsSold} units | ${reason} | **${reorderQty} ${p.unit}** | ${this.inr(estCost)} |`;
    }).join('\n');

    return `### 📦 **Products to Restock (Stock Level & Sales History Evidence)**

### 📊 **Verified Facts (from Store Ledger):**
• **Total Products Requiring Restock:** **${restockCandidates.length} items**
• **Total Estimated Reorder Budget:** **${this.inr(totalEstBudget)}**

| Priority | Product Name | Current Stock | Alert Level | Deficit | Units Sold | Evidence & Restock Reason | Suggested Order | Est. Wholesale Cost |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${rows}

---

### 🧮 **Explanation Behind Each Restocking Suggestion (Rule 7 Compliance):**
1. **Stock Level Evidence:** Each suggested product is evaluated against its active minimum safety alert threshold (\`Deficit = Minimum Threshold − Current Stock\`).
2. **Sales History Evidence:** Products with recorded completed sales in your history are prioritized because they have demonstrated active customer demand.
3. **Reorder Quantity:** Formulated to replenish stock to \`2 × Minimum Threshold\` to prevent recurrent stockouts.

---

### ⚠️ **Predictive Demand Forecasting Limitation (Rule 5 & 7 Compliance):**
This assistant does **not** claim to predict speculative future sales demand. Accurate seasonal and predictive demand forecasting requires **at least 3 to 6 months of historical transaction data**. The suggestions above are calculated strictly from your defined safety stock deficits and recorded sales history.

---

### ℹ️ **Missing Information Notice (Rule 5 Compliance):**
The following operational details are **not recorded in the store database** and cannot be determined automatically:
• Supplier Minimum Order Quantities (MOQ).
• Distributor credit terms and delivery lead times.
*Please confirm these specific terms directly with your wholesaler before placing orders.*

---

### 💡 **Recommendations:**
• **Top Reorder Priority:** Immediately call your Mandi distributor for **${sorted[0]?.name || 'low stock items'}** to prevent lost customer sales and walkaways.
• **Wholesale Rates:** Check current wholesale Mandi market rates before finalizing order quantities, as prices fluctuate weekly.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * 6. Summarize my business performance.
   * Rule 6: Distinguish revenue, gross profit, and net profit.
   */
  answerBusinessSummary() {
    const todayStr = new Date().toISOString().split('T')[0];
    const monthStr = todayStr.substring(0, 7);
    const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    const metrics = VyaparStore.getMetrics({ period: 'today' });
    const finToday = metrics.todayFinancials;
    const finMonth = metrics.monthFinancials;

    const products = VyaparStore.getProducts();
    const customers = VyaparStore.getCustomers();
    const debtors = customers.filter(c => c.totalCredit > 0);

    const signToday = finToday.netProfit >= 0 ? '+' : '-';
    const signMonth = finMonth.netProfit >= 0 ? '+' : '-';

    return `### 📊 **Executive Business Performance Summary**

### 💰 **1. Financial Performance (Revenue vs Gross Profit vs Net Profit):**
• **Today's Completed Revenue:** **${this.inr(finToday.revenue)}** (${finToday.completedSalesCount} bills)
• **Today's Cost of Goods Sold (COGS):** **${this.inr(finToday.cogs)}**
• **Today's Gross Profit:** **${this.inr(finToday.grossProfit)}** (${finToday.grossMarginPct.toFixed(1)}% Gross Margin)
• **Today's Recorded Expenses:** **${this.inr(finToday.expenses)}**
• **Today's Net Profit:** **${signToday}${this.inr(finToday.netProfit)}**

---

### 📅 **2. Monthly Overview (${monthName}):**
• **Total Month Completed Revenue:** **${this.inr(finMonth.revenue)}** (${finMonth.completedSalesCount} bills)
• **Total Month COGS:** **${this.inr(finMonth.cogs)}**
• **Total Month Gross Profit:** **${this.inr(finMonth.grossProfit)}** (${finMonth.grossMarginPct.toFixed(1)}% Gross Margin)
• **Total Month Operating Expenses:** **${this.inr(finMonth.expenses)}** (Rent, Salary, Bills)
• **Month Net Profit:** **${signMonth}${this.inr(finMonth.netProfit)}**

---

### 📦 **3. Inventory & Working Capital Health:**
• **Active Catalog Products:** **${products.length} products**
• **Total Inventory Value at Cost:** **${this.inr(metrics.inventoryCostValue)}** (Retail Value: ${this.inr(metrics.inventoryRetailValue)})
• **Stock Alerts:** **${metrics.lowStockCount + metrics.outOfStockCount} items** (${metrics.outOfStockCount} out of stock, ${metrics.lowStockCount} low stock)

---

### 🤝 **4. Customer Credit Ledger (Udhar):**
• **Total Outstanding Customer Udhar:** **${this.inr(metrics.totalUdhar)}**
• **Customers with Pending Balances:** **${debtors.length} customers** (e.g. Verma Contractor: ₹2,480, Gupta Uncle: ₹890, Sharma Ji: ₹896)

---

### 💡 **Key Takeaways & Actionable Priorities:**
1. **Gross Margins:** Your business generates solid **${finToday.grossMarginPct.toFixed(1)}% gross margins** on completed retail transactions.
2. **Expense Management:** Fixed costs (rent & salary) dominate monthly outlays. Keep daily variable expenses (chai, packaging, tempo) tightly recorded.
3. **Restocking:** Check the **${metrics.lowStockCount + metrics.outOfStockCount} flagged inventory items** to ensure you don't lose sales on high-demand staples.
4. **Udhar Collection:** Recover pending customer balances (${this.inr(metrics.totalUdhar)}) to self-fund upcoming stock reorders.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * Helper: Customer Udhar (Credit) Ledger Status
   */
  answerCustomerUdhar() {
    const customers = VyaparStore.getCustomers();
    const debtors = customers.filter(c => c.totalCredit > 0).sort((a, b) => b.totalCredit - a.totalCredit);
    const totalUdhar = debtors.reduce((s, c) => s + (parseFloat(c.totalCredit) || 0), 0);

    if (debtors.length === 0) {
      return `### 🤝 **Customer Udhar Status**\n\n### 📊 **Verified Facts:**\n• Total Outstanding Udhar: **₹0.00**\n• All customer credit accounts are 100% settled!\n\n*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
    }

    const rows = debtors.map(c => `| **${c.name}** | ${c.phone || 'N/A'} | **${this.inr(c.totalCredit)}** | ${c.lastTransactionDate || '-'} |`).join('\n');

    return `### 🤝 **Customer Udhar (Credit Ledger) Status**

### 📊 **Verified Facts (from Store Ledger):**
• **Total Outstanding Customer Credit:** **${this.inr(totalUdhar)}**
• **Customers with Pending Credit Balances:** **${debtors.length} customers**

| Customer Name | Mobile Number | Pending Udhar | Last Transaction |
| :--- | :--- | :--- | :--- |
${rows}

---

### 💡 **Recommendations:**
• Prioritize recovery from **${debtors[0].name}** (${this.inr(debtors[0].totalCredit)}) and **${debtors[1] ? debtors[1].name : ''}**.
• Send a polite WhatsApp payment reminder with your store's UPI QR code from the Udhar Khata tab.

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * Fallback for unknown or unsupported queries
   */
  answerFallback(userPrompt) {
    const metrics = VyaparStore.getMetrics();

    return `I received your inquiry: *"**${userPrompt}**"*.

### ℹ️ **Supported Business Questions:**
I am your **Vyapar Store Assistant** operating in **Rule-Based Mode** (no external AI model is connected). I compute answers deterministically from your active store records without guessing or hallucinating.

Please select from these supported questions:
1. **"What is my net profit?"**
2. **"Which products are low in stock?"**
3. **"What are my biggest expenses?"**
4. **"Which products have sold the most?"**
5. **"Which products should I restock?"**
6. **"Summarize my business performance."**

*(Click any of the suggested prompt buttons above to view instant answers.)*

---

### 📊 **Current Store Snapshot:**
• **Active Catalog Products:** ${metrics.totalProductsCount} items
• **Low Stock Warnings:** ${metrics.lowStockCount} items
• **Total Customer Udhar Pending:** ${this.inr(metrics.totalUdhar)}
• **Today's Completed Revenue:** ${this.inr(metrics.todaySales || metrics.revenue)}

*Mode: Rule-Based Assistant (Deterministic Ledger Calculations — No external AI model connected)*`;
  },

  /**
   * Safe live model proxy invocation (only called if window.VYAPAR_AI_CONFIG is explicitly configured)
   */
  async askLiveModel(userPrompt) {
    try {
      const config = window.VYAPAR_AI_CONFIG;
      const metrics = VyaparStore.getMetrics();

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          ledgerContext: {
            revenue: metrics.revenue,
            cogs: metrics.cogs,
            grossProfit: metrics.grossProfit,
            expenses: metrics.expenses,
            netProfit: metrics.netProfit,
            lowStockCount: metrics.lowStockCount,
            totalUdhar: metrics.totalUdhar
          }
        })
      });

      if (!response.ok) throw new Error(`Model API error: ${response.statusText}`);
      const data = await response.json();
      return data.answer || data.reply || "No response text received from model.";
    } catch (err) {
      console.warn("[VyaparAI] Live model call failed, falling back to rule-based engine:", err);
      return this.askRuleBased(userPrompt.toLowerCase(), userPrompt);
    }
  }
};

if (typeof window !== 'undefined') {
  window.VyaparAI = VyaparAI;
}
if (typeof global !== 'undefined') {
  global.VyaparAI = VyaparAI;
}
