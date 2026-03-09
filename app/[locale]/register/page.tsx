'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { registerUser } from '@/lib/firebase/auth';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'client' as UserRole,
    phoneNumber: '',
    countryCode: '+243', // RDC par défaut
  });
  const [loading, setLoading] = useState(false);

  // Codes pays populaires en Afrique
  const countryCodes = [
    { code: '+243', country: '🇨🇩 RDC', name: 'Congo (RDC)' },
    { code: '+242', country: '🇨🇬 Congo', name: 'Congo (Brazzaville)' },
    { code: '+237', country: '🇨🇲 Cameroun', name: 'Cameroun' },
    { code: '+225', country: '🇨🇮 Côte d\'Ivoire', name: 'Côte d\'Ivoire' },
    { code: '+221', country: '🇸🇳 Sénégal', name: 'Sénégal' },
    { code: '+226', country: '🇧🇫 Burkina Faso', name: 'Burkina Faso' },
    { code: '+223', country: '🇲🇱 Mali', name: 'Mali' },
    { code: '+227', country: '🇳🇪 Niger', name: 'Niger' },
    { code: '+228', country: '🇹🇬 Togo', name: 'Togo' },
    { code: '+229', country: '🇧🇯 Bénin', name: 'Bénin' },
    { code: '+233', country: '🇬🇭 Ghana', name: 'Ghana' },
    { code: '+234', country: '🇳🇬 Nigeria', name: 'Nigeria' },
    { code: '+254', country: '🇰🇪 Kenya', name: 'Kenya' },
    { code: '+255', country: '🇹🇿 Tanzanie', name: 'Tanzanie' },
    { code: '+256', country: '🇺🇬 Ouganda', name: 'Ouganda' },
    { code: '+27', country: '🇿🇦 Afrique du Sud', name: 'Afrique du Sud' },
    { code: '+212', country: '🇲🇦 Maroc', name: 'Maroc' },
    { code: '+213', country: '🇩🇿 Algérie', name: 'Algérie' },
    { code: '+216', country: '🇹🇳 Tunisie', name: 'Tunisie' },
    { code: '+20', country: '🇪🇬 Égypte', name: 'Égypte' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!formData.displayName.trim()) {
      toast.error('Veuillez entrer votre nom complet');
      return;
    }

    setLoading(true);

    try {
      const user = await registerUser(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role
      );
      setUser(user);
      toast.success('Inscription réussie ! Vérifiez votre email.');
      
      // Rediriger vers la page de vérification email
      router.push('/verify-email');
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      // Messages d'erreur plus clairs
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Cet email est déjà utilisé');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Format d\'email invalide');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Mot de passe trop faible (minimum 6 caractères)');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('L\'inscription par email/mot de passe n\'est pas activée');
      } else {
        toast.error(error.message || 'Erreur d\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo InterAppShop */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="InterAppshop"
                className="object-contain mx-auto"
                width={200}
                height={60}
                priority={true}
              />
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">Inscription</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de compte
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="client">Client (Acheteur)</option>
                <option value="fournisseur">Fournisseur (Vendeur)</option>
                <option value="marketiste">Marketiste (Affilié)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-32 px-1 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.country} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="812345678"
                  required
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: {formData.countryCode}{formData.phoneNumber || 'XXXXXXXXX'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-orange-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
