// lib/factories/productFactory.ts
import { faker } from '@faker-js/faker';
import { Product, PriceTier } from '@/types';

/**
 * Creates a mock PriceTier with realistic pricing data
 * @param overrides - Optional partial PriceTier object to override default values
 * @returns A complete PriceTier object with generated data
 */
export function createMockPriceTier(overrides?: Partial<PriceTier>): PriceTier {
  const minQuantity = overrides?.minQuantity ?? faker.number.int({ min: 1, max: 100 });
  const maxQuantity = overrides?.maxQuantity ?? faker.number.int({ min: minQuantity + 50, max: minQuantity + 500 });
  
  return {
    minQuantity,
    maxQuantity,
    price: faker.number.float({ min: 5, max: 1000, fractionDigits: 2 }),
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'XOF', 'XAF']),
    ...overrides
  };
}

/**
 * Creates a mock Product with realistic test data
 * @param overrides - Optional partial Product object to override default values
 * @returns A complete Product object with generated data
 */
export function createMockProduct(overrides?: Partial<Product>): Product {
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Books & Media',
    'Food & Beverages',
    'Office Supplies'
  ];

  const subcategories: Record<string, string[]> = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio'],
    'Fashion': ['Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Bags'],
    'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Tools'],
    'Sports & Outdoors': ['Fitness', 'Camping', 'Cycling', 'Water Sports', 'Team Sports'],
    'Toys & Games': ['Action Figures', 'Board Games', 'Puzzles', 'Educational', 'Outdoor Toys']
  };

  const category = overrides?.category ?? faker.helpers.arrayElement(categories);
  const subcategory = overrides?.subcategory ?? 
    (subcategories[category] ? faker.helpers.arrayElement(subcategories[category]) : undefined);

  // Generate 2-4 price tiers with increasing quantities and decreasing unit prices
  const tierCount = faker.number.int({ min: 2, max: 4 });
  const prices: PriceTier[] = [];
  let currentMin = 1;
  const basePrice = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
  const currency = faker.helpers.arrayElement(['USD', 'EUR', 'GBP', 'XOF', 'XAF']);

  for (let i = 0; i < tierCount; i++) {
    const minQuantity = currentMin;
    const maxQuantity = i < tierCount - 1 ? currentMin + faker.number.int({ min: 50, max: 200 }) : undefined;
    const discountRate = 1 - (i * 0.05); // 5% discount per tier
    const price = parseFloat((basePrice * discountRate).toFixed(2));
    
    prices.push({
      minQuantity,
      maxQuantity,
      price,
      currency
    });

    if (maxQuantity) {
      currentMin = maxQuantity + 1;
    }
  }

  return {
    id: faker.string.uuid(),
    fournisseurId: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    images: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => faker.image.url()),
    videos: faker.datatype.boolean() ? [faker.internet.url()] : undefined,
    category,
    subcategory,
    tags: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => faker.commerce.productAdjective()),
    moq: faker.number.int({ min: 1, max: 100 }),
    prices,
    stock: faker.number.int({ min: 0, max: 10000 }),
    country: faker.location.country(),
    deliveryTime: faker.helpers.arrayElement(['7-15 days', '15-30 days', '30-45 days', '45-60 days']),
    certifications: Array.from({ length: faker.number.int({ min: 0, max: 4 }) }, () => 
      faker.helpers.arrayElement(['CE', 'ISO 9001', 'RoHS', 'FDA', 'FCC', 'UL'])
    ),
    rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 0, max: 500 }),
    views: faker.number.int({ min: 0, max: 10000 }),
    sales: faker.number.int({ min: 0, max: 5000 }),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    serviceCategory: 'ecommerce' as any, // Par défaut
    createdAt: faker.date.past(),
    updatedAt: new Date(),
    ...overrides
  };
}
