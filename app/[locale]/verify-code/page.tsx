'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userId = searchParams.get('userId') || user?.uid;
  const email = searchParams.get('email') || user?.email;

  useEffect(() => {
    if (!userId || !email) {
      toast.error('Session invalide');
      router.push('/register');
    }
  }, [userId, email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Seulement des chiffres

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('');
    
    while (newCode.length < 6) {
      newCode.push('');
    }
    
    setCode(newCode);
    
    // Focus sur le dernier champ rempli
    const lastFilledIndex = pastedData.length - 1;
    if (lastFilledIndex >= 0 && lastFilledIndex < 6) {
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      toast.error('Veuillez entrer le code complet');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/verification/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: fullCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de vérification');
      }

      toast.success('Email vérifié avec succès !');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);

    try {
      const response = await fetch('/api/verification/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          email,
          displayName: user?.displayName 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'envoi');
      }

      toast.success('Code renvoyé avec succès !');
      setCountdown(60); // 60 secondes avant de pouvoir renvoyer
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      // En dev, afficher le code
      if (data.code) {
        console.log('🔑 Code de vérification:', data.code);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Vérifiez votre email
            </h2>
            <p className="text-gray-600">
              Nous avons envoyé un code à 6 chiffres à
            </p>
            <p className="text-orange-600 font-semibold mt-1">
              {email}
            </p>
          </div>

          {/* Code Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Entrez le code de vérification
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || code.join('').length !== 6}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-orange-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                'Envoi en cours...'
              ) : countdown > 0 ? (
                `Renvoyer dans ${countdown}s`
              ) : (
                'Renvoyer le code'
              )}
            </button>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} />
              Retour à l'inscription
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Astuce :</strong> Vérifiez votre dossier spam si vous ne voyez pas l'email.
            Le code expire dans 4 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
