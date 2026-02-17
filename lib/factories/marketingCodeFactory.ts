// lib/factories/marketingCodeFactory.ts
import { faker } from '@faker-js/faker';
import { MarketingCode } from '@/types';

/**
 * Creates a mock MarketingCode with realistic test data
 * @param overrides - Optional partial MarketingCode object to override default values
 * @returns A complete MarketingCode object with generated data
 */
export function createMockMarketingCode(overrides?: Partial<MarketingCode>): MarketingCode {
  const validFrom = overrides?.validFrom ?? faker.date.past();
  const hasEndDate = faker.datatype.boolean({ probability: 0.7 });
  const validUntil = hasEndDate 
    ? faker.date.future({ refDate: validFrom })
    : undefined;

  // Generate a realistic marketing code (e.g., SUMMER2024, WELCOME10, FLASH50)
  const codeTypes = [
    () => `${faker.word.adjective().toUpperCase()}${faker.number.int({ min: 10, max: 99 })}`,
    () => `${faker.commerce.productAdjective().toUpperCase()}${faker.date.future().getFullYear()}`,
    () => `${faker.word.noun().toUpperCase()}${faker.number.int({ min: 5, max: 50 })}`,
    () => faker.string.alphanumeric(8).toUpperCase()
  ];

  const code = overrides?.code ?? faker.helpers.arrayElement(codeTypes)();

  // Determine if code is linked to specific products or fournisseurs
  const hasLinkedProducts = faker.datatype.boolean({ probability: 0.4 });
  const hasLinkedFournisseurs = faker.datatype.boolean({ probability: 0.3 });

  return {
    id: faker.string.uuid(),
    code,
    marketisteId: faker.string.uuid(),
    commissionRate: faker.number.float({ min: 0.05, max: 0.20, fractionDigits: 2 }), // 5% to 20%
    validFrom,
    validUntil,
    isActive: faker.datatype.boolean({ probability: 0.8 }),
    linkedProducts: hasLinkedProducts 
      ? Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.string.uuid())
      : undefined,
    linkedFournisseurs: hasLinkedFournisseurs
      ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.string.uuid())
      : undefined,
    usageCount: faker.number.int({ min: 0, max: 500 }),
    totalEarnings: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    ...overrides
  };
}
