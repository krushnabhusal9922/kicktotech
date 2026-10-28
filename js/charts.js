/**
 * Vyapar AI — High Performance Canvas Chart Engine
 * Built-in zero-dependency interactive charting for Sales, Expenses, and Categories.
 */

const VyaparCharts = {
  // Format currency in Indian standard (e.g. ₹1,250)
  formatRupees(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  },

  /**
   * Render Multi-Bar / Trend Chart for Last 7 Days (Sales vs Expenses)
   */
  renderSalesExpenseTrend(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Get display size
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height || 260;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Compute last 7 days data
    const sales = VyaparStore.getSales();
    const expenses = VyaparStore.getExpenses();

    const days = [];
    const salesData = [];
    const expenseData = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      days.push(dayLabel);

      const daySale = sales
        .filter(s => s.date.startsWith(dateStr))
        .reduce((sum, s) => sum + s.totalAmount, 0);
      salesData.push(daySale);

      const dayExp = expenses
        .filter(e => e.date.startsWith(dateStr))
        .reduce((sum, e) => sum + e.amount, 0);
      expenseData.push(dayExp);
    }

    const maxVal = Math.max(...salesData, ...expenseData, 1000) * 1.25;

    // Layout margins
    const padding = { top: 35, right: 25, bottom: 45, left: 55 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines & Y-axis labels
    const gridLines = 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const yVal = (maxVal / gridLines) * i;
      const yPos = padding.top + chartHeight - (i * (chartHeight / gridLines));

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText(this.formatRupees(yVal), padding.left - 8, yPos + 4);
    }

    // Draw grouped bars
    const barGroupWidth = chartWidth / days.length;
    const barWidth = Math.min(barGroupWidth * 0.32, 22);

    days.forEach((day, idx) => {
      const groupCenterX = padding.left + (idx * barGroupWidth) + (barGroupWidth / 2);

      // Sales Bar (Green/Emerald)
      const saleVal = salesData[idx];
      const saleBarH = (saleVal / maxVal) * chartHeight;
      const saleX = groupCenterX - barWidth - 2;
      const saleY = padding.top + chartHeight - saleBarH;

      // Gradient for Sales
      const saleGrad = ctx.createLinearGradient(0, saleY, 0, padding.top + chartHeight);
      saleGrad.addColorStop(0, '#10b981');
      saleGrad.addColorStop(1, '#059669');
      ctx.fillStyle = saleGrad;
      this.drawRoundedRect(ctx, saleX, saleY, barWidth, saleBarH, 4);

      // Expense Bar (Rose/Amber)
      const expVal = expenseData[idx];
      const expBarH = (expVal / maxVal) * chartHeight;
      const expX = groupCenterX + 2;
      const expY = padding.top + chartHeight - expBarH;

      const expGrad = ctx.createLinearGradient(0, expY, 0, padding.top + chartHeight);
      expGrad.addColorStop(0, '#f43f5e');
      expGrad.addColorStop(1, '#e11d48');
      ctx.fillStyle = expGrad;
      this.drawRoundedRect(ctx, expX, expY, barWidth, expBarH, 4);

      // Day Label
      ctx.fillStyle = '#475569';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day, groupCenterX, height - 15);
    });

    // Chart Legend
    this.drawLegend(ctx, width - padding.right - 180, 15, [
      { label: 'Sales (Bikri)', color: '#10b981' },
      { label: 'Expenses (Kharcha)', color: '#f43f5e' }
    ]);
  },

  /**
   * Render Category-wise Sales Donut Chart
   */
  renderCategoryDonut(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height || 260;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Aggregate category sales
    const sales = VyaparStore.getSales();
    const products = VyaparStore.getProducts();
    const categoryTotals = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const prd = products.find(p => p.id === item.productId);
        const cat = prd ? prd.category : 'General Items';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + item.subtotal;
      });
    });

    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const totalAmount = entries.reduce((sum, item) => sum + item[1], 0) || 1;

    const colors = [
      '#4f46e5', // Indigo
      '#06b6d4', // Cyan
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#64748b'  // Slate
    ];

    const centerX = width < 420 ? width / 2 : width * 0.38;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.58;

    let startAngle = -Math.PI / 2;

    entries.forEach(([cat, val], idx) => {
      const sliceAngle = (val / totalAmount) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const color = colors[idx % colors.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Donut center text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sales Share', centerX, centerY - 8);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(this.formatRupees(totalAmount), centerX, centerY + 12);

    // Side Legend if width is enough
    if (width >= 420) {
      const legendX = width * 0.65;
      let legendY = 35;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      entries.slice(0, 6).forEach(([cat, val], idx) => {
        const color = colors[idx % colors.length];
        const pct = Math.round((val / totalAmount) * 100);

        // Dot
        ctx.beginPath();
        ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Label
        ctx.fillStyle = '#334155';
        ctx.font = '11px system-ui, -apple-system, sans-serif';
        const label = cat.length > 15 ? cat.substring(0, 14) + '..' : cat;
        ctx.fillText(`${label} (${pct}%)`, legendX + 12, legendY);

        legendY += 24;
      });
    }
  },

  /**
   * Render Payment Mode Share Donut Chart (UPI vs Cash vs Udhar)
   */
  renderPaymentModeChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height || 220;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const sales = VyaparStore.getSales();
    let cash = 0, upi = 0, udhar = 0;

    sales.forEach(s => {
      if (s.paymentMode === 'UPI') upi += s.totalAmount;
      else if (s.paymentMode === 'Udhar') udhar += s.totalAmount;
      else cash += s.totalAmount;
    });

    const total = cash + upi + udhar || 1;
    const data = [
      { label: 'UPI / QR', val: upi, color: '#3b82f6' },
      { label: 'Cash (Rokad)', val: cash, color: '#10b981' },
      { label: 'Udhar (Credit)', val: udhar, color: '#f59e0b' }
    ];

    const centerX = width < 360 ? width / 2 : width * 0.35;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.55;

    let startAngle = -Math.PI / 2;

    data.forEach(item => {
      const sliceAngle = (item.val / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Center text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pay Modes', centerX, centerY - 6);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText(this.formatRupees(total), centerX, centerY + 10);

    // Legend
    const legendX = width * 0.62;
    let legendY = height / 2 - 28;
    ctx.textAlign = 'left';

    data.forEach(item => {
      const pct = Math.round((item.val / total) * 100);

      ctx.beginPath();
      ctx.arc(legendX, legendY, 5, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.fillStyle = '#334155';
      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${item.label}: ${pct}%`, legendX + 12, legendY);

      legendY += 24;
    });
  },

  // Helper: Draw rounded bar
  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < 2) return;
    const r = Math.min(radius, height / 2, width / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  },

  // Helper: Draw Legend
  drawLegend(ctx, x, y, items) {
    let curX = x;
    ctx.textBaseline = 'middle';
    ctx.font = '11px system-ui, -apple-system, sans-serif';

    items.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(curX, y, 10, 10, 2) : ctx.rect(curX, y, 10, 10);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, curX + 14, y + 5);

      curX += ctx.measureText(item.label).width + 24;
    });
  },

  /**
   * Render Business Insights Daily Revenue & Expense Trend Chart
   * Groups completed sales and deduplicated expenses by actual transaction date.
   * Handles empty states when no dated records exist.
   * Responsive across laptop and mobile viewports.
   */
  renderInsightsDailyTrend(canvasId, emptyStateId) {
    const canvas = document.getElementById(canvasId);
    const emptyEl = emptyStateId ? document.getElementById(emptyStateId) : null;
    if (!canvas) return;

    if (typeof VyaparStore === 'undefined' || !VyaparStore.getDailyFinancialTrend) return;
    const trend = VyaparStore.getDailyFinancialTrend();

    // Empty state: No dated transactions exist
    if (!trend.hasSufficientData || trend.days.length === 0) {
      canvas.style.display = 'none';
      if (emptyEl) {
        emptyEl.style.display = 'flex';
      }
      return;
    }

    // Has sufficient dated data
    canvas.style.display = 'block';
    if (emptyEl) {
      emptyEl.style.display = 'none';
    }

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Get responsive container width
    const parent = canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
    const width = Math.max(rect.width || 320, 280);
    const height = 260;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const days = trend.days;
    const maxVal = Math.max(...days.map(d => Math.max(d.revenue, d.expenses)), 500) * 1.25;

    const isMobile = width < 480;
    const padding = {
      top: 35,
      right: isMobile ? 15 : 25,
      bottom: 45,
      left: isMobile ? 48 : 55
    };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Horizontal gridlines & Y-axis labels
    const gridLines = 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = isMobile ? '10px system-ui, -apple-system, sans-serif' : '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const yVal = (maxVal / gridLines) * i;
      const yPos = padding.top + chartHeight - (i * (chartHeight / gridLines));

      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(width - padding.right, yPos);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText(this.formatRupees(yVal), padding.left - 6, yPos + 4);
    }

    // Draw grouped bars for each recorded transaction date
    const barGroupWidth = chartWidth / days.length;
    const maxBarW = isMobile ? 14 : 22;
    const barWidth = Math.min(barGroupWidth * 0.34, maxBarW);

    days.forEach((day, idx) => {
      const groupCenterX = padding.left + (idx * barGroupWidth) + (barGroupWidth / 2);

      // Revenue Bar (Emerald Green)
      const revVal = day.revenue;
      const revBarH = (revVal / maxVal) * chartHeight;
      const revX = groupCenterX - barWidth - 1;
      const revY = padding.top + chartHeight - revBarH;

      const revGrad = ctx.createLinearGradient(0, revY, 0, padding.top + chartHeight);
      revGrad.addColorStop(0, '#10b981');
      revGrad.addColorStop(1, '#059669');
      ctx.fillStyle = revGrad;
      this.drawRoundedRect(ctx, revX, revY, barWidth, revBarH, 3);

      // Expense Bar (Rose Red)
      const expVal = day.expenses;
      const expBarH = (expVal / maxVal) * chartHeight;
      const expX = groupCenterX + 1;
      const expY = padding.top + chartHeight - expBarH;

      const expGrad = ctx.createLinearGradient(0, expY, 0, padding.top + chartHeight);
      expGrad.addColorStop(0, '#f43f5e');
      expGrad.addColorStop(1, '#e11d48');
      ctx.fillStyle = expGrad;
      this.drawRoundedRect(ctx, expX, expY, barWidth, expBarH, 3);

      // Date Label below
      ctx.fillStyle = '#475569';
      ctx.font = isMobile ? '10px system-ui, -apple-system, sans-serif' : '11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';

      // Avoid clutter on mobile if many days exist
      if (!isMobile || days.length <= 5 || idx % 2 === 0 || idx === days.length - 1) {
        ctx.fillText(day.label, groupCenterX, height - 15);
      }
    });

    // Legend at Top
    const legendItems = [
      { label: 'Revenue (Bikri)', color: '#10b981' },
      { label: 'Expenses (Kharcha)', color: '#f43f5e' }
    ];
    const legendX = isMobile ? padding.left : width - padding.right - 210;
    this.drawLegend(ctx, legendX, 15, legendItems);
  }
};

if (typeof window !== 'undefined') {
  window.VyaparCharts = VyaparCharts;
}
if (typeof global !== 'undefined') {
  global.VyaparCharts = VyaparCharts;
}
