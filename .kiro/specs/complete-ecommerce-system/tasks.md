# Implementation Plan: Complete E-commerce System

## Overview

This implementation plan breaks down the complete e-commerce system into discrete, manageable coding tasks. The system extends the existing Next.js + Firebase application with role-based dashboards, approval workflows, animations, and comprehensive features for all user types (Client, Fournisseur, Marketiste, Admin).

## Tasks

- [x] 1. Setup and Configuration
  - Install required dependencies (Framer Motion, @faker-js/faker)
  - Tailwind CSS is already configured (v3.4.1)
  - Setup project structure for new components and utilities
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Extend Type Definitions
  - [x] 2.1 Add approval status types and fields to User interface
    - Add ApprovalStatus type ('pending' | 'approved' | 'rejected')
    - Add approvalStatus, approvedBy, approvedAt, rejectionReason fields to User
    - Extend Fournisseur and Marketiste interfaces with approval fields
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 2.8_
  
  - [x] 2.2 Add new types for payout requests and analytics
    - Create PayoutRequest interface
    - Create RevenueData, TopFournisseur, TopProduct interfaces
    - _Requirements: 16.4, 18.4, 9.1, 9.2, 9.3_

- [ ] 3. Create Test Data Factories
  - [x] 3.1 Install @faker-js/faker and create factory structure
    - Install @faker-js/faker as dev dependency
    - Create lib/factories/ directory
    - _Requirements: Test data generation_
  
  - [x] 3.2 Implement user factories
    - Create userFactory.ts with createMockUser, createMockClient, createMockFournisseur, createMockMarketiste
    - Create createMockAddress function
    - _Requirements: Test data generation_
  
  - [x] 3.3 Implement product and order factories
    - Create productFactory.ts with createMockProduct
    - Create orderFactory.ts with createMockOrder
    - Create marketingCodeFactory.ts with createMockMarketingCode
    - Create reviewFactory.ts with createMockReview
    - _Requirements: Test data generation_
  
  - [ ] 3.4 Create seed data generator
    - Create seedData.ts with generateSeedData function
    - Generate realistic test data for all entities
    - _Requirements: Test data generation_

- [ ] 4. Firebase User Management Functions
  - [ ] 4.1 Create lib/firebase/users.ts with user management functions
    - Implement getPendingUsers(role?: UserRole)
    - Implement approveUser(userId, adminId)
    - Implement rejectUser(userId, adminId, reason)
    - Implement updateUserStatus(userId, isActive)
    - Implement getAllUsers(filters?)
    - Implement getUserById(userId)
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7_
  
  - [ ]* 4.2 Write property test for user approval state transition
    - **Property 4: User Approval State Transition**
    - **Validates: Requirements 6.4, 6.9**
  
  - [ ]* 4.3 Write property test for user rejection state transition
    - **Property 5: User Rejection State Transition**
    - **Validates: Requirements 6.5, 6.9**

- [ ] 5. Firebase Order Management Functions
  - [ ] 5.1 Extend lib/firebase/orders.ts with new functions
    - Implement getAllOrders(filters?)
    - Implement cancelOrder(orderId, reason)
    - Implement refundOrder(orderId, refundAmount)
    - Implement exportOrdersToCSV(orders)
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5_
  
  - [ ]* 5.2 Write property test for order refund state transition
    - **Property 9: Order Refund State Transition**
    - **Validates: Requirements 7.7**
  
  - [ ]* 5.3 Write property test for CSV export completeness
    - **Property 10: CSV Export Completeness**
    - **Validates: Requirements 7.8, 34.1, 34.2, 34.3, 34.4**

- [ ] 6. Firebase Product Management Functions
  - [ ] 6.1 Create lib/firebase/products.ts
    - Implement createProduct(productData)
    - Implement updateProduct(productId, updates)
    - Implement deleteProduct(productId) - soft delete
    - Implement getProductsByFournisseur(fournisseurId)
    - Implement getAllProducts(filters?)
    - Implement updateProductStock(productId, stock)
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6_
  
  - [ ]* 6.2 Write property test for product soft delete
    - **Property 23: Product Soft Delete**
    - **Validates: Requirements 22.4**

- [ ] 7. Firebase Marketing Code Functions
  - [ ] 7.1 Create lib/firebase/marketingCodes.ts
    - Implement createMarketingCode(codeData)
    - Implement updateMarketingCode(codeId, updates)
    - Implement deactivateMarketingCode(codeId)
    - Implement getMarketisteCodes(marketisteId)
    - Implement validateMarketingCode(code)
    - Implement incrementCodeUsage(codeId, orderTotal, commissionRate)
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6_
  
  - [ ]* 7.2 Write property test for marketing code uniqueness
    - **Property 20: Marketing Code Uniqueness**
    - **Validates: Requirements 17.1**

- [ ] 8. Firebase Address and Wishlist Functions
  - [ ] 8.1 Create lib/firebase/addresses.ts
    - Implement createAddress(clientId, address)
    - Implement updateAddress(clientId, addressId, updates)
    - Implement deleteAddress(clientId, addressId)
    - Implement setDefaultAddress(clientId, addressId)
    - Implement getClientAddresses(clientId)
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5_
  
  - [ ] 8.2 Create lib/firebase/wishlist.ts
    - Implement addToWishlist(clientId, productId)
    - Implement removeFromWishlist(clientId, productId)
    - Implement getWishlistProducts(clientId)
    - _Requirements: 33.1, 33.2, 33.3, 33.4_
  
  - [ ]* 8.3 Write property test for address default invariant
    - **Property 14: Address Default Invariant**
    - **Validates: Requirements 13.5, 13.6**
  
  - [ ]* 8.4 Write property test for wishlist state transitions
    - **Property 13: Wishlist State Transitions**
    - **Validates: Requirements 12.2, 12.3, 33.1, 33.2, 33.4**

- [ ] 9. Firebase Review and Notification Functions
  - [ ] 9.1 Create lib/firebase/reviews.ts
    - Implement createReview(reviewData)
    - Implement updateReview(reviewId, updates)
    - Implement getProductReviews(productId)
    - Implement getClientReviews(clientId)
    - Implement addReviewResponse(reviewId, response)
    - Update product rating when review is created
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 32.6_
  
  - [ ] 9.2 Create lib/firebase/notifications.ts
    - Implement createNotification(notificationData)
    - Implement getUserNotifications(userId)
    - Implement markNotificationAsRead(notificationId)
    - Implement markAllNotificationsAsRead(userId)
    - _Requirements: 24.7_
  
  - [ ]* 9.3 Write property test for review creation constraints
    - **Property 16: Review Creation Constraints**
    - **Validates: Requirements 14.4, 14.5**
  
  - [ ]* 9.4 Write property test for order status change notifications
    - **Property 8: Order Status Change Notifications**
    - **Validates: Requirements 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7**

- [ ] 10. Checkpoint - Ensure Firebase functions work
  - Test all Firebase functions with mock data
  - Verify Firestore queries and indexes
  - Ensure all tests pass, ask the user if questions arise


- [ ] 11. Create Reusable UI Components
  - [ ] 11.1 Create components/ui/StatusBadge.tsx
    - Display order/approval/payment status with color coding
    - Support different sizes (sm, md, lg)
    - Use Tailwind CSS for styling
    - _Requirements: 28.4_
  
  - [ ] 11.2 Create components/ui/StatsCard.tsx
    - Display statistics with icon, value, and optional trend
    - Use Framer Motion for hover animations
    - _Requirements: 28.6_
  
  - [ ] 11.3 Create components/ui/ApprovalStatusBanner.tsx
    - Display pending/rejected status messages
    - Show rejection reason when applicable
    - Use appropriate colors and icons
    - _Requirements: 28.7, 3.1, 3.2, 4.1, 4.2_
  
  - [ ] 11.4 Create components/ui/OrderCard.tsx
    - Display order summary with status, date, total
    - Support showing fournisseur or client info based on role
    - Add click handler for viewing details
    - Use Framer Motion for card animations
    - _Requirements: 28.1_
  
  - [ ] 11.5 Create components/ui/OrderDetailsModal.tsx
    - Display complete order information
    - Support role-specific actions (update status, cancel, refund)
    - Use Framer Motion for modal animations
    - _Requirements: 28.2_
  
  - [ ] 11.6 Create components/ui/UserApprovalCard.tsx
    - Display user information for admin approval
    - Include approve/reject buttons with reason input
    - Show user role and registration date
    - _Requirements: 28.3_
  
  - [ ] 11.7 Create components/ui/DataTable.tsx
    - Support sorting, filtering, and pagination
    - Generic component for any data type
    - Use Framer Motion for row animations
    - _Requirements: 28.5_
  
  - [ ]* 11.8 Write unit tests for UI components
    - Test StatusBadge with different statuses
    - Test ApprovalStatusBanner with pending/rejected states
    - Test OrderCard rendering
    - Test DataTable sorting and filtering
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7_

- [ ] 12. Create Animation Components
  - [ ] 12.1 Install Framer Motion
    - Run npm install framer-motion
    - _Requirements: Animation system_
  
  - [ ] 12.2 Create app/template.tsx for page transitions
    - Implement fade and slide animations for page changes
    - Use Framer Motion AnimatePresence
    - _Requirements: Animation system_
  
  - [ ] 12.3 Create components/ui/AnimatedCard.tsx
    - Card with hover scale and shadow animations
    - Use for product cards, stat cards, etc.
    - _Requirements: Animation system_
  
  - [ ] 12.4 Create components/ui/AnimatedModal.tsx
    - Modal with backdrop fade and content scale animations
    - Support spring animations for natural feel
    - _Requirements: Animation system_
  
  - [ ] 12.5 Create components/ui/AnimatedButton.tsx
    - Button with hover scale and tap animations
    - Use spring physics for responsive feel
    - _Requirements: Animation system_
  
  - [ ] 12.6 Create components/ui/AnimatedList.tsx
    - List with stagger animations for items
    - Use for order lists, product lists, etc.
    - _Requirements: Animation system_
  
  - [ ] 12.7 Create components/ui/SkeletonLoader.tsx
    - Animated loading skeleton with pulse effect
    - Use for loading states
    - _Requirements: 36.4_

- [ ] 13. Error Handling and Validation Utilities
  - [ ] 13.1 Create lib/utils/errorHandler.ts
    - Implement handleError function with error categorization
    - Create getAuthErrorMessage and getFirestoreErrorMessage
    - Display French error messages with react-hot-toast
    - _Requirements: 35.1, 35.2, 35.3, 35.4, 35.5, 35.6_
  
  - [ ] 13.2 Create lib/utils/validation.ts
    - Implement validateEmail function
    - Implement validatePassword function
    - Implement validateRequired function
    - All validation messages in French
    - _Requirements: 15.4, 35.2_
  
  - [ ] 13.3 Create lib/utils/asyncHelpers.ts
    - Implement withErrorHandling wrapper
    - Implement useAsyncOperation hook
    - _Requirements: 36.1, 36.2_
  
  - [ ]* 13.4 Write property test for email validation
    - **Property 18: Email Validation**
    - **Validates: Requirements 15.4**
  
  - [ ]* 13.5 Write property test for input validation
    - **Property 26: Input Validation**
    - **Validates: Requirements 35.1, 35.2, 40.1**

- [ ] 14. Admin Dashboard - Overview
  - [ ] 14.1 Create app/dashboard/admin/page.tsx
    - Display overview statistics (users, pending approvals, orders, revenue)
    - Use StatsCard components with icons
    - Calculate real-time statistics from Firebase
    - Use AnimatedCard for stat cards
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 14.2 Write property test for statistics calculation accuracy
    - **Property 11: Statistics Calculation Accuracy**
    - **Validates: Requirements 5.5, 7.9, 9.5, 10.1, 10.2, 10.3, 10.4, 16.5, 20.4**

- [ ] 15. Admin Dashboard - User Management
  - [ ] 15.1 Create app/dashboard/admin/users/page.tsx
    - Display all users with DataTable component
    - Implement filters for role and approval status
    - Show user details in modal
    - Use UserApprovalCard for pending users
    - _Requirements: 6.1, 6.2, 6.3, 6.6_
  
  - [ ] 15.2 Implement user approval/rejection actions
    - Add approve button with confirmation
    - Add reject button with reason input modal
    - Update user status in Firebase
    - Send notifications to users
    - _Requirements: 6.4, 6.5, 6.9_
  
  - [ ] 15.3 Implement user activation/deactivation
    - Add toggle for isActive field
    - Update user status in Firebase
    - _Requirements: 6.7, 6.8_
  
  - [ ]* 15.4 Write property test for list filtering correctness
    - **Property 3: List Filtering Correctness**
    - **Validates: Requirements 6.2, 6.3, 7.2, 7.3, 7.4, 8.2, 8.3, 11.2, 19.3, 21.2**

- [ ] 16. Admin Dashboard - Order Management
  - [ ] 16.1 Create app/dashboard/admin/orders/page.tsx
    - Display all orders with DataTable component
    - Implement filters for status, date range, fournisseur
    - Show order statistics
    - Use OrderCard components
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.9_
  
  - [ ] 16.2 Implement order details and actions
    - Show OrderDetailsModal on click
    - Add update status action
    - Add refund action with confirmation
    - Send notifications to all parties
    - _Requirements: 7.5, 7.6, 7.7_
  
  - [ ] 16.3 Implement order export to CSV
    - Add export button
    - Generate CSV with all order data
    - Trigger browser download
    - _Requirements: 7.8, 34.1, 34.2, 34.3, 34.4, 34.5_

- [ ] 17. Admin Dashboard - Product Management
  - [ ] 17.1 Create app/dashboard/admin/products/page.tsx
    - Display all products with DataTable component
    - Implement filters for fournisseur and status
    - Show product details in modal
    - _Requirements: 8.1, 8.2, 8.3, 8.6_
  
  - [ ] 17.2 Implement product activation/deactivation
    - Add toggle for isActive field
    - Update product status in Firebase
    - Send notification to fournisseur
    - _Requirements: 8.4, 8.5, 8.7_

- [ ] 18. Admin Dashboard - Analytics
  - [ ] 18.1 Create app/dashboard/admin/analytics/page.tsx
    - Display revenue charts for last 12 months
    - Show top 10 fournisseurs by revenue
    - Show top 10 products by sales
    - Display order trend charts
    - Implement date range filter
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 19. Checkpoint - Ensure admin dashboard works
  - Test all admin features with mock data
  - Verify user approval workflow
  - Test order management and export
  - Ensure all tests pass, ask the user if questions arise

- [ ] 20. Client Dashboard - Overview
  - [ ] 20.1 Create app/dashboard/client/page.tsx
    - Display active order count
    - Display wishlist item count
    - Display saved address count
    - Show recent order summaries
    - Provide quick navigation links
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 21. Client Dashboard - My Orders
  - [ ] 21.1 Create app/dashboard/client/orders/page.tsx
    - Display all client orders sorted by date descending
    - Implement status filter
    - Use OrderCard components with AnimatedList
    - _Requirements: 11.1, 11.2_
  
  - [ ] 21.2 Implement order details and actions
    - Show OrderDetailsModal with tracking info for shipped orders
    - Add request refund button for eligible orders
    - Add leave review button for delivered orders
    - _Requirements: 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 21.3 Write property test for order sorting consistency
    - **Property 12: Order Sorting Consistency**
    - **Validates: Requirements 11.1**

- [ ] 22. Client Dashboard - Wishlist
  - [ ] 22.1 Create app/dashboard/client/wishlist/page.tsx
    - Display all wishlist products with current prices
    - Show unavailable indicator for inactive products
    - Show price change indicators
    - Add to cart button for each product
    - Remove from wishlist button
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 23. Client Dashboard - Addresses
  - [ ] 23.1 Create app/dashboard/client/addresses/page.tsx
    - Display all saved addresses with labels
    - Add new address button with form modal
    - Edit address button for each address
    - Delete address button with confirmation
    - Set default address toggle
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_
  
  - [ ]* 23.2 Write property test for address CRUD operations
    - **Property 15: Address CRUD Operations**
    - **Validates: Requirements 13.2, 13.3, 13.4, 31.1, 31.2, 31.3**

- [ ] 24. Client Dashboard - Reviews
  - [ ] 24.1 Create app/dashboard/client/reviews/page.tsx
    - Display all client reviews with product names
    - Show fournisseur responses when available
    - Add edit review button
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 25. Client Dashboard - Account Settings
  - [ ] 25.1 Create app/dashboard/client/settings/page.tsx
    - Profile update form with validation
    - Password change form with current password verification
    - Notification preferences toggles
    - Use validation utilities
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ]* 25.2 Write property test for password change security
    - **Property 19: Password Change Security**
    - **Validates: Requirements 15.5**

- [ ] 26. Checkpoint - Ensure client dashboard works
  - Test all client features with mock data
  - Verify order management and reviews
  - Test wishlist and address management
  - Ensure all tests pass, ask the user if questions arise

- [ ] 27. Fournisseur Dashboard - Enhanced Overview
  - [ ] 27.1 Update app/dashboard/fournisseur/page.tsx
    - Add ApprovalStatusBanner at top
    - Disable "Add Product" button if not approved
    - Keep existing stats cards
    - Add real data from Firebase
    - _Requirements: 3.5, 22.7_
  
  - [ ]* 27.2 Write property test for non-approved user action prevention
    - **Property 2: Non-Approved User Action Prevention**
    - **Validates: Requirements 3.3, 4.3, 17.6, 22.7**

- [ ] 28. Fournisseur Dashboard - Product Management
  - [ ] 28.1 Create app/dashboard/fournisseur/products/page.tsx
    - Display all fournisseur products with DataTable
    - Show stock levels and status
    - Add product button (disabled if not approved)
    - Edit and delete (soft) buttons for each product
    - _Requirements: 22.2, 22.3, 22.4, 22.5_
  
  - [ ] 28.2 Create app/dashboard/fournisseur/products/new/page.tsx
    - Product creation form with validation
    - Image upload support
    - Price tier configuration
    - Save to Firebase
    - _Requirements: 22.1_
  
  - [ ] 28.3 Create app/dashboard/fournisseur/products/[id]/page.tsx
    - Product edit form
    - Inventory update
    - Product analytics (views, sales, revenue)
    - _Requirements: 22.3, 22.5, 22.6_

- [ ] 29. Fournisseur Dashboard - Order Management
  - [ ] 29.1 Create app/dashboard/fournisseur/orders/page.tsx
    - Display all orders containing fournisseur products
    - Implement status filter
    - Use OrderCard components
    - _Requirements: 21.1, 21.2_
  
  - [ ] 29.2 Implement order status updates
    - Update to 'processing' with notification
    - Update to 'shipped' with tracking number requirement
    - Handle cancellation with notification
    - Verify fournisseur owns products in order
    - _Requirements: 21.3, 21.4, 21.5, 21.6, 21.7_
  
  - [ ]* 29.3 Write property test for fournisseur order authorization
    - **Property 22: Fournisseur Order Authorization**
    - **Validates: Requirements 21.7**
  
  - [ ]* 29.4 Write property test for shipped order tracking requirement
    - **Property 24: Shipped Order Tracking Requirement**
    - **Validates: Requirements 21.4**

- [ ] 30. Fournisseur Dashboard - Customer Messages
  - [ ] 30.1 Create app/dashboard/fournisseur/messages/page.tsx
    - Display all conversations sorted by last message date
    - Show unread count on dashboard
    - _Requirements: 23.1, 23.5_
  
  - [ ] 30.2 Create app/dashboard/fournisseur/messages/[id]/page.tsx
    - Display all messages in conversation
    - Message input and send functionality
    - Mark as read functionality
    - Send notifications to client
    - _Requirements: 23.2, 23.3, 23.4_
  
  - [ ]* 30.3 Write property test for message conversation sorting
    - **Property 25: Message Conversation Sorting**
    - **Validates: Requirements 23.1**

- [ ] 31. Fournisseur Dashboard - Analytics
  - [ ] 31.1 Create app/dashboard/fournisseur/analytics/page.tsx
    - Display sales trends over time
    - Show product performance metrics
    - Display revenue breakdown
    - _Requirements: 22.6_

- [ ] 32. Checkpoint - Ensure fournisseur dashboard works
  - Test all fournisseur features with mock data
  - Verify approval status checks
  - Test product and order management
  - Ensure all tests pass, ask the user if questions arise

- [ ] 33. Marketiste Dashboard - Overview
  - [ ] 33.1 Create app/dashboard/marketiste/page.tsx
    - Add ApprovalStatusBanner at top
    - Display total codes count
    - Display total earnings
    - Display pending earnings
    - Display conversion rate
    - Calculate statistics from Firebase
    - _Requirements: 4.5, 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 34. Marketiste Dashboard - Marketing Codes
  - [ ] 34.1 Create app/dashboard/marketiste/codes/page.tsx
    - Display all marketiste codes with usage statistics
    - Add create code button (disabled if not approved)
    - Edit code button for each code
    - Deactivate code button
    - Show code performance metrics
    - _Requirements: 17.2, 17.3, 17.4, 17.5, 17.6_
  
  - [ ] 34.2 Implement code creation and editing
    - Code creation form with uniqueness validation
    - Commission rate configuration
    - Validity date settings
    - Linked products/fournisseurs selection
    - _Requirements: 17.1, 17.3_

- [ ] 35. Marketiste Dashboard - Earnings
  - [ ] 35.1 Create app/dashboard/marketiste/earnings/page.tsx
    - Display total earnings breakdown by code
    - Separate pending vs paid earnings
    - Show earnings history with dates
    - Add request payout button
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  
  - [ ]* 35.2 Write property test for marketiste earnings calculation
    - **Property 21: Marketiste Earnings Calculation**
    - **Validates: Requirements 18.5, 18.6**

- [ ] 36. Marketiste Dashboard - Orders
  - [ ] 36.1 Create app/dashboard/marketiste/orders/page.tsx
    - Display all orders using marketiste codes
    - Show commission amount for each order
    - Implement code filter
    - Display order and commission payment status
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [ ] 37. Marketiste Dashboard - Analytics
  - [ ] 37.1 Create app/dashboard/marketiste/analytics/page.tsx
    - Display code usage trends over time
    - Show top performing codes by earnings
    - Display conversion funnel metrics
    - _Requirements: 20.1, 20.2, 20.3, 20.4_

- [ ] 38. Checkpoint - Ensure marketiste dashboard works
  - Test all marketiste features with mock data
  - Verify approval status checks
  - Test code management and earnings
  - Ensure all tests pass, ask the user if questions arise

- [ ] 39. Middleware and Route Protection
  - [ ] 39.1 Update middleware.ts for approval checks
    - Check approval status for fournisseur/marketiste routes
    - Redirect pending users to /approval-pending
    - Redirect rejected users to /approval-rejected
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_
  
  - [ ] 39.2 Create approval status pages
    - Create app/approval-pending/page.tsx
    - Create app/approval-rejected/page.tsx
    - Display appropriate messages in French
    - _Requirements: 3.1, 3.2, 4.1, 4.2_

- [ ] 40. User Registration Enhancement
  - [ ] 40.1 Update registration flow to set approval status
    - Set approvalStatus='pending' for fournisseur/marketiste
    - Set approvalStatus='approved' for client/admin
    - Update user creation in Firebase
    - _Requirements: 2.5, 2.6_
  
  - [ ]* 40.2 Write property test for user registration default approval status
    - **Property 1: User Registration Default Approval Status**
    - **Validates: Requirements 2.5, 2.6**

- [ ] 41. Responsive Design Implementation
  - [ ] 41.1 Ensure all dashboards are responsive
    - Test on mobile (320px+), tablet (768px+), desktop (1024px+)
    - Use Tailwind responsive classes
    - Ensure touch targets are 44x44px minimum on mobile
    - Implement mobile-friendly navigation
    - _Requirements: 38.1, 38.2, 38.3, 38.4, 38.5, 38.6_

- [ ] 42. French Language Consistency
  - [ ] 42.1 Review and ensure all UI text is in French
    - Check all dashboard pages
    - Check all error messages
    - Check all notifications
    - Format dates with French locale (date-fns)
    - Format currency with French locale
    - _Requirements: 37.1, 37.2, 37.3, 37.4, 37.5, 37.6_

- [ ] 43. Performance Optimization
  - [ ] 43.1 Implement pagination for large lists
    - Add pagination to DataTable component
    - Limit Firebase queries to 50 items per page
    - _Requirements: 39.1, 39.2_
  
  - [ ] 43.2 Implement lazy loading and caching
    - Add lazy loading for images
    - Use Next.js dynamic imports for large components
    - Cache frequently accessed data in Zustand stores
    - _Requirements: 39.3, 39.4, 39.5_

- [ ] 44. Firebase Security Rules
  - [ ] 44.1 Update Firestore security rules
    - Restrict user data access by role
    - Ensure fournisseurs can only update their own products
    - Ensure marketistes can only update their own codes
    - Ensure clients can only access their own orders
    - _Requirements: 40.2, 40.3_

- [ ] 45. Final Integration and Testing
  - [ ] 45.1 Integration testing with real Firebase
    - Test complete user flows for all roles
    - Test approval workflows
    - Test order creation and status updates
    - Test notifications
    - _Requirements: All_
  
  - [ ] 45.2 End-to-end testing
    - Test client purchasing flow
    - Test fournisseur order fulfillment
    - Test marketiste code usage and earnings
    - Test admin approval and management
    - _Requirements: All_
  
  - [ ]* 45.3 Run all property tests
    - Execute all 27 property tests with 100+ iterations each
    - Fix any failing tests
    - Ensure all properties hold
    - _Requirements: All correctness properties_

- [ ] 46. Invoice PDF Generation System
  - [ ] 46.1 Install PDF generation libraries
    - Install jsPDF and jspdf-autotable
    - Install @types/jspdf for TypeScript support
    - _Requirements: 41.1, 41.2, 41.3_
  
  - [ ] 46.2 Create Invoice type and data model
    - Add Invoice interface to types/index.ts
    - Include all order and payment details
    - _Requirements: 41.1, 41.2, 41.3, 41.4, 41.5_
  
  - [ ] 46.3 Create lib/services/invoiceService.ts
    - Implement generateInvoicePDF function
    - Format invoice with company branding
    - Include product table with totals
    - Add payment information section
    - Implement downloadInvoice function
    - Implement createInvoiceFromOrder function
    - _Requirements: 41.1, 41.2, 41.3, 41.4, 41.5_
  
  - [ ] 46.4 Create lib/firebase/invoices.ts
    - Implement saveInvoice function
    - Implement getInvoice function
    - Implement getInvoiceByOrderId function
    - Implement getClientInvoices function
    - Implement getFournisseurInvoices function
    - _Requirements: 41.7, 44.1, 44.2_
  
  - [ ] 46.5 Add invoice download to order details
    - Add "Download Invoice" button for paid orders
    - Generate and download PDF on click
    - Save invoice metadata to Firebase
    - Show invoice in client, fournisseur, and admin dashboards
    - _Requirements: 41.1, 41.6_
  
  - [ ] 46.6 Create invoice management page for fournisseur
    - Create app/dashboard/fournisseur/invoices/page.tsx
    - Display all invoices with filters
    - Add export to CSV functionality
    - Show revenue statistics
    - _Requirements: 44.1, 44.2, 44.3, 44.4, 44.5_

- [ ] 47. Payment System Integration
  - [ ] 47.1 Create payment types and models
    - Add PaymentMethodType, PaymentMethod, PaymentMethodConfig to types
    - Add PaymentIntent interface
    - _Requirements: 42.1, 42.2, 42.3, 42.4, 42.8_
  
  - [ ] 47.2 Install payment libraries
    - Install @stripe/stripe-js and stripe
    - Install @paypal/react-paypal-js
    - _Requirements: 42.1, 42.2_
  
  - [ ] 47.3 Create lib/services/stripeService.ts
    - Implement getStripe function
    - Implement createStripePaymentIntent function
    - Implement confirmStripePayment function
    - _Requirements: 42.1, 42.5, 42.6, 42.7_
  
  - [ ] 47.4 Create lib/services/paypalService.ts
    - Implement createPayPalOrder function
    - Implement capturePayPalOrder function
    - _Requirements: 42.2, 42.5, 42.6, 42.7_
  
  - [ ] 47.5 Create lib/services/mobileMoneyService.ts
    - Implement initiateMobileMoneyPayment function
    - Implement checkMobileMoneyPaymentStatus function
    - Support Orange Money, MTN, Moov Money
    - _Requirements: 42.3, 42.5, 42.6, 42.7_
  
  - [ ] 47.6 Create lib/firebase/paymentConfig.ts
    - Implement getPaymentMethods function
    - Implement getActivePaymentMethods function
    - Implement updatePaymentMethod function
    - Implement getPaymentMethodConfig function
    - Implement initializePaymentMethods function
    - _Requirements: 43.1, 43.2, 43.7_
  
  - [ ] 47.7 Create lib/firebase/paymentIntents.ts
    - Implement createPaymentIntent function
    - Implement getPaymentIntent function
    - Implement updatePaymentIntentStatus function
    - Implement getOrderPaymentIntents function
    - _Requirements: 42.8, 42.9_
  
  - [ ] 47.8 Create payment method selection component
    - Create components/checkout/PaymentMethodSelector.tsx
    - Display active payment methods
    - Handle method selection
    - Show payment forms based on selected method
    - _Requirements: 42.5, 43.7_
  
  - [ ] 47.9 Create Stripe payment component
    - Create components/checkout/StripePayment.tsx
    - Integrate Stripe Elements
    - Handle payment confirmation
    - Update order status on success
    - _Requirements: 42.1, 42.6, 42.7_
  
  - [ ] 47.10 Create PayPal payment component
    - Create components/checkout/PayPalPayment.tsx
    - Integrate PayPal buttons
    - Handle order capture
    - Update order status on success
    - _Requirements: 42.2, 42.6, 42.7_
  
  - [ ] 47.11 Create Mobile Money payment component
    - Create components/checkout/MobileMoneyPayment.tsx
    - Phone number input and validation
    - Provider selection
    - Payment status polling
    - _Requirements: 42.3, 42.6, 42.7_
  
  - [ ] 47.12 Create Bank Transfer instructions component
    - Create components/checkout/BankTransferInstructions.tsx
    - Display bank account details
    - Show payment instructions
    - Manual confirmation workflow
    - _Requirements: 42.4, 42.5_

- [ ] 48. Admin Payment Configuration
  - [ ] 48.1 Create app/dashboard/admin/payments/page.tsx
    - Display all payment methods
    - Enable/disable toggles
    - Configuration forms for each method
    - Test payment credentials
    - _Requirements: 43.1, 43.2, 43.6_
  
  - [ ] 48.2 Create payment method configuration forms
    - Stripe configuration (API keys)
    - PayPal configuration (Client ID/Secret)
    - Mobile Money configuration (Merchant credentials)
    - Bank Transfer configuration (Account details)
    - Secure credential storage
    - _Requirements: 43.3, 43.4, 43.5_

- [ ] 49. Email Service Integration
  - [ ] 49.1 Create lib/services/emailService.ts
    - Implement sendEmail function
    - Implement generatePaymentReceiptEmail function
    - Professional HTML email templates
    - _Requirements: 45.1, 45.2, 45.3, 45.4, 45.5_
  
  - [ ] 49.2 Send payment receipt emails
    - Trigger email on successful payment
    - Include order details and transaction ID
    - Include invoice download link
    - _Requirements: 45.1, 45.2, 45.3_
  
  - [ ] 49.3 Create email templates
    - Payment receipt template
    - Order confirmation template
    - Shipping notification template
    - Approval notification template
    - _Requirements: 45.4_

- [ ] 50. Checkout Flow Enhancement
  - [ ] 50.1 Create app/checkout/page.tsx
    - Display cart items
    - Shipping address selection
    - Payment method selection
    - Order summary with totals
    - Marketing code input
    - _Requirements: 42.5_
  
  - [ ] 50.2 Implement payment processing
    - Create order in Firebase
    - Process payment based on selected method
    - Handle payment success/failure
    - Send confirmation email
    - Generate and save invoice
    - Redirect to order confirmation
    - _Requirements: 42.6, 42.7, 42.8, 45.1_
  
  - [ ] 50.3 Create order confirmation page
    - Create app/checkout/success/page.tsx
    - Display order details
    - Show payment confirmation
    - Download invoice button
    - Track order button
    - _Requirements: 41.1, 42.6_

- [ ] 51. Payment Webhooks (Backend)
  - [ ] 51.1 Create API routes for payment webhooks
    - Create app/api/webhooks/stripe/route.ts
    - Create app/api/webhooks/paypal/route.ts
    - Verify webhook signatures
    - Update order status automatically
    - Send notifications
    - _Requirements: 42.9_

- [ ] 52. Checkpoint - Payment and Invoice System
  - Test invoice generation with real orders
  - Test all payment methods
  - Verify payment webhooks
  - Test email sending
  - Ensure secure credential storage
  - Ask the user if questions arise

- [ ] 53. Final Checkpoint - Production Ready
  - Verify all features work correctly
  - Check responsive design on all devices
  - Verify French language consistency
  - Test error handling and loading states
  - Ensure all animations work smoothly
  - Test complete purchase flow with all payment methods
  - Verify invoice generation and download
  - Test email notifications
  - Confirm all tests pass
  - Ask the user for final approval

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All UI text must be in French
- Use Framer Motion for all animations
- Use @faker-js/faker for generating test data
- Tailwind CSS v3.4.1 is already configured and working
- Payment credentials must be stored securely (use environment variables or Firebase secure storage)
- Test payment integrations in sandbox/test mode before production


## Phase 2: Multi-Currency System

- [x] 54. Multi-Currency Type Definitions
  - [x] 54.1 Add currency types to types/index.ts
    - Add SupportedCurrency type (USD, XOF, XAF, GHS, NGN, KES, TZS, UGX, ZAR, MAD, EGP, ETB, GNF, RWF, MGA, MUR)
    - Add CurrencyInfo interface (code, name, symbol, flag, decimals)
    - Add ExchangeRate interface (baseCurrency, targetCurrency, rate, timestamp, source)
    - Add CurrencyPreference interface (userId, currency, autoDetect, updatedAt)
    - _Requirements: 46.1, 46.2, 46.7_
  
  - [x] 54.2 Extend Order interface with currency fields
    - Add displayCurrency field
    - Add exchangeRate field
    - Add displayTotal field
    - Add displaySubtotal field
    - Add displayShippingFee field
    - _Requirements: 49.1, 49.2, 49.3, 49.4_

- [x] 55. Currency Constants and Configuration
  - [x] 55.1 Create lib/constants/currencies.ts
    - Define SUPPORTED_CURRENCIES object with all 16 currencies
    - Include currency info (symbol, name, flag, decimals) for each
    - Define BASE_CURRENCY constant as 'USD'
    - _Requirements: 46.5, 46.7_

- [x] 56. Exchange Rate Service
  - [x] 56.1 Create lib/services/exchangeRateService.ts
    - Implement ExchangeRateService class
    - Add cache Map for storing rates
    - Add CACHE_DURATION constant (1 hour)
    - _Requirements: 46.2, 46.3, 46.4_
  
  - [x] 56.2 Implement exchange rate fetching
    - Implement getExchangeRate(targetCurrency) method
    - Implement updateRates() method with API call
    - Use exchangerate-api.com API
    - Handle API errors gracefully
    - _Requirements: 46.2, 46.3, 48.4_
  
  - [x] 56.3 Implement cache management
    - Implement isCacheValid() method
    - Return cached rates when valid
    - Auto-update when cache expires
    - _Requirements: 46.4_
  
  - [x] 56.4 Implement conversion utilities
    - Implement convertPrice(amountUSD, targetCurrency) method
    - Implement formatPrice(amount, currency) method
    - Implement getAllRates() method
    - _Requirements: 46.3, 46.7_

- [x] 57. Currency Store (Zustand)
  - [x] 57.1 Create store/currencyStore.ts
    - Define CurrencyState interface
    - Add selectedCurrency state
    - Add exchangeRates Map state
    - Add loading and error states
    - Add lastUpdate state
    - _Requirements: 46.6, 46.8_
  
  - [x] 57.2 Implement currency actions
    - Implement setCurrency(currency) action
    - Implement updateExchangeRates() action
    - Implement convertPrice(amountUSD) action
    - Implement formatPrice(amount) action
    - _Requirements: 46.6, 46.3_
  
  - [x] 57.3 Add persistence with localStorage
    - Use zustand persist middleware
    - Persist selectedCurrency and lastUpdate
    - Load on app initialization
    - _Requirements: 46.8_

- [x] 58. Currency Selector Component
  - [x] 58.1 Create components/ui/CurrencySelector.tsx
    - Create dropdown with all supported currencies
    - Display flag emoji for each currency
    - Show currency code and name
    - Highlight selected currency
    - _Requirements: 46.10_
  
  - [x] 58.2 Implement dropdown interactions
    - Toggle dropdown on click
    - Close on outside click (useRef + useEffect)
    - Update store on currency selection
    - Use Framer Motion for animations
    - _Requirements: 46.6, 46.10_
  
  - [x] 58.3 Add flag emoji utility
    - Implement getFlagEmoji(countryCode) function
    - Convert country code to flag emoji
    - _Requirements: 46.10_

- [x] 59. Price Display Component
  - [x] 59.1 Create components/ui/PriceDisplay.tsx
    - Accept priceUSD prop
    - Accept className prop
    - Accept showOriginal prop (show USD alongside)
    - _Requirements: 46.3, 46.7_
  
  - [x] 59.2 Implement price conversion
    - Use useCurrencyStore hook
    - Convert price on mount and currency change
    - Format with currency symbol
    - Show loading state during conversion
    - _Requirements: 46.3, 46.6_
  
  - [x] 59.3 Handle conversion errors
    - Fallback to USD on error
    - Log errors to console
    - _Requirements: 46.3, 48.4_

- [x] 60. Integrate Currency System
  - [x] 60.1 Add CurrencySelector to Header
    - Import and add CurrencySelector component
    - Position next to user menu
    - Style to match header design
    - _Requirements: 46.10_
  
  - [x] 60.2 Initialize exchange rates on app load
    - Call updateExchangeRates() in root layout
    - Handle initialization errors
    - _Requirements: 46.2, 46.3_
  
  - [x] 60.3 Replace price displays with PriceDisplay component
    - Update homepage product cards
    - Update product detail page
    - Update cart items
    - Update order summaries
    - Update dashboard statistics
    - _Requirements: 46.3, 46.7_

- [x] 61. Order Currency Locking
  - [x] 61.1 Lock exchange rate at order creation
    - Get current exchange rate when creating order
    - Store rate in order document
    - Store displayCurrency in order document
    - Calculate and store displayTotal
    - _Requirements: 49.1, 49.2, 49.3, 49.4_
  
  - [x] 61.2 Display locked prices in order details
    - Show prices in both USD and display currency
    - Use locked exchange rate from order
    - Display exchange rate used
    - _Requirements: 49.2_
  
  - [x] 61.3 Use locked rate for refunds
    - Calculate refund amount using original rate
    - Store refund in both currencies
    - _Requirements: 49.3_

- [ ] 62. Commission Currency Conversion
  - [ ] 62.1 Display marketiste commissions in preferred currency
    - Convert USD commissions to marketiste's currency
    - Show both USD and local currency
    - _Requirements: 50.2, 50.3_
  
  - [ ] 62.2 Allow currency selection for payouts
    - Add currency selector in payout request
    - Calculate payout amount in selected currency
    - _Requirements: 50.3_
  
  - [ ] 62.3 Show exchange rate impact on earnings
    - Display historical exchange rates
    - Show earnings trend in local currency
    - _Requirements: 50.5_

- [x] 63. Admin Exchange Rate Management
  - [x] 63.1 Create app/dashboard/admin/exchange-rates/page.tsx
    - Display current rates for all currencies
    - Show last update timestamp
    - Add manual refresh button
    - _Requirements: 48.1, 48.7_
  
  - [x] 63.2 Implement API configuration
    - Add exchange rate API key input
    - Validate API key
    - Support multiple providers (exchangerate-api, fixer, currencyapi)
    - _Requirements: 48.2, 48.3_
  
  - [x] 63.3 Add manual rate override
    - Allow admin to set custom rates
    - Store overrides in Firebase
    - Use overrides instead of API rates
    - _Requirements: 48.6_
  
  - [x] 63.4 Implement rate monitoring
    - Display last update time
    - Show warning if rates haven't updated in 24h
    - Send alerts to admin
    - Log all rate updates
    - _Requirements: 48.4, 48.5, 48.7, 48.8_

- [x] 64. Environment Variables Setup
  - [x] 64.1 Add exchange rate API key to .env.local
    - Add NEXT_PUBLIC_EXCHANGE_RATE_API_KEY
    - Document in README
    - _Requirements: 46.2_

- [ ] 65. Testing Multi-Currency System
  - [ ]* 65.1 Write property test for currency conversion accuracy
    - Test that converting USD to currency and back returns original amount (within rounding)
    - Test with all supported currencies
    - _Requirements: 46.3_
  
  - [ ]* 65.2 Write property test for order currency locking
    - Test that order total remains constant regardless of exchange rate changes
    - Test that locked rate is used for all order calculations
    - _Requirements: 49.1, 49.2, 49.3_
  
  - [ ] 65.3 Write unit tests for ExchangeRateService
    - Test getExchangeRate with valid currency
    - Test cache validity checking
    - Test API error handling
    - Test rate conversion
    - _Requirements: 46.2, 46.3, 46.4_
  
  - [ ] 65.4 Write unit tests for currency components
    - Test CurrencySelector rendering
    - Test currency selection
    - Test PriceDisplay conversion
    - Test PriceDisplay error handling
    - _Requirements: 46.3, 46.6, 46.10_

- [ ] 66. Checkpoint - Multi-Currency System Complete
  - Test currency selector in header
  - Verify all prices convert correctly
  - Test with different currencies
  - Verify cache works (check network tab)
  - Test order creation with currency locking
  - Test commission calculations
  - Verify admin exchange rate management
  - Ensure all tests pass
  - Ask the user if questions arise

