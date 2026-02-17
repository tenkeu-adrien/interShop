import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { Order, OrderStatus, PaymentStatus, SupportedCurrency } from '@/types';
import { ExchangeRateService } from '@/lib/services/exchangeRateService';

export const createOrder = async (
  orderData: Omit<Order, 'id'>,
  displayCurrency?: SupportedCurrency
): Promise<string> => {
  // Lock exchange rate at order creation
  const currency = displayCurrency || 'USD';
  const exchangeRate = currency === 'USD' ? 1 : await ExchangeRateService.getExchangeRate(currency);
  
  // Calculate display amounts
  const displayTotal = orderData.total * exchangeRate;
  const displaySubtotal = orderData.subtotal * exchangeRate;
  const displayShippingFee = orderData.shippingFee * exchangeRate;
  
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    displayCurrency: currency,
    exchangeRate,
    displayTotal,
    displaySubtotal,
    displayShippingFee,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const docRef = doc(db, 'orders', orderId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Order;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  additionalData?: Partial<Order>
): Promise<void> => {
  const updates: any = { status, updatedAt: new Date(), ...additionalData };

  if (status === 'paid') updates.paidAt = new Date();
  if (status === 'shipped') updates.shippedAt = new Date();
  if (status === 'delivered') updates.deliveredAt = new Date();

  await updateDoc(doc(db, 'orders', orderId), updates);
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<void> => {
  await updateDoc(doc(db, 'orders', orderId), {
    paymentStatus,
    updatedAt: new Date(),
  });
};

export const getClientOrders = async (clientId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
};

export const getFournisseurOrders = async (fournisseurId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('fournisseurId', '==', fournisseurId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
};

export const getMarketisteOrders = async (marketisteId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('marketisteId', '==', marketisteId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];
};

export const refundOrder = async (
  orderId: string,
  refundAmount?: number
): Promise<void> => {
  const order = await getOrder(orderId);
  if (!order) {
    throw new Error('Commande non trouvée');
  }

  // Use locked exchange rate for refund calculation
  const refundAmountUSD = refundAmount || order.total;
  const refundAmountDisplay = refundAmountUSD * order.exchangeRate;

  await updateDoc(doc(db, 'orders', orderId), {
    status: 'refunded',
    paymentStatus: 'refunded',
    refundAmount: refundAmountUSD,
    refundAmountDisplay,
    refundedAt: new Date(),
    updatedAt: new Date(),
  });
};

export const cancelOrder = async (
  orderId: string,
  reason: string
): Promise<void> => {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'cancelled',
    cancellationReason: reason,
    cancelledAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getAllOrders = async (filters?: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  fournisseurId?: string;
  clientId?: string;
}): Promise<Order[]> => {
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.fournisseurId) {
    q = query(q, where('fournisseurId', '==', filters.fournisseurId));
  }
  if (filters?.clientId) {
    q = query(q, where('clientId', '==', filters.clientId));
  }

  const snapshot = await getDocs(q);
  let orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];

  // Filter by date range in memory (Firestore doesn't support multiple range queries)
  if (filters?.startDate) {
    orders = orders.filter(order => order.createdAt >= filters.startDate!);
  }
  if (filters?.endDate) {
    orders = orders.filter(order => order.createdAt <= filters.endDate!);
  }

  return orders;
};
