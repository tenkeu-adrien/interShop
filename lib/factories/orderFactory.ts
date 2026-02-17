// lib/factories/orderFactory.ts
import { faker } from '@faker-js/faker';
import { Order, OrderProduct, OrderStatus, PaymentStatus } from '@/types';
import { createMockAddress } from './userFactory';

/**
 * Creates a mock OrderProduct with realistic product data
 * @param overrides - Optional partial OrderProduct object to override default values
 * @returns A complete OrderProduct object with generated data
 */
export function createMockOrderProduct(overrides?: Partial<OrderProduct>): OrderProduct {
  return {
    productId: faker.string.uuid(),
    name: faker.commerce.productName(),
    image: faker.image.url(),
    quantity: faker.number.int({ min: 1, max: 100 }),
    price: faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
    ...overrides
  };
}

/**
 * Creates a mock Order with realistic test data
 * @param overrides - Optional partial Order object to override default values
 * @returns A complete Order object with generated data
 */
export function createMockOrder(overrides?: Partial<Order>): Order {
  const status = overrides?.status ?? faker.helpers.arrayElement([
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ] as OrderStatus[]);

  const paymentStatus = overrides?.paymentStatus ?? faker.helpers.arrayElement([
    'pending',
    'paid',
    'failed',
    'refunded'
  ] as PaymentStatus[]);

  // Generate 1-5 products for the order
  const productCount = faker.number.int({ min: 1, max: 5 });
  const products = Array.from({ length: productCount }, () => createMockOrderProduct());

  // Calculate order totals
  const subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const hasMarketingCode = faker.datatype.boolean({ probability: 0.3 });
  const marketingCommission = hasMarketingCode ? subtotal * faker.number.float({ min: 0.05, max: 0.15, fractionDigits: 2 }) : 0;
  const platformFee = subtotal * 0.05; // 5% platform fee
  const shippingFee = faker.number.float({ min: 5, max: 50, fractionDigits: 2 });
  const total = subtotal + platformFee + shippingFee;

  const createdAt = overrides?.createdAt ?? faker.date.past();
  const paidAt = ['paid', 'processing', 'shipped', 'delivered'].includes(status) 
    ? faker.date.between({ from: createdAt, to: new Date() })
    : undefined;
  const shippedAt = ['shipped', 'delivered'].includes(status)
    ? faker.date.between({ from: paidAt || createdAt, to: new Date() })
    : undefined;
  const deliveredAt = status === 'delivered'
    ? faker.date.between({ from: shippedAt || paidAt || createdAt, to: new Date() })
    : undefined;

  return {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
    clientId: faker.string.uuid(),
    fournisseurId: faker.string.uuid(),
    marketisteId: hasMarketingCode ? faker.string.uuid() : undefined,
    marketingCode: hasMarketingCode ? faker.string.alphanumeric(8).toUpperCase() : undefined,
    products,
    subtotal: parseFloat(subtotal.toFixed(2)),
    marketingCommission: parseFloat(marketingCommission.toFixed(2)),
    platformFee: parseFloat(platformFee.toFixed(2)),
    shippingFee: parseFloat(shippingFee.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'XOF', 'XAF']),
    status,
    paymentStatus,
    paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer', 'mobile_money']),
    shippingAddress: createMockAddress(),
    trackingNumber: ['shipped', 'delivered'].includes(status) 
      ? faker.string.alphanumeric(12).toUpperCase()
      : undefined,
    createdAt,
    updatedAt: new Date(),
    paidAt,
    shippedAt,
    deliveredAt,
    // Multi-currency fields
    displayCurrency: faker.helpers.arrayElement(['USD', 'XOF', 'XAF', 'GHS', 'NGN']) as any,
    exchangeRate: faker.number.float({ min: 0.5, max: 2, fractionDigits: 4 }),
    displayTotal: parseFloat((total * faker.number.float({ min: 0.5, max: 2 })).toFixed(2)),
    displaySubtotal: parseFloat((subtotal * faker.number.float({ min: 0.5, max: 2 })).toFixed(2)),
    displayShippingFee: parseFloat((shippingFee * faker.number.float({ min: 0.5, max: 2 })).toFixed(2)),
    ...overrides
  };
}
