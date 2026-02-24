'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProduct } from '@/lib/firebase/products';
import { collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  MessageCircle,
  ChevronRight,
  Check,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ProductChatActions } from '@/components/products/ProductChatActions';
import { ContactButton } from '@/components/products/ContactButton';
import { BackButton } from '@/components/ui/BackButton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceTier, setSelectedPriceTier] = useState(0);
  const [fournisseur, setFournisseur] = useState<{ name: string; photo?: string } | null>(null);

  // Scroll infini pour produits similaires
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const observerTarget = useRef(null);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  useEffect(() => {
    if (product) {
      setQuantity(product.moq || 1);
      loadSimilarProducts();
    }
  }, [product]);

  // Intersection Observer pour scroll infini
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingSimilar && product) {
          loadSimilarProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingSimilar, product, lastDoc]);

  // const loadProduct = async () => {
  //   try {
  //     const data = await getProduct(params.id as string);
  //     if (data) {
  //       setProduct(data);
  //       // Quantity will be set in useEffect when product changes
  //     } else {
  //       toast.error('Produit non trouvé');
  //       router.push('/products');
  //     }

  //     const fournisseurDoc = await getDoc(doc(db, 'users', data.fournisseurId));
  //     if (fournisseurDoc.exists()) {
  //       setFournisseur({
  //         name: fournisseurDoc.data().displayName || fournisseurDoc.data().shopName,
  //         photo: fournisseurDoc.data().photoURL || fournisseurDoc.data().shopLogo,
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error loading product:', error);
  //     toast.error('Erreur lors du chargement du produit');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadProduct = async () => {
    try {
      // Charger le produit
      const productData = await getProduct(params.id as string);
      
      if (!productData) {
        toast.error('Produit non trouvé');
        router.push('/products');
        return;
      }
      
      setProduct(productData);
      console.log("productData", productData);

      // Charger les infos du fournisseur
      try {
        const fournisseurDoc = await getDoc(doc(db, 'users', productData.fournisseurId));
        if (fournisseurDoc.exists()) {
          const fournisseurData = fournisseurDoc.data();
          setFournisseur({
            name: fournisseurData.displayName || fournisseurData.shopName || 'Vendeur',
            photo: fournisseurData.photoURL || fournisseurData.shopLogo,
          });
        } else {
          // Fournisseur n'existe pas (données de test), utiliser des valeurs par défaut
          console.warn(`Fournisseur ${productData.fournisseurId} not found, using default values`);
          setFournisseur({
            name: 'Vendeur',
            photo: undefined,
          });
        }
      } catch (fournisseurError) {
        console.error('Error loading fournisseur:', fournisseurError);
        // En cas d'erreur, utiliser des valeurs par défaut
        setFournisseur({
          name: 'Vendeur',
          photo: undefined,
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Erreur lors du chargement du produit');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };
  const loadSimilarProducts = useCallback(async () => {
    if (loadingSimilar || !hasMore || !product) return;

    setLoadingSimilar(true);
    try {
      const productsRef = collection(db, 'products');
      let q = query(
        productsRef,
        where('category', '==', product.category),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(12)
      );

      if (lastDoc) {
        q = query(
          productsRef,
          where('category', '==', product.category),
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(12)
        );
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        setLoadingSimilar(false);
        return;
      }

      const newProducts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as Product)
        .filter(p => p.id !== product.id); // Exclure le produit actuel

      setSimilarProducts(prev => [...prev, ...newProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      
      if (snapshot.docs.length < 12) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  }, [loadingSimilar, hasMore, product, lastDoc]);

  const handleAddToCart = () => {
    if (!product) return;

    const currentPrice = product.prices[selectedPriceTier];
    
    addItem({
      productId: product.id!,
      name: product.name,
      image: product.images[0],
      quantity,
      price: currentPrice.price,
      fournisseurId: product.fournisseurId,
      moq: product.moq,
    });

    toast.success('Produit ajouté au panier !');
  };

  const handleAddToWishlist = () => {
    toast.success('Ajouté à la liste de souhaits !');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const currentPrice = product.prices[selectedPriceTier];
  const totalPrice = currentPrice.price * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600 mb-6"
        >
          <Link href="/" className="hover:text-green-600">
            Accueil
          </Link>
          <ChevronRight size={16} />
          <Link href="/products" className="hover:text-green-600">
            Produits
          </Link>
          <ChevronRight size={16} />
          <Link href={`/categories/${product.category}`} className="hover:text-green-600">
            {product.category}
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-900">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-24">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="relative h-96 bg-gray-100"
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Thumbnails */}
              <div className="flex gap-2 p-4 overflow-x-auto">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>

              {/* Videos if available */}
              {product.videos && product.videos.length > 0 && (
                <div className="p-4 border-t">
                  <h3 className="font-semibold mb-2">Vidéos du produit</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.videos.map((video, index) => (
                      <video
                        key={index}
                        src={video}
                        controls
                        className="w-full rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                  <span className="ml-2 text-lg font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">({product.reviewCount} avis)</span>
                <span className="text-gray-600">• {product.sales} vendus</span>
              </div>

              {/* Price */}
              <div className="border-t border-b py-4 mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <PriceDisplay 
                    priceUSD={currentPrice.price}
                    className="text-4xl font-bold text-green-600"
                  />
                  <span className="text-gray-600">/ unité</span>
                </div>
                {product.moq > 1 && (
                  <p className="text-sm text-gray-600">
                    Quantité minimum de commande: {product.moq} unités
                  </p>
                )}
              </div>

              {/* Price Tiers */}
              {product.prices.length > 1 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Prix par quantité:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.prices.map((tier, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPriceTier(index)}
                        className={`p-3 rounded-lg border-2 text-left ${
                          selectedPriceTier === index
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="text-sm text-gray-600">
                          {tier.minQuantity}
                          {tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} unités
                        </div>
                        <PriceDisplay 
                          priceUSD={tier.price}
                          className="text-lg font-bold text-green-600"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantité:</label>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                    disabled={quantity <= (product.moq || 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-green-500 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                  >
                    -
                  </motion.button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || (product.moq || 1);
                      setQuantity(Math.max(product.moq || 1, val));
                    }}
                    className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold"
                    min={product.moq || 1}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-green-500 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                  >
                    +
                  </motion.button>
                  <span className="text-sm text-gray-600">
                    {product.stock} disponibles
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Total: <PriceDisplay 
                    priceUSD={totalPrice}
                    className="font-bold text-green-600 text-lg inline"
                  />
                </div>
              </div>

              {fournisseur && (
                <>
                  <ProductChatActions
                    product={product}
                    fournisseur={fournisseur}
                    className="mb-4"
                  />
                  <ContactButton
                    type="product"
                    ownerId={product.fournisseurId}
                    ownerName={fournisseur.name}
                    ownerPhoto={fournisseur.photo}
                    ownerRole="fournisseur"
                    itemId={product.id!}
                    itemName={product.name}
                    itemImage={product.images[0]}
                    className="mb-6"
                  />
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToWishlist}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-green-500 hover:text-green-500"
                >
                  <Heart size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-green-500 hover:text-green-500"
                >
                  <Share2 size={20} />
                </motion.button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Truck className="mx-auto mb-2 text-green-500" size={24} />
                  <p className="text-xs text-gray-600">{product.deliveryTime}</p>
                </div>
                <div className="text-center">
                  <Shield className="mx-auto mb-2 text-green-500" size={24} />
                  <p className="text-xs text-gray-600">Protection acheteur</p>
                </div>
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-2 text-green-500" size={24} />
                  <p className="text-xs text-gray-600">Support 24/7</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Description du produit</h2>
          <p className="text-gray-700 whitespace-pre-line">{product.description}</p>

          {product.certifications.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Certifications:</h3>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                  >
                    <Check size={16} />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Catégorie</p>
              <p className="font-semibold">{product.category}</p>
            </div>
            {product.subcategory && (
              <div>
                <p className="text-sm text-gray-600">Sous-catégorie</p>
                <p className="font-semibold">{product.subcategory}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Pays d'origine</p>
              <p className="font-semibold">{product.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stock</p>
              <p className="font-semibold">{product.stock} unités</p>
            </div>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Similar Products with Infinite Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Produits similaires</h2>
            <Link 
              href={`/categories/${product.category}`}
              className="text-green-600 hover:text-green-700 flex items-center gap-2 font-medium"
            >
              Voir tout
              <ChevronRight size={20} />
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {similarProducts.map((similarProduct, index) => (
              <motion.div
                key={similarProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/products/${similarProduct.id}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105 block"
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={similarProduct.images[0] || '/placeholder.png'}
                      alt={similarProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {similarProduct.stock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Rupture
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 h-10">
                      {similarProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="text-yellow-400 fill-yellow-400" size={14} />
                      <span className="text-xs text-gray-600">
                        {similarProduct.rating.toFixed(1)} ({similarProduct.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <PriceDisplay 
                        priceUSD={similarProduct.prices[0].price}
                        className="text-lg font-bold text-green-600"
                      />
                      <span className="text-xs text-gray-500">
                        MOQ: {similarProduct.moq}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Loading Indicator */}
          {loadingSimilar && (
            <div className="flex justify-center items-center py-8">
              <Loader className="animate-spin text-green-600" size={32} />
            </div>
          )}

          {/* Intersection Observer Target */}
          <div ref={observerTarget} className="h-10"></div>

          {/* No More Products */}
          {!hasMore && similarProducts.length > 0 && (
            <div className="text-center py-8 text-gray-600">
              Vous avez vu tous les produits similaires
            </div>
          )}

          {/* No Similar Products */}
          {!loadingSimilar && similarProducts.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Aucun produit similaire trouvé
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
