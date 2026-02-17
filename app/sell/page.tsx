'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Shield, 
  DollarSign, 
  Headphones,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const benefits = [
  {
    icon: Globe,
    title: 'Portée mondiale',
    description: 'Accédez à des millions d\'acheteurs dans plus de 190 pays'
  },
  {
    icon: DollarSign,
    title: 'Commissions faibles',
    description: 'Gardez plus de profits avec nos frais de plateforme compétitifs'
  },
  {
    icon: Shield,
    title: 'Paiements sécurisés',
    description: 'Transactions protégées et paiements garantis'
  },
  {
    icon: Headphones,
    title: 'Support dédié',
    description: 'Équipe d\'assistance disponible 24/7 pour vous aider'
  },
  {
    icon: TrendingUp,
    title: 'Outils de croissance',
    description: 'Analytics et outils marketing pour développer votre business'
  },
  {
    icon: Users,
    title: 'Communauté active',
    description: 'Rejoignez des milliers de vendeurs qui réussissent'
  }
];

const steps = [
  {
    number: '01',
    title: 'Créez votre compte',
    description: 'Inscrivez-vous gratuitement en quelques minutes'
  },
  {
    number: '02',
    title: 'Configurez votre boutique',
    description: 'Ajoutez vos produits et personnalisez votre vitrine'
  },
  {
    number: '03',
    title: 'Commencez à vendre',
    description: 'Recevez des commandes et développez votre business'
  }
];

const stats = [
  { value: '10M+', label: 'Acheteurs actifs' },
  { value: '50K+', label: 'Vendeurs' },
  { value: '190+', label: 'Pays' },
  { value: '$2B+', label: 'Volume de ventes' }
];

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SellPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Développez votre business à l'échelle mondiale
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl mb-8 text-white/90"
            >
              Rejoignez la plus grande plateforme B2B/B2C et vendez à des millions d'acheteurs
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  Commencer gratuitement
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
              >
                En savoir plus
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={item}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi vendre avec nous ?
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont vous avez besoin pour réussir en ligne
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  variants={item}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow"
                >
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Icon className="text-orange-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Commencez à vendre en 3 étapes simples
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={item}
                className="flex gap-6 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features List Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Tout ce dont vous avez besoin
              </h2>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                'Gestion des stocks en temps réel',
                'Outils de marketing intégrés',
                'Analytics et rapports détaillés',
                'Support multi-devises',
                'Gestion des commandes simplifiée',
                'Protection contre la fraude',
                'API pour intégrations',
                'Formation et ressources gratuites'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="flex items-center gap-3 bg-white p-4 rounded-lg shadow"
                >
                  <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Prêt à commencer votre aventure ?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Rejoignez des milliers de vendeurs qui font confiance à notre plateforme
            </p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                Créer mon compte gratuitement
                <ArrowRight size={20} />
              </motion.button>
            </Link>
            <p className="mt-4 text-white/80">
              Aucune carte de crédit requise • Configuration en 5 minutes
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
