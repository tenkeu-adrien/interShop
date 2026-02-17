// lib/factories/verify-new-factories.ts
// Simple verification script to test the new factories

import { createMockProduct, createMockPriceTier } from './productFactory';
import { createMockOrder, createMockOrderProduct } from './orderFactory';
import { createMockMarketingCode } from './marketingCodeFactory';
import { createMockReview } from './reviewFactory';

console.log('=== Testing Product Factory ===');
const product = createMockProduct();
console.log('✓ Product created:', {
  id: product.id,
  name: product.name,
  category: product.category,
  priceCount: product.prices.length,
  stock: product.stock
});

const priceTier = createMockPriceTier();
console.log('✓ Price tier created:', priceTier);

const customProduct = createMockProduct({ name: 'Custom Product', stock: 500 });
console.log('✓ Custom product created:', customProduct.name, 'with stock:', customProduct.stock);

console.log('\n=== Testing Order Factory ===');
const order = createMockOrder();
console.log('✓ Order created:', {
  orderNumber: order.orderNumber,
  status: order.status,
  productCount: order.products.length,
  total: order.total,
  currency: order.currency
});

const orderProduct = createMockOrderProduct();
console.log('✓ Order product created:', {
  name: orderProduct.name,
  quantity: orderProduct.quantity,
  price: orderProduct.price
});

const shippedOrder = createMockOrder({ status: 'shipped' });
console.log('✓ Shipped order has tracking:', shippedOrder.trackingNumber ? 'Yes' : 'No');

console.log('\n=== Testing Marketing Code Factory ===');
const marketingCode = createMockMarketingCode();
console.log('✓ Marketing code created:', {
  code: marketingCode.code,
  commissionRate: marketingCode.commissionRate,
  isActive: marketingCode.isActive,
  usageCount: marketingCode.usageCount
});

const customCode = createMockMarketingCode({ code: 'TESTCODE2024', commissionRate: 0.15 });
console.log('✓ Custom code created:', customCode.code, 'with rate:', customCode.commissionRate);

console.log('\n=== Testing Review Factory ===');
const review = createMockReview();
console.log('✓ Review created:', {
  rating: review.rating,
  hasComment: !!review.comment,
  hasImages: !!review.images,
  hasResponse: !!review.response
});

const fiveStarReview = createMockReview({ rating: 5 });
console.log('✓ 5-star review created with rating:', fiveStarReview.rating);

console.log('\n=== All Factories Verified Successfully! ===');
