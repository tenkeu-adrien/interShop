# Requirements Document: Complete E-commerce System

## Introduction

This document specifies the requirements for completing an InterAppshop e-commerce platform built with Next.js 16, TypeScript, and Firebase. The system supports four user roles (Client, Fournisseur, Marketiste, Admin) and requires implementation of role-specific dashboards, approval workflows, order management, and system configuration fixes.

The platform enables clients to purchase products from verified suppliers (fournisseurs), while affiliates (marketistes) earn commissions through marketing codes. Administrators manage user approvals, orders, and platform operations.

## Glossary

- **System**: The complete e-commerce platform application
- **Client**: A buyer user who purchases products from fournisseurs
- **Fournisseur**: A supplier user who sells products on the platform (requires admin approval)
- **Marketiste**: An affiliate user who creates marketing codes and earns commissions (requires admin approval)
- **Admin**: A platform administrator with full system access
- **Approval_System**: The subsystem that manages fournisseur and marketiste account validation
- **Dashboard**: Role-specific user interface for managing account activities
- **Marketing_Code**: A promotional code created by marketistes that provides commissions
- **Order_Manager**: The subsystem that handles order lifecycle and status updates
- **User_Validator**: The component that checks user approval status and permissions
- **Tailwind_Config**: The CSS framework configuration system
- **Firebase_Functions**: Backend functions for database operations
- **Middleware**: The request interceptor that enforces authentication and authorization
- **Approval_Status**: The state of a user account: 'pending', 'approved', or 'rejected'
- **Order_Status**: The state of an order: 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', or 'refunded'

## Requirements

### Requirement 1: Tailwind CSS Configuration Fix

**User Story:** As a developer, I want a stable Tailwind CSS configuration, so that the styling system works reliably in production.

#### Acceptance Criteria

1. THE System SHALL use Tailwind CSS version 3.4.1 instead of version 4 beta
2. THE System SHALL include a tailwind.config.ts file with proper content paths for all component directories
3. THE System SHALL configure PostCSS with tailwindcss and autoprefixer plugins only
4. THE System SHALL remove the @tailwindcss/postcss dependency from package.json
5. WHEN the build process runs, THE System SHALL compile Tailwind styles without errors

### Requirement 2: User Approval Status Management

**User Story:** As an admin, I want to control which fournisseurs and marketistes can access the platform, so that only validated businesses operate on the system.

#### Acceptance Criteria

1. THE User type SHALL include an approvalStatus field with values 'pending', 'approved', or 'rejected'
2. THE User type SHALL include an approvedBy field storing the admin user ID who approved/rejected the account
3. THE User type SHALL include an approvedAt field storing the timestamp of approval/rejection
4. THE User type SHALL include a rejectionReason field storing the reason when status is 'rejected'
5. WHEN a user registers as fournisseur or marketiste, THE System SHALL set approvalStatus to 'pending'
6. WHEN a user registers as client or admin, THE System SHALL set approvalStatus to 'approved'
7. THE Fournisseur type SHALL extend User with approval status fields
8. THE Marketiste type SHALL extend User with approval status fields

### Requirement 3: Fournisseur Access Control

**User Story:** As a fournisseur, I want to know my approval status, so that I understand why I cannot access certain features.

#### Acceptance Criteria

1. WHEN a fournisseur with approvalStatus 'pending' accesses their dashboard, THE System SHALL display a waiting message
2. WHEN a fournisseur with approvalStatus 'rejected' accesses their dashboard, THE System SHALL display the rejection reason
3. WHEN a fournisseur with approvalStatus 'pending' or 'rejected' attempts to add products, THE System SHALL prevent the action
4. WHEN a fournisseur with approvalStatus 'approved' accesses their dashboard, THE System SHALL display full functionality
5. THE System SHALL display an approval status banner on the fournisseur dashboard when status is not 'approved'

### Requirement 4: Marketiste Access Control

**User Story:** As a marketiste, I want to know my approval status, so that I understand why I cannot create marketing codes.

#### Acceptance Criteria

1. WHEN a marketiste with approvalStatus 'pending' accesses their dashboard, THE System SHALL display a waiting message
2. WHEN a marketiste with approvalStatus 'rejected' accesses their dashboard, THE System SHALL display the rejection reason
3. WHEN a marketiste with approvalStatus 'pending' or 'rejected' attempts to create marketing codes, THE System SHALL prevent the action
4. WHEN a marketiste with approvalStatus 'approved' accesses their dashboard, THE System SHALL display full functionality
5. THE System SHALL display an approval status banner on the marketiste dashboard when status is not 'approved'

### Requirement 5: Admin Dashboard Overview

**User Story:** As an admin, I want to see platform statistics at a glance, so that I can monitor system health.

#### Acceptance Criteria

1. WHEN an admin accesses the admin dashboard, THE System SHALL display total user count
2. WHEN an admin accesses the admin dashboard, THE System SHALL display pending approval count
3. WHEN an admin accesses the admin dashboard, THE System SHALL display total order count
4. WHEN an admin accesses the admin dashboard, THE System SHALL display total revenue
5. THE System SHALL calculate statistics in real-time from Firebase collections
6. THE System SHALL display statistics in card components with appropriate icons

### Requirement 6: Admin User Management

**User Story:** As an admin, I want to manage user accounts, so that I can control platform access and quality.

#### Acceptance Criteria

1. WHEN an admin views the user management section, THE System SHALL display all users with their roles and approval status
2. WHEN an admin filters users by role, THE System SHALL display only users matching that role
3. WHEN an admin filters users by approval status, THE System SHALL display only users matching that status
4. WHEN an admin approves a pending user, THE System SHALL update approvalStatus to 'approved' and record the admin ID and timestamp
5. WHEN an admin rejects a pending user, THE System SHALL update approvalStatus to 'rejected', record the admin ID and timestamp, and store the rejection reason
6. WHEN an admin views user details, THE System SHALL display all user information including registration date and activity
7. WHEN an admin deactivates a user account, THE System SHALL set isActive to false
8. WHEN an admin activates a user account, THE System SHALL set isActive to true
9. THE System SHALL send a notification to users when their approval status changes

### Requirement 7: Admin Order Management

**User Story:** As an admin, I want to manage all platform orders, so that I can resolve issues and monitor transactions.

#### Acceptance Criteria

1. WHEN an admin views the order management section, THE System SHALL display all orders with status, date, and total
2. WHEN an admin filters orders by status, THE System SHALL display only orders matching that status
3. WHEN an admin filters orders by date range, THE System SHALL display only orders within that range
4. WHEN an admin filters orders by fournisseur, THE System SHALL display only orders from that fournisseur
5. WHEN an admin views order details, THE System SHALL display complete order information including client, fournisseur, products, and payment details
6. WHEN an admin updates order status, THE System SHALL update the order and notify all relevant parties
7. WHEN an admin processes a refund, THE System SHALL update order status to 'refunded' and update payment status
8. WHEN an admin exports orders, THE System SHALL generate a CSV file with all order data
9. THE System SHALL display order statistics including total orders, pending orders, and revenue trends

### Requirement 8: Admin Product Management

**User Story:** As an admin, I want to manage platform products, so that I can ensure product quality and compliance.

#### Acceptance Criteria

1. WHEN an admin views the product management section, THE System SHALL display all products with name, fournisseur, status, and price
2. WHEN an admin filters products by fournisseur, THE System SHALL display only products from that fournisseur
3. WHEN an admin filters products by status, THE System SHALL display only products matching that status
4. WHEN an admin deactivates a product, THE System SHALL set isActive to false
5. WHEN an admin activates a product, THE System SHALL set isActive to true
6. WHEN an admin views product details, THE System SHALL display complete product information
7. THE System SHALL notify fournisseurs when their products are deactivated

### Requirement 9: Admin Analytics Dashboard

**User Story:** As an admin, I want to view platform analytics, so that I can make data-driven decisions.

#### Acceptance Criteria

1. WHEN an admin views the analytics section, THE System SHALL display revenue charts for the last 12 months
2. WHEN an admin views the analytics section, THE System SHALL display top 10 fournisseurs by revenue
3. WHEN an admin views the analytics section, THE System SHALL display top 10 products by sales
4. WHEN an admin views the analytics section, THE System SHALL display order trend charts
5. THE System SHALL calculate analytics from Firebase order and product collections
6. THE System SHALL allow filtering analytics by date range

### Requirement 10: Client Dashboard Overview

**User Story:** As a client, I want to see my account summary, so that I can quickly access my orders and saved items.

#### Acceptance Criteria

1. WHEN a client accesses their dashboard, THE System SHALL display active order count
2. WHEN a client accesses their dashboard, THE System SHALL display wishlist item count
3. WHEN a client accesses their dashboard, THE System SHALL display saved address count
4. WHEN a client accesses their dashboard, THE System SHALL display recent order summaries
5. THE System SHALL provide quick navigation to orders, wishlist, and addresses sections

### Requirement 11: Client Order Management

**User Story:** As a client, I want to manage my orders, so that I can track purchases and request support.

#### Acceptance Criteria

1. WHEN a client views their orders, THE System SHALL display all orders sorted by creation date descending
2. WHEN a client filters orders by status, THE System SHALL display only orders matching that status
3. WHEN a client views order details, THE System SHALL display complete order information including products, shipping address, and tracking number
4. WHEN a client views an order with status 'shipped', THE System SHALL display tracking information
5. WHEN a client requests a refund for an eligible order, THE System SHALL create a refund request and notify the admin
6. WHEN a client leaves a review for a delivered order, THE System SHALL create the review and update product rating
7. THE System SHALL allow clients to view order history for the past 2 years

### Requirement 12: Client Wishlist Management

**User Story:** As a client, I want to save products to my wishlist, so that I can purchase them later.

#### Acceptance Criteria

1. WHEN a client views their wishlist, THE System SHALL display all saved products with current prices
2. WHEN a client adds a wishlist product to cart, THE System SHALL add the product to the cart store
3. WHEN a client removes a product from wishlist, THE System SHALL update the client's wishlist array
4. WHEN a product in the wishlist becomes unavailable, THE System SHALL display an unavailable indicator
5. THE System SHALL display price change indicators for wishlist products

### Requirement 13: Client Address Management

**User Story:** As a client, I want to manage my shipping addresses, so that I can checkout quickly.

#### Acceptance Criteria

1. WHEN a client views their addresses, THE System SHALL display all saved addresses with labels
2. WHEN a client adds a new address, THE System SHALL validate all required fields and save to Firebase
3. WHEN a client edits an address, THE System SHALL update the address in Firebase
4. WHEN a client deletes an address, THE System SHALL remove it from their addresses array
5. WHEN a client sets a default address, THE System SHALL update the isDefault flag for all addresses
6. THE System SHALL ensure exactly one address has isDefault set to true when multiple addresses exist

### Requirement 14: Client Review Management

**User Story:** As a client, I want to manage my product reviews, so that I can update my feedback.

#### Acceptance Criteria

1. WHEN a client views their reviews, THE System SHALL display all reviews with product names and ratings
2. WHEN a client edits a review, THE System SHALL update the review content and timestamp
3. WHEN a client views a review with a fournisseur response, THE System SHALL display the response
4. THE System SHALL only allow clients to review products from delivered orders
5. THE System SHALL allow one review per product per order

### Requirement 15: Client Account Settings

**User Story:** As a client, I want to manage my account settings, so that I can control my profile and preferences.

#### Acceptance Criteria

1. WHEN a client updates their profile, THE System SHALL validate and save changes to Firebase
2. WHEN a client changes their password, THE System SHALL validate the new password and update Firebase Authentication
3. WHEN a client updates notification preferences, THE System SHALL save preferences to their user document
4. THE System SHALL validate email format when updating email
5. THE System SHALL require current password verification for password changes

### Requirement 16: Marketiste Dashboard Overview

**User Story:** As a marketiste, I want to see my earnings and code performance, so that I can optimize my marketing strategy.

#### Acceptance Criteria

1. WHEN a marketiste accesses their dashboard, THE System SHALL display total marketing code count
2. WHEN a marketiste accesses their dashboard, THE System SHALL display total earnings amount
3. WHEN a marketiste accesses their dashboard, THE System SHALL display pending earnings amount
4. WHEN a marketiste accesses their dashboard, THE System SHALL display conversion rate percentage
5. THE System SHALL calculate statistics from marketing codes and orders collections

### Requirement 17: Marketiste Code Management

**User Story:** As a marketiste, I want to manage my marketing codes, so that I can control my promotional campaigns.

#### Acceptance Criteria

1. WHEN an approved marketiste creates a marketing code, THE System SHALL validate uniqueness and save to Firebase
2. WHEN a marketiste views their codes, THE System SHALL display all codes with usage statistics
3. WHEN a marketiste edits a code, THE System SHALL update commission rate, validity dates, and linked products
4. WHEN a marketiste deactivates a code, THE System SHALL set isActive to false
5. WHEN a marketiste views code performance, THE System SHALL display usage count, earnings, and conversion rate
6. WHEN a pending or rejected marketiste attempts to create a code, THE System SHALL prevent the action and display approval status

### Requirement 18: Marketiste Earnings Management

**User Story:** As a marketiste, I want to track my earnings, so that I can manage my income.

#### Acceptance Criteria

1. WHEN a marketiste views earnings, THE System SHALL display total earnings breakdown by code
2. WHEN a marketiste views earnings, THE System SHALL separate pending earnings from paid earnings
3. WHEN a marketiste views earnings history, THE System SHALL display all commission transactions with dates
4. WHEN a marketiste requests a payout, THE System SHALL create a payout request for admin approval
5. THE System SHALL calculate pending earnings from orders with status 'paid' or 'processing'
6. THE System SHALL calculate paid earnings from orders with status 'delivered'

### Requirement 19: Marketiste Order Tracking

**User Story:** As a marketiste, I want to see orders using my codes, so that I can verify my commissions.

#### Acceptance Criteria

1. WHEN a marketiste views orders with their codes, THE System SHALL display all orders containing their marketing codes
2. WHEN a marketiste views an order, THE System SHALL display the commission amount earned
3. WHEN a marketiste filters orders by code, THE System SHALL display only orders using that specific code
4. THE System SHALL display order status and commission payment status

### Requirement 20: Marketiste Analytics

**User Story:** As a marketiste, I want to view code analytics, so that I can optimize my marketing strategy.

#### Acceptance Criteria

1. WHEN a marketiste views analytics, THE System SHALL display code usage trends over time
2. WHEN a marketiste views analytics, THE System SHALL display top performing codes by earnings
3. WHEN a marketiste views analytics, THE System SHALL display conversion funnel metrics
4. THE System SHALL calculate analytics from orders and marketing codes collections

### Requirement 21: Enhanced Fournisseur Order Management

**User Story:** As a fournisseur, I want to manage orders for my products, so that I can fulfill customer purchases.

#### Acceptance Criteria

1. WHEN a fournisseur views their orders, THE System SHALL display all orders containing their products
2. WHEN a fournisseur filters orders by status, THE System SHALL display only orders matching that status
3. WHEN a fournisseur updates order status to 'processing', THE System SHALL update the order and notify the client
4. WHEN a fournisseur updates order status to 'shipped', THE System SHALL require a tracking number and notify the client
5. WHEN a fournisseur views order details, THE System SHALL display client shipping address and contact information
6. WHEN a fournisseur handles a cancellation, THE System SHALL update order status to 'cancelled' and notify the client
7. THE System SHALL only allow fournisseurs to update orders for their own products

### Requirement 22: Enhanced Fournisseur Product Management

**User Story:** As a fournisseur, I want to manage my product catalog, so that I can control my inventory and offerings.

#### Acceptance Criteria

1. WHEN an approved fournisseur adds a product, THE System SHALL validate all required fields and save to Firebase
2. WHEN a fournisseur views their products, THE System SHALL display all products with stock levels and status
3. WHEN a fournisseur edits a product, THE System SHALL update the product document in Firebase
4. WHEN a fournisseur deletes a product, THE System SHALL set isActive to false instead of removing the document
5. WHEN a fournisseur updates inventory, THE System SHALL update the stock field
6. WHEN a fournisseur views product analytics, THE System SHALL display views, sales, and revenue for each product
7. WHEN a pending or rejected fournisseur attempts to add a product, THE System SHALL prevent the action and display approval status

### Requirement 23: Enhanced Fournisseur Customer Messages

**User Story:** As a fournisseur, I want to communicate with customers, so that I can provide support and answer questions.

#### Acceptance Criteria

1. WHEN a fournisseur views their inbox, THE System SHALL display all conversations sorted by last message date
2. WHEN a fournisseur views a conversation, THE System SHALL display all messages with timestamps
3. WHEN a fournisseur sends a message, THE System SHALL save to Firebase and notify the client
4. WHEN a fournisseur marks a conversation as read, THE System SHALL update the unread count
5. THE System SHALL display unread message count on the fournisseur dashboard

### Requirement 24: Order Status Update Notifications

**User Story:** As a user, I want to receive notifications when order status changes, so that I stay informed about my transactions.

#### Acceptance Criteria

1. WHEN an order status changes to 'paid', THE System SHALL notify the client, fournisseur, and marketiste (if applicable)
2. WHEN an order status changes to 'processing', THE System SHALL notify the client
3. WHEN an order status changes to 'shipped', THE System SHALL notify the client with tracking information
4. WHEN an order status changes to 'delivered', THE System SHALL notify the client and marketiste (if applicable)
5. WHEN an order status changes to 'cancelled', THE System SHALL notify the client and fournisseur
6. WHEN an order status changes to 'refunded', THE System SHALL notify the client and fournisseur
7. THE System SHALL create notification documents in Firebase for each notification

### Requirement 25: User Validation Firebase Functions

**User Story:** As a developer, I want Firebase functions for user management, so that the system can handle user validation operations.

#### Acceptance Criteria

1. THE System SHALL provide a getPendingUsers function that retrieves users with approvalStatus 'pending'
2. THE System SHALL provide a getPendingUsers function that accepts an optional role filter parameter
3. THE System SHALL provide an approveUser function that updates approvalStatus to 'approved' and records admin ID and timestamp
4. THE System SHALL provide a rejectUser function that updates approvalStatus to 'rejected', records admin ID, timestamp, and reason
5. THE System SHALL provide an updateUserStatus function that updates the isActive field
6. THE System SHALL provide a getAllUsers function that retrieves all users with optional filters for role and status
7. THE System SHALL provide a getUserById function that retrieves a single user by ID

### Requirement 26: Order Management Firebase Functions

**User Story:** As a developer, I want Firebase functions for order management, so that the system can handle order operations.

#### Acceptance Criteria

1. THE System SHALL provide a getAllOrders function that retrieves all orders for admin use
2. THE System SHALL provide a getAllOrders function that accepts optional filters for status, date range, and fournisseur
3. THE System SHALL provide a cancelOrder function that updates order status to 'cancelled'
4. THE System SHALL provide a refundOrder function that updates order status to 'refunded' and payment status to 'refunded'
5. THE System SHALL provide an exportOrdersToCSV function that generates CSV data from order records
6. THE updateOrderStatus function SHALL create notifications for all relevant parties when called

### Requirement 27: Middleware User Validation

**User Story:** As a developer, I want middleware to enforce approval requirements, so that unapproved users cannot access restricted features.

#### Acceptance Criteria

1. WHEN a fournisseur with approvalStatus 'pending' accesses fournisseur routes, THE Middleware SHALL redirect to a waiting page
2. WHEN a fournisseur with approvalStatus 'rejected' accesses fournisseur routes, THE Middleware SHALL redirect to a rejection page
3. WHEN a marketiste with approvalStatus 'pending' accesses marketiste routes, THE Middleware SHALL redirect to a waiting page
4. WHEN a marketiste with approvalStatus 'rejected' accesses marketiste routes, THE Middleware SHALL redirect to a rejection page
5. WHEN a user with approvalStatus 'approved' accesses their role routes, THE Middleware SHALL allow access
6. THE Middleware SHALL check approval status by reading from Firebase Authentication custom claims or session storage

### Requirement 28: Reusable UI Components

**User Story:** As a developer, I want reusable UI components, so that the interface is consistent and maintainable.

#### Acceptance Criteria

1. THE System SHALL provide an OrderCard component that displays order summary information
2. THE System SHALL provide an OrderDetailsModal component that displays complete order details
3. THE System SHALL provide a UserApprovalCard component that displays user information with approve/reject actions
4. THE System SHALL provide a StatusBadge component that displays status with appropriate colors
5. THE System SHALL provide a DataTable component that supports sorting, filtering, and pagination
6. THE System SHALL provide a StatsCard component that displays statistics with icons
7. THE System SHALL provide an ApprovalStatusBanner component that displays approval status messages
8. THE System SHALL ensure all components use Tailwind CSS for styling
9. THE System SHALL ensure all components use lucide-react for icons

### Requirement 29: Product Management Firebase Functions

**User Story:** As a developer, I want Firebase functions for product management, so that the system can handle product operations.

#### Acceptance Criteria

1. THE System SHALL provide a createProduct function that validates and saves product data
2. THE System SHALL provide a updateProduct function that updates product fields
3. THE System SHALL provide a deleteProduct function that sets isActive to false
4. THE System SHALL provide a getProductsByFournisseur function that retrieves all products for a fournisseur
5. THE System SHALL provide a getAllProducts function that retrieves all products with optional filters
6. THE System SHALL provide a updateProductStock function that updates the stock field

### Requirement 30: Marketing Code Firebase Functions

**User Story:** As a developer, I want Firebase functions for marketing code management, so that the system can handle code operations.

#### Acceptance Criteria

1. THE System SHALL provide a createMarketingCode function that validates uniqueness and saves code data
2. THE System SHALL provide a updateMarketingCode function that updates code fields
3. THE System SHALL provide a deactivateMarketingCode function that sets isActive to false
4. THE System SHALL provide a getMarketisteCode function that retrieves all codes for a marketiste
5. THE System SHALL provide a validateMarketingCode function that checks if a code is valid and active
6. THE System SHALL provide a incrementCodeUsage function that updates usageCount and totalEarnings when a code is used

### Requirement 31: Address Management Firebase Functions

**User Story:** As a developer, I want Firebase functions for address management, so that clients can manage shipping addresses.

#### Acceptance Criteria

1. THE System SHALL provide a createAddress function that validates and adds an address to a client's addresses array
2. THE System SHALL provide a updateAddress function that updates an address in the client's addresses array
3. THE System SHALL provide a deleteAddress function that removes an address from the client's addresses array
4. THE System SHALL provide a setDefaultAddress function that updates isDefault flags for all client addresses
5. THE System SHALL ensure only one address has isDefault set to true per client

### Requirement 32: Review Management Firebase Functions

**User Story:** As a developer, I want Firebase functions for review management, so that clients can review products.

#### Acceptance Criteria

1. THE System SHALL provide a createReview function that validates and saves review data
2. THE System SHALL provide a updateReview function that updates review content
3. THE System SHALL provide a getProductReviews function that retrieves all reviews for a product
4. THE System SHALL provide a getClientReviews function that retrieves all reviews by a client
5. THE System SHALL provide an addReviewResponse function that allows fournisseurs to respond to reviews
6. WHEN a review is created, THE System SHALL update the product's rating and reviewCount fields

### Requirement 33: Wishlist Management Firebase Functions

**User Story:** As a developer, I want Firebase functions for wishlist management, so that clients can save products.

#### Acceptance Criteria

1. THE System SHALL provide an addToWishlist function that adds a product ID to a client's wishlist array
2. THE System SHALL provide a removeFromWishlist function that removes a product ID from a client's wishlist array
3. THE System SHALL provide a getWishlistProducts function that retrieves full product details for all wishlist items
4. THE System SHALL prevent duplicate product IDs in the wishlist array

### Requirement 34: Data Export Functionality

**User Story:** As an admin, I want to export data to CSV, so that I can analyze data in external tools.

#### Acceptance Criteria

1. WHEN an admin exports orders, THE System SHALL generate a CSV file with all order fields
2. WHEN an admin exports users, THE System SHALL generate a CSV file with all user fields
3. WHEN an admin exports products, THE System SHALL generate a CSV file with all product fields
4. THE System SHALL format dates in ISO 8601 format in CSV exports
5. THE System SHALL trigger browser download when export is complete

### Requirement 35: Error Handling and Validation

**User Story:** As a user, I want clear error messages, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN a Firebase operation fails, THE System SHALL display a user-friendly error message using react-hot-toast
2. WHEN form validation fails, THE System SHALL display field-specific error messages
3. WHEN a user attempts an unauthorized action, THE System SHALL display an authorization error message
4. WHEN a network error occurs, THE System SHALL display a network error message with retry option
5. THE System SHALL log all errors to the browser console for debugging
6. THE System SHALL handle Firebase authentication errors with specific messages for each error code

### Requirement 36: Loading States

**User Story:** As a user, I want to see loading indicators, so that I know the system is processing my request.

#### Acceptance Criteria

1. WHEN data is being fetched from Firebase, THE System SHALL display a loading spinner
2. WHEN a form is being submitted, THE System SHALL disable the submit button and show a loading state
3. WHEN a page is loading, THE System SHALL display a full-page loading indicator
4. WHEN a component is loading, THE System SHALL display a skeleton loader or spinner
5. THE System SHALL use consistent loading indicators across all pages

### Requirement 37: French Language Support

**User Story:** As a French-speaking user, I want the interface in French, so that I can use the platform in my language.

#### Acceptance Criteria

1. THE System SHALL display all UI text in French
2. THE System SHALL format dates using French locale (date-fns)
3. THE System SHALL format currency using French locale
4. THE System SHALL display error messages in French
5. THE System SHALL display notification messages in French
6. THE System SHALL maintain consistent French terminology across all pages

### Requirement 38: Responsive Design

**User Story:** As a mobile user, I want the interface to work on my device, so that I can use the platform anywhere.

#### Acceptance Criteria

1. THE System SHALL display correctly on mobile devices (320px minimum width)
2. THE System SHALL display correctly on tablet devices (768px minimum width)
3. THE System SHALL display correctly on desktop devices (1024px minimum width)
4. THE System SHALL use responsive Tailwind CSS classes for all layouts
5. THE System SHALL ensure touch targets are at least 44x44 pixels on mobile devices
6. THE System SHALL use mobile-friendly navigation patterns on small screens

### Requirement 39: Performance Optimization

**User Story:** As a user, I want fast page loads, so that I can use the platform efficiently.

#### Acceptance Criteria

1. THE System SHALL implement pagination for lists with more than 50 items
2. THE System SHALL use Firebase query limits to avoid fetching excessive data
3. THE System SHALL implement lazy loading for images
4. THE System SHALL use Next.js dynamic imports for large components
5. THE System SHALL cache frequently accessed data in Zustand stores
6. THE System SHALL use Firebase indexes for common query patterns

### Requirement 40: Security and Data Protection

**User Story:** As a user, I want my data protected, so that my information remains secure.

#### Acceptance Criteria

1. THE System SHALL validate all user inputs on both client and server side
2. THE System SHALL use Firebase Security Rules to restrict data access by role
3. THE System SHALL sanitize user-generated content before display
4. THE System SHALL use HTTPS for all communications
5. THE System SHALL not expose sensitive data in client-side code
6. THE System SHALL implement rate limiting for sensitive operations
7. THE System SHALL require re-authentication for sensitive account changes

### Requirement 41: Invoice PDF Generation

**User Story:** As a client, I want to download invoices for my orders, so that I can keep records for accounting purposes.

#### Acceptance Criteria

1. WHEN a client views a paid order, THE System SHALL display a "Download Invoice" button
2. WHEN a client clicks "Download Invoice", THE System SHALL generate a PDF invoice with order details
3. THE Invoice SHALL include order number, date, client information, fournisseur information, product list with quantities and prices, subtotal, fees, and total
4. THE Invoice SHALL include company logo and branding
5. THE Invoice SHALL be formatted professionally with proper layout
6. WHEN an admin or fournisseur views an order, THE System SHALL also provide invoice download
7. THE System SHALL store invoice metadata in Firebase for tracking

### Requirement 42: Payment Method Integration

**User Story:** As a client, I want multiple payment options, so that I can choose my preferred payment method.

#### Acceptance Criteria

1. THE System SHALL support Stripe payment integration for credit/debit cards
2. THE System SHALL support PayPal payment integration
3. THE System SHALL support mobile money payment (Orange Money, MTN Mobile Money, Moov Money)
4. THE System SHALL support bank transfer with payment instructions
5. WHEN a client selects a payment method, THE System SHALL display appropriate payment form or instructions
6. WHEN a payment is successful, THE System SHALL update order status to 'paid' and send confirmation
7. WHEN a payment fails, THE System SHALL display error message and allow retry
8. THE System SHALL store payment method and transaction ID with each order
9. THE System SHALL support payment webhooks for automatic status updates

### Requirement 43: Payment Configuration

**User Story:** As an admin, I want to configure payment methods, so that I can control which payment options are available.

#### Acceptance Criteria

1. WHEN an admin accesses payment settings, THE System SHALL display all available payment methods
2. WHEN an admin enables/disables a payment method, THE System SHALL update the configuration
3. WHEN an admin configures Stripe, THE System SHALL store API keys securely
4. WHEN an admin configures PayPal, THE System SHALL store client ID and secret securely
5. WHEN an admin configures mobile money, THE System SHALL store merchant credentials securely
6. THE System SHALL validate payment credentials before saving
7. THE System SHALL display payment method status (active/inactive) on checkout page

### Requirement 44: Invoice Management

**User Story:** As a fournisseur, I want to view all invoices for my orders, so that I can track my sales and revenue.

#### Acceptance Criteria

1. WHEN a fournisseur accesses invoice management, THE System SHALL display all invoices for their orders
2. WHEN a fournisseur filters invoices by date range, THE System SHALL display matching invoices
3. WHEN a fournisseur exports invoices, THE System SHALL generate a CSV with invoice data
4. THE System SHALL display invoice status (paid, pending, refunded)
5. THE System SHALL calculate total revenue from paid invoices

### Requirement 45: Payment Receipt Email

**User Story:** As a client, I want to receive payment receipts by email, so that I have proof of payment.

#### Acceptance Criteria

1. WHEN a payment is successful, THE System SHALL send a receipt email to the client
2. THE Receipt email SHALL include order number, payment amount, payment method, and transaction ID
3. THE Receipt email SHALL include a link to download the invoice PDF
4. THE Receipt email SHALL be formatted professionally with company branding
5. THE System SHALL use Firebase Cloud Functions or a third-party email service for sending emails

### Requirement 46: Multi-Currency Support with Regional Conversion

**User Story:** As a client in Africa, I want to see prices in my local currency, so that I can understand the cost in my region.

#### Acceptance Criteria

1. THE System SHALL store all prices in USD as the base currency in Firebase
2. WHEN a client selects a region/currency, THE System SHALL fetch current exchange rates from an API
3. WHEN displaying prices, THE System SHALL convert USD prices to the selected currency in real-time
4. THE System SHALL cache exchange rates for 1 hour to minimize API calls
5. THE System SHALL support at least 15 African currencies (XOF, XAF, GHS, NGN, KES, TZS, UGX, ZAR, MAD, EGP, etc.)
6. WHEN a client changes currency, THE System SHALL update all displayed prices immediately
7. THE System SHALL display the currency symbol and code with all prices
8. THE System SHALL store the client's preferred currency in their user profile
9. WHEN calculating order totals, THE System SHALL use the exchange rate at the time of order creation
10. THE System SHALL display a currency selector in the header with flag icons

### Requirement 47: Fournisseur Payment Method Configuration

**User Story:** As a fournisseur, I want to configure my accepted payment methods, so that clients can pay me using my preferred options.

#### Acceptance Criteria

1. WHEN a fournisseur accesses payment settings, THE System SHALL display all available payment method options
2. WHEN a fournisseur enables a payment method, THE System SHALL require necessary credentials (account numbers, API keys, etc.)
3. THE System SHALL support Mobile Money providers (Orange Money, MTN Mobile Money, Moov Money, Airtel Money)
4. THE System SHALL support bank transfer with IBAN/account details
5. THE System SHALL support PayPal with email address
6. THE System SHALL support Stripe with account connection
7. WHEN a fournisseur saves payment methods, THE System SHALL validate and encrypt sensitive information
8. WHEN a client checks out, THE System SHALL display only the fournisseur's enabled payment methods
9. THE System SHALL allow fournisseurs to set different payment methods for different countries
10. THE System SHALL display payment method fees/commissions to fournisseurs

### Requirement 48: Exchange Rate Management

**User Story:** As an admin, I want to manage exchange rate sources, so that currency conversions are accurate and reliable.

#### Acceptance Criteria

1. WHEN an admin accesses exchange rate settings, THE System SHALL display current rates for all supported currencies
2. WHEN an admin updates the exchange rate API key, THE System SHALL validate the key
3. THE System SHALL support multiple exchange rate providers (exchangerate-api.io, fixer.io, currencyapi.com)
4. WHEN exchange rates fail to update, THE System SHALL use cached rates and display a warning
5. THE System SHALL log all exchange rate updates with timestamps
6. THE System SHALL allow manual override of exchange rates for specific currencies
7. THE System SHALL display the last update time for exchange rates
8. THE System SHALL send alerts when exchange rates haven't updated in 24 hours

### Requirement 49: Order Currency Locking

**User Story:** As a client, I want my order total locked at checkout, so that currency fluctuations don't affect my payment.

#### Acceptance Criteria

1. WHEN a client creates an order, THE System SHALL store the exchange rate used at that moment
2. WHEN a client views an order, THE System SHALL display prices in both USD and the original currency
3. WHEN processing refunds, THE System SHALL use the original exchange rate
4. THE System SHALL store currency and exchange rate metadata with each order
5. WHEN generating invoices, THE System SHALL use the locked exchange rate from order creation

### Requirement 50: Commission Calculation in Multiple Currencies

**User Story:** As a marketiste, I want to see my commissions in my preferred currency, so that I can track my earnings accurately.

#### Acceptance Criteria

1. WHEN calculating commissions, THE System SHALL use USD as the base currency
2. WHEN displaying commissions to marketistes, THE System SHALL convert to their preferred currency
3. WHEN processing payouts, THE System SHALL allow marketistes to choose payout currency
4. THE System SHALL display commission history with both USD and local currency amounts
5. THE System SHALL calculate exchange rate impact on earnings

### Requirement 51: Payment Gateway Integration

**User Story:** As a client, I want secure payment processing, so that my payment information is protected.

#### Acceptance Criteria

1. THE System SHALL integrate Stripe for card payments with PCI compliance
2. THE System SHALL integrate PayPal for PayPal payments
3. THE System SHALL integrate Flutterwave for African mobile money payments
4. THE System SHALL use payment gateway webhooks for automatic status updates
5. WHEN a payment succeeds, THE System SHALL update order status to 'paid' automatically
6. WHEN a payment fails, THE System SHALL log the error and notify the client
7. THE System SHALL store payment gateway transaction IDs with orders
8. THE System SHALL support payment retries for failed transactions
9. THE System SHALL implement 3D Secure for card payments
10. THE System SHALL never store raw card details on the server

### Requirement 52: Fournisseur Payment Method Display

**User Story:** As a client, I want to see which payment methods a fournisseur accepts, so that I know my options before ordering.

#### Acceptance Criteria

1. WHEN viewing a product, THE System SHALL display the fournisseur's accepted payment methods
2. WHEN viewing a fournisseur profile, THE System SHALL display all their payment methods with icons
3. THE System SHALL display payment method availability by country
4. THE System SHALL show estimated processing times for each payment method
5. THE System SHALL display any fees associated with each payment method
