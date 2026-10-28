/**
 * Vyapar AI — Data Layer & LocalStorage Persistence
 * Realistic sample data, safe initialization, stock deduction, and idempotency for an Indian Kirana store.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'vyapar_products_v1',
  SALES: 'vyapar_sales_v1',
  EXPENSES: 'vyapar_expenses_v1',
  CUSTOMERS: 'vyapar_customers_v1',
  SETTINGS: 'vyapar_settings_v1',
  PROCESSED_TXNS: 'vyapar_processed_txns_v1',
  AI_CHAT: 'vyapar_aichat_v1'
};

const DEFAULT_SETTINGS = {
  shopName: "Shree Ganesh Kirana & General Store",
  proprietor: "Ramesh Gupta",
  phone: "+91 98765 43210",
  address: "Shop No. 12, Main Mandi Road, Sector 4, Jaipur",
  gstin: "08AABCS1429B1Z",
  upiId: "shreeganesh@upi",
  currency: "₹",
  language: "en",
  taxRate: 0
};

// 20 realistic Indian grocery products with isDemo: true
const DEFAULT_PRODUCTS = [
  {
    id: "PRD-101",
    sku: "890103001",
    name: "Aashirvaad Shudh Chakki Atta 10kg",
    category: "Atta, Rice & Grains",
    costPrice: 380,
    sellingPrice: 425,
    stock: 14,
    quantity: 14,
    minStock: 8,
    unit: "Bag",
    lastRestocked: "2026-10-22",
    isDemo: true
  },
  {
    id: "PRD-102",
    sku: "890103002",
    name: "India Gate Basmati Rice Feast Rozzana 5kg",
    category: "Atta, Rice & Grains",
    costPrice: 360,
    sellingPrice: 410,
    stock: 6,
    quantity: 6,
    minStock: 10,
    unit: "Bag",
    lastRestocked: "2026-10-18",
    isDemo: true
  },
  {
    id: "PRD-103",
    sku: "890103003",
    name: "Tata Sampann Unpolished Toor Dal 1kg",
    category: "Dals & Pulses",
    costPrice: 145,
    sellingPrice: 175,
    stock: 22,
    quantity: 22,
    minStock: 10,
    unit: "Pkt",
    lastRestocked: "2026-10-25",
    isDemo: true
  },
  {
    id: "PRD-104",
    sku: "890103004",
    name: "Rajdhani Besan 1kg",
    category: "Atta, Rice & Grains",
    costPrice: 88,
    sellingPrice: 108,
    stock: 4,
    quantity: 4,
    minStock: 8,
    unit: "Pkt",
    lastRestocked: "2026-10-15",
    isDemo: true
  },
  {
    id: "PRD-105",
    sku: "890103005",
    name: "Fortune Sunlite Refined Sunflower Oil 1L",
    category: "Edible Oils & Ghee",
    costPrice: 132,
    sellingPrice: 148,
    stock: 18,
    quantity: 18,
    minStock: 12,
    unit: "Pouch",
    lastRestocked: "2026-10-24",
    isDemo: true
  },
  {
    id: "PRD-106",
    sku: "890103006",
    name: "Dhara Kachi Ghani Mustard Oil 1L Bottle",
    category: "Edible Oils & Ghee",
    costPrice: 152,
    sellingPrice: 172,
    stock: 3,
    quantity: 3,
    minStock: 10,
    unit: "Bottle",
    lastRestocked: "2026-10-12",
    isDemo: true
  },
  {
    id: "PRD-107",
    sku: "890103007",
    name: "Amul Pure Ghee 1L Tin",
    category: "Edible Oils & Ghee",
    costPrice: 580,
    sellingPrice: 650,
    stock: 8,
    quantity: 8,
    minStock: 6,
    unit: "Tin",
    lastRestocked: "2026-10-20",
    isDemo: true
  },
  {
    id: "PRD-108",
    sku: "890103008",
    name: "Tata Salt Vacuum Evaporated Iodized 1kg",
    category: "Spices & Masala",
    costPrice: 22,
    sellingPrice: 28,
    stock: 45,
    quantity: 45,
    minStock: 20,
    unit: "Pkt",
    lastRestocked: "2026-10-26",
    isDemo: true
  },
  {
    id: "PRD-109",
    sku: "890103009",
    name: "Everest Turmeric / Haldi Powder 200g",
    category: "Spices & Masala",
    costPrice: 52,
    sellingPrice: 68,
    stock: 16,
    quantity: 16,
    minStock: 8,
    unit: "Pkt",
    lastRestocked: "2026-10-21",
    isDemo: true
  },
  {
    id: "PRD-110",
    sku: "890103010",
    name: "MDH Deggi Mirch 100g",
    category: "Spices & Masala",
    costPrice: 72,
    sellingPrice: 92,
    stock: 12,
    quantity: 12,
    minStock: 6,
    unit: "Box",
    lastRestocked: "2026-10-19",
    isDemo: true
  },
  {
    id: "PRD-111",
    sku: "890103011",
    name: "Maggi 2-Minute Masala Noodles (Pack of 4)",
    category: "Snacks & Packaged Food",
    costPrice: 50,
    sellingPrice: 58,
    stock: 2,
    quantity: 2,
    minStock: 15,
    unit: "Pack",
    lastRestocked: "2026-10-10",
    isDemo: true
  },
  {
    id: "PRD-112",
    sku: "890103012",
    name: "Parle-G Gold Biscuits 250g Family Pack",
    category: "Snacks & Packaged Food",
    costPrice: 24,
    sellingPrice: 30,
    stock: 35,
    quantity: 35,
    minStock: 15,
    unit: "Pkt",
    lastRestocked: "2026-10-26",
    isDemo: true
  },
  {
    id: "PRD-113",
    sku: "890103013",
    name: "Haldiram's Nagpur Aloo Bhujia 400g",
    category: "Snacks & Packaged Food",
    costPrice: 94,
    sellingPrice: 115,
    stock: 11,
    quantity: 11,
    minStock: 8,
    unit: "Pkt",
    lastRestocked: "2026-10-23",
    isDemo: true
  },
  {
    id: "PRD-114",
    sku: "890103014",
    name: "Amul Taaza Homogenised Toned Milk 500ml",
    category: "Dairy & Beverages",
    costPrice: 25.5,
    sellingPrice: 28,
    stock: 28,
    quantity: 28,
    minStock: 15,
    unit: "Pouch",
    lastRestocked: "2026-10-28",
    isDemo: true
  },
  {
    id: "PRD-115",
    sku: "890103015",
    name: "Brooke Bond Red Label Tea 500g",
    category: "Dairy & Beverages",
    costPrice: 215,
    sellingPrice: 260,
    stock: 9,
    quantity: 9,
    minStock: 6,
    unit: "Pkt",
    lastRestocked: "2026-10-20",
    isDemo: true
  },
  {
    id: "PRD-116",
    sku: "890103016",
    name: "Surf Excel Easy Wash Detergent Powder 1kg",
    category: "Cleaning & Household",
    costPrice: 118,
    sellingPrice: 142,
    stock: 14,
    quantity: 14,
    minStock: 8,
    unit: "Pkt",
    lastRestocked: "2026-10-22",
    isDemo: true
  },
  {
    id: "PRD-117",
    sku: "890103017",
    name: "Vim Dishwash Bar 300g with Scrubber",
    category: "Cleaning & Household",
    costPrice: 28,
    sellingPrice: 35,
    stock: 40,
    quantity: 40,
    minStock: 12,
    unit: "Bar",
    lastRestocked: "2026-10-24",
    isDemo: true
  },
  {
    id: "PRD-118",
    sku: "890103018",
    name: "Dettol Bathing Soap (Pack of 4x100g)",
    category: "Personal Care",
    costPrice: 165,
    sellingPrice: 198,
    stock: 5,
    quantity: 5,
    minStock: 8,
    unit: "Pack",
    lastRestocked: "2026-10-16",
    isDemo: true
  },
  {
    id: "PRD-119",
    sku: "890103019",
    name: "Colgate Strong Teeth Toothpaste 200g",
    category: "Personal Care",
    costPrice: 96,
    sellingPrice: 118,
    stock: 15,
    quantity: 15,
    minStock: 6,
    unit: "Tube",
    lastRestocked: "2026-10-22",
    isDemo: true
  },
  {
    id: "PRD-120",
    sku: "890103020",
    name: "Loose Moong Dal Dhuli Premium 1kg",
    category: "Dals & Pulses",
    costPrice: 110,
    sellingPrice: 135,
    stock: 0,
    quantity: 0,
    minStock: 15,
    unit: "kg",
    lastRestocked: "2026-10-05",
    isDemo: true
  }
];

const DEFAULT_CUSTOMERS = [
  {
    id: "CUST-1",
    name: "Sharma Ji (Teacher)",
    phone: "9829012345",
    address: "House 45, Gali No. 3",
    totalCredit: 1250,
    lastTransactionDate: "2026-10-27",
    isDemo: true
  },
  {
    id: "CUST-2",
    name: "Verma Contractor",
    phone: "9414098765",
    address: "B-12, Green Park",
    totalCredit: 2480,
    lastTransactionDate: "2026-10-26",
    isDemo: true
  },
  {
    id: "CUST-3",
    name: "Pooja Madam",
    phone: "9785023456",
    address: "Flat 204, Royal Heights",
    totalCredit: 0,
    lastTransactionDate: "2026-10-28",
    isDemo: true
  },
  {
    id: "CUST-4",
    name: "Suresh Auto Wale Bhaiya",
    phone: "9928045678",
    address: "Chauraha Stand",
    totalCredit: 420,
    lastTransactionDate: "2026-10-25",
    isDemo: true
  },
  {
    id: "CUST-5",
    name: "Gupta Uncle",
    phone: "9828033221",
    address: "Near Water Tank",
    totalCredit: 890,
    lastTransactionDate: "2026-10-24",
    isDemo: true
  }
];

const DEFAULT_SALES = [
  {
    id: "INV-2026-1081",
    date: "2026-10-28T09:15:00",
    customerName: "Pooja Madam",
    customerPhone: "9785023456",
    paymentMode: "UPI",
    items: [
      { productId: "PRD-114", name: "Amul Taaza Milk 500ml", price: 28, costPrice: 25.5, quantity: 2, subtotal: 56 },
      { productId: "PRD-112", name: "Parle-G Gold Biscuits 250g", price: 30, costPrice: 24, quantity: 2, subtotal: 60 },
      { productId: "PRD-108", name: "Tata Salt 1kg", price: 28, costPrice: 22, quantity: 1, subtotal: 28 }
    ],
    totalAmount: 144,
    totalCost: 121,
    grossProfit: 23,
    status: "Completed",
    notes: "Paid via PhonePe QR",
    isDemo: true
  },
  {
    id: "INV-2026-1080",
    date: "2026-10-28T10:45:00",
    customerName: "Sharma Ji (Teacher)",
    customerPhone: "9829012345",
    paymentMode: "Udhar",
    items: [
      { productId: "PRD-101", name: "Aashirvaad Atta 10kg", price: 425, costPrice: 380, quantity: 1, subtotal: 425 },
      { productId: "PRD-105", name: "Fortune Sunflower Oil 1L", price: 148, costPrice: 132, quantity: 2, subtotal: 296 },
      { productId: "PRD-103", name: "Tata Sampann Toor Dal 1kg", price: 175, costPrice: 145, quantity: 1, subtotal: 175 }
    ],
    totalAmount: 896,
    totalCost: 789,
    grossProfit: 107,
    status: "Pending Credit",
    notes: "Monthly bahi khata",
    isDemo: true
  },
  {
    id: "INV-2026-1079",
    date: "2026-10-28T11:30:00",
    customerName: "Walk-in Customer",
    customerPhone: "",
    paymentMode: "Cash",
    items: [
      { productId: "PRD-115", name: "Red Label Tea 500g", price: 260, costPrice: 215, quantity: 1, subtotal: 260 },
      { productId: "PRD-113", name: "Haldiram Aloo Bhujia 400g", price: 115, costPrice: 94, quantity: 1, subtotal: 115 }
    ],
    totalAmount: 375,
    totalCost: 309,
    grossProfit: 66,
    status: "Completed",
    notes: "Exact cash paid",
    isDemo: true
  },
  {
    id: "INV-2026-1078",
    date: "2026-10-27T18:20:00",
    customerName: "Verma Contractor",
    customerPhone: "9414098765",
    paymentMode: "Udhar",
    items: [
      { productId: "PRD-107", name: "Amul Pure Ghee 1L Tin", price: 650, costPrice: 580, quantity: 2, subtotal: 1300 },
      { productId: "PRD-116", name: "Surf Excel 1kg", price: 142, costPrice: 118, quantity: 2, subtotal: 284 }
    ],
    totalAmount: 1584,
    totalCost: 1396,
    grossProfit: 188,
    status: "Pending Credit",
    notes: "Weekly settlement",
    isDemo: true
  },
  {
    id: "INV-2026-1077",
    date: "2026-10-27T15:10:00",
    customerName: "Kishore Bhai",
    customerPhone: "9829112233",
    paymentMode: "UPI",
    items: [
      { productId: "PRD-102", name: "India Gate Basmati Rice 5kg", price: 410, costPrice: 360, quantity: 1, subtotal: 410 },
      { productId: "PRD-109", name: "Everest Haldi 200g", price: 68, costPrice: 52, quantity: 1, subtotal: 68 }
    ],
    totalAmount: 478,
    totalCost: 412,
    grossProfit: 66,
    status: "Completed",
    notes: "Google Pay",
    isDemo: true
  }
];

const DEFAULT_EXPENSES = [
  {
    id: "EXP-501",
    date: "2026-10-28",
    title: "Chai, Samosa & Shop Refreshments",
    description: "Chai, Samosa & Shop Refreshments",
    category: "Refreshments & Hospitality",
    amount: 120,
    paymentMode: "Cash",
    paidTo: "Shankar Tea Stall",
    notes: "Morning tea and snacks for shop helper",
    isDemo: true
  },
  {
    id: "EXP-502",
    date: "2026-10-27",
    title: "Tempo Cartage (Mandi Freight)",
    description: "Tempo Cartage (Mandi Freight)",
    category: "Transportation & Freight",
    amount: 350,
    paymentMode: "Cash",
    paidTo: "Kalu Tempo Driver",
    notes: "Transported 10 bags Atta and oil tins from Muhana Mandi",
    isDemo: true
  },
  {
    id: "EXP-503",
    date: "2026-10-25",
    title: "Carry Bags & Packaging Plastic",
    description: "Carry Bags & Packaging Plastic",
    category: "Packaging & Bags",
    amount: 480,
    paymentMode: "UPI",
    paidTo: "Krishna Packaging",
    notes: "Cloth & plastic grocery bags roll",
    isDemo: true
  },
  {
    id: "EXP-504",
    date: "2026-10-20",
    title: "Monthly Shop Electricity Bill",
    description: "Monthly Shop Electricity Bill",
    category: "Electricity & Utilities",
    amount: 2150,
    paymentMode: "UPI",
    paidTo: "JVVNL Jaipur Discom",
    notes: "Includes Deep Freezer and shop AC/lighting bill",
    isDemo: true
  },
  {
    id: "EXP-505",
    date: "2026-10-15",
    title: "Deep Freezer Repair & Gas Refill",
    description: "Deep Freezer Repair & Gas Refill",
    category: "Shop Maintenance",
    amount: 850,
    paymentMode: "Cash",
    paidTo: "Sharma Refrigeration",
    notes: "Dairy cooler fan serviced",
    isDemo: true
  },
  {
    id: "EXP-506",
    date: "2026-10-05",
    title: "Shop Boy (Chhotu) Salary Advance",
    description: "Shop Boy (Chhotu) Salary Advance",
    category: "Staff Salary",
    amount: 3500,
    paymentMode: "Cash",
    paidTo: "Chhotu Kumar",
    notes: "October part salary advance",
    isDemo: true
  },
  {
    id: "EXP-507",
    date: "2026-10-01",
    title: "Monthly Shop Rent (October)",
    description: "Monthly Shop Rent (October)",
    category: "Shop Rent",
    amount: 9000,
    paymentMode: "Bank Transfer",
    paidTo: "Landlord Babulal Ji",
    notes: "Paid on 1st of month",
    isDemo: true
  }
];

// Helper: Safely parse and validate arrays from LocalStorage
function safeGetArray(key, fallbackData, sanitizeFn) {
  try {
    if (typeof localStorage === 'undefined') return [...fallbackData];
    const raw = localStorage.getItem(key);
    if (!raw) return [...fallbackData];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`[VyaparStore] Invalid non-array data found in key "${key}". Restoring defaults.`);
      localStorage.setItem(key, JSON.stringify(fallbackData));
      return [...fallbackData];
    }

    const sanitized = parsed.map(item => {
      try {
        return sanitizeFn ? sanitizeFn(item) : item;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return sanitized;
  } catch (err) {
    console.error(`[VyaparStore] Corrupted JSON in localStorage key "${key}". Recovering.`, err);
    return [...fallbackData];
  }
}

// Data Layer Manager
const VyaparStore = {
  getSettings() {
    try {
      if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  },

  getProducts() {
    return safeGetArray(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS, (p) => {
      if (!p || typeof p !== 'object') return null;
      const stockVal = parseInt(p.quantity ?? p.stock) || 0;
      return {
        id: String(p.id || 'PRD-' + Math.random().toString().slice(2, 6)),
        sku: String(p.sku || ''),
        name: String(p.name || 'Unnamed Product'),
        category: String(p.category || 'General Items'),
        costPrice: Math.max(0, parseFloat(p.costPrice) || 0),
        sellingPrice: Math.max(0, parseFloat(p.sellingPrice) || 0),
        stock: stockVal,
        quantity: stockVal, // alias
        minStock: Math.max(0, parseInt(p.minStock ?? p.minStockLevel) || 5),
        unit: String(p.unit || 'Pkt'),
        lastRestocked: String(p.lastRestocked || new Date().toISOString().split('T')[0]),
        isDemo: Boolean(p.isDemo)
      };
    });
  },

  saveProducts(products) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  addProduct(product) {
    if (!product || typeof product !== 'object') {
      throw new Error("Invalid product data provided.");
    }

    const trimmedName = String(product.name || '').trim();
    if (!trimmedName) {
      throw new Error("Product name cannot be blank.");
    }

    const costPrice = parseFloat(product.costPrice);
    const sellingPrice = parseFloat(product.sellingPrice);
    const stockVal = parseInt(product.quantity ?? product.stock);
    const minStock = parseInt(product.minStock ?? product.minStockLevel);

    // Reject negative prices, quantities, and thresholds
    if (isNaN(costPrice) || costPrice < 0) {
      throw new Error("Cost price cannot be negative.");
    }
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      throw new Error("Selling price cannot be negative.");
    }
    if (isNaN(stockVal) || stockVal < 0) {
      throw new Error("Product quantity cannot be negative.");
    }
    if (isNaN(minStock) || minStock < 0) {
      throw new Error("Minimum stock alert level cannot be negative.");
    }

    const products = this.getProducts();

    // Prevent creating duplicate records accidentally (match by name or SKU)
    const normalizedSku = product.sku ? String(product.sku).trim().toLowerCase() : null;
    const existing = products.find(p => {
      const matchName = p.name && p.name.trim().toLowerCase() === trimmedName.toLowerCase();
      const matchSku = normalizedSku && p.sku && p.sku.trim().toLowerCase() === normalizedSku;
      return matchName || matchSku;
    });

    if (existing) {
      throw new Error(`Product "${trimmedName}" already exists in inventory (SKU: ${existing.sku || existing.id}).`);
    }

    const newProduct = {
      id: product.id || ("PRD-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900)),
      sku: String(product.sku || ("890" + Date.now().toString().slice(-6))).trim(),
      name: trimmedName,
      category: String(product.category || 'General Items'),
      costPrice: costPrice,
      sellingPrice: sellingPrice,
      stock: stockVal,
      quantity: stockVal,
      minStock: minStock,
      unit: String(product.unit || 'Pkt'),
      lastRestocked: new Date().toISOString().split('T')[0],
      isDemo: false, // User created record
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id, updatedFields) {
    if (!id || !updatedFields) return null;

    // Reject blank name if name is being updated
    let trimmedName;
    if (updatedFields.name !== undefined) {
      trimmedName = String(updatedFields.name).trim();
      if (!trimmedName) {
        throw new Error("Product name cannot be blank.");
      }
    }

    // Reject negative inputs
    if (updatedFields.costPrice !== undefined) {
      const cp = parseFloat(updatedFields.costPrice);
      if (isNaN(cp) || cp < 0) throw new Error("Cost price cannot be negative.");
    }
    if (updatedFields.sellingPrice !== undefined) {
      const sp = parseFloat(updatedFields.sellingPrice);
      if (isNaN(sp) || sp < 0) throw new Error("Selling price cannot be negative.");
    }
    const newQty = updatedFields.quantity !== undefined ? updatedFields.quantity : updatedFields.stock;
    if (newQty !== undefined) {
      const q = parseInt(newQty);
      if (isNaN(q) || q < 0) throw new Error("Product quantity cannot be negative.");
    }
    if (updatedFields.minStock !== undefined) {
      const ms = parseInt(updatedFields.minStock);
      if (isNaN(ms) || ms < 0) throw new Error("Minimum stock alert level cannot be negative.");
    }

    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    // Check duplicate name or SKU against other products
    const normalizedSku = updatedFields.sku !== undefined ? String(updatedFields.sku).trim().toLowerCase() : null;
    if (trimmedName || normalizedSku) {
      const duplicate = products.find(p => {
        if (p.id === id) return false;
        const matchName = trimmedName && p.name && p.name.trim().toLowerCase() === trimmedName.toLowerCase();
        const matchSku = normalizedSku && p.sku && p.sku.trim().toLowerCase() === normalizedSku;
        return matchName || matchSku;
      });
      if (duplicate) {
        throw new Error(`Another product with name "${trimmedName || duplicate.name}" or SKU already exists.`);
      }
    }

    const current = products[index];
    const stockVal = updatedFields.quantity !== undefined
      ? parseInt(updatedFields.quantity) || 0
      : (updatedFields.stock !== undefined ? parseInt(updatedFields.stock) || 0 : current.stock);

    products[index] = {
      ...current,
      ...updatedFields,
      name: trimmedName !== undefined ? trimmedName : current.name,
      costPrice: updatedFields.costPrice !== undefined ? parseFloat(updatedFields.costPrice) : current.costPrice,
      sellingPrice: updatedFields.sellingPrice !== undefined ? parseFloat(updatedFields.sellingPrice) : current.sellingPrice,
      stock: stockVal,
      quantity: stockVal,
      minStock: updatedFields.minStock !== undefined ? parseInt(updatedFields.minStock) : current.minStock,
      isDemo: current.isDemo // preserve flag
    };
    this.saveProducts(products);
    return products[index];
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  restockProduct(id, addQuantity) {
    const products = this.getProducts();
    const p = products.find(x => x.id === id);
    if (p) {
      const qty = parseInt(addQuantity) || 0;
      p.stock = Math.max(0, p.stock + qty);
      p.quantity = p.stock;
      p.lastRestocked = new Date().toISOString().split('T')[0];
      this.saveProducts(products);
      return p;
    }
    return null;
  },

  getSales() {
    return safeGetArray(STORAGE_KEYS.SALES, DEFAULT_SALES, (s) => {
      if (!s || typeof s !== 'object') return null;
      return {
        id: String(s.id || 'INV-' + Math.random().toString().slice(2, 6)),
        date: String(s.date || new Date().toISOString()),
        customerName: String(s.customerName || 'Walk-in Customer'),
        customerPhone: String(s.customerPhone || ''),
        paymentMode: String(s.paymentMode || 'Cash'),
        items: Array.isArray(s.items) ? s.items : [],
        totalAmount: parseFloat(s.totalAmount) || 0,
        totalCost: parseFloat(s.totalCost) || 0,
        grossProfit: parseFloat(s.grossProfit) || 0,
        status: String(s.status || 'Completed'),
        notes: String(s.notes || ''),
        isDemo: Boolean(s.isDemo)
      };
    });
  },

  getSaleById(id) {
    if (!id) return null;
    return this.getSales().find(s => s.id === id) || null;
  },

  saveSales(sales) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    }
  },

  /**
   * Record a sale:
   * - Validates positive quantities, non-negative prices, and total amount
   * - Validates sufficient stock for all items
   * - Rejects sales if stock is insufficient
   * - Prevents duplicate stock deductions
   * - Stores selling price and cost price snapshot in each record
   * - Reduces inventory immediately upon success
   */
  recordSale(saleData) {
    if (!saleData || !Array.isArray(saleData.items) || saleData.items.length === 0) {
      throw new Error("Cannot record empty sale: No items specified.");
    }

    const proposedAmount = parseFloat(saleData.totalAmount);
    if (isNaN(proposedAmount) || proposedAmount < 0) {
      throw new Error("Sale total amount cannot be negative.");
    }

    const sales = this.getSales();
    const products = this.getProducts();

    // 1. Duplicate check (Idempotency)
    const proposedId = saleData.id;
    if (proposedId && sales.some(s => s.id === proposedId)) {
      throw new Error(`Duplicate transaction: Sale ${proposedId} has already been processed.`);
    }

    // 2. Strict stock and non-negative values validation (Atomic check)
    for (const item of saleData.items) {
      const prd = products.find(p => p.id === item.productId);
      if (!prd) {
        throw new Error(`Product not found: "${item.name || item.productId}".`);
      }
      const reqQty = parseInt(item.quantity);
      if (isNaN(reqQty) || reqQty <= 0) {
        throw new Error(`Sale quantity for "${prd.name}" must be greater than zero.`);
      }

      const itemPrice = parseFloat(item.price);
      if (isNaN(itemPrice) || itemPrice < 0) {
        throw new Error(`Selling price for "${prd.name}" cannot be negative.`);
      }

      const itemCost = parseFloat(item.costPrice !== undefined ? item.costPrice : prd.costPrice);
      if (isNaN(itemCost) || itemCost < 0) {
        throw new Error(`Cost price for "${prd.name}" cannot be negative.`);
      }

      if (prd.stock < reqQty) {
        throw new Error(`Insufficient stock for "${prd.name}". Available: ${prd.stock} ${prd.unit || 'units'}, Requested: ${reqQty}.`);
      }
    }

    // 3. Deduct stock for all items
    saleData.items.forEach(item => {
      const prd = products.find(p => p.id === item.productId);
      if (prd) {
        const q = parseInt(item.quantity) || 0;
        prd.stock -= q;
        prd.quantity = prd.stock;
      }
    });
    this.saveProducts(products);

    // 4. Generate unique invoice number & snapshot records
    const invoiceNum = proposedId || ("INV-" + new Date().getFullYear() + "-" + (1000 + sales.length + 1));
    const saleDate = saleData.date || new Date().toISOString();

    let calculatedTotalCOGS = 0;
    const itemSnapshots = saleData.items.map(i => {
      const prd = products.find(p => p.id === i.productId);
      const unitPrice = parseFloat(i.price);
      const unitCost = parseFloat(i.costPrice !== undefined ? i.costPrice : (prd ? prd.costPrice : 0));
      const q = parseInt(i.quantity);
      const subtotal = parseFloat(i.subtotal !== undefined ? i.subtotal : (unitPrice * q));
      const cogs = unitCost * q;
      const productGrossProfit = q * (unitPrice - unitCost);

      calculatedTotalCOGS += cogs;

      return {
        productId: i.productId,
        name: String(i.name || (prd ? prd.name : 'Item')),
        price: unitPrice,        // Selling price snapshot
        costPrice: unitCost,     // Recorded unit cost snapshot
        quantity: q,
        subtotal: subtotal,
        cogs: cogs,              // Product COGS
        grossProfit: productGrossProfit // Product Gross Profit
      };
    });

    const finalAmount = parseFloat(saleData.totalAmount);
    const finalCOGS = saleData.totalCost !== undefined ? parseFloat(saleData.totalCost) : calculatedTotalCOGS;
    const finalGrossProfit = finalAmount - finalCOGS;
    const saleStatus = saleData.status || (saleData.paymentMode === "Udhar" ? "Pending Credit" : "Completed");

    const newSale = {
      id: invoiceNum,
      date: saleDate,
      customerName: String(saleData.customerName || "Walk-in Customer").trim(),
      customerPhone: String(saleData.customerPhone || "").trim(),
      paymentMode: saleData.paymentMode || "Cash",
      items: itemSnapshots,
      totalAmount: finalAmount,
      totalCost: finalCOGS,
      grossProfit: finalGrossProfit,
      status: saleStatus,
      notes: saleData.notes || "",
      isDemo: false // User created sale
    };

    sales.unshift(newSale);
    this.saveSales(sales);

    // 5. If sale was Udhar, update customer credit ledger
    if (saleData.paymentMode === "Udhar" && newSale.customerName && newSale.customerName !== "Walk-in Customer") {
      this.addCustomerCredit(newSale.customerName, newSale.customerPhone, newSale.totalAmount);
    }

    return newSale;
  },

  getExpenses() {
    return safeGetArray(STORAGE_KEYS.EXPENSES, DEFAULT_EXPENSES, (e) => {
      if (!e || typeof e !== 'object') return null;
      const desc = String(e.description || e.title || 'Expense');
      return {
        id: String(e.id || 'EXP-' + Math.random().toString().slice(2, 6)),
        date: String(e.date || new Date().toISOString().split('T')[0]),
        title: desc,
        description: desc,
        category: String(e.category || 'Miscellaneous'),
        amount: Math.max(0, parseFloat(e.amount) || 0),
        paymentMode: String(e.paymentMode || 'Cash'),
        paidTo: String(e.paidTo || 'Vendor'),
        notes: String(e.notes || ''),
        isDemo: Boolean(e.isDemo)
      };
    });
  },

  saveExpenses(expenses) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    }
  },

  addExpense(expData) {
    const amount = parseFloat(expData.amount);
    // Reject negative and zero expense amounts
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Expense amount must be greater than zero.");
    }

    const expenses = this.getExpenses();
    const desc = String(expData.description || expData.title || '').trim() || "Store Expense";

    const newExp = {
      id: expData.id || ("EXP-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900)),
      date: expData.date || new Date().toISOString().split('T')[0],
      title: desc,
      description: desc,
      category: expData.category || "Miscellaneous",
      amount: amount,
      paymentMode: expData.paymentMode || "Cash",
      paidTo: expData.paidTo || "Vendor",
      notes: expData.notes || "",
      isDemo: false // User created record
    };

    expenses.unshift(newExp);
    this.saveExpenses(expenses);
    return newExp;
  },

  deleteExpense(id) {
    const expenses = this.getExpenses().filter(e => e.id !== id);
    this.saveExpenses(expenses);
  },

  markSaleCompleted(saleId) {
    const sales = this.getSales();
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      sale.status = "Completed";
      this.saveSales(sales);
      return sale;
    }
    return null;
  },

  /**
   * Pure Deterministic Financial Calculation Engine
   * Follows exact accounting formulas:
   * - Revenue = sum of completed sales
   * - COGS = sum of quantity sold * product unit cost at time of sale
   * - Gross profit = revenue minus COGS
   * - Net profit = gross profit minus recorded business expenses (never subtracted twice)
   * - Profit margin = (net profit / revenue) * 100 when revenue > 0
   */
  calculateFinancials(options = {}) {
    const period = options.period || 'all'; // 'all' | 'today' | 'month'
    const origin = options.origin || 'all'; // 'all' | 'actual' | 'demo'
    const dateStr = options.dateStr || new Date().toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);

    const allSales = options.salesList || this.getSales();
    const allExpenses = options.expensesList || this.getExpenses();

    // 1. Filter sales by origin
    let filteredSales = allSales;
    if (origin === 'actual') {
      filteredSales = filteredSales.filter(s => !s.isDemo);
    } else if (origin === 'demo') {
      filteredSales = filteredSales.filter(s => s.isDemo);
    }

    // 2. Filter sales by period
    if (period === 'today') {
      filteredSales = filteredSales.filter(s => s.date && s.date.startsWith(dateStr));
    } else if (period === 'month') {
      filteredSales = filteredSales.filter(s => s.date && s.date.startsWith(monthStr));
    }

    // Completed vs Pending sales
    const completedSales = filteredSales.filter(s => String(s.status || '').toLowerCase() === 'completed');
    const pendingSales = filteredSales.filter(s => String(s.status || '').toLowerCase() === 'pending credit');

    // Revenue = sum of completed sales
    const revenue = completedSales.reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0);

    // COGS = sum of quantity sold * recorded unit cost at time of sale for completed sales
    let cogs = 0;
    completedSales.forEach(s => {
      if (Array.isArray(s.items) && s.items.length > 0) {
        s.items.forEach(item => {
          const q = parseFloat(item.quantity) || 0;
          const c = parseFloat(item.costPrice) || 0;
          cogs += (q * c);
        });
      } else if (s.totalCost) {
        cogs += parseFloat(s.totalCost) || 0;
      }
    });

    // Gross profit = revenue minus cost of goods sold
    const grossProfit = revenue - cogs;
    const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    // Filter expenses by origin
    let filteredExpenses = allExpenses;
    if (origin === 'actual') {
      filteredExpenses = filteredExpenses.filter(e => !e.isDemo);
    } else if (origin === 'demo') {
      filteredExpenses = filteredExpenses.filter(e => e.isDemo);
    }

    // Filter expenses by period
    if (period === 'today') {
      filteredExpenses = filteredExpenses.filter(e => e.date && e.date.startsWith(dateStr));
    } else if (period === 'month') {
      filteredExpenses = filteredExpenses.filter(e => e.date && e.date.startsWith(monthStr));
    }

    // Never subtract the same expense twice: deduplicate by unique id
    const seenExpenseIds = new Set();
    const dedupedExpenses = [];
    for (const exp of filteredExpenses) {
      if (exp && exp.id) {
        if (!seenExpenseIds.has(exp.id)) {
          seenExpenseIds.add(exp.id);
          dedupedExpenses.push(exp);
        }
      } else if (exp) {
        dedupedExpenses.push(exp);
      }
    }

    const totalExpenses = dedupedExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // Net profit = gross profit minus recorded business expenses
    const netProfit = grossProfit - totalExpenses;

    // Profit margin = net profit / revenue * 100 (handles zero revenue without division error)
    const netProfitMarginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Pending credit & Total Gross Bikri (completed + pending)
    const pendingCreditSales = pendingSales.reduce((sum, s) => sum + (parseFloat(s.totalAmount) || 0), 0);
    const totalBikri = revenue + pendingCreditSales;

    return {
      period,
      origin,
      revenue,
      cogs,
      grossProfit,
      grossMarginPct,
      expenses: totalExpenses,
      netProfit,
      netProfitMarginPct,
      completedSalesCount: completedSales.length,
      pendingCreditSales,
      pendingSalesCount: pendingSales.length,
      totalBikri,
      expenseCount: dedupedExpenses.length
    };
  },

  /**
   * Deterministic Unit Profit & Target Price Calculator
   * Handles: Base Cost, Additional Unit Costs, Target Profit Margin
   */
  calculateTargetPrice(baseCost, addlCost = 0, targetMarginPct = 0, quantity = 1) {
    const base = parseFloat(baseCost);
    const addl = parseFloat(addlCost) || 0;
    const margin = parseFloat(targetMarginPct);
    const qty = parseInt(quantity) || 1;

    if (isNaN(base) || base < 0) {
      throw new Error("Base cost cannot be negative.");
    }
    if (isNaN(addl) || addl < 0) {
      throw new Error("Additional unit cost cannot be negative.");
    }
    if (isNaN(margin) || margin < 0 || margin >= 100) {
      throw new Error("Target profit margin must be between 0% and 99.9%.");
    }
    if (qty <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    const totalUnitCost = base + addl;
    // Selling price = Total Cost / (1 - Margin/100)
    const requiredSellingPrice = margin === 0 ? totalUnitCost : totalUnitCost / (1 - (margin / 100));
    const unitGrossProfit = requiredSellingPrice - totalUnitCost;
    const markupPct = totalUnitCost > 0 ? (unitGrossProfit / totalUnitCost) * 100 : 0;

    const totalRevenue = requiredSellingPrice * qty;
    const totalCOGS = totalUnitCost * qty;
    const totalGrossProfit = unitGrossProfit * qty;

    return {
      baseCost: base,
      addlCost: addl,
      totalUnitCost,
      targetMarginPct: margin,
      requiredSellingPrice,
      unitGrossProfit,
      markupPct,
      quantity: qty,
      totalRevenue,
      totalCOGS,
      totalGrossProfit
    };
  },

  getCustomers() {
    return safeGetArray(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS, (c) => {
      if (!c || typeof c !== 'object') return null;
      return {
        id: String(c.id || 'CUST-' + Math.random().toString().slice(2, 6)),
        name: String(c.name || 'Customer'),
        phone: String(c.phone || ''),
        address: String(c.address || 'Local'),
        totalCredit: Math.max(0, parseFloat(c.totalCredit) || 0),
        lastTransactionDate: String(c.lastTransactionDate || new Date().toISOString().split('T')[0]),
        isDemo: Boolean(c.isDemo)
      };
    });
  },

  saveCustomers(customers) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  },

  addCustomerCredit(name, phone, amount) {
    const customers = this.getCustomers();
    let cust = customers.find(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (cust) {
      cust.totalCredit = (parseFloat(cust.totalCredit) || 0) + parseFloat(amount);
      if (phone) cust.phone = phone;
      cust.lastTransactionDate = new Date().toISOString().split('T')[0];
    } else {
      cust = {
        id: "CUST-" + (customers.length + 1),
        name: name.trim(),
        phone: phone || "",
        address: "Local customer",
        totalCredit: parseFloat(amount) || 0,
        lastTransactionDate: new Date().toISOString().split('T')[0],
        isDemo: false
      };
      customers.push(cust);
    }
    this.saveCustomers(customers);
  },

  settleCustomerCredit(customerId, settledAmount) {
    const customers = this.getCustomers();
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      const amt = parseFloat(settledAmount) || 0;
      cust.totalCredit = Math.max(0, (parseFloat(cust.totalCredit) || 0) - amt);
      cust.lastTransactionDate = new Date().toISOString().split('T')[0];
      this.saveCustomers(customers);
      return cust;
    }
    return null;
  },

  // Reset entire application to initial realistic grocery dataset
  resetToDefault() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(DEFAULT_SALES));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
      localStorage.removeItem(STORAGE_KEYS.AI_CHAT);
    }
  },

  // Derive dashboard counts, sales totals, expenses, and stock alerts from live data
  getMetrics(options = {}) {
    const origin = options.origin || 'all'; // 'all' | 'actual' | 'demo'
    const period = options.period || 'today'; // 'today' | 'month' | 'all'

    const products = this.getProducts();
    const sales = this.getSales();
    const expenses = this.getExpenses();
    const customers = this.getCustomers();

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    // Calculate deterministic financials for the requested view
    const currentFinancials = this.calculateFinancials({ period, origin, salesList: sales, expensesList: expenses });

    // Calculate deterministic financials across standard periods for reference
    const todayFinancials = this.calculateFinancials({ period: 'today', origin, salesList: sales, expensesList: expenses });
    const monthFinancials = this.calculateFinancials({ period: 'month', origin, salesList: sales, expensesList: expenses });
    const allTimeFinancials = this.calculateFinancials({ period: 'all', origin, salesList: sales, expensesList: expenses });

    // Breakdowns by Origin for labelling demo vs actual figures
    const actualFinancials = this.calculateFinancials({ period, origin: 'actual', salesList: sales, expensesList: expenses });
    const demoFinancials = this.calculateFinancials({ period, origin: 'demo', salesList: sales, expensesList: expenses });

    // Filtered sales for payment mode breakdown
    let periodSales = sales;
    if (origin === 'actual') periodSales = periodSales.filter(s => !s.isDemo);
    else if (origin === 'demo') periodSales = periodSales.filter(s => s.isDemo);

    const todaySalesList = periodSales.filter(s => s.date && s.date.startsWith(todayStr));
    const todayCash = todaySalesList.filter(s => s.paymentMode === 'Cash').reduce((acc, s) => acc + (parseFloat(s.totalAmount) || 0), 0);
    const todayUPI = todaySalesList.filter(s => s.paymentMode === 'UPI').reduce((acc, s) => acc + (parseFloat(s.totalAmount) || 0), 0);
    const todayUdhar = todaySalesList.filter(s => s.paymentMode === 'Udhar').reduce((acc, s) => acc + (parseFloat(s.totalAmount) || 0), 0);

    // Inventory counts & valuations
    let totalStockItems = 0;
    let inventoryCostValue = 0;
    let inventoryRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    let filteredProducts = products;
    if (origin === 'actual') filteredProducts = filteredProducts.filter(p => !p.isDemo);
    else if (origin === 'demo') filteredProducts = filteredProducts.filter(p => p.isDemo);

    filteredProducts.forEach(p => {
      const stock = p.stock || 0;
      totalStockItems += stock;
      inventoryCostValue += (stock * p.costPrice);
      inventoryRetailValue += (stock * p.sellingPrice);
      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= p.minStock) {
        lowStockCount++;
      }
    });

    // Total Udhar Pending
    let filteredCustomers = customers;
    if (origin === 'actual') filteredCustomers = filteredCustomers.filter(c => !c.isDemo);
    else if (origin === 'demo') filteredCustomers = filteredCustomers.filter(c => c.isDemo);

    const totalUdhar = filteredCustomers.reduce((acc, c) => acc + (parseFloat(c.totalCredit) || 0), 0);

    return {
      // Selected period & origin metrics
      period,
      origin,
      revenue: currentFinancials.revenue,
      cogs: currentFinancials.cogs,
      grossProfit: currentFinancials.grossProfit,
      grossMarginPct: currentFinancials.grossMarginPct,
      expenses: currentFinancials.expenses,
      netProfit: currentFinancials.netProfit,
      netProfitMarginPct: currentFinancials.netProfitMarginPct,
      completedSalesCount: currentFinancials.completedSalesCount,
      pendingCreditSales: currentFinancials.pendingCreditSales,
      pendingSalesCount: currentFinancials.pendingSalesCount,
      totalBikri: currentFinancials.totalBikri,
      expenseCount: currentFinancials.expenseCount,

      // Origin breakdowns for explicit labeling
      actual: actualFinancials,
      demo: demoFinancials,

      // Financials objects
      financials: currentFinancials,
      todayFinancials,
      monthFinancials,
      allTimeFinancials,

      // Backwards-compatible properties
      totalProductsCount: products.length,
      userProductsCount: products.filter(p => !p.isDemo).length,
      demoProductsCount: products.filter(p => p.isDemo).length,
      totalSalesAllTime: allTimeFinancials.revenue,
      totalExpensesAllTime: allTimeFinancials.expenses,
      todaySales: todaySalesList.reduce((acc, s) => acc + (parseFloat(s.totalAmount) || 0), 0),
      todayProfit: todayFinancials.grossProfit,
      todayCash,
      todayUPI,
      todayUdhar,
      todayCount: todaySalesList.length,
      monthSales: monthFinancials.revenue,
      monthGrossProfit: monthFinancials.grossProfit,
      monthExpenses: monthFinancials.expenses,
      monthNetProfit: monthFinancials.netProfit,
      totalStockItems,
      inventoryCostValue,
      inventoryRetailValue,
      potentialInventoryProfit: inventoryRetailValue - inventoryCostValue,
      lowStockCount,
      outOfStockCount,
      totalUdhar,
      pendingUdharCustomersCount: filteredCustomers.filter(c => c.totalCredit > 0).length
    };
  },

  /**
   * Top-selling products based on completed sale quantities
   * Strict consistency with transaction snapshots and profit formulas
   */
  getTopSellingProducts(limit = 5) {
    const sales = this.getSales();
    const completedSales = sales.filter(s => String(s.status || '').toLowerCase() === 'completed');
    if (completedSales.length === 0) return [];

    const products = this.getProducts();
    const catalogMap = {};
    products.forEach(p => { catalogMap[p.id] = p; });

    const stats = {};
    completedSales.forEach(s => {
      if (Array.isArray(s.items)) {
        s.items.forEach(item => {
          const pid = item.productId || item.name;
          if (!stats[pid]) {
            const catProd = catalogMap[pid];
            const cat = catProd ? catProd.category : (item.category || 'General Items');
            const unit = catProd ? catProd.unit : (item.unit || 'Units');
            stats[pid] = {
              productId: pid,
              name: item.name,
              category: cat,
              unit: unit,
              unitsSold: 0,
              totalRevenue: 0,
              totalCOGS: 0,
              grossProfit: 0,
              invoiceCount: 0,
              unitPrice: parseFloat(item.price) || 0
            };
          }
          const q = parseInt(item.quantity) || parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const cost = parseFloat(item.costPrice !== undefined ? item.costPrice : (item.cost || 0));
          const subtotal = parseFloat(item.subtotal !== undefined ? item.subtotal : (price * q));
          const cogs = cost * q;

          stats[pid].unitsSold += q;
          stats[pid].totalRevenue += subtotal;
          stats[pid].totalCOGS += cogs;
          stats[pid].grossProfit += (subtotal - cogs);
          stats[pid].invoiceCount += 1;
        });
      }
    });

    const ranked = Object.values(stats).sort((a, b) => b.unitsSold - a.unitsSold || b.totalRevenue - a.totalRevenue);
    return limit ? ranked.slice(0, limit) : ranked;
  },

  /**
   * Daily Revenue & Expense trend grouped by date from actual saved records
   * Does NOT invent dates or fake data.
   */
  getDailyFinancialTrend() {
    const sales = this.getSales();
    const expenses = this.getExpenses();

    const completedSales = sales.filter(s => String(s.status || '').toLowerCase() === 'completed');

    // Deduplicate expenses to prevent double-counting
    const seenExp = new Set();
    const dedupedExpenses = [];
    expenses.forEach(e => {
      if (e && e.id && !seenExp.has(e.id)) {
        seenExp.add(e.id);
        dedupedExpenses.push(e);
      }
    });

    // Check if any dated transactions exist
    if (completedSales.length === 0 && dedupedExpenses.length === 0) {
      return {
        hasSufficientData: false,
        totalDates: 0,
        dates: [],
        days: []
      };
    }

    // Collect all unique transaction dates from real records
    const dateMap = {};

    completedSales.forEach(s => {
      if (s.date) {
        const dStr = s.date.split('T')[0];
        if (!dateMap[dStr]) {
          dateMap[dStr] = { date: dStr, revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0, salesCount: 0, expenseCount: 0 };
        }
        dateMap[dStr].revenue += (parseFloat(s.totalAmount) || 0);
        dateMap[dStr].cogs += (parseFloat(s.totalCost) || 0);
        dateMap[dStr].grossProfit += (parseFloat(s.grossProfit) || 0);
        dateMap[dStr].salesCount += 1;
      }
    });

    dedupedExpenses.forEach(e => {
      if (e.date) {
        const dStr = e.date.split('T')[0];
        if (!dateMap[dStr]) {
          dateMap[dStr] = { date: dStr, revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0, salesCount: 0, expenseCount: 0 };
        }
        dateMap[dStr].expenses += (parseFloat(e.amount) || 0);
        dateMap[dStr].expenseCount += 1;
      }
    });

    const sortedDates = Object.keys(dateMap).sort();
    if (sortedDates.length === 0) {
      return {
        hasSufficientData: false,
        totalDates: 0,
        dates: [],
        days: []
      };
    }

    // Format daily data points
    const days = sortedDates.map(dStr => {
      const entry = dateMap[dStr];
      entry.netProfit = entry.grossProfit - entry.expenses;

      let label = dStr;
      try {
        const parts = dStr.split('-');
        if (parts.length === 3) {
          const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          label = dObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
      } catch (err) {}

      return {
        date: dStr,
        label,
        revenue: Math.round(entry.revenue * 100) / 100,
        cogs: Math.round(entry.cogs * 100) / 100,
        grossProfit: Math.round(entry.grossProfit * 100) / 100,
        expenses: Math.round(entry.expenses * 100) / 100,
        netProfit: Math.round(entry.netProfit * 100) / 100,
        salesCount: entry.salesCount,
        expenseCount: entry.expenseCount
      };
    });

    return {
      hasSufficientData: days.length > 0,
      totalDates: days.length,
      dates: sortedDates,
      days
    };
  },

  /**
   * Generates exactly 3 concise business recommendations based on real store data
   * Each recommendation includes a clear explanation with actual figures (e.g. low stock, frequent sales, heavy expense categories).
   */
  getBusinessRecommendations() {
    const products = this.getProducts();
    const lowStock = products.filter(p => p.stock <= p.minStock);
    const topSellers = this.getTopSellingProducts(5);
    const expenses = this.getExpenses();
    const customers = this.getCustomers();
    const debtors = customers.filter(c => c.totalCredit > 0);
    const totalUdhar = debtors.reduce((s, c) => s + (parseFloat(c.totalCredit) || 0), 0);

    const recommendations = [];

    // --- Recommendation 1: Inventory & Low-Stock Alerts ---
    if (products.length === 0) {
      recommendations.push({
        id: 'rec-inventory-empty',
        category: '📦 Inventory Setup',
        type: 'info',
        title: 'Add Initial Products to Your Catalog',
        action: 'Add your grocery staples (Atta, Dal, Oil, Spices) with cost price, selling price, and minimum stock threshold to activate automatic stock monitoring.',
        explanation: 'Your catalog currently has 0 products recorded. Setting up inventory enables low-stock warnings, inventory valuation, and margin tracking.'
      });
    } else if (lowStock.length > 0) {
      const topLow = [...lowStock].sort((a, b) => (b.minStock - b.stock) - (a.minStock - a.stock))[0];
      const outOfStockCount = lowStock.filter(p => p.stock === 0).length;
      const deficit = Math.max(0, topLow.minStock - topLow.stock);

      recommendations.push({
        id: 'rec-inventory-low-stock',
        category: '📦 Inventory Alert',
        type: 'warning',
        title: `Restock ${topLow.name} & ${lowStock.length - 1 > 0 ? (lowStock.length - 1) + ' Other Items' : 'Replenish Safety Stock'}`,
        action: `Generate a wholesaler order for ${Math.max(deficit * 2, 5)} ${topLow.unit} of ${topLow.name} and review your ${lowStock.length} low-stock items.`,
        explanation: `Stock for ${topLow.name} is down to ${topLow.stock} ${topLow.unit} (Alert threshold: ${topLow.minStock} ${topLow.unit}, deficit of ${deficit} ${topLow.unit}). ${outOfStockCount > 0 ? outOfStockCount + ' item(s) are completely out of stock.' : ''} Low inventory on staple goods leads to lost customer sales and walkaways.`
      });
    } else {
      recommendations.push({
        id: 'rec-inventory-healthy',
        category: '📦 Inventory Health',
        type: 'success',
        title: 'All Inventory Levels are Healthy',
        action: 'Maintain regular weekly counts of high-turnover staples (cooking oil, wheat flour, loose sugar).',
        explanation: `All ${products.length} products currently meet or exceed their configured minimum alert levels. No emergency reorder capital is required today.`
      });
    }

    // --- Recommendation 2: Sales & High-Velocity Products ---
    if (topSellers.length > 0) {
      const topItem = topSellers[0];
      const marginPct = topItem.totalRevenue > 0 ? ((topItem.grossProfit / topItem.totalRevenue) * 100).toFixed(1) : '0';

      recommendations.push({
        id: 'rec-sales-topseller',
        category: '🏆 Sales & Merchandising',
        type: 'success',
        title: `Prioritize Front-Shelf Placement for ${topItem.name}`,
        action: `Ensure ${topItem.name} has prominent shelf visibility near the front entrance or checkout counter.`,
        explanation: `${topItem.name} is your highest-velocity product with ${topItem.unitsSold} ${topItem.unit} sold generating ₹${topItem.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} in completed revenue (${marginPct}% gross margin). Fast-moving items drive store footfall.`
      });
    } else {
      recommendations.push({
        id: 'rec-sales-empty',
        category: '🏆 Sales Kickstart',
        type: 'info',
        title: 'Record Completed Sales at Your Counter',
        action: 'Use the Sales POS billing counter to record customer sales via Cash, UPI, or Udhar.',
        explanation: 'No completed sales have been recorded yet. Recording transactions automatically updates stock deductions, revenue metrics, and identifies your most profitable goods.'
      });
    }

    // --- Recommendation 3: Operating Expenses, Cash Flow, or Customer Credit ---
    if (totalUdhar > 0 && debtors.length > 0) {
      const topDebtor = [...debtors].sort((a, b) => b.totalCredit - a.totalCredit)[0];
      recommendations.push({
        id: 'rec-udhar-recovery',
        category: '🤝 Cash Flow & Udhar',
        type: 'warning',
        title: `Collect Pending Customer Credit (Total: ₹${totalUdhar.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
        action: `Send a polite WhatsApp reminder with your store's UPI QR standee to ${topDebtor.name} (pending: ₹${topDebtor.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).`,
        explanation: `${debtors.length} customers have outstanding credit balances. Recovering pending Udhar directly unlocks working capital for upcoming wholesale purchases without borrowing.`
      });
    } else if (expenses.length > 0) {
      const catTotals = {};
      expenses.forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + (parseFloat(e.amount) || 0);
      });
      const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
      const totalExp = Object.values(catTotals).reduce((s, v) => s + v, 0);
      const catPct = totalExp > 0 ? ((topCat[1] / totalExp) * 100).toFixed(1) : '0';

      recommendations.push({
        id: 'rec-expense-control',
        category: '📉 Expense Management',
        type: 'info',
        title: `Optimize ${topCat[0]} Outlays (₹${topCat[1].toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
        action: `Audit variable operating charges in ${topCat[0]} to preserve net profit margin.`,
        explanation: `${topCat[0]} represents ${catPct}% of all recorded store expenses (₹${topCat[1].toLocaleString('en-IN', { minimumFractionDigits: 2 })} out of ₹${totalExp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}). Controlling monthly fixed costs directly increases your net take-home profit.`
      });
    } else {
      recommendations.push({
        id: 'rec-expense-empty',
        category: '📉 Expense Tracking',
        type: 'info',
        title: 'Track Daily Store Expenses',
        action: 'Log daily utility bills, shop rent, tempo cartage, and packaging expenses in the Expenses tab.',
        explanation: 'No operating expenses have been logged yet. Recording expenses gives you an accurate net profit calculation (Gross Profit minus Expenses).'
      });
    }

    return recommendations;
  }
};

// Safe initialization: Only initialize if products key is absent
(function initStorage() {
  if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    VyaparStore.resetToDefault();
  }
})();

if (typeof window !== 'undefined') {
  window.VyaparStore = VyaparStore;
}
if (typeof global !== 'undefined') {
  global.VyaparStore = VyaparStore;
}
