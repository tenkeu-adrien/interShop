'use client';

import { useTranslations } from 'next-intl';
import { Percent, TrendingUp, DollarSign, Calculator, Award } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function CommissionsPage() {
  const t = useTranslations('marketiste');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton href="/" className="mb-6" />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-12">
            <Percent className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Structure des commissions</h1>
            <p className="text-xl text-gray-600">
              Découvrez comment vous pouvez gagner avec notre programme d'affiliation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Commission de base</h3>
              <p className="text-4xl font-bold text-green-600 mb-3">5%</p>
              <p className="text-gray-600">Sur toutes les ventes générées</p>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <TrendingUp className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Commission premium</h3>
              <p className="text-4xl font-bold text-yellow-600 mb-3">8%</p>
              <p className="text-gray-600">À partir de 50 ventes/mois</p>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
              <Award className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Commission VIP</h3>
              <p className="text-4xl font-bold text-orange-600 mb-3">10%</p>
              <p className="text-gray-600">À partir de 100 ventes/mois</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
            <div className="flex items-start gap-4">
              <Calculator className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Exemple de calcul</h3>
                <div className="space-y-2 text-blue-800">
                  <p>Vente générée : 100,000 FCFA</p>
                  <p>Commission (5%) : 5,000 FCFA</p>
                  <p className="font-bold text-lg">Vous gagnez : 5,000 FCFA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Avantages supplémentaires</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Paiements mensuels automatiques</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Suivi en temps réel de vos gains</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Bonus de performance trimestriels</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Support dédié pour les marketistes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Outils marketing gratuits</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-500 to-yellow-500 rounded-xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
            <p className="text-lg mb-6">Rejoignez notre programme d'affiliation dès aujourd'hui</p>
            <a 
              href="/register"
              className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Devenir marketiste
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
