# Vyapar AI — Smart Business Co-Pilot 🇮🇳
### Modern, Responsive Web App for Small Indian Kirana & Retail Shopkeepers

> **Designed specifically for Indian Kirana & General Stores** (e.g. *Shree Ganesh Kirana & General Store*), Vyapar AI transforms traditional paper *Bahi-Khata* into a fast, intelligent, and delightfully simple digital business co-pilot.

---

## 🚀 How to Run the App

The application is completely standalone, lightweight, and operates **100% offline with zero external build tool requirements**.

### Option 1: Direct Browser Launch (Instant)
Simply double-click `index.html` in your file explorer, or right-click and open with **Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Brave**.

### Option 2: Windows Batch Runner
Double-click `start.bat` in the project root. It will automatically detect Node.js or Python and launch a local web server at `http://localhost:8080`.

### Option 3: Via Node.js
```bash
node server.js
# App will run at http://localhost:8080
```

### Option 4: Via Python
```bash
python server.py
# Or python -m http.server 8080
```

---

## 🌟 Implemented Features & Core Modules

### 1. Dukan Dashboard Overview
* **High-Level KPIs**:
  * **Today's Sales (Bikri)** with cash, UPI, and Udhar (credit) breakdown.
  * **Today's Net Profit (Munafa)** calculated automatically from Cost Price (CP) vs Selling Price (SP).
  * **October Monthly Sales & Net Profit** after deducting store expenses.
  * **Total Pending Udhar** across active customer credit ledgers.
  * **Low-Stock Alert Counter** highlighting items at risk of running out.
* **Interactive Canvas Charts** (Zero external CDN dependency, High-DPI Retina support):
  * **7-Day Sales vs Expenses Trend** multi-colored bar chart with ₹ gridlines.
  * **Category Revenue Share** donut chart (Grains, Pulses, Oils, Spices, Dairy, Personal Care).
  * **Payment Mode Distribution** chart (UPI/QR Soundbox vs Cash vs Udhar).
* **Recent Activity Tables**:
  * Quick-view recent bills with instant receipt viewing.
  * Quick-action **"+10 Restock"** buttons for critical inventory.

### 2. Sales Management & POS Billing (Bikri Khata)
* **Point-of-Sale (POS) Fast Billing Screen & Quick Record Sale**:
  * **Dedicated Quick Record Sale Modal**: Directly record a single-product sale with product dropdown, quantity, custom sale date & time, customer name, and payment mode.
  * **POS Catalog & Billing Cart**: Live search by product name or barcode/SKU, category quick filters, item cards with stock status.
  * **Strict Stock Validation**: Rejects sales atomically if inventory is insufficient and keeps stock untouched.
  * **Duplicate Stock Deduction Prevention**: Transaction locking and idempotency protection prevent double-click or replay deductions.
  * **Immediate Inventory Reduction**: Product stock is decremented immediately upon successful sale.
  * **Dynamic Shopping Cart**: Stepper quantity modifiers (`+` / `−`), unit prices, discount field in ₹, and live estimated profit preview.
  * **Payment Modes**: UPI (GPay/PhonePe/Paytm QR), Cash (Rokad), or Udhar (Credit).
* **Cash Register Bell**: Plays an authentic Web Audio API synthesized chime upon completing a sale.
* **80mm Thermal Receipt Generator & A4 Invoice**:
  * Formatted with shop details, customer info, itemized table, totals, and UPI QR standee mockup.
  * Native browser printing optimized with `@media print` rules.
* **Sales Ledger Table**: Searchable history with date, customer, payment mode, **Source indicator (Sample vs User)**, and WhatsApp bill sharing link.

### 3. Expense Management (Kharcha Tracker)
* **Categorized Expense Logging with Date Picker**:
  * Form with Expense Date picker, Description / Title, Amount, Category, Paid To, Payment Mode, and Notes.
  * Categories: Shop Rent, Mandi Tempo & Cartage, Electricity & Deep Freezer bills, Staff Salary/Advance, Polythene & Packaging Bags, Chai & Samosa Refreshments, Shop Maintenance, and Misc.
* **Payment Mode Tracking**: Cash, UPI, or Bank Transfer.
* **Viewing & Deleting**: Real-time table viewing, source badge (Sample vs User), and instant delete with live dashboard KPI recalculation.

### 4. Product and Inventory Management (Stock Control)
* **Realistic Indian Kirana Catalog**: Pre-seeded with 20 staple Indian grocery items, with all default records labeled as **Sample** and user-entered products labeled as **User**.
* **Full CRUD Operations**:
  * Add new products storing product name, category, cost price, selling price, stock quantity, minimum stock level, and measuring unit.
  * Edit existing products with live margin preview.
  * Delete products with instant catalog synchronization.
* **Search & Category Filtering**: Filter by product name, SKU, category, or stock status (In Stock, Low Stock, Out of Stock).
* **Stock Health Badges**:
  * 🟢 **In Stock**
  * ⚠️ **Low Stock** (Stock $\le$ Minimum alert limit)
  * 🔴 **Out of Stock**
* **Instant Quick-Restock**: Add stock with 1-click (`+10` units).

### 5. Profit & Margin Calculator (Munafa Ganit)
* **Real-Time Margin & Markup Simulator**:
  * Inputs: Wholesale Cost Price (₹), Retail Selling Price (₹), Estimated units sold.
  * Instant Output: Net Profit per unit (₹), Gross Margin %, Markup %, Projected Monthly Profit, and a Kirana health verdict badge.
* **Reverse Target Margin Calculator**:
  * Enter Wholesale Cost and desired target margin (e.g., 20%) to get the exact recommended retail price to charge.
* **Kirana Benchmark Guidelines**: Reference margins across staple categories (loose grains, spices, oils, toiletries).

### 6. "Ask Your Business" Vyapar Assistant 💼
* **Conversational Business Assistant for Store Owners**:
  * **Direct Ledger Calculations**: Reads current products, sales, expenses, and calculated profit directly from the application's unified data layer (`VyaparStore`).
  * **Honest Labeling (No Pretense)**: Clearly designated as **⚙️ Rule-Based Assistant (Verified Store Ledger)**. Transparently clarifies that calculations are deterministic and executed by application code without claiming an external AI model is connected.
  * **Zero Frontend API Key Exposure**: Secure architecture with no hardcoded credentials or API tokens in client-side code.
* **Suggested Question Buttons (One-Click Inquiries)**:
  1. 💰 **"What is my net profit?"**: Distinguishes Revenue, COGS, Gross Profit, Operating Expenses, and Net Profit. Explains the step-by-step arithmetic evidence for today and month-to-date, including notices for pending customer credit (Udhar).
  2. ⚠️ **"Which products are low in stock?"**: Analyzes inventory deficits against safety thresholds, separates out-of-stock from low-stock items, and estimates required replenishment capital.
  3. 📉 **"What are my biggest expenses?"**: Deduplicates expense entries to guarantee no expense is counted twice, ranks top individual outlays, and breaks down expenses by category share (Rent, Salary, Electricity, Packaging, Cartage).
  4. 🏆 **"Which products have sold the most?"**: Aggregates completed sales by volume and realized revenue, listing unit rates and source invoice numbers.
  5. 📦 **"Which products should I restock?"**: Details both the **stock level deficit** and the **sales history** behind every recommendation, with clear notes on predictive demand forecasting limitations (requires 3–6 months history) and unrecorded supplier details (MOQs, distributor credit).
  6. 📊 **"Summarize my business performance."**: Delivers an executive business summary covering revenue, gross profit, net profit, inventory valuation at cost, active stock alerts, and customer credit (Udhar) balances.
* **Dynamic Data Updates**: Any new sale, expense, product restock, or edit dynamically updates the assistant's figures in real-time.
* **Markdown Formatting**: Renders clean ASCII tables, bold key metrics, arithmetic audit boxes, and bulleted recommendations.

### 7. Smart Insights & Intelligence Hub 📊
* **Gross Profit & Net Profit Financial Summaries**:
  * Real-time metrics for Completed Revenue, COGS, Gross Profit (with Gross Margin %), Deduplicated Operating Expenses, and Net Profit (with Net Margin %).
  * Multi-period view selector (All-Time Cumulative, This Month, Today) consistent across all financial calculators.
* **Daily Revenue & Expense Trend Canvas Chart**:
  * Grouped strictly by real transaction dates using the built-in zero-dependency canvas chart engine.
  * Plots daily completed sales revenue against daily operating expenses.
  * Empty-state support when no dated transactions exist without throwing errors or inventing fictitious dates.
* **Top-Selling Products by Completed Quantity**:
  * Ranked by completed sale quantities (`units sold`) from customer invoices.
  * Displays units sold, realized revenue, gross profit, and unit price with clean empty states for new shops.
* **Low-Stock Alerts Based on Configured Thresholds**:
  * Monitors actual product stock levels against each product's configured `minStock` threshold (`stock <= minStock`).
  * Distinguishes 🔴 Out of Stock (0 units) vs ⚠️ Low Stock items, showing exact stock deficits.
  * **1-Click WhatsApp Distributor Order Generator**: Auto-generates complete distributor purchase orders formatted with itemized quantities and shop details.
* **Three Concise Data-Driven Business Recommendations**:
  * Automatically calculates exactly 3 concise action recommendations based on real inventory deficits, top-selling velocity, and expense category distributions.
  * Every recommendation includes an explicit **"Evidence & Why"** explanation citing live units, rupee values, or percentage shares.
* **Udhar (Credit) Recovery Center**:
  * Lists customers with pending credit balances and last active transaction dates.
  * Generates customized, polite Hindi WhatsApp payment reminders containing the shop's UPI ID.

### 8. Customer Udhar (Credit) Bahi Khata
* Dedicated customer ledger tracking outstanding balances, customer phone numbers, and addresses.
* **"₹ Settle Payment"** modal allowing customers to pay partial or full balances via Cash or UPI.

---

## 📱 Design & Responsiveness
* **Desktop & Laptop**: Spacious sidebar navigation, multi-column KPI grids, side-by-side POS billing and catalog.
* **Mobile & Tablet**: Collapsible hamburger drawer, touch-friendly bottom navigation bar, optimized card grids.
* **Offline Safe LocalStorage Persistence & Fault-Tolerant Recovery**:
  * All sales, inventory changes, expenses, and customer credit persist safely across browser reloads.
  * **Self-Healing Corrupt Data Parser**: Handles corrupted JSON, null objects, or malformed data safely with automatic fallback recovery without crashing or erasing records.
  * **Sample vs User Record Distinction**: Default demo records are clearly marked with `[Sample]` tags, while records entered by the shopkeeper are marked with `[User]` tags.
* **Data Management**:
  * **Export Backup (JSON)**: Export the complete store database for safekeeping.
  * **Reset to Default Sample**: 1-click restore to realistic Indian Kirana sample data.

---

## ⚠️ Stated Limitations & Future Roadmap

To comply with the prompt's instruction (*"If a feature cannot be completed, clearly state its limitation"*):

1. **Hardware Thermal Printer Direct Spooling (ESC/POS)**:
   * *Current Implementation*: Uses standard browser printing (`window.print()`) with a custom 80mm thermal CSS stylesheet.
   * *Limitation*: Direct raw serial/USB ESC/POS commands require native device drivers or a desktop bridge (e.g., Electron / WebUSB), which is outside standard browser security sandboxes.
2. **Cloud Database Multi-Device Sync**:
   * *Current Implementation*: Uses persistent browser `localStorage`.
   * *Limitation*: Data is persisted locally on the specific device/browser. To sync across multiple cash counters simultaneously, a cloud database (e.g., Firebase Firestore or PostgreSQL) would be required.
3. **Automated WhatsApp Business Cloud API Sending**:
   * *Current Implementation*: Generates pre-formatted WhatsApp Web/App deep links (`https://wa.me/91...?text=...`) allowing the shopkeeper to review and send messages with one tap.
   * *Limitation*: Fully automated background WhatsApp dispatch requires an official Meta WhatsApp Business API account with approved message templates.
4. **External Language-Model API Connectivity**:
   * *Current Implementation*: Operates as a transparent, deterministic rule-based assistant calculating exact financial and inventory figures directly from application ledger data.
   * *Limitation*: Connecting an external large language model requires configuring a secure backend API proxy (`window.VYAPAR_AI_CONFIG.endpoint`). Frontend code intentionally does not embed private API keys to safeguard store credentials.

