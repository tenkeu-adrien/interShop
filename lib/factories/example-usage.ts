// lib/factories/example-usage.ts
// Example usage of the seed data generator

import { generateSeedData, generateAndLogSeedData } from './seedData';

// Example 1: Generate seed data silently
console.log('Example 1: Generate seed data silently');
const seedData = generateSeedData();
console.log(`Generated ${seedData.orders.length} orders\n`);

// Example 2: Generate seed data with logging
console.log('Example 2: Generate seed data with logging');
const seedDataWithLogs = generateAndLogSeedData();

// Example 3: Use specific entities
console.log('\nExample 3: Access specific entities');
console.log(`First client: ${seedData.clients[0].displayName}`);
console.log(`First fournisseur: ${seedData.fournisseurs[0].shopName}`);
console.log(`First product: ${seedData.products[0].name}`);
console.log(`First order: ${seedData.orders[0].orderNumber}`);

// Example 4: Filter data
console.log('\nExample 4: Filter data');
const approvedFournisseurs = seedData.fournisseurs.filter(f => f.approvalStatus === 'approved');
console.log(`Approved fournisseurs: ${approvedFournisseurs.length}`);

const deliveredOrders = seedData.orders.filter(o => o.status === 'delivered');
console.log(`Delivered orders: ${deliveredOrders.length}`);

const ordersWithCodes = seedData.orders.filter(o => o.marketingCode);
console.log(`Orders with marketing codes: ${ordersWithCodes.length}`);

// Example 5: Calculate statistics
console.log('\nExample 5: Calculate statistics');
const totalRevenue = seedData.orders
  .filter(o => o.status === 'delivered')
  .reduce((sum, o) => sum + o.total, 0);
console.log(`Total revenue from delivered orders: ${totalRevenue.toFixed(2)}`);

const avgOrderValue = seedData.orders.reduce((sum, o) => sum + o.total, 0) / seedData.orders.length;
console.log(`Average order value: ${avgOrderValue.toFixed(2)}`);

const totalCommissions = seedData.orders
  .filter(o => o.marketingCommission > 0)
  .reduce((sum, o) => sum + o.marketingCommission, 0);
console.log(`Total marketing commissions: ${totalCommissions.toFixed(2)}`);
