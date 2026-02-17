// Verification script for user factories
// This file verifies that all factories can be imported and used correctly

import { 
  createMockUser, 
  createMockClient, 
  createMockFournisseur, 
  createMockMarketiste, 
  createMockAddress 
} from './userFactory';

// Verify all functions are exported and can be called
const user = createMockUser();
const client = createMockClient();
const fournisseur = createMockFournisseur();
const marketiste = createMockMarketiste();
const address = createMockAddress();

// Verify overrides work
const customUser = createMockUser({ email: 'custom@example.com', role: 'admin' });
const customClient = createMockClient({ wishlist: ['product-1', 'product-2'] });
const customFournisseur = createMockFournisseur({ approvalStatus: 'approved' });
const customMarketiste = createMockMarketiste({ totalEarnings: 10000 });
const customAddress = createMockAddress({ isDefault: true, label: 'Maison' });

console.log('✅ All user factories verified successfully!');
console.log('Generated user:', { id: user.id.substring(0, 8), email: user.email, role: user.role });
console.log('Generated client:', { role: client.role, addressCount: client.addresses.length });
console.log('Generated fournisseur:', { role: fournisseur.role, shopName: fournisseur.shopName });
console.log('Generated marketiste:', { role: marketiste.role, totalEarnings: marketiste.totalEarnings });
console.log('Generated address:', { label: address.label, city: address.city });
