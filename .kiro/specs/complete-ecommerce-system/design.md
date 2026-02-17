# Design Document: Complete E-commerce System

## Overview

This design document specifies the technical implementation for completing an Alibaba-clone e-commerce platform. The system extends an existing Next.js 16 + TypeScript + Firebase application with four user roles: Client, Fournisseur, Marketiste, and Admin.

### Key Design Goals

1. **Extend, Don't Replace**: Build upon existing authentication, routing, and data structures
2. **Role-Based Access Control**: Implement approval workflows for fournisseurs and marketistes
3. **Comprehensive Dashboards**: Provide role-specific interfaces for all user types
4. **Production-Ready**: Include proper error handling, loading states, and validation
5. **Maintainable**: Use reusable components and consistent patterns

### Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v3.4.1 (downgraded from v4 beta)
- **State Management**: Zustand (existing stores: authStore, cartStore, chatStore)
- **Backend**: Firebase (Firestore, Authentication)
- **UI Components**: lucide-react (icons), react-hot-toast (notifications)
- **Date Handling**: date-fns (French locale)

## Architecture

### System Architecture

The application follows a client-server architecture with Firebase as the backend:

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │  Middleware │  │   Pages    │  │   Components           │ │
│  │  (Auth +   │→ │  (App      │→ │   - Dashboards         │ │
│  │  Approval) │  │   Router)  │  │   - Forms              │ │
│  └────────────┘  └────────────┘  │   - UI Elements        │ │
│                                   └────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Zustand Stores                             │ │
│  │  - authStore  - cartStore  - chatStore                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Firestore DB │  │ Authentication│  │  Storage         │  │
│  │ - users      │  │ - Email/Pass  │  │  - Images        │  │
│  │ - products   │  │ - Custom      │  │  - Files         │  │
│  │ - orders     │  │   Claims      │  │                  │  │
│  │ - messages   │  │               │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```


### Approval Workflow Architecture

```
User Registration (Fournisseur/Marketiste)
           ↓
    approvalStatus = 'pending'
           ↓
    Dashboard Access → Show Waiting Banner
           ↓
    Admin Reviews → Approve/Reject
           ↓
    ┌──────────────┴──────────────┐
    ↓                             ↓
approved                      rejected
    ↓                             ↓
Full Access              Show Rejection Message
```

### Route Protection Strategy

1. **Middleware Layer**: Check authentication and approval status
2. **ProtectedRoute Component**: Verify role-based access
3. **Component-Level Checks**: Disable features based on approval status
4. **Firebase Security Rules**: Enforce data access permissions

## Components and Interfaces

### Extended Type Definitions

Extend existing types in `types/index.ts`:

```typescript
// Approval status type
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// Extended User interface
export interface User {
  // ... existing fields
  approvalStatus: ApprovalStatus;
  approvedBy?: string;  // Admin user ID
  approvedAt?: Date;
  rejectionReason?: string;
}

// Payout request type
export interface PayoutRequest {
  id: string;
  marketisteId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
}

// Analytics types
export interface RevenueData {
  month: string;
  revenue: number;
  orderCount: number;
}

export interface TopFournisseur {
  id: string;
  name: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}
```


### Firebase Function Interfaces

Create new file `lib/firebase/users.ts`:

```typescript
// User management functions
export async function getPendingUsers(role?: UserRole): Promise<User[]>
export async function approveUser(userId: string, adminId: string): Promise<void>
export async function rejectUser(userId: string, adminId: string, reason: string): Promise<void>
export async function updateUserStatus(userId: string, isActive: boolean): Promise<void>
export async function getAllUsers(filters?: UserFilters): Promise<User[]>
export async function getUserById(userId: string): Promise<User | null>

interface UserFilters {
  role?: UserRole;
  approvalStatus?: ApprovalStatus;
  isActive?: boolean;
}
```

Extend `lib/firebase/orders.ts`:

```typescript
// Add to existing functions
export async function getAllOrders(filters?: OrderFilters): Promise<Order[]>
export async function cancelOrder(orderId: string, reason: string): Promise<void>
export async function refundOrder(orderId: string, refundAmount: number): Promise<void>
export async function exportOrdersToCSV(orders: Order[]): string

interface OrderFilters {
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  fournisseurId?: string;
  clientId?: string;
}
```

Create new file `lib/firebase/products.ts`:

```typescript
export async function createProduct(productData: Omit<Product, 'id'>): Promise<string>
export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void>
export async function deleteProduct(productId: string): Promise<void>
export async function getProductsByFournisseur(fournisseurId: string): Promise<Product[]>
export async function getAllProducts(filters?: ProductFilters): Promise<Product[]>
export async function updateProductStock(productId: string, stock: number): Promise<void>

interface ProductFilters {
  fournisseurId?: string;
  isActive?: boolean;
  category?: string;
}
```

Create new file `lib/firebase/marketingCodes.ts`:

```typescript
export async function createMarketingCode(codeData: Omit<MarketingCode, 'id'>): Promise<string>
export async function updateMarketingCode(codeId: string, updates: Partial<MarketingCode>): Promise<void>
export async function deactivateMarketingCode(codeId: string): Promise<void>
export async function getMarketisteCodes(marketisteId: string): Promise<MarketingCode[]>
export async function validateMarketingCode(code: string): Promise<MarketingCode | null>
export async function incrementCodeUsage(codeId: string, orderTotal: number, commissionRate: number): Promise<void>
```

Create new file `lib/firebase/addresses.ts`:

```typescript
export async function createAddress(clientId: string, address: Omit<Address, 'id'>): Promise<string>
export async function updateAddress(clientId: string, addressId: string, updates: Partial<Address>): Promise<void>
export async function deleteAddress(clientId: string, addressId: string): Promise<void>
export async function setDefaultAddress(clientId: string, addressId: string): Promise<void>
export async function getClientAddresses(clientId: string): Promise<Address[]>
```

Create new file `lib/firebase/reviews.ts`:

```typescript
export async function createReview(reviewData: Omit<Review, 'id'>): Promise<string>
export async function updateReview(reviewId: string, updates: Partial<Review>): Promise<void>
export async function getProductReviews(productId: string): Promise<Review[]>
export async function getClientReviews(clientId: string): Promise<Review[]>
export async function addReviewResponse(reviewId: string, response: string): Promise<void>
```

Create new file `lib/firebase/wishlist.ts`:

```typescript
export async function addToWishlist(clientId: string, productId: string): Promise<void>
export async function removeFromWishlist(clientId: string, productId: string): Promise<void>
export async function getWishlistProducts(clientId: string): Promise<Product[]>
```

Create new file `lib/firebase/notifications.ts`:

```typescript
export async function createNotification(notificationData: Omit<Notification, 'id'>): Promise<string>
export async function getUserNotifications(userId: string): Promise<Notification[]>
export async function markNotificationAsRead(notificationId: string): Promise<void>
export async function markAllNotificationsAsRead(userId: string): Promise<void>
```


### Reusable Component Interfaces

Create `components/ui/` directory with the following components:

**OrderCard.tsx**
```typescript
interface OrderCardProps {
  order: Order;
  onViewDetails: (orderId: string) => void;
  showFournisseur?: boolean;
  showClient?: boolean;
}
```

**OrderDetailsModal.tsx**
```typescript
interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onUpdateStatus?: (status: OrderStatus) => void;
}
```

**UserApprovalCard.tsx**
```typescript
interface UserApprovalCardProps {
  user: User;
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
}
```

**StatusBadge.tsx**
```typescript
interface StatusBadgeProps {
  status: OrderStatus | ApprovalStatus | PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
}
```

**DataTable.tsx**
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (field: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}
```

**StatsCard.tsx**
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
```

**ApprovalStatusBanner.tsx**
```typescript
interface ApprovalStatusBannerProps {
  status: ApprovalStatus;
  rejectionReason?: string;
  userRole: 'fournisseur' | 'marketiste';
}
```


## Data Models

### User Model Extensions

The existing User interface will be extended with approval fields:

```typescript
interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isActive: boolean;
  
  // NEW: Approval fields
  approvalStatus: ApprovalStatus;  // 'pending' | 'approved' | 'rejected'
  approvedBy?: string;             // Admin user ID
  approvedAt?: Date;               // Timestamp of approval/rejection
  rejectionReason?: string;        // Reason if rejected
}
```

**Approval Status Logic:**
- Client and Admin: `approvalStatus = 'approved'` by default
- Fournisseur and Marketiste: `approvalStatus = 'pending'` on registration
- Only approved fournisseurs can add products
- Only approved marketistes can create marketing codes

### Firestore Collections Structure

**users** (existing, extended)
```
/users/{userId}
  - All User fields including approval fields
```

**products** (existing)
```
/products/{productId}
  - All Product fields
```

**orders** (existing)
```
/orders/{orderId}
  - All Order fields
```

**marketingCodes** (existing)
```
/marketingCodes/{codeId}
  - All MarketingCode fields
```

**reviews** (existing)
```
/reviews/{reviewId}
  - All Review fields
```

**notifications** (existing)
```
/notifications/{notificationId}
  - All Notification fields
```

**payoutRequests** (NEW)
```
/payoutRequests/{requestId}
  - id: string
  - marketisteId: string
  - amount: number
  - currency: string
  - status: 'pending' | 'approved' | 'rejected' | 'paid'
  - requestedAt: Date
  - processedAt?: Date
  - processedBy?: string (admin ID)
  - notes?: string
```

### Firestore Indexes Required

```javascript
// Composite indexes for efficient queries
orders: [
  ['fournisseurId', 'createdAt'],
  ['clientId', 'createdAt'],
  ['marketisteId', 'createdAt'],
  ['status', 'createdAt'],
  ['fournisseurId', 'status', 'createdAt']
]

users: [
  ['role', 'approvalStatus'],
  ['approvalStatus', 'createdAt']
]

products: [
  ['fournisseurId', 'isActive'],
  ['category', 'isActive']
]

notifications: [
  ['userId', 'createdAt'],
  ['userId', 'isRead', 'createdAt']
]

reviews: [
  ['productId', 'createdAt'],
  ['clientId', 'createdAt']
]
```


### Dashboard Route Structure

```
/dashboard
  - General dashboard (redirects based on role)

/dashboard/admin
  - /dashboard/admin (overview)
  - /dashboard/admin/users (user management)
  - /dashboard/admin/orders (order management)
  - /dashboard/admin/products (product management)
  - /dashboard/admin/analytics (analytics dashboard)

/dashboard/client
  - /dashboard/client (overview)
  - /dashboard/client/orders (my orders)
  - /dashboard/client/wishlist (my wishlist)
  - /dashboard/client/addresses (my addresses)
  - /dashboard/client/reviews (my reviews)
  - /dashboard/client/settings (account settings)

/dashboard/fournisseur (existing, enhanced)
  - /dashboard/fournisseur (overview)
  - /dashboard/fournisseur/products (product management)
  - /dashboard/fournisseur/orders (order management)
  - /dashboard/fournisseur/messages (customer messages)
  - /dashboard/fournisseur/analytics (analytics)

/dashboard/marketiste
  - /dashboard/marketiste (overview)
  - /dashboard/marketiste/codes (marketing codes)
  - /dashboard/marketiste/earnings (earnings management)
  - /dashboard/marketiste/orders (orders with codes)
  - /dashboard/marketiste/analytics (analytics)

/approval-pending
  - Waiting page for pending users

/approval-rejected
  - Rejection page with reason
```

### Middleware Enhancement

Update `middleware.ts` to check approval status:

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get user from session/cookie (implementation depends on auth setup)
  const user = getUserFromRequest(request);
  
  // Check if route requires approval
  const requiresApproval = 
    pathname.startsWith('/dashboard/fournisseur') ||
    pathname.startsWith('/dashboard/marketiste');
  
  if (requiresApproval && user) {
    // Check approval status
    if (user.approvalStatus === 'pending') {
      return NextResponse.redirect(new URL('/approval-pending', request.url));
    }
    
    if (user.approvalStatus === 'rejected') {
      return NextResponse.redirect(new URL('/approval-rejected', request.url));
    }
  }
  
  return NextResponse.next();
}
```

**Note**: Since Firebase Authentication doesn't support server-side session validation in middleware easily, we'll implement approval checks primarily in the ProtectedRoute component and dashboard pages. The middleware will handle basic route protection.


### Notification System Design

When order status changes, create notifications for relevant parties:

```typescript
async function notifyOrderStatusChange(
  order: Order,
  newStatus: OrderStatus
): Promise<void> {
  const notifications: Omit<Notification, 'id'>[] = [];
  
  // Notify client for all status changes
  notifications.push({
    userId: order.clientId,
    type: `order_${newStatus}` as NotificationType,
    title: getNotificationTitle(newStatus, 'client'),
    message: getNotificationMessage(order, newStatus, 'client'),
    data: { orderId: order.id },
    isRead: false,
    createdAt: new Date()
  });
  
  // Notify fournisseur for paid, cancelled, refunded
  if (['paid', 'cancelled', 'refunded'].includes(newStatus)) {
    notifications.push({
      userId: order.fournisseurId,
      type: `order_${newStatus}` as NotificationType,
      title: getNotificationTitle(newStatus, 'fournisseur'),
      message: getNotificationMessage(order, newStatus, 'fournisseur'),
      data: { orderId: order.id },
      isRead: false,
      createdAt: new Date()
    });
  }
  
  // Notify marketiste for paid and delivered (commission events)
  if (order.marketisteId && ['paid', 'delivered'].includes(newStatus)) {
    notifications.push({
      userId: order.marketisteId,
      type: 'code_used',
      title: getNotificationTitle(newStatus, 'marketiste'),
      message: getNotificationMessage(order, newStatus, 'marketiste'),
      data: { orderId: order.id, commission: order.marketingCommission },
      isRead: false,
      createdAt: new Date()
    });
  }
  
  // Create all notifications
  await Promise.all(
    notifications.map(notif => createNotification(notif))
  );
}
```

### CSV Export Utility

```typescript
function exportOrdersToCSV(orders: Order[]): string {
  const headers = [
    'Order Number',
    'Date',
    'Client Email',
    'Fournisseur',
    'Status',
    'Payment Status',
    'Subtotal',
    'Shipping',
    'Total',
    'Currency'
  ];
  
  const rows = orders.map(order => [
    order.orderNumber,
    order.createdAt.toISOString(),
    order.clientId, // Would need to join with user data
    order.fournisseurId,
    order.status,
    order.paymentStatus,
    order.subtotal.toString(),
    order.shippingFee.toString(),
    order.total.toString(),
    order.currency
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User Registration Default Approval Status

*For any* user registration, if the user role is 'fournisseur' or 'marketiste', then approvalStatus should be set to 'pending', and if the role is 'client' or 'admin', then approvalStatus should be set to 'approved'.

**Validates: Requirements 2.5, 2.6**

### Property 2: Non-Approved User Action Prevention

*For any* user with approvalStatus 'pending' or 'rejected', when that user attempts to perform role-specific actions (fournisseur adding products, marketiste creating codes), the system should prevent the action and display their approval status.

**Validates: Requirements 3.3, 4.3, 17.6, 22.7**

### Property 3: List Filtering Correctness

*For any* collection (users, orders, products) and any filter criteria (role, status, date range, fournisseur), all items in the filtered result should match the filter criteria, and all items matching the criteria should be in the result.

**Validates: Requirements 6.2, 6.3, 7.2, 7.3, 7.4, 8.2, 8.3, 11.2, 19.3, 21.2**

### Property 4: User Approval State Transition

*For any* pending user, when an admin approves the user, the approvalStatus should change to 'approved', approvedBy should be set to the admin ID, approvedAt should be set to the current timestamp, and a notification should be created for the user.

**Validates: Requirements 6.4, 6.9**

### Property 5: User Rejection State Transition

*For any* pending user, when an admin rejects the user with a reason, the approvalStatus should change to 'rejected', approvedBy should be set to the admin ID, approvedAt should be set to the current timestamp, rejectionReason should be stored, and a notification should be created for the user.

**Validates: Requirements 6.5, 6.9**

### Property 6: Entity Activation Toggle

*For any* entity (user, product) with an isActive field, when an admin toggles the activation status, the isActive field should be set to the opposite of its current value.

**Validates: Requirements 6.7, 6.8, 8.4, 8.5**

### Property 7: Complete Data Display

*For any* list view (users, orders, products, addresses, reviews, codes), all items belonging to the viewing user (or all items for admin) should be displayed with their required fields.

**Validates: Requirements 6.1, 7.1, 8.1, 12.1, 13.1, 14.1, 17.2, 21.1, 22.2, 23.1**

### Property 8: Order Status Change Notifications

*For any* order status change, the system should create notifications for all relevant parties: always notify the client, notify the fournisseur for 'paid', 'cancelled', and 'refunded' statuses, and notify the marketiste (if applicable) for 'paid' and 'delivered' statuses.

**Validates: Requirements 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7**

### Property 9: Order Refund State Transition

*For any* order, when an admin processes a refund, the order status should change to 'refunded', the payment status should change to 'refunded', and notifications should be sent to the client and fournisseur.

**Validates: Requirements 7.7**

### Property 10: CSV Export Completeness

*For any* collection export (orders, users, products), the generated CSV should contain all items from the collection with all specified fields, and dates should be formatted in ISO 8601 format.

**Validates: Requirements 7.8, 34.1, 34.2, 34.3, 34.4**

### Property 11: Statistics Calculation Accuracy

*For any* dashboard statistics (admin overview, client overview, fournisseur overview, marketiste overview), the displayed statistics should match the actual count/sum/average calculated from the underlying Firebase collections.

**Validates: Requirements 5.5, 7.9, 9.5, 10.1, 10.2, 10.3, 10.4, 16.5, 20.4**

### Property 12: Order Sorting Consistency

*For any* order list, when sorted by creation date descending, each order should have a creation date less than or equal to the previous order in the list.

**Validates: Requirements 11.1**

### Property 13: Wishlist State Transitions

*For any* client and product, adding a product to the wishlist should include the product ID in the client's wishlist array, and removing it should exclude the product ID, with no duplicates allowed.

**Validates: Requirements 12.2, 12.3, 33.1, 33.2, 33.4**

### Property 14: Address Default Invariant

*For any* client with multiple addresses, exactly one address should have isDefault set to true, and when setting a new default address, all other addresses should have isDefault set to false.

**Validates: Requirements 13.5, 13.6**

### Property 15: Address CRUD Operations

*For any* client, creating an address should add it to the addresses array, updating an address should modify the correct address in the array, and deleting an address should remove it from the array.

**Validates: Requirements 13.2, 13.3, 13.4, 31.1, 31.2, 31.3**

### Property 16: Review Creation Constraints

*For any* review creation attempt, the system should only allow the review if the client has a delivered order containing the product, and should only allow one review per product per order.

**Validates: Requirements 14.4, 14.5**

### Property 17: Review Creation Side Effects

*For any* review creation, the system should save the review to Firebase and update the product's rating and reviewCount fields based on all reviews for that product.

**Validates: Requirements 11.6, 32.1, 32.6**

### Property 18: Email Validation

*For any* email input, the system should validate that the email matches a valid email format (contains @ and domain) before accepting it.

**Validates: Requirements 15.4**

### Property 19: Password Change Security

*For any* password change attempt, the system should require verification of the current password before allowing the new password to be set.

**Validates: Requirements 15.5**

### Property 20: Marketing Code Uniqueness

*For any* marketing code creation, the system should validate that the code string is unique across all marketing codes before saving it to Firebase.

**Validates: Requirements 17.1**

### Property 21: Marketiste Earnings Calculation

*For any* marketiste, pending earnings should equal the sum of marketingCommission from all orders with their codes where status is 'paid' or 'processing', and paid earnings should equal the sum where status is 'delivered'.

**Validates: Requirements 18.5, 18.6**

### Property 22: Fournisseur Order Authorization

*For any* order update attempt by a fournisseur, the system should only allow the update if the order contains products belonging to that fournisseur.

**Validates: Requirements 21.7**

### Property 23: Product Soft Delete

*For any* product deletion, the system should set isActive to false rather than removing the document from Firebase, preserving the product data.

**Validates: Requirements 22.4**

### Property 24: Shipped Order Tracking Requirement

*For any* order status update to 'shipped', the system should require a non-empty tracking number to be provided.

**Validates: Requirements 21.4**

### Property 25: Message Conversation Sorting

*For any* conversation list, when sorted by last message date, each conversation should have a lastMessageAt timestamp less than or equal to the previous conversation in the list.

**Validates: Requirements 23.1**

### Property 26: Input Validation

*For any* user input (form fields, query parameters), the system should validate the input on both client and server side before processing, rejecting invalid inputs with appropriate error messages.

**Validates: Requirements 35.1, 35.2, 40.1**

### Property 27: Error Message Display

*For any* error condition (Firebase operation failure, validation failure, authorization failure, network error), the system should display a user-friendly error message in French using react-hot-toast.

**Validates: Requirements 35.1, 35.2, 35.3, 35.4**


## Error Handling

### Error Categories

1. **Firebase Errors**: Database operations, authentication failures
2. **Validation Errors**: Invalid user input, constraint violations
3. **Authorization Errors**: Insufficient permissions, approval status issues
4. **Network Errors**: Connection failures, timeouts

### Error Handling Strategy

**Client-Side Error Handling:**

```typescript
// Centralized error handler
export function handleError(error: any, context: string): void {
  console.error(`Error in ${context}:`, error);
  
  // Firebase errors
  if (error.code?.startsWith('auth/')) {
    toast.error(getAuthErrorMessage(error.code));
    return;
  }
  
  if (error.code?.startsWith('firestore/')) {
    toast.error(getFirestoreErrorMessage(error.code));
    return;
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    toast.error(error.message);
    return;
  }
  
  // Authorization errors
  if (error.name === 'AuthorizationError') {
    toast.error('Vous n\'avez pas la permission d\'effectuer cette action');
    return;
  }
  
  // Network errors
  if (error.message?.includes('network')) {
    toast.error('Erreur de connexion. Veuillez réessayer.', {
      action: {
        label: 'Réessayer',
        onClick: () => window.location.reload()
      }
    });
    return;
  }
  
  // Generic error
  toast.error('Une erreur est survenue. Veuillez réessayer.');
}

// Firebase Auth error messages in French
function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'Utilisateur non trouvé',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/weak-password': 'Le mot de passe est trop faible',
    'auth/invalid-email': 'Email invalide',
    'auth/requires-recent-login': 'Veuillez vous reconnecter pour effectuer cette action'
  };
  return messages[code] || 'Erreur d\'authentification';
}

// Firestore error messages in French
function getFirestoreErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'firestore/permission-denied': 'Permission refusée',
    'firestore/not-found': 'Document non trouvé',
    'firestore/already-exists': 'Le document existe déjà',
    'firestore/unavailable': 'Service temporairement indisponible'
  };
  return messages[code] || 'Erreur de base de données';
}
```

**Form Validation:**

```typescript
// Validation utilities
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email requis';
  if (!emailRegex.test(email)) return 'Format d\'email invalide';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Mot de passe requis';
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
  if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule';
  if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre';
  return null;
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} est requis`;
  }
  return null;
}
```

**Try-Catch Patterns:**

```typescript
// Async operation wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleError(error, context);
    return null;
  }
}

// Usage example
const result = await withErrorHandling(
  () => createProduct(productData),
  'Product Creation'
);

if (result) {
  toast.success('Produit créé avec succès');
  router.push('/dashboard/fournisseur/products');
}
```

### Loading State Management

```typescript
// Loading state hook
export function useAsyncOperation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  const execute = async (operation: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, error, data, execute };
}
```


## Testing Strategy

### Dual Testing Approach

The system will use both unit testing and property-based testing for comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing Configuration

**Library Selection**: Use **fast-check** for TypeScript/JavaScript property-based testing

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: complete-ecommerce-system, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('User Registration Approval Status', () => {
  it('should set correct default approval status based on role', () => {
    // Feature: complete-ecommerce-system, Property 1: User Registration Default Approval Status
    fc.assert(
      fc.property(
        fc.record({
          email: fc.emailAddress(),
          displayName: fc.string({ minLength: 1, maxLength: 50 }),
          role: fc.constantFrom('client', 'fournisseur', 'marketiste', 'admin')
        }),
        async (userData) => {
          const user = await registerUser(userData);
          
          if (userData.role === 'fournisseur' || userData.role === 'marketiste') {
            expect(user.approvalStatus).toBe('pending');
          } else {
            expect(user.approvalStatus).toBe('approved');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Focus Areas for Unit Tests**:
1. Specific examples demonstrating correct behavior
2. Edge cases (empty inputs, boundary values, special characters)
3. Error conditions (invalid inputs, missing data, authorization failures)
4. Integration points between components
5. UI component rendering with specific props

**Example Unit Test Structure**:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ApprovalStatusBanner', () => {
  it('should display waiting message for pending status', () => {
    render(
      <ApprovalStatusBanner 
        status="pending" 
        userRole="fournisseur" 
      />
    );
    
    expect(screen.getByText(/en attente d'approbation/i)).toBeInTheDocument();
  });
  
  it('should display rejection reason for rejected status', () => {
    render(
      <ApprovalStatusBanner 
        status="rejected" 
        userRole="marketiste"
        rejectionReason="Documents incomplets" 
      />
    );
    
    expect(screen.getByText(/Documents incomplets/i)).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

**Property Tests** (27 properties):
- Property 1: User registration approval status
- Property 2: Non-approved user action prevention
- Property 3: List filtering correctness
- Property 4: User approval state transition
- Property 5: User rejection state transition
- Property 6: Entity activation toggle
- Property 7: Complete data display
- Property 8: Order status change notifications
- Property 9: Order refund state transition
- Property 10: CSV export completeness
- Property 11: Statistics calculation accuracy
- Property 12: Order sorting consistency
- Property 13: Wishlist state transitions
- Property 14: Address default invariant
- Property 15: Address CRUD operations
- Property 16: Review creation constraints
- Property 17: Review creation side effects
- Property 18: Email validation
- Property 19: Password change security
- Property 20: Marketing code uniqueness
- Property 21: Marketiste earnings calculation
- Property 22: Fournisseur order authorization
- Property 23: Product soft delete
- Property 24: Shipped order tracking requirement
- Property 25: Message conversation sorting
- Property 26: Input validation
- Property 27: Error message display

**Unit Tests** (Focus Areas):
- UI Components: 8 components × 3-5 tests each = 24-40 tests
- Firebase Functions: 6 modules × 5-7 tests each = 30-42 tests
- Validation Functions: 10-15 tests
- Error Handling: 10-15 tests
- Edge Cases: 20-30 tests

**Total Estimated Tests**: 100-150 tests (27 property tests + 73-123 unit tests)

### Testing Tools

- **Test Runner**: Vitest (fast, TypeScript-native)
- **Property Testing**: fast-check
- **React Testing**: @testing-library/react
- **Firebase Mocking**: firebase-mock or manual mocks
- **Coverage**: vitest coverage (c8)

### Continuous Integration

Tests should run on:
- Every commit (pre-commit hook)
- Every pull request
- Before deployment

Target coverage: 80% code coverage minimum


## Animation System

### Framer Motion Integration

**Installation:**
```bash
npm install framer-motion
```

**Animation Patterns:**

1. **Page Transitions**
```typescript
// app/template.tsx
'use client';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

2. **Card Animations**
```typescript
// components/ui/AnimatedCard.tsx
export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow p-6"
    >
      {children}
    </motion.div>
  );
}
```

3. **Modal Animations**
```typescript
// components/ui/AnimatedModal.tsx
export function AnimatedModal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

4. **List Item Stagger Animation**
```typescript
// components/ui/AnimatedList.tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export function AnimatedList({ items }: { items: any[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={item}>
          {/* Item content */}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

5. **Button Animations**
```typescript
// components/ui/AnimatedButton.tsx
export function AnimatedButton({ children, onClick, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

6. **Loading Skeleton Animation**
```typescript
// components/ui/SkeletonLoader.tsx
export function SkeletonLoader() {
  return (
    <motion.div
      className="bg-gray-200 rounded"
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
}
```

7. **Notification Toast Animation**
```typescript
// Already using react-hot-toast, but can enhance with Framer Motion
import { Toaster } from 'react-hot-toast';

export function AnimatedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#363636',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
```

### Animation Guidelines

1. **Performance**: Use `transform` and `opacity` for best performance
2. **Duration**: Keep animations between 200-400ms for UI interactions
3. **Easing**: Use spring animations for natural feel
4. **Accessibility**: Respect `prefers-reduced-motion` media query

```typescript
// Respect user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animation = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.3 };
```


## Test Data Factories

### Factory Pattern for Generating Test Data

Create `lib/factories/` directory with factory functions to generate realistic test data.

**Purpose:**
- Generate consistent test data for development
- Populate dashboards with realistic examples
- Support property-based testing with random data
- Enable demo mode for presentations

### User Factories

```typescript
// lib/factories/userFactory.ts
import { faker } from '@faker-js/faker';
import { User, Client, Fournisseur, Marketiste, ApprovalStatus, UserRole } from '@/types';

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
    ...overrides
  };
}

export function createMockClient(overrides?: Partial<Client>): Client {
  return {
    ...createMockUser({ role: 'client' }),
    addresses: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => createMockAddress()),
    orders: [],
    wishlist: [],
    ...overrides
  } as Client;
}

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
```

### Product Factories

```typescript
// lib/factories/productFactory.ts
import { faker } from '@faker-js/faker';
import { Product, PriceTier } from '@/types';

export function createMockProduct(overrides?: Partial<Product>): Product {
  const basePrice = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
  
  return {
    id: faker.string.uuid(),
    fournisseurId: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.image.url()),
    videos: faker.datatype.boolean() ? [faker.internet.url()] : undefined,
    category: faker.commerce.department(),
    subcategory: faker.commerce.product(),
    tags: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.commerce.productAdjective()),
    moq: faker.number.int({ min: 1, max: 100 }),
    prices: createMockPriceTiers(basePrice),
    stock: faker.number.int({ min: 0, max: 10000 }),
    country: faker.location.country(),
    deliveryTime: `${faker.number.int({ min: 3, max: 30 })} jours`,
    certifications: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => faker.company.buzzPhrase()),
    rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 0, max: 500 }),
    views: faker.number.int({ min: 0, max: 10000 }),
    sales: faker.number.int({ min: 0, max: 1000 }),
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: new Date(),
    ...overrides
  };
}

function createMockPriceTiers(basePrice: number): PriceTier[] {
  return [
    { minQuantity: 1, maxQuantity: 49, price: basePrice, currency: 'USD' },
    { minQuantity: 50, maxQuantity: 99, price: basePrice * 0.9, currency: 'USD' },
    { minQuantity: 100, price: basePrice * 0.8, currency: 'USD' }
  ];
}
```

### Order Factories

```typescript
// lib/factories/orderFactory.ts
import { faker } from '@faker-js/faker';
import { Order, OrderProduct, OrderStatus, PaymentStatus } from '@/types';

export function createMockOrder(overrides?: Partial<Order>): Order {
  const products = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => createMockOrderProduct());
  const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const marketingCommission = faker.datatype.boolean() ? subtotal * 0.05 : 0;
  const platformFee = subtotal * 0.03;
  const shippingFee = faker.number.float({ min: 5, max: 50, fractionDigits: 2 });
  const total = subtotal + platformFee + shippingFee - marketingCommission;
  
  const status = faker.helpers.arrayElement([
    'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  ] as OrderStatus[]);
  
  return {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
    clientId: faker.string.uuid(),
    fournisseurId: faker.string.uuid(),
    marketisteId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
    marketingCode: faker.datatype.boolean() ? faker.string.alphanumeric(8).toUpperCase() : undefined,
    products,
    subtotal,
    marketingCommission,
    platformFee,
    shippingFee,
    total,
    currency: 'USD',
    status,
    paymentStatus: status === 'paid' || status === 'processing' || status === 'shipped' || status === 'delivered' 
      ? 'paid' 
      : status === 'refunded' 
      ? 'refunded' 
      : 'pending',
    paymentMethod: faker.helpers.arrayElement(['card', 'paypal', 'bank_transfer']),
    shippingAddress: createMockAddress(),
    trackingNumber: ['shipped', 'delivered'].includes(status) ? faker.string.alphanumeric(12).toUpperCase() : undefined,
    createdAt: faker.date.past(),
    updatedAt: new Date(),
    paidAt: ['paid', 'processing', 'shipped', 'delivered'].includes(status) ? faker.date.recent() : undefined,
    shippedAt: ['shipped', 'delivered'].includes(status) ? faker.date.recent() : undefined,
    deliveredAt: status === 'delivered' ? faker.date.recent() : undefined,
    ...overrides
  };
}

function createMockOrderProduct(): OrderProduct {
  return {
    productId: faker.string.uuid(),
    name: faker.commerce.productName(),
    image: faker.image.url(),
    quantity: faker.number.int({ min: 1, max: 10 }),
    price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 })
  };
}
```

### Marketing Code Factories

```typescript
// lib/factories/marketingCodeFactory.ts
import { faker } from '@faker-js/faker';
import { MarketingCode } from '@/types';

export function createMockMarketingCode(overrides?: Partial<MarketingCode>): MarketingCode {
  return {
    id: faker.string.uuid(),
    code: faker.string.alphanumeric(8).toUpperCase(),
    marketisteId: faker.string.uuid(),
    commissionRate: faker.number.float({ min: 0.03, max: 0.15, fractionDigits: 2 }),
    validFrom: faker.date.past(),
    validUntil: faker.datatype.boolean() ? faker.date.future() : undefined,
    isActive: true,
    linkedProducts: faker.datatype.boolean() 
      ? Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.string.uuid())
      : undefined,
    linkedFournisseurs: faker.datatype.boolean()
      ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.string.uuid())
      : undefined,
    usageCount: faker.number.int({ min: 0, max: 500 }),
    totalEarnings: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    ...overrides
  };
}
```

### Review Factories

```typescript
// lib/factories/reviewFactory.ts
import { faker } from '@faker-js/faker';
import { Review } from '@/types';

export function createMockReview(overrides?: Partial<Review>): Review {
  const hasResponse = faker.datatype.boolean();
  
  return {
    id: faker.string.uuid(),
    productId: faker.string.uuid(),
    clientId: faker.string.uuid(),
    orderId: faker.string.uuid(),
    rating: faker.number.int({ min: 1, max: 5 }),
    comment: faker.lorem.paragraph(),
    images: faker.datatype.boolean() 
      ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.image.url())
      : undefined,
    response: hasResponse ? {
      content: faker.lorem.paragraph(),
      createdAt: faker.date.recent()
    } : undefined,
    createdAt: faker.date.past(),
    ...overrides
  };
}
```

### Factory Installation

```bash
npm install --save-dev @faker-js/faker
```

### Usage in Development

```typescript
// lib/factories/seedData.ts
import { createMockClient, createMockFournisseur, createMockMarketiste } from './userFactory';
import { createMockProduct } from './productFactory';
import { createMockOrder } from './orderFactory';

export function generateSeedData() {
  return {
    clients: Array.from({ length: 20 }, () => createMockClient()),
    fournisseurs: Array.from({ length: 10 }, () => createMockFournisseur()),
    marketistes: Array.from({ length: 5 }, () => createMockMarketiste()),
    products: Array.from({ length: 50 }, () => createMockProduct()),
    orders: Array.from({ length: 100 }, () => createMockOrder())
  };
}

// Use in development dashboard
const mockData = generateSeedData();
```


## Invoice PDF Generation System

### PDF Library Selection

**Library**: Use **jsPDF** with **jspdf-autotable** for professional invoice generation

**Installation:**
```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

### Invoice Data Model

```typescript
// types/index.ts - Add to existing types
export interface Invoice {
  id: string;
  orderId: string;
  orderNumber: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  
  // Client information
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: Address;
  
  // Fournisseur information
  fournisseurId: string;
  fournisseurName: string;
  fournisseurEmail: string;
  fournisseurAddress?: string;
  
  // Order details
  products: OrderProduct[];
  subtotal: number;
  platformFee: number;
  shippingFee: number;
  marketingCommission: number;
  total: number;
  currency: string;
  
  // Payment information
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  
  // Metadata
  createdAt: Date;
  generatedBy: string; // User ID who generated the invoice
}
```


## Multi-Currency System Architecture

### Overview

The system implements a **USD-based storage with real-time conversion** architecture:

1. **Storage Layer**: All prices stored in USD (Firebase)
2. **Conversion Layer**: Real-time exchange rates (API + Cache)
3. **Display Layer**: Prices shown in user's selected currency
4. **Transaction Layer**: Exchange rates locked at order creation

### Currency Data Models

```typescript
// types/index.ts - Add currency types

export type SupportedCurrency = 
  | 'USD'  // US Dollar (base)
  | 'XOF'  // West African CFA Franc
  | 'XAF'  // Central African CFA Franc
  | 'GHS'  // Ghanaian Cedi
  | 'NGN'  // Nigerian Naira
  | 'KES'  // Kenyan Shilling
  | 'TZS'  // Tanzanian Shilling
  | 'UGX'  // Ugandan Shilling
  | 'ZAR'  // South African Rand
  | 'MAD'  // Moroccan Dirham
  | 'EGP'  // Egyptian Pound
  | 'ETB'  // Ethiopian Birr
  | 'GNF'  // Guinean Franc
  | 'RWF'  // Rwandan Franc
  | 'MGA'  // Malagasy Ariary
  | 'MUR'; // Mauritian Rupee

export interface CurrencyInfo {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  flag: string; // Country code for flag emoji
  decimals: number;
}

export interface ExchangeRate {
  baseCurrency: 'USD';
  targetCurrency: SupportedCurrency;
  rate: number;
  timestamp: Date;
  source: string; // API provider name
}

export interface CurrencyPreference {
  userId: string;
  currency: SupportedCurrency;
  autoDetect: boolean; // Auto-detect from IP/location
  updatedAt: Date;
}

// Extend Order interface
export interface Order {
  // ... existing fields
  
  // Currency fields
  displayCurrency: SupportedCurrency; // Currency shown to client
  exchangeRate: number; // Rate at order creation
  displayTotal: number; // Total in display currency
  displaySubtotal: number;
  displayShippingFee: number;
}
```

### Currency Constants

```typescript
// lib/constants/currencies.ts

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: 'US', decimals: 2 },
  XOF: { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: 'SN', decimals: 0 },
  XAF: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: 'CM', decimals: 0 },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: 'GH', decimals: 2 },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: 'NG', decimals: 2 },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: 'KE', decimals: 2 },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: 'TZ', decimals: 2 },
  UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: 'UG', decimals: 0 },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: 'ZA', decimals: 2 },
  MAD: { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', flag: 'MA', decimals: 2 },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: 'EG', decimals: 2 },
  ETB: { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: 'ET', decimals: 2 },
  GNF: { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', flag: 'GN', decimals: 0 },
  RWF: { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', flag: 'RW', decimals: 0 },
  MGA: { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: 'MG', decimals: 0 },
  MUR: { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: 'MU', decimals: 2 }
};

export const BASE_CURRENCY: SupportedCurrency = 'USD';
```

### Exchange Rate Service

```typescript
// lib/services/exchangeRateService.ts

import { ExchangeRate, SupportedCurrency } from '@/types';

const EXCHANGE_RATE_API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;
const EXCHANGE_RATE_API_URL = 'https://v6.exchangerate-api.com/v6';

export class ExchangeRateService {
  private static cache: Map<SupportedCurrency, ExchangeRate> = new Map();
  private static lastUpdate: Date | null = null;
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  static async getExchangeRate(targetCurrency: SupportedCurrency): Promise<number> {
    if (targetCurrency === 'USD') return 1;

    // Check cache
    const cached = this.cache.get(targetCurrency);
    if (cached && this.isCacheValid()) {
      return cached.rate;
    }

    // Fetch new rates
    await this.updateRates();
    
    const rate = this.cache.get(targetCurrency);
    if (!rate) {
      throw new Error(`Exchange rate not found for ${targetCurrency}`);
    }

    return rate.rate;
  }

  static async updateRates(): Promise<void> {
    try {
      const response = await fetch(
        `${EXCHANGE_RATE_API_URL}/${EXCHANGE_RATE_API_KEY}/latest/USD`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      
      if (data.result !== 'success') {
        throw new Error('Exchange rate API returned error');
      }

      // Update cache
      Object.keys(SUPPORTED_CURRENCIES).forEach((currency) => {
        if (currency !== 'USD' && data.conversion_rates[currency]) {
          this.cache.set(currency as SupportedCurrency, {
            baseCurrency: 'USD',
            targetCurrency: currency as SupportedCurrency,
            rate: data.conversion_rates[currency],
            timestamp: new Date(),
            source: 'exchangerate-api.com'
          });
        }
      });

      this.lastUpdate = new Date();
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      // Use cached rates if available
      if (this.cache.size === 0) {
        throw new Error('No exchange rates available');
      }
    }
  }

  static isCacheValid(): boolean {
    if (!this.lastUpdate) return false;
    const now = Date.now();
    const lastUpdateTime = this.lastUpdate.getTime();
    return (now - lastUpdateTime) < this.CACHE_DURATION;
  }

  static async convertPrice(
    amountUSD: number,
    targetCurrency: SupportedCurrency
  ): Promise<number> {
    if (targetCurrency === 'USD') return amountUSD;
    
    const rate = await this.getExchangeRate(targetCurrency);
    return amountUSD * rate;
  }

  static formatPrice(
    amount: number,
    currency: SupportedCurrency
  ): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    const formatted = amount.toFixed(currencyInfo.decimals);
    return `${currencyInfo.symbol}${formatted}`;
  }

  static getAllRates(): Map<SupportedCurrency, ExchangeRate> {
    return new Map(this.cache);
  }
}
```

### Currency Store (Zustand)

```typescript
// store/currencyStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupportedCurrency } from '@/types';
import { ExchangeRateService } from '@/lib/services/exchangeRateService';

interface CurrencyState {
  selectedCurrency: SupportedCurrency;
  exchangeRates: Map<SupportedCurrency, number>;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;

  // Actions
  setCurrency: (currency: SupportedCurrency) => void;
  updateExchangeRates: () => Promise<void>;
  convertPrice: (amountUSD: number) => Promise<number>;
  formatPrice: (amount: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      selectedCurrency: 'USD',
      exchangeRates: new Map(),
      loading: false,
      error: null,
      lastUpdate: null,

      setCurrency: (currency: SupportedCurrency) => {
        set({ selectedCurrency: currency });
      },

      updateExchangeRates: async () => {
        set({ loading: true, error: null });
        try {
          await ExchangeRateService.updateRates();
          const rates = ExchangeRateService.getAllRates();
          const ratesMap = new Map<SupportedCurrency, number>();
          rates.forEach((rate, currency) => {
            ratesMap.set(currency, rate.rate);
          });
          set({ 
            exchangeRates: ratesMap, 
            loading: false,
            lastUpdate: new Date()
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update exchange rates', 
            loading: false 
          });
        }
      },

      convertPrice: async (amountUSD: number) => {
        const { selectedCurrency } = get();
        return await ExchangeRateService.convertPrice(amountUSD, selectedCurrency);
      },

      formatPrice: (amount: number) => {
        const { selectedCurrency } = get();
        return ExchangeRateService.formatPrice(amount, selectedCurrency);
      }
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        lastUpdate: state.lastUpdate
      })
    }
  )
);
```

### Currency Selector Component

```typescript
// components/ui/CurrencySelector.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrencyStore } from '@/store/currencyStore';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '@/lib/constants/currencies';

export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedCurrency, setCurrency } = useCurrencyStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCurrency = SUPPORTED_CURRENCIES[selectedCurrency];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <span className="text-2xl">{getFlagEmoji(currentCurrency.flag)}</span>
        <span className="font-medium">{currentCurrency.code}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
          >
            <div className="p-2">
              {Object.values(SUPPORTED_CURRENCIES).map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setCurrency(currency.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    selectedCurrency === currency.code ? 'bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFlagEmoji(currency.flag)}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{currency.code}</div>
                      <div className="text-xs text-gray-500">{currency.name}</div>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <Check size={18} className="text-yellow-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
```

### Price Display Component

```typescript
// components/ui/PriceDisplay.tsx

'use client';

import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';

interface PriceDisplayProps {
  priceUSD: number;
  className?: string;
  showOriginal?: boolean; // Show USD price alongside
}

export function PriceDisplay({ priceUSD, className = '', showOriginal = false }: PriceDisplayProps) {
  const { convertPrice, formatPrice, selectedCurrency } = useCurrencyStore();
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function convert() {
      setLoading(true);
      try {
        const converted = await convertPrice(priceUSD);
        const formatted = formatPrice(converted);
        setDisplayPrice(formatted);
      } catch (error) {
        console.error('Price conversion error:', error);
        setDisplayPrice(`$${priceUSD.toFixed(2)}`);
      } finally {
        setLoading(false);
      }
    }

    convert();
  }, [priceUSD, selectedCurrency, convertPrice, formatPrice]);

  if (loading) {
    return <span className={`animate-pulse ${className}`}>...</span>;
  }

  return (
    <span className={className}>
      {displayPrice}
      {showOriginal && selectedCurrency !== 'USD' && (
        <span className="text-sm text-gray-500 ml-2">
          (${priceUSD.toFixed(2)})
        </span>
      )}
    </span>
  );
}
```


## Payment Methods System Architecture

### Payment Method Data Models

```typescript
// types/index.ts - Add payment method types

export type PaymentMethodType =
  | 'mobile_money'
  | 'bank_transfer'
  | 'card'
  | 'paypal'
  | 'stripe';

export type MobileMoneyProvider =
  | 'orange_money'
  | 'mtn_money'
  | 'moov_money'
  | 'airtel_money';

export interface PaymentMethodConfig {
  id: string;
  fournisseurId: string;
  type: PaymentMethodType;
  isActive: boolean;
  
  // Mobile Money specific
  mobileMoneyProvider?: MobileMoneyProvider;
  mobileMoneyNumber?: string;
  mobileMoneyName?: string;
  
  // Bank Transfer specific
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  iban?: string;
  swiftCode?: string;
  
  // PayPal specific
  paypalEmail?: string;
  
  // Stripe specific
  stripeAccountId?: string;
  stripeConnected?: boolean;
  
  // Metadata
  supportedCountries?: string[]; // ISO country codes
  processingTime?: string; // e.g., "Instant", "1-3 days"
  fees?: {
    percentage?: number;
    fixed?: number;
    currency: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Extend Fournisseur interface
export interface Fournisseur extends User {
  // ... existing fields
  paymentMethods: PaymentMethodConfig[];
}
```

### Payment Method Service

```typescript
// lib/firebase/paymentMethods.ts

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './config';
import { PaymentMethodConfig } from '@/types';

export async function createPaymentMethod(
  methodData: Omit<PaymentMethodConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'paymentMethods'), {
    ...methodData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

export async function getPaymentMethod(methodId: string): Promise<PaymentMethodConfig | null> {
  const docRef = doc(db, 'paymentMethods', methodId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as PaymentMethodConfig;
}

export async function getFournisseurPaymentMethods(
  fournisseurId: string
): Promise<PaymentMethodConfig[]> {
  const q = query(
    collection(db, 'paymentMethods'),
    where('fournisseurId', '==', fournisseurId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentMethodConfig[];
}

export async function updatePaymentMethod(
  methodId: string,
  updates: Partial<PaymentMethodConfig>
): Promise<void> {
  const docRef = doc(db, 'paymentMethods', methodId);
  await updateDoc(docRef, { ...updates, updatedAt: new Date() });
}

export async function deletePaymentMethod(methodId: string): Promise<void> {
  await deleteDoc(doc(db, 'paymentMethods', methodId));
}

export async function togglePaymentMethodStatus(
  methodId: string,
  isActive: boolean
): Promise<void> {
  await updatePaymentMethod(methodId, { isActive });
}
```

### Payment Method Configuration Component

```typescript
// components/fournisseur/PaymentMethodsConfig.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, CreditCard, Smartphone, Building, DollarSign } from 'lucide-react';
import { PaymentMethodConfig, PaymentMethodType } from '@/types';
import { getFournisseurPaymentMethods, deletePaymentMethod, togglePaymentMethodStatus } from '@/lib/firebase/paymentMethods';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function PaymentMethodsConfig() {
  const { user } = useAuthStore();
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPaymentMethods();
    }
  }, [user]);

  async function loadPaymentMethods() {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await getFournisseurPaymentMethods(user.id);
      setMethods(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des moyens de paiement');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(methodId: string, currentStatus: boolean) {
    try {
      await togglePaymentMethodStatus(methodId, !currentStatus);
      setMethods(methods.map(m => 
        m.id === methodId ? { ...m, isActive: !currentStatus } : m
      ));
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(methodId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?')) return;
    
    try {
      await deletePaymentMethod(methodId);
      setMethods(methods.filter(m => m.id !== methodId));
      toast.success('Moyen de paiement supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  }

  function getMethodIcon(type: PaymentMethodType) {
    switch (type) {
      case 'mobile_money': return <Smartphone className="text-green-600" />;
      case 'bank_transfer': return <Building className="text-blue-600" />;
      case 'card': return <CreditCard className="text-purple-600" />;
      case 'paypal': return <DollarSign className="text-blue-500" />;
      case 'stripe': return <CreditCard className="text-indigo-600" />;
      default: return <DollarSign />;
    }
  }

  function getMethodLabel(method: PaymentMethodConfig): string {
    switch (method.type) {
      case 'mobile_money':
        return `${method.mobileMoneyProvider?.replace('_', ' ').toUpperCase()} - ${method.mobileMoneyNumber}`;
      case 'bank_transfer':
        return `${method.bankName} - ${method.accountNumber}`;
      case 'paypal':
        return `PayPal - ${method.paypalEmail}`;
      case 'stripe':
        return 'Stripe';
      default:
        return method.type;
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Moyens de Paiement</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus size={20} />
          Ajouter un moyen
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Smartphone size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Aucun moyen de paiement configuré</p>
          <p className="text-sm text-gray-500 mt-2">
            Ajoutez vos moyens de paiement pour recevoir les paiements de vos clients
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getMethodIcon(method.type)}
                </div>
                <div>
                  <h3 className="font-semibold">{getMethodLabel(method)}</h3>
                  <p className="text-sm text-gray-500">
                    {method.processingTime && `Délai: ${method.processingTime}`}
                  </p>
                  {method.fees && (
                    <p className="text-xs text-gray-400">
                      Frais: {method.fees.percentage}% + {method.fees.fixed} {method.fees.currency}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.isActive}
                    onChange={() => handleToggleStatus(method.id, method.isActive)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>

                <button
                  onClick={() => handleDelete(method.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Payment Method Modal would go here */}
    </div>
  );
}
```


## Invoice PDF Generation System

### Invoice Generation Service

Create `lib/services/invoiceService.ts`:

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Order } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function generateInvoicePDF(invoice: Invoice): Promise<Blob> {
  const doc = new jsPDF();
  
  // Company logo and header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 105, 20, { align: 'center' });
  
  // Invoice details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Numéro de facture: ${invoice.invoiceNumber}`, 20, 35);
  doc.text(`Date: ${format(invoice.invoiceDate, 'dd MMMM yyyy', { locale: fr })}`, 20, 42);
  doc.text(`Numéro de commande: ${invoice.orderNumber}`, 20, 49);
  
  // Client information
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName, 20, 72);
  doc.text(invoice.clientEmail, 20, 79);
  doc.text(invoice.clientAddress.street, 20, 86);
  doc.text(`${invoice.clientAddress.city}, ${invoice.clientAddress.postalCode}`, 20, 93);
  doc.text(invoice.clientAddress.country, 20, 100);
  
  // Fournisseur information
  doc.setFont('helvetica', 'bold');
  doc.text('VENDEUR:', 120, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.fournisseurName, 120, 72);
  doc.text(invoice.fournisseurEmail, 120, 79);
  if (invoice.fournisseurAddress) {
    doc.text(invoice.fournisseurAddress, 120, 86);
  }
  
  // Products table
  const tableData = invoice.products.map(product => [
    product.name,
    product.quantity.toString(),
    `${product.price.toFixed(2)} ${invoice.currency}`,
    `${(product.quantity * product.price).toFixed(2)} ${invoice.currency}`
  ]);
  
  autoTable(doc, {
    startY: 115,
    head: [['Produit', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [255, 127, 0] }, // Orange color
    styles: { fontSize: 10 },
  });
  
  // Calculate final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals
  const totalsX = 120;
  doc.setFont('helvetica', 'normal');
  doc.text('Sous-total:', totalsX, finalY);
  doc.text(`${invoice.subtotal.toFixed(2)} ${invoice.currency}`, 180, finalY, { align: 'right' });
  
  doc.text('Frais de plateforme:', totalsX, finalY + 7);
  doc.text(`${invoice.platformFee.toFixed(2)} ${invoice.currency}`, 180, finalY + 7, { align: 'right' });
  
  doc.text('Frais de livraison:', totalsX, finalY + 14);
  doc.text(`${invoice.shippingFee.toFixed(2)} ${invoice.currency}`, 180, finalY + 14, { align: 'right' });
  
  if (invoice.marketingCommission > 0) {
    doc.text('Commission marketing:', totalsX, finalY + 21);
    doc.text(`-${invoice.marketingCommission.toFixed(2)} ${invoice.currency}`, 180, finalY + 21, { align: 'right' });
  }
  
  // Total line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const totalY = invoice.marketingCommission > 0 ? finalY + 28 : finalY + 21;
  doc.text('TOTAL:', totalsX, totalY);
  doc.text(`${invoice.total.toFixed(2)} ${invoice.currency}`, 180, totalY, { align: 'right' });
  
  // Payment information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const paymentY = totalY + 15;
  doc.text(`Méthode de paiement: ${getPaymentMethodLabel(invoice.paymentMethod)}`, 20, paymentY);
  doc.text(`Statut: ${getPaymentStatusLabel(invoice.paymentStatus)}`, 20, paymentY + 7);
  if (invoice.transactionId) {
    doc.text(`ID de transaction: ${invoice.transactionId}`, 20, paymentY + 14);
  }
  if (invoice.paidAt) {
    doc.text(`Payé le: ${format(invoice.paidAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}`, 20, paymentY + 21);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Merci pour votre commande!', 105, 280, { align: 'center' });
  doc.text('Pour toute question, contactez notre service client.', 105, 285, { align: 'center' });
  
  return doc.output('blob');
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    'card': 'Carte bancaire',
    'paypal': 'PayPal',
    'stripe': 'Stripe',
    'bank_transfer': 'Virement bancaire',
    'orange_money': 'Orange Money',
    'mtn_money': 'MTN Mobile Money',
    'moov_money': 'Moov Money'
  };
  return labels[method] || method;
}

function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'pending': 'En attente',
    'paid': 'Payé',
    'failed': 'Échoué',
    'refunded': 'Remboursé'
  };
  return labels[status] || status;
}

export function downloadInvoice(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function createInvoiceFromOrder(order: Order, clientData: any, fournisseurData: any): Promise<Invoice> {
  const invoiceNumber = `INV-${order.orderNumber.replace('ORD-', '')}`;
  
  return {
    id: `invoice-${order.id}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    invoiceNumber,
    invoiceDate: order.paidAt || new Date(),
    
    clientId: order.clientId,
    clientName: clientData.displayName,
    clientEmail: clientData.email,
    clientAddress: order.shippingAddress,
    
    fournisseurId: order.fournisseurId,
    fournisseurName: fournisseurData.displayName || fournisseurData.shopName,
    fournisseurEmail: fournisseurData.email,
    fournisseurAddress: fournisseurData.address,
    
    products: order.products,
    subtotal: order.subtotal,
    platformFee: order.platformFee,
    shippingFee: order.shippingFee,
    marketingCommission: order.marketingCommission,
    total: order.total,
    currency: order.currency,
    
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId,
    paidAt: order.paidAt,
    
    createdAt: new Date(),
    generatedBy: clientData.id
  };
}
```

### Firebase Invoice Functions

Create `lib/firebase/invoices.ts`:

```typescript
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import { Invoice } from '@/types';

export async function saveInvoice(invoice: Invoice): Promise<void> {
  await setDoc(doc(db, 'invoices', invoice.id), {
    ...invoice,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
    createdAt: invoice.createdAt
  });
}

export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  const docRef = doc(db, 'invoices', invoiceId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Invoice;
}

export async function getInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
  const q = query(collection(db, 'invoices'), where('orderId', '==', orderId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Invoice;
}

export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  const q = query(collection(db, 'invoices'), where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
}

export async function getFournisseurInvoices(fournisseurId: string): Promise<Invoice[]> {
  const q = query(collection(db, 'invoices'), where('fournisseurId', '==', fournisseurId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
}
```


## Payment System Integration

### Payment Method Types

```typescript
// types/index.ts - Add to existing types
export type PaymentMethodType = 
  | 'stripe'
  | 'paypal'
  | 'orange_money'
  | 'mtn_money'
  | 'moov_money'
  | 'bank_transfer';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  description: string;
  isActive: boolean;
  config?: PaymentMethodConfig;
}

export interface PaymentMethodConfig {
  // Stripe
  stripePublicKey?: string;
  stripeSecretKey?: string;
  
  // PayPal
  paypalClientId?: string;
  paypalClientSecret?: string;
  
  // Mobile Money
  merchantId?: string;
  merchantKey?: string;
  apiUrl?: string;
  
  // Bank Transfer
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  swiftCode?: string;
  iban?: string;
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret?: string;
  transactionId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Stripe Integration

Create `lib/services/stripeService.ts`:

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export function getStripe(publicKey: string): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(publicKey);
  }
  return stripePromise;
}

export async function createStripePaymentIntent(
  amount: number,
  currency: string,
  orderId: string
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // This would call your backend API endpoint that creates a Stripe PaymentIntent
  const response = await fetch('/api/payments/stripe/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, orderId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }
  
  return response.json();
}

export async function confirmStripePayment(
  stripe: Stripe,
  clientSecret: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethodId
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: paymentIntent?.status === 'succeeded' };
}
```

**Installation:**
```bash
npm install @stripe/stripe-js stripe
```

### PayPal Integration

Create `lib/services/paypalService.ts`:

```typescript
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export interface PayPalConfig {
  clientId: string;
  currency: string;
}

export async function createPayPalOrder(
  amount: number,
  currency: string,
  orderId: string
): Promise<string> {
  // This would call your backend API endpoint that creates a PayPal order
  const response = await fetch('/api/payments/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, orderId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create PayPal order');
  }
  
  const data = await response.json();
  return data.orderID;
}

export async function capturePayPalOrder(orderID: string): Promise<{ success: boolean; transactionId?: string }> {
  const response = await fetch('/api/payments/paypal/capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderID })
  });
  
  if (!response.ok) {
    return { success: false };
  }
  
  const data = await response.json();
  return { success: true, transactionId: data.transactionId };
}
```

**Installation:**
```bash
npm install @paypal/react-paypal-js
```

### Mobile Money Integration

Create `lib/services/mobileMoneyService.ts`:

```typescript
export type MobileMoneyProvider = 'orange_money' | 'mtn_money' | 'moov_money';

export interface MobileMoneyPaymentRequest {
  provider: MobileMoneyProvider;
  phoneNumber: string;
  amount: number;
  currency: string;
  orderId: string;
}

export async function initiateMobileMoneyPayment(
  request: MobileMoneyPaymentRequest
): Promise<{ success: boolean; transactionId?: string; message?: string }> {
  // This would call your backend API endpoint that initiates mobile money payment
  const response = await fetch('/api/payments/mobile-money/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    const error = await response.json();
    return { success: false, message: error.message };
  }
  
  const data = await response.json();
  return { 
    success: true, 
    transactionId: data.transactionId,
    message: 'Un code de confirmation a été envoyé à votre téléphone. Veuillez composer le code pour finaliser le paiement.'
  };
}

export async function checkMobileMoneyPaymentStatus(
  transactionId: string
): Promise<{ status: 'pending' | 'succeeded' | 'failed'; message?: string }> {
  const response = await fetch(`/api/payments/mobile-money/status/${transactionId}`);
  
  if (!response.ok) {
    return { status: 'failed', message: 'Impossible de vérifier le statut du paiement' };
  }
  
  return response.json();
}
```

### Payment Configuration Management

Create `lib/firebase/paymentConfig.ts`:

```typescript
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './config';
import { PaymentMethod, PaymentMethodConfig } from '@/types';

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const snapshot = await getDocs(collection(db, 'paymentMethods'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentMethod[];
}

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const methods = await getPaymentMethods();
  return methods.filter(method => method.isActive);
}

export async function updatePaymentMethod(
  methodId: string,
  updates: Partial<PaymentMethod>
): Promise<void> {
  await setDoc(doc(db, 'paymentMethods', methodId), updates, { merge: true });
}

export async function getPaymentMethodConfig(methodId: string): Promise<PaymentMethodConfig | null> {
  const docRef = doc(db, 'paymentMethods', methodId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data().config as PaymentMethodConfig;
}

// Initialize default payment methods (run once)
export async function initializePaymentMethods(): Promise<void> {
  const defaultMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      type: 'stripe',
      name: 'Carte bancaire (Stripe)',
      description: 'Payez par carte de crédit ou débit',
      isActive: false
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      description: 'Payez avec votre compte PayPal',
      isActive: false
    },
    {
      id: 'orange_money',
      type: 'orange_money',
      name: 'Orange Money',
      description: 'Payez avec Orange Money',
      isActive: false
    },
    {
      id: 'mtn_money',
      type: 'mtn_money',
      name: 'MTN Mobile Money',
      description: 'Payez avec MTN Mobile Money',
      isActive: false
    },
    {
      id: 'moov_money',
      type: 'moov_money',
      name: 'Moov Money',
      description: 'Payez avec Moov Money',
      isActive: false
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Virement bancaire',
      description: 'Payez par virement bancaire',
      isActive: false
    }
  ];
  
  for (const method of defaultMethods) {
    await setDoc(doc(db, 'paymentMethods', method.id), method);
  }
}
```

### Payment Intent Management

Create `lib/firebase/paymentIntents.ts`:

```typescript
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
import { PaymentIntent } from '@/types';

export async function createPaymentIntent(intent: Omit<PaymentIntent, 'id'>): Promise<string> {
  const docRef = doc(collection(db, 'paymentIntents'));
  await setDoc(docRef, {
    ...intent,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
}

export async function getPaymentIntent(intentId: string): Promise<PaymentIntent | null> {
  const docRef = doc(db, 'paymentIntents', intentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as PaymentIntent;
}

export async function updatePaymentIntentStatus(
  intentId: string,
  status: PaymentIntent['status'],
  transactionId?: string,
  errorMessage?: string
): Promise<void> {
  await updateDoc(doc(db, 'paymentIntents', intentId), {
    status,
    transactionId,
    errorMessage,
    updatedAt: new Date()
  });
}

export async function getOrderPaymentIntents(orderId: string): Promise<PaymentIntent[]> {
  const q = query(collection(db, 'paymentIntents'), where('orderId', '==', orderId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PaymentIntent[];
}
```


## Email Service Integration

### Email Service Setup

Create `lib/services/emailService.ts`:

```typescript
export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    // This would call your backend API endpoint or Firebase Cloud Function
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generatePaymentReceiptEmail(
  clientName: string,
  orderNumber: string,
  amount: number,
  currency: string,
  paymentMethod: string,
  transactionId: string,
  invoiceUrl: string
): EmailTemplate {
  return {
    to: '', // Will be filled by the caller
    subject: `Reçu de paiement - Commande ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff7f00; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #ff7f00; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reçu de paiement</h1>
          </div>
          <div class="content">
            <p>Bonjour ${clientName},</p>
            <p>Nous avons bien reçu votre paiement pour la commande <strong>${orderNumber}</strong>.</p>
            
            <div class="details">
              <h3>Détails du paiement</h3>
              <p><strong>Montant:</strong> ${amount.toFixed(2)} ${currency}</p>
              <p><strong>Méthode de paiement:</strong> ${paymentMethod}</p>
              <p><strong>ID de transaction:</strong> ${transactionId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <p>Vous pouvez télécharger votre facture en cliquant sur le bouton ci-dessous:</p>
            <a href="${invoiceUrl}" class="button">Télécharger la facture</a>
            
            <p>Merci pour votre commande!</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p>Pour toute question, contactez notre service client.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reçu de paiement
      
      Bonjour ${clientName},
      
      Nous avons bien reçu votre paiement pour la commande ${orderNumber}.
      
      Détails du paiement:
      - Montant: ${amount.toFixed(2)} ${currency}
      - Méthode de paiement: ${paymentMethod}
      - ID de transaction: ${transactionId}
      - Date: ${new Date().toLocaleDateString('fr-FR')}
      
      Téléchargez votre facture: ${invoiceUrl}
      
      Merci pour votre commande!
    `
  };
}
```

