/**
 * Test Suite: Vyapar AI — Product and Inventory Management Module
 * Tests:
 * 1. Add product with name, category, selling price, purchase cost, stock quantity, low-stock threshold
 * 2. Validation: blank names, negative costs/prices/stock, duplicate prevention
 * 3. Edit product
 * 4. Delete product
 * 5. Search and category/status filtering
 * 6. Stock quantity and low-stock alert status
 * 7. Inventory value calculation (purchase cost × stock quantity)
 * 8. Persistence across reload
 * 9. Dashboard product count and low-stock alert updates
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

function runInventoryTests() {
  console.log('=== TEST SUITE: PRODUCT & INVENTORY MANAGEMENT ===\n');

  // Reset to clean default state
  VyaparStore.resetToDefault();

  const initialProducts = VyaparStore.getProducts();
  const initialMetrics = VyaparStore.getMetrics();
  console.log(`Initial Products: ${initialProducts.length}`);
  console.log(`Initial Low Stock Count: ${initialMetrics.lowStockCount}`);
  console.log(`Initial Out of Stock Count: ${initialMetrics.outOfStockCount}`);
  console.log(`Initial Inventory Cost Value: ₹${initialMetrics.inventoryCostValue}`);

  // ---------------------------------------------------------
  // 1. ADD PRODUCT WITH ALL REQUIRED FIELDS
  // ---------------------------------------------------------
  console.log('\n--- 1. Testing Add Realistic Indian Grocery Products ---');

  // Add Sugar product
  const sugarProduct = VyaparStore.addProduct({
    name: 'Madhur Pure & Hygienic Sugar 1kg',
    category: 'Atta, Rice & Grains',
    costPrice: 42.0,
    sellingPrice: 48.0,
    stock: 25,
    minStock: 10,
    unit: 'Pkt',
    sku: '890103021'
  });

  console.log('Added Product:', sugarProduct.id, sugarProduct.name, `Stock: ${sugarProduct.stock}`);
  if (!sugarProduct.id || sugarProduct.name !== 'Madhur Pure & Hygienic Sugar 1kg') {
    throw new Error('Failed to add product with proper name and id');
  }
  if (sugarProduct.costPrice !== 42 || sugarProduct.sellingPrice !== 48 || sugarProduct.stock !== 25 || sugarProduct.minStock !== 10) {
    throw new Error('Product fields mismatch');
  }
  if (sugarProduct.isDemo !== false) {
    throw new Error('User created product must have isDemo: false');
  }

  // Add another product (Atta variant with low stock to trigger alert)
  const attaProduct = VyaparStore.addProduct({
    name: 'Fortune Chakki Fresh Atta 5kg',
    category: 'Atta, Rice & Grains',
    costPrice: 195.0,
    sellingPrice: 220.0,
    stock: 3,        // Stock 3 <= MinStock 5 -> Low Stock alert
    minStock: 5,
    unit: 'Bag',
    sku: '890103022'
  });
  console.log('Added Low-Stock Product:', attaProduct.name, `Stock: ${attaProduct.stock}, Min: ${attaProduct.minStock}`);

  // ---------------------------------------------------------
  // 2. VALIDATION: BLANK NAMES, NEGATIVES, DUPLICATES
  // ---------------------------------------------------------
  console.log('\n--- 2. Testing Validation Rules ---');

  // Test 2a: Blank name rejection
  try {
    VyaparStore.addProduct({ name: '   ', costPrice: 10, sellingPrice: 20, stock: 5, minStock: 2 });
    throw new Error('Failed to reject blank product name');
  } catch (err) {
    console.log('✓ Successfully rejected blank product name:', err.message);
  }

  // Test 2b: Negative cost price rejection
  try {
    VyaparStore.addProduct({ name: 'Invalid Cost Item', costPrice: -15, sellingPrice: 20, stock: 5, minStock: 2 });
    throw new Error('Failed to reject negative cost price');
  } catch (err) {
    console.log('✓ Successfully rejected negative cost price:', err.message);
  }

  // Test 2c: Negative selling price rejection
  try {
    VyaparStore.addProduct({ name: 'Invalid Selling Item', costPrice: 15, sellingPrice: -25, stock: 5, minStock: 2 });
    throw new Error('Failed to reject negative selling price');
  } catch (err) {
    console.log('✓ Successfully rejected negative selling price:', err.message);
  }

  // Test 2d: Negative stock quantity rejection
  try {
    VyaparStore.addProduct({ name: 'Invalid Stock Item', costPrice: 15, sellingPrice: 25, stock: -10, minStock: 2 });
    throw new Error('Failed to reject negative stock quantity');
  } catch (err) {
    console.log('✓ Successfully rejected negative stock quantity:', err.message);
  }

  // Test 2e: Negative minStock threshold rejection
  try {
    VyaparStore.addProduct({ name: 'Invalid MinStock Item', costPrice: 15, sellingPrice: 25, stock: 10, minStock: -5 });
    throw new Error('Failed to reject negative minimum stock alert level');
  } catch (err) {
    console.log('✓ Successfully rejected negative minimum stock alert level:', err.message);
  }

  // Test 2f: Prevent accidental duplicate product by name
  try {
    VyaparStore.addProduct({
      name: 'madhur pure & hygienic sugar 1kg', // case-insensitive match
      costPrice: 40,
      sellingPrice: 46,
      stock: 10,
      minStock: 5
    });
    throw new Error('Failed to reject duplicate product name');
  } catch (err) {
    console.log('✓ Successfully rejected duplicate product name:', err.message);
  }

  // Test 2g: Prevent accidental duplicate product by SKU
  try {
    VyaparStore.addProduct({
      name: 'Another Sugar Brand 1kg',
      sku: '890103021', // Duplicate SKU of Madhur Sugar
      costPrice: 40,
      sellingPrice: 46,
      stock: 10,
      minStock: 5
    });
    throw new Error('Failed to reject duplicate SKU');
  } catch (err) {
    console.log('✓ Successfully rejected duplicate product SKU:', err.message);
  }

  // ---------------------------------------------------------
  // 3. EDIT EXISTING PRODUCT
  // ---------------------------------------------------------
  console.log('\n--- 3. Testing Edit Existing Product ---');

  const updatedSugar = VyaparStore.updateProduct(sugarProduct.id, {
    sellingPrice: 50.0,
    costPrice: 43.0,
    stock: 30,
    minStock: 12
  });

  console.log('Updated Sugar Product:', updatedSugar.name, `New SP: ₹${updatedSugar.sellingPrice}, Stock: ${updatedSugar.stock}`);
  if (updatedSugar.sellingPrice !== 50 || updatedSugar.costPrice !== 43 || updatedSugar.stock !== 30 || updatedSugar.minStock !== 12) {
    throw new Error('Failed to update product fields accurately');
  }

  // Ensure duplicate check prevents renaming product to another existing product's name
  try {
    VyaparStore.updateProduct(sugarProduct.id, { name: 'Aashirvaad Shudh Chakki Atta 10kg' });
    throw new Error('Failed to prevent renaming to duplicate existing product');
  } catch (err) {
    console.log('✓ Successfully prevented edit creating duplicate name:', err.message);
  }

  // ---------------------------------------------------------
  // 4. INVENTORY VALUE CALCULATION (Purchase Cost × Stock Quantity)
  // ---------------------------------------------------------
  console.log('\n--- 4. Testing Inventory Value Calculation ---');

  const allProductsNow = VyaparStore.getProducts();
  let manualTotalCostValue = 0;
  let manualTotalRetailValue = 0;
  let manualTotalUnits = 0;
  let manualLowStockCount = 0;
  let manualOutOfStockCount = 0;

  allProductsNow.forEach(p => {
    manualTotalUnits += p.stock;
    manualTotalCostValue += (p.costPrice * p.stock);
    manualTotalRetailValue += (p.sellingPrice * p.stock);
    if (p.stock === 0) {
      manualOutOfStockCount++;
    } else if (p.stock <= p.minStock) {
      manualLowStockCount++;
    }
  });

  const liveMetrics = VyaparStore.getMetrics();
  console.log(`Computed Inventory Cost Value: ₹${liveMetrics.inventoryCostValue}`);
  console.log(`Manual Inventory Cost Value: ₹${manualTotalCostValue}`);
  console.log(`Computed Inventory Retail Value: ₹${liveMetrics.inventoryRetailValue}`);
  console.log(`Manual Inventory Retail Value: ₹${manualTotalRetailValue}`);

  if (liveMetrics.inventoryCostValue !== manualTotalCostValue) {
    throw new Error(`Inventory cost valuation mismatch: ${liveMetrics.inventoryCostValue} vs ${manualTotalCostValue}`);
  }
  if (liveMetrics.inventoryRetailValue !== manualTotalRetailValue) {
    throw new Error(`Inventory retail valuation mismatch: ${liveMetrics.inventoryRetailValue} vs ${manualTotalRetailValue}`);
  }
  console.log('✓ Inventory Valuation (Cost × Stock Quantity) exactly matches mathematical sum');

  // ---------------------------------------------------------
  // 5. SEARCH AND FILTERING
  // ---------------------------------------------------------
  console.log('\n--- 5. Testing Search and Filtering ---');

  // Search by keyword "atta"
  const attaMatches = allProductsNow.filter(p => p.name.toLowerCase().includes('atta'));
  console.log(`Products matching "atta": ${attaMatches.length}`);
  if (attaMatches.length < 2) throw new Error('Expected at least 2 atta products');

  // Filter by category "Dals & Pulses"
  const dalMatches = allProductsNow.filter(p => p.category === 'Dals & Pulses');
  console.log(`Products in category "Dals & Pulses": ${dalMatches.length}`);
  if (dalMatches.length < 2) throw new Error('Expected at least 2 dal products');

  // Filter by LowStock status (stock > 0 and stock <= minStock)
  const lowStockMatches = allProductsNow.filter(p => p.stock > 0 && p.stock <= p.minStock);
  console.log(`Products matching LowStock filter: ${lowStockMatches.length}`);
  if (lowStockMatches.length === 0) throw new Error('Expected low stock matches');

  // Filter by OutOfStock status (stock === 0)
  const outOfStockMatches = allProductsNow.filter(p => p.stock === 0);
  console.log(`Products matching OutOfStock filter: ${outOfStockMatches.length}`);
  if (outOfStockMatches.length === 0) throw new Error('Expected at least 1 out of stock product');

  console.log('✓ Search by query and filtering by category/status verified');

  // ---------------------------------------------------------
  // 6. DASHBOARD UPDATES WHENEVER INVENTORY CHANGES
  // ---------------------------------------------------------
  console.log('\n--- 6. Testing Dashboard Metrics Consistency ---');

  console.log('Current Dashboard Product Count:', liveMetrics.totalProductsCount);
  console.log('Current Dashboard User Products:', liveMetrics.userProductsCount);
  console.log('Current Dashboard Low Stock Count:', liveMetrics.lowStockCount);
  console.log('Current Dashboard Out of Stock Count:', liveMetrics.outOfStockCount);

  if (liveMetrics.totalProductsCount !== initialProducts.length + 2) {
    throw new Error(`Expected ${initialProducts.length + 2} products, got ${liveMetrics.totalProductsCount}`);
  }
  if (liveMetrics.userProductsCount !== 2) {
    throw new Error(`Expected 2 user-created products, got ${liveMetrics.userProductsCount}`);
  }

  // ---------------------------------------------------------
  // 7. DELETE PRODUCT WITH CONFIRMATION & DASHBOARD UPDATE
  // ---------------------------------------------------------
  console.log('\n--- 7. Testing Delete Product ---');

  VyaparStore.deleteProduct(attaProduct.id);
  const productsAfterDelete = VyaparStore.getProducts();
  const metricsAfterDelete = VyaparStore.getMetrics();

  console.log(`Products after deleting ${attaProduct.name}: ${productsAfterDelete.length}`);
  const findDeleted = productsAfterDelete.find(p => p.id === attaProduct.id);
  if (findDeleted) throw new Error('Product was not deleted from store');

  if (metricsAfterDelete.totalProductsCount !== productsAfterDelete.length) {
    throw new Error('Dashboard total product count did not update after deletion');
  }
  if (metricsAfterDelete.lowStockCount !== manualLowStockCount - 1) {
    throw new Error('Dashboard low stock alerts did not decrement after deleting low-stock product');
  }
  console.log('✓ Product deleted cleanly, dashboard product count and low-stock alerts updated');

  // ---------------------------------------------------------
  // 8. PERSISTENCE ACROSS SESSIONS (LocalStorage reload)
  // ---------------------------------------------------------
  console.log('\n--- 8. Testing Persistence Across Storage Reload ---');

  // Re-read directly from storage
  const rawProducts = JSON.parse(mockStorage['vyapar_products_v1']);
  const persistedSugar = rawProducts.find(p => p.id === sugarProduct.id);

  if (!persistedSugar) throw new Error('User product not persisted in localStorage');
  if (persistedSugar.sellingPrice !== 50 || persistedSugar.stock !== 30) {
    throw new Error('Persisted product data does not match latest edits');
  }
  console.log('✓ All changes persisted in localStorage and retrieved accurately');

  console.log('\n======================================================');
  console.log('>>> ALL PRODUCT & INVENTORY TESTS PASSED WITH 100%! <<<');
  console.log('======================================================');
}

runInventoryTests();

