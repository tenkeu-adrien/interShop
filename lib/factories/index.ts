// lib/factories/index.ts
// Central export file for all factory functions

// User factories
export {
  createMockUser,
  createMockClient,
  createMockFournisseur,
  createMockMarketiste,
  createMockAddress
} from './userFactory';

// Product factories
export {
  createMockProduct,
  createMockPriceTier
} from './productFactory';

// Order factories
export {
  createMockOrder,
  createMockOrderProduct
} from './orderFactory';

// Marketing code factories
export {
  createMockMarketingCode
} from './marketingCodeFactory';

// Review factories
export {
  createMockReview
} from './reviewFactory';

// Seed data generator
export {
  generateSeedData,
  generateAndLogSeedData,
  type SeedData
} from './seedData';
