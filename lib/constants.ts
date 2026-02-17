export const CATEGORIES = [
  'Électronique',
  'Mode & Vêtements',
  'Maison & Jardin',
  'Sport & Loisirs',
  'Beauté & Santé',
  'Jouets & Enfants',
  'Alimentation',
  'Automobile',
  'Bijoux & Accessoires',
  'Bureautique',
];

export const COUNTRIES = [
  'Chine',
  'États-Unis',
  'Allemagne',
  'France',
  'Royaume-Uni',
  'Japon',
  'Corée du Sud',
  'Inde',
  'Italie',
  'Espagne',
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dollar américain' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling' },
  { code: 'CNY', symbol: '¥', name: 'Yuan chinois' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonais' },
];

export const ORDER_STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

export const NOTIFICATION_TYPES = {
  order_created: 'Nouvelle commande',
  order_paid: 'Commande payée',
  order_shipped: 'Commande expédiée',
  order_delivered: 'Commande livrée',
  message_received: 'Nouveau message',
  code_used: 'Code utilisé',
  review_received: 'Nouvel avis',
  product_low_stock: 'Stock faible',
};

export const PLATFORM_FEE_RATE = 0.05; // 5%
export const DEFAULT_MARKETING_COMMISSION_RATE = 0.1; // 10%

export const MOQ_OPTIONS = [1, 10, 50, 100, 500, 1000];

export const DELIVERY_TIME_OPTIONS = [
  '1-3 jours',
  '3-7 jours',
  '7-15 jours',
  '15-30 jours',
  '30-45 jours',
];

export const RATING_LABELS = {
  5: 'Excellent',
  4: 'Très bien',
  3: 'Bien',
  2: 'Moyen',
  1: 'Mauvais',
};
