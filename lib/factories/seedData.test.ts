// lib/factories/seedData.test.ts
import { describe, it, expect } from '@jest/globals';
import { generateSeedData } from './seedData';

describe('generateSeedData', () => {
  it('should generate the correct number of entities', () => {
    const seedData = generateSeedData();
    
    expect(seedData.clients).toHaveLength(20);
    expect(seedData.fournisseurs).toHaveLength(10);
    expect(seedData.marketistes).toHaveLength(5);
    expect(seedData.products).toHaveLength(50);
    expect(seedData.orders).toHaveLength(100);
    expect(seedData.marketingCodes).toHaveLength(20);
    expect(seedData.reviews.length).toBeGreaterThan(0);
  });

  it('should create clients with correct role', () => {
    const seedData = generateSeedData();
    
    seedData.clients.forEach(client => {
      expect(client.role).toBe('client');
      expect(client.approvalStatus).toBe('approved');
    });
  });

  it('should create fournisseurs with varied approval statuses', () => {
    const seedData = generateSeedData();
    
    const approved = seedData.fournisseurs.filter(f => f.approvalStatus === 'approved');
    const pending = seedData.fournisseurs.filter(f => f.approvalStatus === 'pending');
    const rejected = seedData.fournisseurs.filter(f => f.approvalStatus === 'rejected');
    
    expect(approved.length).toBe(7);
    expect(pending.length).toBe(2);
    expect(rejected.length).toBe(1);
  });

  it('should create marketistes with varied approval statuses', () => {
    const seedData = generateSeedData();
    
    const approved = seedData.marketistes.filter(m => m.approvalStatus === 'approved');
    const pending = seedData.marketistes.filter(m => m.approvalStatus === 'pending');
    const rejected = seedData.marketistes.filter(m => m.approvalStatus === 'rejected');
    
    expect(approved.length).toBe(3);
    expect(pending.length).toBe(1);
    expect(rejected.length).toBe(1);
  });

  it('should link products to approved fournisseurs only', () => {
    const seedData = generateSeedData();
    
    const approvedFournisseurIds = seedData.fournisseurs
      .filter(f => f.approvalStatus === 'approved')
      .map(f => f.id);
    
    seedData.products.forEach(product => {
      expect(approvedFournisseurIds).toContain(product.fournisseurId);
    });
  });

  it('should link marketing codes to approved marketistes only', () => {
    const seedData = generateSeedData();
    
    const approvedMarketisteIds = seedData.marketistes
      .filter(m => m.approvalStatus === 'approved')
      .map(m => m.id);
    
    seedData.marketingCodes.forEach(code => {
      expect(approvedMarketisteIds).toContain(code.marketisteId);
    });
  });

  it('should create orders with valid client and fournisseur references', () => {
    const seedData = generateSeedData();
    
    const clientIds = seedData.clients.map(c => c.id);
    const approvedFournisseurIds = seedData.fournisseurs
      .filter(f => f.approvalStatus === 'approved')
      .map(f => f.id);
    
    seedData.orders.forEach(order => {
      expect(clientIds).toContain(order.clientId);
      expect(approvedFournisseurIds).toContain(order.fournisseurId);
    });
  });

  it('should create orders with valid product references', () => {
    const seedData = generateSeedData();
    
    const productIds = seedData.products.map(p => p.id);
    
    seedData.orders.forEach(order => {
      order.products.forEach(orderProduct => {
        expect(productIds).toContain(orderProduct.productId);
      });
    });
  });

  it('should create orders with marketing codes that reference valid marketistes', () => {
    const seedData = generateSeedData();
    
    const approvedMarketisteIds = seedData.marketistes
      .filter(m => m.approvalStatus === 'approved')
      .map(m => m.id);
    
    const ordersWithCodes = seedData.orders.filter(o => o.marketisteId);
    
    ordersWithCodes.forEach(order => {
      expect(approvedMarketisteIds).toContain(order.marketisteId!);
    });
  });

  it('should create reviews only for delivered orders', () => {
    const seedData = generateSeedData();
    
    const deliveredOrderIds = seedData.orders
      .filter(o => o.status === 'delivered')
      .map(o => o.id);
    
    seedData.reviews.forEach(review => {
      expect(deliveredOrderIds).toContain(review.orderId);
    });
  });

  it('should create reviews with valid product and client references', () => {
    const seedData = generateSeedData();
    
    const productIds = seedData.products.map(p => p.id);
    const clientIds = seedData.clients.map(c => c.id);
    
    seedData.reviews.forEach(review => {
      expect(productIds).toContain(review.productId);
      expect(clientIds).toContain(review.clientId);
    });
  });

  it('should calculate order totals correctly', () => {
    const seedData = generateSeedData();
    
    seedData.orders.forEach(order => {
      const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      
      expect(order.subtotal).toBeCloseTo(subtotal, 2);
      expect(order.platformFee).toBeCloseTo(subtotal * 0.05, 2);
      expect(order.total).toBeCloseTo(
        order.subtotal + order.platformFee + order.shippingFee,
        2
      );
    });
  });

  it('should create orders with varied statuses', () => {
    const seedData = generateSeedData();
    
    const statuses = new Set(seedData.orders.map(o => o.status));
    
    // Should have multiple different statuses
    expect(statuses.size).toBeGreaterThan(3);
    expect(statuses).toContain('delivered');
  });

  it('should create some marketing codes with linked products', () => {
    const seedData = generateSeedData();
    
    const codesWithLinkedProducts = seedData.marketingCodes.filter(
      code => code.linkedProducts && code.linkedProducts.length > 0
    );
    
    expect(codesWithLinkedProducts.length).toBeGreaterThan(0);
  });

  it('should create some marketing codes with linked fournisseurs', () => {
    const seedData = generateSeedData();
    
    const codesWithLinkedFournisseurs = seedData.marketingCodes.filter(
      code => code.linkedFournisseurs && code.linkedFournisseurs.length > 0
    );
    
    expect(codesWithLinkedFournisseurs.length).toBeGreaterThan(0);
  });
});
