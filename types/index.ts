export type UserRole = 'client' | 'fournisseur' | 'marketiste' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type AccountStatus = 
  | 'email_unverified' 
  | 'phone_unverified' 
  | 'pending_admin_approval' 
  | 'active' 
  | 'rejected' 
  | 'suspended';

export interface VerificationHistoryEntry {
  type: 'email' | 'phone' | 'admin_approval';
  status: 'success' | 'failed';
  timestamp: Date;
  details?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string | null;
  phoneNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Nouveau système de vérification
  accountStatus: AccountStatus;
  
  // Vérification Email
  emailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiry?: Date;
  emailVerificationAttempts: number;
  
  // Vérification Téléphone (Phase 2)
  phoneVerified: boolean;
  phoneVerificationAttempts: number;
  
  // Validation Admin (Phase 2)
  adminApproval?: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Date;
    rejectionReason?: string;
  };
  
  // Historique
  verificationHistory: VerificationHistoryEntry[];
}

export interface Client extends User {
  role: 'client';
  addresses: Address[];
  orders: string[];
  wishlist: string[];
}

export interface Fournisseur extends User {
  role: 'fournisseur';
  shopName: string;
  shopDescription: string;
  shopLogo?: string;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  country: string;
  certifications: string[];
}

export interface Marketiste extends User {
  role: 'marketiste';
  codes: MarketingCode[];
  totalEarnings: number;
  pendingEarnings: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export type ProductCategory = 'ecommerce' | 'restaurant' | 'hotel' | 'dating';

export interface Product {
  id: string;
  fournisseurId: string;
  name: string;
  description: string;
  images: string[];
  videos?: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  sku?: string;
  moq: number;
  prices: PriceTier[];
  stock: number;
  country: string;
  deliveryTime: string;
  certifications: string[];
  rating: number;
  reviewCount: number;
  views: number;
  sales: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // NEW: Service category
  serviceCategory: ProductCategory;
  
  // NEW: Geolocation (for restaurants & hotels)
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  
  // NEW: Restaurant-specific fields
  restaurantData?: {
    cuisineType: string[];
    priceRange: '€' | '€€' | '€€€' | '€€€€';
    openingHours: {
      [day: string]: { open: string; close: string; closed?: boolean };
    };
    features: string[]; // WiFi, Parking, Terrasse, etc.
    menuPDF?: string;
  };
  
  // NEW: Hotel-specific fields
  hotelData?: {
    starRating: 1 | 2 | 3 | 4 | 5;
    roomTypes: {
      type: string;
      price: number;
      description: string;
    }[];
    checkInTime: string;
    checkOutTime: string;
    amenities: string[]; // Piscine, Spa, Restaurant, etc.
  };
  
  // NEW: Dating profile fields
  datingProfile?: {
    firstName: string;
    age: number;
    gender: 'homme' | 'femme' | 'autre';
    height?: number; // in cm
    skinColor?: string;
    eyeColor?: string;
    profession?: string;
    interests?: string[];
    status: 'available' | 'unavailable' | 'archived';
    contactInfo: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    }; // Only visible to intermediary
  };
}

export interface PriceTier {
  minQuantity: number;
  maxQuantity?: number;
  price: number;
  currency: string;
}

export interface MarketingCode {
  id: string;
  code: string;
  marketisteId: string;
  commissionRate: number;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  linkedProducts?: string[];
  linkedFournisseurs?: string[];
  usageCount: number;
  totalEarnings: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  fournisseurId: string;
  marketisteId?: string;
  marketingCode?: string;
  products: OrderProduct[];
  subtotal: number;
  marketingCommission: number;
  platformFee: number;
  shippingFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Currency fields for multi-currency support
  displayCurrency: SupportedCurrency; // Currency shown to client
  exchangeRate: number; // Rate at order creation
  displayTotal: number; // Total in display currency
  displaySubtotal: number;
  displayShippingFee: number;
}

export interface OrderProduct {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  clientId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
  response?: {
    content: string;
    createdAt: Date;
  };
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    transactionId?: string;
    paymentMethodId?: string;
    amount?: number;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: Date;
  
  // Nouveaux champs pour système flexible
  emailSent?: boolean;
  emailSentAt?: Date;
  channel?: 'email' | 'in_app' | 'both';
}

export type NotificationType =
  | 'order_created'
  | 'order_paid'
  | 'order_shipped'
  | 'order_delivered'
  | 'message_received'
  | 'code_used'
  | 'review_received'
  | 'product_low_stock'
  | 'deposit_requested'
  | 'deposit_approved'
  | 'deposit_rejected'
  | 'withdrawal_requested'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'transaction_reminder';

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minMoq?: number;
  maxMoq?: number;
  country?: string;
  verifiedOnly?: boolean;
  minRating?: number;
  fastDelivery?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

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

// Currency types
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

// License System Types
export type LicenseTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface LicenseConfig {
  id: string;
  tier: LicenseTier;
  name: string;
  productQuota: number; // -1 for unlimited
  priceUSD: number; // Annual price
  features: string[];
  isActive: boolean;
}

export interface FournisseurSubscription {
  id: string;
  fournisseurId: string;
  licenseTier: LicenseTier;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUsage {
  fournisseurId: string;
  currentCount: number;
  quota: number;
  lastUpdated: Date;
}

// Contact Request Type (for dating profiles)
export interface ContactRequest {
  id: string;
  profileId: string; // Dating profile ID
  clientId: string;
  intermediaryId: string; // Fournisseur/Marketiste/Admin who added profile
  status: 'pending' | 'approved' | 'rejected' | 'shared';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  sharedAt?: Date;
}

// Vérification Email
export interface EmailVerification {
  id: string;
  userId: string;
  email: string;
  code: string; // 6 chiffres
  createdAt: Date;
  expiresAt: Date; // createdAt + 4 minutes
  attempts: number;
  verified: boolean;
  verifiedAt?: Date;
}

// Vérification Téléphone (Phase 2)
export interface PhoneVerification {
  id: string;
  userId: string;
  phoneNumber: string;
  verificationId: string; // Firebase Auth verification ID
  createdAt: Date;
  expiresAt: Date; // createdAt + 2 minutes
  attempts: number;
  verified: boolean;
  verifiedAt?: Date;
}

// File d'attente validation admin (Phase 2)
export interface AdminApprovalRequest {
  id: string;
  userId: string;
  userRole: 'fournisseur' | 'marketiste';
  userName: string;
  userEmail: string;
  userPhone: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}


// ============================================
// WALLET & MOBILE MONEY TYPES
// ============================================

export type WalletStatus = 'active' | 'suspended' | 'closed';

export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'commission';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type MobileMoneyProvider = 'mtn' | 'orange' | 'moov' | 'wave' | 'vodafone' | 'airtel';

export interface Wallet {
  id: string;                    // ID utilisateur
  userId: string;
  balance: number;               // Solde disponible (FCFA)
  pendingBalance: number;        // Solde en attente (FCFA)
  currency: 'XAF' | 'XOF';      // Devise (FCFA)
  status: WalletStatus;
  pin?: string;                  // Code PIN hashé (bcrypt)
  pinAttempts: number;           // Nombre de tentatives PIN
  lastPinAttempt?: Date;         // Dernière tentative PIN
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;                // Montant (FCFA)
  fees: number;                  // Frais (FCFA)
  totalAmount: number;           // Montant total (amount + fees)
  currency: 'XAF' | 'XOF';
  status: TransactionStatus;
  
  // Mobile Money
  mobileMoneyProvider?: MobileMoneyProvider;
  mobileMoneyNumber?: string;    // Numéro Mobile Money
  mobileMoneyTransactionId?: string; // ID transaction opérateur
  
  // Paiement
  relatedTransactionId?: string; // ID transaction liée (pour paiements)
  recipientWalletId?: string;    // ID portefeuille destinataire
  recipientUserId?: string;      // ID utilisateur destinataire
  orderId?: string;              // ID commande (si paiement)
  
  // Validation
  validatedBy?: string;          // ID admin validateur
  validatedAt?: Date;
  rejectionReason?: string;
  
  // Métadonnées
  reference: string;             // Référence unique
  description: string;
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface MobileMoneyAccount {
  id: string;
  provider: MobileMoneyProvider;
  accountName: string;           // Ex: "InterShop MTN"
  accountNumber: string;         // Numéro Mobile Money
  country: string;               // Code pays (CM, CI, BF, etc.)
  isActive: boolean;
  
  // API Configuration (Phase 2)
  apiKey?: string;
  apiSecret?: string;
  apiEndpoint?: string;
  
  // Statistiques
  totalDeposits: number;
  totalWithdrawals: number;
  balance: number;               // Solde estimé
  
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletSettings {
  id: 'global';                  // Document unique
  
  // Frais
  depositFeePercent: number;     // % frais dépôt
  depositFeeMin: number;         // Frais minimum dépôt
  depositFeeThreshold: number;   // Seuil gratuit dépôt
  
  withdrawalFeePercent: number;  // % frais retrait
  withdrawalFeeMin: number;      // Frais minimum retrait
  withdrawalFeeMax: number;      // Frais maximum retrait
  
  // Limites
  minDeposit: number;            // Dépôt minimum
  minWithdrawal: number;         // Retrait minimum
  maxWithdrawalPerDay: number;   // Retrait max/jour
  maxWithdrawalPerMonth: number; // Retrait max/mois
  
  // Sécurité
  pinRequired: boolean;
  pinLength: number;             // 4 ou 6
  maxPinAttempts: number;        // 3
  twoFactorThreshold: number;    // Montant nécessitant 2FA
  
  // Notifications
  lowBalanceThreshold: number;   // Seuil alerte solde faible
  
  updatedAt: Date;
  updatedBy: string;             // ID admin
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  provider?: MobileMoneyProvider;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface WalletStatistics {
  totalWallets: number;
  activeWallets: number;
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  pendingTransactions: number;
  todayTransactions: number;
  todayVolume: number;
}

export interface DepositData {
  amount: number;
  provider: MobileMoneyProvider;
  phoneNumber: string;
  pin: string;
}

export interface WithdrawalData {
  amount: number;
  provider: MobileMoneyProvider;
  phoneNumber: string;
  pin: string;
}

export interface PaymentData {
  toUserId: string;
  amount: number;
  orderId?: string;
  description: string;
  pin: string;
}

// ============================================
// FLEXIBLE WALLET SYSTEM TYPES
// ============================================

export type PaymentMethodType = 
  | 'mobile_money' 
  | 'mpesa' 
  | 'crypto' 
  | 'bank_transfer' 
  | 'other';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  instructions: string;
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    walletAddress?: string;
    network?: string;
    additionalInfo?: string;
  };
  isActive: boolean;
  icon?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface FlexibleTransaction extends Transaction {
  // Extension des champs Transaction existants
  paymentMethodId?: string;
  paymentMethodName?: string;
  paymentMethodType?: PaymentMethodType;
  
  // Pour dépôts
  clientName?: string;
  
  // Pour retraits
  recipientAccountName?: string;   // Nom du compte de destination (qui apparaîtra lors du transfert)
  recipientAccountNumber?: string; // Numéro de compte/téléphone de destination
  
  proofOfPayment?: {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  };
  
  adminNotes?: string;
}

export interface FlexibleDepositData {
  paymentMethodId: string;
  clientName: string;
  amount: number;
  proofOfPayment?: File;
}

export interface FlexibleWithdrawalData {
  paymentMethodId: string;
  amount: number;
  accountName: string;      // Nom du compte de destination
  accountNumber: string;    // Numéro de compte/téléphone
}

export interface CreatePaymentMethodData {
  name: string;
  type: PaymentMethodType;
  instructions: string;
  accountDetails: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    walletAddress?: string;
    network?: string;
    additionalInfo?: string;
  };
  icon?: string;
  displayOrder?: number;
}

export interface TransactionFiltersExtended extends TransactionFilters {
  paymentMethodId?: string;
  userId?: string;
}
