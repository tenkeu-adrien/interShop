// lib/factories/seedData.ts
import {
  createMockClient,
  createMockFournisseur,
  createMockMarketiste,
  createMockProduct,
  createMockOrder,
  createMockMarketingCode,
  createMockReview
} from './index';
import { Client, Fournisseur, Marketiste, Product, Order, MarketingCode, Review } from '@/types';

/**
 * Seed data structure containing all generated entities
 */
export interface SeedData {
  clients: Client[];
  fournisseurs: Fournisseur[];
  marketistes: Marketiste[];
  products: Product[];
  orders: Order[];
  marketingCodes: MarketingCode[];
  reviews: Review[];
}

/**
 * Generates a complete set of realistic test data for all entities
 * with proper relationships between them.
 * 
 * Data generation strategy:
 * 1. Create users (clients, fournisseurs, marketistes)
 * 2. Create products linked to fournisseurs
 * 3. Create marketing codes linked to marketistes
 * 4. Create orders linking clients, fournisseurs, products, and optionally marketing codes
 * 5. Create reviews linking clients, products, and orders
 * 
 * @returns SeedData object containing arrays of all generated entities
 */
export function generateSeedData(): SeedData {
  // Step 1: Generate users
  const clients = Array.from({ length: 20 }, () => createMockClient());
  
  // Generate fournisseurs with varied approval statuses
  const fournisseurs = Array.from({ length: 10 }, (_, index) => {
    // 70% approved, 20% pending, 10% rejected
    let approvalStatus: 'approved' | 'pending' | 'rejected';
    if (index < 7) {
      approvalStatus = 'approved';
    } else if (index < 9) {
      approvalStatus = 'pending';
    } else {
      approvalStatus = 'rejected';
    }
    
    return createMockFournisseur({ approvalStatus });
  });
  
  // Generate marketistes with varied approval statuses
  const marketistes = Array.from({ length: 5 }, (_, index) => {
    // 60% approved, 20% pending, 20% rejected
    let approvalStatus: 'approved' | 'pending' | 'rejected';
    if (index < 3) {
      approvalStatus = 'approved';
    } else if (index < 4) {
      approvalStatus = 'pending';
    } else {
      approvalStatus = 'rejected';
    }
    
    return createMockMarketiste({ approvalStatus });
  });

  // Step 2: Generate products linked to approved fournisseurs
  const approvedFournisseurs = fournisseurs.filter(f => f.approvalStatus === 'approved');
  const products: Product[] = [];
  
  // Distribute 50 products among approved fournisseurs
  for (let i = 0; i < 50; i++) {
    const fournisseur = approvedFournisseurs[i % approvedFournisseurs.length];
    products.push(createMockProduct({
      fournisseurId: fournisseur.id
    }));
  }

  // Step 3: Generate marketing codes linked to approved marketistes
  const approvedMarketistes = marketistes.filter(m => m.approvalStatus === 'approved');
  const marketingCodes: MarketingCode[] = [];
  
  // Distribute 20 marketing codes among approved marketistes
  for (let i = 0; i < 20; i++) {
    const marketiste = approvedMarketistes[i % approvedMarketistes.length];
    
    // Some codes are linked to specific products or fournisseurs
    const hasLinkedProducts = i % 3 === 0;
    const hasLinkedFournisseurs = i % 4 === 0;
    
    marketingCodes.push(createMockMarketingCode({
      marketisteId: marketiste.id,
      linkedProducts: hasLinkedProducts 
        ? products.slice(i * 2, i * 2 + 3).map(p => p.id)
        : undefined,
      linkedFournisseurs: hasLinkedFournisseurs
        ? approvedFournisseurs.slice(i % approvedFournisseurs.length, (i % approvedFournisseurs.length) + 2).map(f => f.id)
        : undefined
    }));
  }

  // Step 4: Generate orders with realistic relationships
  const orders: Order[] = [];
  
  for (let i = 0; i < 100; i++) {
    const client = clients[i % clients.length];
    
    // Select 1-3 products from the same fournisseur for this order
    const fournisseur = approvedFournisseurs[i % approvedFournisseurs.length];
    const fournisseurProducts = products.filter(p => p.fournisseurId === fournisseur.id);
    const productCount = Math.min(Math.floor(Math.random() * 3) + 1, fournisseurProducts.length);
    const selectedProducts = fournisseurProducts.slice(0, productCount);
    
    // 30% of orders use a marketing code
    const useMarketingCode = i % 10 < 3;
    let marketingCode: MarketingCode | undefined;
    
    if (useMarketingCode && marketingCodes.length > 0) {
      // Find a code that applies to this fournisseur or products
      marketingCode = marketingCodes.find(code => 
        !code.linkedFournisseurs || code.linkedFournisseurs.includes(fournisseur.id) ||
        !code.linkedProducts || selectedProducts.some(p => code.linkedProducts?.includes(p.id))
      ) || marketingCodes[i % marketingCodes.length];
    }
    
    // Create order products from selected products
    const orderProducts = selectedProducts.map(product => ({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      quantity: Math.floor(Math.random() * 10) + 1,
      price: product.prices[0].price
    }));
    
    // Calculate order totals
    const subtotal = orderProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const marketingCommission = marketingCode ? subtotal * marketingCode.commissionRate : 0;
    const platformFee = subtotal * 0.05;
    const shippingFee = Math.random() * 45 + 5;
    const total = subtotal + platformFee + shippingFee;
    
    // Distribute order statuses realistically
    let status: Order['status'];
    if (i % 10 === 0) status = 'pending';
    else if (i % 10 === 1) status = 'paid';
    else if (i % 10 < 4) status = 'processing';
    else if (i % 10 < 7) status = 'shipped';
    else if (i % 10 < 9) status = 'delivered';
    else if (i % 10 === 9) status = 'cancelled';
    else status = 'refunded';
    
    orders.push(createMockOrder({
      clientId: client.id,
      fournisseurId: fournisseur.id,
      marketisteId: marketingCode?.marketisteId,
      marketingCode: marketingCode?.code,
      products: orderProducts,
      subtotal: parseFloat(subtotal.toFixed(2)),
      marketingCommission: parseFloat(marketingCommission.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      shippingFee: parseFloat(shippingFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status
    }));
  }

  // Step 5: Generate reviews for delivered orders
  const reviews: Review[] = [];
  const deliveredOrders = orders.filter(o => o.status === 'delivered' && o.deliveredAt);
  
  // 80% of delivered orders get reviews
  const ordersToReview = deliveredOrders.slice(0, Math.floor(deliveredOrders.length * 0.8));
  
  for (const order of ordersToReview) {
    // Each product in the order can get a review
    for (const product of order.products) {
      // 70% chance each product gets reviewed
      if (Math.random() < 0.7) {
        // Calculate review date (0-7 days after delivery, but not in the future)
        const deliveryTime = order.deliveredAt!.getTime();
        const maxReviewTime = Math.min(
          deliveryTime + 7 * 24 * 60 * 60 * 1000, // 7 days after delivery
          Date.now() // But not in the future
        );
        const reviewTime = deliveryTime + Math.random() * (maxReviewTime - deliveryTime);
        
        reviews.push(createMockReview({
          productId: product.productId,
          clientId: order.clientId,
          orderId: order.id,
          createdAt: new Date(reviewTime)
        }));
      }
    }
  }

  return {
    clients,
    fournisseurs,
    marketistes,
    products,
    orders,
    marketingCodes,
    reviews
  };
}

/**
 * Generates seed data and logs statistics about the generated data
 * Useful for debugging and verifying data generation
 */
export function generateAndLogSeedData(): SeedData {
  const seedData = generateSeedData();
  
  console.log('=== Seed Data Generated ===');
  console.log(`Clients: ${seedData.clients.length}`);
  console.log(`Fournisseurs: ${seedData.fournisseurs.length}`);
  console.log(`  - Approved: ${seedData.fournisseurs.filter(f => f.approvalStatus === 'approved').length}`);
  console.log(`  - Pending: ${seedData.fournisseurs.filter(f => f.approvalStatus === 'pending').length}`);
  console.log(`  - Rejected: ${seedData.fournisseurs.filter(f => f.approvalStatus === 'rejected').length}`);
  console.log(`Marketistes: ${seedData.marketistes.length}`);
  console.log(`  - Approved: ${seedData.marketistes.filter(m => m.approvalStatus === 'approved').length}`);
  console.log(`  - Pending: ${seedData.marketistes.filter(m => m.approvalStatus === 'pending').length}`);
  console.log(`  - Rejected: ${seedData.marketistes.filter(m => m.approvalStatus === 'rejected').length}`);
  console.log(`Products: ${seedData.products.length}`);
  console.log(`Orders: ${seedData.orders.length}`);
  console.log(`  - Pending: ${seedData.orders.filter(o => o.status === 'pending').length}`);
  console.log(`  - Paid: ${seedData.orders.filter(o => o.status === 'paid').length}`);
  console.log(`  - Processing: ${seedData.orders.filter(o => o.status === 'processing').length}`);
  console.log(`  - Shipped: ${seedData.orders.filter(o => o.status === 'shipped').length}`);
  console.log(`  - Delivered: ${seedData.orders.filter(o => o.status === 'delivered').length}`);
  console.log(`  - Cancelled: ${seedData.orders.filter(o => o.status === 'cancelled').length}`);
  console.log(`  - With Marketing Codes: ${seedData.orders.filter(o => o.marketingCode).length}`);
  console.log(`Marketing Codes: ${seedData.marketingCodes.length}`);
  console.log(`Reviews: ${seedData.reviews.length}`);
  console.log('===========================');
  
  return seedData;
}
