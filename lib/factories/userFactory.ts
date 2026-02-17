// lib/factories/userFactory.ts
import { faker } from '@faker-js/faker';
import { User, Client, Fournisseur, Marketiste, Address, ApprovalStatus, UserRole } from '@/types';

/**
 * Creates a mock User with realistic test data
 * @param overrides - Optional partial User object to override default values
 * @returns A complete User object with generated data
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['client', 'fournisseur', 'marketiste', 'admin'] as UserRole[]),
    displayName: faker.person.fullName(),
    photoURL: faker.image.avatar(),
    phoneNumber: faker.phone.number(),
    createdAt: faker.date.past(),
    updatedAt: new Date(),
    isVerified: faker.datatype.boolean(),
    isActive: true,
    approvalStatus: 'approved',
    // Nouveaux champs de vérification
    accountStatus: 'active' as any,
    emailVerified: true,
    emailVerificationAttempts: 0,
    phoneVerified: true,
    phoneVerificationAttempts: 0,
    verificationHistory: [],
    ...overrides
  };
}

/**
 * Creates a mock Client with addresses, orders, and wishlist
 * @param overrides - Optional partial Client object to override default values
 * @returns A complete Client object with generated data
 */
export function createMockClient(overrides?: Partial<Client>): Client {
  return {
    ...createMockUser({ role: 'client' }),
    addresses: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => createMockAddress()),
    orders: [],
    wishlist: [],
    ...overrides
  } as Client;
}

/**
 * Creates a mock Fournisseur with shop info and approval status
 * @param overrides - Optional partial Fournisseur object to override default values
 * @returns A complete Fournisseur object with generated data
 */
export function createMockFournisseur(overrides?: Partial<Fournisseur>): Fournisseur {
  const approvalStatus = faker.helpers.arrayElement(['pending', 'approved', 'rejected'] as ApprovalStatus[]);
  
  return {
    ...createMockUser({ role: 'fournisseur', approvalStatus }),
    shopName: faker.company.name(),
    shopDescription: faker.company.catchPhrase(),
    shopLogo: faker.image.url(),
    rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    totalSales: faker.number.int({ min: 0, max: 10000 }),
    country: faker.location.country(),
    certifications: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.company.buzzPhrase()),
    approvedBy: approvalStatus !== 'pending' ? faker.string.uuid() : undefined,
    approvedAt: approvalStatus !== 'pending' ? faker.date.recent() : undefined,
    rejectionReason: approvalStatus === 'rejected' ? faker.lorem.sentence() : undefined,
    ...overrides
  } as Fournisseur;
}

/**
 * Creates a mock Marketiste with codes, earnings, and approval status
 * @param overrides - Optional partial Marketiste object to override default values
 * @returns A complete Marketiste object with generated data
 */
export function createMockMarketiste(overrides?: Partial<Marketiste>): Marketiste {
  const approvalStatus = faker.helpers.arrayElement(['pending', 'approved', 'rejected'] as ApprovalStatus[]);
  
  return {
    ...createMockUser({ role: 'marketiste', approvalStatus }),
    codes: [],
    totalEarnings: faker.number.float({ min: 0, max: 50000, fractionDigits: 2 }),
    pendingEarnings: faker.number.float({ min: 0, max: 5000, fractionDigits: 2 }),
    approvedBy: approvalStatus !== 'pending' ? faker.string.uuid() : undefined,
    approvedAt: approvalStatus !== 'pending' ? faker.date.recent() : undefined,
    rejectionReason: approvalStatus === 'rejected' ? faker.lorem.sentence() : undefined,
    ...overrides
  } as Marketiste;
}

/**
 * Creates a mock Address with all required fields
 * @param overrides - Optional partial Address object to override default values
 * @returns A complete Address object with generated data
 */
export function createMockAddress(overrides?: Partial<Address>): Address {
  return {
    id: faker.string.uuid(),
    label: faker.helpers.arrayElement(['Maison', 'Bureau', 'Autre']),
    fullName: faker.person.fullName(),
    phone: faker.phone.number(),
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    postalCode: faker.location.zipCode(),
    isDefault: false,
    ...overrides
  };
}
