'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  sendPhoneVerificationCode, 
  verifyPhoneCode,
  resendPhoneVerificationCode 
} from '@/lib/firebase/verification';

export default function VerifyPhonePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+237'); // Cameroun par défaut
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  // Codes pays africains
  const countryCodes = [
    { code: '+237', country: 'Cameroun', flag: '🇨🇲' },
    { code: '+225', country: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: '+221', country: 'Sénégal', flag: '🇸🇳' },
    { code: '+226', country: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+223', country: 'Mali', flag: '🇲🇱' },
    { code: '+227', country: 'Niger', flag: '🇳🇪' },
    { code: '+228', country: 'Togo', flag: '🇹🇬' },
    { code: '+229', country: 'Bénin', flag: '🇧🇯' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+243', country: 'RD Congo', flag: '🇨🇩' },
    { code: '+242', country: 'Congo', flag: '🇨🇬' },
    { code: '+241', country: 'Gabon', flag: '🇬🇦' },
    { code: '+236', country: 'Centrafrique', flag: '🇨🇫' },
    { code: '+235', country: 'Tchad', flag: '🇹🇩' },
    { code: '+240', country: 'Guinée Équatoriale', flag: '🇬🇶' },
    { code: '+220', country: 'Gambie', flag: '🇬🇲' },
    { code: '+224', country: 'Guinée', flag: '🇬🇳' },
    { code: '+245', country: 'Guinée-Bissau', flag: '🇬🇼' },
    { code: '+231', country: 'Liberia', flag: '🇱🇷' },
  ];

  // Rediriger si pas connecté ou déjà vérifié
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.phoneVerified) {
      router.push('/dashboard');
      return;
    }

    if (user.role === 'client') {
      router.push('/dashboard');
      return;
    }

    // Pré-remplir le numéro si déjà enregistré
    if (user.phoneNumber) {
      const phone = user.phoneNumber;
      // Extraire le code pays et le numéro
      const matchedCode = countryCodes.find(c => phone.startsWith(c.code));
      if (matchedCode) {
        setCountryCode(matchedCode.code);
        setPhoneNumber(phone.substring(matchedCode.code.length));
      } else {
        setPhoneNumber(phone);
      }
    }
  }, [user, router]);

  // Timer pour le renvoi du code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Initialiser reCAPTCHA
  useEffect(() => {
    if (typeof window !== 'undefined' && !recaptchaVerifier && user) {
      const initRecaptcha = async () => {
        try {
          const { RecaptchaVerifier } = await import('firebase/auth');
          const { auth } = await import('@/lib/firebase/config');
          
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('✅ reCAPTCHA résolu');
            },
            'expired-callback': () => {
              console.log('⚠️ reCAPTCHA expiré');
            }
          });
          
          await verifier.render();
          setRecaptchaVerifier(verifier);
          setRecaptchaReady(true);
          console.log('✅ reCAPTCHA initialisé');
        } catch (error) {
          console.error('❌ Erreur initialisation reCAPTCHA:', error);
          setError('Erreur d\'initialisation. Veuillez rafraîchir la page.');
        }
      };
      
      initRecaptcha();
    }
    
    // Cleanup
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [user]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Valider le numéro
      if (!phoneNumber || phoneNumber.length < 8) {
        throw new Error('Numéro de téléphone invalide');
      }

      // Vérifier que reCAPTCHA est initialisé
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA non initialisé. Veuillez rafraîchir la page.');
      }

      const fullPhoneNumber = countryCode + phoneNumber;
      console.log('📱 Envoi SMS vers:', fullPhoneNumber);

      // Envoyer le code via Firebase Auth
      const verificationId = await sendPhoneVerificationCode(
        user.id, // Utiliser user.id au lieu de user.uid
        fullPhoneNumber,
        recaptchaVerifier
      );

      setVerificationId(verificationId);
      setStep('code');
      setTimer(120); // 2 minutes
      setSuccess('Code envoyé par SMS !');
    } catch (err: any) {
      console.error('Erreur envoi code:', err);
      
      // Messages d'erreur plus clairs
      let errorMessage = err.message || 'Erreur lors de l\'envoi du code';
      
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Numéro de téléphone invalide';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMessage = 'Quota SMS dépassé. Contactez le support.';
      } else if (err.message?.includes('reCAPTCHA')) {
        errorMessage = 'Erreur de sécurité. Veuillez rafraîchir la page.';
      }
      
      setError(errorMessage);
      
      // Réinitialiser reCAPTCHA en cas d'erreur
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
          setRecaptchaVerifier(null);
        } catch (e) {
          // Ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Valider le code
      if (!code || code.length !== 6) {
        throw new Error('Code invalide (6 chiffres requis)');
      }

      // Vérifier le code
      await verifyPhoneCode(user.id, verificationId, code);

      setSuccess('✅ Téléphone vérifié avec succès !');
      
      // Rediriger selon le rôle
      setTimeout(() => {
        if (user.role === 'fournisseur' || user.role === 'marketiste') {
          router.push('/pending-approval');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      console.error('Erreur vérification code:', err);
      setError(err.message || 'Code incorrect ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!user || timer > 0) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Vérifier que reCAPTCHA est initialisé
      if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA non initialisé. Veuillez rafraîchir la page.');
      }

      const fullPhoneNumber = countryCode + phoneNumber;
      
      const verificationId = await resendPhoneVerificationCode(
        user.id,
        fullPhoneNumber,
        recaptchaVerifier
      );

      setVerificationId(verificationId);
      setTimer(120);
      setSuccess('Code renvoyé !');
    } catch (err: any) {
      console.error('Erreur renvoi code:', err);
      
      let errorMessage = err.message || 'Erreur lors du renvoi du code';
      
      if (err.message?.includes('reCAPTCHA')) {
        errorMessage = 'Erreur de sécurité. Veuillez rafraîchir la page.';
      }
      
      setError(errorMessage);
      
      // Réinitialiser reCAPTCHA en cas d'erreur
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
          setRecaptchaVerifier(null);
        } catch (e) {
          // Ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Phone className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification du téléphone
          </h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Entrez votre numéro de téléphone pour recevoir un code de vérification'
              : 'Entrez le code reçu par SMS'
            }
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Formulaire numéro de téléphone */}
        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 XX XX XX XX"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  minLength={8}
                  maxLength={15}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Format: {countryCode} {phoneNumber || '6XXXXXXXX'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber || !recaptchaReady}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : !recaptchaReady ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initialisation...
                </>
              ) : (
                'Envoyer le code'
              )}
            </button>
          </form>
        )}

        {/* Formulaire code de vérification */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                maxLength={6}
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Code envoyé au {countryCode} {phoneNumber}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Vérifier le code'
              )}
            </button>

            {/* Bouton renvoyer */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-600">
                  Renvoyer le code dans {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Renvoyer le code
                </button>
              )}
            </div>

            {/* Bouton retour */}
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
                setSuccess('');
              }}
              className="w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Modifier le numéro
            </button>
          </form>
        )}

        {/* reCAPTCHA container (invisible) */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
