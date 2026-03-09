'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📧 Étape 1: Recherche de l\'utilisateur avec email:', email);
      
      // Étape 1 : Chercher l'utilisateur par email
      const searchResponse = await fetch(`/api/auth/find-user?email=${encodeURIComponent(email)}`);
      const searchData = await searchResponse.json();
      
      console.log('📨 Réponse find-user:', searchData);

      if (!searchResponse.ok || !searchData.userId) {
        toast.error('Aucun compte trouvé avec cet email');
        setLoading(false);
        return;
      }

      console.log('✅ Utilisateur trouvé, userId:', searchData.userId);
      console.log('📧 Étape 2: Envoi du code de vérification');

      // Étape 2 : Envoyer le code de vérification
      const response = await fetch('/api/verification/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: searchData.userId,
          email: email,
          displayName: searchData.displayName || 'Utilisateur'
        }),
      });

      const data = await response.json();
      console.log('📨 Réponse send-code:', data);

      if (response.ok) {
        setUserId(searchData.userId);
        setStep('code');
        toast.success('Code de vérification envoyé !');
        
        // En développement, afficher le code dans la console
        if (process.env.NODE_ENV === 'development' && data.code) {
          console.log('🔑 CODE DE VÉRIFICATION (DEV):', data.code);
          console.log('📧 Configuration email:', data.debug);
          toast.success(`Code (DEV): ${data.code}`, { duration: 10000 });
        }
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('Veuillez entrer le code complet');
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 Vérification du code:', verificationCode);
      console.log('   - userId:', userId);
      
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          code: verificationCode,
          type: 'password_reset'
        }),
      });

      const data = await response.json();
      console.log('📨 Réponse verify-code:', data);

      if (response.ok) {
        setStep('password');
        toast.success('Code vérifié !');
      } else {
        toast.error(data.error || 'Code invalide');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de vérification');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const verificationCode = code.join('');
      
      console.log('🔐 Tentative de réinitialisation du mot de passe');
      console.log('   - userId:', userId);
      console.log('   - code:', verificationCode);
      console.log('   - Type de userId:', typeof userId);
      console.log('   - Longueur userId:', userId.length);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          code: verificationCode,
          newPassword
        }),
      });

      const data = await response.json();
      console.log('📨 Réponse reset-password:', data);

      if (response.ok) {
        toast.success('Mot de passe réinitialisé avec succès !');
        router.push('/login');
      } else {
        console.error('❌ Erreur API:', data);
        toast.error(data.error || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Email
  if (step === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h2>
              <p className="text-gray-600">
                Entrez votre email pour recevoir un code de vérification
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  'Envoyer le code'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft size={16} />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Code verification
  if (step === 'code') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Vérification</h2>
              <p className="text-gray-600">
                Entrez le code à 6 chiffres envoyé à <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                userId: {userId}
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  'Vérifier le code'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: New password
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h2>
            <p className="text-gray-600">
              Choisissez un nouveau mot de passe sécurisé
            </p>
            <p className="text-sm text-gray-500 mt-2">
              userId: {userId}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                  placeholder="Minimum 6 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                  placeholder="Confirmez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {tCommon('loading')}
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
