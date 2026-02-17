// lib/factories/factories.test.ts
import { describe, it, expect } from '@jest/globals';
import { createMockProduct, createMockPriceTier } from './productFactory';
import { createMockOrder, createMockOrderProduct } from './orderFactory';
import { createMockMarketingCode } from './marketingCodeFactory';
import { createMockReview } from './reviewFactory';

describe('Product Factory', () => {
  it('should create a valid product with all required fields', () => {
    const product = createMockProduct();
    
    expect(product).toBeDefined();
    expect(product.id).toBeDefined();
    expect(product.fournisseurId).toBeDefined();
    expect(product.name).toBeDefined();
    expect(product.description).toBeDefined();
    expect(product.category).toBeDefined();
    expect(product.prices).toBeInstanceOf(Array);
    expect(product.prices.length).toBeGreaterThan(0);
    expect(product.stock).toBeGreaterThanOrEqual(0);
    expect(product.rating).toBeGreaterThanOrEqual(0);
    expect(product.rating).toBeLessThanOrEqual(5);
  });

  it('should create a valid price tier', () => {
    const priceTier = createMockPriceTier();
    
    expect(priceTier).toBeDefined();
    expect(priceTier.minQuantity).toBeGreaterThan(0);
    expect(priceTier.price).toBeGreaterThan(0);
    expect(priceTier.currency).toBeDefined();
  });

  it('should respect overrides for product', () => {
    const product = createMockProduct({ name: 'Test Product', stock: 100 });
    
    expect(product.name).toBe('Test Product');
    expect(product.stock).toBe(100);
  });
});

describe('Order Factory', () => {
  it('should create a valid order with all required fields', () => {
    const order = createMockOrder();
    
    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.orderNumber).toBeDefined();
    expect(order.clientId).toBeDefined();
    expect(order.fournisseurId).toBeDefined();
    expect(order.products).toBeInstanceOf(Array);
    expect(order.products.length).toBeGreaterThan(0);
    expect(order.subtotal).toBeGreaterThan(0);
    expect(order.total).toBeGreaterThan(0);
    expect(order.status).toBeDefined();
    expect(order.paymentStatus).toBeDefined();
    expect(order.shippingAddress).toBeDefined();
  });

  it('should create a valid order product', () => {
    const orderProduct = createMockOrderProduct();
    
    expect(orderProduct).toBeDefined();
    expect(orderProduct.productId).toBeDefined();
    expect(orderProduct.name).toBeDefined();
    expect(orderProduct.quantity).toBeGreaterThan(0);
    expect(orderProduct.price).toBeGreaterThan(0);
  });

  it('should respect overrides for order', () => {
    const order = createMockOrder({ status: 'delivered', total: 500 });
    
    expect(order.status).toBe('delivered');
    expect(order.total).toBe(500);
  });

  it('should have tracking number for shipped orders', () => {
    const order = createMockOrder({ status: 'shipped' });
    
    expect(order.trackingNumber).toBeDefined();
  });
});

describe('Marketing Code Factory', () => {
  it('should create a valid marketing code with all required fields', () => {
    const code = createMockMarketingCode();
    
    expect(code).toBeDefined();
    expect(code.id).toBeDefined();
    expect(code.code).toBeDefined();
    expect(code.marketisteId).toBeDefined();
    expect(code.commissionRate).toBeGreaterThan(0);
    expect(code.commissionRate).toBeLessThanOrEqual(1);
    expect(code.validFrom).toBeInstanceOf(Date);
    expect(code.usageCount).toBeGreaterThanOrEqual(0);
    expect(code.totalEarnings).toBeGreaterThanOrEqual(0);
  });

  it('should respect overrides for marketing code', () => {
    const code = createMockMarketingCode({ code: 'TESTCODE', commissionRate: 0.15 });
    
    expect(code.code).toBe('TESTCODE');
    expect(code.commissionRate).toBe(0.15);
  });

  it('should generate uppercase codes', () => {
    const code = createMockMarketingCode();
    
    expect(code.code).toBe(code.code.toUpperCase());
  });
});

describe('Review Factory', () => {
  it('should create a valid review with all required fields', () => {
    const review = createMockReview();
    
    expect(review).toBeDefined();
    expect(review.id).toBeDefined();
    expect(review.productId).toBeDefined();
    expect(review.clientId).toBeDefined();
    expect(review.orderId).toBeDefined();
    expect(review.rating).toBeGreaterThanOrEqual(1);
    expect(review.rating).toBeLessThanOrEqual(5);
    expect(review.comment).toBeDefined();
    expect(review.createdAt).toBeInstanceOf(Date);
  });

  it('should respect overrides for review', () => {
    const review = createMockReview({ rating: 5, comment: 'Excellent!' });
    
    expect(review.rating).toBe(5);
    expect(review.comment).toBe('Excellent!');
  });

  it('should have response with valid date when present', () => {
    const review = createMockReview();
    
    if (review.response) {
      expect(review.response.content).toBeDefined();
      expect(review.response.createdAt).toBeInstanceOf(Date);
      expect(review.response.createdAt.getTime()).toBeGreaterThanOrEqual(review.createdAt.getTime());
    }
  });
});
