// lib/factories/verify-seed-data.ts
// Simple verification script for seed data generator

import { generateSeedData } from './seedData';

console.log('🌱 Generating seed data...\n');

const seedData = generateSeedData();

// Verify counts
console.log('✅ Entity Counts:');
console.log(`   Clients: ${seedData.clients.length} (expected: 20)`);
console.log(`   Fournisseurs: ${seedData.fournisseurs.length} (expected: 10)`);
console.log(`   Marketistes: ${seedData.marketistes.length} (expected: 5)`);
console.log(`   Products: ${seedData.products.length} (expected: 50)`);
console.log(`   Orders: ${seedData.orders.length} (expected: 100)`);
console.log(`   Marketing Codes: ${seedData.marketingCodes.length} (expected: 20)`);
console.log(`   Reviews: ${seedData.reviews.length} (expected: >0)`);

// Verify approval statuses
console.log('\n✅ Approval Status Distribution:');
const approvedFournisseurs = seedData.fournisseurs.filter(f => f.approvalStatus === 'approved').length;
const pendingFournisseurs = seedData.fournisseurs.filter(f => f.approvalStatus === 'pending').length;
const rejectedFournisseurs = seedData.fournisseurs.filter(f => f.approvalStatus === 'rejected').length;
console.log(`   Fournisseurs - Approved: ${approvedFournisseurs}, Pending: ${pendingFournisseurs}, Rejected: ${rejectedFournisseurs}`);

const approvedMarketistes = seedData.marketistes.filter(m => m.approvalStatus === 'approved').length;
const pendingMarketistes = seedData.marketistes.filter(m => m.approvalStatus === 'pending').length;
const rejectedMarketistes = seedData.marketistes.filter(m => m.approvalStatus === 'rejected').length;
console.log(`   Marketistes - Approved: ${approvedMarketistes}, Pending: ${pendingMarketistes}, Rejected: ${rejectedMarketistes}`);

// Verify relationships
console.log('\n✅ Data Relationships:');

// Check products are linked to approved fournisseurs
const approvedFournisseurIds = new Set(
  seedData.fournisseurs.filter(f => f.approvalStatus === 'approved').map(f => f.id)
);
const invalidProducts = seedData.products.filter(p => !approvedFournisseurIds.has(p.fournisseurId));
console.log(`   Products linked to approved fournisseurs: ${invalidProducts.length === 0 ? '✓' : '✗ FAILED'}`);

// Check marketing codes are linked to approved marketistes
const approvedMarketisteIds = new Set(
  seedData.marketistes.filter(m => m.approvalStatus === 'approved').map(m => m.id)
);
const invalidCodes = seedData.marketingCodes.filter(c => !approvedMarketisteIds.has(c.marketisteId));
console.log(`   Marketing codes linked to approved marketistes: ${invalidCodes.length === 0 ? '✓' : '✗ FAILED'}`);

// Check orders reference valid entities
const clientIds = new Set(seedData.clients.map(c => c.id));
const productIds = new Set(seedData.products.map(p => p.id));
const invalidOrders = seedData.orders.filter(o => 
  !clientIds.has(o.clientId) || 
  !approvedFournisseurIds.has(o.fournisseurId) ||
  o.products.some(p => !productIds.has(p.productId))
);
console.log(`   Orders have valid references: ${invalidOrders.length === 0 ? '✓' : '✗ FAILED'}`);

// Check reviews are for delivered orders
const deliveredOrderIds = new Set(
  seedData.orders.filter(o => o.status === 'delivered').map(o => o.id)
);
const invalidReviews = seedData.reviews.filter(r => !deliveredOrderIds.has(r.orderId));
console.log(`   Reviews are for delivered orders: ${invalidReviews.length === 0 ? '✓' : '✗ FAILED'}`);

// Verify order calculations
console.log('\n✅ Order Calculations:');
let calculationErrors = 0;
seedData.orders.forEach(order => {
  const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const expectedPlatformFee = subtotal * 0.05;
  const expectedTotal = order.subtotal + order.platformFee + order.shippingFee;
  
  // Allow for small floating-point precision errors (0.02 tolerance)
  if (Math.abs(order.subtotal - subtotal) > 0.02) calculationErrors++;
  if (Math.abs(order.platformFee - expectedPlatformFee) > 0.02) calculationErrors++;
  if (Math.abs(order.total - expectedTotal) > 0.02) calculationErrors++;
});
console.log(`   Order totals calculated correctly: ${calculationErrors === 0 ? '✓' : '✗ FAILED (' + calculationErrors + ' errors - may be due to rounding)'}`);

// Order status distribution
console.log('\n✅ Order Status Distribution:');
const statusCounts = {
  pending: seedData.orders.filter(o => o.status === 'pending').length,
  paid: seedData.orders.filter(o => o.status === 'paid').length,
  processing: seedData.orders.filter(o => o.status === 'processing').length,
  shipped: seedData.orders.filter(o => o.status === 'shipped').length,
  delivered: seedData.orders.filter(o => o.status === 'delivered').length,
  cancelled: seedData.orders.filter(o => o.status === 'cancelled').length,
  refunded: seedData.orders.filter(o => o.status === 'refunded').length
};
Object.entries(statusCounts).forEach(([status, count]) => {
  console.log(`   ${status}: ${count}`);
});

// Orders with marketing codes
const ordersWithCodes = seedData.orders.filter(o => o.marketingCode).length;
console.log(`\n✅ Orders with marketing codes: ${ordersWithCodes} (${Math.round(ordersWithCodes / seedData.orders.length * 100)}%)`);

// Sample data
console.log('\n📊 Sample Data:');
console.log('\nSample Client:');
console.log(`   Name: ${seedData.clients[0].displayName}`);
console.log(`   Email: ${seedData.clients[0].email}`);
console.log(`   Addresses: ${seedData.clients[0].addresses?.length || 0}`);

console.log('\nSample Fournisseur:');
const sampleFournisseur = seedData.fournisseurs[0];
console.log(`   Shop: ${sampleFournisseur.shopName}`);
console.log(`   Status: ${sampleFournisseur.approvalStatus}`);
console.log(`   Rating: ${sampleFournisseur.rating}`);

console.log('\nSample Product:');
const sampleProduct = seedData.products[0];
console.log(`   Name: ${sampleProduct.name}`);
console.log(`   Price Tiers: ${sampleProduct.prices.length}`);
console.log(`   Stock: ${sampleProduct.stock}`);

console.log('\nSample Order:');
const sampleOrder = seedData.orders[0];
console.log(`   Order Number: ${sampleOrder.orderNumber}`);
console.log(`   Status: ${sampleOrder.status}`);
console.log(`   Products: ${sampleOrder.products.length}`);
console.log(`   Total: ${sampleOrder.total} ${sampleOrder.currency}`);
console.log(`   Has Marketing Code: ${sampleOrder.marketingCode ? 'Yes' : 'No'}`);

console.log('\n✨ Seed data generation complete!\n');
