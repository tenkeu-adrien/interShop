// lib/factories/userFactory.test.ts
import { describe, it, expect } from '@jest/globals';
import { 
  createMockUser, 
  createMockClient, 
  createMockFournisseur, 
  createMockMarketiste, 
  createMockAddress 
} from './userFactory';

describe('User Factories', () => {
  describe('createMockUser', () => {
    it('should create a user with all required fields', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('displayName');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
      expect(user).toHaveProperty('isVerified');
      expect(user).toHaveProperty('isActive');
      expect(user).toHaveProperty('approvalStatus');
      expect(user.isActive).toBe(true);
      expect(user.approvalStatus).toBe('approved');
    });

    it('should allow overriding default values', () => {
      const user = createMockUser({ 
        email: 'test@example.com',
        role: 'admin',
        approvalStatus: 'pending'
      });
      
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('admin');
      expect(user.approvalStatus).toBe('pending');
    });
  });

  describe('createMockClient', () => {
    it('should create a client with role "client"', () => {
      const client = createMockClient();
      
      expect(client.role).toBe('client');
      expect(client).toHaveProperty('addresses');
      expect(client).toHaveProperty('orders');
      expect(client).toHaveProperty('wishlist');
      expect(Array.isArray(client.addresses)).toBe(true);
      expect(Array.isArray(client.orders)).toBe(true);
      expect(Array.isArray(client.wishlist)).toBe(true);
    });

    it('should create client with 1-3 addresses', () => {
      const client = createMockClient();
      
      expect(client.addresses.length).toBeGreaterThanOrEqual(1);
      expect(client.addresses.length).toBeLessThanOrEqual(3);
    });
  });

  describe('createMockFournisseur', () => {
    it('should create a fournisseur with role "fournisseur"', () => {
      const fournisseur = createMockFournisseur();
      
      expect(fournisseur.role).toBe('fournisseur');
      expect(fournisseur).toHaveProperty('shopName');
      expect(fournisseur).toHaveProperty('shopDescription');
      expect(fournisseur).toHaveProperty('rating');
      expect(fournisseur).toHaveProperty('totalSales');
      expect(fournisseur).toHaveProperty('country');
      expect(fournisseur).toHaveProperty('certifications');
    });

    it('should have valid approval status', () => {
      const fournisseur = createMockFournisseur();
      
      expect(['pending', 'approved', 'rejected']).toContain(fournisseur.approvalStatus);
    });

    it('should have approvedBy and approvedAt when not pending', () => {
      const fournisseur = createMockFournisseur({ approvalStatus: 'approved' });
      
      expect(fournisseur.approvedBy).toBeDefined();
      expect(fournisseur.approvedAt).toBeDefined();
    });

    it('should have rejectionReason when rejected', () => {
      const fournisseur = createMockFournisseur({ approvalStatus: 'rejected' });
      
      expect(fournisseur.rejectionReason).toBeDefined();
    });
  });

  describe('createMockMarketiste', () => {
    it('should create a marketiste with role "marketiste"', () => {
      const marketiste = createMockMarketiste();
      
      expect(marketiste.role).toBe('marketiste');
      expect(marketiste).toHaveProperty('codes');
      expect(marketiste).toHaveProperty('totalEarnings');
      expect(marketiste).toHaveProperty('pendingEarnings');
      expect(Array.isArray(marketiste.codes)).toBe(true);
    });

    it('should have valid approval status', () => {
      const marketiste = createMockMarketiste();
      
      expect(['pending', 'approved', 'rejected']).toContain(marketiste.approvalStatus);
    });

    it('should have earnings as numbers', () => {
      const marketiste = createMockMarketiste();
      
      expect(typeof marketiste.totalEarnings).toBe('number');
      expect(typeof marketiste.pendingEarnings).toBe('number');
      expect(marketiste.totalEarnings).toBeGreaterThanOrEqual(0);
      expect(marketiste.pendingEarnings).toBeGreaterThanOrEqual(0);
    });
  });

  describe('createMockAddress', () => {
    it('should create an address with all required fields', () => {
      const address = createMockAddress();
      
      expect(address).toHaveProperty('id');
      expect(address).toHaveProperty('label');
      expect(address).toHaveProperty('fullName');
      expect(address).toHaveProperty('phone');
      expect(address).toHaveProperty('street');
      expect(address).toHaveProperty('city');
      expect(address).toHaveProperty('state');
      expect(address).toHaveProperty('country');
      expect(address).toHaveProperty('postalCode');
      expect(address).toHaveProperty('isDefault');
      expect(address.isDefault).toBe(false);
    });

    it('should have valid label', () => {
      const address = createMockAddress();
      
      expect(['Maison', 'Bureau', 'Autre']).toContain(address.label);
    });

    it('should allow overriding default values', () => {
      const address = createMockAddress({ 
        label: 'Maison',
        isDefault: true 
      });
      
      expect(address.label).toBe('Maison');
      expect(address.isDefault).toBe(true);
    });
  });
});
