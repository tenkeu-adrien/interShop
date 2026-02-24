'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BackButton } from '@/components/ui/BackButton';
import toast from 'react-hot-toast';

interface PricingPlan {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  period: string;
  description: string;
  features: string[];
  productQuota: number;
  popular?: boolean;
  color: string;
}

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      icon: <Shield className="text-gray-500" size={32} />,
      price: 0,
      period: 'Gratuit',
      description: 'Parfait pour commencer',
      productQuota: 5,
      color: 'gray',
      features: [
        '5 produits maximum',
        'Support par email',
        'Statistiques de base',
        'Photos limitées (3 par produit)',
        'Pas de badge vérifié'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      icon: <Zap className="text-blue-500" size={32} />,
      price: billingPeriod === 'monthly' ? 29 : 290,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Pour les petites entreprises',
      productQuota: 50,
      color: 'blue',
      features: [
        '50 produits maximum',
        'Support prioritaire',
        'Statistiques avancées',
        'Photos illimitées',
        'Badge vérifié',
        'Promotion sur la page d\'accueil'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Crown className="text-purple-500" size={32} />,
      price: billingPeriod === 'monthly' ? 79 : 790,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Pour les entreprises en croissance',
      productQuota: 200,
      popular: true,
      color: 'purple',
      features: [
        '200 produits maximum',
        'Support 24/7',
        'Statistiques complètes',
        'Photos et vidéos illimitées',
        'Badge vérifié premium',
        'Promotion prioritaire',
        'Accès API',
        'Gestionnaire de compte dédié'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: <Rocket className="text-orange-500" size={32} />,
      price: billingPeriod === 'monthly' ? 199 : 1990,
      period: billingPeriod === 'monthly' ? '/mois' : '/an',
      description: 'Pour les grandes entreprises',
      productQuota: -1,
      color: 'orange',
      features: [
        'Produits illimités',
        'Support VIP 24/7',
        'Statistiques personnalisées',
        'Tout illimité',
        'Badge vérifié enterprise',
        'Promotion maximale',
        'Accès API complet',
        'Gestionnaire de compte dédié',
        'Formation personnalisée',
        'Intégration personnalisée'
      ]
    }
  ];

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour choisir un plan');
      router.push('/login?redirect=/pricing');
      return;
    }

    if (user.role !== 'fournisseur') {
      toast.error('Seuls les fournisseurs peuvent souscrire à une licence');
      return;
    }

    if (plan.id === 'free') {
      toast('Vous utilisez déjà le plan gratuit', { icon: 'ℹ️' });
      return;
    }

    // Rediriger vers la page de paiement (à implémenter)
    toast.success(`Plan ${plan.name} sélectionné. Redirection vers le paiement...`);
    // router.push(`/checkout?plan=${plan.id}&period=${billingPeriod}`);
  };

  const getColorClasses = (color: string, variant: 'bg' | 'text' | 'border' | 'hover') => {
    const colors = {
      gray: {
        bg: 'bg-gray-500',
        text: 'text-gray-600',
        border: 'border-gray-500',
        hover: 'hover:bg-gray-600'
      },
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-500',
        hover: 'hover:bg-blue-600'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-500',
        hover: 'hover:bg-purple-600'
      },
      orange: {
        bg: 'bg-orange-500',
        text: 'text-orange-600',
        border: 'border-orange-500',
        hover: 'hover:bg-orange-600'
      }
    };
    return colors[color as keyof typeof colors][variant];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton href="/" />
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-gray-900 mb-4"
          >
            Choisissez votre plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Développez votre activité avec nos licences adaptées à vos besoins
          </motion.p>

          {/* Billing Period Toggle */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-white rounded-full p-1 shadow-md"
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annuel
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                -17%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-4 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  POPULAIRE
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className="mb-4">{plan.icon}</div>

                {/* Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                {/* Description */}
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Économisez ${Math.round(plan.price * 12 * 0.17)} par an
                    </p>
                  )}
                </div>

                {/* Product Quota */}
                <div className={`mb-6 p-3 rounded-lg bg-${plan.color}-50 border border-${plan.color}-200`}>
                  <p className={`text-sm font-semibold ${getColorClasses(plan.color, 'text')}`}>
                    {plan.productQuota === -1 ? 'Produits illimités' : `${plan.productQuota} produits`}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`flex-shrink-0 mt-0.5 ${getColorClasses(plan.color, 'text')}`} size={20} />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    getColorClasses(plan.color, 'bg')
                  } ${getColorClasses(plan.color, 'hover')}`}
                >
                  {plan.id === 'free' ? 'Plan actuel' : 'Choisir ce plan'}
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Questions fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Puis-je changer de plan ?</h3>
              <p className="text-gray-600">
                Oui, vous pouvez changer de plan à tout moment. Le changement prendra effet immédiatement.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Comment fonctionne la facturation ?</h3>
              <p className="text-gray-600">
                La facturation est automatique selon la période choisie (mensuelle ou annuelle).
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Puis-je annuler à tout moment ?</h3>
              <p className="text-gray-600">
                Oui, vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Quels moyens de paiement acceptez-vous ?</h3>
              <p className="text-gray-600">
                Nous acceptons les cartes de crédit, PayPal et les virements bancaires.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Besoin d'un plan personnalisé pour votre entreprise ?
          </p>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
            Contactez-nous
          </button>
        </motion.div>
      </div>
    </div>
  );
}
