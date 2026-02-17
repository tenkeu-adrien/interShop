# Test Data Factories

This directory contains factory functions for generating realistic test data using `@faker-js/faker`.

## Available Factories

### User Factories

#### `createMockUser(overrides?: Partial<User>): User`

Creates a basic user with all required fields.

**Example:**
```typescript
import { createMockUser } from '@/lib/factories/userFactory';

// Create a random user
const user = createMockUser();

// Create a user with specific values
const admin = createMockUser({ 
  email: 'admin@example.com', 
  role: 'admin',
  approvalStatus: 'approved'
});
```

#### `createMockClient(overrides?: Partial<Client>): Client`

Creates a client user with addresses, orders, and wishlist arrays.

**Features:**
- Role is automatically set to 'client'
- Generates 1-3 random addresses
- Initializes empty orders and wishlist arrays
- Approval status is 'approved' by default

**Example:**
```typescript
import { createMockClient } from '@/lib/factories/userFactory';

// Create a random client
const client = createMockClient();

// Create a client with specific wishlist
const clientWithWishlist = createMockClient({ 
  wishlist: ['product-1', 'product-2', 'product-3']
});
```

#### `createMockFournisseur(overrides?: Partial<Fournisseur>): Fournisseur`

Creates a supplier user with shop information and approval status.

**Features:**
- Role is automatically set to 'fournisseur'
- Random approval status (pending, approved, or rejected)
- Generates shop name, description, and logo
- Includes rating (3.0-5.0), total sales, and certifications
- Sets approvedBy and approvedAt when not pending
- Sets rejectionReason when rejected

**Example:**
```typescript
import { createMockFournisseur } from '@/lib/factories/userFactory';

// Create a random fournisseur
const fournisseur = createMockFournisseur();

// Create an approved fournisseur
const approvedFournisseur = createMockFournisseur({ 
  approvalStatus: 'approved',
  shopName: 'My Shop',
  rating: 4.8
});

// Create a rejected fournisseur
const rejectedFournisseur = createMockFournisseur({ 
  approvalStatus: 'rejected',
  rejectionReason: 'Incomplete documentation'
});
```

#### `createMockMarketiste(overrides?: Partial<Marketiste>): Marketiste`

Creates an affiliate marketer user with codes and earnings.

**Features:**
- Role is automatically set to 'marketiste'
- Random approval status (pending, approved, or rejected)
- Generates total earnings (0-50,000) and pending earnings (0-5,000)
- Initializes empty codes array
- Sets approvedBy and approvedAt when not pending
- Sets rejectionReason when rejected

**Example:**
```typescript
import { createMockMarketiste } from '@/lib/factories/userFactory';

// Create a random marketiste
const marketiste = createMockMarketiste();

// Create an approved marketiste with specific earnings
const approvedMarketiste = createMockMarketiste({ 
  approvalStatus: 'approved',
  totalEarnings: 25000,
  pendingEarnings: 1500
});
```

#### `createMockAddress(overrides?: Partial<Address>): Address`

Creates a shipping address with all required fields.

**Features:**
- Generates realistic address data (street, city, state, country, postal code)
- Random label: 'Maison', 'Bureau', or 'Autre'
- isDefault is false by default
- Includes full name and phone number

**Example:**
```typescript
import { createMockAddress } from '@/lib/factories/userFactory';

// Create a random address
const address = createMockAddress();

// Create a default home address
const homeAddress = createMockAddress({ 
  label: 'Maison',
  isDefault: true,
  city: 'Paris',
  country: 'France'
});
```

## Usage in Tests

```typescript
import { 
  createMockUser, 
  createMockClient, 
  createMockFournisseur, 
  createMockMarketiste, 
  createMockAddress 
} from '@/lib/factories/userFactory';

describe('User Management', () => {
  it('should approve a pending fournisseur', () => {
    const fournisseur = createMockFournisseur({ approvalStatus: 'pending' });
    
    // Test approval logic
    expect(fournisseur.approvalStatus).toBe('pending');
  });

  it('should create a client with multiple addresses', () => {
    const client = createMockClient();
    
    expect(client.addresses.length).toBeGreaterThan(0);
    expect(client.addresses.length).toBeLessThanOrEqual(3);
  });
});
```

## Usage in Development

```typescript
// Seed database with test data
import { createMockClient, createMockFournisseur } from '@/lib/factories/userFactory';

const clients = Array.from({ length: 20 }, () => createMockClient());
const fournisseurs = Array.from({ length: 10 }, () => createMockFournisseur());

// Save to Firebase
clients.forEach(client => saveToFirebase('users', client));
fournisseurs.forEach(fournisseur => saveToFirebase('users', fournisseur));
```

## Notes

- All factories use `@faker-js/faker` for generating realistic data
- Dates are generated as JavaScript Date objects
- IDs are UUIDs
- All functions support partial overrides for customization
- French labels are used for addresses ('Maison', 'Bureau', 'Autre')


### Product Factories

#### `createMockProduct(overrides?: Partial<Product>): Product`

Creates a product with realistic test data including price tiers, images, and metadata.

**Features:**
- Generates realistic product names and descriptions
- Creates 2-4 price tiers with volume discounts
- Random category and subcategory
- 3-6 product images
- Optional video URL
- 3-8 product tags
- Random MOQ (1-100)
- Stock levels (0-10,000)
- Rating (3.0-5.0) and review count
- Random certifications (CE, ISO 9001, RoHS, FDA, FCC, UL)
- Delivery time estimates
- 90% probability of being active

**Example:**
```typescript
import { createMockProduct } from '@/lib/factories/productFactory';

// Create a random product
const product = createMockProduct();

// Create a product in a specific category
const electronics = createMockProduct({ 
  category: 'Electronics',
  subcategory: 'Smartphones',
  stock: 500
});

// Create an out-of-stock product
const outOfStock = createMockProduct({ 
  stock: 0,
  isActive: false
});
```

#### `createMockPriceTier(overrides?: Partial<PriceTier>): PriceTier`

Creates a single price tier for volume pricing.

**Features:**
- Random quantity ranges
- Realistic pricing (5-1000)
- Multiple currency support (USD, EUR, GBP, XOF, XAF)

**Example:**
```typescript
import { createMockPriceTier } from '@/lib/factories/productFactory';

// Create a random price tier
const tier = createMockPriceTier();

// Create a specific tier
const bulkTier = createMockPriceTier({ 
  minQuantity: 100,
  maxQuantity: 500,
  price: 25.99,
  currency: 'USD'
});
```

### Order Factories

#### `createMockOrder(overrides?: Partial<Order>): Order`

Creates a complete order with products, pricing, and shipping information.

**Features:**
- Generates 1-5 products per order
- Calculates subtotal, fees, and total automatically
- 30% probability of having a marketing code
- Random order status and payment status
- Includes shipping address
- Tracking number for shipped/delivered orders
- Proper date sequencing (created → paid → shipped → delivered)
- Multiple currency support

**Example:**
```typescript
import { createMockOrder } from '@/lib/factories/orderFactory';

// Create a random order
const order = createMockOrder();

// Create a delivered order
const delivered = createMockOrder({ 
  status: 'delivered',
  paymentStatus: 'paid'
});

// Create an order with marketing code
const withCode = createMockOrder({ 
  marketisteId: 'marketiste-123',
  marketingCode: 'SUMMER2024'
});
```

#### `createMockOrderProduct(overrides?: Partial<OrderProduct>): OrderProduct`

Creates a single product item within an order.

**Features:**
- Random product name and image
- Quantity (1-100)
- Price (5-500)

**Example:**
```typescript
import { createMockOrderProduct } from '@/lib/factories/orderFactory';

// Create a random order product
const product = createMockOrderProduct();

// Create a specific order product
const customProduct = createMockOrderProduct({ 
  name: 'iPhone 15 Pro',
  quantity: 2,
  price: 999.99
});
```

### Marketing Code Factories

#### `createMockMarketingCode(overrides?: Partial<MarketingCode>): MarketingCode`

Creates a marketing/promotional code with commission settings.

**Features:**
- Generates realistic code names (e.g., SUMMER2024, WELCOME10, FLASH50)
- Commission rate (5%-20%)
- Valid date ranges
- 70% probability of having an end date
- 80% probability of being active
- Optional linked products or fournisseurs
- Usage count (0-500)
- Total earnings tracking

**Example:**
```typescript
import { createMockMarketingCode } from '@/lib/factories/marketingCodeFactory';

// Create a random marketing code
const code = createMockMarketingCode();

// Create a specific promotional code
const summerSale = createMockMarketingCode({ 
  code: 'SUMMER2024',
  commissionRate: 0.15,
  isActive: true,
  validFrom: new Date('2024-06-01'),
  validUntil: new Date('2024-08-31')
});

// Create a code linked to specific products
const productCode = createMockMarketingCode({ 
  linkedProducts: ['product-1', 'product-2', 'product-3']
});
```

### Review Factories

#### `createMockReview(overrides?: Partial<Review>): Review`

Creates a product review with rating, comment, and optional images/response.

**Features:**
- Rating (1-5 stars)
- Contextual comments based on rating:
  - 4-5 stars: Positive comments
  - 3 stars: Neutral comments
  - 1-2 stars: Negative comments
- 60% probability of extended comment
- 30% probability of review images (1-4 images)
- 40% probability of fournisseur response
- Proper date sequencing (review created before response)

**Example:**
```typescript
import { createMockReview } from '@/lib/factories/reviewFactory';

// Create a random review
const review = createMockReview();

// Create a 5-star review
const excellent = createMockReview({ 
  rating: 5,
  comment: 'Absolutely perfect! Exceeded all expectations.'
});

// Create a review with images
const withImages = createMockReview({ 
  rating: 4,
  images: ['image1.jpg', 'image2.jpg']
});

// Create a review with fournisseur response
const withResponse = createMockReview({ 
  rating: 3,
  response: {
    content: 'Thank you for your feedback. We will improve!',
    createdAt: new Date()
  }
});
```

## Usage in Tests

```typescript
import { 
  createMockProduct,
  createMockOrder,
  createMockMarketingCode,
  createMockReview
} from '@/lib/factories';

describe('Product Management', () => {
  it('should create a product with price tiers', () => {
    const product = createMockProduct();
    
    expect(product.prices.length).toBeGreaterThan(0);
    expect(product.prices[0].minQuantity).toBeLessThan(product.prices[1].minQuantity);
  });

  it('should calculate order totals correctly', () => {
    const order = createMockOrder();
    
    expect(order.total).toBeGreaterThan(order.subtotal);
  });

  it('should generate valid marketing codes', () => {
    const code = createMockMarketingCode();
    
    expect(code.code).toBe(code.code.toUpperCase());
    expect(code.commissionRate).toBeGreaterThan(0);
    expect(code.commissionRate).toBeLessThanOrEqual(1);
  });
});
```

## Usage in Development

```typescript
// Seed database with test data
import { 
  createMockProduct,
  createMockOrder,
  createMockMarketingCode,
  createMockReview
} from '@/lib/factories';

// Generate products
const products = Array.from({ length: 50 }, () => createMockProduct());

// Generate orders
const orders = Array.from({ length: 100 }, () => createMockOrder());

// Generate marketing codes
const codes = Array.from({ length: 20 }, () => createMockMarketingCode());

// Generate reviews
const reviews = Array.from({ length: 200 }, () => createMockReview());

// Save to Firebase
products.forEach(product => saveToFirebase('products', product));
orders.forEach(order => saveToFirebase('orders', order));
codes.forEach(code => saveToFirebase('marketingCodes', code));
reviews.forEach(review => saveToFirebase('reviews', review));
```

## Verification

To verify all factories are working correctly, run:

```bash
npx tsx lib/factories/verify-new-factories.ts
```

This will create sample instances of all factory types and display their properties.


## Seed Data Generator

### `generateSeedData(): SeedData`

Generates a complete set of realistic test data with proper relationships between all entities.

**Returns:**
```typescript
interface SeedData {
  clients: Client[];           // 20 clients
  fournisseurs: Fournisseur[]; // 10 fournisseurs (7 approved, 2 pending, 1 rejected)
  marketistes: Marketiste[];   // 5 marketistes (3 approved, 1 pending, 1 rejected)
  products: Product[];         // 50 products
  orders: Order[];             // 100 orders
  marketingCodes: MarketingCode[]; // 20 marketing codes
  reviews: Review[];           // ~24 reviews (varies)
}
```

**Features:**
- **Realistic Relationships**: All data is properly linked
  - Products are only linked to approved fournisseurs
  - Marketing codes are only linked to approved marketistes
  - Orders reference valid clients, fournisseurs, and products
  - Reviews are only for delivered orders
- **Varied Approval Statuses**: Fournisseurs and marketistes have mixed approval states
- **Realistic Order Flow**: Orders have proper status distribution and date sequencing
- **Marketing Code Usage**: ~30% of orders use marketing codes
- **Review Generation**: ~80% of delivered orders get reviews

**Example:**
```typescript
import { generateSeedData } from '@/lib/factories';

const seedData = generateSeedData();

// Access generated data
console.log(`Generated ${seedData.clients.length} clients`);
console.log(`Generated ${seedData.products.length} products`);
console.log(`Generated ${seedData.orders.length} orders`);

// Filter data
const approvedFournisseurs = seedData.fournisseurs.filter(f => f.approvalStatus === 'approved');
const deliveredOrders = seedData.orders.filter(o => o.status === 'delivered');
const ordersWithCodes = seedData.orders.filter(o => o.marketingCode);

// Calculate statistics
const totalRevenue = seedData.orders
  .filter(o => o.status === 'delivered')
  .reduce((sum, o) => sum + o.total, 0);
```

### `generateAndLogSeedData(): SeedData`

Same as `generateSeedData()` but logs detailed statistics to the console.

**Example:**
```typescript
import { generateAndLogSeedData } from '@/lib/factories';

// Generates data and logs statistics
const seedData = generateAndLogSeedData();

// Output:
// === Seed Data Generated ===
// Clients: 20
// Fournisseurs: 10
//   - Approved: 7
//   - Pending: 2
//   - Rejected: 1
// Marketistes: 5
//   - Approved: 3
//   - Pending: 1
//   - Rejected: 1
// Products: 50
// Orders: 100
//   - Pending: 10
//   - Paid: 10
//   - Processing: 20
//   - Shipped: 30
//   - Delivered: 20
//   - Cancelled: 10
//   - With Marketing Codes: 30
// Marketing Codes: 20
// Reviews: 24
// ===========================
```

## Data Relationships

The seed data generator ensures the following relationships:

1. **Products → Fournisseurs**
   - All 50 products are distributed among the 7 approved fournisseurs
   - No products are linked to pending or rejected fournisseurs

2. **Marketing Codes → Marketistes**
   - All 20 marketing codes are distributed among the 3 approved marketistes
   - No codes are linked to pending or rejected marketistes

3. **Orders → Clients & Fournisseurs**
   - All 100 orders link clients with approved fournisseur products
   - Each order contains 1-3 products from the same fournisseur

4. **Orders → Marketing Codes**
   - ~30% of orders use marketing codes
   - Codes are validated against linked products/fournisseurs

5. **Reviews → Orders**
   - Reviews are only created for delivered orders
   - ~80% of delivered orders receive reviews
   - ~70% of products in each order are reviewed
   - Reviews are created 0-7 days after delivery

## Data Characteristics

### Approval Status Distribution

- **Fournisseurs**: 70% approved, 20% pending, 10% rejected
- **Marketistes**: 60% approved, 20% pending, 20% rejected
- **Clients**: 100% approved (automatic)

### Order Status Distribution

- Pending: 10%
- Paid: 10%
- Processing: 20%
- Shipped: 30%
- Delivered: 20%
- Cancelled: 10%

### Marketing Code Usage

- ~30% of orders use marketing codes
- Some codes are linked to specific products or fournisseurs
- Commission rates range from 5% to 20%

### Reviews

- ~80% of delivered orders receive reviews
- ~70% of products in each order are reviewed
- Reviews are created 0-7 days after delivery
- Ratings are distributed realistically (more positive reviews)

## Verification

To verify the seed data generator is working correctly, run:

```bash
npx tsx lib/factories/verify-seed-data.ts
```

This will:
- Generate a complete set of seed data
- Verify entity counts
- Check data relationships
- Validate calculations
- Display sample data

## Example Usage

See `example-usage.ts` for more examples:

```bash
npx tsx lib/factories/example-usage.ts
```

## Usage in Development

```typescript
import { generateSeedData } from '@/lib/factories';
import { saveToFirebase } from '@/lib/firebase';

// Generate complete seed data
const seedData = generateSeedData();

// Save to Firebase
await Promise.all([
  ...seedData.clients.map(client => saveToFirebase('users', client)),
  ...seedData.fournisseurs.map(f => saveToFirebase('users', f)),
  ...seedData.marketistes.map(m => saveToFirebase('users', m)),
  ...seedData.products.map(p => saveToFirebase('products', p)),
  ...seedData.orders.map(o => saveToFirebase('orders', o)),
  ...seedData.marketingCodes.map(c => saveToFirebase('marketingCodes', c)),
  ...seedData.reviews.map(r => saveToFirebase('reviews', r))
]);

console.log('Seed data saved to Firebase!');
```

## Notes

- All generated data is deterministic based on faker's seed
- IDs are UUIDs generated by faker
- Dates are realistic and follow proper order (created → paid → shipped → delivered)
- Calculations (subtotals, fees, totals) are accurate
- All relationships are valid and consistent
- The seed data is designed to test all aspects of the e-commerce platform
