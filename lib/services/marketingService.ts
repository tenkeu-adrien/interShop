import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MarketingCode, Product, OrderProduct } from '@/types';

/**
 * Résultat de la validation d'un code marketing
 */
export interface MarketingCodeValidation {
  valid: boolean;
  message: string;
  code?: MarketingCode;
  applicableProducts: {
    productId: string;
    canApplyDiscount: boolean;
    reason?: string;
    discountPercentage: number;
    commissionRate: number;
  }[];
  totalDiscount: number;
  totalCommission: number;
}

/**
 * Service de gestion des codes marketing
 */
export class MarketingService {
  /**
   * Valide un code marketing et calcule les réductions applicables
   */
  static async validateMarketingCode(
    codeString: string,
    cartItems: { productId: string; quantity: number; price: number }[]
  ): Promise<MarketingCodeValidation> {
    console.log('🔍 Validation du code marketing:', codeString);
    console.log('📦 Produits dans le panier:', cartItems.length);

    try {
      // 1. Récupérer le code marketing
      const codeQuery = query(
        collection(db, 'marketingCodes'),
        where('code', '==', codeString.toUpperCase())
      );
      const codeSnapshot = await getDocs(codeQuery);

      if (codeSnapshot.empty) {
        return {
          valid: false,
          message: 'Code invalide',
          applicableProducts: [],
          totalDiscount: 0,
          totalCommission: 0,
        };
      }

      const codeDoc = codeSnapshot.docs[0];
      const code = { id: codeDoc.id, ...codeDoc.data() } as MarketingCode;

      // 2. Vérifier si le code est actif
      if (!code.isActive) {
        return {
          valid: false,
          message: 'Code inactif',
          applicableProducts: [],
          totalDiscount: 0,
          totalCommission: 0,
        };
      }

      // 3. Vérifier la période de validité
      const now = new Date();
      if (now < code.validFrom) {
        return {
          valid: false,
          message: 'Code pas encore valide',
          applicableProducts: [],
          totalDiscount: 0,
          totalCommission: 0,
        };
      }

      if (code.validUntil && now > code.validUntil) {
        return {
          valid: false,
          message: 'Code expiré',
          applicableProducts: [],
          totalDiscount: 0,
          totalCommission: 0,
        };
      }

      // 4. Récupérer les détails des produits
      const productIds = cartItems.map(item => item.productId);
      const products = await this.getProductsByIds(productIds);

      // 5. Vérifier l'applicabilité pour chaque produit
      const applicableProducts = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);

        if (!product) {
          return {
            productId: item.productId,
            canApplyDiscount: false,
            reason: 'Produit non trouvé',
            discountPercentage: 0,
            commissionRate: 0,
          };
        }

        // Vérifier si le code est lié à des produits spécifiques
        if (code.linkedProducts && code.linkedProducts.length > 0) {
          if (!code.linkedProducts.includes(product.id)) {
            return {
              productId: item.productId,
              canApplyDiscount: false,
              reason: 'Code non applicable à ce produit',
              discountPercentage: 0,
              commissionRate: 0,
            };
          }
        }

        // Vérifier si le code est lié à des fournisseurs spécifiques
        if (code.linkedFournisseurs && code.linkedFournisseurs.length > 0) {
          if (!code.linkedFournisseurs.includes(product.fournisseurId)) {
            return {
              productId: item.productId,
              canApplyDiscount: false,
              reason: 'Code non applicable à ce fournisseur',
              discountPercentage: 0,
              commissionRate: 0,
            };
          }
        }

        // Vérifier les paramètres marketing du produit (définis par le fournisseur)
        if (!product.marketingSettings || !product.marketingSettings.allowsMarketingCodes) {
          return {
            productId: item.productId,
            canApplyDiscount: false,
            reason: 'Le fournisseur n\'accepte pas les codes promo pour ce produit',
            discountPercentage: 0,
            commissionRate: 0,
          };
        }

        // Vérifier la quantité minimum
        if (item.quantity < product.marketingSettings.minQuantityForDiscount) {
          return {
            productId: item.productId,
            canApplyDiscount: false,
            reason: `Quantité minimum requise: ${product.marketingSettings.minQuantityForDiscount}`,
            discountPercentage: 0,
            commissionRate: 0,
          };
        }

        // Tout est OK, la réduction peut être appliquée
        return {
          productId: item.productId,
          canApplyDiscount: true,
          discountPercentage: product.marketingSettings.discountPercentage,
          commissionRate: product.marketingSettings.marketisteCommissionRate,
        };
      });

      // 6. Calculer le total des réductions et commissions
      let totalDiscount = 0;
      let totalCommission = 0;

      cartItems.forEach((item, index) => {
        const applicableProduct = applicableProducts[index];
        if (applicableProduct.canApplyDiscount) {
          const itemTotal = item.price * item.quantity;
          const discount = itemTotal * (applicableProduct.discountPercentage / 100);
          const commission = itemTotal * (applicableProduct.commissionRate / 100);
          
          totalDiscount += discount;
          totalCommission += commission;
        }
      });

      // 7. Vérifier si au moins un produit peut bénéficier de la réduction
      const hasApplicableProducts = applicableProducts.some(p => p.canApplyDiscount);

      if (!hasApplicableProducts) {
        return {
          valid: false,
          message: 'Aucun produit du panier ne peut bénéficier de ce code',
          applicableProducts,
          totalDiscount: 0,
          totalCommission: 0,
        };
      }

      console.log('✅ Code valide');
      console.log('💰 Réduction totale:', totalDiscount, 'USD');
      console.log('💵 Commission totale:', totalCommission, 'USD');

      return {
        valid: true,
        message: 'Code valide',
        code,
        applicableProducts,
        totalDiscount,
        totalCommission,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la validation du code:', error);
      return {
        valid: false,
        message: 'Erreur lors de la validation',
        applicableProducts: [],
        totalDiscount: 0,
        totalCommission: 0,
      };
    }
  }

  /**
   * Récupère les produits par leurs IDs
   */
  private static async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const products: Product[] = [];

    for (const productId of productIds) {
      try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
          products.push({ id: productDoc.id, ...productDoc.data() } as Product);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération du produit ${productId}:`, error);
      }
    }

    return products;
  }

  /**
   * Calcule les détails de la commande avec code marketing
   */
  static calculateOrderDetails(
    cartItems: { productId: string; name: string; image: string; quantity: number; price: number }[],
    validation: MarketingCodeValidation
  ): {
    products: OrderProduct[];
    subtotal: number;
    discountAmount: number;
    marketingCommission: number;
    total: number;
  } {
    const products: OrderProduct[] = cartItems.map((item, index) => {
      const applicableProduct = validation.applicableProducts[index];
      
      if (applicableProduct && applicableProduct.canApplyDiscount) {
        const discountPercentage = applicableProduct.discountPercentage;
        const finalPrice = item.price * (1 - discountPercentage / 100);
        
        return {
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          discountApplied: true,
          discountPercentage,
          finalPrice,
        };
      } else {
        return {
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          discountApplied: false,
          discountPercentage: 0,
          finalPrice: item.price,
        };
      }
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = validation.totalDiscount;
    const marketingCommission = validation.totalCommission;
    const total = subtotal - discountAmount;

    return {
      products,
      subtotal,
      discountAmount,
      marketingCommission,
      total,
    };
  }

  /**
   * Incrémente les statistiques d'un code marketing après utilisation
   */
  static async incrementCodeUsage(codeId: string, earnings: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'marketingCodes', codeId), {
        usageCount: increment(1),
        totalEarnings: increment(earnings),
      });
      console.log('✅ Statistiques du code mises à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des statistiques:', error);
    }
  }

  /**
   * Récupère un code marketing par son nom
   */
  static async getCodeByName(codeString: string): Promise<MarketingCode | null> {
    try {
      const codeQuery = query(
        collection(db, 'marketingCodes'),
        where('code', '==', codeString.toUpperCase())
      );
      const codeSnapshot = await getDocs(codeQuery);

      if (codeSnapshot.empty) {
        return null;
      }

      const codeDoc = codeSnapshot.docs[0];
      return { id: codeDoc.id, ...codeDoc.data() } as MarketingCode;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du code:', error);
      return null;
    }
  }
}
