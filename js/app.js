/**
 * Vyapar AI — Master Application Controller
 * Handles Navigation, POS Cart, Sales, Expenses, Inventory, Modals, Sound, and Insights.
 */

// Global Audio Chime Synthesizer using Web Audio API
const SoundManager = {
  enabled: true,
  ctx: null,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // Audio fallback silent
    }
  },

  playAlert() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
};

// UI Toast Manager
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = '✓';
  if (type === 'danger') icon = '✕';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// Format Currency
function formatINR(val) {
  return '₹' + Math.round(Number(val) || 0).toLocaleString('en-IN');
}

// Master App State
const AppState = {
  currentTab: 'dashboard',
  cart: [],
  selectedPaymentMode: 'UPI',
  activeReceipt: null,
  isSubmitting: false
};

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDashboard();
  initPOS();
  initDirectSaleModal();
  initSalesTable();
  initExpenses();
  initInventory();
  initCalculator();
  initAIAssistant();
  initInsights();
  initUdharLedger();
  initModals();
  initHeaderClock();

  // Resize listener for Canvas charts
  window.addEventListener('resize', () => {
    if (AppState.currentTab === 'dashboard') {
      VyaparCharts.renderSalesExpenseTrend('trendCanvas');
      VyaparCharts.renderCategoryDonut('categoryCanvas');
      VyaparCharts.renderPaymentModeChart('payModeCanvas');
    } else if (AppState.currentTab === 'insights') {
      VyaparCharts.renderInsightsDailyTrend('insightsTrendCanvas', 'insightsTrendEmptyState');
    }
  });
});

// Live clock and Date in Header
function initHeaderClock() {
  const dateEl = document.getElementById('currentDateDisplay');
  if (dateEl) {
    const updateTime = () => {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }
}

// Tab Navigation Controller
function initNavigation() {
  const navItems = document.querySelectorAll('[data-tab-target]');
  const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
  const sidebar = document.getElementById('appSidebar');
  const mobileMenuBtn = document.getElementById('mobileMenuToggle');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  const switchTab = (tabId) => {
    AppState.currentTab = tabId;

    // Update active nav items
    navItems.forEach(item => {
      if (item.getAttribute('data-tab-target') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update mobile bottom nav
    mobileNavBtns.forEach(btn => {
      if (btn.getAttribute('data-tab-target') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show active tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) targetPane.classList.add('active');

    // Update Header Title
    const titleEl = document.getElementById('headerPageTitle');
    const subtitleEl = document.getElementById('headerPageSubtitle');
    const titles = {
      dashboard: { title: "Dukan Dashboard", sub: "Real-time overview of your grocery store performance" },
      sales: { title: "Sales & Billing (Bikri)", sub: "Quick Point of Sale, Barcode search & Invoicing" },
      expenses: { title: "Expense Manager (Kharcha)", sub: "Track store expenses, rent, mandi tempo & bills" },
      inventory: { title: "Inventory & Stock Control", sub: "Manage products, Cost vs Selling Price & Low stock alerts" },
      calculator: { title: "Profit & Margin Calculator", sub: "Calculate margins, discounts & Net P&L analysis" },
      ai: { title: "Vyapar AI Co-Pilot", sub: "Ask your business anything in plain English or Hinglish" },
      insights: { title: "Smart Insights & Alerts Hub", sub: "Wholesaler WhatsApp orders & Udhar recovery reminders" },
      udhar: { title: "Customer Udhar Bahi Khata", sub: "Customer credit ledgers, balances & WhatsApp reminders" }
    };

    if (titles[tabId] && titleEl) {
      titleEl.textContent = titles[tabId].title;
      if (subtitleEl) subtitleEl.textContent = titles[tabId].sub;
    }

    // Tab specific refresh
    if (tabId === 'dashboard') {
      refreshDashboardMetrics();
      setTimeout(() => {
        VyaparCharts.renderSalesExpenseTrend('trendCanvas');
        VyaparCharts.renderCategoryDonut('categoryCanvas');
        VyaparCharts.renderPaymentModeChart('payModeCanvas');
      }, 50);
    } else if (tabId === 'sales') {
      renderPOSCatalog();
      renderCart();
      renderSalesTable();
    } else if (tabId === 'expenses') {
      renderExpensesTable();
    } else if (tabId === 'inventory') {
      renderInventoryTable();
    } else if (tabId === 'insights') {
      renderInsightsHub();
    } else if (tabId === 'udhar') {
      renderUdharTable();
    }

    // Close mobile drawer if open
    if (sidebar) sidebar.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-tab-target');
      switchTab(target);
    });
  });

  mobileNavBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-tab-target');
      switchTab(target);
    });
  });

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  }

  // Quick Action Buttons in Header
  document.getElementById('headerNewSaleBtn')?.addEventListener('click', () => switchTab('sales'));
  document.getElementById('headerAddExpBtn')?.addEventListener('click', () => openModal('addExpenseModal'));
  document.getElementById('headerAddPrdBtn')?.addEventListener('click', openAddProductModal);
  document.getElementById('resetDataBtn')?.addEventListener('click', () => {
    if (confirm("Reset all data to default realistic Indian Kirana store sample? Any custom changes will be restored.")) {
      VyaparStore.resetToDefault();
      showToast("Data restored to default sample successfully!", "success");
      switchTab('dashboard');
    }
  });

  // Export Data to JSON
  document.getElementById('exportDataBtn')?.addEventListener('click', () => {
    const backup = {
      settings: VyaparStore.getSettings(),
      products: VyaparStore.getProducts(),
      sales: VyaparStore.getSales(),
      expenses: VyaparStore.getExpenses(),
      customers: VyaparStore.getCustomers(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vyapar_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast("Business data exported to JSON!", "success");
  });
}

// Dashboard Page Controller
function initDashboard() {
  refreshDashboardMetrics();
  renderDashboardTables();

  setTimeout(() => {
    VyaparCharts.renderSalesExpenseTrend('trendCanvas');
    VyaparCharts.renderCategoryDonut('categoryCanvas');
    VyaparCharts.renderPaymentModeChart('payModeCanvas');
  }, 100);
}

function refreshDashboardMetrics() {
  const metrics = VyaparStore.getMetrics();

  const todaySalesEl = document.getElementById('kpiTodaySales');
  if (todaySalesEl) todaySalesEl.textContent = formatINR(metrics.todaySales);

  const breakdownEl = document.getElementById('kpiTodaySalesBreakdown');
  if (breakdownEl) breakdownEl.textContent = `Cash: ${formatINR(metrics.todayCash)} • UPI: ${formatINR(metrics.todayUPI)} • Udhar: ${formatINR(metrics.todayUdhar)}`;

  const profitEl = document.getElementById('kpiTodayProfit');
  if (profitEl) profitEl.textContent = formatINR(metrics.todayProfit);

  const marginBadge = document.getElementById('kpiTodayMarginBadge');
  if (marginBadge) {
    const marginPct = metrics.todaySales > 0 ? Math.round((metrics.todayProfit / metrics.todaySales) * 100) : 0;
    marginBadge.textContent = `${marginPct}% Margin`;
  }

  const monthSalesEl = document.getElementById('kpiMonthSales');
  if (monthSalesEl) monthSalesEl.textContent = formatINR(metrics.monthSales);

  const monthNetEl = document.getElementById('kpiMonthNetProfit');
  if (monthNetEl) monthNetEl.textContent = `Net Profit: ${formatINR(metrics.monthNetProfit)}`;

  const udharEl = document.getElementById('kpiTotalUdhar');
  if (udharEl) udharEl.textContent = formatINR(metrics.totalUdhar);

  const udharCountEl = document.getElementById('kpiUdharCount');
  if (udharCountEl) udharCountEl.textContent = `${metrics.pendingUdharCustomersCount} Customers Pending`;

  const lowStockCountEl = document.getElementById('kpiLowStockCount');
  if (lowStockCountEl) lowStockCountEl.textContent = `${metrics.lowStockCount + metrics.outOfStockCount} Items`;

  const stockMetaEl = document.getElementById('kpiStockMeta');
  if (stockMetaEl) stockMetaEl.textContent = `${metrics.outOfStockCount} Out of Stock • ${metrics.lowStockCount} Low`;

  // Sidebar badge for low stock
  const badgeEl = document.getElementById('sidebarLowStockBadge');
  if (badgeEl) {
    const totalAlerts = metrics.lowStockCount + metrics.outOfStockCount;
    badgeEl.textContent = totalAlerts;
    badgeEl.style.display = totalAlerts > 0 ? 'inline-block' : 'none';
  }

  // Keep Business Insights section synchronized with live data
  if (typeof renderInsightsHub === 'function') {
    renderInsightsHub();
  }
}

function renderDashboardTables() {
  // Recent 5 Sales
  const sales = VyaparStore.getSales().slice(0, 5);
  const salesContainer = document.getElementById('dashboardRecentSales');
  if (salesContainer) {
    if (sales.length === 0) {
      salesContainer.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:2rem;">No recent transactions yet.</td></tr>`;
    } else {
      salesContainer.innerHTML = sales.map(s => `
        <tr>
          <td><strong>${s.id}</strong><br><small style="color:#64748b;">${new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
          <td>${s.customerName}</td>
          <td>${getPaymentBadge(s.paymentMode)}</td>
          <td><strong>${formatINR(s.totalAmount)}</strong></td>
          <td>${s.isDemo ? '<span class="data-origin-badge demo">Sample</span>' : '<span class="data-origin-badge user">User</span>'}</td>
          <td>
            <button class="quick-action-btn outline" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="viewReceipt('${s.id}')">
              🧾 Bill
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Critical Low Stock widget
  const products = VyaparStore.getProducts();
  const lowItems = products.filter(p => p.stock <= p.minStock).slice(0, 5);
  const lowStockContainer = document.getElementById('dashboardLowStockList');
  if (lowStockContainer) {
    if (lowItems.length === 0) {
      lowStockContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#10b981; padding:1.5rem;">All items are well stocked! 🎉</td></tr>`;
    } else {
      lowStockContainer.innerHTML = lowItems.map(p => `
        <tr>
          <td><strong>${p.name}</strong><br><small style="color:#64748b;">${p.category}</small></td>
          <td><span style="font-weight:700; color:${p.stock === 0 ? '#e11d48' : '#d97706'}">${p.stock} ${p.unit}</span> (Min: ${p.minStock})</td>
          <td>
            <button class="quick-action-btn success" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="quickRestockItem('${p.id}', 10)">
              +10 Restock
            </button>
          </td>
        </tr>
      `).join('');
    }
  }
}

function getPaymentBadge(mode) {
  if (mode === 'UPI') return `<span class="pay-badge upi">📱 UPI / QR</span>`;
  if (mode === 'Udhar') return `<span class="pay-badge udhar">📝 Udhar (Credit)</span>`;
  return `<span class="pay-badge cash">💵 Cash</span>`;
}

// POS (Point of Sale) Controller
function initPOS() {
  const searchInput = document.getElementById('posSearchInput');
  const catFilter = document.getElementById('posCategoryFilter');

  if (searchInput) {
    searchInput.addEventListener('input', () => renderPOSCatalog());
  }
  if (catFilter) {
    catFilter.addEventListener('change', () => renderPOSCatalog());
  }

  // Payment mode button handlers
  const payBtns = document.querySelectorAll('.pay-mode-btn');
  payBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      payBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.selectedPaymentMode = btn.getAttribute('data-mode');

      // If Udhar selected, show prompt for customer name
      const nameInput = document.getElementById('posCustomerName');
      if (AppState.selectedPaymentMode === 'Udhar' && nameInput && !nameInput.value.trim()) {
        nameInput.focus();
        showToast("Please enter customer name for Udhar entry", "warning");
      }
    });
  });

  // Complete Sale Button
  document.getElementById('completeSaleBtn')?.addEventListener('click', () => processCheckout(false));
  document.getElementById('completeSalePrintBtn')?.addEventListener('click', () => processCheckout(true));

  // Initialize POS Sale Date & Time to current local time
  const posDateInput = document.getElementById('posSaleDate');
  if (posDateInput && !posDateInput.value) {
    const now = new Date();
    posDateInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  // Populate POS Customer selector dropdown
  populateCustomerDatalist();
}

// Global modal opener for Record a Sale
function openRecordSaleModal() {
  const select = document.getElementById('directSaleProductSelect');
  if (!select) return;

  const products = VyaparStore.getProducts();
  select.innerHTML = '<option value="">-- Choose Product --</option>' + products.map(p => `
    <option value="${p.id}" data-price="${p.sellingPrice}" data-cost="${p.costPrice}" data-stock="${p.stock}" data-unit="${p.unit}">
      ${p.name} — ${formatINR(p.sellingPrice)} (Stock: ${p.stock} ${p.unit})
    </option>
  `).join('');

  const dateInput = document.getElementById('directSaleDate');
  if (dateInput) {
    const now = new Date();
    dateInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  const qtyInput = document.getElementById('directSaleQuantity');
  if (qtyInput) qtyInput.value = 1;

  const custInput = document.getElementById('directSaleCustomer');
  if (custInput) custInput.value = '';

  const paySelect = document.getElementById('directSalePaymentMode');
  if (paySelect) paySelect.value = 'Cash';

  const hint = document.getElementById('directSaleStockHint');
  if (hint) hint.textContent = 'Please choose a product above.';

  const unitPriceInput = document.getElementById('directSaleUnitPrice');
  if (unitPriceInput) unitPriceInput.value = '₹0';

  const calcNote = document.getElementById('directSaleCalculationNote');
  if (calcNote) calcNote.textContent = 'Selling Price × Quantity';

  const totalEl = document.getElementById('directSaleTotal');
  if (totalEl) totalEl.textContent = '₹0';

  openModal('recordSaleModal');
}

function initDirectSaleModal() {
  const select = document.getElementById('directSaleProductSelect');
  const qtyInput = document.getElementById('directSaleQuantity');
  const form = document.getElementById('recordSaleForm');

  const updateDirectSaleTotal = () => {
    const prdId = select?.value;
    const qty = parseInt(qtyInput?.value) || 0;
    const hint = document.getElementById('directSaleStockHint');
    const totalEl = document.getElementById('directSaleTotal');
    const unitPriceInput = document.getElementById('directSaleUnitPrice');
    const calcNote = document.getElementById('directSaleCalculationNote');

    if (!prdId) {
      if (hint) hint.textContent = 'Please choose a product above.';
      if (unitPriceInput) unitPriceInput.value = '₹0';
      if (totalEl) totalEl.textContent = '₹0';
      if (calcNote) calcNote.textContent = 'Selling Price × Quantity';
      return;
    }

    const prd = VyaparStore.getProductById(prdId);
    if (!prd) return;

    if (unitPriceInput) unitPriceInput.value = formatINR(prd.sellingPrice);

    if (hint) {
      if (prd.stock <= 0) {
        hint.innerHTML = `<span style="color:#e11d48; font-weight:bold;">Out of stock! (0 ${prd.unit})</span>`;
      } else if (qty > prd.stock) {
        hint.innerHTML = `<span style="color:#e11d48; font-weight:bold;">Cannot sell: Requested ${qty} exceeds available stock (${prd.stock} ${prd.unit})!</span>`;
      } else {
        hint.innerHTML = `Available Stock: <strong>${prd.stock} ${prd.unit}</strong> • Rate: ₹${prd.sellingPrice}/${prd.unit}`;
      }
    }

    const total = Math.max(0, qty * prd.sellingPrice);
    if (totalEl) totalEl.textContent = formatINR(total);
    if (calcNote) calcNote.textContent = `${formatINR(prd.sellingPrice)} × ${qty} ${prd.unit || 'units'}`;
  };

  select?.addEventListener('change', updateDirectSaleTotal);
  qtyInput?.addEventListener('input', updateDirectSaleTotal);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (AppState.isSubmitting) return;

    const prdId = select?.value;
    const qty = parseInt(qtyInput?.value) || 0;
    const dateVal = document.getElementById('directSaleDate')?.value;
    const customer = document.getElementById('directSaleCustomer')?.value.trim() || 'Walk-in Customer';
    const payMode = document.getElementById('directSalePaymentMode')?.value || 'Cash';

    if (!prdId) {
      showToast('Please select a product!', 'warning');
      return;
    }

    const prd = VyaparStore.getProductById(prdId);
    if (!prd) {
      showToast('Selected product not found!', 'danger');
      return;
    }

    if (qty <= 0) {
      showToast('Please enter a valid quantity of 1 or more!', 'warning');
      return;
    }

    if (prd.stock < qty) {
      showToast(`Cannot record sale: Insufficient stock for "${prd.name}". Available: ${prd.stock} ${prd.unit}`, 'danger');
      SoundManager.playAlert();
      return;
    }

    AppState.isSubmitting = true;
    const submitBtn = document.getElementById('directSaleSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const subtotal = prd.sellingPrice * qty;
      const totalCost = prd.costPrice * qty;

      const sale = VyaparStore.recordSale({
        date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString(),
        customerName: customer,
        customerPhone: '',
        paymentMode: payMode,
        items: [{
          productId: prd.id,
          name: prd.name,
          price: prd.sellingPrice,
          costPrice: prd.costPrice,
          quantity: qty,
          subtotal: subtotal
        }],
        totalAmount: subtotal,
        totalCost: totalCost,
        notes: 'Direct recorded sale'
      });

      SoundManager.playChime();
      showToast(`Sale recorded successfully! Bill #${sale.id} for ${formatINR(subtotal)}`, 'success');
      closeModal('recordSaleModal');

      // Refresh all dependent views
      renderPOSCatalog();
      renderCart();
      renderSalesTable();
      renderInventoryTable();
      refreshDashboardMetrics();
      renderDashboardTables();
      populateCustomerDatalist();

      setTimeout(() => {
        VyaparCharts.renderSalesExpenseTrend('trendCanvas');
        VyaparCharts.renderCategoryDonut('categoryCanvas');
        VyaparCharts.renderPaymentModeChart('payModeCanvas');
      }, 50);

      viewReceipt(sale.id, false);
    } catch (err) {
      showToast(err.message, 'danger');
      SoundManager.playAlert();
    } finally {
      AppState.isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function populateCustomerDatalist() {
  const datalist = document.getElementById('existingCustomersList');
  if (datalist) {
    const customers = VyaparStore.getCustomers();
    datalist.innerHTML = customers.map(c => `<option value="${c.name}">${c.phone ? '📞 ' + c.phone : ''} (Balance: ₹${c.totalCredit})</option>`).join('');
  }
}

function renderPOSCatalog() {
  const container = document.getElementById('posProductsGrid');
  if (!container) return;

  const query = (document.getElementById('posSearchInput')?.value || '').toLowerCase().trim();
  const category = document.getElementById('posCategoryFilter')?.value || 'All';

  const products = VyaparStore.getProducts();
  const filtered = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query));
    const matchesCat = category === 'All' || p.category === category;
    return matchesQuery && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:#94a3b8;">No matching products found.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => {
    let stockBadgeClass = '';
    let stockLabel = `${p.stock} ${p.unit}`;
    if (p.stock === 0) {
      stockBadgeClass = 'out';
      stockLabel = 'Out of Stock';
    } else if (p.stock <= p.minStock) {
      stockBadgeClass = 'low';
      stockLabel = `Low: ${p.stock} ${p.unit}`;
    }

    return `
      <div class="pos-item-card" onclick="addToCart('${p.id}')">
        <div>
          <div class="pos-item-title">${p.name}</div>
          <div class="pos-item-category">${p.category}</div>
        </div>
        <div class="pos-item-footer">
          <span class="pos-price">${formatINR(p.sellingPrice)}</span>
          <span class="pos-stock-badge ${stockBadgeClass}">${stockLabel}</span>
        </div>
      </div>
    `;
  }).join('');
}

function addToCart(productId) {
  const product = VyaparStore.getProductById(productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast(`${product.name} is Out of Stock!`, "danger");
    SoundManager.playAlert();
    return;
  }

  const existing = AppState.cart.find(item => item.productId === productId);
  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast(`Only ${product.stock} ${product.unit} available in stock!`, "warning");
      return;
    }
    existing.quantity++;
    existing.subtotal = existing.quantity * existing.price;
  } else {
    AppState.cart.push({
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      costPrice: product.costPrice,
      unit: product.unit,
      quantity: 1,
      subtotal: product.sellingPrice
    });
  }

  SoundManager.playChime();
  renderCart();
}

function updateCartQty(productId, delta) {
  const item = AppState.cart.find(i => i.productId === productId);
  if (!item) return;

  const product = VyaparStore.getProductById(productId);
  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (product && newQty > product.stock) {
    showToast(`Only ${product.stock} available in stock!`, "warning");
    return;
  }

  item.quantity = newQty;
  item.subtotal = item.quantity * item.price;
  renderCart();
}

function removeFromCart(productId) {
  AppState.cart = AppState.cart.filter(i => i.productId !== productId);
  renderCart();
}

function clearCart() {
  AppState.cart = [];
  renderCart();
}

function renderCart() {
  const container = document.getElementById('posCartItemsList');
  if (!container) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2.5rem 1rem; color: #94a3b8;">
        <span style="font-size: 2.5rem; display:block; margin-bottom: 0.5rem;">🛒</span>
        Cart is empty.<br>Click items on the left to add to bill.
      </div>
    `;
    updateCartTotals(0, 0, 0);
    return;
  }

  let totalAmount = 0;
  let totalCost = 0;

  container.innerHTML = AppState.cart.map(item => {
    totalAmount += item.subtotal;
    totalCost += (item.costPrice * item.quantity);

    return `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${formatINR(item.price)} × ${item.quantity} ${item.unit}</p>
        </div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="updateCartQty('${item.productId}', -1)">−</button>
          <span class="cart-qty-text">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="updateCartQty('${item.productId}', 1)">+</button>
          <span class="cart-item-subtotal">${formatINR(item.subtotal)}</span>
          <button class="cart-remove-btn" onclick="removeFromCart('${item.productId}')">✕</button>
        </div>
      </div>
    `;
  }).join('');

  updateCartTotals(totalAmount, totalCost, AppState.cart.length);
}

function updateCartTotals(totalAmount, totalCost, count) {
  const subtotalEl = document.getElementById('posCartSubtotal');
  const discountInput = document.getElementById('posCartDiscount');
  const totalEl = document.getElementById('posCartTotal');
  const profitEl = document.getElementById('posCartProfitPreview');
  const countBadge = document.getElementById('posCartItemsCount');

  const discount = parseFloat(discountInput?.value) || 0;
  const finalTotal = Math.max(0, totalAmount - discount);
  const estimatedProfit = Math.max(0, finalTotal - totalCost);

  if (subtotalEl) subtotalEl.textContent = formatINR(totalAmount);
  if (totalEl) totalEl.textContent = formatINR(finalTotal);
  if (profitEl) profitEl.textContent = `Est. Profit: ${formatINR(estimatedProfit)}`;
  if (countBadge) countBadge.textContent = `${count} items`;
}

function processCheckout(andPrint = false) {
  if (AppState.isSubmitting) return;

  if (AppState.cart.length === 0) {
    showToast("Please add items to cart first!", "warning");
    return;
  }

  const custNameInput = document.getElementById('posCustomerName');
  const custPhoneInput = document.getElementById('posCustomerPhone');
  const discountInput = document.getElementById('posCartDiscount');
  const posDateInput = document.getElementById('posSaleDate');

  const customerName = custNameInput?.value.trim() || "Walk-in Customer";
  const customerPhone = custPhoneInput?.value.trim() || "";
  const discount = parseFloat(discountInput?.value) || 0;
  const dateVal = posDateInput?.value;
  const saleDate = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();

  if (AppState.selectedPaymentMode === 'Udhar' && customerName === "Walk-in Customer") {
    showToast("Please enter Customer Name for Udhar (Credit) entry!", "danger");
    custNameInput?.focus();
    return;
  }

  AppState.isSubmitting = true;
  const btn1 = document.getElementById('completeSaleBtn');
  const btn2 = document.getElementById('completeSalePrintBtn');
  if (btn1) btn1.disabled = true;
  if (btn2) btn2.disabled = true;

  try {
    let totalAmount = 0;
    let totalCost = 0;
    AppState.cart.forEach(i => {
      totalAmount += i.subtotal;
      totalCost += (i.costPrice * i.quantity);
    });
    const finalAmount = Math.max(0, totalAmount - discount);

    const saleRecord = VyaparStore.recordSale({
      date: saleDate,
      customerName,
      customerPhone,
      paymentMode: AppState.selectedPaymentMode,
      items: [...AppState.cart],
      totalAmount: finalAmount,
      totalCost: totalCost,
      notes: discount > 0 ? `Discount ₹${discount} applied` : ""
    });

    SoundManager.playChime();
    showToast(`Bill #${saleRecord.id} generated for ${formatINR(finalAmount)}!`, "success");

    // Reset cart & inputs
    AppState.cart = [];
    if (custNameInput) custNameInput.value = '';
    if (custPhoneInput) custPhoneInput.value = '';
    if (discountInput) discountInput.value = '0';
    if (posDateInput) {
      const now = new Date();
      posDateInput.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }

    renderCart();
    renderPOSCatalog();
    renderSalesTable();
    renderInventoryTable();
    refreshDashboardMetrics();
    renderDashboardTables();
    populateCustomerDatalist();

    setTimeout(() => {
      VyaparCharts.renderSalesExpenseTrend('trendCanvas');
      VyaparCharts.renderCategoryDonut('categoryCanvas');
      VyaparCharts.renderPaymentModeChart('payModeCanvas');
    }, 50);

    // If print requested or view
    viewReceipt(saleRecord.id, andPrint);
  } catch (err) {
    showToast(err.message, "danger");
    SoundManager.playAlert();
  } finally {
    AppState.isSubmitting = false;
    if (btn1) btn1.disabled = false;
    if (btn2) btn2.disabled = false;
  }
}

// Receipt & Invoice Generator Modal
function viewReceipt(invoiceId, autoPrint = false) {
  const sales = VyaparStore.getSales();
  const sale = sales.find(s => s.id === invoiceId);
  if (!sale) return;

  AppState.activeReceipt = sale;
  const settings = VyaparStore.getSettings();
  const receiptArea = document.getElementById('receipt-printable-area');

  const itemsRows = sale.items.map(item => `
    <tr>
      <td style="text-align:left;">${item.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">₹${item.price}</td>
      <td style="text-align:right;">₹${item.subtotal}</td>
    </tr>
  `).join('');

  receiptArea.innerHTML = `
    <div class="receipt-paper">
      <div class="receipt-center">
        <h2>${settings.shopName}</h2>
        <p style="font-size:0.75rem;">${settings.address}</p>
        <p style="font-size:0.75rem;">Ph: ${settings.phone} | GST: ${settings.gstin}</p>
        <div class="receipt-divider"></div>
        <p><strong>RETAIL CASH/CREDIT MEMO</strong></p>
      </div>

      <div style="font-size:0.78rem; margin-bottom: 0.5rem;">
        <div><strong>Bill No:</strong> ${sale.id}</div>
        <div><strong>Date:</strong> ${new Date(sale.date).toLocaleString('en-IN')}</div>
        <div><strong>Customer:</strong> ${sale.customerName} ${sale.customerPhone ? `(${sale.customerPhone})` : ''}</div>
        <div><strong>Payment:</strong> ${sale.paymentMode.toUpperCase()}</div>
      </div>

      <div class="receipt-divider"></div>

      <table class="receipt-table">
        <thead>
          <tr style="border-bottom: 1px dashed #94a3b8; font-weight:bold;">
            <th style="text-align:left;">Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Rate</th>
            <th style="text-align:right;">Amt</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="receipt-divider"></div>

      <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1rem; margin:0.35rem 0;">
        <span>NET PAYABLE:</span>
        <span>${formatINR(sale.totalAmount)}</span>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-center" style="margin-top:0.75rem;">
        <p style="font-size:0.75rem;">Scan & Pay via UPI:</p>
        <div style="margin: 0.35rem auto; width: 100px; height: 100px; background: #f1f5f9; border: 1px solid #cbd5e1; display:flex; align-items:center; justify-content:center; border-radius: 4px;">
          <span style="font-size:0.65rem; color:#64748b; text-align:center;">UPI QR Code<br><strong>${settings.upiId}</strong></span>
        </div>
        <p style="font-size:0.78rem; margin-top:0.35rem;">*** Thank You, Phir Padhaariye! ***</p>
      </div>
    </div>
  `;

  openModal('receiptModal');

  if (autoPrint) {
    setTimeout(() => {
      window.print();
    }, 300);
  }
}

// Sales History Table Controller
function initSalesTable() {
  const searchInput = document.getElementById('salesSearchInput');
  const payFilter = document.getElementById('salesPaymentFilter');

  if (searchInput) searchInput.addEventListener('input', renderSalesTable);
  if (payFilter) payFilter.addEventListener('change', renderSalesTable);

  renderSalesTable();
}

function renderSalesTable() {
  const container = document.getElementById('salesTableBody');
  if (!container) return;

  const query = (document.getElementById('salesSearchInput')?.value || '').toLowerCase().trim();
  const payMode = document.getElementById('salesPaymentFilter')?.value || 'All';

  const sales = VyaparStore.getSales();
  const filtered = sales.filter(s => {
    const matchesQuery = s.id.toLowerCase().includes(query) || s.customerName.toLowerCase().includes(query);
    const matchesPay = payMode === 'All' || s.paymentMode === payMode;
    return matchesQuery && matchesPay;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2.5rem; color:#94a3b8;">No matching sales found.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const isCompleted = String(s.status || '').toLowerCase() === 'completed';
    const statusBadge = isCompleted
      ? `<span class="status-badge completed">Completed</span>`
      : `<span class="status-badge pending">Pending Credit</span>`;

    // Detailed item breakdown with item name, quantity, and unit selling price
    const itemsListHtml = Array.isArray(s.items) && s.items.length > 0
      ? s.items.map(i => `<div style="font-size:0.78rem; line-height:1.45;"><strong>${i.name}</strong> × ${i.quantity} @ ${formatINR(i.price)}</div>`).join('')
      : `<span style="color:#94a3b8;">No items</span>`;

    return `
      <tr>
        <td><strong>${s.id}</strong></td>
        <td>${new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} <small style="color:#64748b;">${new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
        <td>
          <strong>${s.customerName}</strong>
          ${s.customerPhone ? `<br><small style="color:#64748b;">${s.customerPhone}</small>` : ''}
        </td>
        <td>${itemsListHtml}</td>
        <td>${getPaymentBadge(s.paymentMode)}</td>
        <td>${statusBadge}</td>
        <td><strong>${formatINR(s.totalAmount)}</strong><br><small style="color:#10b981;">Gross Profit: ${formatINR(s.grossProfit)}</small></td>
        <td>${s.isDemo ? '<span class="data-origin-badge demo">Sample</span>' : '<span class="data-origin-badge user">User</span>'}</td>
        <td>
          <div style="display:flex; gap:0.35rem; align-items:center;">
            ${!isCompleted ? `
              <button class="quick-action-btn success" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="handleMarkSaleCompleted('${s.id}')" title="Settle credit and mark Completed">
                ✓ Settle
              </button>
            ` : ''}
            <button class="quick-action-btn outline" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewReceipt('${s.id}')">
              🧾 Receipt
            </button>
            ${s.customerPhone ? `
              <a class="quick-action-btn success" style="padding:0.25rem 0.5rem; font-size:0.75rem; text-decoration:none;" 
                 target="_blank" 
                 href="https://wa.me/91${s.customerPhone}?text=Namaste%20${encodeURIComponent(s.customerName)}%20ji,%20Shree%20Ganesh%20Kirana%20bill%20#${s.id}%20amount:%20Rs.${s.totalAmount}.%20Dhanyawad!">
                💬 WA
              </a>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleMarkSaleCompleted(saleId) {
  try {
    const sale = VyaparStore.markSaleCompleted(saleId);
    if (sale) {
      SoundManager.playChime();
      showToast(`Bill #${saleId} settled and marked Completed! Revenue updated.`, 'success');
      renderSalesTable();
      refreshDashboardMetrics();
      renderDashboardTables();
      VyaparCharts.renderSalesExpenseTrend('trendCanvas');
    }
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// Expense Management Controller
function initExpenses() {
  const form = document.getElementById('addExpenseForm');
  const expDateInput = document.getElementById('expDate');
  if (expDateInput && !expDateInput.value) {
    expDateInput.value = new Date().toISOString().split('T')[0];
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = document.getElementById('expDate')?.value || new Date().toISOString().split('T')[0];
      const title = document.getElementById('expTitle').value.trim();
      const amount = parseFloat(document.getElementById('expAmount').value) || 0;
      const category = document.getElementById('expCategory').value;
      const paymentMode = document.getElementById('expPayMode').value;
      const paidTo = document.getElementById('expPaidTo').value.trim() || "Vendor";
      const notes = document.getElementById('expNotes').value.trim();

      if (!title || amount <= 0) {
        showToast("Please enter valid expense description and positive amount!", "warning");
        return;
      }

      VyaparStore.addExpense({ title, description: title, amount, category, paymentMode, paidTo, notes, date });
      closeModal('addExpenseModal');
      form.reset();
      if (expDateInput) expDateInput.value = new Date().toISOString().split('T')[0];

      renderExpensesTable();
      refreshDashboardMetrics();
      renderDashboardTables();

      setTimeout(() => {
        VyaparCharts.renderSalesExpenseTrend('trendCanvas');
      }, 50);

      showToast(`Expense of ${formatINR(amount)} recorded!`, "success");
    });
  }

  document.getElementById('expenseSearchInput')?.addEventListener('input', renderExpensesTable);
  document.getElementById('expenseCategoryFilter')?.addEventListener('change', renderExpensesTable);

  renderExpensesTable();
}

function renderExpensesTable() {
  const container = document.getElementById('expensesTableBody');
  if (!container) return;

  const query = (document.getElementById('expenseSearchInput')?.value || '').toLowerCase().trim();
  const category = document.getElementById('expenseCategoryFilter')?.value || 'All';

  const expenses = VyaparStore.getExpenses();
  const filtered = expenses.filter(e => {
    const desc = (e.description || e.title || '').toLowerCase();
    const vendor = (e.paidTo || '').toLowerCase();
    const matchesQuery = desc.includes(query) || vendor.includes(query);
    const matchesCat = category === 'All' || e.category === category;
    return matchesQuery && matchesCat;
  });

  const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);
  const totalDisplay = document.getElementById('expensesTotalBanner');
  if (totalDisplay) totalDisplay.textContent = formatINR(totalExpense);

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2.5rem; color:#94a3b8;">No matching expenses found.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(e => `
    <tr>
      <td>${e.date}</td>
      <td><strong>${e.description || e.title}</strong>${e.notes ? `<br><small style="color:#64748b;">${e.notes}</small>` : ''}</td>
      <td><span class="status-badge info">${e.category}</span></td>
      <td>${e.paidTo}</td>
      <td><span class="pay-badge ${e.paymentMode.toLowerCase()}">${e.paymentMode}</span></td>
      <td><strong style="color:#e11d48;">${formatINR(e.amount)}</strong></td>
      <td>${e.isDemo ? '<span class="data-origin-badge demo">Sample</span>' : '<span class="data-origin-badge user">User</span>'}</td>
      <td>
        <button class="cart-remove-btn" onclick="deleteExpenseItem('${e.id}')" title="Delete Expense">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function deleteExpenseItem(id) {
  if (confirm("Are you sure you want to delete this expense record?")) {
    VyaparStore.deleteExpense(id);
    renderExpensesTable();
    refreshDashboardMetrics();
    renderDashboardTables();

    setTimeout(() => {
      VyaparCharts.renderSalesExpenseTrend('trendCanvas');
    }, 50);

    showToast("Expense record removed", "success");
  }
}

// Product & Inventory Controller
function initInventory() {
  const form = document.getElementById('addProductForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('prodEditId').value;
      const name = document.getElementById('prodName').value.trim();
      const category = document.getElementById('prodCategory').value;
      const sku = document.getElementById('prodSku').value.trim();
      const costPrice = parseFloat(document.getElementById('prodCostPrice').value);
      const sellingPrice = parseFloat(document.getElementById('prodSellingPrice').value);
      const stock = parseInt(document.getElementById('prodStock').value);
      const minStock = parseInt(document.getElementById('prodMinStock').value);
      const unit = document.getElementById('prodUnit').value;

      // Validation
      if (!name) {
        showToast("Product name cannot be blank!", "warning");
        return;
      }
      if (isNaN(costPrice) || costPrice < 0) {
        showToast("Purchase cost cannot be negative!", "warning");
        return;
      }
      if (isNaN(sellingPrice) || sellingPrice < 0) {
        showToast("Selling price cannot be negative!", "warning");
        return;
      }
      if (isNaN(stock) || stock < 0) {
        showToast("Stock quantity cannot be negative!", "warning");
        return;
      }
      if (isNaN(minStock) || minStock < 0) {
        showToast("Low-stock threshold cannot be negative!", "warning");
        return;
      }

      try {
        if (id) {
          VyaparStore.updateProduct(id, { name, category, sku, costPrice, sellingPrice, stock, minStock, unit });
          showToast(`Product "${name}" updated successfully!`, "success");
        } else {
          VyaparStore.addProduct({ name, category, sku, costPrice, sellingPrice, stock, minStock, unit });
          showToast(`Product "${name}" added to inventory!`, "success");
        }

        closeModal('addProductModal');
        form.reset();
        document.getElementById('prodEditId').value = '';
        renderInventoryTable();
        renderPOSCatalog();
        refreshDashboardMetrics();
        renderDashboardTables();
      } catch (err) {
        showToast(err.message, "warning");
      }
    });
  }

  // Margin preview in Add Product Form
  const cpInput = document.getElementById('prodCostPrice');
  const spInput = document.getElementById('prodSellingPrice');
  const marginPreview = document.getElementById('prodMarginPreview');

  const updatePreview = () => {
    const cp = parseFloat(cpInput?.value) || 0;
    const sp = parseFloat(spInput?.value) || 0;
    if (sp > 0) {
      const margin = Math.round(((sp - cp) / sp) * 100);
      const profit = sp - cp;
      if (marginPreview) marginPreview.textContent = `₹${profit} profit (${margin}% margin)`;
    } else {
      if (marginPreview) marginPreview.textContent = '-';
    }
  };

  if (cpInput && spInput) {
    cpInput.addEventListener('input', updatePreview);
    spInput.addEventListener('input', updatePreview);
  }

  document.getElementById('invSearchInput')?.addEventListener('input', renderInventoryTable);
  document.getElementById('invCategoryFilter')?.addEventListener('change', renderInventoryTable);
  document.getElementById('invStatusFilter')?.addEventListener('change', renderInventoryTable);

  renderInventoryTable();
}

function renderInventoryTable() {
  const container = document.getElementById('inventoryTableBody');
  if (!container) return;

  const query = (document.getElementById('invSearchInput')?.value || '').toLowerCase().trim();
  const category = document.getElementById('invCategoryFilter')?.value || 'All';
  const status = document.getElementById('invStatusFilter')?.value || 'All';

  const products = VyaparStore.getProducts();
  const filtered = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query));
    const matchesCat = category === 'All' || p.category === category;
    let matchesStatus = true;
    if (status === 'LowStock') matchesStatus = p.stock > 0 && p.stock <= p.minStock;
    if (status === 'OutOfStock') matchesStatus = p.stock === 0;
    if (status === 'InStock') matchesStatus = p.stock > p.minStock;
    return matchesQuery && matchesCat && matchesStatus;
  });

  // Calculate live inventory valuation: purchase cost × stock quantity
  const totalCostValue = filtered.reduce((sum, p) => sum + ((parseFloat(p.costPrice) || 0) * (parseInt(p.stock) || 0)), 0);
  const totalRetailValue = filtered.reduce((sum, p) => sum + ((parseFloat(p.sellingPrice) || 0) * (parseInt(p.stock) || 0)), 0);
  const totalStockUnits = filtered.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);
  const lowStockCount = filtered.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = filtered.filter(p => p.stock === 0).length;

  // Update Inventory Summary Banner
  const costValEl = document.getElementById('invTotalCostValue');
  const retailValEl = document.getElementById('invTotalRetailValue');
  const unitsEl = document.getElementById('invTotalStockUnits');
  const countEl = document.getElementById('invProductsCount');
  const alertValEl = document.getElementById('invStockAlertsValue');
  const alertMetaEl = document.getElementById('invStockAlertsMeta');

  if (costValEl) costValEl.textContent = formatINR(totalCostValue);
  if (retailValEl) retailValEl.textContent = formatINR(totalRetailValue);
  if (unitsEl) unitsEl.textContent = `${totalStockUnits.toLocaleString('en-IN')} Units`;
  if (countEl) countEl.textContent = `${filtered.length} of ${products.length} Products`;
  if (alertValEl) alertValEl.textContent = `${lowStockCount + outOfStockCount} Alerts`;
  if (alertMetaEl) alertMetaEl.textContent = `${outOfStockCount} Out of Stock • ${lowStockCount} Low`;

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:2.5rem; color:#94a3b8;">No matching inventory products found.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const margin = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100) : 0;
    const itemInventoryValue = (parseFloat(p.costPrice) || 0) * (parseInt(p.stock) || 0);

    let badge = `<span class="status-badge completed">🟢 In Stock</span>`;
    if (p.stock === 0) badge = `<span class="status-badge danger">🔴 Out of Stock</span>`;
    else if (p.stock <= p.minStock) badge = `<span class="status-badge pending">⚠️ Low Stock (${p.stock})</span>`;

    return `
      <tr>
        <td><code>${p.sku || p.id}</code></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.category}</td>
        <td>₹${p.costPrice}</td>
        <td><strong>₹${p.sellingPrice}</strong></td>
        <td>
          <span style="font-weight:700; color:${margin >= 18 ? '#10b981' : '#f59e0b'};">
            ${margin}% (₹${p.sellingPrice - p.costPrice})
          </span>
        </td>
        <td><strong>${p.stock} ${p.unit}</strong><br><small style="color:#64748b;">Min: ${p.minStock}</small></td>
        <td>
          <strong>${formatINR(itemInventoryValue)}</strong><br>
          <small style="color:#64748b;">(₹${p.costPrice} × ${p.stock})</small>
        </td>
        <td>${badge}</td>
        <td>${p.isDemo ? '<span class="data-origin-badge demo">Sample</span>' : '<span class="data-origin-badge user">User</span>'}</td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button class="quick-action-btn success" style="padding:0.2rem 0.45rem; font-size:0.75rem;" onclick="quickRestockItem('${p.id}', 10)" title="Quick Restock +10">
              +10
            </button>
            <button class="quick-action-btn outline" style="padding:0.2rem 0.45rem; font-size:0.75rem;" onclick="editProductModal('${p.id}')" title="Edit Product">
              ✏️
            </button>
            <button class="cart-remove-btn" onclick="deleteProductItem('${p.id}')" title="Delete Product">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function quickRestockItem(id, qty = 10) {
  const p = VyaparStore.restockProduct(id, qty);
  if (p) {
    SoundManager.playChime();
    showToast(`Added +${qty} ${p.unit} to ${p.name}!`, "success");
    renderInventoryTable();
    renderPOSCatalog();
    refreshDashboardMetrics();
    renderDashboardTables();
  }
}

function openAddProductModal() {
  const form = document.getElementById('addProductForm');
  if (form) form.reset();
  const editId = document.getElementById('prodEditId');
  if (editId) editId.value = '';
  const title = document.getElementById('modalProductTitle');
  if (title) title.textContent = "Add Product to Inventory";
  const marginPreview = document.getElementById('prodMarginPreview');
  if (marginPreview) marginPreview.textContent = '-';
  openModal('addProductModal');
}

function editProductModal(id) {
  const p = VyaparStore.getProductById(id);
  if (!p) return;

  document.getElementById('modalProductTitle').textContent = "Edit Product";
  document.getElementById('prodEditId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodCategory').value = p.category;
  document.getElementById('prodSku').value = p.sku || '';
  document.getElementById('prodCostPrice').value = p.costPrice;
  document.getElementById('prodSellingPrice').value = p.sellingPrice;
  document.getElementById('prodStock').value = p.stock;
  document.getElementById('prodMinStock').value = p.minStock;
  document.getElementById('prodUnit').value = p.unit || 'Pkt';

  const marginPreview = document.getElementById('prodMarginPreview');
  if (marginPreview && p.sellingPrice > 0) {
    const margin = Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100);
    const profit = p.sellingPrice - p.costPrice;
    marginPreview.textContent = `₹${profit} profit (${margin}% margin)`;
  }

  openModal('addProductModal');
}

function deleteProductItem(id) {
  const p = VyaparStore.getProductById(id);
  if (!p) return;

  const confirmMsg = `Are you sure you want to delete "${p.name}"?\n\n• Current Stock: ${p.stock} ${p.unit}\n• Purchase Cost: ₹${p.costPrice}\n• Selling Price: ₹${p.sellingPrice}\n\nThis will remove the product from your store catalogue.`;
  if (window.confirm(confirmMsg)) {
    VyaparStore.deleteProduct(id);
    renderInventoryTable();
    renderPOSCatalog();
    refreshDashboardMetrics();
    renderDashboardTables();
    showToast(`Product "${p.name}" deleted from catalogue.`, "info");
  }
}

// Profit Calculator Page Controller
function initCalculator() {
  const calcCp = document.getElementById('calcCostPrice');
  const calcSp = document.getElementById('calcSellingPrice');
  const calcQty = document.getElementById('calcEstUnits');

  const updateCalculations = () => {
    const cp = parseFloat(calcCp?.value) || 0;
    const sp = parseFloat(calcSp?.value) || 0;
    const qty = parseInt(calcQty?.value) || 1;

    const profitPerUnit = sp - cp;
    const marginPct = sp > 0 ? ((profitPerUnit / sp) * 100) : 0;
    const markupPct = cp > 0 ? ((profitPerUnit / cp) * 100) : 0;
    const totalProfit = profitPerUnit * qty;

    document.getElementById('calcUnitProfit').textContent = formatINR(profitPerUnit);
    document.getElementById('calcGrossMargin').textContent = `${marginPct.toFixed(1)}%`;
    document.getElementById('calcMarkup').textContent = `${markupPct.toFixed(1)}%`;
    document.getElementById('calcTotalProjectedProfit').textContent = formatINR(totalProfit);

    const verdictEl = document.getElementById('calcVerdict');
    if (verdictEl) {
      if (marginPct >= 20) {
        verdictEl.className = "status-badge completed";
        verdictEl.textContent = "High Margin — Excellent for Indian Kirana Store!";
      } else if (marginPct >= 10) {
        verdictEl.className = "status-badge info";
        verdictEl.textContent = "Standard Kirana FMCG Margin (Average)";
      } else if (marginPct > 0) {
        verdictEl.className = "status-badge pending";
        verdictEl.textContent = "Thin Margin — High volume needed to make good profit";
      } else {
        verdictEl.className = "status-badge danger";
        verdictEl.textContent = "Loss Making! Selling Price is below Cost Price.";
      }
    }
  };

  if (calcCp && calcSp && calcQty) {
    calcCp.addEventListener('input', updateCalculations);
    calcSp.addEventListener('input', updateCalculations);
    calcQty.addEventListener('input', updateCalculations);
    updateCalculations();
  }

  // Reverse Target Margin Calculator
  const targetCp = document.getElementById('targetCostPrice');
  const targetMargin = document.getElementById('targetMarginPercent');
  const updateTargetSp = () => {
    const cp = parseFloat(targetCp?.value) || 0;
    const margin = parseFloat(targetMargin?.value) || 0;
    if (margin < 100 && margin > 0) {
      const requiredSp = cp / (1 - (margin / 100));
      document.getElementById('targetResultSp').textContent = formatINR(requiredSp);
    }
  };
  if (targetCp && targetMargin) {
    targetCp.addEventListener('input', updateTargetSp);
    targetMargin.addEventListener('input', updateTargetSp);
    updateTargetSp();
  }
}

// "Ask Your Business" AI Assistant Controller
function initAIAssistant() {
  const input = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const messagesContainer = document.getElementById('aiMessagesContainer');
  const chipsContainer = document.getElementById('aiPromptChips');

  // Render suggested chips
  if (chipsContainer) {
    chipsContainer.innerHTML = VyaparAI.suggestedPrompts.map(prompt => `
      <button class="prompt-chip" onclick="handlePromptChip('${encodeURIComponent(prompt.text)}')">
        ${prompt.icon ? prompt.icon + ' ' : ''}${prompt.text}
      </button>
    `).join('');
  }

  // Render chat history
  renderChatMessages();

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    const history = VyaparAI.getChatHistory();

    // User message
    history.push({
      role: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    });
    VyaparAI.saveChatHistory(history);
    renderChatMessages();

    // AI typing placeholder
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-bubble assistant';
    typingIndicator.id = 'aiTypingBubble';
    typingIndicator.innerHTML = `<em>Vyapar Assistant is calculating ledger figures directly from store data...</em>`;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Get response
    const answer = await VyaparAI.ask(text);
    document.getElementById('aiTypingBubble')?.remove();

    history.push({
      role: 'assistant',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: answer
    });
    VyaparAI.saveChatHistory(history);
    renderChatMessages();
    SoundManager.playChime();
  };

  sendBtn?.addEventListener('click', handleSend);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  // Clear chat button
  document.getElementById('clearChatBtn')?.addEventListener('click', () => {
    if (confirm("Reset conversation with Vyapar AI?")) {
      VyaparAI.clearChatHistory();
      renderChatMessages();
      showToast("Chat cleared", "info");
    }
  });
}

function handlePromptChip(encodedText) {
  const text = decodeURIComponent(encodedText);
  const input = document.getElementById('aiChatInput');
  if (input) {
    input.value = text;
    document.getElementById('aiSendBtn')?.click();
  }
}

function renderChatMessages() {
  const container = document.getElementById('aiMessagesContainer');
  if (!container) return;

  const history = VyaparAI.getChatHistory();
  container.innerHTML = history.map(msg => {
    const formattedHtml = parseSimpleMarkdown(msg.text);
    return `
      <div class="chat-bubble ${msg.role}">
        ${formattedHtml}
        <div style="font-size:0.68rem; margin-top:0.4rem; opacity:0.65; text-align:right;">
          ${msg.time || ''}
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

// Simple markdown formatter for AI chat tables, bold, code blocks, lists
function parseSimpleMarkdown(md) {
  if (!md) return '';
  let html = md;

  // Code blocks ```text ... ```
  html = html.replace(/```(?:text)?\n([\s\S]*?)```/g, '<pre style="background:#1e293b; color:#f8fafc; padding:0.65rem; border-radius:6px; font-size:0.75rem; overflow-x:auto; margin:0.5rem 0;"><code>$1</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; color:#0f172a; padding:0.15rem 0.35rem; border-radius:4px; font-size:0.8rem;">$1</code>');

  // Headings
  html = html.replace(/### (.*?)(?:\n|$)/g, '<h4 style="margin:0.6rem 0 0.3rem 0; font-size:0.95rem; font-weight:700; color:#1e293b;">$1</h4>');
  html = html.replace(/## (.*?)(?:\n|$)/g, '<h3 style="margin:0.75rem 0 0.4rem 0; font-size:1.05rem; font-weight:800; color:#0f172a;">$1</h3>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Horizontal divider
  html = html.replace(/^---$/gm, '<hr style="border:none; border-top:1px solid #e2e8f0; margin:0.75rem 0;">');

  // Markdown Tables
  if (html.includes('|')) {
    const lines = html.split('\n');
    let inTable = false;
    const processedLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (trimmed.includes('---')) {
          return; // Skip table header separator
        }
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        if (!inTable) {
          inTable = true;
          processedLines.push('<div style="overflow-x:auto; margin:0.5rem 0;"><table class="data-table" style="font-size:0.78rem; width:100%; border-collapse:collapse;"><thead><tr>' + cells.map(c => `<th style="padding:0.4rem 0.5rem; background:#f8fafc; border:1px solid #e2e8f0; font-weight:600; text-align:left;">${c}</th>`).join('') + '</tr></thead><tbody>');
        } else {
          processedLines.push('<tr>' + cells.map(c => `<td style="padding:0.35rem 0.5rem; border:1px solid #e2e8f0;">${c}</td>`).join('') + '</tr>');
        }
      } else {
        if (inTable) {
          inTable = false;
          processedLines.push('</tbody></table></div>');
        }
        if (trimmed) {
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
            processedLines.push(`<div style="margin:0.2rem 0 0.2rem 0.5rem;">• ${trimmed.substring(2)}</div>`);
          } else {
            processedLines.push(`<p style="margin:0.35rem 0;">${trimmed}</p>`);
          }
        }
      }
    });

    if (inTable) processedLines.push('</tbody></table></div>');
    html = processedLines.join('\n');
  } else {
    const lines = html.split('\n');
    const processed = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        processed.push(`<div style="margin:0.2rem 0 0.2rem 0.5rem;">• ${trimmed.substring(2)}</div>`);
      } else if (/^\d+\.\s/.test(trimmed)) {
        processed.push(`<div style="margin:0.2rem 0 0.2rem 0.5rem;">${trimmed}</div>`);
      } else {
        processed.push(`<p style="margin:0.35rem 0;">${trimmed}</p>`);
      }
    });
    html = processed.join('');
  }

  return html;
}

// Smart Insights & Alerts Hub
function initInsights() {
  renderInsightsHub();
}

function renderInsightsHub() {
  const products = VyaparStore.getProducts();
  const sales = VyaparStore.getSales();
  const expenses = VyaparStore.getExpenses();
  const customers = VyaparStore.getCustomers();
  const lowItems = products.filter(p => p.stock <= p.minStock);
  const debtors = customers.filter(c => c.totalCredit > 0);

  // 1. Gross Profit & Net Profit Financial Summaries (Requirement 4 & 6)
  const periodEl = document.getElementById('insightsPeriodSelect');
  const period = periodEl ? periodEl.value : 'all';
  const fin = VyaparStore.calculateFinancials({ period });

  const revEl = document.getElementById('insightsRevenueVal');
  const revMeta = document.getElementById('insightsRevenueMeta');
  const cogsEl = document.getElementById('insightsCOGSVal');
  const gpEl = document.getElementById('insightsGrossProfitVal');
  const gpMeta = document.getElementById('insightsGrossMarginMeta');
  const expEl = document.getElementById('insightsExpensesVal');
  const expMeta = document.getElementById('insightsExpenseMeta');
  const npEl = document.getElementById('insightsNetProfitVal');
  const npMeta = document.getElementById('insightsNetMarginMeta');

  if (revEl) revEl.textContent = formatINR(fin.revenue);
  if (revMeta) revMeta.textContent = `${fin.completedSalesCount} Completed Invoices`;
  if (cogsEl) cogsEl.textContent = formatINR(fin.cogs);
  if (gpEl) gpEl.textContent = formatINR(fin.grossProfit);
  if (gpMeta) gpMeta.textContent = `${fin.grossMarginPct.toFixed(1)}% Gross Margin`;
  if (expEl) expEl.textContent = formatINR(fin.expenses);
  if (expMeta) expMeta.textContent = `${fin.expenseCount} Deduplicated Entries`;

  if (npEl) {
    const netSign = fin.netProfit >= 0 ? '+' : '-';
    npEl.textContent = `${netSign}${formatINR(fin.netProfit)}`;
    npEl.style.color = fin.netProfit >= 0 ? 'var(--success)' : '#e11d48';
  }
  if (npMeta) npMeta.textContent = `${fin.netProfitMarginPct.toFixed(1)}% Net Margin`;

  // 2. Daily Revenue & Expense Trend Canvas (Requirement 3 & 6)
  if (typeof VyaparCharts !== 'undefined' && VyaparCharts.renderInsightsDailyTrend) {
    VyaparCharts.renderInsightsDailyTrend('insightsTrendCanvas', 'insightsTrendEmptyState');
  }

  // 3. Top-Selling Products by Completed Quantity (Requirement 2 & 6)
  const topSellers = VyaparStore.getTopSellingProducts(5);
  const topContainer = document.getElementById('insightsTopSellingList');
  const topEmpty = document.getElementById('insightsTopSellingEmptyState');
  const topBadge = document.getElementById('insightsTopSellerCountBadge');

  if (topBadge) {
    topBadge.textContent = `${topSellers.length} Items`;
  }

  if (topSellers.length === 0) {
    if (topContainer) topContainer.innerHTML = '';
    if (topEmpty) topEmpty.style.display = 'flex';
  } else {
    if (topEmpty) topEmpty.style.display = 'none';
    if (topContainer) {
      topContainer.innerHTML = topSellers.map((item, idx) => {
        const marginPct = item.totalRevenue > 0 ? ((item.grossProfit / item.totalRevenue) * 100).toFixed(1) : '0';
        return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0.6rem; border-bottom:1px solid #f1f5f9; gap:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.75rem; min-width:0;">
              <span style="font-weight:800; font-size:0.85rem; color:#1d4ed8; width:26px; height:26px; background:#eff6ff; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">#${idx + 1}</span>
              <div style="min-width:0;">
                <strong style="color:var(--slate-800); font-size:0.88rem; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</strong>
                <small style="color:var(--slate-500); font-size:0.75rem;">${item.category} • Rate: ${formatINR(item.unitPrice)}</small>
              </div>
            </div>
            <div style="text-align:right; flex-shrink:0;">
              <span style="font-weight:800; color:var(--slate-800); font-size:0.92rem;">${item.unitsSold} ${item.unit}</span><br>
              <small style="color:var(--success); font-weight:700; font-size:0.75rem;">${formatINR(item.totalRevenue)} (${marginPct}%)</small>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 4. Three Concise Data-Driven Business Recommendations (Requirements 5 & 7)
  const recContainer = document.getElementById('insightsRecommendationsList');
  if (recContainer && typeof VyaparStore.getBusinessRecommendations === 'function') {
    const recs = VyaparStore.getBusinessRecommendations();
    recContainer.innerHTML = recs.map((rec, idx) => {
      let badgeBg = '#e0f2fe';
      let badgeColor = '#0369a1';
      let borderCol = '#38bdf8';

      if (rec.type === 'warning') {
        badgeBg = '#fef3c7';
        badgeColor = '#b45309';
        borderCol = '#f59e0b';
      } else if (rec.type === 'success') {
        badgeBg = '#dcfce7';
        badgeColor = '#15803d';
        borderCol = '#10b981';
      } else if (rec.type === 'danger') {
        badgeBg = '#fee2e2';
        badgeColor = '#b91c1c';
        borderCol = '#f43f5e';
      }

      return `
        <div style="background:#ffffff; padding:1.15rem; border-radius:var(--radius-md); border:1px solid #e2e8f0; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
              <span class="badge-pill" style="background:${badgeBg}; color:${badgeColor}; font-size:0.7rem; font-weight:700;">${rec.category}</span>
              <span style="font-size:0.72rem; color:var(--slate-400); font-weight:600;">Action Step #${idx + 1}</span>
            </div>
            <strong style="color:var(--slate-800); font-size:0.92rem; display:block; margin-bottom:0.35rem; line-height:1.4;">${rec.title}</strong>
            <p style="font-size:0.8rem; color:var(--slate-600); margin-bottom:0.85rem; line-height:1.5;">${rec.action}</p>
          </div>
          <div style="background:#f8fafc; border-left:3px solid ${borderCol}; padding:0.6rem 0.75rem; border-radius:4px; font-size:0.78rem; color:var(--slate-600); line-height:1.5;">
            <strong style="color:var(--slate-700); display:block; margin-bottom:0.15rem;">ℹ️ Evidence & Why:</strong>
            ${rec.explanation}
          </div>
        </div>
      `;
    }).join('');
  }

  // 5. Low-Stock Alerts Based on Configured Thresholds (Requirement 1 & 6)
  const reorderContainer = document.getElementById('insightsLowStockList');
  const lowBadge = document.getElementById('insightsLowStockBadge');

  if (lowBadge) {
    lowBadge.textContent = `${lowItems.length} Items`;
    if (lowItems.length > 0) {
      lowBadge.style.background = '#fee2e2';
      lowBadge.style.color = '#b91c1c';
    } else {
      lowBadge.style.background = '#dcfce7';
      lowBadge.style.color = '#15803d';
    }
  }

  if (reorderContainer) {
    if (products.length === 0) {
      reorderContainer.innerHTML = `
        <div style="padding:2.5rem 1.5rem; text-align:center; color:var(--slate-500);">
          <div style="font-size:2.2rem; margin-bottom:0.5rem;">📦</div>
          <strong style="color:var(--slate-700); font-size:1rem;">No Products in Catalog</strong>
          <p style="font-size:0.85rem; margin-top:0.25rem;">Add products in the Inventory tab to start monitoring safety stock levels.</p>
        </div>
      `;
    } else if (lowItems.length === 0) {
      reorderContainer.innerHTML = `
        <div style="padding:2rem 1.5rem; text-align:center; background:#ecfdf5; border-radius:var(--radius-md); border:1px solid #a7f3d0; margin:0.5rem;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🎉</div>
          <strong style="color:#065f46; font-size:1rem;">All Inventory Levels are Healthy!</strong>
          <p style="color:#047857; font-size:0.85rem; margin-top:0.25rem; margin-bottom:0;">
            All ${products.length} catalog products are currently stocked above their configured minimum alert threshold.
          </p>
        </div>
      `;
    } else {
      const sortedLow = [...lowItems].sort((a, b) => (b.minStock - b.stock) - (a.minStock - a.stock));
      reorderContainer.innerHTML = sortedLow.map(p => {
        const deficit = Math.max(0, p.minStock - p.stock);
        const orderQty = Math.max((p.minStock * 2) - p.stock, 5);
        const isOut = p.stock === 0;
        const statusBadge = isOut
          ? '<span class="badge-pill" style="background:#fee2e2; color:#b91c1c; font-size:0.7rem; font-weight:700;">🔴 Out of Stock</span>'
          : '<span class="badge-pill" style="background:#fef3c7; color:#b45309; font-size:0.7rem; font-weight:700;">⚠️ Low Stock</span>';

        return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem; border-bottom:1px solid #e2e8f0; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.2rem;">
                <strong style="color:var(--slate-800);">${p.name}</strong>
                ${statusBadge}
              </div>
              <small style="color:#64748b; font-size:0.78rem;">
                Current Stock: <strong style="color:${isOut ? '#e11d48' : '#d97706'};">${p.stock} ${p.unit}</strong> • Alert Threshold: <strong>${p.minStock} ${p.unit}</strong> • Deficit: <strong style="color:#e11d48;">${deficit} ${p.unit}</strong>
              </small>
            </div>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <span style="font-size:0.82rem; font-weight:bold; color:var(--slate-700);">Order +${orderQty} ${p.unit}</span>
              <button class="quick-action-btn success" style="padding:0.32rem 0.65rem; font-size:0.75rem;" onclick="quickRestockItem('${p.id}', ${orderQty})">
                Mark Received
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Wholesaler WhatsApp order generator button
  const waBtn = document.getElementById('generateWholesaleOrderBtn');
  if (waBtn) {
    waBtn.onclick = () => {
      if (lowItems.length === 0) {
        showToast("All products are well stocked! No items to order.", "info");
        return;
      }
      const settings = VyaparStore.getSettings();
      let text = `*Namaste Wholesaler Ji,*%0A%0APlease send the following urgent stock for *${encodeURIComponent(settings.shopName)}*:%0A%0A`;
      lowItems.forEach((p, idx) => {
        const orderQty = Math.max((p.minStock * 2) - p.stock, 5);
        text += `${idx + 1}. ${encodeURIComponent(p.name)} - *${orderQty} ${p.unit}*%0A`;
      });
      text += `%0APlease confirm delivery time and bill amount. Thank you!`;

      window.open(`https://wa.me/?text=${text}`, '_blank');
    };
  }

  // 6. Customer Udhar Recovery Cards
  const debtorContainer = document.getElementById('insightsDebtorList');
  const debtorBadge = document.getElementById('insightsDebtorCountBadge');
  if (debtorBadge) {
    debtorBadge.textContent = `${debtors.length} Pending`;
  }

  if (debtorContainer) {
    if (debtors.length === 0) {
      debtorContainer.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#10b981; font-size:0.88rem;">🎉 All customer credit accounts are clear! Zero pending Udhar.</div>`;
    } else {
      const settings = VyaparStore.getSettings();
      debtorContainer.innerHTML = debtors.map(c => {
        const msg = `Namaste ${c.name} ji, ${settings.shopName} se pranaam. Aapka Rs. ${c.totalCredit} ka hisab baaki hai. Kripya dukan aakar ya online UPI (${settings.upiId}) par clear kar dein. Dhanyawad!`;
        const waLink = `https://wa.me/91${c.phone}?text=${encodeURIComponent(msg)}`;

        return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem; border-bottom:1px solid #e2e8f0; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <strong>${c.name}</strong> (${c.phone || 'No Phone'})<br>
              <small style="color:#64748b; font-size:0.78rem;">Pending Credit: <strong style="color:#e11d48;">${formatINR(c.totalCredit)}</strong> • Last Active: ${c.lastTransactionDate}</small>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <a href="${waLink}" target="_blank" class="quick-action-btn success" style="padding:0.3rem 0.6rem; font-size:0.75rem; text-decoration:none;">
                💬 Send Reminder
              </a>
              <button class="quick-action-btn outline" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="openSettleModal('${c.id}')">
                Settle
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// Customer Udhar Ledger Controller
function initUdharLedger() {
  const form = document.getElementById('addCustomerForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('custNameInput').value.trim();
      const phone = document.getElementById('custPhoneInput').value.trim();
      const initialCredit = parseFloat(document.getElementById('custCreditInput').value) || 0;

      if (!name) {
        showToast("Customer name is required!", "warning");
        return;
      }

      VyaparStore.addCustomerCredit(name, phone, initialCredit);
      closeModal('addCustomerModal');
      form.reset();
      renderUdharTable();
      refreshDashboardMetrics();
      showToast(`Customer account for ${name} created!`, "success");
    });
  }

  // Settle Udhar form handler
  const settleForm = document.getElementById('settleUdharForm');
  if (settleForm) {
    settleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const custId = document.getElementById('settleCustId').value;
      const amount = parseFloat(document.getElementById('settleAmountInput').value) || 0;

      if (!custId || amount <= 0) {
        showToast("Enter valid settled amount!", "warning");
        return;
      }

      const updated = VyaparStore.settleCustomerCredit(custId, amount);
      if (updated) {
        SoundManager.playChime();
        showToast(`Payment of ${formatINR(amount)} received from ${updated.name}! Balance: ${formatINR(updated.totalCredit)}`, "success");
      }
      closeModal('settleUdharModal');
      renderUdharTable();
      refreshDashboardMetrics();
      renderInsightsHub();
    });
  }

  renderUdharTable();
}

function renderUdharTable() {
  const container = document.getElementById('udharTableBody');
  if (!container) return;

  const customers = VyaparStore.getCustomers();
  const totalUdhar = customers.reduce((sum, c) => sum + c.totalCredit, 0);

  const banner = document.getElementById('udharTotalBanner');
  if (banner) banner.textContent = formatINR(totalUdhar);

  if (customers.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2.5rem; color:#94a3b8;">No customer credit records.</td></tr>`;
    return;
  }

  container.innerHTML = customers.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.phone ? '📞 ' + c.phone : '<span style="color:#94a3b8;">Not provided</span>'}</td>
      <td>${c.address || 'Local'}</td>
      <td>${c.lastTransactionDate}</td>
      <td>
        <strong style="color:${c.totalCredit > 0 ? '#e11d48' : '#10b981'}; font-size:1.05rem;">
          ${formatINR(c.totalCredit)}
        </strong>
      </td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button class="quick-action-btn success" style="padding:0.25rem 0.55rem; font-size:0.75rem;" onclick="openSettleModal('${c.id}')">
            ₹ Settle
          </button>
          ${c.phone && c.totalCredit > 0 ? `
            <a href="https://wa.me/91${c.phone}?text=Namaste%20${encodeURIComponent(c.name)}%20ji,%20aapka%20Rs.${c.totalCredit}%20udhar%20baaki%20hai." target="_blank" class="quick-action-btn outline" style="padding:0.25rem 0.55rem; font-size:0.75rem; text-decoration:none;">
              💬 WA
            </a>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function openSettleModal(custId) {
  const customers = VyaparStore.getCustomers();
  const c = customers.find(x => x.id === custId);
  if (!c) return;

  document.getElementById('settleCustId').value = c.id;
  document.getElementById('settleCustName').textContent = c.name;
  document.getElementById('settleCurrentBalance').textContent = formatINR(c.totalCredit);
  document.getElementById('settleAmountInput').value = c.totalCredit;

  openModal('settleUdharModal');
}

// Modal System Helper
function initModals() {
  document.querySelectorAll('.modal-close-btn, [data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
    });
  });

  // Close modal when clicking backdrop
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Keyboard shortcuts: F2 for Quick Sale POS, Esc to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
    } else if (e.key === 'F2') {
      e.preventDefault();
      const salesNav = document.querySelector('[data-tab-target="sales"]');
      if (salesNav) salesNav.click();
      setTimeout(() => document.getElementById('posSearchInput')?.focus(), 150);
    }
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}
