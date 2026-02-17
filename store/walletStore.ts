import { create } from 'zustand';
import {
  Wallet,
  Transaction,
  TransactionFilters,
  DepositData,
  WithdrawalData,
  PaymentData,
  FlexibleTransaction,
  FlexibleDepositData,
  FlexibleWithdrawalData,
  TransactionFiltersExtended
} from '@/types';
import {
  getWallet,
  getTransactionHistory,
  initiateDeposit,
  initiateWithdrawal,
  processPayment,
  setPIN,
  verifyPIN,
  calculateDepositFees,
  calculateWithdrawalFees
} from '@/lib/firebase/wallet';
import {
  initiateFlexibleDeposit,
  initiateFlexibleWithdrawal,
  getPendingFlexibleTransactions,
  getFlexibleTransactionsWithFilters,
  validateFlexibleDeposit,
  validateFlexibleWithdrawal,
  rejectFlexibleDeposit,
  rejectFlexibleWithdrawal
} from '@/lib/firebase/flexibleWallet';

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  flexibleTransactions: FlexibleTransaction[];
  pendingTransactions: FlexibleTransaction[];
  loading: boolean;
  error: string | null;

  // Actions classiques
  fetchWallet: (userId: string) => Promise<void>;
  fetchTransactions: (userId: string, filters?: TransactionFilters) => Promise<void>;
  initiateDeposit: (userId: string, data: DepositData) => Promise<Transaction>;
  initiateWithdrawal: (userId: string, data: WithdrawalData) => Promise<Transaction>;
  processPayment: (fromUserId: string, data: PaymentData) => Promise<Transaction>;
  setPIN: (userId: string, pin: string) => Promise<void>;
  verifyPIN: (userId: string, pin: string) => Promise<boolean>;
  calculateDepositFees: (amount: number) => Promise<number>;
  calculateWithdrawalFees: (amount: number) => Promise<number>;
  
  // Actions flexibles
  initiateFlexibleDeposit: (userId: string, data: FlexibleDepositData) => Promise<FlexibleTransaction>;
  initiateFlexibleWithdrawal: (userId: string, data: FlexibleWithdrawalData) => Promise<FlexibleTransaction>;
  fetchPendingTransactions: (type?: 'deposit' | 'withdrawal') => Promise<void>;
  fetchFlexibleTransactions: (filters: TransactionFiltersExtended) => Promise<void>;
  validateDeposit: (transactionId: string, adminId: string, notes?: string) => Promise<void>;
  validateWithdrawal: (transactionId: string, adminId: string, notes?: string) => Promise<void>;
  rejectDeposit: (transactionId: string, adminId: string, reason: string) => Promise<void>;
  rejectWithdrawal: (transactionId: string, adminId: string, reason: string) => Promise<void>;
  
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  transactions: [],
  flexibleTransactions: [],
  pendingTransactions: [],
  loading: false,
  error: null,

  fetchWallet: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const wallet = await getWallet(userId);
      set({ wallet, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchTransactions: async (userId: string, filters?: TransactionFilters) => {
    set({ loading: true, error: null });
    try {
      const transactions = await getTransactionHistory(userId, filters);
      set({ transactions, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  initiateDeposit: async (userId: string, data: DepositData) => {
    set({ loading: true, error: null });
    try {
      const transaction = await initiateDeposit(userId, data);
      
      // Rafraîchir le portefeuille et les transactions
      await get().fetchWallet(userId);
      await get().fetchTransactions(userId);
      
      set({ loading: false });
      return transaction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  initiateWithdrawal: async (userId: string, data: WithdrawalData) => {
    set({ loading: true, error: null });
    try {
      const transaction = await initiateWithdrawal(userId, data);
      
      // Rafraîchir le portefeuille et les transactions
      await get().fetchWallet(userId);
      await get().fetchTransactions(userId);
      
      set({ loading: false });
      return transaction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  processPayment: async (fromUserId: string, data: PaymentData) => {
    set({ loading: true, error: null });
    try {
      const transaction = await processPayment(fromUserId, data);
      
      // Rafraîchir le portefeuille et les transactions
      await get().fetchWallet(fromUserId);
      await get().fetchTransactions(fromUserId);
      
      set({ loading: false });
      return transaction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setPIN: async (userId: string, pin: string) => {
    set({ loading: true, error: null });
    try {
      await setPIN(userId, pin);
      await get().fetchWallet(userId);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  verifyPIN: async (userId: string, pin: string) => {
    set({ loading: true, error: null });
    try {
      const isValid = await verifyPIN(userId, pin);
      set({ loading: false });
      return isValid;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  calculateDepositFees: async (amount: number) => {
    return await calculateDepositFees(amount);
  },

  calculateWithdrawalFees: async (amount: number) => {
    return await calculateWithdrawalFees(amount);
  },

  // Actions flexibles
  initiateFlexibleDeposit: async (userId: string, data: FlexibleDepositData) => {
    set({ loading: true, error: null });
    try {
      const transaction = await initiateFlexibleDeposit(userId, data);
      
      // Rafraîchir le portefeuille
      await get().fetchWallet(userId);
      
      set({ loading: false });
      return transaction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  initiateFlexibleWithdrawal: async (userId: string, data: FlexibleWithdrawalData) => {
    set({ loading: true, error: null });
    try {
      const transaction = await initiateFlexibleWithdrawal(userId, data);
      
      // Rafraîchir le portefeuille
      await get().fetchWallet(userId);
      
      set({ loading: false });
      return transaction;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchPendingTransactions: async (type?: 'deposit' | 'withdrawal') => {
    set({ loading: true, error: null });
    try {
      const transactions = await getPendingFlexibleTransactions(type);
      set({ 
        pendingTransactions: transactions,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchFlexibleTransactions: async (filters: TransactionFiltersExtended) => {
    set({ loading: true, error: null });
    try {
      const transactions = await getFlexibleTransactionsWithFilters(filters);
      set({ 
        flexibleTransactions: transactions,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  validateDeposit: async (transactionId: string, adminId: string, notes?: string) => {
    set({ loading: true, error: null });
    try {
      await validateFlexibleDeposit(transactionId, adminId, notes);
      
      // Rafraîchir les transactions en attente
      await get().fetchPendingTransactions();
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  validateWithdrawal: async (transactionId: string, adminId: string, notes?: string) => {
    set({ loading: true, error: null });
    try {
      await validateFlexibleWithdrawal(transactionId, adminId, notes);
      
      // Rafraîchir les transactions en attente
      await get().fetchPendingTransactions();
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  rejectDeposit: async (transactionId: string, adminId: string, reason: string) => {
    set({ loading: true, error: null });
    try {
      await rejectFlexibleDeposit(transactionId, adminId, reason);
      
      // Rafraîchir les transactions en attente
      await get().fetchPendingTransactions();
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  rejectWithdrawal: async (transactionId: string, adminId: string, reason: string) => {
    set({ loading: true, error: null });
    try {
      await rejectFlexibleWithdrawal(transactionId, adminId, reason);
      
      // Rafraîchir les transactions en attente
      await get().fetchPendingTransactions();
      
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  reset: () => {
    set({
      wallet: null,
      transactions: [],
      flexibleTransactions: [],
      pendingTransactions: [],
      loading: false,
      error: null
    });
  }
}));
